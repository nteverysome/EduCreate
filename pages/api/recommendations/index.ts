/**
 * 智能推薦 API 端點
 * 提供個性化內容推薦
 */

import { NextApiRequest, NextApiResponse } from 'next';

// 模擬用戶數據
const mockUsers = new Map([
  ['demo-user-1', {
    id: 'demo-user-1',
    preferences: {
      gameTypes: ['quiz', 'flashcards'],
      topics: ['數學', '英語'],
      difficulty: 'medium',
      learningStyle: 'visual'
    },
    behavior: {
      totalSessions: 25,
      averageSessionTime: 15,
      completionRate: 0.85,
      favoriteGameTypes: ['quiz', 'matching'],
      lastActiveAt: new Date()
    }
  }]
]);

// 模擬內容數據
const mockContent = [
  {
    id: 'content-1',
    title: '基礎數學運算',
    type: 'quiz',
    topics: ['數學'],
    difficulty: 'easy',
    rating: 4.5,
    playCount: 150
  },
  {
    id: 'content-2',
    title: '英語單詞學習',
    type: 'flashcards',
    topics: ['英語'],
    difficulty: 'medium',
    rating: 4.2,
    playCount: 120
  },
  {
    id: 'content-3',
    title: '科學知識配對',
    type: 'matching',
    topics: ['科學'],
    difficulty: 'medium',
    rating: 4.7,
    playCount: 200
  },
  {
    id: 'content-4',
    title: '歷史時間線',
    type: 'quiz',
    topics: ['歷史'],
    difficulty: 'hard',
    rating: 4.0,
    playCount: 80
  },
  {
    id: 'content-5',
    title: '地理知識卡片',
    type: 'flashcards',
    topics: ['地理'],
    difficulty: 'medium',
    rating: 4.3,
    playCount: 95
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      context = 'homepage',
      currentActivity,
      filters,
      count = 12,
      includeExplanation = true
    } = req.body;

    // 驗證必要參數
    if (!userId) {
      return res.status(400).json({ 
        error: '缺少必要參數',
        required: ['userId']
      });
    }

    // 獲取用戶資料
    const userProfile = mockUsers.get(userId) || {
      id: userId,
      preferences: {
        gameTypes: ['quiz'],
        topics: ['通用'],
        difficulty: 'medium',
        learningStyle: 'mixed'
      },
      behavior: {
        totalSessions: 0,
        averageSessionTime: 10,
        completionRate: 0.5,
        favoriteGameTypes: ['quiz'],
        lastActiveAt: new Date()
      }
    };

    // 生成推薦
    const recommendations = generateRecommendations(userProfile, context, filters, count);

    // 分類推薦
    const categories = categorizeRecommendations(recommendations);

    // 生成解釋
    const explanations = includeExplanation 
      ? generateExplanations(recommendations, userProfile)
      : undefined;

    return res.status(200).json({
      success: true,
      recommendations,
      totalCount: recommendations.length,
      categories,
      explanations,
      metadata: {
        processingTime: 50, // 模擬處理時間
        algorithmsUsed: ['collaborative', 'content-based', 'behavioral', 'trending'],
        userProfileVersion: userProfile.id,
        context
      }
    });

  } catch (error) {
    console.error('推薦生成失敗:', error);
    return res.status(500).json({
      error: '推薦生成失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 生成推薦
function generateRecommendations(userProfile: any, context: string, filters: any, count: number) {
  const recommendations: any[] = [];

  // 基於用戶偏好的推薦
  const personalizedRecs = mockContent
    .filter(content => {
      // 遊戲類型匹配
      if (userProfile.preferences.gameTypes.includes(content.type)) {
        return true;
      }
      // 主題匹配
      if (content.topics.some((topic: string) => userProfile.preferences.topics.includes(topic))) {
        return true;
      }
      return false;
    })
    .map(content => ({
      contentId: content.id,
      score: calculatePersonalizedScore(content, userProfile),
      confidence: 0.85,
      reasons: getPersonalizedReasons(content, userProfile),
      category: 'personalized',
      metadata: {
        algorithm: 'content-based',
        factors: {
          typeMatch: userProfile.preferences.gameTypes.includes(content.type) ? 1 : 0,
          topicMatch: content.topics.some((topic: string) => userProfile.preferences.topics.includes(topic)) ? 1 : 0
        },
        generatedAt: new Date()
      }
    }));

  recommendations.push(...personalizedRecs);

  // 熱門推薦
  const trendingRecs = mockContent
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3)
    .map((content, index) => ({
      contentId: content.id,
      score: 1 - (index * 0.1),
      confidence: 0.9,
      reasons: ['熱門內容', '高評分', '多人喜愛'],
      category: 'trending',
      metadata: {
        algorithm: 'trending',
        factors: { playCount: content.playCount, rating: content.rating },
        generatedAt: new Date()
      }
    }));

  recommendations.push(...trendingRecs);

  // 基於行為的推薦
  const behavioralRecs = userProfile.behavior.favoriteGameTypes
    .flatMap((gameType: string) => 
      mockContent
        .filter(content => content.type === gameType)
        .slice(0, 2)
        .map(content => ({
          contentId: content.id,
          score: 0.8,
          confidence: 0.75,
          reasons: [`符合您喜愛的遊戲類型：${gameType}`],
          category: 'personalized',
          metadata: {
            algorithm: 'behavioral',
            factors: { gameTypePreference: 1 },
            generatedAt: new Date()
          }
        }))
    );

  recommendations.push(...behavioralRecs);

  // 去重並排序
  const uniqueRecs = recommendations
    .filter((rec, index, self) => 
      index === self.findIndex(r => r.contentId === rec.contentId)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return uniqueRecs;
}

// 計算個性化分數
function calculatePersonalizedScore(content: any, userProfile: any): number {
  let score = 0;

  // 遊戲類型匹配
  if (userProfile.preferences.gameTypes.includes(content.type)) {
    score += 0.4;
  }

  // 主題匹配
  if (content.topics.some((topic: string) => userProfile.preferences.topics.includes(topic))) {
    score += 0.3;
  }

  // 難度匹配
  if (content.difficulty === userProfile.preferences.difficulty) {
    score += 0.2;
  }

  // 評分加權
  score += (content.rating / 5) * 0.1;

  return Math.min(score, 1);
}

// 獲取個性化推薦原因
function getPersonalizedReasons(content: any, userProfile: any): string[] {
  const reasons: string[] = [];

  if (userProfile.preferences.gameTypes.includes(content.type)) {
    reasons.push(`符合您偏好的遊戲類型：${content.type}`);
  }

  if (content.topics.some((topic: string) => userProfile.preferences.topics.includes(topic))) {
    reasons.push('包含您感興趣的主題');
  }

  if (content.difficulty === userProfile.preferences.difficulty) {
    reasons.push('難度適合您的水平');
  }

  if (content.rating >= 4.0) {
    reasons.push('高評分內容');
  }

  return reasons.length > 0 ? reasons : ['推薦給您'];
}

// 分類推薦
function categorizeRecommendations(recommendations: any[]) {
  const categories: { [key: string]: any[] } = {
    trending: [],
    personalized: [],
    similar: [],
    challenge: [],
    review: []
  };

  recommendations.forEach(rec => {
    categories[rec.category].push(rec);
  });

  return categories;
}

// 生成解釋
function generateExplanations(recommendations: any[], userProfile: any) {
  const explanations: { [contentId: string]: string } = {};

  recommendations.forEach(rec => {
    let explanation = `推薦原因：${rec.reasons.join('、')}。`;
    
    if (rec.confidence > 0.8) {
      explanation += ' 我們對這個推薦很有信心。';
    } else if (rec.confidence > 0.6) {
      explanation += ' 這是一個不錯的選擇。';
    } else {
      explanation += ' 您可以嘗試一下。';
    }

    explanations[rec.contentId] = explanation;
  });

  return explanations;
}
