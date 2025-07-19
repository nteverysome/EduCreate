/**
 * 間隔重複算法
 * 基於 SM-2 算法和現代記憶科學研究的改進版間隔重複系統
 */

import { MemoryItem, MemoryItemStatus, MemoryCurveTracker } from './MemoryCurveTracker';

// 復習計劃項目
export interface ReviewScheduleItem {
  id: string;
  contentId: string;
  userId: string;
  scheduledTime: number; // 計劃復習時間
  priority: ReviewPriority;
  estimatedDuration: number; // 預估復習時間（分鐘）
  reviewType: ReviewType;
  memoryStrength: number;
  difficultyLevel: string;
  
  // 上下文信息
  gameMode: string;
  geptLevel?: string;
  
  // 復習歷史
  lastReviewResult?: boolean;
  consecutiveCorrect: number;
  totalReviews: number;
}

// 復習優先級
export enum ReviewPriority {
  URGENT = 'urgent',       // 緊急：逾期超過1天
  HIGH = 'high',           // 高：今天到期
  MEDIUM = 'medium',       // 中：未來1-3天到期
  LOW = 'low'              // 低：未來3天以上到期
}

// 復習類型
export enum ReviewType {
  INITIAL = 'initial',     // 初次復習
  REINFORCEMENT = 'reinforcement', // 強化復習
  MAINTENANCE = 'maintenance',     // 維護復習
  RECOVERY = 'recovery'    // 恢復復習（遺忘後）
}

// 復習會話
export interface ReviewSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  plannedItems: ReviewScheduleItem[];
  completedItems: ReviewScheduleItem[];
  skippedItems: ReviewScheduleItem[];
  
  // 會話統計
  totalPlanned: number;
  totalCompleted: number;
  accuracyRate: number;
  averageResponseTime: number;
  
  // 會話結果
  sessionEffectiveness: number; // 會話效果評分 (0-1)
  memoryGain: number; // 記憶增益
  recommendations: string[];
}

// 學習計劃
export interface LearningPlan {
  userId: string;
  planDate: number; // 計劃日期
  dailyGoal: {
    newItems: number;      // 新學習項目數
    reviewItems: number;   // 復習項目數
    studyTime: number;     // 學習時間（分鐘）
  };
  
  scheduledReviews: ReviewScheduleItem[];
  priorityItems: ReviewScheduleItem[];
  
  // 計劃統計
  totalItems: number;
  estimatedTime: number;
  difficultyDistribution: Record<string, number>;
  
  // 適應性調整
  adaptiveAdjustments: {
    difficultyReduction: boolean;
    intervalExtension: boolean;
    loadReduction: boolean;
  };
}

export class SpacedRepetitionAlgorithm {
  private memoryCurveTracker: MemoryCurveTracker;
  private reviewSessions: Map<string, ReviewSession> = new Map();
  private learningPlans: Map<string, LearningPlan> = new Map();

  constructor(memoryCurveTracker: MemoryCurveTracker) {
    this.memoryCurveTracker = memoryCurveTracker;
  }

  /**
   * 生成用戶的學習計劃
   */
  generateLearningPlan(
    userId: string,
    preferences: {
      dailyStudyTime: number; // 每日學習時間（分鐘）
      maxNewItems: number;    // 每日最大新項目數
      maxReviewItems: number; // 每日最大復習項目數
      difficultyPreference: 'easy' | 'balanced' | 'challenging';
    }
  ): LearningPlan {
    const planDate = Date.now();
    const memoryItems = this.memoryCurveTracker.getUserMemoryItems(userId);
    
    // 獲取需要復習的項目
    const dueItems = this.memoryCurveTracker.getItemsDueForReview(userId);
    const overdueItems = this.memoryCurveTracker.getOverdueItems(userId);
    
    // 創建復習計劃項目
    const scheduledReviews = this.createReviewScheduleItems(
      [...overdueItems, ...dueItems],
      preferences.maxReviewItems
    );
    
    // 確定優先級項目
    const priorityItems = scheduledReviews
      .filter(item => item.priority === ReviewPriority.URGENT || item.priority === ReviewPriority.HIGH)
      .slice(0, Math.min(10, preferences.maxReviewItems));
    
    // 計算預估時間
    const estimatedTime = scheduledReviews.reduce((sum, item) => sum + item.estimatedDuration, 0);
    
    // 難度分佈統計
    const difficultyDistribution = scheduledReviews.reduce((acc, item) => {
      acc[item.difficultyLevel] = (acc[item.difficultyLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 適應性調整
    const adaptiveAdjustments = this.calculateAdaptiveAdjustments(
      userId,
      memoryItems,
      preferences
    );
    
    const learningPlan: LearningPlan = {
      userId,
      planDate,
      dailyGoal: {
        newItems: Math.min(preferences.maxNewItems, 10),
        reviewItems: scheduledReviews.length,
        studyTime: preferences.dailyStudyTime
      },
      scheduledReviews,
      priorityItems,
      totalItems: scheduledReviews.length,
      estimatedTime,
      difficultyDistribution,
      adaptiveAdjustments
    };
    
    this.learningPlans.set(userId, learningPlan);
    return learningPlan;
  }

  /**
   * 創建復習計劃項目
   */
  private createReviewScheduleItems(
    memoryItems: MemoryItem[],
    maxItems: number
  ): ReviewScheduleItem[] {
    const now = Date.now();
    
    return memoryItems
      .map(item => ({
        id: `review_${item.id}_${now}`,
        contentId: item.contentId,
        userId: item.userId,
        scheduledTime: item.nextReviewAt,
        priority: this.calculateReviewPriority(item, now),
        estimatedDuration: this.estimateReviewDuration(item),
        reviewType: this.determineReviewType(item),
        memoryStrength: item.memoryStrength,
        difficultyLevel: item.difficultyLevel,
        gameMode: item.gameMode,
        geptLevel: item.geptLevel,
        lastReviewResult: item.memoryCurvePoints.length > 0 ? 
          item.memoryCurvePoints[item.memoryCurvePoints.length - 1].reviewResult : undefined,
        consecutiveCorrect: item.consecutiveCorrect,
        totalReviews: item.totalReviews
      }))
      .sort((a, b) => {
        // 按優先級和計劃時間排序
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.scheduledTime - b.scheduledTime;
      })
      .slice(0, maxItems);
  }

  /**
   * 計算復習優先級
   */
  private calculateReviewPriority(item: MemoryItem, currentTime: number): ReviewPriority {
    const timeDiff = currentTime - item.nextReviewAt;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (timeDiff > oneDayMs) {
      return ReviewPriority.URGENT; // 逾期超過1天
    } else if (timeDiff > 0) {
      return ReviewPriority.HIGH; // 今天到期
    } else if (timeDiff > -3 * oneDayMs) {
      return ReviewPriority.MEDIUM; // 未來1-3天
    } else {
      return ReviewPriority.LOW; // 未來3天以上
    }
  }

  /**
   * 預估復習時間
   */
  private estimateReviewDuration(item: MemoryItem): number {
    let baseDuration = 2; // 基礎2分鐘
    
    // 基於記憶強度調整
    if (item.memoryStrength < 0.3) {
      baseDuration += 3; // 弱記憶需要更多時間
    } else if (item.memoryStrength > 0.8) {
      baseDuration -= 1; // 強記憶需要較少時間
    }
    
    // 基於難度調整
    switch (item.difficultyLevel) {
      case 'easy': baseDuration *= 0.8; break;
      case 'hard': baseDuration *= 1.3; break;
      case 'expert': baseDuration *= 1.5; break;
    }
    
    // 基於復習次數調整
    if (item.totalReviews < 3) {
      baseDuration *= 1.2; // 新項目需要更多時間
    }
    
    return Math.max(1, Math.round(baseDuration));
  }

  /**
   * 確定復習類型
   */
  private determineReviewType(item: MemoryItem): ReviewType {
    if (item.totalReviews <= 1) {
      return ReviewType.INITIAL;
    } else if (item.status === MemoryItemStatus.FORGOTTEN) {
      return ReviewType.RECOVERY;
    } else if (item.memoryStrength < 0.6) {
      return ReviewType.REINFORCEMENT;
    } else {
      return ReviewType.MAINTENANCE;
    }
  }

  /**
   * 計算適應性調整
   */
  private calculateAdaptiveAdjustments(
    userId: string,
    memoryItems: MemoryItem[],
    preferences: any
  ): LearningPlan['adaptiveAdjustments'] {
    const analysis = this.memoryCurveTracker.analyzeUserMemory(userId);
    
    return {
      difficultyReduction: analysis.overallRetentionRate < 0.6,
      intervalExtension: analysis.averageMemoryStrength < 0.4,
      loadReduction: analysis.overdueReviews.length > preferences.maxReviewItems * 1.5
    };
  }

  /**
   * 開始復習會話
   */
  startReviewSession(userId: string, plannedItems: ReviewScheduleItem[]): ReviewSession {
    const sessionId = `session_${userId}_${Date.now()}`;
    
    const session: ReviewSession = {
      id: sessionId,
      userId,
      startTime: Date.now(),
      plannedItems,
      completedItems: [],
      skippedItems: [],
      totalPlanned: plannedItems.length,
      totalCompleted: 0,
      accuracyRate: 0,
      averageResponseTime: 0,
      sessionEffectiveness: 0,
      memoryGain: 0,
      recommendations: []
    };
    
    this.reviewSessions.set(sessionId, session);
    return session;
  }

  /**
   * 記錄復習結果
   */
  recordReviewResult(
    sessionId: string,
    contentId: string,
    result: {
      isCorrect: boolean;
      responseTime: number;
      confidence?: number;
    }
  ): void {
    const session = this.reviewSessions.get(sessionId);
    if (!session) return;
    
    // 更新記憶追蹤器
    const memoryItem = this.memoryCurveTracker.recordReviewResult(
      session.userId,
      contentId,
      result
    );
    
    if (!memoryItem) return;
    
    // 找到對應的計劃項目
    const plannedItem = session.plannedItems.find(item => item.contentId === contentId);
    if (plannedItem) {
      session.completedItems.push(plannedItem);
      
      // 從計劃項目中移除
      session.plannedItems = session.plannedItems.filter(item => item.contentId !== contentId);
    }
    
    // 更新會話統計
    this.updateSessionStatistics(session);
  }

  /**
   * 跳過復習項目
   */
  skipReviewItem(sessionId: string, contentId: string): void {
    const session = this.reviewSessions.get(sessionId);
    if (!session) return;
    
    const plannedItem = session.plannedItems.find(item => item.contentId === contentId);
    if (plannedItem) {
      session.skippedItems.push(plannedItem);
      session.plannedItems = session.plannedItems.filter(item => item.contentId !== contentId);
    }
  }

  /**
   * 結束復習會話
   */
  endReviewSession(sessionId: string): ReviewSession {
    const session = this.reviewSessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    session.endTime = Date.now();
    
    // 計算最終統計
    this.updateSessionStatistics(session);
    
    // 計算會話效果
    session.sessionEffectiveness = this.calculateSessionEffectiveness(session);
    
    // 計算記憶增益
    session.memoryGain = this.calculateMemoryGain(session);
    
    // 生成建議
    session.recommendations = this.generateSessionRecommendations(session);
    
    return session;
  }

  /**
   * 更新會話統計
   */
  private updateSessionStatistics(session: ReviewSession): void {
    const completed = session.completedItems;
    session.totalCompleted = completed.length;
    
    if (completed.length > 0) {
      // 計算準確率（需要從記憶追蹤器獲取最新結果）
      let correctCount = 0;
      let totalResponseTime = 0;
      
      completed.forEach(item => {
        const memoryItem = this.memoryCurveTracker.getUserMemoryItems(session.userId)
          .find(mi => mi.contentId === item.contentId);
        
        if (memoryItem && memoryItem.memoryCurvePoints.length > 0) {
          const lastPoint = memoryItem.memoryCurvePoints[memoryItem.memoryCurvePoints.length - 1];
          if (lastPoint.reviewResult) correctCount++;
          totalResponseTime += lastPoint.responseTime;
        }
      });
      
      session.accuracyRate = correctCount / completed.length;
      session.averageResponseTime = totalResponseTime / completed.length;
    }
  }

  /**
   * 計算會話效果
   */
  private calculateSessionEffectiveness(session: ReviewSession): number {
    let effectiveness = 0;
    
    // 基於完成率
    const completionRate = session.totalCompleted / session.totalPlanned;
    effectiveness += completionRate * 0.4;
    
    // 基於準確率
    effectiveness += session.accuracyRate * 0.4;
    
    // 基於響應時間（快速響應加分）
    const timeScore = Math.max(0, 1 - (session.averageResponseTime / 10000));
    effectiveness += timeScore * 0.2;
    
    return Math.min(1, effectiveness);
  }

  /**
   * 計算記憶增益
   */
  private calculateMemoryGain(session: ReviewSession): number {
    let totalGain = 0;
    
    session.completedItems.forEach(item => {
      const memoryItem = this.memoryCurveTracker.getUserMemoryItems(session.userId)
        .find(mi => mi.contentId === item.contentId);
      
      if (memoryItem && memoryItem.memoryCurvePoints.length >= 2) {
        const points = memoryItem.memoryCurvePoints;
        const beforeStrength = points[points.length - 2].memoryStrength;
        const afterStrength = points[points.length - 1].memoryStrength;
        totalGain += (afterStrength - beforeStrength);
      }
    });
    
    return totalGain / Math.max(1, session.completedItems.length);
  }

  /**
   * 生成會話建議
   */
  private generateSessionRecommendations(session: ReviewSession): string[] {
    const recommendations: string[] = [];
    
    if (session.accuracyRate < 0.7) {
      recommendations.push('準確率偏低，建議放慢速度，仔細思考');
    }
    
    if (session.averageResponseTime > 5000) {
      recommendations.push('響應時間較長，可能需要加強基礎練習');
    }
    
    if (session.skippedItems.length > session.totalCompleted) {
      recommendations.push('跳過項目較多，建議調整學習計劃或降低難度');
    }
    
    if (session.sessionEffectiveness > 0.8) {
      recommendations.push('學習效果很好，可以考慮增加學習量或提高難度');
    }
    
    if (session.memoryGain > 0.1) {
      recommendations.push('記憶增益顯著，請保持當前的學習節奏');
    } else if (session.memoryGain < 0) {
      recommendations.push('記憶強度有所下降，建議增加復習頻率');
    }
    
    return recommendations;
  }

  /**
   * 獲取用戶的復習統計
   */
  getUserReviewStatistics(userId: string): any {
    const userSessions = Array.from(this.reviewSessions.values())
      .filter(session => session.userId === userId && session.endTime);
    
    if (userSessions.length === 0) {
      return {
        totalSessions: 0,
        totalReviews: 0,
        averageAccuracy: 0,
        averageEffectiveness: 0,
        totalStudyTime: 0,
        recentTrend: 'stable'
      };
    }
    
    const totalReviews = userSessions.reduce((sum, session) => sum + session.totalCompleted, 0);
    const averageAccuracy = userSessions.reduce((sum, session) => sum + session.accuracyRate, 0) / userSessions.length;
    const averageEffectiveness = userSessions.reduce((sum, session) => sum + session.sessionEffectiveness, 0) / userSessions.length;
    const totalStudyTime = userSessions.reduce((sum, session) => 
      sum + ((session.endTime || session.startTime) - session.startTime), 0) / (1000 * 60); // 分鐘
    
    // 分析最近趨勢
    const recentSessions = userSessions.slice(-5);
    const recentAccuracy = recentSessions.reduce((sum, session) => sum + session.accuracyRate, 0) / recentSessions.length;
    const recentTrend = recentAccuracy > averageAccuracy + 0.1 ? 'improving' : 
                       recentAccuracy < averageAccuracy - 0.1 ? 'declining' : 'stable';
    
    return {
      totalSessions: userSessions.length,
      totalReviews,
      averageAccuracy,
      averageEffectiveness,
      totalStudyTime,
      recentTrend,
      recentSessions: recentSessions.slice(-3)
    };
  }

  /**
   * 獲取當前學習計劃
   */
  getCurrentLearningPlan(userId: string): LearningPlan | null {
    return this.learningPlans.get(userId) || null;
  }

  /**
   * 更新學習計劃
   */
  updateLearningPlan(userId: string, updates: Partial<LearningPlan>): LearningPlan | null {
    const currentPlan = this.learningPlans.get(userId);
    if (!currentPlan) return null;
    
    const updatedPlan = { ...currentPlan, ...updates };
    this.learningPlans.set(userId, updatedPlan);
    return updatedPlan;
  }

  /**
   * 清除用戶數據
   */
  clearUserData(userId: string): void {
    // 清除會話數據
    const userSessions = Array.from(this.reviewSessions.entries())
      .filter(([, session]) => session.userId === userId);
    userSessions.forEach(([sessionId]) => this.reviewSessions.delete(sessionId));
    
    // 清除學習計劃
    this.learningPlans.delete(userId);
  }
}
