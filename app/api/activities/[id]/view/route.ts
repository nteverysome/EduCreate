import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/activities/[id]/view
 * 增加活動的瀏覽次數
 * 不需要身份驗證，任何人訪問遊戲頁面都會增加瀏覽次數
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id;

    console.log('👁️ 增加活動瀏覽次數:', activityId);

    // 檢查活動是否存在
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      select: {
        id: true,
        playCount: true,
      },
    });

    if (!activity) {
      console.log('❌ 活動不存在:', activityId);
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    // 增加瀏覽次數
    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityId,
      },
      data: {
        playCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        playCount: true,
      },
    });

    console.log('✅ 瀏覽次數已更新:', {
      activityId,
      newPlayCount: updatedActivity.playCount,
    });

    return NextResponse.json({
      success: true,
      playCount: updatedActivity.playCount,
    });
  } catch (error) {
    console.error('增加瀏覽次數時出錯:', error);
    return NextResponse.json(
      { error: '增加瀏覽次數失敗' },
      { status: 500 }
    );
  }
}

