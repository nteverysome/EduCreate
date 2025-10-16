import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string; token: string } }
) {
  try {
    const { activityId, token: shareToken } = params;

    // 驗證活動是否存在且已公開分享
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        shareToken: shareToken,
        isPublicShared: true,
      },
      include: {
        vocabularyItems: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '找不到這個遊戲或遊戲已停止分享' },
        { status: 404 }
      );
    }

    // 增加社區遊玩次數
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        communityPlays: {
          increment: 1,
        },
      },
    });

    // 準備遊戲數據
    const gameData = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      gameType: activity.gameType,
      difficulty: activity.difficulty,
      estimatedTime: activity.estimatedTime,
      geptLevel: activity.geptLevel,
      totalWords: activity.vocabularyItems.length,
      content: activity.content,
      elements: activity.elements,
      vocabularyItems: activity.vocabularyItems,
      gameSettings: activity.gameSettings,
    };

    return NextResponse.json({
      success: true,
      activity: gameData,
    });
  } catch (error) {
    console.error('Error loading shared activity:', error);
    return NextResponse.json(
      { error: '載入遊戲失敗' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { activityId: string; token: string } }
) {
  try {
    const { activityId, token: shareToken } = params;
    const body = await request.json();
    const { score, timeSpent, completedAt } = body;

    // 驗證活動是否存在且已公開分享
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        shareToken: shareToken,
        isPublicShared: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '找不到這個遊戲' },
        { status: 404 }
      );
    }

    // 這裡可以記錄匿名完成統計（可選）
    // 目前只是簡單返回成功，不保存個人結果
    console.log(`Anonymous completion for activity ${activityId}:`, {
      score,
      timeSpent,
      completedAt,
    });

    return NextResponse.json({
      success: true,
      message: '完成記錄已收到',
    });
  } catch (error) {
    console.error('Error recording anonymous completion:', error);
    return NextResponse.json(
      { error: '記錄完成失敗' },
      { status: 500 }
    );
  }
}
