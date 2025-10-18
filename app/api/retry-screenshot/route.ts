import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 重試截圖生成 API
 * 
 * 用於手動重試失敗的截圖生成
 */

const MAX_RETRY_COUNT = 3;

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
        userId: true,
        screenshotStatus: true,
        screenshotRetryCount: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // 4. 驗證權限
    if (activity.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 5. 檢查重試次數
    if (activity.screenshotRetryCount >= MAX_RETRY_COUNT) {
      return NextResponse.json(
        {
          error: 'Max retry count exceeded',
          message: `已達到最大重試次數 (${MAX_RETRY_COUNT})`,
          retryCount: activity.screenshotRetryCount,
        },
        { status: 429 }
      );
    }

    // 6. 調用截圖生成 API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
    const screenshotResponse = await fetch(`${baseUrl}/api/generate-screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        activityId,
        isRetry: true,
        force: true,
      }),
    });

    const result = await screenshotResponse.json();

    if (!screenshotResponse.ok) {
      return NextResponse.json(
        {
          error: 'Screenshot generation failed',
          details: result,
        },
        { status: screenshotResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: '截圖重新生成成功',
      thumbnailUrl: result.thumbnailUrl,
      retryCount: activity.screenshotRetryCount + 1,
    });

  } catch (error) {
    console.error('[Retry Screenshot Error]', error);

    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: 'Failed to retry screenshot',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

