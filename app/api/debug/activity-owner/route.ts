import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    // 獲取活動 ID
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json({ error: '缺少活動 ID' }, { status: 400 });
    }

    // 查詢活動
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    // 獲取當前用戶
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      activity: {
        id: activity.id,
        title: activity.title,
        userId: activity.userId,
        owner: activity.user,
      },
      currentUser,
      isOwner: currentUser?.id === activity.userId,
    });
  } catch (error) {
    console.error('Debug API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

