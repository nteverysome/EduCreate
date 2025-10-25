const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeGroupingData() {
  try {
    console.log('📊 分析詞彙分組數據...\n');

    const totalCount = await prisma.vocabularyItem.count();
    console.log(`✅ 總單字數: ${totalCount}\n`);

    // 1. GEPT Level 分布
    const geptStats = await prisma.vocabularyItem.groupBy({
      by: ['geptLevel'],
      _count: true
    });
    console.log('📚 GEPT Level 分布:');
    geptStats.forEach(stat => {
      console.log(`  ${stat.geptLevel || 'NULL'}: ${stat._count}`);
    });

    // 2. 詞性分布
    const posStats = await prisma.vocabularyItem.groupBy({
      by: ['partOfSpeech'],
      _count: true
    });
    console.log('\n📖 詞性分布:');
    posStats.forEach(stat => {
      console.log(`  ${stat.partOfSpeech || 'NULL'}: ${stat._count}`);
    });

    // 3. 音節分布
    const syllableStats = await prisma.vocabularyItem.groupBy({
      by: ['syllableCount'],
      _count: true
    });
    console.log('\n🎵 音節分布:');
    syllableStats.sort((a, b) => (a.syllableCount || 0) - (b.syllableCount || 0)).forEach(stat => {
      console.log(`  ${stat.syllableCount || 'NULL'} 音節: ${stat._count}`);
    });

    // 4. 情感色彩分布
    const emotionalStats = await prisma.vocabularyItem.groupBy({
      by: ['emotionalTone'],
      _count: true
    });
    console.log('\n😊 情感色彩分布:');
    emotionalStats.forEach(stat => {
      console.log(`  ${stat.emotionalTone || 'NULL'}: ${stat._count}`);
    });

    // 5. 動作類型分布
    const actionStats = await prisma.vocabularyItem.groupBy({
      by: ['actionType'],
      _count: true
    });
    console.log('\n🏃 動作類型分布:');
    actionStats.forEach(stat => {
      console.log(`  ${stat.actionType || 'NULL'}: ${stat._count}`);
    });

    // 6. 視覺特徵分布
    const visualStats = await prisma.vocabularyItem.groupBy({
      by: ['visualFeature'],
      _count: true
    });
    console.log('\n🎨 視覺特徵分布:');
    visualStats.forEach(stat => {
      console.log(`  ${stat.visualFeature || 'NULL'}: ${stat._count}`);
    });

    // 7. 時間類別分布
    const temporalStats = await prisma.vocabularyItem.groupBy({
      by: ['temporalCategory'],
      _count: true
    });
    console.log('\n⏰ 時間類別分布:');
    temporalStats.forEach(stat => {
      console.log(`  ${stat.temporalCategory || 'NULL'}: ${stat._count}`);
    });

    // 8. 情境分布
    const contextStats = await prisma.vocabularyItem.groupBy({
      by: ['context'],
      _count: true
    });
    console.log('\n🎬 情境分布:');
    contextStats.forEach(stat => {
      console.log(`  ${stat.context || 'NULL'}: ${stat._count}`);
    });

    // 9. 查看一些範例單字
    console.log('\n📝 範例單字 (詞性分組):');
    const nounSamples = await prisma.vocabularyItem.findMany({
      where: { partOfSpeech: 'NOUN' },
      take: 5,
      select: { english: true, chinese: true, syllableCount: true, emotionalTone: true }
    });
    console.log('  名詞:');
    nounSamples.forEach(word => {
      console.log(`    ${word.english} (${word.chinese}) - ${word.syllableCount} 音節 - ${word.emotionalTone}`);
    });

    const verbSamples = await prisma.vocabularyItem.findMany({
      where: { partOfSpeech: 'VERB' },
      take: 5,
      select: { english: true, chinese: true, syllableCount: true, actionType: true }
    });
    console.log('\n  動詞:');
    verbSamples.forEach(word => {
      console.log(`    ${word.english} (${word.chinese}) - ${word.syllableCount} 音節 - ${word.actionType || 'N/A'}`);
    });

    const adjSamples = await prisma.vocabularyItem.findMany({
      where: { partOfSpeech: 'ADJECTIVE' },
      take: 5,
      select: { english: true, chinese: true, syllableCount: true, emotionalTone: true, visualFeature: true }
    });
    console.log('\n  形容詞:');
    adjSamples.forEach(word => {
      console.log(`    ${word.english} (${word.chinese}) - ${word.syllableCount} 音節 - ${word.emotionalTone} - ${word.visualFeature || 'N/A'}`);
    });

    // 10. 情境範例
    console.log('\n📝 範例單字 (情境分組):');
    const contexts = ['restaurant', 'hospital', 'airport', 'shopping', 'school', 'office', 'home', 'travel'];
    for (const ctx of contexts) {
      const contextSamples = await prisma.vocabularyItem.findMany({
        where: { context: ctx },
        take: 3,
        select: { english: true, chinese: true }
      });
      if (contextSamples.length > 0) {
        console.log(`  ${ctx}:`);
        contextSamples.forEach(word => {
          console.log(`    ${word.english} (${word.chinese})`);
        });
      }
    }

    // 11. 情感範例
    console.log('\n📝 範例單字 (情感分組):');
    const emotions = ['positive', 'negative', 'neutral'];
    for (const emotion of emotions) {
      const emotionSamples = await prisma.vocabularyItem.findMany({
        where: { emotionalTone: emotion },
        take: 5,
        select: { english: true, chinese: true }
      });
      if (emotionSamples.length > 0) {
        console.log(`  ${emotion}:`);
        emotionSamples.forEach(word => {
          console.log(`    ${word.english} (${word.chinese})`);
        });
      }
    }

    // 12. 時間範例
    console.log('\n📝 範例單字 (時間分組):');
    const temporals = ['time_point', 'season', 'month', 'duration'];
    for (const temporal of temporals) {
      const temporalSamples = await prisma.vocabularyItem.findMany({
        where: { temporalCategory: temporal },
        take: 3,
        select: { english: true, chinese: true }
      });
      if (temporalSamples.length > 0) {
        console.log(`  ${temporal}:`);
        temporalSamples.forEach(word => {
          console.log(`    ${word.english} (${word.chinese})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeGroupingData();

