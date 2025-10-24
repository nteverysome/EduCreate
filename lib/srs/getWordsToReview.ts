/**
 * 獲取需要學習的單字 (新單字 + 複習單字)
 * 共享函數,可以被 API 路由和內部邏輯調用
 */

import prisma from '@/lib/prisma';
import { calculatePriority } from './sm2';

export interface WordToReview {
  id: string;
  english: string;
  chinese: string;
  audioUrl: string;
  geptLevel: string;
  isNew: boolean;
  needsReview: boolean;
  memoryStrength: number;
}

export interface GetWordsToReviewResult {
  words: WordToReview[];
  newWords: any[];
  reviewWords: any[];
  statistics: {
    totalWords: number;
    learnedWords: number;
    masteredWords: number;
    dueForReview: number;
  };
}

export async function getWordsToReview(
  userId: string,
  geptLevel: string = 'ELEMENTARY',
  count: number = 15
): Promise<GetWordsToReviewResult> {
  console.log('🔍 獲取需要複習的單字');
  console.log(`  - 用戶 ID: ${userId}`);
  console.log(`  - GEPT 等級: ${geptLevel}`);
  console.log(`  - 數量: ${count}`);

  // 確保 geptLevel 是大寫 (符合 GEPTLevel enum)
  const normalizedGeptLevel = geptLevel.toUpperCase();

  // 1. 獲取該等級的所有單字 (從 TTSCache 表)
  let allWords = await prisma.tTSCache.findMany({
    where: {
      geptLevel: normalizedGeptLevel as any,
      language: 'en-US'  // 只獲取英文單字
    },
    select: {
      id: true,
      text: true,
      audioUrl: true,
      geptLevel: true
    }
  });

  console.log(`  - 找到 ${allWords.length} 個單字`);

  // 如果 TTSCache 沒有數據,使用硬編碼的預設詞彙
  if (allWords.length === 0) {
    console.log('⚠️ TTSCache 沒有數據,使用硬編碼的預設詞彙');
    
    // 硬編碼的 GEPT ELEMENTARY 詞彙 (50 個常用詞)
    const defaultWords = [
      'apple', 'banana', 'cat', 'dog', 'elephant',
      'fish', 'girl', 'house', 'ice', 'juice',
      'kite', 'lion', 'monkey', 'nose', 'orange',
      'pen', 'queen', 'rabbit', 'sun', 'tree',
      'umbrella', 'van', 'water', 'box', 'yellow',
      'zoo', 'book', 'chair', 'desk', 'egg',
      'flower', 'green', 'hat', 'ink', 'jam',
      'key', 'lamp', 'milk', 'net', 'owl',
      'pig', 'quilt', 'red', 'star', 'table',
      'up', 'vest', 'window', 'fox', 'zebra'
    ];
    
    // 隨機選擇 15 個單字
    const selectedWords = defaultWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);
    
    console.log(`  - 選擇了 ${selectedWords.length} 個單字用於 SRS`);
    
    // 創建臨時單字對象
    allWords = selectedWords.map((word, index) => ({
      id: `default-${index}`,
      text: word,
      audioUrl: '', // 暫時不生成 TTS
      geptLevel: geptLevel.toUpperCase() as any
    }));
    
    console.log(`  - 創建了 ${allWords.length} 個臨時單字對象`);
  }

  // 2. 獲取用戶的學習進度
  const userProgress = await prisma.userWordProgress.findMany({
    where: {
      userId,
      word: {
        id: {
          in: allWords.map(w => w.id)
        }
      }
    },
    include: {
      word: true
    }
  });

  console.log(`  - 找到 ${userProgress.length} 個學習記錄`);

  // 3. 分類單字
  const learnedWordIds = new Set(userProgress.map(p => p.wordId));
  const newWords = allWords.filter(w => !learnedWordIds.has(w.id));
  
  // 4. 找出需要複習的單字
  const now = new Date();
  const dueWords = userProgress.filter(p => {
    return new Date(p.nextReviewAt) <= now && p.status !== 'MASTERED';
  });

  console.log(`  - 新單字: ${newWords.length}`);
  console.log(`  - 需要複習: ${dueWords.length}`);

  // 5. 選擇單字 (5 個新單字 + 10 個複習單字)
  const newWordsCount = Math.min(5, newWords.length);
  const reviewWordsCount = Math.min(10, dueWords.length);

  // 隨機選擇新單字
  const selectedNewWords = newWords
    .sort(() => Math.random() - 0.5)
    .slice(0, newWordsCount);

  // 按優先級排序複習單字
  const selectedReviewWords = dueWords
    .sort((a, b) => {
      const priorityA = calculatePriority(
        a.memoryStrength,
        new Date(a.nextReviewAt),
        now
      );
      const priorityB = calculatePriority(
        b.memoryStrength,
        new Date(b.nextReviewAt),
        now
      );
      return priorityB - priorityA;
    })
    .slice(0, reviewWordsCount);

  // 6. 合併單字列表
  const words: WordToReview[] = [
    ...selectedNewWords.map(w => {
      return {
        id: w.id,
        english: w.text,
        chinese: '',  // TODO: 從其他來源獲取中文
        audioUrl: w.audioUrl,
        geptLevel: w.geptLevel,
        isNew: true,
        needsReview: false,
        memoryStrength: 0
      };
    }),
    ...selectedReviewWords.map(p => {
      const w = allWords.find(word => word.id === p.wordId);
      if (!w) {
        throw new Error(`找不到單字: ${p.wordId}`);
      }
      return {
        id: w.id,
        english: w.text,
        chinese: '',  // TODO: 從其他來源獲取中文
        audioUrl: w.audioUrl,
        geptLevel: w.geptLevel,
        isNew: false,
        needsReview: true,
        memoryStrength: p.memoryStrength
      };
    })
  ];

  // 7. 統計數據
  const statistics = {
    totalWords: allWords.length,
    learnedWords: learnedWordIds.size,
    masteredWords: userProgress.filter(p => p.status === 'MASTERED').length,
    dueForReview: dueWords.length
  };

  console.log('✅ 單字選擇完成');
  console.log(`  - 總共: ${words.length} 個單字`);

  return {
    words,
    newWords: selectedNewWords,
    reviewWords: selectedReviewWords,
    statistics
  };
}

