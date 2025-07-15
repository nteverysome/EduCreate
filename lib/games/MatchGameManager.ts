/**
 * MatchGameManager - Match配對遊戲管理器
 * 基於記憶科學原理的配對遊戲，支持多種配對模式和智能適配
 */

export type MatchMode = 'text-text' | 'text-image' | 'image-image' | 'audio-text' | 'text-audio' | 'mixed';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export type GEPTLevel = 'elementary' | 'intermediate' | 'high-intermediate';

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
    console.log('MatchGameManager 構造函數完成');
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

    // 添加到選中列表
    this.gameState.selectedItems.push(itemId);

    // 如果選中了兩個項目，檢查配對
    if (this.gameState.selectedItems.length === 2) {
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

    if (pair) {
      // 配對成功
      this.handleCorrectMatch(pair);
    } else {
      // 配對失敗
      this.handleIncorrectMatch(item1Id, item2Id);
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

    // 計算分數
    const baseScore = 100;
    const streakBonus = this.gameState.currentStreak > 1 ? (this.gameState.currentStreak - 1) * 10 : 0;
    const timeBonus = this.gameState.config.timeLimit && this.gameState.timeRemaining
      ? Math.floor(this.gameState.timeRemaining / 10)
      : 0;

    const pairScore = baseScore + streakBonus + timeBonus;
    this.gameState.score += pairScore;

    // 播放成功音效
    if (this.gameState.config.enableSound) {
      this.playSound('correct');
    }

    // 通知配對監聽器
    this.notifyMatchListeners(pair, true);
  }

  /**
   * 處理錯誤配對
   */
  private handleIncorrectMatch(item1Id: string, item2Id: string): void {
    if (!this.gameState) return;

    // 重置連續次數
    this.gameState.currentStreak = 0;

    // 扣分
    this.gameState.score = Math.max(0, this.gameState.score - 10);

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
   * 使用提示
   */
  useHint(): string | null {
    if (!this.gameState || !this.gameState.config.allowHints || this.gameState.isCompleted) {
      return null;
    }

    // 找到未配對的項目
    const unmatched = this.getUnmatchedPairs();
    if (unmatched.length === 0) return null;

    // 選擇一個隨機的未配對項目
    const randomPair = unmatched[Math.floor(Math.random() * unmatched.length)];

    // 標記提示已使用
    randomPair.hintUsed = true;
    this.gameState.hintsUsed++;
    this.gameState.score = Math.max(0, this.gameState.score - 20); // 提示扣分

    // 播放提示音效
    if (this.gameState.config.enableSound) {
      this.playSound('hint');
    }

    this.notifyGameStateListeners();

    // 返回提示內容
    return randomPair.leftItem.hint || randomPair.rightItem.hint ||
           `這兩個項目是一對：${randomPair.leftItem.displayText || randomPair.leftItem.content} 和 ${randomPair.rightItem.displayText || randomPair.rightItem.content}`;
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
   * 開始計時器
   */
  private startTimer(): void {
    if (!this.gameState?.config.timeLimit) return;

    const timerId = setInterval(() => {
      if (!this.gameState || this.gameState.isPaused) return;

      this.gameState.timeRemaining = Math.max(0, (this.gameState.timeRemaining || 0) - 1);

      if (this.gameState.timeRemaining === 0) {
        this.endGame();
      } else {
        this.notifyGameStateListeners();
      }
    }, 1000);

    this.timers.set('main', timerId);
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
}