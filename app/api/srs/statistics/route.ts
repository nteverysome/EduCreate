import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GEPTLevel } from '@prisma/client';

/**
 * GET /api/srs/statistics
 * 獲取學習統計
 * 支持 geptLevel 查詢參數
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const geptLevelParam = searchParams.get('geptLevel');

    // 2. 解析 GEPT 等級參數
    let geptLevel: GEPTLevel | null = null;
    if (geptLevelParam) {
      const levelUpper = geptLevelParam.toUpperCase();
      if (levelUpper === 'ELEMENTARY' || levelUpper === 'INTERMEDIATE' || levelUpper === 'HIGH_INTERMEDIATE') {
        geptLevel = levelUpper as GEPTLevel;
      }
    }

    console.log('📊 獲取學習統計');
    console.log(`  - 用戶 ID: ${userId}`);
    console.log(`  - GEPT 等級: ${geptLevel || '全部'}`);

    // 3. 獲取該等級的所有 TTS 單字
    const ttsWords = geptLevel
      ? await prisma.tTSCache.findMany({
          where: { geptLevel },
          select: { text: true }
        })
      : await prisma.tTSCache.findMany({
          select: { text: true }
        });

    // 計算唯一單字數 (去除重複)
    const uniqueWords = new Set(ttsWords.map(w => w.text.toLowerCase()));
    const uniqueWordsCount = uniqueWords.size;
    const totalWordsCount = ttsWords.length; // TTS 記錄總數 (包含 4 個版本)

    // 計算累積單字數
    let cumulativeWordsCount = uniqueWordsCount;
    if (geptLevel) {
      // 如果是中級,加上初級的單字
      if (geptLevel === 'INTERMEDIATE') {
        const elementaryWords = await prisma.tTSCache.findMany({
          where: { geptLevel: 'ELEMENTARY' },
          select: { text: true }
        });
        const elementaryUnique = new Set(elementaryWords.map(w => w.text.toLowerCase()));
        cumulativeWordsCount += elementaryUnique.size;
      }
      // 如果是高級,加上初級和中級的單字
      else if (geptLevel === 'HIGH_INTERMEDIATE') {
        const elementaryWords = await prisma.tTSCache.findMany({
          where: { geptLevel: 'ELEMENTARY' },
          select: { text: true }
        });
        const intermediateWords = await prisma.tTSCache.findMany({
          where: { geptLevel: 'INTERMEDIATE' },
          select: { text: true }
        });
        const elementaryUnique = new Set(elementaryWords.map(w => w.text.toLowerCase()));
        const intermediateUnique = new Set(intermediateWords.map(w => w.text.toLowerCase()));
        cumulativeWordsCount += elementaryUnique.size + intermediateUnique.size;
      }
    }

    // 5. 獲取用戶的學習進度
    const progressWhere: any = { userId };

    const allProgress = await prisma.userWordProgress.findMany({
      where: progressWhere,
      include: {
        word: {
          select: {
            english: true,
            chinese: true,
            audioUrl: true
          }
        }
      }
    });

    // 6. 根據 TTS 單字列表過濾 GEPT 等級
    const filteredProgress = geptLevel
      ? allProgress.filter(p => p.word && uniqueWords.has(p.word.english.toLowerCase()))
      : allProgress;

    // 7. 獲取學習會話 (根據 GEPT 等級過濾)
    const sessionWhere: any = { userId };
    if (geptLevel) {
      sessionWhere.geptLevel = geptLevel;
    }

    const allSessions = await prisma.learningSession.findMany({
      where: sessionWhere,
      orderBy: { startedAt: 'desc' }
    });

    // 8. 計算統計數據
    const learnedWords = filteredProgress.length;
    const newWords = Math.max(0, uniqueWordsCount - learnedWords); // 使用唯一單字數

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 需要複習的單字 (nextReviewAt <= 今天)
    const reviewWords = filteredProgress.filter(p =>
      new Date(p.nextReviewAt) <= now
    ).length;

    // 已掌握的單字 (memoryStrength >= 80)
    const masteredWords = filteredProgress.filter(p =>
      p.memoryStrength >= 80
    ).length;

    // 今日複習數量 (通過 session 關聯查詢)
    const todayReviews = await prisma.wordReview.count({
      where: {
        session: {
          userId
        },
        reviewedAt: {
          gte: todayStart
        }
      }
    });

    // 9. 計算連續天數
    const streakDays = await calculateStreak(userId);

    // 10. 平均記憶強度
    const averageMemoryStrength = learnedWords > 0
      ? filteredProgress.reduce((sum, p) => sum + p.memoryStrength, 0) / learnedWords
      : 0;

    // 11. 最近 7 天的學習數據
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = allSessions.filter(s =>
      s.startedAt >= sevenDaysAgo
    );

    const recentStats = {
      totalSessions: recentSessions.length,
      totalWords: recentSessions.reduce((sum, s) => sum + s.totalWords, 0),
      totalCorrect: recentSessions.reduce((sum, s) => sum + s.correctAnswers, 0),
      totalAnswers: recentSessions.reduce((sum, s) => sum + s.totalAnswers, 0),
      averageAccuracy: recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recentSessions.length
        : 0
    };

    console.log('✅ 統計數據獲取成功');

    // 返回兩種格式的數據以兼容不同的前端組件
    return NextResponse.json({
      // 新格式 (SRSLearningPanel 使用)
      totalWords: totalWordsCount, // TTS 記錄總數 (包含 4 個版本)
      uniqueWords: uniqueWordsCount, // 唯一單字數 (該等級新增的單字)
      cumulativeWords: cumulativeWordsCount, // 累積單字數 (包含之前等級的單字)
      newWords, // 新單字數 (唯一單字數 - 已學習)
      reviewWords,
      masteredWords,
      todayReviews,
      streak: streakDays,
      averageMemoryStrength: Math.round(averageMemoryStrength),

      // 舊格式 (向後兼容)
      overview: {
        totalWords: learnedWords,
        masteredWords,
        learningWords: learnedWords - masteredWords,
        reviewingWords: reviewWords,
        dueForReview: reviewWords
      },
      streakDays,
      recentStats,
      recentSessions: recentSessions.slice(0, 10)
    });

  } catch (error) {
    console.error('❌ 獲取統計失敗:', error);
    return NextResponse.json(
      { error: '獲取統計失敗' },
      { status: 500 }
    );
  }
}

// 計算連續學習天數
async function calculateStreak(userId: string): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        createdAt: true
      }
    });

    if (sessions.length === 0) {
      return 0;
    }

    // 將日期轉換為 YYYY-MM-DD 格式
    const uniqueDates = new Set(
      sessions.map(s => {
        const date = new Date(s.createdAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      })
    );

    const sortedDates = Array.from(uniqueDates).sort().reverse();

    // 計算連續天數
    let streak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 檢查今天是否有學習記錄
    if (sortedDates[0] !== todayStr) {
      // 如果今天沒有學習,檢查昨天
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (sortedDates[0] !== yesterdayStr) {
        return 0; // 連續記錄中斷
      }
    }

    // 從最近的日期開始計算連續天數
    let currentDate = new Date(sortedDates[0]);
    streak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;

  } catch (error) {
    console.error('❌ 計算連續天數失敗:', error);
    return 0;
  }
}

