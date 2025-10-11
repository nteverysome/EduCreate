// 清理舊架構結構腳本
// 移除 Activity.content 中的 vocabularySetId 引用

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOldStructure() {
  console.log('🧹 開始清理舊架構結構...');
  
  try {
    // 1. 查找使用舊結構的活動
    console.log('🔍 查找使用舊結構的活動...');
    
    const activitiesWithOldStructure = await prisma.activity.findMany({
      where: {
        content: {
          path: ['vocabularySetId'],
          not: null
        }
      }
    });
    
    console.log(`找到 ${activitiesWithOldStructure.length} 個使用舊結構的活動`);
    
    if (activitiesWithOldStructure.length === 0) {
      console.log('✅ 沒有需要清理的活動');
      return;
    }
    
    // 2. 清理每個活動的 content 字段
    console.log('🧹 清理活動的 content 字段...');
    
    let cleanedCount = 0;
    
    for (const activity of activitiesWithOldStructure) {
      const oldContent = activity.content;
      
      // 創建新的 content，移除 vocabularySetId
      const newContent = { ...oldContent };
      delete newContent.vocabularySetId;
      
      // 更新活動
      await prisma.activity.update({
        where: { id: activity.id },
        data: { content: newContent }
      });
      
      console.log(`✅ 清理完成: ${activity.title}`);
      console.log(`  - 舊 content: ${JSON.stringify(oldContent)}`);
      console.log(`  - 新 content: ${JSON.stringify(newContent)}`);
      
      cleanedCount++;
    }
    
    console.log(`🎉 清理完成！共清理了 ${cleanedCount} 個活動`);
    
    // 3. 驗證清理結果
    console.log('🔍 驗證清理結果...');
    
    const remainingOldStructure = await prisma.activity.count({
      where: {
        content: {
          path: ['vocabularySetId'],
          not: null
        }
      }
    });
    
    if (remainingOldStructure === 0) {
      console.log('✅ 所有舊結構已清理完成');
    } else {
      console.log(`❌ 仍有 ${remainingOldStructure} 個活動使用舊結構`);
    }
    
    // 4. 檢查是否可以安全刪除 VocabularySet 表
    console.log('🔍 檢查 VocabularySet 表使用情況...');
    
    const vocabularySetCount = await prisma.vocabularySet.count();
    console.log(`VocabularySet 表中有 ${vocabularySetCount} 條記錄`);
    
    // 檢查是否有其他地方還在使用 VocabularySet
    const vocabularyItemsWithSetId = await prisma.vocabularyItem.count({
      where: { setId: { not: null } }
    });
    
    console.log(`VocabularyItem 中有 ${vocabularyItemsWithSetId} 條記錄仍使用 setId`);
    
    if (vocabularySetCount > 0 || vocabularyItemsWithSetId > 0) {
      console.log('⚠️ VocabularySet 表仍在使用中，暫不刪除');
      console.log('建議：等待所有數據完全遷移後再考慮刪除 VocabularySet 表');
    } else {
      console.log('✅ VocabularySet 表可以安全刪除');
    }
    
    console.log('✅ 舊架構清理完成！');
    
  } catch (error) {
    console.error('❌ 清理失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行清理
cleanupOldStructure()
  .then(() => {
    console.log('🎉 舊架構清理完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 清理失敗:', error);
    process.exit(1);
  });
