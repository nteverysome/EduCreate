const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzePrefixRootSuffix() {
  try {
    console.log('📊 分析字首、字根、字尾數據...\n');

    // 字首分布
    const prefixData = await prisma.vocabularyItem.groupBy({
      by: ['prefix'],
      _count: true
    });
    console.log('🔤 字首分布 (前 20 個):');
    prefixData
      .sort((a, b) => b._count - a._count)
      .slice(0, 20)
      .forEach(d => {
        console.log(`  ${d.prefix || 'NULL'}: ${d._count}`);
      });

    // 字根分布
    const rootData = await prisma.vocabularyItem.groupBy({
      by: ['root'],
      _count: true
    });
    console.log('\n🌳 字根分布 (前 20 個):');
    rootData
      .sort((a, b) => b._count - a._count)
      .slice(0, 20)
      .forEach(d => {
        console.log(`  ${d.root || 'NULL'}: ${d._count}`);
      });

    // 字尾分布
    const suffixData = await prisma.vocabularyItem.groupBy({
      by: ['suffix'],
      _count: true
    });
    console.log('\n📝 字尾分布 (前 20 個):');
    suffixData
      .sort((a, b) => b._count - a._count)
      .slice(0, 20)
      .forEach(d => {
        console.log(`  ${d.suffix || 'NULL'}: ${d._count}`);
      });

    // 範例單字
    console.log('\n📖 範例單字:');
    
    // 字首範例
    const prefixExamples = await prisma.vocabularyItem.findMany({
      where: { prefix: { not: null } },
      take: 10,
      select: { english: true, chinese: true, prefix: true }
    });
    console.log('\n  字首範例:');
    prefixExamples.forEach(word => {
      console.log(`    ${word.english} (${word.chinese}) - 字首: ${word.prefix}`);
    });

    // 字根範例
    const rootExamples = await prisma.vocabularyItem.findMany({
      where: { root: { not: null } },
      take: 10,
      select: { english: true, chinese: true, root: true }
    });
    console.log('\n  字根範例:');
    rootExamples.forEach(word => {
      console.log(`    ${word.english} (${word.chinese}) - 字根: ${word.root}`);
    });

    // 字尾範例
    const suffixExamples = await prisma.vocabularyItem.findMany({
      where: { suffix: { not: null } },
      take: 10,
      select: { english: true, chinese: true, suffix: true }
    });
    console.log('\n  字尾範例:');
    suffixExamples.forEach(word => {
      console.log(`    ${word.english} (${word.chinese}) - 字尾: ${word.suffix}`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzePrefixRootSuffix();

