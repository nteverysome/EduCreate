import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// 開啟社區分享
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;

    // 檢查活動是否存在且屬於當前用戶
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: session.user.id,
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // 如果已經開啟分享，返回現有的 token
    if (activity.isPublicShared && activity.shareToken) {
      return NextResponse.json({
        success: true,
        shareToken: activity.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${activityId}/${activity.shareToken}`,
      });
    }

    // 生成新的分享 token
    const shareToken = nanoid(16);

    // 更新活動
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        isPublicShared: true,
        shareToken: shareToken,
      },
    });

    return NextResponse.json({
      success: true,
      shareToken: shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${activityId}/${shareToken}`,
    });

  } catch (error) {
    console.error('Error enabling community share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 關閉社區分享
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;

    // 檢查活動是否存在且屬於當前用戶
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: session.user.id,
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // 關閉分享
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        isPublicShared: false,
        shareToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Community sharing disabled',
    });

  } catch (error) {
    console.error('Error disabling community share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 獲取分享狀態
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;

    // 檢查活動是否存在且屬於當前用戶
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        isPublicShared: true,
        shareToken: true,
        communityPlays: true,
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const shareUrl = activity.shareToken
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/share/${activityId}/${activity.shareToken}`
      : null;

    return NextResponse.json({
      success: true,
      activity: {
        ...activity,
        shareUrl,
      },
    });

  } catch (error) {
    console.error('Error getting community share status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
