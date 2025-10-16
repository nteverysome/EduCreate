/**
 * 我的收藏 API
 * 
 * GET /api/community/my-bookmarks
 * - 獲取當前用戶的收藏列表
 * - 支援分頁
 * - 支援資料夾篩選
 * - 支援排序
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatActivityForCommunity } from '@/lib/community/utils';

export async function GET(request: NextRequest) {
  try {
    // 驗證用戶登入
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // 篩選參數
    const folderId = searchParams.get('folderId');

    // 排序參數
    const sortBy = searchParams.get('sortBy') || 'latest';

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

    // 構建查詢條件
    const where: any = {
      userId: user.id,
    };

    if (folderId) {
      where.folderId = folderId;
    }

    // 構建排序條件
    let orderBy: any = {};
    switch (sortBy) {
      case 'latest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // 獲取收藏列表
    const bookmarks = await prisma.activityBookmark.findMany({
      where,
      include: {
        activity: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // 獲取總數
    const total = await prisma.activityBookmark.count({
      where,
    });

    // 獲取資料夾列表
    const folders = await prisma.folder.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 格式化活動數據
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
    const formattedBookmarks = bookmarks
      .filter(bookmark => bookmark.activity && bookmark.activity.publishedToCommunityAt)
      .map(bookmark => ({
        bookmarkId: bookmark.id,
        bookmarkedAt: bookmark.createdAt,
        folder: bookmark.folder,
        activity: formatActivityForCommunity(bookmark.activity, baseUrl),
      }));

    return NextResponse.json({
      bookmarks: formattedBookmarks,
      folders: folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        bookmarkCount: folder._count.bookmarks,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('獲取收藏列表錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

