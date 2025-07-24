# AirplaneCollisionGame API 文檔

## 🎯 API 概述

AirplaneCollisionGame 提供了完整的 TypeScript API，支援遊戲配置、事件監聽、數據管理和性能監控。

## 🔌 核心 API

### 1. AirplaneCollisionGame 主組件

#### Props 接口
```typescript
interface AirplaneCollisionGameProps {
  // === 必需屬性 ===
  geptLevel: 'elementary' | 'intermediate' | 'advanced';
  
  // === 事件回調 ===
  onGameComplete?: (results: GameResults) => void;
  onScoreUpdate?: (score: ScoreUpdate) => void;
  onLearningEvent?: (event: LearningEvent) => void;
  onGameStateChange?: (state: GameState) => void;
  
  // === 遊戲配置 ===
  enableSound?: boolean;              // 預設: true
  enableHapticFeedback?: boolean;     // 預設: true
  customVocabulary?: WordPair[];      // 自定義詞彙
  difficulty?: 'easy' | 'medium' | 'hard'; // 預設: 'medium'
  
  // === UI 配置 ===
  showInstructions?: boolean;         // 預設: true
  theme?: 'default' | 'dark' | 'moon' | 'colorful'; // 預設: 'default'
  language?: 'zh-TW' | 'zh-CN' | 'en'; // 預設: 'zh-TW'
  
  // === 高級配置 ===
  debugMode?: boolean;                // 預設: false
  performanceMonitoring?: boolean;    // 預設: false
  autoSave?: boolean;                 // 預設: true
}
```

#### 使用範例
```typescript
import AirplaneCollisionGame from '@/components/games/AirplaneCollisionGame';

function GamePage() {
  const handleGameComplete = (results: GameResults) => {
    console.log('遊戲完成:', results);
    // 保存學習數據到後端
    saveLearningData(results);
  };

  const handleScoreUpdate = (score: ScoreUpdate) => {
    console.log('分數更新:', score);
    // 更新 UI 顯示
    updateScoreDisplay(score);
  };

  return (
    <AirplaneCollisionGame
      geptLevel="elementary"
      onGameComplete={handleGameComplete}
      onScoreUpdate={handleScoreUpdate}
      enableSound={true}
      theme="moon"
      showInstructions={true}
    />
  );
}
```

### 2. 數據類型定義

#### GameResults 遊戲結果
```typescript
interface GameResults {
  // === 基本統計 ===
  score: number;                    // 最終分數
  health: number;                   // 剩餘生命值
  wordsLearned: number;            // 學習詞彙數量
  accuracy: number;                // 準確率 (0-100)
  
  // === 時間統計 ===
  timeSpent: number;               // 遊戲時間 (秒)
  startTime: string;               // 開始時間 (ISO)
  endTime: string;                 // 結束時間 (ISO)
  
  // === 學習統計 ===
  correctAnswers: number;          // 正確答案數
  wrongAnswers: number;            // 錯誤答案數
  averageResponseTime: number;     // 平均反應時間 (ms)
  
  // === 詞彙統計 ===
  geptLevel: string;               // GEPT 等級
  vocabularyMastered: string[];    // 已掌握詞彙
  vocabularyNeedsReview: string[]; // 需要複習詞彙
  
  // === 遊戲統計 ===
  cloudsHit: number;               // 碰撞雲朵總數
  streakBest: number;              // 最佳連擊
  levelCompleted: boolean;         // 是否完成等級
}
```

#### ScoreUpdate 分數更新
```typescript
interface ScoreUpdate {
  // === 當前狀態 ===
  currentScore: number;            // 當前分數
  health: number;                  // 當前生命值
  streak: number;                  // 當前連擊數
  
  // === 變化量 ===
  scoreChange: number;             // 分數變化 (+10/-10)
  healthChange: number;            // 生命值變化
  
  // === 統計信息 ===
  totalCorrect: number;            // 總正確數
  totalWrong: number;              // 總錯誤數
  accuracy: number;                // 當前準確率
  
  // === 時間信息 ===
  timestamp: number;               // 更新時間戳
  gameTime: number;                // 遊戲進行時間 (秒)
}
```

#### LearningEvent 學習事件
```typescript
interface LearningEvent {
  // === 詞彙信息 ===
  word: string;                    // 英文詞彙
  translation: string;             // 中文翻譯
  isTarget: boolean;               // 是否為目標詞彙
  
  // === 回答信息 ===
  isCorrect: boolean;              // 是否正確
  responseTime: number;            // 反應時間 (ms)
  attempts: number;                // 嘗試次數
  
  // === 上下文信息 ===
  geptLevel: string;               // GEPT 等級
  difficulty: string;              // 難度等級
  gameTime: number;                // 遊戲時間
  
  // === 時間戳 ===
  timestamp: number;               // 事件時間戳
  sessionId: string;               // 遊戲會話 ID
}
```

#### GameState 遊戲狀態
```typescript
type GameState = 
  | 'initializing'    // 初始化中
  | 'ready'          // 準備就緒
  | 'playing'        // 遊戲進行中
  | 'paused'         // 暫停
  | 'completed'      // 完成
  | 'failed'         // 失敗
  | 'error';         // 錯誤

interface GameStateChange {
  previousState: GameState;
  currentState: GameState;
  timestamp: number;
  reason?: string;           // 狀態變化原因
}
```

### 3. GEPT 詞彙管理 API

#### GEPTManager 類
```typescript
class GEPTManager {
  // === 等級管理 ===
  setGEPTLevel(level: 'elementary' | 'intermediate' | 'advanced'): void;
  getCurrentLevel(): string;
  getLevelInfo(): GEPTLevelInfo;
  
  // === 詞彙獲取 ===
  getRandomWord(): WordPair;
  getWordsByLevel(level: string): WordPair[];
  getWordsByCategory(category: string): WordPair[];
  
  // === 詞彙搜索 ===
  findWord(english: string): WordPair | null;
  searchWords(query: string): WordPair[];
  
  // === 學習進度 ===
  markWordLearned(word: string): void;
  getLearnedWords(): string[];
  getLearningProgress(): LearningProgress;
  
  // === 統計信息 ===
  getVocabularyStats(): VocabularyStats;
  exportLearningData(): LearningData;
}
```

#### 詞彙相關類型
```typescript
interface WordPair {
  english: string;             // 英文詞彙
  chinese: string;             // 中文翻譯
  pronunciation?: string;      // 發音 (IPA)
  category?: string;           // 詞彙分類
  difficulty?: number;         // 難度等級 (1-10)
  frequency?: number;          // 使用頻率
  examples?: string[];         // 例句
}

interface GEPTLevelInfo {
  level: string;               // 等級名稱
  totalWords: number;          // 總詞彙數
  description: string;         // 等級描述
  targetAudience: string;      // 目標受眾
  estimatedTime: number;       // 預估學習時間 (小時)
}

interface LearningProgress {
  totalWords: number;          // 總詞彙數
  learnedWords: number;        // 已學詞彙數
  masteredWords: number;       // 已掌握詞彙數
  reviewWords: number;         // 需複習詞彙數
  progressPercentage: number;  // 進度百分比
  estimatedCompletion: string; // 預估完成時間
}
```

### 4. 碰撞檢測系統 API

#### CollisionDetectionSystem 類
```typescript
class CollisionDetectionSystem {
  // === 碰撞檢測 ===
  handlePlayerCloudCollision(
    player: Phaser.Physics.Arcade.Sprite,
    cloud: CloudSprite
  ): CollisionResult;
  
  // === 目標匹配 ===
  checkTargetMatch(cloudWord: string): boolean;
  setTargetWord(word: string): void;
  getCurrentTarget(): string;
  
  // === 分數管理 ===
  updateScore(isCorrect: boolean): ScoreChange;
  getScore(): number;
  resetScore(): void;
  
  // === 生命值管理 ===
  updateHealth(change: number): number;
  getHealth(): number;
  isGameOver(): boolean;
  
  // === 統計追蹤 ===
  getCollisionStats(): CollisionStats;
  resetStats(): void;
}
```

#### 碰撞相關類型
```typescript
interface CollisionResult {
  isCorrect: boolean;          // 是否正確碰撞
  word: string;                // 碰撞的詞彙
  scoreChange: number;         // 分數變化
  healthChange: number;        // 生命值變化
  streak: number;              // 連擊數
  timestamp: number;           // 碰撞時間
}

interface CollisionStats {
  totalCollisions: number;     // 總碰撞次數
  correctCollisions: number;   // 正確碰撞次數
  wrongCollisions: number;     // 錯誤碰撞次數
  accuracy: number;            // 準確率
  bestStreak: number;          // 最佳連擊
  averageResponseTime: number; // 平均反應時間
}
```

### 5. 記憶增強引擎 API

#### MemoryEnhancementEngine 類
```typescript
class MemoryEnhancementEngine {
  // === 學習記錄 ===
  recordLearningEvent(event: LearningEvent): void;
  getLearningHistory(): LearningEvent[];
  
  // === 記憶強化 ===
  calculateRetentionRate(word: string): number;
  getReviewSchedule(word: string): Date;
  updateMemoryStrength(word: string, isCorrect: boolean): void;
  
  // === 個人化推薦 ===
  getRecommendedWords(count: number): string[];
  getDifficultyAdjustment(): DifficultyAdjustment;
  
  // === 學習分析 ===
  analyzeLearningPattern(): LearningPattern;
  generateLearningReport(): LearningReport;
  
  // === 間隔重複 ===
  scheduleReview(word: string): void;
  getWordsForReview(): string[];
  updateReviewResult(word: string, result: ReviewResult): void;
}
```

## 🎮 遊戲控制 API

### 遊戲實例方法
```typescript
// 獲取遊戲實例 (通過 ref)
const gameRef = useRef<AirplaneCollisionGameRef>(null);

// 遊戲控制方法
interface AirplaneCollisionGameRef {
  // === 遊戲控制 ===
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  restartGame(): void;
  endGame(): void;
  
  // === 狀態獲取 ===
  getGameState(): GameState;
  getScore(): number;
  getHealth(): number;
  getCurrentTarget(): string;
  
  // === 配置更新 ===
  updateGEPTLevel(level: string): void;
  updateDifficulty(difficulty: string): void;
  updateTheme(theme: string): void;
  
  // === 數據導出 ===
  exportGameData(): GameData;
  exportLearningProgress(): LearningProgress;
  
  // === 性能監控 ===
  getPerformanceStats(): PerformanceStats;
  enableDebugMode(enabled: boolean): void;
}
```

### 使用範例
```typescript
function GameController() {
  const gameRef = useRef<AirplaneCollisionGameRef>(null);
  
  const handlePause = () => {
    gameRef.current?.pauseGame();
  };
  
  const handleRestart = () => {
    gameRef.current?.restartGame();
  };
  
  const handleLevelChange = (level: string) => {
    gameRef.current?.updateGEPTLevel(level);
  };
  
  return (
    <div>
      <AirplaneCollisionGame
        ref={gameRef}
        geptLevel="elementary"
        onGameComplete={handleGameComplete}
      />
      <button onClick={handlePause}>暫停</button>
      <button onClick={handleRestart}>重新開始</button>
    </div>
  );
}
```

## 🔧 配置 API

### 遊戲配置接口
```typescript
interface GameConfig {
  // === 基本設定 ===
  geptLevel: 'elementary' | 'intermediate' | 'advanced';
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'zh-TW' | 'zh-CN' | 'en';
  
  // === 遊戲機制 ===
  playerSpeed: number;         // 玩家移動速度
  cloudSpeed: number;          // 雲朵移動速度
  cloudSpawnRate: number;      // 雲朵生成間隔 (ms)
  maxClouds: number;           // 最大雲朵數量
  
  // === 分數系統 ===
  correctScore: number;        // 正確答案分數
  wrongPenalty: number;        // 錯誤答案懲罰
  streakBonus: number;         // 連擊獎勵
  healthPoints: number;        // 初始生命值
  
  // === 視覺效果 ===
  theme: string;               // 主題名稱
  backgroundSpeed: number;     // 背景滾動速度
  particleEffects: boolean;    // 粒子效果
  animations: boolean;         // 動畫效果
  
  // === 音效設定 ===
  enableSound: boolean;        // 啟用音效
  soundVolume: number;         // 音效音量 (0-1)
  backgroundMusic: boolean;    // 背景音樂
  musicVolume: number;         // 音樂音量 (0-1)
}
```

### 預設配置
```typescript
const DEFAULT_CONFIG: GameConfig = {
  geptLevel: 'elementary',
  difficulty: 'medium',
  language: 'zh-TW',
  
  playerSpeed: 200,
  cloudSpeed: 100,
  cloudSpawnRate: 2000,
  maxClouds: 8,
  
  correctScore: 10,
  wrongPenalty: 10,
  streakBonus: 5,
  healthPoints: 100,
  
  theme: 'default',
  backgroundSpeed: 50,
  particleEffects: true,
  animations: true,
  
  enableSound: true,
  soundVolume: 0.7,
  backgroundMusic: true,
  musicVolume: 0.5
};
```

## 📊 事件系統 API

### 事件監聽器
```typescript
// 全局事件監聽
interface GameEventListener {
  onGameStart?: () => void;
  onGameEnd?: (results: GameResults) => void;
  onScoreChange?: (score: ScoreUpdate) => void;
  onHealthChange?: (health: number) => void;
  onWordLearned?: (word: string) => void;
  onStreakAchieved?: (streak: number) => void;
  onLevelUp?: (newLevel: string) => void;
  onError?: (error: GameError) => void;
}

// 註冊事件監聽器
function registerEventListener(listener: GameEventListener): void;
function removeEventListener(listener: GameEventListener): void;
```

### 自定義事件
```typescript
// 觸發自定義事件
interface CustomEvent {
  type: string;
  data: any;
  timestamp: number;
}

function dispatchGameEvent(event: CustomEvent): void;
function addEventListener(type: string, handler: (event: CustomEvent) => void): void;
```

## 🚀 性能 API

### 性能監控
```typescript
interface PerformanceStats {
  fps: number;                 // 當前 FPS
  averageFPS: number;          // 平均 FPS
  memoryUsage: number;         // 記憶體使用 (MB)
  loadTime: number;            // 載入時間 (ms)
  renderTime: number;          // 渲染時間 (ms)
  
  // 遊戲特定指標
  collisionChecks: number;     // 碰撞檢測次數
  particleCount: number;       // 粒子數量
  textureMemory: number;       // 紋理記憶體使用
}

// 性能監控方法
function startPerformanceMonitoring(): void;
function stopPerformanceMonitoring(): void;
function getPerformanceStats(): PerformanceStats;
function resetPerformanceStats(): void;
```

## 🔍 調試 API

### 調試工具
```typescript
interface DebugInfo {
  gameState: GameState;
  playerPosition: { x: number; y: number };
  cloudCount: number;
  targetWord: string;
  collisionBounds: Rectangle[];
  performanceStats: PerformanceStats;
}

// 調試方法
function enableDebugMode(): void;
function disableDebugMode(): void;
function getDebugInfo(): DebugInfo;
function logGameState(): void;
```

**AirplaneCollisionGame API 提供了完整的遊戲控制、數據管理和性能監控功能，支援高度自定義和擴展！** 🚀
