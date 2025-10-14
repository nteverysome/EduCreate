import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, createAuthResponse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// 獲取特定活動
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    const { id } = params;

    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: auth.user!.id
      },
      include: {
        template: true,
        gameTemplate: true,
        gameSettings: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('獲取活動失敗:', error);
    return NextResponse.json(
      { error: '獲取活動失敗' },
      { status: 500 }
    );
  }
}

// 更新活動
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    const { id } = params;
    const updateData = await request.json();

    // 檢查活動是否屬於當前用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id,
        userId: auth.user!.id
      }
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        template: true,
        gameTemplate: true
      }
    });

    return NextResponse.json({
      message: '活動更新成功',
      activity: updatedActivity
    });
  } catch (error) {
    console.error('更新活動失敗:', error);
    return NextResponse.json(
      { error: '更新活動失敗' },
      { status: 500 }
    );
  }
}

// 刪除活動
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    const { id } = params;

    // 檢查活動是否屬於當前用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id,
        userId: auth.user!.id
      }
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    await prisma.activity.delete({
      where: { id }
    });

    return NextResponse.json({ message: '活動刪除成功' });
  } catch (error) {
    console.error('刪除活動失敗:', error);
    return NextResponse.json(
      { error: '刪除活動失敗' },
      { status: 500 }
    );
  }
}
