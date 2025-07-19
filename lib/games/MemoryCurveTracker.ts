/**
 * 記憶曲線追蹤器
 * 基於 Ebbinghaus 遺忘曲線和現代記憶科學研究的記憶追蹤系統
 */

import { MatchItem, MatchPair } from './MatchGameManager';

// 記憶項目狀態
export enum MemoryItemStatus {
  NEW = 'new',           // 新學習
  LEARNING = 'learning', // 學習中
  REVIEW = 'review',     // 復習中
  MATURE = 'mature',     // 已掌握
  FORGOTTEN = 'forgotten' // 已遺忘
}

// 記憶強度等級
export enum MemoryStrengthLevel {
  VERY_WEAK = 'very_weak',     // 非常弱 (0-0.2)
  WEAK = 'weak',               // 弱 (0.2-0.4)
  MODERATE = 'moderate',       // 中等 (0.4-0.6)
  STRONG = 'strong',           // 強 (0.6-0.8)
  VERY_STRONG = 'very_strong'  // 非常強 (0.8-1.0)
}

// 記憶項目
export interface MemoryItem {
  id: string;
  contentId: string; // 關聯的學習內容ID
  userId: string;
  status: MemoryItemStatus;
  memoryStrength: number; // 記憶強度 (0-1)
  strengthLevel: MemoryStrengthLevel;
  
  // 學習歷史
  firstLearnedAt: number; // 首次學習時間
  lastReviewedAt: number; // 最後復習時間
  nextReviewAt: number;   // 下次復習時間
  
  // 統計數據
  totalReviews: number;   // 總復習次數
  correctReviews: number; // 正確復習次數
  consecutiveCorrect: number; // 連續正確次數
  consecutiveIncorrect: number; // 連續錯誤次數
  
  // 時間間隔
  currentInterval: number; // 當前復習間隔（天）
  previousInterval: number; // 上次復習間隔（天）
  
  // 個人化參數
  difficultyFactor: number; // 難度因子 (1.3-2.5)
  forgettingRate: number;   // 遺忘率 (0-1)
  
  // 上下文信息
  gameMode: string;
  difficultyLevel: string;
  geptLevel?: string;
  
  // 記憶曲線數據
  memoryCurvePoints: MemoryCurvePoint[];
}

// 記憶曲線點
export interface MemoryCurvePoint {
  timestamp: number;
  memoryStrength: number;
  reviewResult: boolean; // true=正確, false=錯誤
  responseTime: number;
  confidence: number; // 用戶信心度 (0-1)
}

// 遺忘曲線參數
export interface ForgettingCurveParams {
  userId: string;
  initialStrength: number;    // 初始記憶強度
  decayConstant: number;      // 衰減常數
  retentionFactor: number;    // 保持因子
  personalizedMultiplier: number; // 個人化倍數
  lastUpdated: number;
}

// 記憶分析結果
export interface MemoryAnalysisResult {
  totalItems: number;
  itemsByStatus: Record<MemoryItemStatus, number>;
  itemsByStrength: Record<MemoryStrengthLevel, number>;
  averageMemoryStrength: number;
  overallRetentionRate: number;
  forgettingRate: number;
  optimalReviewInterval: number;
  
  // 趨勢分析
  memoryTrend: 'improving' | 'stable' | 'declining';
  strengthTrend: 'increasing' | 'stable' | 'decreasing';
  
  // 預測
  predictedRetention: {
    in1Day: number;
    in3Days: number;
    in7Days: number;
    in30Days: number;
  };
  
  // 建議
  recommendations: string[];
  urgentReviews: MemoryItem[];
  overdueReviews: MemoryItem[];
}

export class MemoryCurveTracker {
  private memoryItems: Map<string, MemoryItem> = new Map();
  private forgettingCurveParams: Map<string, ForgettingCurveParams> = new Map();

  /**
   * 記錄新的學習項目
   */
  recordNewLearning(
    userId: string,
    contentId: string,
    gameContext: {
      gameMode: string;
      difficultyLevel: string;
      geptLevel?: string;
    },
    initialPerformance: {
      isCorrect: boolean;
      responseTime: number;
      confidence?: number;
    }
  ): MemoryItem {
    const itemId = `${userId}_${contentId}`;
    const now = Date.now();
    
    // 計算初始記憶強度
    const initialStrength = this.calculateInitialMemoryStrength(initialPerformance);
    
    const memoryItem: MemoryItem = {
      id: itemId,
      contentId,
      userId,
      status: MemoryItemStatus.NEW,
      memoryStrength: initialStrength,
      strengthLevel: this.getStrengthLevel(initialStrength),
      
      firstLearnedAt: now,
      lastReviewedAt: now,
      nextReviewAt: now + this.calculateInitialInterval(initialStrength) * 24 * 60 * 60 * 1000,
      
      totalReviews: 1,
      correctReviews: initialPerformance.isCorrect ? 1 : 0,
      consecutiveCorrect: initialPerformance.isCorrect ? 1 : 0,
      consecutiveIncorrect: initialPerformance.isCorrect ? 0 : 1,
      
      currentInterval: this.calculateInitialInterval(initialStrength),
      previousInterval: 0,
      
      difficultyFactor: 2.5, // 初始難度因子
      forgettingRate: this.calculatePersonalizedForgettingRate(userId),
      
      gameMode: gameContext.gameMode,
      difficultyLevel: gameContext.difficultyLevel,
      geptLevel: gameContext.geptLevel,
      
      memoryCurvePoints: [{
        timestamp: now,
        memoryStrength: initialStrength,
        reviewResult: initialPerformance.isCorrect,
        responseTime: initialPerformance.responseTime,
        confidence: initialPerformance.confidence || 0.5
      }]
    };

    this.memoryItems.set(itemId, memoryItem);
    this.updateForgettingCurveParams(userId, memoryItem);
    
    return memoryItem;
  }

  /**
   * 記錄復習結果
   */
  recordReviewResult(
    userId: string,
    contentId: string,
    reviewResult: {
      isCorrect: boolean;
      responseTime: number;
      confidence?: number;
    }
  ): MemoryItem | null {
    const itemId = `${userId}_${contentId}`;
    const memoryItem = this.memoryItems.get(itemId);
    
    if (!memoryItem) return null;

    const now = Date.now();
    
    // 更新統計數據
    memoryItem.totalReviews++;
    memoryItem.lastReviewedAt = now;
    
    if (reviewResult.isCorrect) {
      memoryItem.correctReviews++;
      memoryItem.consecutiveCorrect++;
      memoryItem.consecutiveIncorrect = 0;
    } else {
      memoryItem.consecutiveCorrect = 0;
      memoryItem.consecutiveIncorrect++;
    }

    // 更新記憶強度
    const newStrength = this.calculateNewMemoryStrength(memoryItem, reviewResult);
    memoryItem.memoryStrength = newStrength;
    memoryItem.strengthLevel = this.getStrengthLevel(newStrength);

    // 更新狀態
    memoryItem.status = this.determineMemoryStatus(memoryItem);

    // 計算下次復習間隔
    const newInterval = this.calculateNextInterval(memoryItem, reviewResult.isCorrect);
    memoryItem.previousInterval = memoryItem.currentInterval;
    memoryItem.currentInterval = newInterval;
    memoryItem.nextReviewAt = now + newInterval * 24 * 60 * 60 * 1000;

    // 更新難度因子
    memoryItem.difficultyFactor = this.updateDifficultyFactor(
      memoryItem.difficultyFactor,
      reviewResult.isCorrect,
      reviewResult.responseTime
    );

    // 添加記憶曲線點
    memoryItem.memoryCurvePoints.push({
      timestamp: now,
      memoryStrength: newStrength,
      reviewResult: reviewResult.isCorrect,
      responseTime: reviewResult.responseTime,
      confidence: reviewResult.confidence || 0.5
    });

    // 限制記憶曲線點數量（保留最近100個點）
    if (memoryItem.memoryCurvePoints.length > 100) {
      memoryItem.memoryCurvePoints = memoryItem.memoryCurvePoints.slice(-100);
    }

    this.updateForgettingCurveParams(userId, memoryItem);
    
    return memoryItem;
  }

  /**
   * 計算初始記憶強度
   */
  private calculateInitialMemoryStrength(performance: {
    isCorrect: boolean;
    responseTime: number;
    confidence?: number;
  }): number {
    let strength = 0.5; // 基礎強度

    // 基於正確性調整
    if (performance.isCorrect) {
      strength += 0.3;
    } else {
      strength -= 0.2;
    }

    // 基於響應時間調整（快速響應表示更強的記憶）
    const timeBonus = Math.max(0, (5000 - performance.responseTime) / 10000);
    strength += timeBonus * 0.2;

    // 基於信心度調整
    if (performance.confidence) {
      strength += (performance.confidence - 0.5) * 0.2;
    }

    return Math.max(0.1, Math.min(0.9, strength));
  }

  /**
   * 計算新的記憶強度
   */
  private calculateNewMemoryStrength(
    memoryItem: MemoryItem,
    reviewResult: { isCorrect: boolean; responseTime: number; confidence?: number }
  ): number {
    const currentStrength = memoryItem.memoryStrength;
    const timeSinceLastReview = (Date.now() - memoryItem.lastReviewedAt) / (24 * 60 * 60 * 1000); // 天數
    
    // 基於遺忘曲線計算自然衰減
    const decayedStrength = currentStrength * Math.exp(-memoryItem.forgettingRate * timeSinceLastReview);
    
    let newStrength = decayedStrength;

    if (reviewResult.isCorrect) {
      // 正確復習：增強記憶
      const reinforcement = 0.1 + (1 - currentStrength) * 0.3;
      newStrength = Math.min(1.0, decayedStrength + reinforcement);
      
      // 快速響應額外獎勵
      if (reviewResult.responseTime < 2000) {
        newStrength += 0.05;
      }
    } else {
      // 錯誤復習：記憶強度下降
      const penalty = 0.2 + currentStrength * 0.1;
      newStrength = Math.max(0.1, decayedStrength - penalty);
    }

    // 基於信心度微調
    if (reviewResult.confidence) {
      const confidenceAdjustment = (reviewResult.confidence - 0.5) * 0.1;
      newStrength += confidenceAdjustment;
    }

    return Math.max(0.1, Math.min(1.0, newStrength));
  }

  /**
   * 計算初始復習間隔
   */
  private calculateInitialInterval(memoryStrength: number): number {
    // 基於記憶強度計算初始間隔（天）
    if (memoryStrength >= 0.8) return 3;
    if (memoryStrength >= 0.6) return 2;
    if (memoryStrength >= 0.4) return 1;
    return 0.5; // 12小時
  }

  /**
   * 計算下次復習間隔（基於 SM-2 算法改進）
   */
  private calculateNextInterval(memoryItem: MemoryItem, isCorrect: boolean): number {
    const currentInterval = memoryItem.currentInterval;
    const difficultyFactor = memoryItem.difficultyFactor;

    if (!isCorrect) {
      // 錯誤：重置間隔
      return Math.max(0.5, currentInterval * 0.2);
    }

    // 正確：增加間隔
    if (memoryItem.totalReviews === 1) {
      return 1; // 第一次復習後1天
    } else if (memoryItem.totalReviews === 2) {
      return 3; // 第二次復習後3天
    } else {
      // 後續復習使用難度因子
      const newInterval = currentInterval * difficultyFactor;
      
      // 基於記憶強度調整
      const strengthMultiplier = 0.5 + memoryItem.memoryStrength * 0.5;
      
      return Math.min(365, newInterval * strengthMultiplier); // 最大間隔1年
    }
  }

  /**
   * 更新難度因子
   */
  private updateDifficultyFactor(
    currentFactor: number,
    isCorrect: boolean,
    responseTime: number
  ): number {
    if (!isCorrect) {
      // 錯誤：降低難度因子
      return Math.max(1.3, currentFactor - 0.2);
    }

    // 正確：基於響應時間調整
    let adjustment = 0;
    if (responseTime < 2000) {
      adjustment = 0.1; // 快速響應：增加難度因子
    } else if (responseTime > 5000) {
      adjustment = -0.05; // 慢速響應：略微降低難度因子
    }

    return Math.max(1.3, Math.min(2.5, currentFactor + adjustment));
  }

  /**
   * 獲取記憶強度等級
   */
  private getStrengthLevel(strength: number): MemoryStrengthLevel {
    if (strength >= 0.8) return MemoryStrengthLevel.VERY_STRONG;
    if (strength >= 0.6) return MemoryStrengthLevel.STRONG;
    if (strength >= 0.4) return MemoryStrengthLevel.MODERATE;
    if (strength >= 0.2) return MemoryStrengthLevel.WEAK;
    return MemoryStrengthLevel.VERY_WEAK;
  }

  /**
   * 確定記憶項目狀態
   */
  private determineMemoryStatus(memoryItem: MemoryItem): MemoryItemStatus {
    const strength = memoryItem.memoryStrength;
    const reviews = memoryItem.totalReviews;
    const consecutiveCorrect = memoryItem.consecutiveCorrect;

    if (strength < 0.3) {
      return MemoryItemStatus.FORGOTTEN;
    } else if (strength >= 0.8 && reviews >= 3 && consecutiveCorrect >= 2) {
      return MemoryItemStatus.MATURE;
    } else if (reviews >= 2) {
      return MemoryItemStatus.REVIEW;
    } else {
      return MemoryItemStatus.LEARNING;
    }
  }

  /**
   * 計算個人化遺忘率
   */
  private calculatePersonalizedForgettingRate(userId: string): number {
    const params = this.forgettingCurveParams.get(userId);
    if (params) {
      return params.decayConstant;
    }
    
    // 默認遺忘率（基於 Ebbinghaus 曲線）
    return 0.5;
  }

  /**
   * 更新遺忘曲線參數
   */
  private updateForgettingCurveParams(userId: string, memoryItem: MemoryItem): void {
    const existing = this.forgettingCurveParams.get(userId);
    
    if (!existing) {
      this.forgettingCurveParams.set(userId, {
        userId,
        initialStrength: memoryItem.memoryStrength,
        decayConstant: 0.5,
        retentionFactor: 0.8,
        personalizedMultiplier: 1.0,
        lastUpdated: Date.now()
      });
      return;
    }

    // 基於最新數據更新參數
    const retentionRate = memoryItem.correctReviews / memoryItem.totalReviews;
    existing.retentionFactor = (existing.retentionFactor * 0.9) + (retentionRate * 0.1);
    existing.decayConstant = Math.max(0.1, Math.min(1.0, 1 - existing.retentionFactor));
    existing.lastUpdated = Date.now();
  }

  /**
   * 獲取用戶的記憶項目
   */
  getUserMemoryItems(userId: string): MemoryItem[] {
    return Array.from(this.memoryItems.values()).filter(item => item.userId === userId);
  }

  /**
   * 獲取需要復習的項目
   */
  getItemsDueForReview(userId: string, currentTime: number = Date.now()): MemoryItem[] {
    return this.getUserMemoryItems(userId).filter(item => 
      item.nextReviewAt <= currentTime && 
      item.status !== MemoryItemStatus.FORGOTTEN
    );
  }

  /**
   * 獲取逾期復習的項目
   */
  getOverdueItems(userId: string, currentTime: number = Date.now()): MemoryItem[] {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return this.getUserMemoryItems(userId).filter(item => 
      item.nextReviewAt < (currentTime - oneDayMs) && 
      item.status !== MemoryItemStatus.FORGOTTEN
    );
  }

  /**
   * 分析用戶記憶狀況
   */
  analyzeUserMemory(userId: string): MemoryAnalysisResult {
    const userItems = this.getUserMemoryItems(userId);
    
    if (userItems.length === 0) {
      return this.getEmptyAnalysisResult();
    }

    // 統計各狀態的項目數量
    const itemsByStatus = userItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<MemoryItemStatus, number>);

    // 統計各強度等級的項目數量
    const itemsByStrength = userItems.reduce((acc, item) => {
      acc[item.strengthLevel] = (acc[item.strengthLevel] || 0) + 1;
      return acc;
    }, {} as Record<MemoryStrengthLevel, number>);

    // 計算平均記憶強度
    const averageMemoryStrength = userItems.reduce((sum, item) => sum + item.memoryStrength, 0) / userItems.length;

    // 計算整體保持率
    const overallRetentionRate = userItems.reduce((sum, item) => 
      sum + (item.correctReviews / Math.max(1, item.totalReviews)), 0) / userItems.length;

    // 分析趨勢
    const memoryTrend = this.analyzeMemoryTrend(userItems);
    const strengthTrend = this.analyzeStrengthTrend(userItems);

    // 預測保持率
    const predictedRetention = this.predictRetentionRates(userItems);

    // 生成建議
    const recommendations = this.generateMemoryRecommendations(userItems, averageMemoryStrength, overallRetentionRate);

    // 獲取緊急和逾期復習項目
    const urgentReviews = this.getItemsDueForReview(userId);
    const overdueReviews = this.getOverdueItems(userId);

    return {
      totalItems: userItems.length,
      itemsByStatus,
      itemsByStrength,
      averageMemoryStrength,
      overallRetentionRate,
      forgettingRate: this.calculatePersonalizedForgettingRate(userId),
      optimalReviewInterval: this.calculateOptimalReviewInterval(userItems),
      memoryTrend,
      strengthTrend,
      predictedRetention,
      recommendations,
      urgentReviews,
      overdueReviews
    };
  }

  /**
   * 分析記憶趨勢
   */
  private analyzeMemoryTrend(items: MemoryItem[]): 'improving' | 'stable' | 'declining' {
    if (items.length < 3) return 'stable';

    const recentItems = items.filter(item => 
      Date.now() - item.lastReviewedAt < 7 * 24 * 60 * 60 * 1000 // 最近7天
    );

    if (recentItems.length < 2) return 'stable';

    const avgRecentStrength = recentItems.reduce((sum, item) => sum + item.memoryStrength, 0) / recentItems.length;
    const avgOverallStrength = items.reduce((sum, item) => sum + item.memoryStrength, 0) / items.length;

    if (avgRecentStrength > avgOverallStrength + 0.1) return 'improving';
    if (avgRecentStrength < avgOverallStrength - 0.1) return 'declining';
    return 'stable';
  }

  /**
   * 分析強度趨勢
   */
  private analyzeStrengthTrend(items: MemoryItem[]): 'increasing' | 'stable' | 'decreasing' {
    // 簡化實現：基於最近的記憶曲線點
    const recentPoints = items.flatMap(item => 
      item.memoryCurvePoints.slice(-3)
    ).sort((a, b) => a.timestamp - b.timestamp);

    if (recentPoints.length < 3) return 'stable';

    const firstThird = recentPoints.slice(0, Math.floor(recentPoints.length / 3));
    const lastThird = recentPoints.slice(-Math.floor(recentPoints.length / 3));

    const firstAvg = firstThird.reduce((sum, point) => sum + point.memoryStrength, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, point) => sum + point.memoryStrength, 0) / lastThird.length;

    if (lastAvg > firstAvg + 0.1) return 'increasing';
    if (lastAvg < firstAvg - 0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * 預測保持率
   */
  private predictRetentionRates(items: MemoryItem[]): {
    in1Day: number;
    in3Days: number;
    in7Days: number;
    in30Days: number;
  } {
    if (items.length === 0) {
      return { in1Day: 0, in3Days: 0, in7Days: 0, in30Days: 0 };
    }

    const avgForgettingRate = items.reduce((sum, item) => sum + item.forgettingRate, 0) / items.length;
    const avgCurrentStrength = items.reduce((sum, item) => sum + item.memoryStrength, 0) / items.length;

    return {
      in1Day: avgCurrentStrength * Math.exp(-avgForgettingRate * 1),
      in3Days: avgCurrentStrength * Math.exp(-avgForgettingRate * 3),
      in7Days: avgCurrentStrength * Math.exp(-avgForgettingRate * 7),
      in30Days: avgCurrentStrength * Math.exp(-avgForgettingRate * 30)
    };
  }

  /**
   * 生成記憶建議
   */
  private generateMemoryRecommendations(
    items: MemoryItem[],
    avgStrength: number,
    retentionRate: number
  ): string[] {
    const recommendations: string[] = [];

    if (avgStrength < 0.5) {
      recommendations.push('您的整體記憶強度偏低，建議增加復習頻率');
    }

    if (retentionRate < 0.7) {
      recommendations.push('記憶保持率需要改善，建議使用間隔重複學習法');
    }

    const weakItems = items.filter(item => item.memoryStrength < 0.4);
    if (weakItems.length > items.length * 0.3) {
      recommendations.push('有較多薄弱項目，建議重點復習記憶強度低的內容');
    }

    const overdueCount = items.filter(item => 
      item.nextReviewAt < Date.now() - 24 * 60 * 60 * 1000
    ).length;
    if (overdueCount > 0) {
      recommendations.push(`有 ${overdueCount} 個項目逾期未復習，建議盡快安排復習`);
    }

    if (recommendations.length === 0) {
      recommendations.push('您的記憶狀況良好，請保持當前的學習節奏');
    }

    return recommendations;
  }

  /**
   * 計算最佳復習間隔
   */
  private calculateOptimalReviewInterval(items: MemoryItem[]): number {
    if (items.length === 0) return 1;

    const successfulItems = items.filter(item => item.correctReviews / item.totalReviews >= 0.8);
    if (successfulItems.length === 0) return 1;

    const avgInterval = successfulItems.reduce((sum, item) => sum + item.currentInterval, 0) / successfulItems.length;
    return Math.round(avgInterval * 10) / 10; // 保留一位小數
  }

  /**
   * 獲取空的分析結果
   */
  private getEmptyAnalysisResult(): MemoryAnalysisResult {
    return {
      totalItems: 0,
      itemsByStatus: {} as Record<MemoryItemStatus, number>,
      itemsByStrength: {} as Record<MemoryStrengthLevel, number>,
      averageMemoryStrength: 0,
      overallRetentionRate: 0,
      forgettingRate: 0.5,
      optimalReviewInterval: 1,
      memoryTrend: 'stable',
      strengthTrend: 'stable',
      predictedRetention: { in1Day: 0, in3Days: 0, in7Days: 0, in30Days: 0 },
      recommendations: ['開始學習以建立記憶追蹤數據'],
      urgentReviews: [],
      overdueReviews: []
    };
  }

  /**
   * 清除用戶數據
   */
  clearUserData(userId: string): void {
    const userItems = this.getUserMemoryItems(userId);
    userItems.forEach(item => this.memoryItems.delete(item.id));
    this.forgettingCurveParams.delete(userId);
  }

  /**
   * 獲取記憶統計
   */
  getMemoryStatistics(userId: string): any {
    const items = this.getUserMemoryItems(userId);
    const analysis = this.analyzeUserMemory(userId);
    
    return {
      totalItems: items.length,
      averageStrength: analysis.averageMemoryStrength,
      retentionRate: analysis.overallRetentionRate,
      itemsByStatus: analysis.itemsByStatus,
      itemsByStrength: analysis.itemsByStrength,
      trends: {
        memory: analysis.memoryTrend,
        strength: analysis.strengthTrend
      },
      predictions: analysis.predictedRetention,
      dueForReview: analysis.urgentReviews.length,
      overdue: analysis.overdueReviews.length
    };
  }
}
