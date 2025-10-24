/**
 * 檢查當前用戶的學習進度
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentUserProgress() {
  try {
    console.log('=== 檢查所有用戶的學習進度 ===\n');

    // 1. 獲取所有用戶
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log(`總用戶數: ${users.length}\n`);

    // 2. 檢查每個用戶的學習進度
    for (const user of users) {
      const progressCount = await prisma.userWordProgress.count({
        where: { userId: user.id }
      });

      console.log(`用戶: ${user.email || user.name || user.id}`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - 學習進度記錄: ${progressCount} 個`);

      if (progressCount > 0) {
        // 獲取前 3 個進度記錄
        const progress = await prisma.userWordProgress.findMany({
          where: { userId: user.id },
          include: { word: true },
          take: 3
        });

        console.log(`  - 前 3 個單字:`);
        progress.forEach((p, i) => {
          console.log(`    ${i + 1}. ${p.word?.english || '(無單字)'} - wordId: ${p.wordId}`);
        });
      }
      console.log('');
    }

    // 3. 檢查 VocabularyItem 總數
    const vocabCount = await prisma.vocabularyItem.count();
    console.log(`\n總 VocabularyItem 數: ${vocabCount}`);

    // 4. 檢查 TTSCache 總數
    const ttsCacheCount = await prisma.tTSCache.count();
    console.log(`總 TTSCache 數: ${ttsCacheCount}`);

    // 5. 按 GEPT 等級統計 TTSCache
    const geptLevels = ['KIDS', 'ELEMENTARY', 'INTERMEDIATE', 'HIGH_INTERMEDIATE'];
    console.log('\nTTSCache 按 GEPT 等級統計:');
    for (const level of geptLevels) {
      const count = await prisma.tTSCache.count({
        where: { geptLevel: level }
      });
      console.log(`  - ${level}: ${count}`);
    }

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUserProgress();

