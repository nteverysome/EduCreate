const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNewWordsCount() {
  try {
    // 1. 檢查初級 TTS 單字總數
    const elementaryCount = await prisma.tTSCache.count({
      where: {
        geptLevel: 'ELEMENTARY'
      }
    });
    console.log('📊 初級 TTS 單字總數:', elementaryCount);

    // 2. 檢查用戶已學習的單字數
    const userId = 'cmgt4vj1y0000jr0434tf8ipd';
    const learnedCount = await prisma.userWordProgress.count({
      where: {
        userId
      }
    });
    console.log('📚 用戶已學習單字數:', learnedCount);

    // 3. 計算新單字數
    const newWordsCount = elementaryCount - learnedCount;
    console.log('🆕 新單字數:', newWordsCount);

    // 4. 檢查用戶學習的單字詳情
    const learnedWords = await prisma.userWordProgress.findMany({
      where: {
        userId
      },
      include: {
        word: {
          select: {
            english: true,
            chinese: true
          }
        }
      }
    });

    console.log('\n📝 已學習的單字:');
    learnedWords.forEach((progress, index) => {
      console.log(`  ${index + 1}. ${progress.word.english} (${progress.word.chinese}) - 記憶強度: ${progress.memoryStrength}%`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewWordsCount();

