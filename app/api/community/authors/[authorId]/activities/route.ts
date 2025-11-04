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

// 遞歸計算資料夾中已發布活動的數量（包括所有子資料夾）
async function getRecursivePublishedActivityCount(folderId: string): Promise<number> {
  // 計算直接在該資料夾中的已發布活動數量
  const directCount = await prisma.activity.count({
    where: {
      folderId: folderId,
      publishedToCommunityAt: {
        not: null,
      },
      deletedAt: null,
    },
  });

  // 獲取所有子資料夾
  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  // 遞歸計算所有子資料夾的已發布活動數量
  let totalCount = directCount;
  for (const subfolder of subfolders) {
    totalCount += await getRecursivePublishedActivityCount(subfolder.id);
  }

  return totalCount;
}

// 檢查資料夾或其子資料夾中是否有已發布活動
async function hasPublishedActivitiesRecursive(folderId: string): Promise<boolean> {
  // 檢查直接在該資料夾中是否有已發布活動
  const directCount = await prisma.activity.count({
    where: {
      folderId: folderId,
      publishedToCommunityAt: {
        not: null,
      },
      deletedAt: null,
    },
  });

  if (directCount > 0) {
    return true;
  }

  // 獲取所有子資料夾
  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  // 遞歸檢查所有子資料夾
  for (const subfolder of subfolders) {
    const hasActivities = await hasPublishedActivitiesRecursive(subfolder.id);
    if (hasActivities) {
      return true;
    }
  }

  return false;
}

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

    // 獲取當前資料夾的所有子資料夾
    const allSubfolders = await prisma.folder.findMany({
      where: {
        userId: authorId,
        type: 'ACTIVITIES',
        parentId: folderId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 過濾出包含已發布活動的資料夾（遞歸檢查）
    const subfoldersWithActivities = await Promise.all(
      allSubfolders.map(async (folder) => {
        const hasActivities = await hasPublishedActivitiesRecursive(folder.id);
        if (!hasActivities) {
          return null;
        }

        const activityCount = await getRecursivePublishedActivityCount(folder.id);
        return {
          id: folder.id,
          name: folder.name,
          color: folder.color,
          activityCount,
        };
      })
    );

    // 移除 null 值（沒有已發布活動的資料夾）
    const subfolders = subfoldersWithActivities.filter((folder): folder is NonNullable<typeof folder> => folder !== null);

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
      let folder: { id: string; name: string; parentId: string | null } = currentFolder;
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

    // 構建 where 條件
    const whereCondition: any = {
      userId: authorId,
      publishedToCommunityAt: {
        not: null,
      },
      deletedAt: null,
    };

    // 只有當 folderId 有值時才添加 folderId 過濾
    // 如果 folderId 為 null，則查詢所有已發布的活動（不限制 folderId）
    if (folderId) {
      whereCondition.folderId = folderId;
    }

    // 獲取活動列表（根據 folderId 過濾）
    const activities = await prisma.activity.findMany({
      where: whereCondition,
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
      where: whereCondition,
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

    // 資料夾數據已經格式化完成（包含遞歸計算的活動數量）
    const formattedFolders = subfolders;

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

