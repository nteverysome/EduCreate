import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, withAuth, withPermissions, withCache } from '../../../lib/middleware/apiMiddleware';
import { ActivityService } from '../../../lib/services/ActivityService';
import { PERMISSIONS } from '../../../lib/permissions';
import { performanceMonitor } from '../../../lib/utils/performanceMonitor';

/**
 * 優化的活動 API 路由
 * 展示如何使用中間件和服務層
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGetActivities(req, res);
        break;
      
      case 'POST':
        await handleCreateActivity(req, res);
        break;
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: '內部服務器錯誤',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

/**
 * 獲取活動列表
 */
async function handleGetActivities(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '10', search, userId } = req.query;
  
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 驗證參數
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({ 
      error: '無效的分頁參數',
      details: 'page 必須 >= 1，limit 必須在 1-100 之間'
    });
  }

  let result;

  if (search) {
    // 搜索活動
    result = await performanceMonitor.measureAsync(
      'search_activities',
      () => ActivityService.searchActivities(
        search as string,
        userId as string,
        pageNum,
        limitNum
      ),
      { search_query: search as string }
    );
  } else {
    // 獲取用戶活動
    if (!userId) {
      return res.status(400).json({ error: '缺少 userId 參數' });
    }

    result = await performanceMonitor.measureAsync(
      'get_user_activities',
      () => ActivityService.getUserActivities(
        userId as string,
        pageNum,
        limitNum
      ),
      { user_id: userId as string }
    );
  }

  res.status(200).json({
    activities: result.activities,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: result.total,
      totalPages: Math.ceil(result.total / limitNum),
    },
  });
}

/**
 * 創建新活動
 */
async function handleCreateActivity(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, content, templateId } = req.body;

  // 驗證必需字段
  if (!title || !content) {
    return res.status(400).json({ 
      error: '缺少必需字段',
      details: 'title 和 content 是必需的'
    });
  }

  // 從會話中獲取用戶 ID（由中間件提供）
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: '用戶未認證' });
  }

  const activity = await performanceMonitor.measureAsync(
    'create_activity',
    () => ActivityService.createActivity({
      title,
      description,
      content,
      templateId,
      userId,
    }),
    { template_id: templateId }
  );

  res.status(201).json({
    message: '活動創建成功',
    activity,
  });
}

// 應用中間件
export default withMiddleware(handler, {
  requireAuth: true,
  requiredPermissions: [PERMISSIONS.CREATE_ACTIVITY],
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 分鐘
    maxRequests: 100, // 每 15 分鐘最多 100 個請求
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 分鐘緩存（僅 GET 請求）
    key: (req) => `activities:${req.query.userId}:${req.query.page}:${req.query.limit}:${req.query.search || ''}`,
  },
});
