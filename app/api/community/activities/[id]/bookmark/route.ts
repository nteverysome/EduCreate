/**
 * 社區活動收藏功能 API
 * 
 * POST /api/community/activities/[id]/bookmark
 * - 收藏/取消收藏活動
 * - 支援資料夾分類（可選）
 * - 使用事務處理確保數據一致性
 * - 返回更新後的收藏數
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
    const body = await request.json();
    const { folderId } = body; // 可選的資料夾 ID

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
        communityBookmarks: true,
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

    // 如果提供了 folderId，驗證資料夾是否存在且屬於該用戶
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: user.id,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: '資料夾不存在或無權訪問' },
          { status: 404 }
        );
      }
    }

    // 檢查是否已經收藏
    const existingBookmark = await prisma.activityBookmark.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId: user.id,
        },
      },
    });

    let isBookmarked: boolean;
    let newBookmarkCount: number;

    if (existingBookmark) {
      // 取消收藏
      await prisma.$transaction([
        // 刪除收藏記錄
        prisma.activityBookmark.delete({
          where: {
            activityId_userId: {
              activityId,
              userId: user.id,
            },
          },
        }),
        // 減少收藏數
        prisma.activity.update({
          where: { id: activityId },
          data: {
            communityBookmarks: {
              decrement: 1,
            },
          },
        }),
      ]);

      isBookmarked = false;
      newBookmarkCount = Math.max(0, activity.communityBookmarks - 1);
    } else {
      // 添加收藏
      await prisma.$transaction([
        // 創建收藏記錄
        prisma.activityBookmark.create({
          data: {
            activityId,
            userId: user.id,
            folderId: folderId || null,
          },
        }),
        // 增加收藏數
        prisma.activity.update({
          where: { id: activityId },
          data: {
            communityBookmarks: {
              increment: 1,
            },
          },
        }),
      ]);

      isBookmarked = true;
      newBookmarkCount = activity.communityBookmarks + 1;
    }

    return NextResponse.json({
      success: true,
      isBookmarked,
      bookmarkCount: newBookmarkCount,
    });
  } catch (error) {
    console.error('收藏功能錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/activities/[id]/bookmark
 * - 檢查當前用戶是否已收藏此活動
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
        isBookmarked: false,
      });
    }

    const activityId = params.id;

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({
        isBookmarked: false,
      });
    }

    // 檢查是否已收藏
    const existingBookmark = await prisma.activityBookmark.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId: user.id,
        },
      },
      select: {
        id: true,
        folderId: true,
      },
    });

    return NextResponse.json({
      isBookmarked: !!existingBookmark,
      folderId: existingBookmark?.folderId || null,
    });
  } catch (error) {
    console.error('檢查收藏狀態錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/community/activities/[id]/bookmark
 * - 更新收藏的資料夾
 */
export async function PATCH(
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
    const body = await request.json();
    const { folderId } = body;

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

    // 如果提供了 folderId，驗證資料夾是否存在且屬於該用戶
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: user.id,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: '資料夾不存在或無權訪問' },
          { status: 404 }
        );
      }
    }

    // 更新收藏的資料夾
    const bookmark = await prisma.activityBookmark.update({
      where: {
        activityId_userId: {
          activityId,
          userId: user.id,
        },
      },
      data: {
        folderId: folderId || null,
      },
    });

    return NextResponse.json({
      success: true,
      bookmark,
    });
  } catch (error) {
    console.error('更新收藏資料夾錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

