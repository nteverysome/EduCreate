import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * 🔥 v96.0: 遊戲完成進度 API
 * 用於上傳遊戲完成的進度到排行榜
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      activityId,
      sessionId,
      score,
      correctCount,
      totalCount,
      accuracy,
      timeSpent,
      allPagesAnswers,
      currentPage,
      matchedPairs,
      layout,
      random,
    } = body;

    if (!activityId || !sessionId) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 更新遊戲進度為已完成
    const gameProgress = await prisma.gameProgress.update({
      where: { sessionId },
      data: {
        isCompleted: true,
        score,
        correctCount,
        totalCount,
        accuracy,
        timeSpent,
        completedAt: new Date(),
      },
    });

    // 可選：保存到排行榜（如果需要）
    // 這裡可以添加邏輯來保存到排行榜表

    return NextResponse.json({
      success: true,
      message: '遊戲完成進度已保存',
      data: gameProgress,
    });
  } catch (error) {
    console.error('❌ 保存遊戲完成進度失敗:', error);
    return NextResponse.json(
      { error: '保存遊戲完成進度失敗' },
      { status: 500 }
    );
  }
}

