const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 檢查活動詞彙數據\n');
  
  const activityId = 'cmh93tjuh0001l404hszkdf94';
  
  try {
    // 查詢活動及其詞彙項目
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        vocabularyItems: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!activity) {
      console.log(`❌ 活動不存在: ${activityId}`);
      return;
    }

    console.log('✅ 活動信息:');
    console.log(`   ID: ${activity.id}`);
    console.log(`   標題: ${activity.title}`);
    console.log(`   創建者: ${activity.user.name} (${activity.user.email})`);
    console.log(`   isPublic: ${activity.isPublic}`);
    console.log(`   isPublicShared: ${activity.isPublicShared}`);

    console.log(`\n📝 詞彙項目: ${activity.vocabularyItems.length} 個\n`);

    if (activity.vocabularyItems.length === 0) {
      console.log('❌ 沒有詞彙項目');
      
      // 檢查是否有 elements 或 content 字段
      console.log('\n🔍 檢查其他數據源:');
      console.log(`   elements: ${activity.elements ? '✅ 有' : '❌ 無'}`);
      console.log(`   content: ${activity.content ? '✅ 有' : '❌ 無'}`);
      
      if (activity.elements) {
        console.log(`   elements 類型: ${typeof activity.elements}`);
        console.log(`   elements 內容: ${JSON.stringify(activity.elements).substring(0, 200)}`);
      }
      
      if (activity.content) {
        console.log(`   content 類型: ${typeof activity.content}`);
        console.log(`   content 內容: ${JSON.stringify(activity.content).substring(0, 200)}`);
      }
    } else {
      // 顯示前 3 個詞彙項目
      activity.vocabularyItems.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.english} / ${item.chinese}`);
        console.log(`   imageUrl: ${item.imageUrl ? '✅' : '❌'}`);
        console.log(`   audioUrl: ${item.audioUrl ? '✅' : '❌'}`);
      });

      // 統計
      const withEnglish = activity.vocabularyItems.filter(item => item.english && item.english.trim()).length;
      const withAudio = activity.vocabularyItems.filter(item => item.audioUrl).length;
      const withImage = activity.vocabularyItems.filter(item => item.imageUrl).length;

      console.log(`\n📊 統計:`);
      console.log(`   有 English: ${withEnglish}/${activity.vocabularyItems.length}`);
      console.log(`   有 AudioUrl: ${withAudio}/${activity.vocabularyItems.length}`);
      console.log(`   有 ImageUrl: ${withImage}/${activity.vocabularyItems.length}`);
    }

  } catch (error) {
    console.error('❌ 查詢失敗:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

