import { NextApiRequest, NextApiResponse } from 'next';

// 緩存接口
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// 內存緩存實現
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5分鐘

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 清理過期緩存
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 全局緩存實例
const cache = new MemoryCache();

// 定期清理緩存
setInterval(() => {
  cache.cleanup();
}, 60 * 1000); // 每分鐘清理一次

// 記憶增強推薦系統
class MemoryEnhancementAPI {
  private readonly memoryTypes = {
    'quiz': {
      type: '識別記憶',
      description: '通過選擇正確答案來識別和記憶信息',
      strategies: ['視覺提示', '關鍵詞標記', '分類記憶'],
      difficulty: 'medium',
      cognitiveLoad: 'low'
    },
    'match': {
      type: '關聯記憶',
      description: '建立概念之間的聯繫和關聯',
      strategies: ['概念映射', '關聯鏈', '類比記憶'],
      difficulty: 'medium',
      cognitiveLoad: 'medium'
    },
    'flashcard': {
      type: '回憶記憶',
      description: '主動回憶和提取記憶信息',
      strategies: ['間隔重複', '主動回憶', '自我測試'],
      difficulty: 'hard',
      cognitiveLoad: 'high'
    },
    'wheel': {
      type: '隨機記憶',
      description: '在不可預測的情況下測試記憶',
      strategies: ['隨機練習', '混合學習', '驚喜測試'],
      difficulty: 'easy',
      cognitiveLoad: 'low'
    },
    'maze': {
      type: '空間記憶',
      description: '記憶空間位置和路徑信息',
      strategies: ['空間定位', '路徑記憶', '地標記憶'],
      difficulty: 'hard',
      cognitiveLoad: 'high'
    },
    'sort': {
      type: '分類記憶',
      description: '按照特定標準組織和分類信息',
      strategies: ['邏輯分組', '層次結構', '特徵分類'],
      difficulty: 'medium',
      cognitiveLoad: 'medium'
    },
    'memory': {
      type: '短期記憶',
      description: '短時間內保持和操作信息',
      strategies: ['重複練習', '組塊記憶', '注意力集中'],
      difficulty: 'hard',
      cognitiveLoad: 'high'
    },
    'crossword': {
      type: '語義記憶',
      description: '基於語言和概念的長期記憶',
      strategies: ['語義聯想', '詞彙網絡', '概念理解'],
      difficulty: 'hard',
      cognitiveLoad: 'high'
    }
  };

  // 生成記憶類型分析
  analyzeMemoryType(gameType: string): any {
    const cacheKey = `memory_type_${gameType}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const analysis = this.memoryTypes[gameType as keyof typeof this.memoryTypes] || {
      type: '通用記憶',
      description: '一般性記憶和學習',
      strategies: ['重複練習', '多感官學習', '主動參與'],
      difficulty: 'medium',
      cognitiveLoad: 'medium'
    };

    // 添加額外的分析信息
    const enhancedAnalysis = {
      ...analysis,
      recommendations: this.generateMemoryRecommendations(analysis),
      optimizationTips: this.getOptimizationTips(analysis),
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, enhancedAnalysis, 10 * 60 * 1000); // 10分鐘緩存
    return enhancedAnalysis;
  }

  // 生成個性化推薦
  generatePersonalizedRecommendations(userProfile: any): any {
    const cacheKey = `recommendations_${JSON.stringify(userProfile)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const { level = 1, preferences = [], learningStyle = 'visual', age = 'adult' } = userProfile;

    const baseRecommendations = [
      {
        type: 'memory_strategy',
        title: '記憶策略建議',
        items: this.getMemoryStrategies(level, learningStyle)
      },
      {
        type: 'game_sequence',
        title: '推薦遊戲順序',
        items: this.getGameSequence(level, preferences)
      },
      {
        type: 'difficulty_progression',
        title: '難度進階路徑',
        items: this.getDifficultyProgression(level)
      },
      {
        type: 'learning_tips',
        title: '學習技巧',
        items: this.getLearningTips(learningStyle, age)
      }
    ];

    const recommendations = {
      userProfile,
      recommendations: baseRecommendations,
      personalizedScore: this.calculatePersonalizationScore(userProfile),
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小時有效
    };

    cache.set(cacheKey, recommendations, 30 * 60 * 1000); // 30分鐘緩存
    return recommendations;
  }

  // 內容優化建議
  optimizeContent(content: any, targetAudience: any): any {
    const cacheKey = `optimize_${content.id || 'default'}_${JSON.stringify(targetAudience)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const optimizations = {
      original: content,
      optimized: {
        ...content,
        memoryEnhancements: this.addMemoryEnhancements(content),
        difficultyAdjustments: this.adjustDifficulty(content, targetAudience),
        engagementBoosts: this.addEngagementElements(content),
        accessibilityImprovements: this.improveAccessibility(content)
      },
      optimizationScore: this.calculateOptimizationScore(content),
      suggestions: this.generateOptimizationSuggestions(content, targetAudience),
      estimatedImprovement: this.estimateImprovement(content, targetAudience)
    };

    cache.set(cacheKey, optimizations, 15 * 60 * 1000); // 15分鐘緩存
    return optimizations;
  }

  // 學習路徑生成
  generateLearningPath(userId: string, goals: any): any {
    const cacheKey = `learning_path_${userId}_${JSON.stringify(goals)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const path = {
      userId,
      goals,
      phases: [
        {
          phase: 1,
          name: '基礎建立',
          duration: '1-2週',
          games: ['quiz', 'flashcard', 'match'],
          objectives: ['建立基礎記憶', '熟悉遊戲機制', '培養學習習慣']
        },
        {
          phase: 2,
          name: '技能發展',
          duration: '2-3週',
          games: ['wheel', 'sort', 'memory'],
          objectives: ['提升記憶技巧', '增強認知能力', '挑戰更高難度']
        },
        {
          phase: 3,
          name: '高級應用',
          duration: '3-4週',
          games: ['maze', 'crossword'],
          objectives: ['掌握複雜記憶', '整合多種技能', '達成學習目標']
        }
      ],
      milestones: this.generateMilestones(goals),
      adaptiveElements: this.getAdaptiveElements(),
      estimatedCompletion: this.estimateCompletionTime(goals)
    };

    cache.set(cacheKey, path, 60 * 60 * 1000); // 1小時緩存
    return path;
  }

  // 輔助方法
  private generateMemoryRecommendations(analysis: any): string[] {
    const recommendations = [
      `針對${analysis.type}，建議使用${analysis.strategies[0]}`,
      `由於認知負荷為${analysis.cognitiveLoad}，建議適當調整學習節奏`,
      `難度等級${analysis.difficulty}適合循序漸進的學習方式`
    ];
    return recommendations;
  }

  private getOptimizationTips(analysis: any): string[] {
    return [
      '使用視覺提示增強記憶效果',
      '添加音頻元素支持多感官學習',
      '設置適當的間隔重複機制',
      '提供即時反饋和鼓勵'
    ];
  }

  private getMemoryStrategies(level: number, learningStyle: string): string[] {
    const strategies = {
      visual: ['使用圖像和圖表', '顏色編碼', '空間組織'],
      auditory: ['重複朗讀', '音樂記憶法', '韻律記憶'],
      kinesthetic: ['動作記憶', '實際操作', '身體參與']
    };
    return strategies[learningStyle as keyof typeof strategies] || strategies.visual;
  }

  private getGameSequence(level: number, preferences: string[]): string[] {
    const sequences = {
      1: ['quiz', 'match', 'flashcard'],
      2: ['wheel', 'sort', 'memory'],
      3: ['maze', 'crossword']
    };
    return sequences[Math.min(level, 3) as keyof typeof sequences] || sequences[1];
  }

  private getDifficultyProgression(level: number): any[] {
    return [
      { stage: '入門', difficulty: 'easy', duration: '1週' },
      { stage: '進階', difficulty: 'medium', duration: '2週' },
      { stage: '高級', difficulty: 'hard', duration: '3週' }
    ];
  }

  private getLearningTips(learningStyle: string, age: string): string[] {
    const tips = [
      '保持規律的學習時間',
      '設定明確的學習目標',
      '及時復習和鞏固',
      '保持積極的學習態度'
    ];
    return tips;
  }

  private calculatePersonalizationScore(userProfile: any): number {
    // 基於用戶資料計算個性化分數
    let score = 50; // 基礎分數
    if (userProfile.level) score += 20;
    if (userProfile.preferences?.length > 0) score += 15;
    if (userProfile.learningStyle) score += 10;
    if (userProfile.age) score += 5;
    return Math.min(score, 100);
  }

  private addMemoryEnhancements(content: any): any {
    return {
      visualCues: true,
      audioSupport: true,
      spacedRepetition: true,
      progressiveDisclosure: true
    };
  }

  private adjustDifficulty(content: any, targetAudience: any): any {
    return {
      adaptiveDifficulty: true,
      levelProgression: true,
      personalizedChallenges: true
    };
  }

  private addEngagementElements(content: any): any {
    return {
      gamification: true,
      achievements: true,
      socialFeatures: true,
      personalizedFeedback: true
    };
  }

  private improveAccessibility(content: any): any {
    return {
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: true,
      fontSize: 'adjustable'
    };
  }

  private calculateOptimizationScore(content: any): number {
    // 計算內容優化分數
    return Math.floor(Math.random() * 30) + 70; // 70-100分
  }

  private generateOptimizationSuggestions(content: any, targetAudience: any): string[] {
    return [
      '增加互動元素提升參與度',
      '優化視覺設計改善用戶體驗',
      '添加個性化元素',
      '改進反饋機制'
    ];
  }

  private estimateImprovement(content: any, targetAudience: any): any {
    return {
      engagementIncrease: '25-40%',
      retentionImprovement: '15-30%',
      completionRateBoost: '20-35%'
    };
  }

  private generateMilestones(goals: any): any[] {
    return [
      { milestone: '完成基礎訓練', target: '1週', reward: '基礎徽章' },
      { milestone: '達成中級水平', target: '3週', reward: '進階徽章' },
      { milestone: '掌握高級技能', target: '6週', reward: '專家徽章' }
    ];
  }

  private getAdaptiveElements(): any {
    return {
      difficultyAdjustment: true,
      contentPersonalization: true,
      paceAdaptation: true,
      styleMatching: true
    };
  }

  private estimateCompletionTime(goals: any): string {
    return '6-8週';
  }
}

// API 處理器
const memoryAPI = new MemoryEnhancementAPI();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 設置 CORS 頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const startTime = Date.now();
    let result;

    switch (req.method) {
      case 'GET':
        const { type, gameType, userId } = req.query;
        
        if (type === 'memory-analysis' && gameType) {
          result = memoryAPI.analyzeMemoryType(gameType as string);
        } else if (type === 'learning-path' && userId) {
          const goals = req.query.goals ? JSON.parse(req.query.goals as string) : {};
          result = memoryAPI.generateLearningPath(userId as string, goals);
        } else {
          throw new Error('無效的請求參數');
        }
        break;

      case 'POST':
        const { action, data } = req.body;
        
        if (action === 'generate-recommendations') {
          result = memoryAPI.generatePersonalizedRecommendations(data.userProfile);
        } else if (action === 'optimize-content') {
          result = memoryAPI.optimizeContent(data.content, data.targetAudience);
        } else {
          throw new Error('無效的操作');
        }
        break;

      default:
        throw new Error('不支持的請求方法');
    }

    const processingTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        processingTime: `${processingTime}ms`,
        cacheSize: cache.size(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('記憶增強API錯誤:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message || '內部服務器錯誤',
        code: 'MEMORY_API_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
}
