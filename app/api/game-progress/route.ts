import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * 🔥 v96.0: 遊戲進度 API
 * 用於保存和恢復遊戲進度（本地和雲端）
 */

// GET: 恢復遊戲進度
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json(
        { error: '缺少 activityId 參數' },
        { status: 400 }
      );
    }

    // 從資料庫查詢最新的遊戲進度
    const gameProgress = await prisma.gameProgress.findFirst({
      where: {
        activityId: activityId,
        isCompleted: false, // 只查詢未完成的進度
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!gameProgress) {
      return NextResponse.json(
        { message: '沒有找到保存的遊戲進度' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gameProgress,
    });
  } catch (error) {
    console.error('❌ 恢復遊戲進度失敗:', error);
    return NextResponse.json(
      { error: '恢復遊戲進度失敗' },
      { status: 500 }
    );
  }
}

// POST: 保存遊戲進度
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      activityId,
      sessionId,
      currentPage,
      matchedPairs,
      allPagesAnswers,
      currentPageAnswers,
      gameStartTime,
      totalGameTime,
      gameState,
      timerType,
      remainingTime,
      layout,
      random,
    } = body;

    if (!activityId || !sessionId) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 檢查是否已存在該會話的進度
    const existingProgress = await prisma.gameProgress.findUnique({
      where: { sessionId },
    });

    let gameProgress;

    if (existingProgress) {
      // 更新現有進度
      gameProgress = await prisma.gameProgress.update({
        where: { sessionId },
        data: {
          currentPage,
          matchedPairs: JSON.stringify(matchedPairs),
          allPagesAnswers: JSON.stringify(allPagesAnswers),
          currentPageAnswers: JSON.stringify(currentPageAnswers),
          gameStartTime: new Date(gameStartTime),
          totalGameTime,
          gameState,
          timerType,
          remainingTime,
          layout,
          random,
          updatedAt: new Date(),
        },
      });
    } else {
      // 創建新的進度記錄
      gameProgress = await prisma.gameProgress.create({
        data: {
          activityId,
          sessionId,
          currentPage,
          matchedPairs: JSON.stringify(matchedPairs),
          allPagesAnswers: JSON.stringify(allPagesAnswers),
          currentPageAnswers: JSON.stringify(currentPageAnswers),
          gameStartTime: new Date(gameStartTime),
          totalGameTime,
          gameState,
          timerType,
          remainingTime,
          layout,
          random,
          isCompleted: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: gameProgress,
    });
  } catch (error) {
    console.error('❌ 保存遊戲進度失敗:', error);
    return NextResponse.json(
      { error: '保存遊戲進度失敗' },
      { status: 500 }
    );
  }
}

