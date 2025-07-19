/**
 * MatchGameManager - Match配對遊戲管理器
 * 基於記憶科學原理的配對遊戲，支持多種配對模式和智能適配
 */

import { AdaptiveDifficultyAI, DifficultyStrategy, LearnerState, CognitiveLoadMetrics, PerformanceMetrics } from '../ai/AdaptiveDifficultyAI';
import { ErrorPatternAnalyzer, ErrorRecord, ErrorType, ErrorAnalysisResult } from './ErrorPatternAnalyzer';
import { IntelligentHintSystem, HintContent, HintRequest, HintLevel } from './IntelligentHintSystem';
import { MemoryCurveTracker, MemoryItem, MemoryAnalysisResult, MemoryItemStatus } from './MemoryCurveTracker';
import { SpacedRepetitionAlgorithm, ReviewScheduleItem, ReviewSession, LearningPlan } from './SpacedRepetitionAlgorithm';
import { GEPTManager, GEPTLevel } from '../gept/GEPTManager';
import { GEPTAdaptationEngine, ContentAdaptationResult, LearnerProfile, AdaptationStrategy } from '../gept/GEPTAdaptationEngine';
import { VocabularyDifficultyManager, VocabularyReplacement, VocabularyAnalysis, DifficultyAdjustmentMode } from '../gept/VocabularyDifficultyManager';
import { CrossLevelLearningManager, LevelTransitionRecommendation, CrossLevelLearningPlan } from '../gept/CrossLevelLearningManager';

export type MatchMode = 'text-text' | 'text-image' | 'image-image' | 'audio-text' | 'text-audio' | 'mixed';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export type GEPTLevel = 'elementary' | 'intermediate' | 'high-intermediate';

// 計分模式
export type ScoringMode = 'standard' | 'time-based' | 'streak-based' | 'accuracy-based' | 'adaptive' | 'competitive';

// 時間模式
export type TimeMode = 'unlimited' | 'fixed' | 'countdown' | 'pressure' | 'adaptive';

export interface MatchItem {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string; // 文字內容或資源URL
  displayText?: string; // 顯示文字（用於圖片和音頻）
  pronunciation?: string; // 發音
  hint?: string; // 提示
  category?: string; // 分類
  difficulty?: number; // 1-10
  geptLevel?: GEPTLevel;
  metadata?: Record<string, any>;
}

export interface MatchPair {
  id: string;
  leftItem: MatchItem;
  rightItem: MatchItem;
  isCorrect?: boolean;
  matchedAt?: number;
  attempts?: number;
  hintUsed?: boolean;
}

export interface MatchGameConfig {
  mode: MatchMode;
  difficulty: DifficultyLevel;
  geptLevel?: GEPTLevel;
  pairCount: number; // 配對數量 (4-20)
  timeLimit?: number; // 時間限制（秒）
  allowHints: boolean;
  showProgress: boolean;
  enableSound: boolean;
  enableAnimation: boolean;
  shuffleItems: boolean;
  maxAttempts?: number; // 最大嘗試次數
  penaltyTime?: number; // 錯誤懲罰時間
  bonusPoints?: number; // 連續正確獎勵
  // 自適應難度設置
  enableAdaptiveDifficulty?: boolean; // 啟用自適應難度
  difficultyStrategy?: DifficultyStrategy; // 難度調整策略
  cognitiveLoadThreshold?: number; // 認知負荷閾值
  performanceThreshold?: number; // 表現閾值
  // 計分系統設置
  scoringMode?: ScoringMode; // 計分模式
  timeMode?: TimeMode; // 時間模式
  baseScore?: number; // 基礎分數
  streakMultiplier?: number; // 連續獎勵倍數
  timeBonus?: boolean; // 時間獎勵
  accuracyBonus?: boolean; // 準確率獎勵
  perfectGameBonus?: number; // 完美遊戲獎勵
  // 時間系統設置
  warningTime?: number; // 警告時間（秒）
  urgentTime?: number; // 緊急時間（秒）
  timeExtension?: number; // 時間延長（秒）
  maxTimeExtensions?: number; // 最大延長次數
}

export interface MatchGameState {
  gameId: string;
  config: MatchGameConfig;
  pairs: MatchPair[];
  selectedItems: string[]; // 當前選中的項目ID
  matchedPairs: string[]; // 已配對的pair ID
  score: number;
  timeRemaining?: number;
  attempts: number;
  correctMatches: number;
  hintsUsed: number;
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
  isPaused: boolean;
  currentStreak: number; // 連續正確次數
  bestStreak: number; // 最佳連續次數
  // 自適應難度相關狀態
  currentDifficultyScore?: number; // 當前難度分數 (0-1)
  cognitiveLoadMetrics?: CognitiveLoadMetrics; // 認知負荷指標
  performanceMetrics?: PerformanceMetrics; // 表現指標
  difficultyAdjustments?: number; // 難度調整次數
  lastAdjustmentTime?: number; // 上次調整時間
  responseTimes?: number[]; // 響應時間記錄
  hesitationCount?: number; // 猶豫次數
  lastSelectionTime?: number; // 上次選擇時間
  lastResponseTime?: number; // 上次響應時間
  // 計分系統狀態
  scoreHistory?: number[]; // 分數歷史
  bonusPoints?: number; // 獎勵分數
  penaltyPoints?: number; // 懲罰分數
  streakBonus?: number; // 連續獎勵
  timeBonus?: number; // 時間獎勵
  accuracyBonus?: number; // 準確率獎勵
  perfectPairs?: number; // 完美配對數
  // 時間系統狀態
  timeExtensionsUsed?: number; // 已使用的時間延長次數
  timeWarningShown?: boolean; // 是否已顯示時間警告
  timeUrgentShown?: boolean; // 是否已顯示緊急警告
  pausedTime?: number; // 暫停時間累計
  totalGameTime?: number; // 總遊戲時間
  // 錯誤分析和提示系統狀態
  errorHistory?: ErrorRecord[]; // 錯誤歷史記錄
  currentHint?: HintContent; // 當前提示
  hintHistory?: HintContent[]; // 提示歷史
  errorAnalysisResult?: ErrorAnalysisResult; // 錯誤分析結果
  learningInsights?: string[]; // 學習洞察
  personalizedRecommendations?: string[]; // 個人化建議
  // 記憶曲線追蹤系統狀態
  memoryItems?: MemoryItem[]; // 記憶項目
  memoryAnalysis?: MemoryAnalysisResult; // 記憶分析結果
  currentReviewSession?: ReviewSession; // 當前復習會話
  learningPlan?: LearningPlan; // 學習計劃
  reviewSchedule?: ReviewScheduleItem[]; // 復習計劃
  // GEPT分級適配系統狀態
  learnerProfile?: LearnerProfile; // 學習者檔案
  contentAdaptation?: ContentAdaptationResult; // 內容適配結果
  vocabularyAnalysis?: VocabularyAnalysis; // 詞彙分析
  levelTransitionRecommendation?: LevelTransitionRecommendation; // 等級轉換建議
  crossLevelLearningPlan?: CrossLevelLearningPlan; // 跨等級學習計劃
  vocabularyReplacements?: VocabularyReplacement[]; // 詞彙替換建議
}

export interface MatchGameResult {
  gameId: string;
  score: number;
  accuracy: number; // 準確率
  completionTime: number; // 完成時間（秒）
  totalAttempts: number;
  correctMatches: number;
  hintsUsed: number;
  averageResponseTime: number; // 平均反應時間
  difficultyLevel: DifficultyLevel;
  geptLevel?: GEPTLevel;
  memoryRetention: number; // 記憶保持率
  learningEfficiency: number; // 學習效率
  recommendations: string[]; // 學習建議
  timestamp: number;
}

export interface MatchGameAnalytics {
  totalGames: number;
  averageScore: number;
  averageAccuracy: number;
  averageCompletionTime: number;
  improvementRate: number; // 進步率
  difficultyProgression: DifficultyLevel[];
  commonMistakes: Array<{
    leftItem: string;
    rightItem: string;
    frequency: number;
  }>;
  learningCurve: Array<{
    gameNumber: number;
    score: number;
    accuracy: number;
    timestamp: number;
  }>;
  memoryRetentionCurve: Array<{
    interval: number; // 間隔天數
    retentionRate: number;
  }>;
}

export class MatchGameManager {
  private gameState: MatchGameState | null = null;
  private gameHistory: MatchGameResult[] = [];
  private analytics: MatchGameAnalytics | null = null;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private audioContext: AudioContext | null = null;
  // GEPT管理器
  private geptManager: GEPTManager = new GEPTManager();
  // 錯誤分析和提示系統
  private errorAnalyzer: ErrorPatternAnalyzer = new ErrorPatternAnalyzer();
  private hintSystem: IntelligentHintSystem = new IntelligentHintSystem(this.errorAnalyzer);
  // 記憶曲線追蹤系統
  private memoryCurveTracker: MemoryCurveTracker = new MemoryCurveTracker();
  private spacedRepetitionAlgorithm: SpacedRepetitionAlgorithm = new SpacedRepetitionAlgorithm(this.memoryCurveTracker);
  // GEPT分級適配系統
  private geptAdaptationEngine!: GEPTAdaptationEngine;
  private vocabularyDifficultyManager!: VocabularyDifficultyManager;
  private crossLevelLearningManager!: CrossLevelLearningManager;
  private soundEffects: Map<string, AudioBuffer> = new Map();

  // 事件監聽器
  private gameStateListeners: Set<(state: MatchGameState) => void> = new Set();
  private gameCompleteListeners: Set<(result: MatchGameResult) => void> = new Set();
  private matchListeners: Set<(pair: MatchPair, isCorrect: boolean) => void> = new Set();
  private errorListeners: Set<(error: string) => void> = new Set();

  constructor() {
    // 異步初始化音頻，不阻塞構造函數
    this.initializeAudio().catch(error => {
      console.warn('音頻初始化失敗:', error);
    });
    this.loadGameHistory();

    // 初始化GEPT分級適配系統
    this.initializeGEPTSystems();

    console.log('MatchGameManager 構造函數完成');
  }

  /**
   * 初始化GEPT分級適配系統
   */
  private initializeGEPTSystems(): void {
    this.geptAdaptationEngine = new GEPTAdaptationEngine(this.geptManager);
    this.vocabularyDifficultyManager = new VocabularyDifficultyManager(this.geptManager);
    this.crossLevelLearningManager = new CrossLevelLearningManager();
  }

  /**
   * 初始化音頻系統
   */
  private async initializeAudio(): Promise<void> {
    try {
      // 檢查是否在瀏覽器環境中
      if (typeof window === 'undefined') return;

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 預載音效（跳過實際載入，避免404錯誤）
      const soundEffects = {
        correct: '/sounds/correct.mp3',
        incorrect: '/sounds/incorrect.mp3',
        match: '/sounds/match.mp3',
        complete: '/sounds/complete.mp3',
        hint: '/sounds/hint.mp3',
        tick: '/sounds/tick.mp3'
      };

      // 暫時跳過音效載入，避免阻塞遊戲初始化
      console.log('音頻系統初始化完成（跳過音效載入）');
    } catch (error) {
      console.warn('音頻系統初始化失敗:', error);
    }
  }

  /**
   * 播放音效
   */
  private playSound(soundName: string): void {
    if (!this.audioContext || !this.soundEffects.has(soundName)) return;

    try {
      const audioBuffer = this.soundEffects.get(soundName)!;
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn(`播放音效失敗 ${soundName}:`, error);
    }
  }

  /**
   * 開始新遊戲
   */
  startGame(config: MatchGameConfig, pairs: MatchPair[]): string {
    console.log('MatchGameManager.startGame 被調用');
    console.log('配置:', config);
    console.log('配對數據:', pairs);

    const gameId = this.generateGameId();
    console.log('生成遊戲ID:', gameId);

    // 驗證配置
    this.validateConfig(config);
    console.log('配置驗證通過');

    // 驗證配對數據
    this.validatePairs(pairs);
    console.log('配對數據驗證通過');

    // 打亂項目順序
    if (config.shuffleItems) {
      pairs = this.shufflePairs(pairs);
      console.log('項目順序已打亂');
    }

    // 創建遊戲狀態
    this.gameState = {
      gameId,
      config,
      pairs,
      selectedItems: [],
      matchedPairs: [],
      score: 0,
      timeRemaining: config.timeLimit,
      attempts: 0,
      correctMatches: 0,
      hintsUsed: 0,
      startTime: Date.now(),
      isCompleted: false,
      isPaused: false,
      currentStreak: 0,
      bestStreak: 0
    };
    console.log('遊戲狀態已創建:', this.gameState);

    // 初始化自適應難度系統
    this.initializeAdaptiveDifficulty();
    console.log('自適應難度系統已初始化');

    // 初始化記憶追蹤系統
    this.initializeMemoryTracking(gameId);
    console.log('記憶追蹤系統已初始化');

    // 初始化GEPT分級適配系統
    this.initializeGEPTAdaptation(gameId);
    console.log('GEPT分級適配系統已初始化');

    // 開始計時器
    if (config.timeLimit) {
      this.startTimer();
      console.log('計時器已開始');
    }

    // 通知狀態更新
    console.log('準備通知狀態監聽器，監聽器數量:', this.gameStateListeners.size);
    this.notifyGameStateListeners();
    console.log('狀態監聽器已通知');

    return gameId;
  }

  /**
   * 選擇項目
   */
  selectItem(itemId: string): boolean {
    if (!this.gameState || this.gameState.isCompleted || this.gameState.isPaused) {
      return false;
    }

    // 檢查項目是否已經被選中或已配對
    if (this.gameState.selectedItems.includes(itemId) || this.isItemMatched(itemId)) {
      return false;
    }

    // 記錄選擇時間（用於響應時間分析）
    const selectionTime = Date.now();
    if (this.gameState.selectedItems.length === 0) {
      // 第一次選擇，記錄開始時間
      this.gameState.lastSelectionTime = selectionTime;
    }

    // 添加到選中列表
    this.gameState.selectedItems.push(itemId);

    // 如果選中了兩個項目，檢查配對
    if (this.gameState.selectedItems.length === 2) {
      // 計算響應時間
      const responseTime = selectionTime - (this.gameState.lastSelectionTime || selectionTime);
      this.gameState.lastResponseTime = responseTime;

      setTimeout(() => this.checkMatch(), 500); // 延遲檢查，讓用戶看到選擇
    }

    // 播放選擇音效
    if (this.gameState.config.enableSound) {
      this.playSound('tick');
    }

    this.notifyGameStateListeners();
    return true;
  }

  /**
   * 檢查配對
   */
  private checkMatch(): void {
    if (!this.gameState || this.gameState.selectedItems.length !== 2) return;

    const [item1Id, item2Id] = this.gameState.selectedItems;
    const pair = this.findPairByItems(item1Id, item2Id);

    this.gameState.attempts++;

    // 獲取響應時間
    const responseTime = this.gameState.lastResponseTime || 2000;

    if (pair) {
      // 配對成功
      this.handleCorrectMatch(pair);

      // 更新認知負荷和表現指標
      this.updateCognitiveLoadMetrics(responseTime, true);
      this.updatePerformanceMetrics();

    // 記錄記憶學習（正確配對）
    this.recordMemoryLearning(pair, true, responseTime);

    // 記錄GEPT學習進度（正確配對）
    this.recordGEPTLearningProgress(pair, true, responseTime);
    } else {
      // 配對失敗
      this.handleIncorrectMatch(item1Id, item2Id);

      // 更新認知負荷和表現指標
      this.updateCognitiveLoadMetrics(responseTime, false);
      this.updatePerformanceMetrics();
    }

    // 分析並調整難度（每5次嘗試分析一次）
    if (this.gameState.attempts % 5 === 0) {
      this.analyzeAndAdjustDifficulty().catch(error => {
        console.warn('自適應難度分析失敗:', error);
      });
    }

    // 清空選中項目
    this.gameState.selectedItems = [];

    // 檢查遊戲是否完成
    this.checkGameCompletion();

    this.notifyGameStateListeners();
  }

  /**
   * 處理正確配對
   */
  private handleCorrectMatch(pair: MatchPair): void {
    if (!this.gameState) return;

    // 更新配對狀態
    pair.isCorrect = true;
    pair.matchedAt = Date.now();
    pair.attempts = (pair.attempts || 0) + 1;

    // 添加到已配對列表
    this.gameState.matchedPairs.push(pair.id);
    this.gameState.correctMatches++;
    this.gameState.currentStreak++;

    // 更新最佳連續次數
    if (this.gameState.currentStreak > this.gameState.bestStreak) {
      this.gameState.bestStreak = this.gameState.currentStreak;
    }

    // 計算分數（使用增強的計分系統）
    const pairScore = this.calculatePairScore(pair, true);
    this.gameState.score += pairScore;

    // 記錄分數歷史
    this.gameState.scoreHistory = this.gameState.scoreHistory || [];
    this.gameState.scoreHistory.push(pairScore);

    // 播放成功音效
    if (this.gameState.config.enableSound) {
      this.playSound('correct');
    }

    // 通知配對監聽器
    this.notifyMatchListeners(pair, true);
  }

  /**
   * 處理錯誤配對（增強版）
   */
  private handleIncorrectMatch(item1Id: string, item2Id: string): void {
    if (!this.gameState) return;

    // 找到錯誤的項目
    const leftItem = this.findItemById(item1Id);
    const rightItem = this.findItemById(item2Id);

    if (!leftItem || !rightItem) return;

    // 找到正確的配對（如果存在）
    const correctPair = this.gameState.pairs.find(pair =>
      pair.leftItem.id === item1Id || pair.rightItem.id === item1Id
    );

    // 記錄錯誤到分析器
    const errorRecord = this.errorAnalyzer.recordError(
      leftItem,
      rightItem,
      correctPair,
      {
        gameMode: this.gameState.config.mode,
        difficulty: this.gameState.config.difficulty,
        geptLevel: this.gameState.config.geptLevel,
        timeRemaining: this.gameState.timeRemaining || 0,
        currentStreak: this.gameState.currentStreak,
        totalAttempts: this.gameState.attempts
      },
      this.gameState.lastResponseTime || 2000
    );

    // 更新遊戲狀態中的錯誤歷史
    this.gameState.errorHistory = this.gameState.errorHistory || [];
    this.gameState.errorHistory.push(errorRecord);

    // 重置連續次數
    this.gameState.currentStreak = 0;

    // 計算懲罰分數（使用增強的計分系統）
    const penaltyScore = this.calculatePenaltyScore();
    this.gameState.score = Math.max(0, this.gameState.score - penaltyScore);

    // 記錄懲罰分數
    this.gameState.penaltyPoints = (this.gameState.penaltyPoints || 0) + penaltyScore;

    // 記錄記憶學習（錯誤配對）
    this.recordMemoryLearning(correctPair, false, this.gameState.lastResponseTime || 2000);

    // 記錄GEPT學習進度（錯誤配對）
    this.recordGEPTLearningProgress(correctPair, false, this.gameState.lastResponseTime || 2000);

    // 時間懲罰
    if (this.gameState.config.penaltyTime && this.gameState.timeRemaining) {
      this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - this.gameState.config.penaltyTime);
    }

    // 播放錯誤音效
    if (this.gameState.config.enableSound) {
      this.playSound('incorrect');
    }

    // 創建臨時配對對象用於通知
    const tempPair: MatchPair = {
      id: 'temp',
      leftItem: this.findItemById(item1Id)!,
      rightItem: this.findItemById(item2Id)!,
      isCorrect: false,
      attempts: 1
    };

    // 通知配對監聽器
    this.notifyMatchListeners(tempPair, false);
  }

  /**
   * 使用智能提示（增強版）
   */
  useHint(): HintContent | null {
    if (!this.gameState || !this.gameState.config.allowHints || this.gameState.isCompleted) {
      return null;
    }

    // 構建提示請求
    const hintRequest: HintRequest = {
      currentItems: this.getAllItems(),
      availablePairs: this.getUnmatchedPairs(),
      selectedItems: this.gameState.selectedItems,
      gameContext: {
        mode: this.gameState.config.mode,
        difficulty: this.gameState.config.difficulty,
        geptLevel: this.gameState.config.geptLevel,
        timeRemaining: this.gameState.timeRemaining || 0,
        currentStreak: this.gameState.currentStreak,
        totalAttempts: this.gameState.attempts,
        hintsUsed: this.gameState.hintsUsed
      },
      userProfile: {
        errorHistory: this.gameState.errorHistory || [],
        dominantErrorTypes: this.getDominantErrorTypes(),
        learningPreferences: this.getLearningPreferences(),
        skillLevel: this.calculateSkillLevel()
      }
    };

    // 生成智能提示
    const hint = this.hintSystem.generateHint(hintRequest);

    // 更新遊戲狀態
    this.gameState.hintsUsed++;
    this.gameState.currentHint = hint;
    this.gameState.hintHistory = this.gameState.hintHistory || [];
    this.gameState.hintHistory.push(hint);

    // 根據提示級別扣分
    const hintPenalty = this.calculateHintPenalty(hint.level);
    this.gameState.score = Math.max(0, this.gameState.score - hintPenalty);

    // 播放提示音效
    if (this.gameState.config.enableSound && hint.audioCues?.soundEffect) {
      this.playSound(hint.audioCues.soundEffect);
    }

    this.notifyGameStateListeners();

    return hint;
  }

  /**
   * 計算提示懲罰分數
   */
  private calculateHintPenalty(hintLevel: HintLevel): number {
    switch (hintLevel) {
      case HintLevel.SUBTLE: return 5;
      case HintLevel.MODERATE: return 10;
      case HintLevel.STRONG: return 20;
      case HintLevel.DIRECT: return 30;
      default: return 10;
    }
  }

  /**
   * 暫停遊戲
   */
  pauseGame(): void {
    if (!this.gameState || this.gameState.isCompleted) return;

    this.gameState.isPaused = true;
    this.stopTimer();
    this.notifyGameStateListeners();
  }

  /**
   * 恢復遊戲
   */
  resumeGame(): void {
    if (!this.gameState || this.gameState.isCompleted || !this.gameState.isPaused) return;

    this.gameState.isPaused = false;
    if (this.gameState.config.timeLimit && this.gameState.timeRemaining) {
      this.startTimer();
    }
    this.notifyGameStateListeners();
  }

  /**
   * 結束遊戲
   */
  endGame(): MatchGameResult | null {
    if (!this.gameState) return null;

    this.gameState.isCompleted = true;
    this.gameState.endTime = Date.now();
    this.stopTimer();

    const result = this.calculateGameResult();
    this.gameHistory.push(result);
    this.updateAnalytics(result);
    this.saveGameHistory();

    // 播放完成音效
    if (this.gameState.config.enableSound) {
      this.playSound('complete');
    }

    this.notifyGameCompleteListeners(result);
    this.notifyGameStateListeners();

    return result;
  }

  /**
   * 開始計時器（增強版）
   */
  private startTimer(): void {
    if (!this.gameState?.config.timeLimit) return;

    const timerId = setInterval(() => {
      if (!this.gameState || this.gameState.isPaused) return;

      this.gameState.timeRemaining = Math.max(0, (this.gameState.timeRemaining || 0) - 1);

      // 檢查時間警告
      this.checkTimeWarnings();

      // 自適應時間調整
      this.handleAdaptiveTime();

      if (this.gameState.timeRemaining === 0) {
        this.endGame();
      } else {
        this.notifyGameStateListeners();
      }
    }, 1000);

    this.timers.set('main', timerId);
  }

  /**
   * 檢查時間警告
   */
  private checkTimeWarnings(): void {
    if (!this.gameState) return;

    const warningTime = this.gameState.config.warningTime || 30;
    const urgentTime = this.gameState.config.urgentTime || 10;

    // 顯示警告
    if (this.gameState.timeRemaining === warningTime && !this.gameState.timeWarningShown) {
      this.gameState.timeWarningShown = true;
      this.notifyTimeWarning('warning', warningTime);
    }

    // 顯示緊急警告
    if (this.gameState.timeRemaining === urgentTime && !this.gameState.timeUrgentShown) {
      this.gameState.timeUrgentShown = true;
      this.notifyTimeWarning('urgent', urgentTime);
    }
  }

  /**
   * 處理自適應時間
   */
  private handleAdaptiveTime(): void {
    if (!this.gameState || this.gameState.config.timeMode !== 'adaptive') return;

    // 根據表現調整時間
    if (this.gameState.performanceMetrics) {
      const performance = this.gameState.performanceMetrics.accuracy;
      const cognitiveLoad = this.gameState.cognitiveLoadMetrics?.fatigueLevel || 0;

      // 如果表現不佳且認知負荷高，考慮延長時間
      if (performance < 0.6 && cognitiveLoad > 0.7 && this.gameState.timeRemaining < 30) {
        this.extendTime(15, 'adaptive');
      }
    }
  }

  /**
   * 延長時間
   */
  public extendTime(seconds: number, reason: string = 'manual'): boolean {
    if (!this.gameState) return false;

    const maxExtensions = this.gameState.config.maxTimeExtensions || 2;
    const extensionsUsed = this.gameState.timeExtensionsUsed || 0;

    if (extensionsUsed >= maxExtensions) {
      return false; // 已達到最大延長次數
    }

    this.gameState.timeRemaining = (this.gameState.timeRemaining || 0) + seconds;
    this.gameState.timeExtensionsUsed = extensionsUsed + 1;

    // 記錄延長原因
    console.log(`時間延長: +${seconds}秒 (原因: ${reason})`);

    this.notifyGameStateListeners();
    return true;
  }

  /**
   * 通知時間警告
   */
  private notifyTimeWarning(type: 'warning' | 'urgent', timeRemaining: number): void {
    // 播放警告音效
    if (this.gameState?.config.enableSound) {
      this.playSound(type === 'urgent' ? 'urgent' : 'warning');
    }

    // 可以添加其他警告通知邏輯
    console.log(`時間${type === 'urgent' ? '緊急' : ''}警告: 剩餘 ${timeRemaining} 秒`);
  }

  /**
   * 停止計時器
   */
  private stopTimer(): void {
    const timerId = this.timers.get('main');
    if (timerId) {
      clearInterval(timerId);
      this.timers.delete('main');
    }
  }

  /**
   * 檢查遊戲完成
   */
  private checkGameCompletion(): void {
    if (!this.gameState) return;

    const totalPairs = this.gameState.pairs.length;
    const matchedPairs = this.gameState.matchedPairs.length;

    if (matchedPairs === totalPairs) {
      this.endGame();
    }
  }

  /**
   * 計算遊戲結果
   */
  private calculateGameResult(): MatchGameResult {
    if (!this.gameState) throw new Error('遊戲狀態不存在');

    const completionTime = (this.gameState.endTime! - this.gameState.startTime) / 1000;
    const accuracy = this.gameState.attempts > 0 ? (this.gameState.correctMatches / this.gameState.attempts) * 100 : 0;
    const averageResponseTime = completionTime / this.gameState.attempts;

    // 計算記憶保持率（基於錯誤次數和提示使用）
    const memoryRetention = Math.max(0, 100 - (this.gameState.attempts - this.gameState.correctMatches) * 10 - this.gameState.hintsUsed * 5);

    // 計算學習效率（基於時間和準確率）
    const learningEfficiency = (accuracy * 0.7) + ((1000 / completionTime) * 0.3);

    // 生成學習建議
    const recommendations = this.generateRecommendations();

    return {
      gameId: this.gameState.gameId,
      score: this.gameState.score,
      accuracy,
      completionTime,
      totalAttempts: this.gameState.attempts,
      correctMatches: this.gameState.correctMatches,
      hintsUsed: this.gameState.hintsUsed,
      averageResponseTime,
      difficultyLevel: this.gameState.config.difficulty,
      geptLevel: this.gameState.config.geptLevel,
      memoryRetention,
      learningEfficiency,
      recommendations,
      timestamp: Date.now()
    };
  }

  /**
   * 生成學習建議
   */
  private generateRecommendations(): string[] {
    if (!this.gameState) return [];

    const recommendations: string[] = [];
    const accuracy = this.gameState.attempts > 0 ? (this.gameState.correctMatches / this.gameState.attempts) * 100 : 0;

    if (accuracy < 60) {
      recommendations.push('建議降低難度，加強基礎練習');
      recommendations.push('可以使用更多提示來幫助學習');
    } else if (accuracy > 90) {
      recommendations.push('表現優秀！可以嘗試更高難度');
      recommendations.push('建議減少提示使用，挑戰自己');
    }

    if (this.gameState.hintsUsed > this.gameState.pairs.length / 2) {
      recommendations.push('嘗試在不使用提示的情況下完成遊戲');
    }

    if (this.gameState.bestStreak < 3) {
      recommendations.push('專注於提高連續正確配對的次數');
    }

    return recommendations;
  }

  // 輔助方法
  private validateConfig(config: MatchGameConfig): void {
    if (config.pairCount < 4 || config.pairCount > 20) {
      throw new Error('配對數量必須在4-20之間');
    }
    if (config.timeLimit && config.timeLimit < 30) {
      throw new Error('時間限制不能少於30秒');
    }
  }

  private validatePairs(pairs: MatchPair[]): void {
    if (pairs.length === 0) {
      throw new Error('配對數據不能為空');
    }

    for (const pair of pairs) {
      if (!pair.leftItem || !pair.rightItem) {
        throw new Error('配對項目不完整');
      }
    }
  }

  private shufflePairs(pairs: MatchPair[]): MatchPair[] {
    const shuffled = [...pairs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private findPairByItems(item1Id: string, item2Id: string): MatchPair | null {
    if (!this.gameState) return null;

    return this.gameState.pairs.find(pair =>
      (pair.leftItem.id === item1Id && pair.rightItem.id === item2Id) ||
      (pair.leftItem.id === item2Id && pair.rightItem.id === item1Id)
    ) || null;
  }

  private findItemById(itemId: string): MatchItem | null {
    if (!this.gameState) return null;

    for (const pair of this.gameState.pairs) {
      if (pair.leftItem.id === itemId) return pair.leftItem;
      if (pair.rightItem.id === itemId) return pair.rightItem;
    }
    return null;
  }

  private isItemMatched(itemId: string): boolean {
    if (!this.gameState) return false;

    return this.gameState.pairs.some(pair =>
      this.gameState!.matchedPairs.includes(pair.id) &&
      (pair.leftItem.id === itemId || pair.rightItem.id === itemId)
    );
  }

  private getUnmatchedPairs(): MatchPair[] {
    if (!this.gameState) return [];

    return this.gameState.pairs.filter(pair =>
      !this.gameState!.matchedPairs.includes(pair.id)
    );
  }

  private generateGameId(): string {
    return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadGameHistory(): void {
    try {
      const saved = localStorage.getItem('eduCreate_matchGameHistory');
      if (saved) {
        this.gameHistory = JSON.parse(saved);
        this.updateAnalytics();
      }
    } catch (error) {
      console.warn('載入遊戲歷史失敗:', error);
    }
  }

  private saveGameHistory(): void {
    try {
      localStorage.setItem('eduCreate_matchGameHistory', JSON.stringify(this.gameHistory));
    } catch (error) {
      console.warn('保存遊戲歷史失敗:', error);
    }
  }

  private updateAnalytics(newResult?: MatchGameResult): void {
    if (this.gameHistory.length === 0) return;

    const totalGames = this.gameHistory.length;
    const averageScore = this.gameHistory.reduce((sum, result) => sum + result.score, 0) / totalGames;
    const averageAccuracy = this.gameHistory.reduce((sum, result) => sum + result.accuracy, 0) / totalGames;
    const averageCompletionTime = this.gameHistory.reduce((sum, result) => sum + result.completionTime, 0) / totalGames;

    // 計算進步率
    let improvementRate = 0;
    if (totalGames >= 2) {
      const recentGames = this.gameHistory.slice(-5);
      const oldGames = this.gameHistory.slice(0, Math.min(5, totalGames - 5));

      if (oldGames.length > 0) {
        const recentAvg = recentGames.reduce((sum, result) => sum + result.score, 0) / recentGames.length;
        const oldAvg = oldGames.reduce((sum, result) => sum + result.score, 0) / oldGames.length;
        improvementRate = ((recentAvg - oldAvg) / oldAvg) * 100;
      }
    }

    // 學習曲線
    const learningCurve = this.gameHistory.map((result, index) => ({
      gameNumber: index + 1,
      score: result.score,
      accuracy: result.accuracy,
      timestamp: result.timestamp
    }));

    this.analytics = {
      totalGames,
      averageScore,
      averageAccuracy,
      averageCompletionTime,
      improvementRate,
      difficultyProgression: this.gameHistory.map(r => r.difficultyLevel),
      commonMistakes: [], // 需要更複雜的邏輯來計算
      learningCurve,
      memoryRetentionCurve: [] // 需要長期數據來計算
    };
  }

  // 事件監聽器管理
  addGameStateListener(listener: (state: MatchGameState) => void): void {
    this.gameStateListeners.add(listener);
  }

  removeGameStateListener(listener: (state: MatchGameState) => void): void {
    this.gameStateListeners.delete(listener);
  }

  addGameCompleteListener(listener: (result: MatchGameResult) => void): void {
    this.gameCompleteListeners.add(listener);
  }

  removeGameCompleteListener(listener: (result: MatchGameResult) => void): void {
    this.gameCompleteListeners.delete(listener);
  }

  addMatchListener(listener: (pair: MatchPair, isCorrect: boolean) => void): void {
    this.matchListeners.add(listener);
  }

  removeMatchListener(listener: (pair: MatchPair, isCorrect: boolean) => void): void {
    this.matchListeners.delete(listener);
  }

  addErrorListener(listener: (error: string) => void): void {
    this.errorListeners.add(listener);
  }

  removeErrorListener(listener: (error: string) => void): void {
    this.errorListeners.delete(listener);
  }

  // 通知方法
  private notifyGameStateListeners(): void {
    if (this.gameState) {
      this.gameStateListeners.forEach(listener => listener(this.gameState!));
    }
  }

  private notifyGameCompleteListeners(result: MatchGameResult): void {
    this.gameCompleteListeners.forEach(listener => listener(result));
  }

  private notifyMatchListeners(pair: MatchPair, isCorrect: boolean): void {
    this.matchListeners.forEach(listener => listener(pair, isCorrect));
  }

  private notifyErrorListeners(error: string): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  // 公共方法
  getCurrentState(): MatchGameState | null {
    return this.gameState;
  }

  getGameHistory(): MatchGameResult[] {
    return [...this.gameHistory];
  }

  getAnalytics(): MatchGameAnalytics | null {
    return this.analytics;
  }

  /**
   * 清理資源
   */
  destroy(): void {
    // 停止所有計時器
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();

    // 關閉音頻上下文
    if (this.audioContext) {
      this.audioContext.close();
    }

    // 清空監聽器
    this.gameStateListeners.clear();
    this.gameCompleteListeners.clear();
    this.matchListeners.clear();
    this.errorListeners.clear();
  }

  // ==================== 自適應難度系統 ====================

  /**
   * 初始化自適應難度系統
   */
  private initializeAdaptiveDifficulty(): void {
    if (!this.gameState?.config.enableAdaptiveDifficulty) return;

    // 初始化認知負荷指標
    this.gameState.cognitiveLoadMetrics = {
      responseTime: 0,
      errorRate: 0,
      hesitationCount: 0,
      retryCount: 0,
      attentionLevel: 1.0,
      fatigueLevel: 0,
      frustrationLevel: 0
    };

    // 初始化表現指標
    this.gameState.performanceMetrics = {
      accuracy: 0,
      speed: 0,
      consistency: 0,
      improvement: 0,
      engagement: 1.0,
      retention: 0,
      transferability: 0
    };

    // 設置初始難度分數
    this.gameState.currentDifficultyScore = this.getDifficultyScore(this.gameState.config.difficulty);
    this.gameState.difficultyAdjustments = 0;
    this.gameState.responseTimes = [];
    this.gameState.hesitationCount = 0;
  }

  /**
   * 將難度等級轉換為數值分數
   */
  private getDifficultyScore(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'easy': return 0.25;
      case 'medium': return 0.5;
      case 'hard': return 0.75;
      case 'expert': return 1.0;
      default: return 0.5;
    }
  }

  /**
   * 將數值分數轉換為難度等級
   */
  private getDifficultyLevel(score: number): DifficultyLevel {
    if (score <= 0.3) return 'easy';
    if (score <= 0.6) return 'medium';
    if (score <= 0.85) return 'hard';
    return 'expert';
  }

  /**
   * 更新認知負荷指標
   */
  private updateCognitiveLoadMetrics(responseTime: number, isCorrect: boolean): void {
    if (!this.gameState?.cognitiveLoadMetrics || !this.gameState.config.enableAdaptiveDifficulty) return;

    const metrics = this.gameState.cognitiveLoadMetrics;

    // 更新響應時間
    this.gameState.responseTimes = this.gameState.responseTimes || [];
    this.gameState.responseTimes.push(responseTime);

    // 計算平均響應時間
    const avgResponseTime = this.gameState.responseTimes.reduce((sum, time) => sum + time, 0) / this.gameState.responseTimes.length;
    metrics.responseTime = avgResponseTime;

    // 更新錯誤率
    metrics.errorRate = this.gameState.attempts > 0 ?
      (this.gameState.attempts - this.gameState.correctMatches) / this.gameState.attempts : 0;

    // 檢測猶豫（響應時間過長）
    if (responseTime > 5000) { // 5秒以上視為猶豫
      this.gameState.hesitationCount = (this.gameState.hesitationCount || 0) + 1;
      metrics.hesitationCount = this.gameState.hesitationCount;
    }

    // 計算注意力水平（基於響應時間一致性）
    if (this.gameState.responseTimes.length >= 3) {
      const recentTimes = this.gameState.responseTimes.slice(-3);
      const variance = this.calculateVariance(recentTimes);
      metrics.attentionLevel = Math.max(0, 1 - (variance / 10000)); // 標準化到0-1
    }

    // 計算疲勞水平（基於遊戲時長和表現下降）
    const gameTime = (Date.now() - this.gameState.startTime) / 1000;
    metrics.fatigueLevel = Math.min(1, gameTime / 600); // 10分鐘後達到最大疲勞

    // 計算挫折感水平（基於連續錯誤）
    const recentErrors = this.gameState.attempts - this.gameState.correctMatches;
    metrics.frustrationLevel = Math.min(1, recentErrors / 5); // 5次錯誤後達到最大挫折
  }

  /**
   * 更新表現指標
   */
  private updatePerformanceMetrics(): void {
    if (!this.gameState?.performanceMetrics || !this.gameState.config.enableAdaptiveDifficulty) return;

    const metrics = this.gameState.performanceMetrics;

    // 計算準確率
    metrics.accuracy = this.gameState.attempts > 0 ?
      this.gameState.correctMatches / this.gameState.attempts : 0;

    // 計算速度（基於平均響應時間）
    if (this.gameState.responseTimes && this.gameState.responseTimes.length > 0) {
      const avgTime = this.gameState.responseTimes.reduce((sum, time) => sum + time, 0) / this.gameState.responseTimes.length;
      metrics.speed = Math.max(0, 1 - (avgTime / 10000)); // 標準化到0-1
    }

    // 計算一致性（基於響應時間變異）
    if (this.gameState.responseTimes && this.gameState.responseTimes.length >= 3) {
      const variance = this.calculateVariance(this.gameState.responseTimes);
      metrics.consistency = Math.max(0, 1 - (variance / 5000)); // 標準化到0-1
    }

    // 計算參與度（基於連續正確次數和時間）
    metrics.engagement = Math.min(1, (this.gameState.currentStreak + 1) / 5);
  }

  /**
   * 計算數組的變異數
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  /**
   * 分析並調整難度
   */
  private async analyzeAndAdjustDifficulty(userId: string = 'anonymous'): Promise<void> {
    if (!this.gameState?.config.enableAdaptiveDifficulty ||
        !this.gameState.cognitiveLoadMetrics ||
        !this.gameState.performanceMetrics) return;

    // 檢查是否需要調整（避免過於頻繁的調整）
    const timeSinceLastAdjustment = Date.now() - (this.gameState.lastAdjustmentTime || 0);
    if (timeSinceLastAdjustment < 30000) return; // 30秒內不重複調整

    try {
      // 構建學習者狀態
      const learnerState: LearnerState = {
        userId,
        sessionId: this.gameState.gameId,
        currentDifficulty: this.gameState.currentDifficultyScore || 0.5,
        cognitiveLoad: this.gameState.cognitiveLoadMetrics,
        performance: this.gameState.performanceMetrics,
        learningGoals: [`GEPT-${this.gameState.config.geptLevel}`, `Match-${this.gameState.config.mode}`],
        timeConstraints: {
          sessionLength: this.gameState.config.timeLimit || 300,
          remainingTime: this.gameState.timeRemaining || 0
        },
        personalFactors: {
          energyLevel: 1 - (this.gameState.cognitiveLoadMetrics.fatigueLevel || 0),
          motivationLevel: this.gameState.performanceMetrics.engagement || 0.5,
          stressLevel: this.gameState.cognitiveLoadMetrics.frustrationLevel || 0,
          priorKnowledge: 0.5 // 可以從用戶歷史數據獲取
        }
      };

      // 分析難度調整
      const adjustment = await AdaptiveDifficultyAI.analyzeDifficulty(
        learnerState,
        this.gameState.config.difficultyStrategy || DifficultyStrategy.ADAPTIVE
      );

      // 應用調整
      if (adjustment.adjustmentType !== 'maintain') {
        this.applyDifficultyAdjustment(adjustment.recommendedDifficulty);
        this.gameState.difficultyAdjustments = (this.gameState.difficultyAdjustments || 0) + 1;
        this.gameState.lastAdjustmentTime = Date.now();

        console.log(`難度調整: ${adjustment.adjustmentType} -> ${adjustment.recommendedDifficulty.toFixed(2)} (${adjustment.adjustmentReason})`);
      }
    } catch (error) {
      console.warn('自適應難度分析失敗:', error);
    }
  }

  /**
   * 應用難度調整
   */
  private applyDifficultyAdjustment(newDifficultyScore: number): void {
    if (!this.gameState) return;

    this.gameState.currentDifficultyScore = newDifficultyScore;
    const newDifficultyLevel = this.getDifficultyLevel(newDifficultyScore);

    // 更新配置
    this.gameState.config.difficulty = newDifficultyLevel;

    // 根據新難度調整遊戲參數
    this.adjustGameParameters(newDifficultyScore);
  }

  /**
   * 根據難度分數調整遊戲參數
   */
  private adjustGameParameters(difficultyScore: number): void {
    if (!this.gameState) return;

    // 調整配對數量
    const basePairCount = this.gameState.config.pairCount;
    const adjustedPairCount = Math.max(4, Math.min(20,
      Math.round(basePairCount * (0.7 + difficultyScore * 0.6))
    ));

    // 調整時間限制
    if (this.gameState.config.timeLimit) {
      const baseTimeLimit = this.gameState.config.timeLimit;
      const adjustedTimeLimit = Math.max(60, Math.round(
        baseTimeLimit * (1.5 - difficultyScore * 0.5)
      ));
      this.gameState.config.timeLimit = adjustedTimeLimit;
    }

    // 調整提示可用性
    this.gameState.config.allowHints = difficultyScore < 0.7;

    // 調整懲罰時間
    if (this.gameState.config.penaltyTime) {
      this.gameState.config.penaltyTime = Math.round(5 + difficultyScore * 10);
    }

    console.log(`遊戲參數已調整: 配對數=${adjustedPairCount}, 時間=${this.gameState.config.timeLimit}s, 提示=${this.gameState.config.allowHints}`);
  }

  // ==================== 增強計分系統 ====================

  /**
   * 計算配對分數
   */
  private calculatePairScore(pair: MatchPair, isCorrect: boolean): number {
    if (!this.gameState) return 0;

    const config = this.gameState.config;
    const scoringMode = config.scoringMode || 'standard';
    const baseScore = config.baseScore || 100;

    let score = 0;

    switch (scoringMode) {
      case 'standard':
        score = this.calculateStandardScore(baseScore, isCorrect);
        break;
      case 'time-based':
        score = this.calculateTimeBasedScore(baseScore, isCorrect);
        break;
      case 'streak-based':
        score = this.calculateStreakBasedScore(baseScore, isCorrect);
        break;
      case 'accuracy-based':
        score = this.calculateAccuracyBasedScore(baseScore, isCorrect);
        break;
      case 'adaptive':
        score = this.calculateAdaptiveScore(baseScore, isCorrect);
        break;
      case 'competitive':
        score = this.calculateCompetitiveScore(baseScore, isCorrect);
        break;
      default:
        score = this.calculateStandardScore(baseScore, isCorrect);
    }

    // 記錄完美配對
    if (isCorrect && this.gameState.lastResponseTime && this.gameState.lastResponseTime < 2000) {
      this.gameState.perfectPairs = (this.gameState.perfectPairs || 0) + 1;
    }

    return Math.round(score);
  }

  /**
   * 標準計分模式
   */
  private calculateStandardScore(baseScore: number, isCorrect: boolean): number {
    if (!isCorrect || !this.gameState) return 0;

    let score = baseScore;

    // 連續獎勵
    const streakMultiplier = this.gameState.config.streakMultiplier || 1.1;
    if (this.gameState.currentStreak > 1) {
      const streakBonus = (this.gameState.currentStreak - 1) * (baseScore * (streakMultiplier - 1));
      score += streakBonus;
      this.gameState.streakBonus = (this.gameState.streakBonus || 0) + streakBonus;
    }

    // 時間獎勵
    if (this.gameState.config.timeBonus && this.gameState.timeRemaining) {
      const timeBonus = Math.floor(this.gameState.timeRemaining / 10);
      score += timeBonus;
      this.gameState.timeBonus = (this.gameState.timeBonus || 0) + timeBonus;
    }

    return score;
  }

  /**
   * 時間基礎計分模式
   */
  private calculateTimeBasedScore(baseScore: number, isCorrect: boolean): number {
    if (!isCorrect || !this.gameState) return 0;

    const responseTime = this.gameState.lastResponseTime || 5000;
    const maxTime = 10000; // 10秒最大時間
    const timeRatio = Math.max(0, (maxTime - responseTime) / maxTime);

    return baseScore * (0.5 + timeRatio * 0.5); // 50%-100%分數範圍
  }

  /**
   * 連續基礎計分模式
   */
  private calculateStreakBasedScore(baseScore: number, isCorrect: boolean): number {
    if (!isCorrect || !this.gameState) return 0;

    const streakMultiplier = this.gameState.config.streakMultiplier || 1.2;
    const maxMultiplier = 3.0; // 最大3倍獎勵

    const multiplier = Math.min(maxMultiplier, 1 + (this.gameState.currentStreak * (streakMultiplier - 1)));
    return baseScore * multiplier;
  }

  /**
   * 準確率基礎計分模式
   */
  private calculateAccuracyBasedScore(baseScore: number, isCorrect: boolean): number {
    if (!isCorrect || !this.gameState) return 0;

    const accuracy = this.gameState.attempts > 0 ?
      this.gameState.correctMatches / this.gameState.attempts : 1;

    // 準確率越高，分數越高
    const accuracyMultiplier = 0.5 + (accuracy * 1.5); // 0.5x - 2x 倍數
    return baseScore * accuracyMultiplier;
  }

  /**
   * 自適應計分模式
   */
  private calculateAdaptiveScore(baseScore: number, isCorrect: boolean): number {
    if (!isCorrect || !this.gameState) return 0;

    let score = baseScore;

    // 根據難度調整分數
    const difficultyScore = this.gameState.currentDifficultyScore || 0.5;
    score *= (0.8 + difficultyScore * 0.4); // 0.8x - 1.2x 倍數

    // 根據認知負荷調整分數
    if (this.gameState.cognitiveLoadMetrics) {
      const cognitiveLoad = this.gameState.cognitiveLoadMetrics.responseTime / 10000;
      score *= (1.2 - cognitiveLoad * 0.4); // 認知負荷越高，分數調整越小
    }

    return score;
  }

  /**
   * 競技計分模式
   */
  private calculateCompetitiveScore(baseScore: number, isCorrect: boolean): number {
    if (!isCorrect || !this.gameState) return 0;

    let score = baseScore;

    // 完美配對獎勵
    if (this.gameState.lastResponseTime && this.gameState.lastResponseTime < 1500) {
      score *= 1.5; // 完美配對1.5倍獎勵
    }

    // 連續完美配對獎勵
    const perfectPairs = this.gameState.perfectPairs || 0;
    if (perfectPairs > 0) {
      score *= (1 + perfectPairs * 0.1); // 每個完美配對增加10%獎勵
    }

    return score;
  }

  /**
   * 計算懲罰分數
   */
  private calculatePenaltyScore(): number {
    if (!this.gameState) return 10;

    const config = this.gameState.config;
    const scoringMode = config.scoringMode || 'standard';
    let penalty = 10; // 基礎懲罰

    switch (scoringMode) {
      case 'standard':
        penalty = 10;
        break;
      case 'time-based':
        // 時間模式下懲罰較輕
        penalty = 5;
        break;
      case 'streak-based':
        // 連續模式下懲罰較重（因為會重置連續）
        penalty = 15 + (this.gameState.currentStreak * 5);
        break;
      case 'accuracy-based':
        // 準確率模式下懲罰根據當前準確率調整
        const accuracy = this.gameState.attempts > 0 ?
          this.gameState.correctMatches / this.gameState.attempts : 1;
        penalty = Math.round(20 * (1 - accuracy));
        break;
      case 'adaptive':
        // 自適應模式下根據難度調整懲罰
        const difficultyScore = this.gameState.currentDifficultyScore || 0.5;
        penalty = Math.round(10 * (0.5 + difficultyScore * 0.5));
        break;
      case 'competitive':
        // 競技模式下懲罰較重
        penalty = 20;
        break;
    }

    return penalty;
  }

  /**
   * 計算最終獎勵分數
   */
  private calculateFinalBonuses(): number {
    if (!this.gameState) return 0;

    let totalBonus = 0;

    // 完美遊戲獎勵（無錯誤）
    if (this.gameState.attempts === this.gameState.correctMatches &&
        this.gameState.config.perfectGameBonus) {
      totalBonus += this.gameState.config.perfectGameBonus;
    }

    // 準確率獎勵
    if (this.gameState.config.accuracyBonus) {
      const accuracy = this.gameState.attempts > 0 ?
        this.gameState.correctMatches / this.gameState.attempts : 0;
      if (accuracy >= 0.9) {
        totalBonus += Math.round(this.gameState.score * 0.1); // 10%獎勵
      }
    }

    // 時間獎勵
    if (this.gameState.config.timeBonus && this.gameState.timeRemaining) {
      const timeRatio = this.gameState.timeRemaining / (this.gameState.config.timeLimit || 120);
      if (timeRatio > 0.5) {
        totalBonus += Math.round(this.gameState.score * timeRatio * 0.1);
      }
    }

    return totalBonus;
  }

  /**
   * 獲取計分統計
   */
  public getScoringStatistics(): any {
    if (!this.gameState) return null;

    return {
      totalScore: this.gameState.score,
      baseScore: this.gameState.scoreHistory?.reduce((sum, score) => sum + score, 0) || 0,
      bonusPoints: this.gameState.bonusPoints || 0,
      penaltyPoints: this.gameState.penaltyPoints || 0,
      streakBonus: this.gameState.streakBonus || 0,
      timeBonus: this.gameState.timeBonus || 0,
      accuracyBonus: this.gameState.accuracyBonus || 0,
      perfectPairs: this.gameState.perfectPairs || 0,
      scoringMode: this.gameState.config.scoringMode || 'standard',
      scoreHistory: this.gameState.scoreHistory || []
    };
  }

  // ==================== 錯誤分析和提示系統輔助方法 ====================

  /**
   * 獲取所有項目
   */
  private getAllItems(): MatchItem[] {
    if (!this.gameState) return [];

    const items: MatchItem[] = [];
    this.gameState.pairs.forEach(pair => {
      items.push(pair.leftItem, pair.rightItem);
    });
    return items;
  }

  /**
   * 根據ID查找項目
   */
  private findItemById(itemId: string): MatchItem | undefined {
    if (!this.gameState) return undefined;

    for (const pair of this.gameState.pairs) {
      if (pair.leftItem.id === itemId) return pair.leftItem;
      if (pair.rightItem.id === itemId) return pair.rightItem;
    }
    return undefined;
  }

  /**
   * 獲取主要錯誤類型
   */
  private getDominantErrorTypes(): ErrorType[] {
    if (!this.gameState?.errorHistory) return [];

    const errorCounts = new Map<ErrorType, number>();
    this.gameState.errorHistory.forEach(error => {
      errorCounts.set(error.errorType, (errorCounts.get(error.errorType) || 0) + 1);
    });

    return Array.from(errorCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  /**
   * 獲取學習偏好
   */
  private getLearningPreferences(): string[] {
    // 簡化實現：基於遊戲模式推斷學習偏好
    const preferences: string[] = [];

    if (this.gameState?.config.mode.includes('image')) {
      preferences.push('visual');
    }
    if (this.gameState?.config.mode.includes('audio')) {
      preferences.push('auditory');
    }
    if (this.gameState?.config.mode.includes('text')) {
      preferences.push('textual');
    }

    return preferences;
  }

  /**
   * 計算技能水平
   */
  private calculateSkillLevel(): number {
    if (!this.gameState) return 0.5;

    const accuracy = this.gameState.attempts > 0 ?
      this.gameState.correctMatches / this.gameState.attempts : 0;
    const speedFactor = this.gameState.responseTimes && this.gameState.responseTimes.length > 0 ?
      Math.max(0, 1 - (this.gameState.responseTimes.reduce((sum, time) => sum + time, 0) / this.gameState.responseTimes.length) / 10000) : 0.5;

    return (accuracy * 0.7 + speedFactor * 0.3);
  }

  /**
   * 生成錯誤分析報告
   */
  public generateErrorAnalysisReport(): ErrorAnalysisResult | null {
    if (!this.gameState?.errorHistory || this.gameState.errorHistory.length === 0) {
      return null;
    }

    return this.errorAnalyzer.analyzePatterns();
  }

  /**
   * 獲取個人化學習建議
   */
  public getPersonalizedRecommendations(): string[] {
    const analysisResult = this.generateErrorAnalysisReport();
    if (!analysisResult) {
      return ['繼續練習，保持良好的學習習慣！'];
    }

    const recommendations: string[] = [];

    // 基於錯誤分析的建議
    recommendations.push(...analysisResult.recommendations);

    // 基於學習差距的建議
    if (analysisResult.learningGaps.length > 0) {
      recommendations.push('重點關注以下領域：' + analysisResult.learningGaps.join('、'));
    }

    // 基於優勢的鼓勵
    if (analysisResult.strengths.length > 0) {
      recommendations.push('你的優勢：' + analysisResult.strengths.join('、'));
    }

    return recommendations;
  }

  /**
   * 評估提示效果
   */
  public evaluateHintEffectiveness(hintId: string, wasSuccessful: boolean): void {
    this.hintSystem.evaluateHintEffectiveness(hintId, wasSuccessful);
  }

  /**
   * 獲取提示統計
   */
  public getHintStatistics(): any {
    return this.hintSystem.getHintStatistics();
  }

  /**
   * 獲取錯誤分析統計
   */
  public getErrorAnalysisStatistics(): any {
    const analysisResult = this.generateErrorAnalysisReport();
    if (!analysisResult) return null;

    return {
      totalErrors: analysisResult.totalErrors,
      errorRate: analysisResult.errorRate,
      dominantErrorTypes: analysisResult.dominantErrorTypes,
      patterns: analysisResult.patterns,
      insights: analysisResult.insights
    };
  }

  // ==================== 記憶曲線追蹤系統 ====================

  /**
   * 初始化記憶追蹤系統
   */
  private initializeMemoryTracking(userId: string): void {
    if (!this.gameState) return;

    // 獲取用戶的記憶項目
    this.gameState.memoryItems = this.memoryCurveTracker.getUserMemoryItems(userId);

    // 分析記憶狀況
    this.gameState.memoryAnalysis = this.memoryCurveTracker.analyzeUserMemory(userId);

    // 生成學習計劃
    this.gameState.learningPlan = this.spacedRepetitionAlgorithm.generateLearningPlan(userId, {
      dailyStudyTime: 30, // 30分鐘
      maxNewItems: 10,
      maxReviewItems: 20,
      difficultyPreference: 'balanced'
    });

    // 獲取復習計劃
    this.gameState.reviewSchedule = this.gameState.learningPlan.scheduledReviews;

    console.log(`記憶追蹤初始化完成: ${this.gameState.memoryItems.length} 個記憶項目`);
  }

  /**
   * 記錄記憶學習
   */
  private recordMemoryLearning(
    pair: MatchPair | undefined,
    isCorrect: boolean,
    responseTime: number
  ): void {
    if (!this.gameState || !pair) return;

    const userId = this.gameState.gameId; // 使用遊戲ID作為用戶ID
    const contentId = `${pair.leftItem.content}_${pair.rightItem.content}`;

    // 檢查是否已存在記憶項目
    const existingMemoryItem = this.memoryCurveTracker.getUserMemoryItems(userId)
      .find(item => item.contentId === contentId);

    if (existingMemoryItem) {
      // 記錄復習結果
      const updatedItem = this.memoryCurveTracker.recordReviewResult(userId, contentId, {
        isCorrect,
        responseTime,
        confidence: this.calculateConfidence(isCorrect, responseTime)
      });

      if (updatedItem) {
        console.log(`記憶復習記錄: ${contentId}, 正確: ${isCorrect}, 記憶強度: ${updatedItem.memoryStrength.toFixed(2)}`);
      }
    } else {
      // 記錄新學習
      const newMemoryItem = this.memoryCurveTracker.recordNewLearning(
        userId,
        contentId,
        {
          gameMode: this.gameState.config.mode,
          difficultyLevel: this.gameState.config.difficulty,
          geptLevel: this.gameState.config.geptLevel
        },
        {
          isCorrect,
          responseTime,
          confidence: this.calculateConfidence(isCorrect, responseTime)
        }
      );

      console.log(`新記憶學習記錄: ${contentId}, 初始強度: ${newMemoryItem.memoryStrength.toFixed(2)}`);
    }

    // 更新遊戲狀態中的記憶數據
    this.updateGameStateMemoryData(userId);
  }

  /**
   * 計算用戶信心度
   */
  private calculateConfidence(isCorrect: boolean, responseTime: number): number {
    let confidence = 0.5; // 基礎信心度

    // 基於正確性調整
    if (isCorrect) {
      confidence += 0.3;
    } else {
      confidence -= 0.2;
    }

    // 基於響應時間調整（快速響應表示更高信心）
    if (responseTime < 2000) {
      confidence += 0.2;
    } else if (responseTime > 5000) {
      confidence -= 0.1;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * 更新遊戲狀態中的記憶數據
   */
  private updateGameStateMemoryData(userId: string): void {
    if (!this.gameState) return;

    // 更新記憶項目
    this.gameState.memoryItems = this.memoryCurveTracker.getUserMemoryItems(userId);

    // 更新記憶分析
    this.gameState.memoryAnalysis = this.memoryCurveTracker.analyzeUserMemory(userId);

    // 更新學習計劃
    const currentPlan = this.spacedRepetitionAlgorithm.getCurrentLearningPlan(userId);
    if (currentPlan) {
      this.gameState.learningPlan = currentPlan;
      this.gameState.reviewSchedule = currentPlan.scheduledReviews;
    }
  }

  /**
   * 開始復習會話
   */
  public startReviewSession(userId: string): ReviewSession | null {
    const learningPlan = this.spacedRepetitionAlgorithm.getCurrentLearningPlan(userId);
    if (!learningPlan || learningPlan.priorityItems.length === 0) {
      return null;
    }

    const session = this.spacedRepetitionAlgorithm.startReviewSession(userId, learningPlan.priorityItems);

    if (this.gameState) {
      this.gameState.currentReviewSession = session;
    }

    return session;
  }

  /**
   * 結束復習會話
   */
  public endReviewSession(sessionId: string): ReviewSession | null {
    try {
      const session = this.spacedRepetitionAlgorithm.endReviewSession(sessionId);

      if (this.gameState && this.gameState.currentReviewSession?.id === sessionId) {
        this.gameState.currentReviewSession = undefined;
      }

      return session;
    } catch (error) {
      console.error('結束復習會話失敗:', error);
      return null;
    }
  }

  /**
   * 獲取記憶統計
   */
  public getMemoryStatistics(userId: string): any {
    return this.memoryCurveTracker.getMemoryStatistics(userId);
  }

  /**
   * 獲取復習統計
   */
  public getReviewStatistics(userId: string): any {
    return this.spacedRepetitionAlgorithm.getUserReviewStatistics(userId);
  }

  /**
   * 獲取學習計劃
   */
  public getLearningPlan(userId: string): LearningPlan | null {
    return this.spacedRepetitionAlgorithm.getCurrentLearningPlan(userId);
  }

  /**
   * 獲取需要復習的項目
   */
  public getItemsDueForReview(userId: string): MemoryItem[] {
    return this.memoryCurveTracker.getItemsDueForReview(userId);
  }

  /**
   * 獲取逾期復習的項目
   */
  public getOverdueItems(userId: string): MemoryItem[] {
    return this.memoryCurveTracker.getOverdueItems(userId);
  }

  /**
   * 分析記憶曲線
   */
  public analyzeMemoryCurve(userId: string): MemoryAnalysisResult {
    return this.memoryCurveTracker.analyzeUserMemory(userId);
  }

  /**
   * 生成記憶報告
   */
  public generateMemoryReport(userId: string): any {
    const memoryStats = this.getMemoryStatistics(userId);
    const reviewStats = this.getReviewStatistics(userId);
    const memoryAnalysis = this.analyzeMemoryCurve(userId);
    const learningPlan = this.getLearningPlan(userId);

    return {
      memoryStatistics: memoryStats,
      reviewStatistics: reviewStats,
      memoryAnalysis: memoryAnalysis,
      learningPlan: learningPlan,
      dueItems: this.getItemsDueForReview(userId),
      overdueItems: this.getOverdueItems(userId),
      generatedAt: Date.now()
    };
  }

  // ==================== GEPT分級適配系統 ====================

  /**
   * 初始化GEPT分級適配系統
   */
  private initializeGEPTAdaptation(userId: string): void {
    if (!this.gameState) return;

    // 創建或獲取學習者檔案
    let learnerProfile = this.geptAdaptationEngine.getLearnerProfile(userId);
    if (!learnerProfile) {
      learnerProfile = this.geptAdaptationEngine.createLearnerProfile(userId,
        this.gameState.config.geptLevel || 'elementary',
        {
          preferredDifficulty: this.gameState.config.difficulty === 'easy' ? 'easy' :
                              this.gameState.config.difficulty === 'hard' ? 'hard' : 'medium',
          learningPace: 'normal',
          focusAreas: ['vocabulary'],
          adaptationSensitivity: 0.7
        }
      );
    }

    // 分析詞彙狀況
    const vocabularyAnalysis = this.vocabularyDifficultyManager.analyzeUserVocabulary(userId);

    // 評估等級轉換準備度
    const levelTransitionRecommendation = this.crossLevelLearningManager.assessLevelTransitionReadiness(
      learnerProfile,
      vocabularyAnalysis
    );

    // 適配當前內容
    const contentAdaptation = this.adaptGameContent(learnerProfile);

    // 更新遊戲狀態
    this.gameState.learnerProfile = learnerProfile;
    this.gameState.vocabularyAnalysis = vocabularyAnalysis;
    this.gameState.levelTransitionRecommendation = levelTransitionRecommendation;
    this.gameState.contentAdaptation = contentAdaptation;

    console.log(`GEPT分級適配初始化完成: ${learnerProfile.currentLevel} -> ${levelTransitionRecommendation.recommendedLevel}`);
  }

  /**
   * 適配遊戲內容
   */
  private adaptGameContent(learnerProfile: LearnerProfile): ContentAdaptationResult | undefined {
    if (!this.gameState || !this.gameState.pairs) return undefined;

    // 提取遊戲內容
    const gameContent = this.gameState.pairs.map(pair =>
      `${pair.leftItem.content} - ${pair.rightItem.content}`
    ).join('. ');

    // 適配內容
    const adaptationResult = this.geptAdaptationEngine.adaptContent(
      gameContent,
      learnerProfile.currentLevel,
      AdaptationStrategy.BALANCED,
      learnerProfile
    );

    // 生成詞彙替換建議
    const vocabularyReplacements = this.vocabularyDifficultyManager.adjustVocabularyDifficulty(
      gameContent,
      learnerProfile.currentLevel,
      DifficultyAdjustmentMode.ADAPTIVE,
      learnerProfile.userId
    );

    this.gameState.vocabularyReplacements = vocabularyReplacements;

    return adaptationResult;
  }

  /**
   * 記錄GEPT學習進度
   */
  private recordGEPTLearningProgress(
    pair: MatchPair | undefined,
    isCorrect: boolean,
    responseTime: number
  ): void {
    if (!this.gameState || !pair || !this.gameState.learnerProfile) return;

    const userId = this.gameState.learnerProfile.userId;
    const words = [pair.leftItem.content, pair.rightItem.content];

    // 記錄詞彙學習
    words.forEach(word => {
      this.vocabularyDifficultyManager.recordVocabularyLearning(
        userId,
        word,
        isCorrect,
        responseTime
      );
    });

    // 更新學習進度
    const learningProgress = {
      timestamp: Date.now(),
      level: this.gameState.learnerProfile.currentLevel,
      activity: 'match_game',
      score: this.gameState.score,
      accuracy: this.gameState.correctMatches / Math.max(1, this.gameState.attempts),
      timeSpent: (this.gameState.config.timeLimit || 120) - (this.gameState.timeRemaining || 0),
      wordsLearned: isCorrect ? words : [],
      difficultWords: isCorrect ? [] : words
    };

    this.geptAdaptationEngine.updateLearningProgress(userId, learningProgress);

    // 更新遊戲狀態中的GEPT數據
    this.updateGameStateGEPTData(userId);
  }

  /**
   * 更新遊戲狀態中的GEPT數據
   */
  private updateGameStateGEPTData(userId: string): void {
    if (!this.gameState) return;

    // 更新學習者檔案
    this.gameState.learnerProfile = this.geptAdaptationEngine.getLearnerProfile(userId);

    // 更新詞彙分析
    this.gameState.vocabularyAnalysis = this.vocabularyDifficultyManager.analyzeUserVocabulary(userId);

    // 重新評估等級轉換準備度
    if (this.gameState.learnerProfile && this.gameState.vocabularyAnalysis) {
      this.gameState.levelTransitionRecommendation = this.crossLevelLearningManager.assessLevelTransitionReadiness(
        this.gameState.learnerProfile,
        this.gameState.vocabularyAnalysis
      );
    }
  }

  /**
   * 調整遊戲難度基於GEPT等級
   */
  public adjustGameDifficultyByGEPT(targetLevel: GEPTLevel): void {
    if (!this.gameState) return;

    // 更新配置
    this.gameState.config.geptLevel = targetLevel;

    // 重新生成適合等級的配對
    this.generateGEPTLevelPairs(targetLevel);

    // 調整遊戲參數
    this.adjustGameParametersByLevel(targetLevel);

    console.log(`遊戲難度已調整至 ${targetLevel} 等級`);
  }

  /**
   * 生成GEPT等級配對
   */
  private generateGEPTLevelPairs(level: GEPTLevel): void {
    if (!this.gameState) return;

    // 從GEPT管理器獲取適合等級的詞彙
    const levelWords = this.geptManager.getWordsByLevel(level);

    if (levelWords.length >= 4) {
      // 隨機選擇詞彙創建配對
      const selectedWords = this.shuffleArray([...levelWords]).slice(0, 4);

      this.gameState.pairs = selectedWords.map((word, index) => ({
        id: `pair_${index}`,
        leftItem: {
          id: `left_${index}`,
          content: word.word,
          type: 'text'
        },
        rightItem: {
          id: `right_${index}`,
          content: word.translation,
          type: 'text'
        },
        isMatched: false
      }));

      // 重新洗牌項目
      this.gameState.leftItems = this.shuffleArray(this.gameState.pairs.map(p => p.leftItem));
      this.gameState.rightItems = this.shuffleArray(this.gameState.pairs.map(p => p.rightItem));
    }
  }

  /**
   * 根據等級調整遊戲參數
   */
  private adjustGameParametersByLevel(level: GEPTLevel): void {
    if (!this.gameState) return;

    switch (level) {
      case 'elementary':
        this.gameState.config.timeLimit = 180; // 3分鐘
        this.gameState.config.maxHints = 5;
        this.gameState.config.penaltyTime = 5;
        break;
      case 'intermediate':
        this.gameState.config.timeLimit = 120; // 2分鐘
        this.gameState.config.maxHints = 3;
        this.gameState.config.penaltyTime = 10;
        break;
      case 'high-intermediate':
        this.gameState.config.timeLimit = 90; // 1.5分鐘
        this.gameState.config.maxHints = 2;
        this.gameState.config.penaltyTime = 15;
        break;
    }

    this.gameState.timeRemaining = this.gameState.config.timeLimit;
  }

  /**
   * 獲取GEPT學習建議
   */
  public getGEPTLearningRecommendations(userId: string): any {
    const learnerProfile = this.geptAdaptationEngine.getLearnerProfile(userId);
    const vocabularyAnalysis = this.vocabularyDifficultyManager.analyzeUserVocabulary(userId);

    if (!learnerProfile || !vocabularyAnalysis) {
      return {
        recommendations: ['開始學習以建立GEPT分析數據'],
        levelTransition: null,
        vocabularyFocus: [],
        crossLevelPlan: null
      };
    }

    const levelTransition = this.crossLevelLearningManager.assessLevelTransitionReadiness(
      learnerProfile,
      vocabularyAnalysis
    );

    return {
      recommendations: levelTransition.reasons,
      levelTransition,
      vocabularyFocus: vocabularyAnalysis.recommendedFocus,
      crossLevelPlan: this.crossLevelLearningManager.getLearningPlan(userId)
    };
  }

  /**
   * 創建跨等級學習計劃
   */
  public createCrossLevelLearningPlan(
    userId: string,
    targetLevel: GEPTLevel
  ): CrossLevelLearningPlan | null {
    const learnerProfile = this.geptAdaptationEngine.getLearnerProfile(userId);
    if (!learnerProfile) return null;

    return this.crossLevelLearningManager.createCrossLevelLearningPlan(
      userId,
      learnerProfile.currentLevel,
      targetLevel,
      learnerProfile
    );
  }

  /**
   * 獲取詞彙替換建議
   */
  public getVocabularyReplacements(userId: string): VocabularyReplacement[] {
    return this.gameState?.vocabularyReplacements || [];
  }

  /**
   * 應用詞彙替換
   */
  public applyVocabularyReplacement(
    originalWord: string,
    replacementWord: string
  ): boolean {
    if (!this.gameState || !this.gameState.pairs) return false;

    let applied = false;

    // 在配對中查找並替換詞彙
    this.gameState.pairs.forEach(pair => {
      if (pair.leftItem.content.toLowerCase() === originalWord.toLowerCase()) {
        pair.leftItem.content = replacementWord;
        applied = true;
      }
      if (pair.rightItem.content.toLowerCase() === originalWord.toLowerCase()) {
        pair.rightItem.content = replacementWord;
        applied = true;
      }
    });

    // 更新項目列表
    if (applied) {
      this.gameState.leftItems = this.gameState.pairs.map(p => p.leftItem);
      this.gameState.rightItems = this.gameState.pairs.map(p => p.rightItem);
    }

    return applied;
  }

  /**
   * 獲取GEPT統計
   */
  public getGEPTStatistics(userId: string): any {
    const learnerProfile = this.geptAdaptationEngine.getLearnerProfile(userId);
    const vocabularyAnalysis = this.vocabularyDifficultyManager.analyzeUserVocabulary(userId);
    const levelTransition = learnerProfile && vocabularyAnalysis ?
      this.crossLevelLearningManager.assessLevelTransitionReadiness(learnerProfile, vocabularyAnalysis) : null;

    return {
      learnerProfile,
      vocabularyAnalysis,
      levelTransition,
      crossLevelPlan: this.crossLevelLearningManager.getLearningPlan(userId),
      wordsForReview: this.vocabularyDifficultyManager.getWordsForReview(userId)
    };
  }

  /**
   * 生成GEPT報告
   */
  public generateGEPTReport(userId: string): any {
    const geptStats = this.getGEPTStatistics(userId);
    const recommendations = this.getGEPTLearningRecommendations(userId);

    return {
      geptStatistics: geptStats,
      learningRecommendations: recommendations,
      contentAdaptation: this.gameState?.contentAdaptation,
      vocabularyReplacements: this.gameState?.vocabularyReplacements,
      generatedAt: Date.now()
    };
  }
}