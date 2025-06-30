/**
 * 記憶增強推薦 API
 * 基於用戶特徵和學習歷史提供個性化模板推薦
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { MemoryConfigurationManager } from '../../../lib/memory-enhancement/MemoryConfigurationManager';
import { MemoryEnhancementEngine } from '../../../lib/memory-enhancement/MemoryEnhancementEngine';

interface RecommendationRequest {
  userId?: string;
  userLevel?: number;
  preferredMemoryTypes?: string[];
  timeAvailable?: number;
  cognitiveLoad?: 'low' | 'medium' | 'high';
  learningGoals?: string[];
  previousPerformance?: {
    templateId: string;
    score: number;
    completionTime: number;
    difficulty: number;
  }[];
}

interface RecommendationResponse {
  recommendations: {
    templateId: string;
    templateName: string;
    score: number;
    reasons: string[];
    memoryTypes: string[];
    estimatedTime: number;
    difficulty: number;
    enhancementFeatures: string[];
  }[];
  personalizedInsights: {
    strongMemoryTypes: string[];
    improvementAreas: string[];
    recommendedDifficulty: number;
    optimalSessionLength: number;
  };
  learningPath: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecommendationResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      userLevel = 1,
      preferredMemoryTypes = [],
      timeAvailable = 30,
      cognitiveLoad = 'medium',
      learningGoals = [],
      previousPerformance = []
    }: RecommendationRequest = req.body;

    const manager = new MemoryConfigurationManager();
    const engine = new MemoryEnhancementEngine();

    // 生成基礎推薦
    const baseRecommendations = manager.generateLearningPath(
      userLevel,
      preferredMemoryTypes,
      timeAvailable
    );

    // 根據認知負荷篩選
    const cognitiveLoadTemplates = manager.getTemplatesByCognitiveLoad(cognitiveLoad);
    
    // 分析用戶表現
    const performanceAnalysis = analyzeUserPerformance(previousPerformance);
    
    // 計算推薦分數
    const scoredRecommendations = baseRecommendations.map(template => {
      let score = 50; // 基礎分數
      const reasons: string[] = [];

      // 根據用戶級別調整分數
      const difficultyDiff = Math.abs(template.optimalConfiguration.difficultyLevel - userLevel);
      if (difficultyDiff <= 1) {
        score += 20;
        reasons.push('難度適合您的當前水平');
      } else if (difficultyDiff > 2) {
        score -= 15;
        reasons.push('難度可能過高或過低');
      }

      // 根據偏好記憶類型調整分數
      if (preferredMemoryTypes.includes(template.primaryMemoryType)) {
        score += 15;
        reasons.push('符合您偏好的記憶類型');
      }
      if (template.secondaryMemoryTypes.some(type => preferredMemoryTypes.includes(type))) {
        score += 10;
        reasons.push('包含您感興趣的記憶機制');
      }

      // 根據認知負荷調整分數
      const memoryType = engine.getMemoryType(template.primaryMemoryType);
      if (memoryType?.cognitiveLoad === cognitiveLoad) {
        score += 15;
        reasons.push('認知負荷符合您的當前狀態');
      }

      // 根據時間可用性調整分數
      const hasTimeConstraints = template.optimalConfiguration.timeConstraints.enabled;
      const estimatedTime = hasTimeConstraints 
        ? template.optimalConfiguration.timeConstraints.duration / 60 
        : 10; // 默認估計時間

      if (estimatedTime <= timeAvailable) {
        score += 10;
        reasons.push('時間安排合適');
      } else {
        score -= 20;
        reasons.push('可能需要更多時間');
      }

      // 根據歷史表現調整分數
      const pastPerformance = previousPerformance.find(p => p.templateId === template.templateId);
      if (pastPerformance) {
        if (pastPerformance.score >= 80) {
          score += 5;
          reasons.push('您在此類型表現優秀');
        } else if (pastPerformance.score < 60) {
          score += 10;
          reasons.push('建議重複練習以提高');
        }
      }

      // 根據學習目標調整分數
      if (learningGoals.includes('memory-improvement') && 
          template.optimalConfiguration.repetitionSettings.spacedRepetition) {
        score += 10;
        reasons.push('支持記憶力提升');
      }
      if (learningGoals.includes('speed-training') && 
          template.optimalConfiguration.timeConstraints.enabled) {
        score += 10;
        reasons.push('有助於速度訓練');
      }
      if (learningGoals.includes('competitive-learning') && 
          template.optimalConfiguration.competitiveElements.enabled) {
        score += 10;
        reasons.push('支持競爭性學習');
      }

      return {
        templateId: template.templateId,
        templateName: template.templateName,
        score: Math.min(100, Math.max(0, score)),
        reasons,
        memoryTypes: [template.primaryMemoryType, ...template.secondaryMemoryTypes],
        estimatedTime,
        difficulty: template.optimalConfiguration.difficultyLevel,
        enhancementFeatures: template.enhancementFeatures
      };
    });

    // 排序並取前10個推薦
    const topRecommendations = scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // 生成個性化洞察
    const personalizedInsights = generatePersonalizedInsights(
      previousPerformance,
      preferredMemoryTypes,
      userLevel,
      engine
    );

    // 生成學習路徑
    const learningPath = generateLearningPath(
      topRecommendations,
      userLevel,
      timeAvailable
    );

    const response: RecommendationResponse = {
      recommendations: topRecommendations,
      personalizedInsights,
      learningPath
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Memory enhancement recommendation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function analyzeUserPerformance(performance: any[]) {
  if (performance.length === 0) {
    return {
      averageScore: 0,
      averageTime: 0,
      strongAreas: [],
      weakAreas: []
    };
  }

  const averageScore = performance.reduce((sum, p) => sum + p.score, 0) / performance.length;
  const averageTime = performance.reduce((sum, p) => sum + p.completionTime, 0) / performance.length;

  const strongAreas = performance
    .filter(p => p.score >= 80)
    .map(p => p.templateId);

  const weakAreas = performance
    .filter(p => p.score < 60)
    .map(p => p.templateId);

  return {
    averageScore,
    averageTime,
    strongAreas,
    weakAreas
  };
}

function generatePersonalizedInsights(
  performance: any[],
  preferredMemoryTypes: string[],
  userLevel: number,
  engine: MemoryEnhancementEngine
) {
  const analysis = analyzeUserPerformance(performance);
  
  // 識別強項記憶類型
  const strongMemoryTypes = preferredMemoryTypes.length > 0 
    ? preferredMemoryTypes 
    : ['recognition', 'visual-search']; // 默認較容易的類型

  // 識別改進領域
  const allMemoryTypes = engine.getAllMemoryTypes();
  const improvementAreas = allMemoryTypes
    .filter(type => type.cognitiveLoad === 'high' && !strongMemoryTypes.includes(type.id))
    .slice(0, 3)
    .map(type => type.id);

  // 推薦難度
  const recommendedDifficulty = Math.min(5, Math.max(1, userLevel + (analysis.averageScore >= 80 ? 1 : 0)));

  // 最佳學習時長
  const optimalSessionLength = analysis.averageTime > 0 
    ? Math.min(60, Math.max(10, analysis.averageTime * 1.2))
    : 20;

  return {
    strongMemoryTypes,
    improvementAreas,
    recommendedDifficulty,
    optimalSessionLength
  };
}

function generateLearningPath(
  recommendations: any[],
  userLevel: number,
  timeAvailable: number
) {
  const immediate = recommendations
    .filter(r => r.difficulty <= userLevel + 1 && r.estimatedTime <= timeAvailable)
    .slice(0, 3)
    .map(r => r.templateId);

  const shortTerm = recommendations
    .filter(r => r.difficulty <= userLevel + 2)
    .slice(0, 5)
    .map(r => r.templateId);

  const longTerm = recommendations
    .filter(r => r.difficulty <= userLevel + 3)
    .slice(0, 8)
    .map(r => r.templateId);

  return {
    immediate,
    shortTerm,
    longTerm
  };
}
