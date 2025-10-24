const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTTSCounts() {
  try {
    console.log('📊 檢查 TTS 資料庫中的單字數量...\n');

    // 統計各等級的 TTS 數量
    const elementary = await prisma.tTSCache.count({
      where: { geptLevel: 'ELEMENTARY' }
    });

    const intermediate = await prisma.tTSCache.count({
      where: { geptLevel: 'INTERMEDIATE' }
    });

    const highIntermediate = await prisma.tTSCache.count({
      where: { geptLevel: 'HIGH_INTERMEDIATE' }
    });

    const kids = await prisma.tTSCache.count({
      where: { geptLevel: 'KIDS' }
    });

    const total = await prisma.tTSCache.count();

    console.log('🎯 TTS 資料庫統計:');
    console.log(`  - KIDS: ${kids}`);
    console.log(`  - ELEMENTARY: ${elementary}`);
    console.log(`  - INTERMEDIATE: ${intermediate}`);
    console.log(`  - HIGH_INTERMEDIATE: ${highIntermediate}`);
    console.log(`  - 總計: ${total}\n`);

    // 獲取一些樣本數據
    console.log('📝 初級樣本 (前 10 個):');
    const elementarySamples = await prisma.tTSCache.findMany({
      where: { geptLevel: 'ELEMENTARY' },
      select: { text: true },
      take: 10
    });
    elementarySamples.forEach((sample, i) => {
      console.log(`  ${i + 1}. ${sample.text}`);
    });

    console.log('\n📝 中級樣本 (前 10 個):');
    const intermediateSamples = await prisma.tTSCache.findMany({
      where: { geptLevel: 'INTERMEDIATE' },
      select: { text: true },
      take: 10
    });
    intermediateSamples.forEach((sample, i) => {
      console.log(`  ${i + 1}. ${sample.text}`);
    });

    console.log('\n📝 高級樣本 (前 10 個):');
    const highIntermediateSamples = await prisma.tTSCache.findMany({
      where: { geptLevel: 'HIGH_INTERMEDIATE' },
      select: { text: true },
      take: 10
    });
    highIntermediateSamples.forEach((sample, i) => {
      console.log(`  ${i + 1}. ${sample.text}`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTTSCounts();

