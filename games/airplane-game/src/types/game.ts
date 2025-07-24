/**
 * 遊戲類型定義
 * 基於 EduCreate MemoryGameTemplate 接口
 */

// GEPT 等級定義
export type GEPTLevel = 'elementary' | 'intermediate' | 'high-intermediate';

// 遊戲配置接口
export interface GameConfig {
  geptLevel: GEPTLevel;
  enableSound: boolean;
  enableHapticFeedback: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'practice' | 'test' | 'challenge';
}

// 遊戲狀態
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentScore: number;
  currentHealth: number;
  wordsLearned: number;
  accuracy: number;
  currentTargetWord?: GEPTWord;
}

// GEPT 詞彙接口
export interface GEPTWord {
  id: string;
  english: string;
  chinese: string;
  level: GEPTLevel;
  frequency: number;
  category?: string;
  pronunciation?: string;
}

// 學習進度接口
export interface LearningProgress {
  wordId: string;
  correctCount: number;
  incorrectCount: number;
  lastSeen: Date;
  nextReview: Date;
  masteryLevel: number; // 0-100
}

// 遊戲結果接口
export interface GameResults {
  finalScore: number;
  totalWords: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timeSpent: number;
  wordsLearned: GEPTWord[];
  learningProgress: LearningProgress[];
}

// 遊戲事件類型
export type GameEventType = 
  | 'game-start'
  | 'game-pause'
  | 'game-resume'
  | 'game-end'
  | 'score-update'
  | 'word-learned'
  | 'collision-correct'
  | 'collision-incorrect';

// 遊戲事件接口
export interface GameEvent {
  type: GameEventType;
  data?: any;
  timestamp: number;
}

// 父子頁面通信接口
export interface ParentMessage {
  type: 'GAME_SCORE_UPDATE' | 'GAME_STATE_CHANGE' | 'GAME_COMPLETE';
  score?: number;
  health?: number;
  state?: string;
  results?: GameResults;
}

// Phaser 場景數據接口
export interface SceneData {
  config: GameConfig;
  onGameStart?: () => void;
  onScoreUpdate?: (score: number, health: number) => void;
  onWordLearned?: (word: GEPTWord) => void;
  onGameEnd?: (results: GameResults) => void;
}
