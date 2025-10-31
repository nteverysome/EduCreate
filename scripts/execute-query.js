const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 查詢活動詞彙數據\n');
  
  const activityId = 'cmh93tjuh0001l404hszkdf94';
  
  try {
    // 1. 查詢活動
    console.log('1️⃣ 查詢活動信息...\n');
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        title: true,
        isPublic: true,
        isPublicShared: true,
        createdAt: true,
        _count: {
          select: {
            vocabularyItems: true
          }
        }
      }
    });

    if (!activity) {
      console.log(`❌ 活動不存在: ${activityId}\n`);
      return;
    }

    console.log('✅ 活動信息:');
    console.log(`   ID: ${activity.id}`);
    console.log(`   標題: ${activity.title}`);
    console.log(`   isPublic: ${activity.isPublic}`);
    console.log(`   isPublicShared: ${activity.isPublicShared}`);
    console.log(`   詞彙項目數: ${activity._count.vocabularyItems}`);

    // 2. 查詢詞彙項目
    console.log('\n2️⃣ 查詢詞彙項目...\n');
    const vocabularyItems = await prisma.vocabularyItem.findMany({
      where: { activityId: activityId },
      select: {
        id: true,
        english: true,
        chinese: true,
        imageUrl: true,
        audioUrl: true
      },
      take: 10
    });

    if (vocabularyItems.length === 0) {
      console.log('❌ 沒有詞彙項目\n');
    } else {
      console.log(`✅ 前 ${vocabularyItems.length} 個詞彙項目:\n`);
      vocabularyItems.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   english: "${item.english}"`);
        console.log(`   chinese: "${item.chinese}"`);
        console.log(`   imageUrl: ${item.imageUrl ? '✅' : '❌'}`);
        console.log(`   audioUrl: ${item.audioUrl ? '✅' : '❌'}`);
        console.log('');
      });
    }

    // 3. 統計
    console.log('3️⃣ 統計信息...\n');
    const stats = await prisma.vocabularyItem.aggregate({
      where: { activityId: activityId },
      _count: true
    });

    const withEnglish = await prisma.vocabularyItem.count({
      where: {
        activityId: activityId,
        english: { not: '' }
      }
    });

    const withAudio = await prisma.vocabularyItem.count({
      where: {
        activityId: activityId,
        audioUrl: { not: null }
      }
    });

    const withImage = await prisma.vocabularyItem.count({
      where: {
        activityId: activityId,
        imageUrl: { not: null }
      }
    });

    console.log(`總項目數: ${stats._count}`);
    console.log(`有 English: ${withEnglish}/${stats._count}`);
    console.log(`有 AudioUrl: ${withAudio}/${stats._count}`);
    console.log(`有 ImageUrl: ${withImage}/${stats._count}`);

  } catch (error) {
    console.error('❌ 查詢失敗:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

