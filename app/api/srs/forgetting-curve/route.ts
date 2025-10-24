import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    let geptLevel = searchParams.get('geptLevel') || 'ELEMENTARY';

    // 標準化 geptLevel 格式 (轉換為大寫，並處理連字符)
    geptLevel = geptLevel.toUpperCase().replace('-', '_');
    // elementary -> ELEMENTARY
    // intermediate -> INTERMEDIATE
    // high-intermediate -> HIGH_INTERMEDIATE
    if (geptLevel === 'ADVANCED') {
      geptLevel = 'HIGH_INTERMEDIATE';
    }

    // 2. 獲取用戶的所有單字進度
    const userProgress = await prisma.userWordProgress.findMany({
      where: {
        userId,
      },
      include: {
        word: true,
      }
    });

    // 2.5 獲取用戶的所有複習記錄 (通過 session)
    const userSessions = await prisma.learningSession.findMany({
      where: { userId },
      select: { id: true }
    });
    const sessionIds = userSessions.map(s => s.id);

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

    // 3. 獲取該等級的所有 TTS 單字
    const ttsWords = await prisma.tTSCache.findMany({
      where: { geptLevel: geptLevel as any },
      select: { text: true, id: true }
    });

    // 4. 創建單字映射
    const ttsWordSet = new Set(ttsWords.map(w => w.text.toLowerCase()));

    // 5. 過濾出該等級的單字進度
    const filteredProgress = userProgress.filter(progress => 
      progress.word && ttsWordSet.has(progress.word.english.toLowerCase())
    );

    // 6. 分類單字
    const now = new Date();
    const masteredWords: any[] = [];
    const learningWords: any[] = [];
    const forgettingWords: any[] = [];
    const newWords: any[] = [];

    filteredProgress.forEach(progress => {
      // 獲取該單字的複習記錄
      const wordReviewList = reviewsByWordId.get(progress.wordId) || [];

      const wordData = {
        id: progress.id,
        word: progress.word?.english || '',
        translation: progress.word?.chinese || '',
        memoryStrength: progress.memoryStrength,
        nextReviewAt: progress.nextReviewAt.toISOString(),
        lastReviewedAt: progress.lastReviewedAt.toISOString(),
        status: progress.status,
        reviewCount: wordReviewList.length,
        correctCount: wordReviewList.filter(r => r.isCorrect).length,
        incorrectCount: wordReviewList.filter(r => !r.isCorrect).length,
      };

      // 判斷遺忘狀態
      const daysSinceLastReview = Math.floor(
        (now.getTime() - progress.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isOverdue = progress.nextReviewAt < now;

      if (progress.memoryStrength >= 80) {
        masteredWords.push(wordData);
      } else if (progress.memoryStrength >= 20 && progress.memoryStrength < 80) {
        if (isOverdue && daysSinceLastReview > 3) {
          forgettingWords.push(wordData);
        } else {
          learningWords.push(wordData);
        }
      } else {
        newWords.push(wordData);
      }
    });

    // 7. 生成圖表數據
    const chartData = generateChartData(filteredProgress);

    // 8. 返回數據
    return NextResponse.json({
      words: filteredProgress.map(p => {
        const wordReviewList = reviewsByWordId.get(p.wordId) || [];
        return {
          id: p.id,
          word: p.word?.english || '',
          translation: p.word?.chinese || '',
          memoryStrength: p.memoryStrength,
          nextReviewAt: p.nextReviewAt.toISOString(),
          lastReviewedAt: p.lastReviewedAt.toISOString(),
          status: p.status,
          reviewCount: wordReviewList.length,
          correctCount: wordReviewList.filter(r => r.isCorrect).length,
          incorrectCount: wordReviewList.filter(r => !r.isCorrect).length,
        };
      }),
      masteredWords,
      learningWords,
      forgettingWords,
      newWords,
      chartData,
    });

  } catch (error) {
    console.error('❌ 獲取遺忘曲線數據失敗:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch forgetting curve data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateChartData(progress: any[]) {
  // 按記憶強度分組
  const strengthGroups = {
    '0-20%': 0,
    '20-40%': 0,
    '40-60%': 0,
    '60-80%': 0,
    '80-100%': 0,
  };

  progress.forEach(p => {
    const strength = p.memoryStrength;
    if (strength < 20) strengthGroups['0-20%']++;
    else if (strength < 40) strengthGroups['20-40%']++;
    else if (strength < 60) strengthGroups['40-60%']++;
    else if (strength < 80) strengthGroups['60-80%']++;
    else strengthGroups['80-100%']++;
  });

  return {
    labels: Object.keys(strengthGroups),
    datasets: [
      {
        label: '單字數量',
        data: Object.values(strengthGroups),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
      },
    ],
  };
}

