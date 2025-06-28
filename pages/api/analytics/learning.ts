/**
 * 學習分析 API
 * 收集和分析學習數據，提供學習洞察
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface LearningEvent {
  id: string;
  userId: string;
  activityId: string;
  eventType: 'start' | 'complete' | 'pause' | 'resume' | 'answer' | 'hint' | 'skip';
  timestamp: string;
  duration?: number;
  score?: number;
  data?: any;
}

interface LearningSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  activities: string[];
  totalScore: number;
  completionRate: number;
  timeSpent: number;
}

interface LearningInsight {
  userId: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  progressTrend: 'improving' | 'stable' | 'declining';
  engagementLevel: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

// 內存存儲學習數據（生產環境應使用數據庫）
const learningEvents: LearningEvent[] = [];
const learningSessions: LearningSession[] = [];
const learningInsights: Map<string, LearningInsight> = new Map();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      return handleLearningEvent(req, res);
    }
    
    if (req.method === 'GET') {
      const { action } = req.query;
      
      switch (action) {
        case 'insights':
          return getLearningInsights(req, res);
        case 'dashboard':
          return getLearningDashboard(req, res);
        case 'events':
          return getLearningEvents(req, res);
        default:
          return getLearningAnalytics(req, res);
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('學習分析 API 錯誤:', error);
    return res.status(500).json({
      error: '學習分析服務錯誤',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 處理學習事件
function handleLearningEvent(req: NextApiRequest, res: NextApiResponse) {
  const {
    userId,
    activityId,
    eventType,
    duration,
    score,
    data
  } = req.body;

  if (!userId || !activityId || !eventType) {
    return res.status(400).json({
      error: '缺少必要參數',
      required: ['userId', 'activityId', 'eventType']
    });
  }

  const event: LearningEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    activityId,
    eventType,
    timestamp: new Date().toISOString(),
    duration,
    score,
    data
  };

  // 添加到學習事件列表
  learningEvents.unshift(event);
  
  // 保持最大數量限制
  if (learningEvents.length > 50000) {
    learningEvents.splice(50000);
  }

  // 更新學習會話
  updateLearningSession(event);
  
  // 更新學習洞察
  updateLearningInsights(userId);

  return res.status(200).json({
    success: true,
    message: '學習事件已記錄',
    eventId: event.id,
    timestamp: event.timestamp
  });
}

// 更新學習會話
function updateLearningSession(event: LearningEvent) {
  const { userId, activityId, eventType, timestamp, score = 0, duration = 0 } = event;
  
  // 查找當前活躍會話
  let currentSession = learningSessions.find(s => 
    s.userId === userId && !s.endTime
  );

  if (eventType === 'start') {
    // 開始新會話
    if (currentSession) {
      // 結束之前的會話
      currentSession.endTime = timestamp;
    }
    
    currentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: timestamp,
      activities: [activityId],
      totalScore: 0,
      completionRate: 0,
      timeSpent: 0
    };
    
    learningSessions.unshift(currentSession);
  } else if (currentSession) {
    // 更新現有會話
    if (!currentSession.activities.includes(activityId)) {
      currentSession.activities.push(activityId);
    }
    
    currentSession.totalScore += score;
    currentSession.timeSpent += duration;
    
    if (eventType === 'complete') {
      currentSession.completionRate = Math.min(100, currentSession.completionRate + (100 / currentSession.activities.length));
    }
  }
}

// 更新學習洞察
function updateLearningInsights(userId: string) {
  const userEvents = learningEvents.filter(e => e.userId === userId);
  const userSessions = learningSessions.filter(s => s.userId === userId);
  
  if (userEvents.length === 0) return;

  // 分析學習模式
  const completedActivities = userEvents.filter(e => e.eventType === 'complete').length;
  const totalActivities = userEvents.filter(e => e.eventType === 'start').length;
  const averageScore = userEvents
    .filter(e => e.score !== undefined)
    .reduce((sum, e) => sum + (e.score || 0), 0) / Math.max(1, userEvents.filter(e => e.score !== undefined).length);

  // 計算進步趨勢
  const recentSessions = userSessions.slice(0, 5);
  const olderSessions = userSessions.slice(5, 10);
  const recentAvgScore = recentSessions.reduce((sum, s) => sum + s.totalScore, 0) / Math.max(1, recentSessions.length);
  const olderAvgScore = olderSessions.reduce((sum, s) => sum + s.totalScore, 0) / Math.max(1, olderSessions.length);
  
  let progressTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentAvgScore > olderAvgScore * 1.1) {
    progressTrend = 'improving';
  } else if (recentAvgScore < olderAvgScore * 0.9) {
    progressTrend = 'declining';
  }

  // 計算參與度
  const sessionFrequency = userSessions.length / Math.max(1, 
    (new Date().getTime() - new Date(userSessions[userSessions.length - 1]?.startTime || new Date()).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let engagementLevel: 'high' | 'medium' | 'low' = 'medium';
  if (sessionFrequency > 1) {
    engagementLevel = 'high';
  } else if (sessionFrequency < 0.3) {
    engagementLevel = 'low';
  }

  // 生成洞察
  const insights: LearningInsight = {
    userId,
    strengths: generateStrengths(userEvents, averageScore, completedActivities, totalActivities),
    weaknesses: generateWeaknesses(userEvents, averageScore, completedActivities, totalActivities),
    recommendations: generateRecommendations(progressTrend, engagementLevel, averageScore),
    progressTrend,
    engagementLevel,
    lastUpdated: new Date().toISOString()
  };

  learningInsights.set(userId, insights);
}

// 生成優勢分析
function generateStrengths(events: LearningEvent[], avgScore: number, completed: number, total: number): string[] {
  const strengths = [];
  
  if (avgScore > 80) {
    strengths.push('學習成績優秀，掌握知識點扎實');
  }
  
  if (completed / total > 0.8) {
    strengths.push('學習完成率高，學習態度積極');
  }
  
  const quickAnswers = events.filter(e => e.eventType === 'answer' && (e.duration || 0) < 5000).length;
  if (quickAnswers > events.filter(e => e.eventType === 'answer').length * 0.6) {
    strengths.push('反應速度快，思維敏捷');
  }
  
  return strengths.length > 0 ? strengths : ['持續學習，不斷進步'];
}

// 生成弱點分析
function generateWeaknesses(events: LearningEvent[], avgScore: number, completed: number, total: number): string[] {
  const weaknesses = [];
  
  if (avgScore < 60) {
    weaknesses.push('學習成績有待提高，需要加強基礎知識');
  }
  
  if (completed / total < 0.5) {
    weaknesses.push('學習完成率較低，建議提高學習持續性');
  }
  
  const hintsUsed = events.filter(e => e.eventType === 'hint').length;
  if (hintsUsed > events.filter(e => e.eventType === 'answer').length * 0.3) {
    weaknesses.push('經常需要提示，建議加強獨立思考能力');
  }
  
  return weaknesses;
}

// 生成建議
function generateRecommendations(trend: string, engagement: string, avgScore: number): string[] {
  const recommendations = [];
  
  if (trend === 'declining') {
    recommendations.push('學習進度有所下降，建議調整學習方法或尋求幫助');
  }
  
  if (engagement === 'low') {
    recommendations.push('學習頻率較低，建議制定規律的學習計劃');
  }
  
  if (avgScore < 70) {
    recommendations.push('建議重複練習基礎題目，鞏固基礎知識');
  }
  
  recommendations.push('保持學習熱情，持續進步');
  
  return recommendations;
}

// 獲取學習洞察
function getLearningInsights(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      error: '缺少用戶 ID'
    });
  }
  
  const insights = learningInsights.get(userId as string);
  
  if (!insights) {
    return res.status(404).json({
      error: '未找到該用戶的學習洞察'
    });
  }
  
  return res.status(200).json({
    success: true,
    insights,
    timestamp: new Date().toISOString()
  });
}

// 獲取學習儀表板
function getLearningDashboard(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      error: '缺少用戶 ID'
    });
  }
  
  const userEvents = learningEvents.filter(e => e.userId === userId);
  const userSessions = learningSessions.filter(s => s.userId === userId);
  const insights = learningInsights.get(userId as string);
  
  const dashboard = {
    overview: {
      totalSessions: userSessions.length,
      totalTimeSpent: userSessions.reduce((sum, s) => sum + s.timeSpent, 0),
      averageScore: userEvents
        .filter(e => e.score !== undefined)
        .reduce((sum, e) => sum + (e.score || 0), 0) / Math.max(1, userEvents.filter(e => e.score !== undefined).length),
      completionRate: userSessions.reduce((sum, s) => sum + s.completionRate, 0) / Math.max(1, userSessions.length)
    },
    recentActivity: userEvents.slice(0, 10),
    insights: insights || null,
    progress: {
      weeklyProgress: generateWeeklyProgress(userSessions),
      skillProgress: generateSkillProgress(userEvents)
    }
  };
  
  return res.status(200).json({
    success: true,
    dashboard,
    timestamp: new Date().toISOString()
  });
}

// 生成週進度
function generateWeeklyProgress(sessions: LearningSession[]) {
  const weeklyData = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
    
    weeklyData.push({
      date: dayStart.toISOString().split('T')[0],
      sessions: daySessions.length,
      timeSpent: daySessions.reduce((sum, s) => sum + s.timeSpent, 0),
      averageScore: daySessions.reduce((sum, s) => sum + s.totalScore, 0) / Math.max(1, daySessions.length)
    });
  }
  
  return weeklyData;
}

// 生成技能進度
function generateSkillProgress(events: LearningEvent[]) {
  // 模擬技能分類
  const skills = ['數學', '語言', '科學', '邏輯思維', '記憶力'];
  
  return skills.map(skill => ({
    name: skill,
    level: Math.floor(Math.random() * 100) + 1,
    progress: Math.floor(Math.random() * 100) + 1,
    recentImprovement: Math.floor(Math.random() * 20) - 10
  }));
}

// 獲取學習事件
function getLearningEvents(req: NextApiRequest, res: NextApiResponse) {
  const { userId, limit = 100 } = req.query;
  
  let events = [...learningEvents];
  
  if (userId) {
    events = events.filter(e => e.userId === userId);
  }
  
  const limitNum = parseInt(limit as string, 10);
  events = events.slice(0, limitNum);
  
  return res.status(200).json({
    success: true,
    events,
    total: learningEvents.length,
    timestamp: new Date().toISOString()
  });
}

// 獲取學習分析總覽
function getLearningAnalytics(req: NextApiRequest, res: NextApiResponse) {
  const analytics = {
    overview: {
      totalEvents: learningEvents.length,
      totalSessions: learningSessions.length,
      activeUsers: new Set(learningEvents.map(e => e.userId)).size,
      averageSessionDuration: learningSessions.reduce((sum, s) => sum + s.timeSpent, 0) / Math.max(1, learningSessions.length)
    },
    trends: {
      dailyActiveUsers: generateDailyActiveUsers(),
      popularActivities: generatePopularActivities(),
      learningPatterns: generateLearningPatterns()
    }
  };
  
  return res.status(200).json({
    success: true,
    analytics,
    timestamp: new Date().toISOString()
  });
}

// 生成每日活躍用戶
function generateDailyActiveUsers() {
  const dailyData = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayEvents = learningEvents.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });
    
    const activeUsers = new Set(dayEvents.map(e => e.userId)).size;
    
    dailyData.push({
      date: dayStart.toISOString().split('T')[0],
      activeUsers,
      totalEvents: dayEvents.length
    });
  }
  
  return dailyData;
}

// 生成熱門活動
function generatePopularActivities() {
  const activityCounts = new Map<string, number>();
  
  learningEvents.forEach(e => {
    const count = activityCounts.get(e.activityId) || 0;
    activityCounts.set(e.activityId, count + 1);
  });
  
  return Array.from(activityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([activityId, count]) => ({
      activityId,
      count,
      percentage: (count / learningEvents.length) * 100
    }));
}

// 生成學習模式
function generateLearningPatterns() {
  const hourlyData = new Array(24).fill(0);
  
  learningEvents.forEach(e => {
    const hour = new Date(e.timestamp).getHours();
    hourlyData[hour]++;
  });
  
  return hourlyData.map((count, hour) => ({
    hour,
    count,
    percentage: (count / learningEvents.length) * 100
  }));
}
