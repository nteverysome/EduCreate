/**
 * 自適應難度調整AI
 * 基於實時學習表現和認知負荷的智能難度調整系統
 */

import { PrismaClient } from '@prisma/client';

// 難度調整策略
export enum DifficultyStrategy {
  CONSERVATIVE = 'conservative',   // 保守調整
  MODERATE = 'moderate',          // 適中調整
  AGGRESSIVE = 'aggressive',      // 激進調整
  ADAPTIVE = 'adaptive'           // 自適應調整
}

// 認知負荷指標
export interface CognitiveLoadMetrics {
  responseTime: number;           // 平均響應時間
  errorRate: number;             // 錯誤率
  hesitationCount: number;       // 猶豫次數
  retryCount: number;            // 重試次數
  attentionLevel: number;        // 注意力水平
  fatigueLevel: number;          // 疲勞水平
  frustrationLevel: number;      // 挫折感水平
}

// 學習表現指標
export interface PerformanceMetrics {
  accuracy: number;              // 準確率
  speed: number;                 // 速度
  consistency: number;           // 一致性
  improvement: number;           // 改善程度
  retention: number;             // 記憶保持率
  engagement: number;            // 參與度
  confidence: number;            // 信心水平
}

// 難度調整建議
export interface DifficultyAdjustment {
  currentDifficulty: number;     // 當前難度 (0-1)
  recommendedDifficulty: number; // 建議難度 (0-1)
  adjustmentReason: string;      // 調整原因
  confidence: number;            // 調整信心度
  expectedImpact: string;        // 預期影響
  adjustmentType: 'increase' | 'decrease' | 'maintain';
  magnitude: 'small' | 'medium' | 'large';
  timeline: 'immediate' | 'gradual' | 'delayed';
}

// 學習者狀態
export interface LearnerState {
  userId: string;
  sessionId: string;
  currentDifficulty: number;
  cognitiveLoad: CognitiveLoadMetrics;
  performance: PerformanceMetrics;
  learningGoals: string[];
  timeConstraints: {
    sessionLength: number;
    remainingTime: number;
  };
  personalFactors: {
    energyLevel: number;
    motivationLevel: number;
    stressLevel: number;
    priorKnowledge: number;
  };
}

export class AdaptiveDifficultyAI {
  private static prisma = new PrismaClient();
  
  // 難度調整閾值
  private static readonly THRESHOLDS = {
    HIGH_ACCURACY: 0.85,
    LOW_ACCURACY: 0.60,
    HIGH_COGNITIVE_LOAD: 0.75,
    LOW_COGNITIVE_LOAD: 0.30,
    HIGH_RESPONSE_TIME: 5000, // ms
    LOW_RESPONSE_TIME: 1000,  // ms
    FATIGUE_THRESHOLD: 0.70,
    FRUSTRATION_THRESHOLD: 0.65
  };

  /**
   * 分析並調整難度
   */
  static async analyzeDifficulty(
    learnerState: LearnerState,
    strategy: DifficultyStrategy = DifficultyStrategy.ADAPTIVE
  ): Promise<DifficultyAdjustment> {
    try {
      // 1. 計算認知負荷
      const cognitiveLoadScore = this.calculateCognitiveLoad(learnerState.cognitiveLoad);
      
      // 2. 評估學習表現
      const performanceScore = this.evaluatePerformance(learnerState.performance);
      
      // 3. 分析個人因素
      const personalFactorScore = this.analyzePersonalFactors(learnerState.personalFactors);
      
      // 4. 生成調整建議
      const adjustment = this.generateAdjustment(
        learnerState,
        cognitiveLoadScore,
        performanceScore,
        personalFactorScore,
        strategy
      );
      
      // 5. 記錄調整歷史
      await this.recordAdjustment(learnerState.userId, adjustment);
      
      return adjustment;
    } catch (error) {
      console.error('難度分析失敗:', error);
      
      // 返回保守的維持建議
      return {
        currentDifficulty: learnerState.currentDifficulty,
        recommendedDifficulty: learnerState.currentDifficulty,
        adjustmentReason: '分析失敗，維持當前難度',
        confidence: 0.5,
        expectedImpact: '保持穩定學習狀態',
        adjustmentType: 'maintain',
        magnitude: 'small',
        timeline: 'immediate'
      };
    }
  }

  /**
   * 計算認知負荷分數
   */
  private static calculateCognitiveLoad(metrics: CognitiveLoadMetrics): number {
    const weights = {
      responseTime: 0.25,
      errorRate: 0.20,
      hesitationCount: 0.15,
      retryCount: 0.15,
      attentionLevel: 0.10,
      fatigueLevel: 0.10,
      frustrationLevel: 0.05
    };

    // 標準化各項指標 (0-1)
    const normalizedMetrics = {
      responseTime: Math.min(metrics.responseTime / this.THRESHOLDS.HIGH_RESPONSE_TIME, 1),
      errorRate: metrics.errorRate,
      hesitationCount: Math.min(metrics.hesitationCount / 10, 1),
      retryCount: Math.min(metrics.retryCount / 5, 1),
      attentionLevel: 1 - metrics.attentionLevel, // 注意力低 = 負荷高
      fatigueLevel: metrics.fatigueLevel,
      frustrationLevel: metrics.frustrationLevel
    };

    // 計算加權平均
    let cognitiveLoad = 0;
    for (const [metric, value] of Object.entries(normalizedMetrics)) {
      cognitiveLoad += value * weights[metric as keyof typeof weights];
    }

    return Math.min(Math.max(cognitiveLoad, 0), 1);
  }

  /**
   * 評估學習表現
   */
  private static evaluatePerformance(metrics: PerformanceMetrics): number {
    const weights = {
      accuracy: 0.30,
      speed: 0.20,
      consistency: 0.20,
      improvement: 0.15,
      retention: 0.10,
      engagement: 0.03,
      confidence: 0.02
    };

    // 計算加權平均表現分數
    let performanceScore = 0;
    for (const [metric, value] of Object.entries(metrics)) {
      performanceScore += value * weights[metric as keyof typeof weights];
    }

    return Math.min(Math.max(performanceScore, 0), 1);
  }

  /**
   * 分析個人因素
   */
  private static analyzePersonalFactors(factors: LearnerState['personalFactors']): number {
    const weights = {
      energyLevel: 0.30,
      motivationLevel: 0.30,
      stressLevel: 0.25,    // 壓力高 = 因素分數低
      priorKnowledge: 0.15
    };

    const adjustedFactors = {
      energyLevel: factors.energyLevel,
      motivationLevel: factors.motivationLevel,
      stressLevel: 1 - factors.stressLevel, // 反向計算
      priorKnowledge: factors.priorKnowledge
    };

    let factorScore = 0;
    for (const [factor, value] of Object.entries(adjustedFactors)) {
      factorScore += value * weights[factor as keyof typeof weights];
    }

    return Math.min(Math.max(factorScore, 0), 1);
  }

  /**
   * 生成調整建議
   */
  private static generateAdjustment(
    learnerState: LearnerState,
    cognitiveLoad: number,
    performance: number,
    personalFactors: number,
    strategy: DifficultyStrategy
  ): DifficultyAdjustment {
    const currentDifficulty = learnerState.currentDifficulty;
    let recommendedDifficulty = currentDifficulty;
    let adjustmentReason = '';
    let adjustmentType: 'increase' | 'decrease' | 'maintain' = 'maintain';
    let magnitude: 'small' | 'medium' | 'large' = 'small';
    let timeline: 'immediate' | 'gradual' | 'delayed' = 'immediate';

    // 決策邏輯
    if (cognitiveLoad > this.THRESHOLDS.HIGH_COGNITIVE_LOAD) {
      // 認知負荷過高，降低難度
      const reduction = this.calculateReduction(cognitiveLoad, strategy);
      recommendedDifficulty = Math.max(0.1, currentDifficulty - reduction);
      adjustmentType = 'decrease';
      magnitude = reduction > 0.2 ? 'large' : reduction > 0.1 ? 'medium' : 'small';
      adjustmentReason = `認知負荷過高 (${(cognitiveLoad * 100).toFixed(1)}%)，需要降低難度`;
      
    } else if (performance > this.THRESHOLDS.HIGH_ACCURACY && cognitiveLoad < this.THRESHOLDS.LOW_COGNITIVE_LOAD) {
      // 表現優秀且認知負荷低，增加難度
      const increase = this.calculateIncrease(performance, personalFactors, strategy);
      recommendedDifficulty = Math.min(1.0, currentDifficulty + increase);
      adjustmentType = 'increase';
      magnitude = increase > 0.2 ? 'large' : increase > 0.1 ? 'medium' : 'small';
      adjustmentReason = `表現優秀 (${(performance * 100).toFixed(1)}%) 且認知負荷適中，可以增加挑戰`;
      
    } else if (performance < this.THRESHOLDS.LOW_ACCURACY) {
      // 表現不佳，降低難度
      const reduction = this.calculateReduction(1 - performance, strategy);
      recommendedDifficulty = Math.max(0.1, currentDifficulty - reduction);
      adjustmentType = 'decrease';
      magnitude = reduction > 0.15 ? 'large' : reduction > 0.08 ? 'medium' : 'small';
      adjustmentReason = `學習表現需要改善 (${(performance * 100).toFixed(1)}%)，降低難度以建立信心`;
      
    } else {
      // 維持當前難度
      adjustmentReason = '當前難度適中，維持現狀';
    }

    // 考慮個人因素調整
    if (personalFactors < 0.5) {
      // 個人狀態不佳，傾向保守
      if (adjustmentType === 'increase') {
        recommendedDifficulty = currentDifficulty + (recommendedDifficulty - currentDifficulty) * 0.5;
        magnitude = 'small';
        timeline = 'gradual';
        adjustmentReason += '；考慮到當前狀態，採用漸進式調整';
      }
    }

    // 計算信心度
    const confidence = this.calculateConfidence(cognitiveLoad, performance, personalFactors);

    // 預期影響
    const expectedImpact = this.generateExpectedImpact(adjustmentType, magnitude);

    return {
      currentDifficulty,
      recommendedDifficulty,
      adjustmentReason,
      confidence,
      expectedImpact,
      adjustmentType,
      magnitude,
      timeline
    };
  }

  /**
   * 計算難度降低幅度
   */
  private static calculateReduction(loadOrError: number, strategy: DifficultyStrategy): number {
    const baseReduction = loadOrError * 0.3; // 基礎降低幅度

    switch (strategy) {
      case DifficultyStrategy.CONSERVATIVE:
        return baseReduction * 0.5;
      case DifficultyStrategy.MODERATE:
        return baseReduction * 0.75;
      case DifficultyStrategy.AGGRESSIVE:
        return baseReduction * 1.2;
      case DifficultyStrategy.ADAPTIVE:
      default:
        return baseReduction;
    }
  }

  /**
   * 計算難度增加幅度
   */
  private static calculateIncrease(performance: number, personalFactors: number, strategy: DifficultyStrategy): number {
    const baseIncrease = (performance - 0.8) * personalFactors * 0.4; // 基礎增加幅度

    switch (strategy) {
      case DifficultyStrategy.CONSERVATIVE:
        return baseIncrease * 0.6;
      case DifficultyStrategy.MODERATE:
        return baseIncrease * 0.8;
      case DifficultyStrategy.AGGRESSIVE:
        return baseIncrease * 1.3;
      case DifficultyStrategy.ADAPTIVE:
      default:
        return baseIncrease;
    }
  }

  /**
   * 計算調整信心度
   */
  private static calculateConfidence(cognitiveLoad: number, performance: number, personalFactors: number): number {
    // 基於數據質量和一致性計算信心度
    let confidence = 0.7; // 基礎信心度

    // 極端情況信心度更高
    if (cognitiveLoad > 0.8 || cognitiveLoad < 0.2) {
      confidence += 0.15;
    }
    
    if (performance > 0.9 || performance < 0.4) {
      confidence += 0.1;
    }

    // 個人因素穩定性影響信心度
    confidence += personalFactors * 0.1;

    return Math.min(Math.max(confidence, 0.3), 0.95);
  }

  /**
   * 生成預期影響描述
   */
  private static generateExpectedImpact(adjustmentType: string, magnitude: string): string {
    const impacts = {
      increase: {
        small: '輕微增加挑戰性，保持學習動力',
        medium: '適度提升難度，促進技能發展',
        large: '顯著增加挑戰，快速提升能力'
      },
      decrease: {
        small: '輕微降低壓力，改善學習體驗',
        medium: '適度減少負荷，重建學習信心',
        large: '大幅降低難度，確保學習成功'
      },
      maintain: {
        small: '維持當前學習節奏，穩定進步',
        medium: '保持適中挑戰，持續發展',
        large: '維持最佳學習狀態'
      }
    };

    return impacts[adjustmentType as keyof typeof impacts][magnitude] || '優化學習體驗';
  }

  /**
   * 記錄調整歷史
   */
  private static async recordAdjustment(userId: string, adjustment: DifficultyAdjustment): Promise<void> {
    try {
      await this.prisma.difficultyAdjustment.create({
        data: {
          userId,
          currentDifficulty: adjustment.currentDifficulty,
          recommendedDifficulty: adjustment.recommendedDifficulty,
          adjustmentReason: adjustment.adjustmentReason,
          confidence: adjustment.confidence,
          adjustmentType: adjustment.adjustmentType,
          magnitude: adjustment.magnitude,
          timeline: adjustment.timeline,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('記錄調整歷史失敗:', error);
    }
  }

  /**
   * 獲取調整歷史
   */
  static async getAdjustmentHistory(userId: string, limit: number = 10): Promise<DifficultyAdjustment[]> {
    try {
      const records = await this.prisma.difficultyAdjustment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return records.map(record => ({
        currentDifficulty: record.currentDifficulty,
        recommendedDifficulty: record.recommendedDifficulty,
        adjustmentReason: record.adjustmentReason,
        confidence: record.confidence,
        expectedImpact: '', // 從歷史記錄重建
        adjustmentType: record.adjustmentType as 'increase' | 'decrease' | 'maintain',
        magnitude: record.magnitude as 'small' | 'medium' | 'large',
        timeline: record.timeline as 'immediate' | 'gradual' | 'delayed'
      }));
    } catch (error) {
      console.error('獲取調整歷史失敗:', error);
      return [];
    }
  }

  /**
   * 預測最佳難度
   */
  static async predictOptimalDifficulty(userId: string): Promise<number> {
    try {
      const history = await this.getAdjustmentHistory(userId, 20);
      
      if (history.length === 0) {
        return 0.5; // 默認中等難度
      }

      // 分析歷史趨勢
      const recentAdjustments = history.slice(0, 5);
      const avgDifficulty = recentAdjustments.reduce((sum, adj) => sum + adj.recommendedDifficulty, 0) / recentAdjustments.length;

      return Math.min(Math.max(avgDifficulty, 0.1), 1.0);
    } catch (error) {
      console.error('預測最佳難度失敗:', error);
      return 0.5;
    }
  }
}
