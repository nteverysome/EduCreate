const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVocabularyData() {
  try {
    console.log('🔍 檢查單字數據...\n');

    // 從日誌中看到的第一個單字 ID
    const testWordIds = [
      'cmh4laruc000bkz04x5m8d2t4',
      'cmh4lkmnt001qkz04ee782h01',
      'cmh4lkmoh001rkz04i6xepq90'
    ];

    console.log(`📋 查詢 ${testWordIds.length} 個測試單字...\n`);

    const vocabularyItems = await prisma.vocabularyItem.findMany({
      where: {
        id: { in: testWordIds }
      }
    });

    console.log(`✅ 查詢到 ${vocabularyItems.length} 個單字\n`);

    vocabularyItems.forEach((item, index) => {
      console.log(`\n單字 ${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  English: ${item.english}`);
      console.log(`  Chinese: ${item.chinese}`);
      console.log(`  GEPT Level: ${item.geptLevel}`);
      console.log(`  Phonetic: ${item.phonetic}`);
      console.log(`  Part of Speech: ${item.partOfSpeech}`);
      console.log(`  ---`);
    });

    // 檢查是否有任何字段為 null 或 undefined
    const hasIssues = vocabularyItems.some(item => 
      !item.english || !item.chinese
    );

    if (hasIssues) {
      console.log('\n❌ 發現問題：有單字的 english 或 chinese 字段為空！');
    } else {
      console.log('\n✅ 所有單字的 english 和 chinese 字段都有數據');
    }

    // 額外檢查：查詢所有 ELEMENTARY 等級的單字數量
    console.log('\n\n📊 統計信息：');
    const elementaryCount = await prisma.vocabularyItem.count({
      where: {
        geptLevel: 'ELEMENTARY'
      }
    });
    console.log(`  ELEMENTARY 等級單字總數: ${elementaryCount}`);

    const withEnglishAndChinese = await prisma.vocabularyItem.count({
      where: {
        geptLevel: 'ELEMENTARY',
        english: { not: null },
        chinese: { not: null }
      }
    });
    console.log(`  有 english 和 chinese 的單字數: ${withEnglishAndChinese}`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVocabularyData();

