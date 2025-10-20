import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, createAuthResponse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// 強制動態渲染
export const dynamic = 'force-dynamic';

// 獲取用戶統計
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    // 獲取用戶的活動統計
    const activityCount = await prisma.activity.count({
      where: { userId: auth.user!.id }
    });

    // 獲取用戶的遊戲統計（如果有 GameSession 模型）
    let gameStats = { totalSessions: 0, totalScore: 0, averageScore: 0 };
    try {
      const gameSessions = await prisma.gameSession.findMany({
        where: { userId: auth.user!.id }
      });
      
      gameStats = {
        totalSessions: gameSessions.length,
        totalScore: gameSessions.reduce((sum, session) => sum + (session.score || 0), 0),
        averageScore: gameSessions.length > 0 
          ? gameSessions.reduce((sum, session) => sum + (session.score || 0), 0) / gameSessions.length 
          : 0
      };
    } catch (error) {
      // GameSession 模型可能不存在，忽略錯誤
      console.log('GameSession 模型不存在，跳過遊戲統計');
    }

    return NextResponse.json({
      user: {
        id: auth.user!.id,
        name: auth.user!.name,
        email: auth.user!.email
      },
      stats: {
        activityCount,
        ...gameStats
      }
    });
  } catch (error) {
    console.error('獲取用戶統計失敗:', error);
    return NextResponse.json(
      { error: '獲取用戶統計失敗' },
      { status: 500 }
    );
  }
}
