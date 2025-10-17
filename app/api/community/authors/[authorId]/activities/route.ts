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

    // 獲取活動列表
    const activities = await prisma.activity.findMany({
      where: {
        userId: authorId,
        publishedToCommunityAt: {
          not: null,
        },
        deletedAt: null,
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

    // 獲取總數
    const total = await prisma.activity.count({
      where: {
        userId: authorId,
        publishedToCommunityAt: {
          not: null,
        },
        deletedAt: null,
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

    return NextResponse.json({
      author,
      activities: formattedActivities,
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

