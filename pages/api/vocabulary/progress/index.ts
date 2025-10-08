import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📊 學習進度API被調用:', {
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  try {
    // 驗證用戶身份
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      console.log('❌ 未授權訪問');
      return res.status(401).json({ message: '請先登入' });
    }

    const userId = session.user.id;

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, userId);
      case 'POST':
        return await handlePost(req, res, userId);
      default:
        console.log('❌ 不支持的方法:', req.method);
        return res.status(405).json({ message: '方法不允許' });
    }
  } catch (error) {
    console.error('❌ 學習進度API錯誤:', error);
    return res.status(500).json({ 
      message: '服務器錯誤',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : error) : undefined
    });
  }
}

// 獲取學習進度
async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  console.log('📈 獲取學習進度...');
  
  const { vocabularySetId, gameType } = req.query;

  try {
    let whereClause: any = { userId };

    if (vocabularySetId) {
      whereClause.vocabularySetId = vocabularySetId as string;
    }

    if (gameType) {
      whereClause.gameType = gameType as string;
    }

    const progressRecords = await prisma.learningProgress.findMany({
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
            chinese: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`✅ 找到 ${progressRecords.length} 條學習進度記錄`);

    // 計算統計數據
    const stats = {
      totalSessions: progressRecords.reduce((sum, record) => sum + record.sessionCount, 0),
      totalStudyTime: progressRecords.reduce((sum, record) => sum + record.totalStudyTime, 0),
      totalAttempts: progressRecords.reduce((sum, record) => sum + record.totalAttempts, 0),
      totalCorrect: progressRecords.reduce((sum, record) => sum + record.correctCount, 0),
      totalIncorrect: progressRecords.reduce((sum, record) => sum + record.incorrectCount, 0),
      averageAccuracy: 0,
      averageMasteryLevel: 0
    };

    if (stats.totalAttempts > 0) {
      stats.averageAccuracy = (stats.totalCorrect / stats.totalAttempts) * 100;
    }

    if (progressRecords.length > 0) {
      stats.averageMasteryLevel = progressRecords.reduce((sum, record) => sum + record.masteryLevel, 0) / progressRecords.length;
    }

    return res.status(200).json({
      success: true,
      data: {
        records: progressRecords,
        stats
      }
    });
  } catch (error) {
    console.error('❌ 獲取學習進度失敗:', error);
    throw error;
  }
}

// 記錄學習進度
async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  console.log('📝 記錄學習進度...');
  
  const { 
    vocabularySetId, 
    vocabularyItemId, 
    gameType, 
    isCorrect, 
    score, 
    studyTime,
    masteryLevel 
  } = req.body;

  // 驗證輸入
  if (!vocabularySetId || !gameType) {
    console.log('❌ 缺少必填欄位');
    return res.status(400).json({ message: '詞彙集合ID和遊戲類型是必填的' });
  }

  try {
    // 檢查詞彙集合是否存在
    const vocabularySet = await prisma.vocabularySet.findUnique({
      where: { id: vocabularySetId }
    });

    if (!vocabularySet) {
      console.log('❌ 詞彙集合不存在');
      return res.status(404).json({ message: '詞彙集合不存在' });
    }

    // 如果指定了詞彙項目，檢查是否存在
    if (vocabularyItemId) {
      const vocabularyItem = await prisma.vocabularyItem.findUnique({
        where: { id: vocabularyItemId }
      });

      if (!vocabularyItem) {
        console.log('❌ 詞彙項目不存在');
        return res.status(404).json({ message: '詞彙項目不存在' });
      }
    }

    // 查找或創建學習進度記錄
    const existingProgress = await prisma.learningProgress.findUnique({
      where: {
        userId_vocabularySetId_vocabularyItemId_gameType: {
          userId,
          vocabularySetId,
          vocabularyItemId: vocabularyItemId || null,
          gameType
        }
      }
    });

    let progressRecord;

    if (existingProgress) {
      // 更新現有記錄
      const newCorrectCount = existingProgress.correctCount + (isCorrect ? 1 : 0);
      const newIncorrectCount = existingProgress.incorrectCount + (isCorrect ? 0 : 1);
      const newTotalAttempts = existingProgress.totalAttempts + 1;
      const newTotalStudyTime = existingProgress.totalStudyTime + (studyTime || 0);
      const newSessionCount = existingProgress.sessionCount + 1;
      const newAverageScore = ((existingProgress.averageScore * existingProgress.totalAttempts) + (score || 0)) / newTotalAttempts;
      const newBestScore = Math.max(existingProgress.bestScore, score || 0);

      // 計算下次複習時間（間隔重複算法）
      let newReviewInterval = existingProgress.reviewInterval;
      let nextReview = null;

      if (isCorrect) {
        // 答對了，增加複習間隔
        newReviewInterval = Math.min(newReviewInterval * 2, 30); // 最多30天
      } else {
        // 答錯了，重置複習間隔
        newReviewInterval = 1;
      }

      nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + newReviewInterval);

      progressRecord = await prisma.learningProgress.update({
        where: { id: existingProgress.id },
        data: {
          correctCount: newCorrectCount,
          incorrectCount: newIncorrectCount,
          totalAttempts: newTotalAttempts,
          bestScore: newBestScore,
          averageScore: newAverageScore,
          masteryLevel: masteryLevel !== undefined ? masteryLevel : existingProgress.masteryLevel,
          lastReviewed: new Date(),
          nextReview,
          reviewInterval: newReviewInterval,
          totalStudyTime: newTotalStudyTime,
          sessionCount: newSessionCount
        }
      });
    } else {
      // 創建新記錄
      const reviewInterval = 1;
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + reviewInterval);

      progressRecord = await prisma.learningProgress.create({
        data: {
          userId,
          vocabularySetId,
          vocabularyItemId: vocabularyItemId || null,
          gameType,
          correctCount: isCorrect ? 1 : 0,
          incorrectCount: isCorrect ? 0 : 1,
          totalAttempts: 1,
          bestScore: score || 0,
          averageScore: score || 0,
          masteryLevel: masteryLevel || 0,
          lastReviewed: new Date(),
          nextReview,
          reviewInterval,
          totalStudyTime: studyTime || 0,
          sessionCount: 1
        }
      });
    }

    console.log('✅ 學習進度記錄成功');

    return res.status(200).json({
      success: true,
      message: '學習進度記錄成功',
      data: progressRecord
    });
  } catch (error) {
    console.error('❌ 記錄學習進度失敗:', error);
    throw error;
  }
}
