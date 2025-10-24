/**
 * 獲取需要學習的單字 (新單字 + 複習單字)
 * 共享函數,可以被 API 路由和內部邏輯調用
 *
 * 改進版本：
 * - 使用實時記憶強度（考慮自然衰減）
 * - 優先選擇記憶強度最低的單字
 * - 記憶強度越低，越需要複習
 */

import prisma from '@/lib/prisma';
import { calculateDecayedStrength } from './forgetting';
import fs from 'fs';
import path from 'path';

// 載入 GEPT 翻譯
let translations: Record<string, string> = {};
try {
  const translationsPath = path.join(process.cwd(), 'data/translations/gept-all-translations.json');
  const translationsData = fs.readFileSync(translationsPath, 'utf-8');
  translations = JSON.parse(translationsData);
  console.log(`✅ 載入 ${Object.keys(translations).length} 個翻譯`);
} catch (error) {
  console.error('⚠️  無法載入翻譯文件:', error);
}

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

  // 5. 計算所有複習單字的實時記憶強度（考慮自然衰減）
  const dueWordsWithRealTimeStrength = dueWords.map(p => {
    const realTimeStrength = calculateDecayedStrength(
      p.memoryStrength,
      p.lastReviewedAt || now,  // 如果沒有 lastReviewedAt，使用當前時間
      p.easeFactor
    );

    return {
      ...p,
      realTimeStrength
    };
  });

  console.log(`  - 計算實時記憶強度完成`);

  // 6. 選擇單字 (優先選擇記憶強度最低的)
  const newWordsCount = Math.min(5, newWords.length);
  const reviewWordsCount = Math.min(10, dueWordsWithRealTimeStrength.length);

  // 隨機選擇新單字
  const selectedNewWords = newWords
    .sort(() => Math.random() - 0.5)
    .slice(0, newWordsCount);

  // 按實時記憶強度排序複習單字（從低到高）
  // 記憶強度越低，越需要複習
  const selectedReviewWords = dueWordsWithRealTimeStrength
    .sort((a, b) => a.realTimeStrength - b.realTimeStrength)
    .slice(0, reviewWordsCount);

  console.log(`  - 選擇單字完成`);
  console.log(`  - 新單字: ${selectedNewWords.length} 個`);
  console.log(`  - 複習單字: ${selectedReviewWords.length} 個`);

  // 打印複習單字的實時記憶強度（用於調試）
  if (selectedReviewWords.length > 0) {
    console.log(`  - 複習單字實時記憶強度:`);
    selectedReviewWords.slice(0, 5).forEach((p, i) => {
      console.log(`    ${i + 1}. 記憶強度: ${p.memoryStrength}% → 實時: ${p.realTimeStrength}%`);
    });
  }

  // 7. 為每個單字創建或獲取 VocabularyItem
  const createOrGetVocabItem = async (ttsWord: any, chinese: string) => {
    console.log(`🔍 處理單字: ${ttsWord.text} (${chinese})`);

    try {
      // 嘗試查找現有的 VocabularyItem
      let vocabItem = await prisma.vocabularyItem.findFirst({
        where: {
          english: ttsWord.text,
          chinese: chinese
        }
      });

      if (vocabItem) {
        console.log(`  ✅ 找到現有 VocabularyItem: ${vocabItem.id}`);
      } else {
        // 如果不存在,創建新的
        console.log(`  🆕 創建新 VocabularyItem...`);
        vocabItem = await prisma.vocabularyItem.create({
          data: {
            english: ttsWord.text,
            chinese: chinese,
            audioUrl: ttsWord.audioUrl,
            difficultyLevel: 1
          }
        });
        console.log(`  ✅ 創建成功: ${vocabItem.id}`);
      }

      return vocabItem;
    } catch (error) {
      console.error(`  ❌ 處理 VocabularyItem 失敗:`, error);
      throw error;
    }
  };

  // 8. 合併單字列表 (使用 VocabularyItem.id)
  const words: WordToReview[] = [];

  // 處理新單字
  for (const w of selectedNewWords) {
    const word = w.text.toLowerCase();
    const chinese = translations[word] || '';
    const vocabItem = await createOrGetVocabItem(w, chinese);

    words.push({
      id: vocabItem.id,  // 使用 VocabularyItem.id
      english: w.text,
      chinese: chinese,
      audioUrl: w.audioUrl,
      geptLevel: w.geptLevel,
      isNew: true,
      needsReview: false,
      memoryStrength: 0
    });
  }

  // 處理複習單字
  for (const p of selectedReviewWords) {
    const w = allWords.find(word => word.id === p.wordId);
    if (!w) {
      throw new Error(`找不到單字: ${p.wordId}`);
    }
    const word = w.text.toLowerCase();
    const chinese = translations[word] || '';
    const vocabItem = await createOrGetVocabItem(w, chinese);

    words.push({
      id: vocabItem.id,  // 使用 VocabularyItem.id
      english: w.text,
      chinese: chinese,
      audioUrl: w.audioUrl,
      geptLevel: w.geptLevel,
      isNew: false,
      needsReview: true,
      memoryStrength: p.memoryStrength
    });
  }

  // 9. 統計數據
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

