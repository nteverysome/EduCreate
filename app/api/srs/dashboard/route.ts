import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GEPTLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 獲取 GEPT 等級
    const searchParams = request.nextUrl.searchParams;
    const geptLevelParam = (searchParams.get('geptLevel') || 'ELEMENTARY').toUpperCase();
    const geptLevel = geptLevelParam as GEPTLevel;
    const geptLevelString = geptLevelParam.toLowerCase(); // LearningSession 使用小寫字符串

    const userId = session.user.id;

    // 1. 獲取用戶的所有學習進度
    // 注意：VocabularyItem 沒有 geptLevel 字段，所以我們獲取所有進度
    const userProgress = await prisma.userWordProgress.findMany({
      where: {
        userId
      },
      include: {
        word: {
          include: {
            set: true,
            activity: true
          }
        }
      },
      orderBy: {
        lastReviewedAt: 'desc'
      }
    });

    // 過濾出符合 GEPT 等級的單字（通過 set 或 activity）
    const filteredProgress = userProgress.filter(p => {
      const setGeptLevel = p.word.set?.geptLevel;
      const activityGeptLevel = p.word.activity?.geptLevel;
      return setGeptLevel === geptLevel || activityGeptLevel === geptLevel;
    });

    // 2. 獲取用戶的學習會話
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        geptLevel: geptLevelString
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 30 // 最近 30 次會話
    });

    // 3. 計算統計數據
    const totalWords = filteredProgress.length;
    const masteredWords = filteredProgress.filter(p => p.status === 'MASTERED').length;
    const learningWords = filteredProgress.filter(p => p.status === 'LEARNING').length;
    const newWords = filteredProgress.filter(p => p.status === 'NEW').length;

    // 4. 計算學習天數
    const firstSession = sessions[sessions.length - 1];
    const totalDays = firstSession
      ? Math.ceil((Date.now() - firstSession.startedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // 5. 計算總學習時間（秒）
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // 6. 計算平均正確率
    const totalAnswers = sessions.reduce((sum, s) => sum + (s.totalAnswers || 0), 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + (s.correctAnswers || 0), 0);
    const averageAccuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    // 7. 按日期分組統計
    const dailyStatsMap = new Map<string, { studyTime: number; wordsLearned: number; totalAnswers: number; correctAnswers: number }>();

    sessions.forEach(session => {
      const date = session.startedAt.toISOString().split('T')[0];
      const existing = dailyStatsMap.get(date) || { studyTime: 0, wordsLearned: 0, totalAnswers: 0, correctAnswers: 0 };
      
      dailyStatsMap.set(date, {
        studyTime: existing.studyTime + (session.duration || 0),
        wordsLearned: existing.wordsLearned + (session.correctAnswers || 0),
        totalAnswers: existing.totalAnswers + (session.totalAnswers || 0),
        correctAnswers: existing.correctAnswers + (session.correctAnswers || 0)
      });
    });

    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({
        date,
        studyTime: stats.studyTime,
        wordsLearned: stats.wordsLearned,
        accuracy: stats.totalAnswers > 0 ? (stats.correctAnswers / stats.totalAnswers) * 100 : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // 最近 14 天

    // 8. 記憶強度分布
    const memoryStrengthDistribution = [
      { range: '0-20%', count: filteredProgress.filter(p => p.memoryStrength < 20).length },
      { range: '20-40%', count: filteredProgress.filter(p => p.memoryStrength >= 20 && p.memoryStrength < 40).length },
      { range: '40-60%', count: filteredProgress.filter(p => p.memoryStrength >= 40 && p.memoryStrength < 60).length },
      { range: '60-80%', count: filteredProgress.filter(p => p.memoryStrength >= 60 && p.memoryStrength < 80).length },
      { range: '80-100%', count: filteredProgress.filter(p => p.memoryStrength >= 80).length }
    ];

    // 9. 最近學習的單字（前 10 個）
    const recentWords = filteredProgress.slice(0, 10).map(p => ({
      english: p.word.english,
      chinese: p.word.chinese,
      memoryStrength: p.memoryStrength,
      lastReviewed: p.lastReviewedAt?.toISOString() || p.firstLearnedAt.toISOString(),
      nextReview: p.nextReviewAt.toISOString()
    }));

    // 10. 分類單字（遺忘曲線數據）
    const now = new Date();
    const forgettingWords: any[] = [];
    const masteredWordsList: any[] = [];
    const learningWordsList: any[] = [];
    const newWordsList: any[] = [];

    // 獲取所有會話 ID 用於查詢複習記錄
    const sessionIds = sessions.map(s => s.id);
    const wordReviews = await prisma.wordReview.findMany({
      where: {
        sessionId: { in: sessionIds }
      },
      orderBy: {
        reviewedAt: 'desc'
      }
    });

    // 創建 wordId -> reviews 的映射
    const reviewsByWordId = new Map<string, any[]>();
    wordReviews.forEach(review => {
      if (!reviewsByWordId.has(review.wordId)) {
        reviewsByWordId.set(review.wordId, []);
      }
      reviewsByWordId.get(review.wordId)!.push(review);
    });

    filteredProgress.forEach(progress => {
      const wordReviewList = reviewsByWordId.get(progress.wordId) || [];

      const wordData = {
        id: progress.wordId,
        word: progress.word.english,
        translation: progress.word.chinese,
        memoryStrength: progress.memoryStrength,
        nextReviewAt: progress.nextReviewAt.toISOString(),
        lastReviewedAt: progress.lastReviewedAt?.toISOString() || progress.firstLearnedAt.toISOString(),
        status: progress.status,
        reviewCount: wordReviewList.length,
        correctCount: wordReviewList.filter(r => r.isCorrect).length,
        incorrectCount: wordReviewList.filter(r => !r.isCorrect).length,
      };

      // 判斷遺忘狀態
      const lastReviewDate = progress.lastReviewedAt || progress.firstLearnedAt;
      const daysSinceLastReview = Math.floor(
        (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isOverdue = progress.nextReviewAt < now;

      if (progress.memoryStrength >= 80) {
        masteredWordsList.push(wordData);
      } else if (progress.memoryStrength >= 20 && progress.memoryStrength < 80) {
        if (isOverdue && daysSinceLastReview > 3) {
          forgettingWords.push(wordData);
        } else {
          learningWordsList.push(wordData);
        }
      } else {
        newWordsList.push(wordData);
      }
    });

    // 11. 返回數據
    return NextResponse.json({
      totalDays,
      totalTime,
      totalWords,
      masteredWords,
      learningWords,
      newWords,
      averageAccuracy,
      dailyStats,
      memoryStrengthDistribution,
      recentWords,
      // 遺忘曲線數據
      forgettingWords,
      masteredWordsList,
      learningWordsList,
      newWordsList
    });

  } catch (error) {
    console.error('❌ 獲取儀表板數據失敗:', error);
    console.error('錯誤詳情:', error instanceof Error ? error.message : String(error));
    console.error('錯誤堆棧:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: '獲取儀表板數據失敗',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

