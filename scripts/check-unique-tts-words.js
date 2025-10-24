const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUniqueTTSWords() {
  try {
    console.log('📊 檢查 TTS 資料庫中的唯一單字數量...\n');

    // 獲取各等級的所有單字
    const elementary = await prisma.tTSCache.findMany({
      where: { geptLevel: 'ELEMENTARY' },
      select: { text: true }
    });

    const intermediate = await prisma.tTSCache.findMany({
      where: { geptLevel: 'INTERMEDIATE' },
      select: { text: true }
    });

    const highIntermediate = await prisma.tTSCache.findMany({
      where: { geptLevel: 'HIGH_INTERMEDIATE' },
      select: { text: true }
    });

    // 計算唯一單字
    const elementaryUnique = new Set(elementary.map(w => w.text.toLowerCase()));
    const intermediateUnique = new Set(intermediate.map(w => w.text.toLowerCase()));
    const highIntermediateUnique = new Set(highIntermediate.map(w => w.text.toLowerCase()));

    console.log('🎯 TTS 資料庫統計:');
    console.log(`\n初級 (ELEMENTARY):`);
    console.log(`  - TTS 記錄總數: ${elementary.length}`);
    console.log(`  - 唯一單字數: ${elementaryUnique.size}`);
    console.log(`  - 平均每個單字的 TTS 版本: ${(elementary.length / elementaryUnique.size).toFixed(1)}`);

    console.log(`\n中級 (INTERMEDIATE):`);
    console.log(`  - TTS 記錄總數: ${intermediate.length}`);
    console.log(`  - 唯一單字數: ${intermediateUnique.size}`);
    console.log(`  - 平均每個單字的 TTS 版本: ${(intermediate.length / intermediateUnique.size).toFixed(1)}`);

    console.log(`\n高級 (HIGH_INTERMEDIATE):`);
    console.log(`  - TTS 記錄總數: ${highIntermediate.length}`);
    console.log(`  - 唯一單字數: ${highIntermediateUnique.size}`);
    console.log(`  - 平均每個單字的 TTS 版本: ${(highIntermediate.length / highIntermediateUnique.size).toFixed(1)}`);

    // 顯示一些樣本
    console.log(`\n📝 初級唯一單字樣本 (前 20 個):`);
    const elementaryArray = Array.from(elementaryUnique).sort().slice(0, 20);
    elementaryArray.forEach((word, i) => {
      console.log(`  ${i + 1}. ${word}`);
    });

    // 檢查與 PDF 的對應
    console.log(`\n📊 與 PDF 單字表對比:`);
    console.log(`  - PDF 初級單字: ~2,000`);
    console.log(`  - TTS 初級唯一單字: ${elementaryUnique.size}`);
    console.log(`  - 差異: ${elementaryUnique.size - 2000}`);

    console.log(`\n  - PDF 中級單字: ~5,000`);
    console.log(`  - TTS 中級唯一單字: ${intermediateUnique.size}`);
    console.log(`  - 差異: ${intermediateUnique.size - 5000}`);

    console.log(`\n  - PDF 高級單字: ~8,000`);
    console.log(`  - TTS 高級唯一單字: ${highIntermediateUnique.size}`);
    console.log(`  - 差異: ${highIntermediateUnique.size - 8000}`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUniqueTTSWords();

