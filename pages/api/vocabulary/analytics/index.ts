import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { withAnalyticsPermission } from '../../../../middleware/withVocabularyAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📊 詞彙分析API被調用:', {
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'GET') {
    console.log('❌ 不支持的方法:', req.method);
    return res.status(405).json({ message: '只允許GET請求' });
  }

  try {
    // 驗證用戶身份
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      console.log('❌ 未授權訪問');
      return res.status(401).json({ message: '請先登入' });
    }

    const userId = session.user.id;
    const { timeRange = '7d', vocabularySetId } = req.query;

    console.log('📈 生成詞彙學習分析報告...');

    // 計算時間範圍
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // 基礎查詢條件
    let whereClause: any = {
      userId,
      updatedAt: {
        gte: startDate
      }
    };

    if (vocabularySetId) {
      whereClause.vocabularySetId = vocabularySetId as string;
    }

    // 獲取學習進度數據
    const progressData = await prisma.learningProgress.findMany({
      where: whereClause,
      include: {
        vocabularySet: {
          select: {
            id: true,
            title: true,
            geptLevel: true
          }
        },
        vocabularyItem: {
          select: {
            id: true,
            english: true,
            chinese: true,
            difficultyLevel: true
          }
        }
      }
    });

    // 獲取用戶的詞彙集合統計
    const vocabularySetStats = await prisma.vocabularySet.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    // 計算總體統計
    const totalStats = {
      totalVocabularySets: vocabularySetStats.length,
      totalVocabularyItems: vocabularySetStats.reduce((sum, set) => sum + set._count.items, 0),
      totalStudyTime: progressData.reduce((sum, record) => sum + record.totalStudyTime, 0),
      totalSessions: progressData.reduce((sum, record) => sum + record.sessionCount, 0),
      totalAttempts: progressData.reduce((sum, record) => sum + record.totalAttempts, 0),
      totalCorrect: progressData.reduce((sum, record) => sum + record.correctCount, 0),
      totalIncorrect: progressData.reduce((sum, record) => sum + record.incorrectCount, 0),
      averageAccuracy: 0,
      averageMasteryLevel: 0
    };

    if (totalStats.totalAttempts > 0) {
      totalStats.averageAccuracy = (totalStats.totalCorrect / totalStats.totalAttempts) * 100;
    }

    if (progressData.length > 0) {
      totalStats.averageMasteryLevel = progressData.reduce((sum, record) => sum + record.masteryLevel, 0) / progressData.length;
    }

    // 按GEPT等級分組統計
    const geptLevelStats = vocabularySetStats.reduce((acc: any, set) => {
      if (!acc[set.geptLevel]) {
        acc[set.geptLevel] = {
          level: set.geptLevel,
          sets: 0,
          items: 0,
          studyTime: 0,
          accuracy: 0,
          masteryLevel: 0
        };
      }
      acc[set.geptLevel].sets += 1;
      acc[set.geptLevel].items += set._count.items;
      return acc;
    }, {});

    // 為每個GEPT等級添加學習數據
    progressData.forEach(record => {
      const level = record.vocabularySet.geptLevel;
      if (geptLevelStats[level]) {
        geptLevelStats[level].studyTime += record.totalStudyTime;
        if (record.totalAttempts > 0) {
          geptLevelStats[level].accuracy += (record.correctCount / record.totalAttempts) * 100;
        }
        geptLevelStats[level].masteryLevel += record.masteryLevel;
      }
    });

    // 計算平均值
    Object.keys(geptLevelStats).forEach(level => {
      const levelData = geptLevelStats[level];
      const progressCount = progressData.filter(p => p.vocabularySet.geptLevel === level).length;
      if (progressCount > 0) {
        levelData.accuracy = levelData.accuracy / progressCount;
        levelData.masteryLevel = levelData.masteryLevel / progressCount;
      }
    });

    // 按遊戲類型分組統計
    const gameTypeStats = progressData.reduce((acc: any, record) => {
      if (!acc[record.gameType]) {
        acc[record.gameType] = {
          gameType: record.gameType,
          sessions: 0,
          studyTime: 0,
          attempts: 0,
          correct: 0,
          accuracy: 0,
          averageScore: 0
        };
      }
      
      acc[record.gameType].sessions += record.sessionCount;
      acc[record.gameType].studyTime += record.totalStudyTime;
      acc[record.gameType].attempts += record.totalAttempts;
      acc[record.gameType].correct += record.correctCount;
      acc[record.gameType].averageScore += record.averageScore;
      
      return acc;
    }, {});

    // 計算遊戲類型的平均值
    Object.keys(gameTypeStats).forEach(gameType => {
      const gameData = gameTypeStats[gameType];
      const recordCount = progressData.filter(p => p.gameType === gameType).length;
      
      if (gameData.attempts > 0) {
        gameData.accuracy = (gameData.correct / gameData.attempts) * 100;
      }
      
      if (recordCount > 0) {
        gameData.averageScore = gameData.averageScore / recordCount;
      }
    });

    // 需要複習的詞彙
    const reviewNeeded = await prisma.learningProgress.findMany({
      where: {
        userId,
        nextReview: {
          lte: now
        }
      },
      include: {
        vocabularySet: {
          select: {
            id: true,
            title: true
          }
        },
        vocabularyItem: {
          select: {
            id: true,
            english: true,
            chinese: true
          }
        }
      },
      orderBy: { nextReview: 'asc' },
      take: 20 // 限制返回數量
    });

    // 學習趨勢（按天分組）
    const dailyProgress = await prisma.$queryRaw`
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as sessions,
        SUM(total_study_time) as study_time,
        SUM(total_attempts) as attempts,
        SUM(correct_count) as correct,
        AVG(mastery_level) as avg_mastery
      FROM learning_progress 
      WHERE user_id = ${userId} 
        AND updated_at >= ${startDate}
        ${vocabularySetId ? prisma.$queryRaw`AND vocabulary_set_id = ${vocabularySetId}` : prisma.$queryRaw``}
      GROUP BY DATE(updated_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    console.log('✅ 詞彙分析報告生成成功');

    return res.status(200).json({
      success: true,
      data: {
        timeRange,
        totalStats,
        geptLevelStats: Object.values(geptLevelStats),
        gameTypeStats: Object.values(gameTypeStats),
        reviewNeeded,
        dailyProgress,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 詞彙分析API錯誤:', error);
    return res.status(500).json({
      message: '服務器錯誤',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : error) : undefined
    });
  }
}

// 應用中間件
export default withAnalyticsPermission(handler);
