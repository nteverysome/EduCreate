import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/srs/test-statistics
 * 測試統計 API 的各個步驟
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權', results },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    results.tests.authentication = {
      success: true,
      userId
    };

    // 2. 獲取 GEPT 等級參數
    const searchParams = request.nextUrl.searchParams;
    const geptLevelParam = searchParams.get('geptLevel') || 'ELEMENTARY';
    results.tests.geptLevelParam = {
      success: true,
      value: geptLevelParam
    };

    // 3. 測試 TTSCache 查詢
    try {
      const totalWordsCount = await prisma.tTSCache.count({
        where: { geptLevel: geptLevelParam as any }
      });
      results.tests.ttsCacheCount = {
        success: true,
        count: totalWordsCount
      };
    } catch (error: any) {
      results.tests.ttsCacheCount = {
        success: false,
        error: error.message
      };
    }

    // 4. 測試 UserWordProgress 查詢
    try {
      const allProgress = await prisma.userWordProgress.findMany({
        where: { userId },
        take: 5
      });
      results.tests.userWordProgressQuery = {
        success: true,
        count: allProgress.length,
        sample: allProgress.map(p => ({
          id: p.id,
          wordId: p.wordId,
          memoryStrength: p.memoryStrength,
          nextReviewAt: p.nextReviewAt
        }))
      };
    } catch (error: any) {
      results.tests.userWordProgressQuery = {
        success: false,
        error: error.message
      };
    }

    // 5. 測試 UserWordProgress 帶 word 關聯查詢
    try {
      const progressWithWord = await prisma.userWordProgress.findMany({
        where: { userId },
        include: {
          word: {
            select: {
              english: true,
              chinese: true,
              audioUrl: true
            }
          }
        },
        take: 5
      });
      results.tests.userWordProgressWithWord = {
        success: true,
        count: progressWithWord.length,
        sample: progressWithWord.map(p => ({
          id: p.id,
          wordId: p.wordId,
          word: p.word
        }))
      };
    } catch (error: any) {
      results.tests.userWordProgressWithWord = {
        success: false,
        error: error.message
      };
    }

    // 6. 測試 LearningSession 查詢
    try {
      const sessions = await prisma.learningSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 5
      });
      results.tests.learningSessionQuery = {
        success: true,
        count: sessions.length,
        sample: sessions.map(s => ({
          id: s.id,
          geptLevel: s.geptLevel,
          startedAt: s.startedAt
        }))
      };
    } catch (error: any) {
      results.tests.learningSessionQuery = {
        success: false,
        error: error.message
      };
    }

    // 7. 測試 WordReview 查詢 (通過 session 關聯)
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

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
      results.tests.wordReviewCount = {
        success: true,
        count: todayReviews
      };
    } catch (error: any) {
      results.tests.wordReviewCount = {
        success: false,
        error: error.message
      };
    }

    results.summary = {
      allTestsPassed: Object.values(results.tests).every((t: any) => t.success),
      totalTests: Object.keys(results.tests).length,
      passedTests: Object.values(results.tests).filter((t: any) => t.success).length
    };

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('❌ 測試失敗:', error);
    results.globalError = {
      message: error.message,
      stack: error.stack
    };
    return NextResponse.json(results, { status: 500 });
  }
}

