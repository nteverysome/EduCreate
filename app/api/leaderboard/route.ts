import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/leaderboard?activityId=xxx
 * 獲取指定活動的排行榜
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!activityId) {
      return NextResponse.json(
        { error: 'activityId is required' },
        { status: 400 }
      );
    }

    // 從數據庫獲取排行榜（分數優先，時間次之）
    const leaderboard = await prisma.gameLeaderboard.findMany({
      where: {
        activityId: activityId,
      },
      orderBy: [
        { score: 'desc' },      // 分數優先（降序）
        { timeSpent: 'asc' },   // 時間次之（升序，時間越短越好）
      ],
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('❌ 獲取排行榜失敗:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leaderboard
 * 保存分數到排行榜
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      activityId,
      playerName,
      score,
      correctCount,
      totalCount,
      accuracy,
      timeSpent,
      gameData,
    } = body;

    // 驗證必填字段
    if (!activityId || !playerName || score === undefined) {
      return NextResponse.json(
        { error: 'activityId, playerName, and score are required' },
        { status: 400 }
      );
    }

    // 保存到數據庫
    const leaderboardEntry = await prisma.gameLeaderboard.create({
      data: {
        activityId,
        playerName,
        score,
        correctCount: correctCount || 0,
        totalCount: totalCount || 0,
        accuracy: accuracy || 0,
        timeSpent: timeSpent || 0,
        gameData: gameData || null,
      },
    });

    console.log('💾 分數已保存到數據庫:', leaderboardEntry);

    return NextResponse.json({
      success: true,
      data: leaderboardEntry,
    });
  } catch (error) {
    console.error('❌ 保存分數失敗:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

