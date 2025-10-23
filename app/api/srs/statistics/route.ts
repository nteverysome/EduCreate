import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/srs/statistics
 * 獲取學習統計
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

    console.log('📊 獲取學習統計');
    console.log(`  - 用戶 ID: ${userId}`);

    // 2. 獲取用戶的所有學習進度
    const allProgress = await prisma.userWordProgress.findMany({
      where: { userId }
    });

    // 3. 獲取所有學習會話
    const allSessions = await prisma.learningSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' }
    });

    // 4. 計算統計數據
    const totalWords = allProgress.length;
    const masteredWords = allProgress.filter(p => p.status === 'MASTERED').length;
    const learningWords = allProgress.filter(p => p.status === 'LEARNING').length;
    const reviewingWords = allProgress.filter(p => p.status === 'REVIEWING').length;

    const now = new Date();
    const dueForReview = allProgress.filter(p => 
      p.nextReviewAt <= now && p.status !== 'MASTERED'
    ).length;

    // 5. 計算連續天數
    let streakDays = 0;
    if (allSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(today);
      for (const session of allSessions) {
        const sessionDate = new Date(session.startedAt);
        sessionDate.setHours(0, 0, 0, 0);
        
        if (sessionDate.getTime() === currentDate.getTime()) {
          streakDays++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 6. 按 GEPT 等級統計
    const progressByLevel = {
      elementary: allProgress.filter(p => {
        // TODO: 需要從 word 獲取 geptLevel
        return true;
      }).length,
      intermediate: 0,
      'high-intermediate': 0
    };

    // 7. 最近 7 天的學習數據
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

    return NextResponse.json({
      overview: {
        totalWords,
        masteredWords,
        learningWords,
        reviewingWords,
        dueForReview
      },
      streakDays,
      progressByLevel,
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

