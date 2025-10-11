// Phase 3: 數據遷移腳本
// 將 VocabularySet 數據合併到 Activity 表，更新 VocabularyItem 關聯

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 開始執行數據遷移...');
  
  try {
    // 1. 分析當前數據狀況
    console.log('📊 分析當前數據狀況...');
    
    const activityCount = await prisma.activity.count();
    const vocabularySetCount = await prisma.vocabularySet.count();
    const vocabularyItemCount = await prisma.vocabularyItem.count();
    
    console.log(`- Activity 記錄數: ${activityCount}`);
    console.log(`- VocabularySet 記錄數: ${vocabularySetCount}`);
    console.log(`- VocabularyItem 記錄數: ${vocabularyItemCount}`);
    
    // 2. 查找需要遷移的 Activity 記錄
    console.log('🔍 查找需要遷移的 Activity 記錄...');
    
    const activitiesWithVocabulary = await prisma.activity.findMany({
      where: {
        content: {
          path: ['vocabularySetId'],
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        content: true
      }
    });
    
    console.log(`- 找到 ${activitiesWithVocabulary.length} 個需要遷移的 Activity`);
    
    // 3. 執行遷移事務
    console.log('🔄 執行數據遷移事務...');
    
    const result = await prisma.$transaction(async (tx) => {
      let migratedActivities = 0;
      let migratedVocabularyItems = 0;
      
      // 遷移每個 Activity
      for (const activity of activitiesWithVocabulary) {
        const vocabularySetId = activity.content?.vocabularySetId;
        
        if (vocabularySetId) {
          // 查找對應的 VocabularySet
          const vocabularySet = await tx.vocabularySet.findUnique({
            where: { id: vocabularySetId },
            include: { items: true }
          });
          
          if (vocabularySet) {
            // 更新 Activity，合併 VocabularySet 數據
            await tx.activity.update({
              where: { id: activity.id },
              data: {
                geptLevel: vocabularySet.geptLevel,
                totalWords: vocabularySet.totalWords
              }
            });
            
            // 更新 VocabularyItem，建立與 Activity 的直接關聯
            await tx.vocabularyItem.updateMany({
              where: { setId: vocabularySetId },
              data: { activityId: activity.id }
            });
            
            migratedActivities++;
            migratedVocabularyItems += vocabularySet.items.length;
            
            console.log(`✅ 遷移完成: ${activity.title} (${vocabularySet.items.length} 個詞彙)`);
          }
        }
      }
      
      return { migratedActivities, migratedVocabularyItems };
    });
    
    console.log('🎉 數據遷移完成！');
    console.log(`- 遷移的 Activity: ${result.migratedActivities}`);
    console.log(`- 遷移的 VocabularyItem: ${result.migratedVocabularyItems}`);
    
    // 4. 驗證遷移結果
    console.log('🔍 驗證遷移結果...');
    
    const activitiesWithGeptLevel = await prisma.activity.count({
      where: { geptLevel: { not: null } }
    });
    
    const vocabularyItemsWithActivityId = await prisma.vocabularyItem.count({
      where: { activityId: { not: null } }
    });
    
    console.log(`- Activity 有 geptLevel: ${activitiesWithGeptLevel}`);
    console.log(`- VocabularyItem 有 activityId: ${vocabularyItemsWithActivityId}`);
    
    // 5. 檢查數據一致性
    console.log('🔍 檢查數據一致性...');
    
    const inconsistentActivities = await prisma.activity.findMany({
      where: {
        AND: [
          { geptLevel: { not: null } },
          { totalWords: { gt: 0 } }
        ]
      },
      include: {
        vocabularyItems: true
      }
    });
    
    const inconsistencies = inconsistentActivities.filter(
      activity => activity.vocabularyItems.length !== activity.totalWords
    );
    
    if (inconsistencies.length > 0) {
      console.log(`⚠️ 發現 ${inconsistencies.length} 個數據不一致的 Activity:`);
      inconsistencies.forEach(activity => {
        console.log(`- ${activity.title}: totalWords=${activity.totalWords}, actual=${activity.vocabularyItems.length}`);
      });
    } else {
      console.log('✅ 數據一致性檢查通過');
    }
    
    console.log('✅ Phase 3 數據遷移完成！');
    
  } catch (error) {
    console.error('❌ 數據遷移失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行遷移
migrateData()
  .then(() => {
    console.log('🎉 所有遷移操作完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 遷移失敗:', error);
    process.exit(1);
  });
