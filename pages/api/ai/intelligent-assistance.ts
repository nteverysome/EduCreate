/**
 * AI智能輔助API
 * 提供內容推薦、難度調整、個人化學習和無障礙輔助的統一API接口
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withTestAuth } from '../../../middleware/withTestAuth';
import { IntelligentRecommendationEngine, RecommendationType } from '../../../lib/ai/IntelligentRecommendationEngine';
import { AdaptiveDifficultyAI, DifficultyStrategy } from '../../../lib/ai/AdaptiveDifficultyAI';
import { PersonalizedLearningSystem } from '../../../lib/ai/PersonalizedLearningSystem';
import { AIAccessibilityHelper } from '../../../lib/ai/AIAccessibilityHelper';

async function intelligentAssistanceHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  if (!session && !(req as any).testUser) {
    return res.status(401).json({ 
      error: '未授權訪問',
      message: '請先登入以使用AI智能輔助功能',
      code: 'UNAUTHORIZED'
    });
  }

  const { method } = req;
  const { action } = req.query;

  try {
    switch (method) {
      case 'GET':
        return await handleGetRequest(req, res, user, action as string);
      case 'POST':
        return await handlePostRequest(req, res, user, action as string);
      default:
        return res.status(405).json({ error: '方法不允許' });
    }
  } catch (error) {
    console.error('AI智能輔助API錯誤:', error);
    return res.status(500).json({
      error: 'AI服務暫時不可用',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'AI_SERVICE_ERROR'
    });
  }
}

/**
 * 處理GET請求
 */
async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
  action: string
) {
  switch (action) {
    case 'recommendations':
      return await getRecommendations(req, res, user);
    case 'difficulty-analysis':
      return await getDifficultyAnalysis(req, res, user);
    case 'learning-path':
      return await getLearningPath(req, res, user);
    case 'accessibility-profile':
      return await getAccessibilityProfile(req, res, user);
    case 'adjustment-history':
      return await getAdjustmentHistory(req, res, user);
    default:
      return res.status(400).json({ error: '無效的操作類型' });
  }
}

/**
 * 處理POST請求
 */
async function handlePostRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
  action: string
) {
  switch (action) {
    case 'generate-recommendations':
      return await generateRecommendations(req, res, user);
    case 'analyze-difficulty':
      return await analyzeDifficulty(req, res, user);
    case 'create-learning-path':
      return await createLearningPath(req, res, user);
    case 'adapt-content':
      return await adaptContent(req, res, user);
    case 'analyze-accessibility':
      return await analyzeAccessibility(req, res, user);
    default:
      return res.status(400).json({ error: '無效的操作類型' });
  }
}

/**
 * 獲取推薦內容
 */
async function getRecommendations(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { 
    types,
    maxRecommendations = 10,
    includeReasons = true 
  } = req.query;

  const recommendationTypes = types ? 
    (types as string).split(',') as RecommendationType[] : 
    undefined;

  const result = await IntelligentRecommendationEngine.generateRecommendations(
    user.id,
    {
      maxRecommendations: Number(maxRecommendations),
      types: recommendationTypes
    }
  );

  return res.status(200).json({
    success: true,
    data: result,
    meta: {
      userId: user.id,
      timestamp: new Date().toISOString(),
      requestedTypes: recommendationTypes,
      totalRecommendations: result.recommendations.length
    }
  });
}

/**
 * 生成個人化推薦
 */
async function generateRecommendations(req: NextApiRequest, res: NextApiResponse, user: any) {
  const {
    types = [],
    maxRecommendations = 10,
    weights = {},
    context = {}
  } = req.body;

  const result = await IntelligentRecommendationEngine.generateRecommendations(
    user.id,
    {
      maxRecommendations,
      types,
      weights,
      context
    }
  );

  return res.status(200).json({
    success: true,
    data: result,
    message: '成功生成個人化推薦'
  });
}

/**
 * 分析難度調整
 */
async function analyzeDifficulty(req: NextApiRequest, res: NextApiResponse, user: any) {
  const {
    learnerState,
    strategy = DifficultyStrategy.ADAPTIVE
  } = req.body;

  if (!learnerState) {
    return res.status(400).json({
      error: '缺少學習者狀態數據',
      message: '請提供完整的學習者狀態信息'
    });
  }

  const adjustment = await AdaptiveDifficultyAI.analyzeDifficulty(
    learnerState,
    strategy
  );

  return res.status(200).json({
    success: true,
    data: adjustment,
    message: '成功分析難度調整建議'
  });
}

/**
 * 獲取難度分析歷史
 */
async function getDifficultyAnalysis(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { limit = 10 } = req.query;

  const history = await AdaptiveDifficultyAI.getAdjustmentHistory(
    user.id,
    Number(limit)
  );

  const optimalDifficulty = await AdaptiveDifficultyAI.predictOptimalDifficulty(user.id);

  return res.status(200).json({
    success: true,
    data: {
      history,
      optimalDifficulty,
      recommendations: history.slice(0, 3) // 最近3次調整
    }
  });
}

/**
 * 創建個人化學習路徑
 */
async function createLearningPath(req: NextApiRequest, res: NextApiResponse, user: any) {
  const {
    goals = [],
    preferences,
    currentLevel
  } = req.body;

  if (!preferences) {
    return res.status(400).json({
      error: '缺少學習偏好設定',
      message: '請提供學習偏好信息'
    });
  }

  const learningPath = await PersonalizedLearningSystem.generateLearningPath(
    user.id,
    goals,
    preferences,
    currentLevel
  );

  const recommendations = await PersonalizedLearningSystem.generatePersonalizationRecommendations(
    user.id,
    learningPath
  );

  return res.status(200).json({
    success: true,
    data: {
      learningPath,
      recommendations
    },
    message: '成功創建個人化學習路徑'
  });
}

/**
 * 獲取學習路徑
 */
async function getLearningPath(req: NextApiRequest, res: NextApiResponse, user: any) {
  // 這裡應該從數據庫獲取用戶的學習路徑
  // 暫時返回模擬數據
  return res.status(200).json({
    success: true,
    data: {
      currentPath: null,
      availablePaths: [],
      progress: 0
    },
    message: '暫無學習路徑數據'
  });
}

/**
 * 分析無障礙需求
 */
async function analyzeAccessibility(req: NextApiRequest, res: NextApiResponse, user: any) {
  const {
    behaviorData,
    deviceInfo
  } = req.body;

  const profile = await AIAccessibilityHelper.analyzeAccessibilityNeeds(
    user.id,
    behaviorData,
    deviceInfo
  );

  const recommendations = await AIAccessibilityHelper.generateAccessibilityRecommendations(
    profile
  );

  return res.status(200).json({
    success: true,
    data: {
      profile,
      recommendations
    },
    message: '成功分析無障礙需求'
  });
}

/**
 * 適配內容
 */
async function adaptContent(req: NextApiRequest, res: NextApiResponse, user: any) {
  const {
    content,
    accessibilityProfile,
    context
  } = req.body;

  if (!content || !accessibilityProfile) {
    return res.status(400).json({
      error: '缺少必要參數',
      message: '請提供內容和無障礙配置信息'
    });
  }

  const adaptation = await AIAccessibilityHelper.adaptContent(
    content,
    accessibilityProfile,
    context
  );

  return res.status(200).json({
    success: true,
    data: adaptation,
    message: '成功適配內容'
  });
}

/**
 * 獲取無障礙配置
 */
async function getAccessibilityProfile(req: NextApiRequest, res: NextApiResponse, user: any) {
  const profile = await AIAccessibilityHelper.analyzeAccessibilityNeeds(user.id);

  return res.status(200).json({
    success: true,
    data: profile
  });
}

/**
 * 獲取調整歷史
 */
async function getAdjustmentHistory(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { type = 'difficulty', limit = 20 } = req.query;

  let history = [];

  switch (type) {
    case 'difficulty':
      history = await AdaptiveDifficultyAI.getAdjustmentHistory(user.id, Number(limit));
      break;
    default:
      return res.status(400).json({ error: '無效的歷史類型' });
  }

  return res.status(200).json({
    success: true,
    data: {
      type,
      history,
      total: history.length
    }
  });
}

// 使用測試認證中間件包裝處理器
export default withTestAuth(intelligentAssistanceHandler);
