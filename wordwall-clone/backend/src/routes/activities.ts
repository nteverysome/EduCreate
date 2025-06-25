import express from 'express';
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  duplicateActivity,
  getUserActivities,
} from '../controllers/activityController';
import { authenticateToken, requireTeacher, optionalAuth } from '../middleware/auth';
import { rateLimitByUser } from '../middleware/auth';

const router = express.Router();

/**
 * 公開路由（不需要認證）
 */

// 獲取公開活動列表
router.get('/public', optionalAuth, getActivities);

// 獲取單個活動（支持公開和私有）
router.get('/:id', optionalAuth, getActivity);

/**
 * 需要認證的路由
 */

// 獲取所有活動（包括用戶私有活動）
router.get('/', authenticateToken, getActivities);

// 獲取當前用戶的活動
router.get('/user/me', authenticateToken, getUserActivities);

// 創建活動（限制教師角色，每分鐘最多5個請求）
router.post('/', 
  authenticateToken, 
  requireTeacher, 
  rateLimitByUser(5, 60 * 1000), // 每分鐘最多5個請求
  createActivity
);

// 更新活動
router.put('/:id', 
  authenticateToken, 
  rateLimitByUser(10, 60 * 1000), // 每分鐘最多10個請求
  updateActivity
);

// 刪除活動
router.delete('/:id', authenticateToken, deleteActivity);

// 複製活動
router.post('/:id/duplicate', 
  authenticateToken, 
  rateLimitByUser(3, 60 * 1000), // 每分鐘最多3個請求
  duplicateActivity
);

/**
 * 活動統計和分析路由
 */

// 獲取活動統計
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查活動是否存在且用戶有權限
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, userId: true, isPublic: true }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      });
    }

    // 檢查訪問權限
    if (!activity.isPublic && (!req.user || req.user.id !== activity.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 獲取統計數據
    const [gameResults, totalPlayers, avgScore, bestScore] = await Promise.all([
      prisma.gameResult.findMany({
        where: { activityId: id },
        select: {
          score: true,
          maxScore: true,
          percentage: true,
          timeSpent: true,
          createdAt: true,
          player: {
            select: {
              id: true,
              username: true,
              displayName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // 最近100個結果
      }),
      prisma.gameResult.count({
        where: { activityId: id }
      }),
      prisma.gameResult.aggregate({
        where: { activityId: id },
        _avg: { percentage: true, timeSpent: true }
      }),
      prisma.gameResult.findFirst({
        where: { activityId: id },
        orderBy: { score: 'desc' },
        select: {
          score: true,
          maxScore: true,
          percentage: true,
          player: {
            select: {
              username: true,
              displayName: true,
            }
          }
        }
      })
    ]);

    // 計算每日統計
    const dailyStats = await prisma.gameResult.groupBy({
      by: ['createdAt'],
      where: {
        activityId: id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
        }
      },
      _count: true,
      _avg: { percentage: true }
    });

    const stats = {
      totalPlayers,
      totalGames: gameResults.length,
      averageScore: avgScore._avg.percentage || 0,
      averageTime: avgScore._avg.timeSpent || 0,
      bestScore: bestScore ? {
        score: bestScore.score,
        maxScore: bestScore.maxScore,
        percentage: bestScore.percentage,
        player: bestScore.player
      } : null,
      recentResults: gameResults.slice(0, 10),
      dailyStats: dailyStats.map(stat => ({
        date: stat.createdAt,
        games: stat._count,
        averageScore: stat._avg.percentage || 0
      }))
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * 活動版本管理路由
 */

// 獲取活動版本歷史
router.get('/:id/versions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查活動是否存在且用戶有權限
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      });
    }

    if (activity.userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 獲取版本歷史
    const versions = await prisma.activityVersion.findMany({
      where: { activityId: id },
      include: {
        createdByUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      },
      orderBy: { versionNumber: 'desc' }
    });

    res.json({
      success: true,
      data: { versions }
    });
  } catch (error) {
    console.error('Get activity versions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// 恢復到指定版本
router.post('/:id/versions/:versionId/restore', authenticateToken, async (req, res) => {
  try {
    const { id, versionId } = req.params;
    
    // 檢查活動是否存在且用戶有權限
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      });
    }

    if (activity.userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 獲取指定版本
    const version = await prisma.activityVersion.findUnique({
      where: { id: versionId },
      select: { content: true, settings: true, versionNumber: true }
    });

    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'Version not found',
        code: 'VERSION_NOT_FOUND'
      });
    }

    // 更新活動內容
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        content: version.content,
        settings: version.settings,
      }
    });

    // 創建新版本記錄
    const latestVersion = await prisma.activityVersion.findFirst({
      where: { activityId: id },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true }
    });

    await prisma.activityVersion.create({
      data: {
        activityId: id,
        versionNumber: (latestVersion?.versionNumber || 0) + 1,
        content: version.content,
        settings: version.settings,
        changeDescription: `恢復到版本 ${version.versionNumber}`,
        createdBy: req.user.id,
      }
    });

    res.json({
      success: true,
      data: { activity: updatedActivity },
      message: 'Activity restored to previous version'
    });
  } catch (error) {
    console.error('Restore activity version error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
