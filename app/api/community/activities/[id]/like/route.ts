/**
 * 社區活動喜歡功能 API
 * 
 * POST /api/community/activities/[id]/like
 * - 喜歡/取消喜歡活動
 * - 使用事務處理確保數據一致性
 * - 返回更新後的喜歡數
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶登入
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const activityId = params.id;

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 檢查活動是否存在且已發布到社區
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        publishedToCommunityAt: true,
        communityLikes: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    if (!activity.publishedToCommunityAt) {
      return NextResponse.json(
        { error: '此活動未發布到社區' },
        { status: 400 }
      );
    }

    // 檢查是否已經喜歡
    const existingLike = await prisma.activityLike.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId: user.id,
        },
      },
    });

    let isLiked: boolean;
    let newLikeCount: number;

    if (existingLike) {
      // 取消喜歡
      await prisma.$transaction([
        // 刪除喜歡記錄
        prisma.activityLike.delete({
          where: {
            activityId_userId: {
              activityId,
              userId: user.id,
            },
          },
        }),
        // 減少喜歡數
        prisma.activity.update({
          where: { id: activityId },
          data: {
            communityLikes: {
              decrement: 1,
            },
          },
        }),
      ]);

      isLiked = false;
      newLikeCount = Math.max(0, activity.communityLikes - 1);
    } else {
      // 添加喜歡
      await prisma.$transaction([
        // 創建喜歡記錄
        prisma.activityLike.create({
          data: {
            activityId,
            userId: user.id,
          },
        }),
        // 增加喜歡數
        prisma.activity.update({
          where: { id: activityId },
          data: {
            communityLikes: {
              increment: 1,
            },
          },
        }),
      ]);

      isLiked = true;
      newLikeCount = activity.communityLikes + 1;
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount: newLikeCount,
    });
  } catch (error) {
    console.error('喜歡功能錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/activities/[id]/like
 * - 檢查當前用戶是否已喜歡此活動
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶登入
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        isLiked: false,
      });
    }

    const activityId = params.id;

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({
        isLiked: false,
      });
    }

    // 檢查是否已喜歡
    const existingLike = await prisma.activityLike.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      isLiked: !!existingLike,
    });
  } catch (error) {
    console.error('檢查喜歡狀態錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

