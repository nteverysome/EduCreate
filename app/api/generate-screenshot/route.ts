import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pushScreenshotUpdate } from '@/lib/pusher';

/**
 * 生成活動截圖 API
 * 
 * 流程：
 * 1. 接收 activityId
 * 2. 調用 Railway 截圖服務生成截圖
 * 3. 上傳截圖到 Vercel Blob Storage
 * 4. 更新 Activity 記錄的 thumbnailUrl
 * 5. 返回成功響應
 */

// Railway 截圖服務 URL（從環境變量獲取）
const RAILWAY_SCREENSHOT_SERVICE_URL = process.env.RAILWAY_SCREENSHOT_SERVICE_URL || '';

// 是否使用 Mock 模式（開發階段）
const USE_MOCK_MODE = !RAILWAY_SCREENSHOT_SERVICE_URL || process.env.USE_MOCK_SCREENSHOTS === 'true';

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
    const { activityId, isRetry = false } = body;

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
    if (activity.thumbnailUrl && !body.force && !isRetry) {
      return NextResponse.json(
        {
          message: 'Thumbnail already exists',
          thumbnailUrl: activity.thumbnailUrl,
          needsConfirmation: true,
        },
        { status: 200 }
      );
    }

    // 6. 更新狀態為 generating
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        screenshotStatus: 'generating',
        screenshotError: null,
        screenshotRetryCount: isRetry ? { increment: 1 } : 0,
      },
    });

    // 7. 推送實時更新：開始生成
    await pushScreenshotUpdate(session.user.id, activityId, 'generating');

    let thumbnailUrl: string;

    if (USE_MOCK_MODE) {
      // ===== Mock 模式：使用現有的遊戲截圖 =====
      console.log('[Mock Mode] Using existing game screenshot');
      
      // 根據遊戲類型選擇對應的截圖
      const mockScreenshots: Record<string, string> = {
        'shimozurdo': '/game-screenshots/shimozurdo.png',
        'quiz': '/game-screenshots/quiz-preview.png',
        'flashcards': '/game-screenshots/flashcards-preview.png',
        'matching': '/game-screenshots/matching-preview.png',
        'default': '/game-screenshots/default-preview.png',
      };

      // 使用活動類型或默認截圖
      const mockPath = mockScreenshots[activity.type] || mockScreenshots['default'];
      thumbnailUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}${mockPath}`;

      console.log('[Mock Mode] Mock thumbnail URL:', thumbnailUrl);
    } else {
      // ===== 生產模式：調用 Railway 截圖服務 =====
      console.log('[Production Mode] Calling Railway screenshot service');
      console.log('[Production Mode] Railway URL:', RAILWAY_SCREENSHOT_SERVICE_URL);

      // 6. 構建截圖預覽頁面 URL（專門用於截圖，包含完整的遊戲 iframe）
      const gameUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}/screenshot-preview/${activityId}`;
      console.log('[Production Mode] Screenshot preview URL:', gameUrl);

      // 7. 調用 Railway 截圖服務
      // 截圖預覽頁面已經是 100% 遊戲內容，直接截取整個頁面
      // 使用智能等待機制，大幅減少等待時間（從 8 秒降至 2-3 秒）
      console.log('[Production Mode] Sending screenshot request with smart waiting...');
      const screenshotResponse = await fetch(`${RAILWAY_SCREENSHOT_SERVICE_URL}/screenshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: gameUrl,
          width: 1200,
          height: 630,
          waitTime: 3000, // 回退等待時間（智能等待會更快完成）
          selector: 'iframe', // 截取 iframe 遊戲容器（100% 遊戲內容）
        }),
      });

      console.log('[Production Mode] Screenshot response status:', screenshotResponse.status);

      if (!screenshotResponse.ok) {
        const errorText = await screenshotResponse.text();
        console.error('[Production Mode] Screenshot service error:', errorText);
        throw new Error(`Screenshot service failed: ${screenshotResponse.status} ${screenshotResponse.statusText} - ${errorText}`);
      }

      // 8. 獲取截圖 Buffer
      console.log('[Production Mode] Getting screenshot buffer...');
      const screenshotBuffer = await screenshotResponse.arrayBuffer();
      console.log('[Production Mode] Screenshot buffer size:', screenshotBuffer.byteLength);

      const screenshotBlob = new Blob([screenshotBuffer], { type: 'image/png' });

      // 9. 上傳到 Vercel Blob Storage
      console.log('[Production Mode] Uploading to Vercel Blob...');
      const filename = `activity-${activityId}-${Date.now()}.png`;
      const blob = await put(filename, screenshotBlob, {
        access: 'public',
        addRandomSuffix: false,
      });

      thumbnailUrl = blob.url;
      console.log('[Production Mode] Uploaded to Vercel Blob:', thumbnailUrl);
    }

    // 10. 更新 Activity 記錄（成功）
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        thumbnailUrl,
        screenshotStatus: 'completed',
        screenshotError: null,
      },
    });

    // 11. 推送實時更新：生成完成
    await pushScreenshotUpdate(session.user.id, activityId, 'completed', {
      thumbnailUrl,
    });

    // 12. 返回成功響應
    return NextResponse.json({
      success: true,
      thumbnailUrl,
      mode: USE_MOCK_MODE ? 'mock' : 'production',
      message: USE_MOCK_MODE
        ? 'Mock thumbnail generated successfully'
        : 'Screenshot generated and uploaded successfully',
      status: 'completed',
    });

  } catch (error) {
    console.error('[Generate Screenshot Error]', error);

    // 提取詳細錯誤信息
    let errorMessage = 'Unknown error';
    let errorStack = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }

    console.error('[Generate Screenshot Error] Message:', errorMessage);
    console.error('[Generate Screenshot Error] Stack:', errorStack);

    // 更新活動記錄（失敗）
    try {
      const body = await request.json();
      const { activityId } = body;
      if (activityId) {
        await prisma.activity.update({
          where: { id: activityId },
          data: {
            screenshotStatus: 'failed',
            screenshotError: errorMessage,
          },
        });

        // 推送實時更新：生成失敗
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          await pushScreenshotUpdate(session.user.id, activityId, 'failed', {
            error: errorMessage,
          });
        }
      }
    } catch (updateError) {
      console.error('[Update Screenshot Status Error]', updateError);
    }

    return NextResponse.json(
      {
        error: 'Failed to generate screenshot',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        timestamp: new Date().toISOString(),
        status: 'failed',
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
      railwayServiceUrl: RAILWAY_SCREENSHOT_SERVICE_URL || 'Not configured',
      mockMode: USE_MOCK_MODE,
      blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
    };

    // 如果不是 Mock 模式，檢查 Railway 服務健康狀態
    let railwayHealth = null;
    if (!USE_MOCK_MODE) {
      try {
        const healthResponse = await fetch(`${RAILWAY_SCREENSHOT_SERVICE_URL}/health`, {
          method: 'GET',
        });
        railwayHealth = await healthResponse.json();
      } catch (error) {
        railwayHealth = { error: 'Failed to connect to Railway service' };
      }
    }

    return NextResponse.json({
      status: 'ok',
      config,
      railwayHealth,
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

