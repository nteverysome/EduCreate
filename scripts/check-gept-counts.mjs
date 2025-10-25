import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGeptCounts() {
  try {
    console.log('=== GEPT 等級單字數量統計 ===\n');
    
    // 按 GEPT 等級分組統計
    const geptCounts = await prisma.vocabularyItem.groupBy({
      by: ['geptLevel'],
      _count: true
    });
    
    console.log('各等級單字數量：');
    geptCounts.forEach(item => {
      console.log(`  ${item.geptLevel}: ${item._count} 個單字`);
    });
    
    // 總計
    const total = await prisma.vocabularyItem.count();
    console.log(`\n總計: ${total} 個單字`);
    
    // 詳細統計每個等級
    console.log('\n=== 詳細統計 ===\n');
    
    for (const level of ['ELEMENTARY', 'INTERMEDIATE', 'HIGH_INTERMEDIATE']) {
      const count = await prisma.vocabularyItem.count({
        where: { geptLevel: level }
      });
      
      const withPartOfSpeech = await prisma.vocabularyItem.count({
        where: { 
          geptLevel: level,
          partOfSpeech: { not: null }
        }
      });
      
      const withPrefix = await prisma.vocabularyItem.count({
        where: { 
          geptLevel: level,
          prefix: { not: null }
        }
      });
      
      const withTheme = await prisma.vocabularyItem.count({
        where: { 
          geptLevel: level,
          theme: { not: null }
        }
      });
      
      console.log(`${level}:`);
      console.log(`  總單字數: ${count}`);
      console.log(`  有詞性: ${withPartOfSpeech} (${(withPartOfSpeech/count*100).toFixed(1)}%)`);
      console.log(`  有字首: ${withPrefix} (${(withPrefix/count*100).toFixed(1)}%)`);
      console.log(`  有主題: ${withTheme} (${(withTheme/count*100).toFixed(1)}%)`);
      console.log('');
    }
    
  } catch (error) {
    console.error('查詢失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeptCounts();

