import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

interface MemoryAnalysis {
  userId: string;
  totalActivities: number;
  averageScore: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendedTemplates: string[];
  learningPattern: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  retentionRate: number;
  improvementSuggestions: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 模擬記憶分析數據（實際應用中會從數據庫查詢）
    const analysis = await generateMemoryAnalysis(session.user.email);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Memory analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateMemoryAnalysis(userEmail: string): Promise<MemoryAnalysis> {
  // 在實際應用中，這裡會查詢數據庫獲取用戶的學習數據
  // 目前返回模擬數據
  
  const mockAnalysis: MemoryAnalysis = {
    userId: userEmail,
    totalActivities: 24,
    averageScore: 87,
    strongAreas: [
      '英語詞彙記憶',
      '視覺配對能力',
      '短期記憶表現'
    ],
    weakAreas: [
      '數學概念理解',
      '長期記憶保持',
      '複雜問題解決'
    ],
    recommendedTemplates: [
      '單字卡片練習',
      '配對遊戲強化',
      '記憶宮殿訓練',
      '間隔重複練習'
    ],
    learningPattern: 'visual',
    retentionRate: 78,
    improvementSuggestions: [
      '建議每天進行 15-20 分鐘的間隔重複練習，提高長期記憶保持率',
      '嘗試使用記憶宮殿技巧來記憶複雜的概念和信息',
      '在學習數學概念時，多使用視覺化工具和圖表輔助理解',
      '設定每週學習目標，保持持續的學習動機和進度追蹤',
      '結合多種感官進行學習，如聽覺提示和觸覺操作',
      '定期回顧之前學過的內容，鞏固已掌握的知識點'
    ]
  };

  return mockAnalysis;
}

// 輔助函數：分析學習模式
function analyzeLearningPattern(userSessions: any[]): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
  // 基於用戶的遊戲偏好和表現分析學習模式
  // 這裡是簡化的邏輯，實際應用中會更複雜
  
  const visualGames = ['matching', 'flashcards', 'memory'];
  const auditoryGames = ['pronunciation', 'listening'];
  const kinestheticGames = ['drag-drop', 'sorting', 'maze'];
  
  // 模擬分析邏輯
  return 'visual';
}

// 輔助函數：計算記憶保持率
function calculateRetentionRate(userSessions: any[]): number {
  // 基於用戶在不同時間間隔的表現計算記憶保持率
  // 這裡返回模擬數據
  return Math.floor(Math.random() * 20) + 70; // 70-90%
}

// 輔助函數：識別強項和弱項
function identifyStrengthsAndWeaknesses(userSessions: any[]) {
  // 基於用戶在不同主題和遊戲類型的表現
  // 識別學習強項和需要改進的領域
  
  const strongAreas = [
    '英語詞彙記憶',
    '視覺配對能力',
    '短期記憶表現',
    '邏輯推理能力',
    '模式識別技能'
  ];
  
  const weakAreas = [
    '數學概念理解',
    '長期記憶保持',
    '複雜問題解決',
    '抽象思維能力',
    '注意力持續時間'
  ];
  
  return {
    strongAreas: strongAreas.slice(0, 3),
    weakAreas: weakAreas.slice(0, 3)
  };
}

// 輔助函數：生成個性化建議
function generateImprovementSuggestions(analysis: Partial<MemoryAnalysis>): string[] {
  const suggestions = [];
  
  if (analysis.retentionRate && analysis.retentionRate < 80) {
    suggestions.push('建議每天進行 15-20 分鐘的間隔重複練習，提高長期記憶保持率');
  }
  
  if (analysis.learningPattern === 'visual') {
    suggestions.push('嘗試使用記憶宮殿技巧來記憶複雜的概念和信息');
    suggestions.push('在學習數學概念時，多使用視覺化工具和圖表輔助理解');
  }
  
  if (analysis.averageScore && analysis.averageScore < 85) {
    suggestions.push('設定每週學習目標，保持持續的學習動機和進度追蹤');
  }
  
  suggestions.push('結合多種感官進行學習，如聽覺提示和觸覺操作');
  suggestions.push('定期回顧之前學過的內容，鞏固已掌握的知識點');
  
  return suggestions;
}
