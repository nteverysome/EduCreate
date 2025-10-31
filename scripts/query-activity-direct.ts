import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 查詢活動詞彙數據\n');
  
  const activityId = 'cmh93tjuh0001l404hszkdf94';
  
  try {
    // 查詢活動
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        vocabularyItems: {
          select: {
            id: true,
            english: true,
            chinese: true,
            imageUrl: true,
            audioUrl: true
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
    console.log(`   vocabularyItems 數量: ${activity.vocabularyItems.length}`);

    if (activity.vocabularyItems.length > 0) {
      console.log('\n📝 前 5 個詞彙項目:');
      activity.vocabularyItems.slice(0, 5).forEach((item, index) => {
        console.log(`\n${index + 1}. ID: ${item.id}`);
        console.log(`   english: "${item.english}"`);
        console.log(`   chinese: "${item.chinese}"`);
        console.log(`   imageUrl: ${item.imageUrl ? '✅' : '❌'}`);
        console.log(`   audioUrl: ${item.audioUrl ? '✅' : '❌'}`);
      });

      // 統計
      const withEnglish = activity.vocabularyItems.filter(item => item.english && item.english.trim()).length;
      const withAudio = activity.vocabularyItems.filter(item => item.audioUrl).length;

      console.log(`\n📊 統計:`);
      console.log(`   有 English: ${withEnglish}/${activity.vocabularyItems.length}`);
      console.log(`   有 AudioUrl: ${withAudio}/${activity.vocabularyItems.length}`);
    } else {
      console.log('\n❌ 沒有詞彙項目');
    }

  } catch (error) {
    console.error('❌ 查詢失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

