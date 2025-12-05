/**
 * GameClassificationConfig - 遊戲分類配置
 * 將 EduCreate 的 25 種遊戲分類為輕量級、中等、重型三類
 * 每類配置不同的載入策略以優化性能和資源使用
 */

import { GameConfig, GameType, GameLoadStrategy } from './UnifiedGameManager';

// 記憶科學遊戲類型映射
export const MEMORY_SCIENCE_TYPES = {
  // 基礎記憶類型
  'basic-recall': ['quiz', 'flashcard', 'true-false', 'type-answer'],
  
  // 壓力情緒記憶
  'pressure-emotion': ['gameshow-quiz', 'spin-wheel', 'balloon-pop'],
  
  // 空間視覺記憶
  'spatial-visual': ['matching-pairs', 'flip-tiles', 'maze-chase', 'image-quiz'],
  
  // 重構邏輯記憶
  'reconstruction-logic': ['anagram', 'crossword', 'group-sort', 'word-scramble'],
  
  // 動態反應記憶
  'dynamic-reaction': ['flying-fruit', 'airplane', 'whack-a-mole'],
  
  // 關聯配對記憶
  'association-pairing': ['match', 'hangman', 'labelled-diagram'],
  
  // 搜索發現記憶
  'search-discovery': ['wordsearch'],
  
  // 語音聽覺記憶
  'audio-verbal': ['speaking-cards', 'complete-sentence']
} as const;

// 輕量級遊戲配置 (記憶體使用 <30MB, 載入時間 <800ms)
export const LIGHTWEIGHT_GAMES: GameConfig[] = [
  {
    id: 'quiz',
    name: 'quiz',
    displayName: '問答遊戲',
    type: 'lightweight',
    loadStrategy: 'lazy',
    memoryLimit: 20,
    estimatedLoadTime: 500,
    requiresPhaser: false,
    requiresAudio: false,
    componentPath: './QuizGame'
  },
  {
    id: 'flashcard',
    name: 'flashcard',
    displayName: '閃卡遊戲',
    type: 'lightweight',
    loadStrategy: 'lazy',
    memoryLimit: 15,
    estimatedLoadTime: 400,
    requiresPhaser: false,
    requiresAudio: false,
    componentPath: './FlashcardGame'
  },
  {
    id: 'true-false',
    name: 'true-false',
    displayName: '是非題',
    type: 'lightweight',
    loadStrategy: 'lazy',
    memoryLimit: 10,
    estimatedLoadTime: 300,
    requiresPhaser: false,
    requiresAudio: false,
    componentPath: './TrueFalseGame'
  },
  {
    id: 'type-answer',
    name: 'type-answer',
    displayName: '輸入答案',
    type: 'lightweight',
    loadStrategy: 'lazy',
    memoryLimit: 12,
    estimatedLoadTime: 350,
    requiresPhaser: false,
    requiresAudio: false,
    componentPath: './TypeAnswerGame'
  },
  {
    id: 'match',
    name: 'match',
    displayName: '配對遊戲',
    type: 'lightweight',
    loadStrategy: 'direct',
    memoryLimit: 25,
    estimatedLoadTime: 600,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './MatchGame'
  },
  {
    id: 'simple-match',
    name: 'simple-match',
    displayName: '簡單配對',
    type: 'lightweight',
    loadStrategy: 'lazy',
    memoryLimit: 18,
    estimatedLoadTime: 450,
    requiresPhaser: false,
    requiresAudio: false,
    componentPath: './SimpleMatchGame'
  },
  {
    id: 'balloon-pop',
    name: 'balloon-pop',
    displayName: '氣球爆破',
    type: 'lightweight',
    loadStrategy: 'lazy',
    memoryLimit: 22,
    estimatedLoadTime: 550,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './BalloonPopGame'
  },
  {
    id: 'spin-wheel',
    name: 'spin-wheel',
    displayName: '轉盤遊戲',
    type: 'lightweight',
    loadStrategy: 'lazy',
    memoryLimit: 20,
    estimatedLoadTime: 500,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './SpinWheelGame'
  }
];

// 中等遊戲配置 (記憶體使用 30-60MB, 載入時間 800-1200ms)
export const MEDIUM_GAMES: GameConfig[] = [
  {
    id: 'crossword',
    name: 'crossword',
    displayName: '填字遊戲',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 40,
    estimatedLoadTime: 800,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './CrosswordGame'
  },
  {
    id: 'wordsearch',
    name: 'wordsearch',
    displayName: '找字遊戲',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 35,
    estimatedLoadTime: 700,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './WordsearchGame'
  },
  {
    id: 'hangman',
    name: 'hangman',
    displayName: '猜字遊戲',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 30,
    estimatedLoadTime: 650,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './HangmanGame'
  },
  {
    id: 'anagram',
    name: 'anagram',
    displayName: '字母重組',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 32,
    estimatedLoadTime: 680,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './AnagramGame'
  },
  {
    id: 'group-sort',
    name: 'group-sort',
    displayName: '分組排序',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 38,
    estimatedLoadTime: 750,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './GroupSortGame'
  },
  {
    id: 'word-scramble',
    name: 'word-scramble',
    displayName: '單字重組',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 28,
    estimatedLoadTime: 620,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './WordScrambleGame'
  },
  {
    id: 'gameshow-quiz',
    name: 'gameshow-quiz',
    displayName: '遊戲節目問答',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 45,
    estimatedLoadTime: 850,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './GameshowQuizGame'
  },
  {
    id: 'flip-tiles',
    name: 'flip-tiles',
    displayName: '翻牌遊戲',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 42,
    estimatedLoadTime: 800,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './FlipTilesGame'
  },
  {
    id: 'image-quiz',
    name: 'image-quiz',
    displayName: '圖片問答',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 50,
    estimatedLoadTime: 900,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './ImageQuizGame'
  },
  {
    id: 'labelled-diagram',
    name: 'labelled-diagram',
    displayName: '標籤圖表',
    type: 'medium',
    loadStrategy: 'lazy',
    memoryLimit: 48,
    estimatedLoadTime: 880,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './LabelledDiagramGame'
  }
];

// 重型遊戲配置 (記憶體使用 >60MB, 載入時間 >1200ms, 使用 Phaser 或複雜動畫)
export const HEAVYWEIGHT_GAMES: GameConfig[] = [
  {
    id: 'maze-chase',
    name: 'maze-chase',
    displayName: '迷宮追逐',
    type: 'heavyweight',
    loadStrategy: 'cdn',
    memoryLimit: 70,
    estimatedLoadTime: 1000,
    requiresPhaser: true,
    requiresAudio: true,
    cdnUrl: 'https://games.educreat.vercel.app/maze-game'
  },
  {
    id: 'flying-fruit',
    name: 'flying-fruit',
    displayName: '飛行水果',
    type: 'heavyweight',
    loadStrategy: 'cdn',
    memoryLimit: 60,
    estimatedLoadTime: 900,
    requiresPhaser: true,
    requiresAudio: true,
    cdnUrl: 'https://games.educreat.vercel.app/fruit-game'
  },
  {
    id: 'whack-a-mole',
    name: 'whack-a-mole',
    displayName: '打地鼠',
    type: 'heavyweight',
    loadStrategy: 'direct',
    memoryLimit: 65,
    estimatedLoadTime: 1100,
    requiresPhaser: true,
    requiresAudio: true,
    componentPath: './WhackAMoleGame'
  },
  {
    id: 'memory-card',
    name: 'memory-card',
    displayName: '記憶卡片',
    type: 'heavyweight',
    loadStrategy: 'lazy',
    memoryLimit: 55,
    estimatedLoadTime: 950,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './MemoryCardGame'
  },
  {
    id: 'speaking-cards',
    name: 'speaking-cards',
    displayName: '語音卡片',
    type: 'heavyweight',
    loadStrategy: 'lazy',
    memoryLimit: 75,
    estimatedLoadTime: 1150,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './SpeakingCardsGame'
  },
  {
    id: 'complete-sentence',
    name: 'complete-sentence',
    displayName: '完成句子',
    type: 'heavyweight',
    loadStrategy: 'lazy',
    memoryLimit: 68,
    estimatedLoadTime: 1050,
    requiresPhaser: false,
    requiresAudio: true,
    componentPath: './CompleteSentenceGame'
  }
];

// 所有遊戲配置的統一導出
export const ALL_GAME_CONFIGS: GameConfig[] = [
  ...LIGHTWEIGHT_GAMES,
  ...MEDIUM_GAMES,
  ...HEAVYWEIGHT_GAMES
];

// 遊戲分類統計
export const GAME_CLASSIFICATION_STATS = {
  lightweight: {
    count: LIGHTWEIGHT_GAMES.length,
    totalMemory: LIGHTWEIGHT_GAMES.reduce((sum, game) => sum + game.memoryLimit, 0),
    avgLoadTime: LIGHTWEIGHT_GAMES.reduce((sum, game) => sum + game.estimatedLoadTime, 0) / LIGHTWEIGHT_GAMES.length
  },
  medium: {
    count: MEDIUM_GAMES.length,
    totalMemory: MEDIUM_GAMES.reduce((sum, game) => sum + game.memoryLimit, 0),
    avgLoadTime: MEDIUM_GAMES.reduce((sum, game) => sum + game.estimatedLoadTime, 0) / MEDIUM_GAMES.length
  },
  heavyweight: {
    count: HEAVYWEIGHT_GAMES.length,
    totalMemory: HEAVYWEIGHT_GAMES.reduce((sum, game) => sum + game.memoryLimit, 0),
    avgLoadTime: HEAVYWEIGHT_GAMES.reduce((sum, game) => sum + game.estimatedLoadTime, 0) / HEAVYWEIGHT_GAMES.length
  },
  total: {
    count: ALL_GAME_CONFIGS.length,
    totalMemory: ALL_GAME_CONFIGS.reduce((sum, game) => sum + game.memoryLimit, 0),
    avgLoadTime: ALL_GAME_CONFIGS.reduce((sum, game) => sum + game.estimatedLoadTime, 0) / ALL_GAME_CONFIGS.length
  }
};

// 載入策略配置
export const LOAD_STRATEGY_CONFIG = {
  direct: {
    description: '直接載入，適用於核心遊戲和輕量級遊戲',
    maxConcurrent: 2,
    memoryThreshold: 100 // MB
  },
  lazy: {
    description: 'React.lazy 懶載入，適用於大部分遊戲',
    maxConcurrent: 5,
    memoryThreshold: 200 // MB
  },
  cdn: {
    description: 'CDN iframe 載入，適用於重型 Phaser 遊戲',
    maxConcurrent: 2,
    memoryThreshold: 300 // MB
  }
};

// 根據遊戲 ID 獲取配置
export function getGameConfig(gameId: string): GameConfig | undefined {
  return ALL_GAME_CONFIGS.find(config => config.id === gameId);
}

// 根據類型獲取遊戲列表
export function getGamesByType(type: GameType): GameConfig[] {
  return ALL_GAME_CONFIGS.filter(config => config.type === type);
}

// 根據載入策略獲取遊戲列表
export function getGamesByLoadStrategy(strategy: GameLoadStrategy): GameConfig[] {
  return ALL_GAME_CONFIGS.filter(config => config.loadStrategy === strategy);
}

// 獲取記憶科學類型的遊戲
export function getGamesByMemoryType(memoryType: keyof typeof MEMORY_SCIENCE_TYPES): GameConfig[] {
  const gameIds = MEMORY_SCIENCE_TYPES[memoryType];
  return ALL_GAME_CONFIGS.filter(config => gameIds.includes(config.id as any));
}

// 驗證遊戲配置
export function validateGameConfig(config: GameConfig): boolean {
  const requiredFields = ['id', 'name', 'displayName', 'type', 'loadStrategy', 'memoryLimit', 'estimatedLoadTime'];
  
  for (const field of requiredFields) {
    if (!(field in config)) {
      console.error(`遊戲配置缺少必要欄位: ${field}`, config);
      return false;
    }
  }

  // 驗證載入策略和組件路徑的一致性
  if (config.loadStrategy === 'cdn' && !config.cdnUrl) {
    console.error('CDN 載入策略需要 cdnUrl', config);
    return false;
  }

  if ((config.loadStrategy === 'direct' || config.loadStrategy === 'lazy') && !config.componentPath) {
    console.error('直接載入和懶載入策略需要 componentPath', config);
    return false;
  }

  return true;
}

// 獲取推薦的載入策略
export function getRecommendedLoadStrategy(memoryLimit: number, requiresPhaser: boolean): GameLoadStrategy {
  if (requiresPhaser || memoryLimit > 60) {
    return 'cdn';
  } else if (memoryLimit > 30) {
    return 'lazy';
  } else {
    return 'lazy'; // 預設使用懶載入
  }
}

console.log('📊 遊戲分類配置載入完成:');
console.log(`  輕量級遊戲: ${GAME_CLASSIFICATION_STATS.lightweight.count} 個`);
console.log(`  中等遊戲: ${GAME_CLASSIFICATION_STATS.medium.count} 個`);
console.log(`  重型遊戲: ${GAME_CLASSIFICATION_STATS.heavyweight.count} 個`);
console.log(`  總計: ${GAME_CLASSIFICATION_STATS.total.count} 個遊戲`);
