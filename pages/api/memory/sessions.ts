import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

interface LearningSession {
  id: string;
  activityId: string;
  activityTitle: string;
  score: number;
  timeSpent: number;
  completedAt: Date;
  mistakes: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }>;
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

    // 模擬學習記錄數據（實際應用中會從數據庫查詢）
    const sessions = await getRecentSessions(session.user.email);
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Learning sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getRecentSessions(userEmail: string): Promise<LearningSession[]> {
  // 在實際應用中，這裡會查詢數據庫獲取用戶的學習記錄
  // 目前返回模擬數據
  
  const mockSessions: LearningSession[] = [
    {
      id: 'session_1',
      activityId: 'activity_1',
      activityTitle: '英語動物詞彙測驗',
      score: 92,
      timeSpent: 480, // 8 minutes in seconds
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      mistakes: [
        {
          question: 'What is the English word for 蝴蝶?',
          userAnswer: 'Butterfly',
          correctAnswer: 'Butterfly'
        }
      ]
    },
    {
      id: 'session_2',
      activityId: 'activity_2',
      activityTitle: '數學基礎運算練習',
      score: 76,
      timeSpent: 720, // 12 minutes
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      mistakes: [
        {
          question: '15 × 7 = ?',
          userAnswer: '95',
          correctAnswer: '105'
        },
        {
          question: '144 ÷ 12 = ?',
          userAnswer: '11',
          correctAnswer: '12'
        }
      ]
    },
    {
      id: 'session_3',
      activityId: 'activity_3',
      activityTitle: '科學元素配對遊戲',
      score: 88,
      timeSpent: 600, // 10 minutes
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      mistakes: [
        {
          question: 'Match H2O with its name',
          userAnswer: 'Hydrogen Peroxide',
          correctAnswer: 'Water'
        }
      ]
    },
    {
      id: 'session_4',
      activityId: 'activity_4',
      activityTitle: '中文成語填字遊戲',
      score: 94,
      timeSpent: 540, // 9 minutes
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      mistakes: []
    },
    {
      id: 'session_5',
      activityId: 'activity_5',
      activityTitle: '歷史年代記憶卡片',
      score: 82,
      timeSpent: 900, // 15 minutes
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      mistakes: [
        {
          question: 'When did World War II end?',
          userAnswer: '1944',
          correctAnswer: '1945'
        },
        {
          question: 'When was the Declaration of Independence signed?',
          userAnswer: '1775',
          correctAnswer: '1776'
        }
      ]
    }
  ];

  return mockSessions;
}
