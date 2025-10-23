/**
 * 驗證 TTS Cache 資料庫
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTTSCache() {
  try {
    console.log('=== 驗證 TTS Cache 資料庫 ===\n');

    // 1. 總記錄數
    const totalCount = await prisma.tTSCache.count();
    console.log(`📊 總記錄數: ${totalCount}\n`);

    // 2. 按語言統計
    const byLanguage = await prisma.tTSCache.groupBy({
      by: ['language'],
      _count: true
    });
    console.log('📊 按語言統計:');
    byLanguage.forEach(item => {
      console.log(`  - ${item.language}: ${item._count} 個`);
    });
    console.log();

    // 3. 按聲音統計
    const byVoice = await prisma.tTSCache.groupBy({
      by: ['voice'],
      _count: true
    });
    console.log('📊 按聲音統計:');
    byVoice.forEach(item => {
      console.log(`  - ${item.voice}: ${item._count} 個`);
    });
    console.log();

    // 4. 按 GEPT 級別統計
    const byLevel = await prisma.tTSCache.groupBy({
      by: ['geptLevel'],
      _count: true
    });
    console.log('📊 按 GEPT 級別統計:');
    byLevel.forEach(item => {
      console.log(`  - ${item.geptLevel}: ${item._count} 個`);
    });
    console.log();

    // 5. 顯示前 10 條記錄
    const samples = await prisma.tTSCache.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    console.log('📝 最新 10 條記錄:');
    samples.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} [${item.language}/${item.voice}]`);
      console.log(`     URL: ${item.audioUrl}`);
      console.log(`     大小: ${item.fileSize} bytes`);
      console.log();
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTTSCache();

