/**
 * 社區活動詳情 API
 * 
 * GET /api/community/activities/by-token/[shareToken]
 * 
 * 功能：
 * - 獲取單個社區活動的詳細信息
 * - 增加瀏覽數
 * - 不需要登入即可訪問
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { formatActivityForCommunity } from '@/lib/community/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    // 1. 獲取活動
    const activity = await prisma.activity.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
            comments: true,
          },
        },
      },
    });

    // 2. 檢查活動是否存在
    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在', message: '找不到指定的活動' },
        { status: 404 }
      );
    }

    // 3. 檢查活動是否已發布到社區
    if (!activity.isPublicShared || !activity.publishedToCommunityAt) {
      return NextResponse.json(
        { error: '活動未發布', message: '此活動尚未發布到社區' },
        { status: 403 }
      );
    }

    // 4. 增加瀏覽數（異步執行，不阻塞響應）
    prisma.activity.update({
      where: { id: activity.id },
      data: {
        communityViews: { increment: 1 },
      },
    }).catch(error => {
      console.error('更新瀏覽數失敗:', error);
    });

    // 5. 檢查當前用戶是否已喜歡/收藏（如果已登入）
    const session = await getServerSession(authOptions);
    let isLiked = false;
    let isBookmarked = false;

    if (session?.user?.id) {
      const [like, bookmark] = await Promise.all([
        prisma.activityLike.findUnique({
          where: {
            activityId_userId: {
              activityId: activity.id,
              userId: session.user.id,
            },
          },
        }),
        prisma.activityBookmark.findUnique({
          where: {
            activityId_userId: {
              activityId: activity.id,
              userId: session.user.id,
            },
          },
        }),
      ]);

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    // 6. 格式化活動數據
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const formattedActivity = formatActivityForCommunity(activity, baseUrl);

    // 7. 添加額外信息
    const detailedActivity = {
      ...formattedActivity,
      stats: {
        ...formattedActivity.stats,
        likes: activity._count.likes,
        bookmarks: activity._count.bookmarks,
        comments: activity._count.comments,
      },
      userInteraction: {
        isLiked,
        isBookmarked,
      },
      isOwner: session?.user?.id === activity.userId,
    };

    // 8. 返回響應
    return NextResponse.json({
      success: true,
      activity: detailedActivity,
    });
  } catch (error) {
    console.error('獲取社區活動詳情失敗:', error);
    return NextResponse.json(
      {
        error: '伺服器錯誤',
        message: '獲取活動詳情時發生錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}

/**
 * 更新社區活動信息 API
 * 
 * PATCH /api/community/activities/by-token/[shareToken]
 * 
 * 功能：
 * - 更新社區活動的分類、標籤、描述等
 * - 需要登入且必須是活動擁有者
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權', message: '請先登入' },
        { status: 401 }
      );
    }

    // 2. 獲取活動
    const activity = await prisma.activity.findUnique({
      where: { shareToken: params.shareToken },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在', message: '找不到指定的活動' },
        { status: 404 }
      );
    }

    // 3. 驗證擁有權
    if (activity.userId !== session.user.id) {
      return NextResponse.json(
        { error: '權限不足', message: '您沒有權限更新此活動' },
        { status: 403 }
      );
    }

    // 4. 檢查活動是否已發布到社區
    if (!activity.isPublicShared) {
      return NextResponse.json(
        { error: '活動未發布', message: '此活動尚未發布到社區' },
        { status: 400 }
      );
    }

    // 5. 解析請求體
    const body = await request.json();
    const { category, tags, description, thumbnailUrl } = body;

    // 6. 構建更新數據
    const updateData: any = {};
    
    if (category !== undefined) {
      updateData.communityCategory = category;
    }
    
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return NextResponse.json(
          { error: '數據格式錯誤', message: '標籤必須是數組' },
          { status: 400 }
        );
      }
      updateData.communityTags = tags;
    }
    
    if (description !== undefined) {
      updateData.communityDescription = description;
    }
    
    if (thumbnailUrl !== undefined) {
      updateData.communityThumbnail = thumbnailUrl;
    }

    // 7. 更新活動
    const updatedActivity = await prisma.activity.update({
      where: { id: activity.id },
      data: updateData,
    });

    // 8. 返回響應
    return NextResponse.json({
      success: true,
      message: '活動信息已更新',
      activity: {
        id: updatedActivity.id,
        category: updatedActivity.communityCategory,
        tags: updatedActivity.communityTags,
        description: updatedActivity.communityDescription,
        thumbnailUrl: updatedActivity.communityThumbnail,
      },
    });
  } catch (error) {
    console.error('更新社區活動失敗:', error);
    return NextResponse.json(
      {
        error: '伺服器錯誤',
        message: '更新活動時發生錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}

