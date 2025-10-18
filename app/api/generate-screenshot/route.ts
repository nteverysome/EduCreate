import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 生成活動截圖 API
 *
 * 流程：
 * 1. 接收 activityId
 * 2. 根據活動的 templateType 選擇對應的遊戲截圖
 * 3. 使用現有的遊戲截圖作為 thumbnailUrl（100% 遊戲內容）
 * 4. 更新 Activity 記錄的 thumbnailUrl
 * 5. 返回成功響應
 */

export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. 解析請求參數
    const body = await request.json();
    const { activityId } = body;

    if (!activityId) {
      return NextResponse.json(
        { error: 'Missing activityId' },
        { status: 400 }
      );
    }

    // 3. 查詢活動信息
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        title: true,
        type: true,
        templateType: true, // 添加 templateType 字段
        userId: true,
        thumbnailUrl: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // 4. 驗證權限（只有活動創建者可以生成截圖）
    if (activity.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 5. 如果已有截圖，詢問是否覆蓋
    if (activity.thumbnailUrl && !body.force) {
      return NextResponse.json(
        {
          message: 'Thumbnail already exists',
          thumbnailUrl: activity.thumbnailUrl,
          needsConfirmation: true,
        },
        { status: 200 }
      );
    }

    // ===== 使用現有的遊戲截圖（100% 遊戲內容）=====
    console.log('[Static Screenshot Mode] Using existing game screenshot');

    // 根據 templateType 選擇對應的遊戲截圖
    const gameScreenshots: Record<string, string> = {
      'shimozurdo-game': '/game-screenshots/shimozurdo.png',
      'airplane-game': '/game-screenshots/airplane-preview.png',
      'quiz': '/game-screenshots/quiz-preview.png',
      'flashcards': '/game-screenshots/flashcards-preview.png',
      'matching': '/game-screenshots/matching-preview.png',
      'default': '/game-screenshots/default-preview.png',
    };

    // 使用 templateType 或 type 來選擇截圖
    const gameType = activity.templateType || activity.type;
    const screenshotPath = gameScreenshots[gameType] || gameScreenshots['default'];
    const thumbnailUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}${screenshotPath}`;

    console.log('[Static Screenshot Mode] Game type:', gameType);
    console.log('[Static Screenshot Mode] Screenshot path:', screenshotPath);
    console.log('[Static Screenshot Mode] Thumbnail URL:', thumbnailUrl);

    // 10. 更新 Activity 記錄
    await prisma.activity.update({
      where: { id: activityId },
      data: { thumbnailUrl },
    });

    // 11. 返回成功響應
    return NextResponse.json({
      success: true,
      thumbnailUrl,
      mode: 'static',
      gameType,
      message: 'Static game screenshot assigned successfully',
    });

  } catch (error) {
    console.error('[Generate Screenshot Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to generate screenshot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET 端點：檢查截圖服務狀態
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 檢查配置
    const config = {
      mode: 'static',
      description: 'Using existing game screenshots (100% game content)',
      availableGames: [
        'shimozurdo-game',
        'airplane-game',
        'quiz',
        'flashcards',
        'matching',
      ],
    };

    return NextResponse.json({
      status: 'ok',
      config,
    });

  } catch (error) {
    console.error('[Screenshot Service Status Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to check service status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

