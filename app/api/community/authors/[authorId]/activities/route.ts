/**
 * 作者活動列表 API
 * 
 * GET /api/community/authors/[authorId]/activities
 * - 獲取指定作者發布到社區的活動列表
 * - 支援分頁
 * - 支援排序
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatActivityForCommunity } from '@/lib/community/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { authorId: string } }
) {
  try {
    const { authorId } = params;
    const { searchParams } = new URL(request.url);

    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // 排序參數
    const sortBy = searchParams.get('sortBy') || 'latest';

    // 資料夾參數
    const folderId = searchParams.get('folderId') || null;

    // 檢查作者是否存在並獲取完整信息
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        bio: true,
        socialLinks: true,
        createdAt: true,
      },
    });

    if (!author) {
      return NextResponse.json(
        { error: '作者不存在' },
        { status: 404 }
      );
    }

    // 獲取粉絲和關注數量
    const [followersCount, followingCount] = await Promise.all([
      prisma.userFollow.count({
        where: { followingId: authorId },
      }),
      prisma.userFollow.count({
        where: { followerId: authorId },
      }),
    ]);

    // 構建排序條件
    let orderBy: any = {};
    switch (sortBy) {
      case 'latest':
        orderBy = { publishedToCommunityAt: 'desc' };
        break;
      case 'popular':
        orderBy = { communityLikes: 'desc' };
        break;
      case 'views':
        orderBy = { communityViews: 'desc' };
        break;
      case 'plays':
        orderBy = { communityPlays: 'desc' };
        break;
      default:
        orderBy = { publishedToCommunityAt: 'desc' };
    }

    // 獲取當前資料夾的子資料夾（只顯示有已發布活動的）
    const subfolders = await prisma.folder.findMany({
      where: {
        userId: authorId,
        type: 'ACTIVITIES',
        parentId: folderId,
        activities: {
          some: {
            publishedToCommunityAt: {
              not: null,
            },
            deletedAt: null,
          },
        },
      },
      include: {
        _count: {
          select: {
            activities: {
              where: {
                publishedToCommunityAt: {
                  not: null,
                },
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 獲取當前資料夾信息
    const currentFolder = folderId
      ? await prisma.folder.findUnique({
          where: { id: folderId },
          select: {
            id: true,
            name: true,
            color: true,
            parentId: true,
          },
        })
      : null;

    // 構建麵包屑路徑
    const breadcrumbs: Array<{ id: string; name: string }> = [];
    if (currentFolder) {
      let folder = currentFolder;
      breadcrumbs.unshift({ id: folder.id, name: folder.name });

      while (folder.parentId) {
        const parentFolder = await prisma.folder.findUnique({
          where: { id: folder.parentId },
          select: {
            id: true,
            name: true,
            parentId: true,
          },
        });

        if (parentFolder) {
          breadcrumbs.unshift({ id: parentFolder.id, name: parentFolder.name });
          folder = parentFolder;
        } else {
          break;
        }
      }
    }

    // 獲取活動列表（根據 folderId 過濾）
    const activities = await prisma.activity.findMany({
      where: {
        userId: authorId,
        publishedToCommunityAt: {
          not: null,
        },
        deletedAt: null,
        folderId: folderId,
      },
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
      orderBy,
      skip,
      take: limit,
    });

    // 獲取總數（根據 folderId 過濾）
    const total = await prisma.activity.count({
      where: {
        userId: authorId,
        publishedToCommunityAt: {
          not: null,
        },
        deletedAt: null,
        folderId: folderId,
      },
    });

    // 獲取作者統計
    const stats = await prisma.activity.aggregate({
      where: {
        userId: authorId,
        publishedToCommunityAt: {
          not: null,
        },
        deletedAt: null,
      },
      _sum: {
        communityViews: true,
        communityLikes: true,
        communityBookmarks: true,
        communityPlays: true,
      },
    });

    // 格式化活動數據
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
    const formattedActivities = activities.map(activity =>
      formatActivityForCommunity(activity, baseUrl)
    );

    // 格式化資料夾數據
    const formattedFolders = subfolders.map(folder => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      activityCount: folder._count.activities,
    }));

    return NextResponse.json({
      author,
      activities: formattedActivities,
      folders: formattedFolders,
      currentFolder: currentFolder ? {
        id: currentFolder.id,
        name: currentFolder.name,
        color: currentFolder.color,
        parentId: currentFolder.parentId,
      } : null,
      breadcrumbs,
      stats: {
        totalActivities: total,
        totalViews: stats._sum.communityViews || 0,
        totalLikes: stats._sum.communityLikes || 0,
        totalBookmarks: stats._sum.communityBookmarks || 0,
        totalPlays: stats._sum.communityPlays || 0,
        followersCount,
        followingCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('獲取作者活動列表錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

