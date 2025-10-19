/**
 * 更新活動描述中的遊戲名稱
 * 
 * 將描述中的技術 ID（如 shimozurdo-game）替換為用戶友好的名稱（如 Shimozurdo 雲朵遊戲）
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 遊戲類型映射
const gameTypeMap: { [key: string]: string } = {
  'shimozurdo-game': 'Shimozurdo 雲朵遊戲',
  'airplane-vite': '飛機遊戲 (Vite版)',
  'matching-pairs': '配對記憶',
  'flash-cards': '閃卡記憶',
  'whack-mole': '打地鼠',
  'spin-wheel': '轉盤選擇',
  'memory-cards': '記憶卡片',
  'complete-sentence': '完成句子',
  'spell-word': '拼寫單詞',
  'labelled-diagram': '標籤圖表',
  'watch-memorize': '觀察記憶',
  'rank-order': '排序遊戲',
  'math-generator': '數學生成器',
  'word-magnets': '單詞磁鐵',
  'group-sort': '分類遊戲',
  'image-quiz': '圖片問答',
  'maze-chase': '迷宮追逐',
  'crossword-puzzle': '填字遊戲',
  'flying-fruit': '飛行水果',
  'flip-tiles': '翻轉方塊',
  'type-answer': '輸入答案',
  'anagram': '字母重組',
  'hangman': '猜字遊戲',
  'true-false': '是非題',
  'wordsearch': '找字遊戲',
  'match-up': '配對',
  'airplane': '飛機遊戲',
  'balloon-pop': '氣球遊戲',
  'open-box': '開箱遊戲',
  'gameshow-quiz': '競賽測驗',
  'random-wheel': '隨機轉盤',
  'random-cards': '隨機卡片',
  'speaking-cards': '語音卡片',
  'quiz': '測驗',
  'matching': '配對遊戲',
  'flashcards': '單字卡片',
  'flashcard': '單字卡片',
  'vocabulary': '詞彙遊戲',
};

async function updateActivityDescriptions() {
  try {
    console.log('🔍 開始檢查需要更新的活動...\n');

    // 獲取所有活動
    const activities = await prisma.activity.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
      },
    });

    console.log(`📊 找到 ${activities.length} 個活動\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const activity of activities) {
      const description = activity.description || '';
      
      // 檢查描述是否包含「使用 ... 遊戲學習詞彙」的模式
      const match = description.match(/使用 ([\w-]+) 遊戲學習詞彙/);
      
      if (match) {
        const gameId = match[1];
        const friendlyName = gameTypeMap[gameId];
        
        if (friendlyName && friendlyName !== gameId) {
          // 需要更新
          const newDescription = description.replace(
            `使用 ${gameId} 遊戲學習詞彙`,
            `使用 ${friendlyName} 遊戲學習詞彙`
          );
          
          console.log(`✏️  更新活動: ${activity.title}`);
          console.log(`   舊描述: ${description}`);
          console.log(`   新描述: ${newDescription}\n`);
          
          await prisma.activity.update({
            where: { id: activity.id },
            data: { description: newDescription },
          });
          
          updatedCount++;
        } else {
          console.log(`⏭️  跳過活動: ${activity.title}`);
          console.log(`   原因: 遊戲 ID "${gameId}" 已經是友好名稱或沒有映射\n`);
          skippedCount++;
        }
      } else {
        console.log(`⏭️  跳過活動: ${activity.title}`);
        console.log(`   原因: 描述不符合「使用 ... 遊戲學習詞彙」模式\n`);
        skippedCount++;
      }
    }

    console.log('\n✅ 更新完成！');
    console.log(`📊 統計:`);
    console.log(`   - 總活動數: ${activities.length}`);
    console.log(`   - 已更新: ${updatedCount}`);
    console.log(`   - 已跳過: ${skippedCount}`);

  } catch (error) {
    console.error('❌ 更新失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行更新
updateActivityDescriptions()
  .then(() => {
    console.log('\n🎉 腳本執行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 腳本執行失敗:', error);
    process.exit(1);
  });

