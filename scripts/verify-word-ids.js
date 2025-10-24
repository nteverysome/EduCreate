/**
 * 驗證 wordId 是否存在於 VocabularyItem 表中
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyWordIds() {
  try {
    console.log('=== 驗證 wordId 是否存在 ===\n');

    // 1. 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: 'nteverysome@gmail.com' }
    });

    if (!user) {
      console.log('❌ 找不到用戶');
      return;
    }

    console.log(`✅ 用戶: ${user.email} (${user.id})\n`);

    // 2. 獲取用戶的所有學習進度
    const userProgress = await prisma.userWordProgress.findMany({
      where: { userId: user.id },
      include: { word: true }
    });

    console.log(`總學習進度: ${userProgress.length} 個\n`);

    // 3. 提取所有 wordId
    const wordIds = userProgress.map(p => p.wordId);
    console.log(`wordIds: ${wordIds.slice(0, 5).join(', ')}...\n`);

    // 4. 查詢這些 wordId 對應的 VocabularyItem
    const vocabularyItems = await prisma.vocabularyItem.findMany({
      where: {
        id: { in: wordIds }
      }
    });

    console.log(`查詢到的 VocabularyItem: ${vocabularyItems.length} 個\n`);

    // 5. 檢查哪些 wordId 找不到
    const foundIds = new Set(vocabularyItems.map(v => v.id));
    const missingIds = wordIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      console.log(`❌ 找不到的 wordIds (${missingIds.length} 個):`);
      missingIds.forEach(id => console.log(`  - ${id}`));
    } else {
      console.log(`✅ 所有 wordId 都存在於 VocabularyItem 表中`);
    }

    // 6. 顯示找到的單字
    console.log(`\n找到的單字 (前 10 個):`);
    vocabularyItems.slice(0, 10).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.english} (${item.chinese}) - ID: ${item.id}`);
    });

    // 7. 測試 API 查詢邏輯
    console.log('\n\n=== 測試 API 查詢邏輯 ===\n');

    const requestBody = {
      geptLevel: 'elementary',
      wordIds: wordIds
    };

    console.log(`請求參數:`);
    console.log(`  - geptLevel: ${requestBody.geptLevel}`);
    console.log(`  - wordIds 數量: ${requestBody.wordIds.length}`);

    // 模擬 API 邏輯
    let geptLevel = requestBody.geptLevel.toUpperCase().replace('-', '_');
    console.log(`  - 標準化後的 geptLevel: ${geptLevel}`);

    const apiVocabItems = await prisma.vocabularyItem.findMany({
      where: {
        id: { in: requestBody.wordIds }
      }
    });

    console.log(`\nAPI 查詢結果: ${apiVocabItems.length} 個單字`);

    if (apiVocabItems.length === 0) {
      console.log('❌ API 查詢返回 0 個單字！');
      console.log('\n可能的原因:');
      console.log('  1. wordIds 不存在於 VocabularyItem 表中');
      console.log('  2. 數據庫連接問題');
      console.log('  3. Prisma 查詢語法問題');
    } else {
      console.log('✅ API 查詢成功');
      console.log(`\n返回的單字 (前 5 個):`);
      apiVocabItems.slice(0, 5).forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.english} (${item.chinese})`);
      });
    }

  } catch (error) {
    console.error('❌ 驗證失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyWordIds();

