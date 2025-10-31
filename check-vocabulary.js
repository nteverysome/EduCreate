const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const items = await prisma.vocabularyItem.findMany({
      where: {
        activityId: 'cmh93tjuh0001l404hszkdf94'
      },
      select: {
        id: true,
        english: true,
        chinese: true,
        audioUrl: true,
        imageUrl: true
      },
      take: 5
    });

    console.log('=== Vocabulary Items ===');
    console.log(JSON.stringify(items, null, 2));
    
    // 檢查是否有 audioUrl
    const withAudio = items.filter(item => item.audioUrl);
    const withoutAudio = items.filter(item => !item.audioUrl);
    
    console.log(`\n✅ 有音頻: ${withAudio.length}`);
    console.log(`❌ 沒有音頻: ${withoutAudio.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

