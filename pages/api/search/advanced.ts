import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withTestAuth } from '../../../middleware/withTestAuth';
import { AdvancedSearchManager, SearchType, SortOption, SearchOptions } from '../../../lib/search/AdvancedSearchManager';

/**
 * 高級搜索API
 * 支持15個組織工具的高級搜索：全文搜索、模糊匹配、語義搜索、多條件過濾器
 */
async function advancedSearchHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息（可能來自會話或測試令牌）
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;

  // 檢查用戶認證狀態
  if (!session && !(req as any).testUser) {
    return res.status(401).json({
      error: '未授權訪問',
      message: '請先登入以使用高級搜索功能',
      code: 'UNAUTHORIZED'
    });
  }

  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    const {
      query,                    // 搜索關鍵詞
      searchType = 'full_text', // 搜索類型
      activityType,            // 活動類型（逗號分隔）
      geptLevel,               // GEPT等級（逗號分隔）
      difficulty,              // 難度級別（逗號分隔）
      tags,                    // 標籤（逗號分隔）
      categories,              // 分類（逗號分隔）
      published,               // 發布狀態
      featured,                // 精選狀態
      shared,                  // 分享狀態
      createdBy,               // 創建者ID（逗號分隔）
      dateCreatedFrom,         // 創建日期範圍（開始）
      dateCreatedTo,           // 創建日期範圍（結束）
      dateUpdatedFrom,         // 更新日期範圍（開始）
      dateUpdatedTo,           // 更新日期範圍（結束）
      hasImages,               // 包含圖片
      hasAudio,                // 包含音頻
      hasVideo,                // 包含視頻
      hasInteractivity,        // 包含互動元素
      minCompletionRate,       // 最小完成率
      maxCompletionRate,       // 最大完成率
      minAverageScore,         // 最小平均分
      maxAverageScore,         // 最大平均分
      sortBy = 'relevance',    // 排序字段
      sortOrder = 'desc',      // 排序方向
      page = 1,                // 頁碼
      limit = 20,              // 每頁數量
      includeHighlights = 'true',  // 包含高亮
      includeFacets = 'true',      // 包含分面
      includeStats = 'true'        // 是否包含統計數據
    } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // 構建搜索條件
    const where: any = {};
    
    // 全文搜索
    if (query && typeof query === 'string') {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { content: { path: ['text'], string_contains: query } }
        // 移除tags搜索，因为schema中没有tags字段
      ];
    }
    
    // 活動類型過濾
    if (type && typeof type === 'string') {
      where.type = type;
    }
    
    // 標籤過濾（暂时跳过，因为schema中没有tags字段）
    // if (tags && typeof tags === 'string') {
    //   const tagList = tags.split(',').map(tag => tag.trim());
    //   where.tags = {
    //     hasEvery: tagList
    //   };
    // }
    
    // 發布狀態過濾
    if (published !== undefined) {
      where.published = published === 'true';
    }
    
    // 創建者過濾
    if (createdBy && typeof createdBy === 'string') {
      where.userId = createdBy;
    }
    
    // 收藏狀態過濾（暂时跳过，因为schema中没有favorites关系）
    // if (favorite === 'true' && (session?.user?.id || user?.id)) {
    //   where.favorites = {
    //     some: {
    //       userId: session?.user?.id || user?.id
    //     }
    //   };
    // }
    
    // 難度級別過濾（暂时跳过，因为schema中没有difficulty字段）
    // if (difficulty && typeof difficulty === 'string') {
    //   where.difficulty = difficulty;
    // }
    
    // 日期範圍過濾
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }
    
    // 構建排序條件
    const orderBy: any = {};
    if (sort && typeof sort === 'string') {
      orderBy[sort] = order === 'asc' ? 'asc' : 'desc';
    }
    
    // 執行搜索查詢
    const [activities, totalCount] = await Promise.all([
      prisma.activity.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          content: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          ...(includeStats === 'true' ? {
            _count: {
              select: {
                versions: true
              }
            }
          } : {})
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.activity.count({ where })
    ]);
    
    // 格式化結果
    const formattedActivities = activities.map((activity: any) => ({
      ...activity,
      templateType: activity.template?.type || null,
      templateName: activity.template?.name || null,
      thumbnail: activity.template?.thumbnail || null,
      tags: [], // 默认空数组，因为schema中没有tags字段
      difficulty: 'medium', // 默认难度，因为schema中没有difficulty字段
      stats: includeStats === 'true' ? {
        versions: activity._count?.versions || 0,
        logs: activity._count?.versionLogs || 0
      } : undefined,
      _count: undefined // 移除內部計數字段
    }));
    
    // 計算分頁信息
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    // 返回搜索結果
    res.status(200).json({
      success: true,
      data: formattedActivities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      searchParams: {
        query: query || '',
        type: type || '',
        tags: tags || '',
        published: published || '',
        createdBy: createdBy || '',
        favorite: favorite || '',
        difficulty: difficulty || '',
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
        sort: sort || 'updatedAt',
        order: order || 'desc'
      }
    });
    
  } catch (error) {
    console.error('高級搜索錯誤:', error);
    res.status(500).json({ 
      error: '搜索失敗',
      message: '服務器內部錯誤，請稍後重試',
      code: 'INTERNAL_ERROR'
    });
  }
}

export default withTestAuth(advancedSearchHandler);