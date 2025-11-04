/**
 * 發布活動到社區 API
 * 
 * POST /api/activities/[id]/publish-to-community
 * 
 * 功能：
 * - 將活動發布到社區
 * - 生成或使用現有的 shareToken
 * - 更新社區相關字段
 * - 驗證用戶權限
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateShareToken, validateCommunityData } from '@/lib/community/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 2. 獲取活動並驗證擁有權
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在', message: '找不到指定的活動' },
        { status: 404 }
      );
    }

    if (activity.userId !== session.user.id) {
      return NextResponse.json(
        { error: '權限不足', message: '您沒有權限發布此活動' },
        { status: 403 }
      );
    }

    // 3. 解析請求體
    const body = await request.json();
    const { category, tags, description, thumbnailUrl } = body;

    // 4. 生成 shareToken（如果還沒有）
    const shareToken = activity.shareToken || generateShareToken();

    // 5. 更新活動
    const updatedActivity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        isPublic: true,  // ✅ 發布到社區時自動設為公開
        isPublicShared: true,
        shareToken,
        publishedToCommunityAt: new Date(),
        communityCategory: category || null,
        communityTags: tags && Array.isArray(tags) && tags.length > 0 ? tags : [],
        communityDescription: description || activity.description,
        communityThumbnail: thumbnailUrl || null,
      },
    });

    // 6. 構建分享 URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/community/activity/${shareToken}`;

    // 7. 返回成功響應
    return NextResponse.json({
      success: true,
      activity: {
        id: updatedActivity.id,
        title: updatedActivity.title,
        shareToken: updatedActivity.shareToken,
        shareUrl,
        publishedAt: updatedActivity.publishedToCommunityAt?.toISOString(),
        category: updatedActivity.communityCategory,
        tags: updatedActivity.communityTags,
      },
    });
  } catch (error) {
    console.error('發布到社區失敗:', error);
    return NextResponse.json(
      {
        error: '伺服器錯誤',
        message: '發布活動時發生錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}

/**
 * 取消發布活動到社區 API
 * 
 * DELETE /api/activities/[id]/publish-to-community
 * 
 * 功能：
 * - 取消活動的社區發布
 * - 保留 shareToken（以便歷史連結仍可訪問）
 * - 清除社區相關字段
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 2. 獲取活動並驗證擁有權
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在', message: '找不到指定的活動' },
        { status: 404 }
      );
    }

    if (activity.userId !== session.user.id) {
      return NextResponse.json(
        { error: '權限不足', message: '您沒有權限取消發布此活動' },
        { status: 403 }
      );
    }

    // 3. 檢查活動是否已發布到社區
    if (!activity.isPublicShared) {
      return NextResponse.json(
        { error: '活動未發布', message: '此活動尚未發布到社區' },
        { status: 400 }
      );
    }

    // 4. 更新活動（取消發布）
    const updatedActivity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        isPublicShared: false,
        publishedToCommunityAt: null,
        // 保留 shareToken 以便歷史連結仍可訪問
        // 清除社區相關字段
        communityCategory: null,
        communityTags: [],
        communityDescription: null,
        communityThumbnail: null,
      },
    });

    // 5. 返回成功響應
    return NextResponse.json({
      success: true,
      message: '已成功取消發布到社區',
      activity: {
        id: updatedActivity.id,
        title: updatedActivity.title,
        isPublicShared: updatedActivity.isPublicShared,
      },
    });
  } catch (error) {
    console.error('取消發布失敗:', error);
    return NextResponse.json(
      {
        error: '伺服器錯誤',
        message: '取消發布時發生錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}

