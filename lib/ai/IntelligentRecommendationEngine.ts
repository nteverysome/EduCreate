/**
 * 智能內容推薦引擎
 * 基於記憶科學原理和學習數據的個人化內容推薦系統
 */

import { PrismaClient } from '@prisma/client';

// 推薦類型
export enum RecommendationType {
  CONTENT = 'content',           // 內容推薦
  GAME_TYPE = 'game_type',      // 遊戲類型推薦
  DIFFICULTY = 'difficulty',     // 難度推薦
  LEARNING_PATH = 'learning_path', // 學習路徑推薦
  REVIEW_SCHEDULE = 'review_schedule', // 復習計劃推薦
  STUDY_TIME = 'study_time'     // 學習時間推薦
}

// 推薦權重因子
export interface RecommendationWeights {
  learningHistory: number;      // 學習歷史權重
  performance: number;          // 表現權重
  preferences: number;          // 偏好權重
  memoryRetention: number;      // 記憶保持率權重
  timeOfDay: number;           // 時間因子權重
  difficulty: number;          // 難度適配權重
  geptLevel: number;           // GEPT等級權重
  socialLearning: number;      // 社交學習權重
}

// 學習者檔案
export interface LearnerProfile {
  userId: string;
  geptLevel: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredGameTypes: string[];
  optimalDifficulty: number;
  averageSessionLength: number;
  bestPerformanceTime: string[];
  weakAreas: string[];
  strongAreas: string[];
  memoryRetentionRate: number;
  motivationLevel: number;
  consistencyScore: number;
}

// 推薦項目
export interface RecommendationItem {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;          // 推薦信心度 (0-1)
  priority: number;           // 優先級 (1-10)
  reasoning: string[];        // 推薦理由
  expectedBenefit: string;    // 預期效益
  estimatedTime: number;      // 預估時間(分鐘)
  difficulty: number;         // 難度級別
  tags: string[];            // 標籤
  metadata: {
    contentId?: string;
    gameType?: string;
    targetSkills?: string[];
    memoryTechniques?: string[];
    adaptiveFactors?: string[];
  };
}

// 推薦結果
export interface RecommendationResult {
  userId: string;
  timestamp: Date;
  recommendations: RecommendationItem[];
  learnerProfile: LearnerProfile;
  sessionContext: {
    timeOfDay: string;
    dayOfWeek: string;
    sessionNumber: number;
    recentPerformance: number;
    energyLevel: number;
  };
  metadata: {
    algorithmVersion: string;
    processingTime: number;
    dataPoints: number;
    confidenceScore: number;
  };
}

export class IntelligentRecommendationEngine {
  private static prisma = new PrismaClient();
  
  // 默認推薦權重
  private static readonly DEFAULT_WEIGHTS: RecommendationWeights = {
    learningHistory: 0.25,
    performance: 0.20,
    preferences: 0.15,
    memoryRetention: 0.15,
    timeOfDay: 0.10,
    difficulty: 0.10,
    geptLevel: 0.03,
    socialLearning: 0.02
  };

  /**
   * 生成個人化推薦
   */
  static async generateRecommendations(
    userId: string,
    options: {
      maxRecommendations?: number;
      types?: RecommendationType[];
      weights?: Partial<RecommendationWeights>;
      context?: any;
    } = {}
  ): Promise<RecommendationResult> {
    const startTime = Date.now();
    
    try {
      // 1. 構建學習者檔案
      const learnerProfile = await this.buildLearnerProfile(userId);
      
      // 2. 獲取會話上下文
      const sessionContext = await this.getSessionContext(userId);
      
      // 3. 合併推薦權重
      const weights = { ...this.DEFAULT_WEIGHTS, ...options.weights };
      
      // 4. 生成各類型推薦
      const recommendations: RecommendationItem[] = [];
      const targetTypes = options.types || Object.values(RecommendationType);
      
      for (const type of targetTypes) {
        const typeRecommendations = await this.generateTypeSpecificRecommendations(
          type,
          learnerProfile,
          sessionContext,
          weights
        );
        recommendations.push(...typeRecommendations);
      }
      
      // 5. 排序和過濾推薦
      const sortedRecommendations = this.rankRecommendations(recommendations, weights);
      const finalRecommendations = sortedRecommendations.slice(0, options.maxRecommendations || 10);
      
      // 6. 計算整體信心度
      const confidenceScore = this.calculateOverallConfidence(finalRecommendations);
      
      return {
        userId,
        timestamp: new Date(),
        recommendations: finalRecommendations,
        learnerProfile,
        sessionContext,
        metadata: {
          algorithmVersion: '2.0.0',
          processingTime: Date.now() - startTime,
          dataPoints: recommendations.length,
          confidenceScore
        }
      };
    } catch (error) {
      console.error('推薦生成失敗:', error);
      throw new Error('無法生成個人化推薦');
    }
  }

  /**
   * 構建學習者檔案
   */
  private static async buildLearnerProfile(userId: string): Promise<LearnerProfile> {
    // 獲取用戶基本信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        activities: {
          include: {
            gameResults: true,
            learningProgress: true
          }
        },
        userPreferences: true
      }
    });

    if (!user) {
      throw new Error('用戶不存在');
    }

    // 分析學習歷史
    const learningHistory = await this.analyzeLearningHistory(userId);
    
    // 分析表現數據
    const performanceAnalysis = await this.analyzePerformance(userId);
    
    // 分析偏好
    const preferences = await this.analyzePreferences(userId);

    return {
      userId,
      geptLevel: user.userPreferences?.geptLevel || '初級',
      learningStyle: this.determineLearningStyle(learningHistory),
      preferredGameTypes: preferences.gameTypes,
      optimalDifficulty: performanceAnalysis.optimalDifficulty,
      averageSessionLength: learningHistory.averageSessionLength,
      bestPerformanceTime: performanceAnalysis.bestTimes,
      weakAreas: performanceAnalysis.weakAreas,
      strongAreas: performanceAnalysis.strongAreas,
      memoryRetentionRate: performanceAnalysis.retentionRate,
      motivationLevel: this.calculateMotivationLevel(learningHistory),
      consistencyScore: this.calculateConsistencyScore(learningHistory)
    };
  }

  /**
   * 獲取會話上下文
   */
  private static async getSessionContext(userId: string): Promise<any> {
    const now = new Date();
    const recentSessions = await this.getRecentSessions(userId, 7); // 最近7天
    
    return {
      timeOfDay: this.getTimeOfDay(now),
      dayOfWeek: now.toLocaleDateString('zh-TW', { weekday: 'long' }),
      sessionNumber: await this.getTodaySessionNumber(userId),
      recentPerformance: this.calculateRecentPerformance(recentSessions),
      energyLevel: this.estimateEnergyLevel(now, recentSessions)
    };
  }

  /**
   * 生成特定類型推薦
   */
  private static async generateTypeSpecificRecommendations(
    type: RecommendationType,
    profile: LearnerProfile,
    context: any,
    weights: RecommendationWeights
  ): Promise<RecommendationItem[]> {
    switch (type) {
      case RecommendationType.CONTENT:
        return this.generateContentRecommendations(profile, context, weights);
      case RecommendationType.GAME_TYPE:
        return this.generateGameTypeRecommendations(profile, context, weights);
      case RecommendationType.DIFFICULTY:
        return this.generateDifficultyRecommendations(profile, context, weights);
      case RecommendationType.LEARNING_PATH:
        return this.generateLearningPathRecommendations(profile, context, weights);
      case RecommendationType.REVIEW_SCHEDULE:
        return this.generateReviewScheduleRecommendations(profile, context, weights);
      case RecommendationType.STUDY_TIME:
        return this.generateStudyTimeRecommendations(profile, context, weights);
      default:
        return [];
    }
  }

  /**
   * 生成內容推薦
   */
  private static async generateContentRecommendations(
    profile: LearnerProfile,
    context: any,
    weights: RecommendationWeights
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];
    
    // 基於弱項推薦復習內容
    for (const weakArea of profile.weakAreas) {
      recommendations.push({
        id: `content_weak_${weakArea}`,
        type: RecommendationType.CONTENT,
        title: `加強 ${weakArea} 練習`,
        description: `針對您在 ${weakArea} 方面的薄弱環節，推薦相關練習內容`,
        confidence: 0.85,
        priority: 9,
        reasoning: [
          `您在 ${weakArea} 的表現需要改善`,
          '針對性練習可以快速提升',
          '符合您的GEPT等級要求'
        ],
        expectedBenefit: `提升 ${weakArea} 能力，增強整體學習效果`,
        estimatedTime: 15,
        difficulty: profile.optimalDifficulty,
        tags: [weakArea, '復習', '加強'],
        metadata: {
          targetSkills: [weakArea],
          memoryTechniques: ['主動回憶', '間隔重複'],
          adaptiveFactors: ['表現分析', '個人化難度']
        }
      });
    }

    // 基於記憶保持率推薦復習
    if (profile.memoryRetentionRate < 0.7) {
      recommendations.push({
        id: 'content_memory_boost',
        type: RecommendationType.CONTENT,
        title: '記憶強化練習',
        description: '基於遺忘曲線的智能復習計劃，提升記憶保持率',
        confidence: 0.90,
        priority: 8,
        reasoning: [
          '您的記憶保持率偏低',
          '間隔重複可以顯著改善記憶效果',
          '個人化復習計劃更有效'
        ],
        expectedBenefit: '提升記憶保持率至80%以上',
        estimatedTime: 20,
        difficulty: profile.optimalDifficulty - 0.5,
        tags: ['記憶', '復習', '間隔重複'],
        metadata: {
          memoryTechniques: ['間隔重複', '主動回憶', '記憶宮殿'],
          adaptiveFactors: ['記憶曲線', '個人化間隔']
        }
      });
    }

    return recommendations;
  }

  /**
   * 生成遊戲類型推薦
   */
  private static async generateGameTypeRecommendations(
    profile: LearnerProfile,
    context: any,
    weights: RecommendationWeights
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];
    
    // 基於學習風格推薦遊戲類型
    const gameTypeMapping = {
      visual: ['matching', 'flashcards', 'sequence'],
      auditory: ['pronunciation', 'listening', 'fill-in'],
      kinesthetic: ['drag-drop', 'sequence', 'categorize'],
      mixed: ['quiz', 'matching', 'fill-in']
    };

    const recommendedTypes = gameTypeMapping[profile.learningStyle] || gameTypeMapping.mixed;
    
    for (const gameType of recommendedTypes) {
      if (!profile.preferredGameTypes.includes(gameType)) {
        recommendations.push({
          id: `game_type_${gameType}`,
          type: RecommendationType.GAME_TYPE,
          title: `嘗試 ${gameType} 遊戲`,
          description: `基於您的學習風格，${gameType} 遊戲可能更適合您`,
          confidence: 0.75,
          priority: 6,
          reasoning: [
            `符合您的 ${profile.learningStyle} 學習風格`,
            '可以提供不同的學習體驗',
            '有助於全面發展學習能力'
          ],
          expectedBenefit: '擴展學習方式，提升學習興趣',
          estimatedTime: 10,
          difficulty: profile.optimalDifficulty,
          tags: [gameType, '新體驗', '學習風格'],
          metadata: {
            gameType,
            targetSkills: ['多元學習'],
            adaptiveFactors: ['學習風格匹配']
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * 排序推薦項目
   */
  private static rankRecommendations(
    recommendations: RecommendationItem[],
    weights: RecommendationWeights
  ): RecommendationItem[] {
    return recommendations.sort((a, b) => {
      // 綜合評分 = 信心度 * 優先級 * 權重調整
      const scoreA = a.confidence * a.priority * this.calculateWeightedScore(a, weights);
      const scoreB = b.confidence * b.priority * this.calculateWeightedScore(b, weights);
      
      return scoreB - scoreA;
    });
  }

  /**
   * 計算加權分數
   */
  private static calculateWeightedScore(item: RecommendationItem, weights: RecommendationWeights): number {
    let score = 1.0;
    
    // 根據推薦類型調整權重
    switch (item.type) {
      case RecommendationType.CONTENT:
        score *= (weights.learningHistory + weights.performance) / 2;
        break;
      case RecommendationType.GAME_TYPE:
        score *= weights.preferences;
        break;
      case RecommendationType.DIFFICULTY:
        score *= weights.difficulty;
        break;
      default:
        score *= 1.0;
    }
    
    return score;
  }

  /**
   * 計算整體信心度
   */
  private static calculateOverallConfidence(recommendations: RecommendationItem[]): number {
    if (recommendations.length === 0) return 0;
    
    const totalConfidence = recommendations.reduce((sum, item) => sum + item.confidence, 0);
    return totalConfidence / recommendations.length;
  }

  // 輔助方法實現
  private static async analyzeLearningHistory(userId: string): Promise<any> {
    // 實現學習歷史分析邏輯
    return {
      averageSessionLength: 25, // 分鐘
      totalSessions: 50,
      consistentDays: 30
    };
  }

  private static async analyzePerformance(userId: string): Promise<any> {
    // 實現表現分析邏輯
    return {
      optimalDifficulty: 0.7,
      bestTimes: ['09:00-11:00', '19:00-21:00'],
      weakAreas: ['語法', '聽力'],
      strongAreas: ['詞彙', '閱讀'],
      retentionRate: 0.65
    };
  }

  private static async analyzePreferences(userId: string): Promise<any> {
    // 實現偏好分析邏輯
    return {
      gameTypes: ['matching', 'quiz'],
      studyTimes: ['morning', 'evening'],
      difficulty: 'medium'
    };
  }

  private static determineLearningStyle(history: any): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    // 基於學習歷史確定學習風格
    return 'mixed';
  }

  private static calculateMotivationLevel(history: any): number {
    // 計算動機水平
    return 0.8;
  }

  private static calculateConsistencyScore(history: any): number {
    // 計算一致性分數
    return 0.75;
  }

  private static getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private static async getRecentSessions(userId: string, days: number): Promise<any[]> {
    // 獲取最近的學習會話
    return [];
  }

  private static async getTodaySessionNumber(userId: string): Promise<number> {
    // 獲取今天的會話編號
    return 1;
  }

  private static calculateRecentPerformance(sessions: any[]): number {
    // 計算最近表現
    return 0.75;
  }

  private static estimateEnergyLevel(time: Date, sessions: any[]): number {
    // 估算能量水平
    return 0.8;
  }

  // 其他推薦生成方法的簡化實現
  private static async generateDifficultyRecommendations(profile: LearnerProfile, context: any, weights: RecommendationWeights): Promise<RecommendationItem[]> {
    return [];
  }

  private static async generateLearningPathRecommendations(profile: LearnerProfile, context: any, weights: RecommendationWeights): Promise<RecommendationItem[]> {
    return [];
  }

  private static async generateReviewScheduleRecommendations(profile: LearnerProfile, context: any, weights: RecommendationWeights): Promise<RecommendationItem[]> {
    return [];
  }

  private static async generateStudyTimeRecommendations(profile: LearnerProfile, context: any, weights: RecommendationWeights): Promise<RecommendationItem[]> {
    return [];
  }
}
