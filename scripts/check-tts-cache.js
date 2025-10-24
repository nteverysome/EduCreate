const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTTSCache() {
  try {
    console.log('🔍 檢查 TTSCache 表數據...\n');

    // 1. 總數
    const total = await prisma.tTSCache.count();
    console.log(`📊 總數: ${total}`);

    // 2. 按 GEPT 等級統計
    const elementary = await prisma.tTSCache.count({
      where: { geptLevel: 'ELEMENTARY' }
    });
    console.log(`  - ELEMENTARY: ${elementary}`);

    const intermediate = await prisma.tTSCache.count({
      where: { geptLevel: 'INTERMEDIATE' }
    });
    console.log(`  - INTERMEDIATE: ${intermediate}`);

    const highIntermediate = await prisma.tTSCache.count({
      where: { geptLevel: 'HIGH_INTERMEDIATE' }
    });
    console.log(`  - HIGH_INTERMEDIATE: ${highIntermediate}`);

    // 3. 按語言統計
    const enUS = await prisma.tTSCache.count({
      where: { language: 'en-US' }
    });
    console.log(`\n🌐 語言統計:`);
    console.log(`  - en-US: ${enUS}`);

    const zhTW = await prisma.tTSCache.count({
      where: { language: 'zh-TW' }
    });
    console.log(`  - zh-TW: ${zhTW}`);

    // 4. 示例數據
    if (elementary > 0) {
      console.log(`\n📝 ELEMENTARY 示例 (前 5 個):`);
      const samples = await prisma.tTSCache.findMany({
        where: { geptLevel: 'ELEMENTARY' },
        take: 5,
        select: {
          text: true,
          language: true,
          audioUrl: true
        }
      });
      samples.forEach((sample, index) => {
        console.log(`  ${index + 1}. ${sample.text} (${sample.language})`);
        console.log(`     Audio: ${sample.audioUrl ? '✅' : '❌'}`);
      });
    }

    console.log('\n✅ 檢查完成');

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTTSCache();

