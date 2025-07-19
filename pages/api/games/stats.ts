import { NextApiRequest, NextApiResponse } from 'next';

interface GameSession {
  id: string;
  userId?: string;
  gameType: string;
  startTime: number;
  endTime?: number;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  vocabulary: string[];
  memoryData: {
    word: string;
    attempts: number;
    lastSeen: number;
    nextReview: number;
    difficulty: number;
  }[];
}

// 模擬數據庫 (實際應用中應使用真實數據庫)
let gameSessions: GameSession[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      return handleGetStats(req, res);
    case 'POST':
      return handleSaveStats(req, res);
    case 'PUT':
      return handleUpdateStats(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

function handleGetStats(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId, userId } = req.query;
  
  try {
    if (sessionId) {
      const session = gameSessions.find(s => s.id === sessionId);
      if (session) {
        res.status(200).json(session);
      } else {
        res.status(404).json({ error: '遊戲會話未找到' });
      }
    } else if (userId) {
      const userSessions = gameSessions.filter(s => s.userId === userId);
      res.status(200).json(userSessions);
    } else {
      // 返回總體統計
      const totalSessions = gameSessions.length;
      const totalScore = gameSessions.reduce((sum, s) => sum + s.score, 0);
      const totalQuestions = gameSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
      const totalCorrect = gameSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      
      res.status(200).json({
        totalSessions,
        averageScore: totalSessions > 0 ? totalScore / totalSessions : 0,
        totalQuestions,
        overallAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
      });
    }
  } catch (error) {
    console.error('獲取遊戲統計失敗:', error);
    res.status(500).json({ error: '服務器錯誤' });
  }
}

function handleSaveStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessionData: Partial<GameSession> = req.body;
    
    const newSession: GameSession = {
      id: generateSessionId(),
      userId: sessionData.userId,
      gameType: sessionData.gameType || 'airplane',
      startTime: sessionData.startTime || Date.now(),
      score: sessionData.score || 0,
      questionsAnswered: sessionData.questionsAnswered || 0,
      correctAnswers: sessionData.correctAnswers || 0,
      wrongAnswers: sessionData.wrongAnswers || 0,
      vocabulary: sessionData.vocabulary || [],
      memoryData: sessionData.memoryData || []
    };
    
    gameSessions.push(newSession);
    
    console.log('✅ 遊戲會話已保存:', newSession.id);
    res.status(201).json({ sessionId: newSession.id, message: '遊戲統計已保存' });
    
  } catch (error) {
    console.error('保存遊戲統計失敗:', error);
    res.status(500).json({ error: '保存失敗' });
  }
}

function handleUpdateStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sessionId } = req.query;
    const updateData = req.body;
    
    const sessionIndex = gameSessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: '遊戲會話未找到' });
    }
    
    // 更新會話數據
    gameSessions[sessionIndex] = {
      ...gameSessions[sessionIndex],
      ...updateData,
      endTime: updateData.endTime || Date.now()
    };
    
    console.log('✅ 遊戲會話已更新:', sessionId);
    res.status(200).json({ message: '遊戲統計已更新' });
    
  } catch (error) {
    console.error('更新遊戲統計失敗:', error);
    res.status(500).json({ error: '更新失敗' });
  }
}

function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
