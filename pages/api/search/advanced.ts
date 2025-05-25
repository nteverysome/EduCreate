import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { withTestAuth } from '../../../middleware/withTestAuth';

const prisma = new PrismaClient();

/**
 * 高級搜索API
 * 支持多種搜索條件、過濾和排序選項
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 使用測試認證中間件
  await new Promise<void>((resolve) => {
    withTestAuth(req, res, resolve);
  }).catch(() => {
    return res.status(401).json({ error: '未授權' });
  });
  
  // 獲取用戶信息（可能來自會話或測試令牌）
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    const { 
      query,           // 搜索關鍵詞
      type,            // 活動類型
      tags,            // 標籤（逗號分隔）
      published,       // 發布狀態
      createdBy,       // 創建者ID
      favorite,        // 是否為收藏
      difficulty,      // 難度級別
      dateFrom,        // 創建日期範圍（開始）
      dateTo,          // 創建日期範圍（結束）
      sort = 'updatedAt', // 排序字段
      order = 'desc',  // 排序方向
      page = 1,        // 頁碼
      limit = 10,      // 每頁數量
      includeStats = 'true' // 是否包含統計數據
    } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // 構建搜索條件
    const where: any = {};
    
    // 全文搜索（標題、描述、內容、標籤）
    if (query && typeof query === 'string') {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ];
      
      // 如果查詢詞看起來像標籤，也在標籤中搜索
      if (query.length >= 2 && !query.includes(' ')) {
        where.OR.push({
          tags: {
            has: query
          }
        });
      }
    }
    
    // 根據活動類型過濾
    if (type && typeof type === 'string') {
      where.type = type;
    }
    
    // 根據標籤過濾
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').map(tag => tag.trim());
      where.tags = {
        hasSome: tagList
      };
    }
    
    // 根據發布狀態過濾
    if (published !== undefined) {
      where.published = published === 'true';
    }
    
    // 根據創建者過濾
    if (createdBy && typeof createdBy === 'string') {
      // 可以是用戶ID或用戶名
      if (createdBy.match(/^[0-9a-fA-F]{24}$/)) {
        // 如果是有效的ID格式
        where.userId = createdBy;
      } else {
        // 如果是用戶名
        where.user = {
          name: {
            contains: createdBy,
            mode: 'insensitive'
          }
        };
      }
    }
    
    // 根據收藏狀態過濾
    if (favorite === 'true' && session.user.id) {
      where.favorites = {
        some: {
          userId: session.user.id
        }
      };
    }
    
    // 根據難度級別過濾
    if (difficulty && typeof difficulty === 'string') {
      const difficultyLevels = difficulty.split(',').map(d => d.trim());
      where.difficulty = {
        in: difficultyLevels
      };
    }
    
    // 根據創建日期範圍過濾
    if (dateFrom || dateTo) {
      where.createdAt = {};
      
      if (dateFrom && typeof dateFrom === 'string') {
        where.createdAt.gte = new Date(dateFrom);
      }
      
      if (dateTo && typeof dateTo === 'string') {
        where.createdAt.lte = new Date(dateTo);
      }
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
          templateType: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          tags: true,
          difficulty: true,
          thumbnail: true,
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
                views: true,
                favorites: true,
                comments: true
              }
            }
          } : {})
        },
        orderBy: {
          [sort as string]: order
        },
        skip,
        take: limitNum
      }),
      prisma.activity.count({ where })
    ]);
    
    // 處理搜索結果，添加統計信息
    const processedActivities = activities.map(activity => {
      const result: any = { ...activity };
      
      // 如果包含統計數據，則處理統計信息
      if (includeStats === 'true' && result._count) {
        result.stats = {
          views: result._count.views || 0,
          favorites: result._count.favorites || 0,
          comments: result._count.comments || 0
        };
        delete result._count; // 移除原始_count字段
      }
      
      return result;
    });
    
    // 返回搜索結果和分頁信息
    return res.status(200).json({
      activities: processedActivities,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      filters: {
        query: query || '',
        type: type || 'all',
        tags: tags || '',
        published: published || 'all',
        favorite: favorite || 'false'
      }
    });
  } catch (error) {
    console.error('高級搜索失敗:', error);
    return res.status(500).json({ 
      error: '搜索失敗', 
      details: error instanceof Error ? error.message : '未知錯誤',
      timestamp: new Date().toISOString()
    });
  }
}