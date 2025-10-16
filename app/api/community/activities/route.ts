/**
 * 社區活動列表 API
 * 
 * GET /api/community/activities
 * 
 * 功能：
 * - 獲取已發布到社區的活動列表
 * - 支援分頁、篩選、排序
 * - 支援搜尋
 * - 不需要登入即可訪問
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatActivityForCommunity, calculateTrendingScore } from '@/lib/community/utils';

export async function GET(request: NextRequest) {
  try {
    // 1. 解析查詢參數
    const searchParams = request.nextUrl.searchParams;
    
    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 篩選參數
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';

    // 排序參數
    const sortBy = searchParams.get('sortBy') || 'trending'; // trending, latest, popular, views
    
    // 2. 構建查詢條件
    const where: any = {
      isPublicShared: true,
      publishedToCommunityAt: { not: null },
    };

    // 分類篩選
    if (category) {
      where.communityCategory = category;
    }

    // 標籤篩選
    if (tags && tags.length > 0) {
      where.communityTags = {
        hasSome: tags,
      };
    }

    // 搜尋（擴展到標籤、分類、主題）
    if (search) {
      where.OR = [
        // 搜尋標題
        { title: { contains: search, mode: 'insensitive' } },
        // 搜尋社區描述
        { communityDescription: { contains: search, mode: 'insensitive' } },
        // 搜尋活動描述
        { description: { contains: search, mode: 'insensitive' } },
        // 搜尋分類
        { communityCategory: { contains: search, mode: 'insensitive' } },
        // 搜尋標籤（包括自定義標籤）
        { communityTags: { has: search } },
      ];
    }

    // 精選篩選
    if (featured) {
      where.isFeatured = true;
    }

    // 3. 構建排序條件
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
      case 'trending':
      default:
        // 熱門度排序需要在查詢後計算
        orderBy = { publishedToCommunityAt: 'desc' };
        break;
    }

    // 4. 查詢活動
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    // 5. 格式化活動數據
    // 從請求中獲取正確的 baseUrl
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'edu-create.vercel.app';
    const baseUrl = `${protocol}://${host}`;
    let formattedActivities = activities.map(activity =>
      formatActivityForCommunity(activity, baseUrl)
    );

    // 6. 如果是熱門度排序，計算分數並重新排序
    if (sortBy === 'trending') {
      formattedActivities = formattedActivities
        .map(activity => ({
          ...activity,
          trendingScore: calculateTrendingScore(
            activity.stats,
            new Date(activity.publishedAt)
          ),
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore);
    }

    // 7. 計算分頁信息
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // 8. 返回響應
    return NextResponse.json({
      success: true,
      data: formattedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
      filters: {
        category,
        tags,
        search,
        featured,
        sortBy,
      },
    });
  } catch (error) {
    console.error('獲取社區活動列表失敗:', error);
    return NextResponse.json(
      {
        error: '伺服器錯誤',
        message: '獲取活動列表時發生錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}

/**
 * 獲取社區統計信息 API
 * 
 * GET /api/community/activities/stats
 * 
 * 功能：
 * - 獲取社區的統計信息
 * - 包括總活動數、分類統計、熱門標籤等
 */
export async function HEAD(request: NextRequest) {
  try {
    // 1. 獲取總活動數
    const totalActivities = await prisma.activity.count({
      where: {
        isPublicShared: true,
        publishedToCommunityAt: { not: null },
      },
    });

    // 2. 獲取分類統計
    const categoryStats = await prisma.activity.groupBy({
      by: ['communityCategory'],
      where: {
        isPublicShared: true,
        publishedToCommunityAt: { not: null },
        communityCategory: { not: null },
      },
      _count: true,
    });

    // 3. 獲取精選活動數
    const featuredCount = await prisma.activity.count({
      where: {
        isPublicShared: true,
        publishedToCommunityAt: { not: null },
        isFeatured: true,
      },
    });

    // 4. 獲取最近 7 天的新活動數
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCount = await prisma.activity.count({
      where: {
        isPublicShared: true,
        publishedToCommunityAt: { gte: sevenDaysAgo },
      },
    });

    // 5. 返回統計信息
    return NextResponse.json({
      success: true,
      stats: {
        totalActivities,
        featuredCount,
        recentCount,
        categories: categoryStats.map(stat => ({
          category: stat.communityCategory,
          count: stat._count,
        })),
      },
    });
  } catch (error) {
    console.error('獲取社區統計信息失敗:', error);
    return NextResponse.json(
      {
        error: '伺服器錯誤',
        message: '獲取統計信息時發生錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}

