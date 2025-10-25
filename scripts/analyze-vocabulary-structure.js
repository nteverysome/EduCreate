const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeVocabularyStructure() {
  try {
    console.log('📊 分析詞彙數據結構...\n');

    // 1. 檢查總數
    const totalCount = await prisma.vocabularyItem.count();
    console.log(`✅ 總單字數: ${totalCount}`);

    // 2. 檢查 GEPT Level 分布
    const geptLevelStats = await prisma.vocabularyItem.groupBy({
      by: ['geptLevel'],
      _count: true
    });
    console.log('\n📚 GEPT Level 分布:');
    geptLevelStats.forEach(stat => {
      console.log(`  ${stat.geptLevel || 'NULL'}: ${stat._count}`);
    });

    // 3. 檢查詞性分布
    const partOfSpeechStats = await prisma.vocabularyItem.groupBy({
      by: ['partOfSpeech'],
      _count: true
    });
    console.log('\n📖 詞性分布:');
    partOfSpeechStats.forEach(stat => {
      console.log(`  ${stat.partOfSpeech || 'NULL'}: ${stat._count}`);
    });

    // 4. 檢查主題分布
    const themeStats = await prisma.vocabularyItem.groupBy({
      by: ['theme'],
      _count: true
    });
    console.log('\n🎯 主題分布 (前 20 個):');
    themeStats.slice(0, 20).forEach(stat => {
      console.log(`  ${stat.theme || 'NULL'}: ${stat._count}`);
    });

    // 5. 檢查頻率分布
    const frequencyStats = await prisma.vocabularyItem.groupBy({
      by: ['frequency'],
      _count: true
    });
    console.log('\n⭐ 頻率分布:');
    frequencyStats.forEach(stat => {
      console.log(`  ${stat.frequency || 'NULL'}: ${stat._count}`);
    });

    // 6. 檢查 chinese 字段中是否包含 GEPT 等級信息
    console.log('\n🔍 檢查 chinese 字段中的 GEPT 等級信息...');
    const samplesWithGEPT = await prisma.vocabularyItem.findMany({
      where: {
        chinese: {
          contains: '初級'
        }
      },
      take: 5,
      select: {
        english: true,
        chinese: true,
        geptLevel: true
      }
    });
    console.log('包含「初級」的單字:');
    samplesWithGEPT.forEach(word => {
      console.log(`  ${word.english}: ${word.chinese} (geptLevel: ${word.geptLevel || 'NULL'})`);
    });

    const samplesWithIntermediate = await prisma.vocabularyItem.findMany({
      where: {
        chinese: {
          contains: '中級'
        }
      },
      take: 5,
      select: {
        english: true,
        chinese: true,
        geptLevel: true
      }
    });
    console.log('\n包含「中級」的單字:');
    samplesWithIntermediate.forEach(word => {
      console.log(`  ${word.english}: ${word.chinese} (geptLevel: ${word.geptLevel || 'NULL'})`);
    });

    const samplesWithHighIntermediate = await prisma.vocabularyItem.findMany({
      where: {
        chinese: {
          contains: '中高級'
        }
      },
      take: 5,
      select: {
        english: true,
        chinese: true,
        geptLevel: true
      }
    });
    console.log('\n包含「中高級」的單字:');
    samplesWithHighIntermediate.forEach(word => {
      console.log(`  ${word.english}: ${word.chinese} (geptLevel: ${word.geptLevel || 'NULL'})`);
    });

    // 7. 查看一些範例單字
    console.log('\n📝 隨機範例單字 (前 10 個):');
    const samples = await prisma.vocabularyItem.findMany({
      take: 10,
      select: {
        english: true,
        chinese: true,
        partOfSpeech: true,
        theme: true,
        frequency: true,
        geptLevel: true
      }
    });
    samples.forEach(word => {
      console.log(`  ${word.english} (${word.chinese})`);
      console.log(`    詞性: ${word.partOfSpeech || 'N/A'}, 主題: ${word.theme || 'N/A'}, 頻率: ${word.frequency || 'N/A'}, GEPT: ${word.geptLevel || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeVocabularyStructure();

