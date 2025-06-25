import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { trackUserBehavior, trackError } from '../utils/langfuse';

const prisma = new PrismaClient();

// 驗證模式
const createGameResultSchema = z.object({
  activityId: z.string().cuid('無效的活動ID'),
  score: z.number().min(0, '分數不能為負數'),
  maxScore: z.number().min(1, '最高分數必須大於0'),
  percentage: z.number().min(0).max(100, '百分比必須在0-100之間'),
  timeSpent: z.number().min(0, '時間不能為負數'),
  answers: z.array(z.any()).optional().default([]),
  metadata: z.object({}).passthrough().optional().default({}),
});

const gameResultQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default(20),
  activityId: z.string().cuid().optional(),
  playerId: z.string().cuid().optional(),
  minScore: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxScore: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'score', 'percentage', 'timeSpent']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * 創建遊戲結果
 */
export const createGameResult = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const validatedData = createGameResultSchema.parse(req.body);

    // 驗證活動是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: validatedData.activityId },
      select: { 
        id: true, 
        title: true, 
        isPublic: true, 
        userId: true,
        template: {
          select: { type: true }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      });
    }

    // 檢查訪問權限
    if (!activity.isPublic && activity.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 創建遊戲結果
    const gameResult = await prisma.gameResult.create({
      data: {
        activityId: validatedData.activityId,
        playerId: req.user.id,
        score: validatedData.score,
        maxScore: validatedData.maxScore,
        percentage: validatedData.percentage,
        timeSpent: validatedData.timeSpent,
        answers: validatedData.answers,
        metadata: validatedData.metadata,
      },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            template: {
              select: { type: true, name: true }
            }
          }
        },
        player: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    // 更新用戶統計
    await updateUserStats(req.user.id, validatedData);

    // 更新活動統計
    await updateActivityStats(validatedData.activityId);

    // 追蹤用戶行為
    await trackUserBehavior('complete_game', {
      userId: req.user.id,
      activityId: validatedData.activityId,
      gameType: activity.template.type,
      score: validatedData.score,
      percentage: validatedData.percentage,
      timeSpent: validatedData.timeSpent,
    });

    res.status(201).json({
      success: true,
      data: { gameResult },
      message: 'Game result saved successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    await trackError(error as Error, {
      action: 'create_game_result',
      userId: req.user?.id,
      body: req.body,
    });

    console.error('Create game result error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 獲取遊戲結果列表
 */
export const getGameResults = async (req: Request, res: Response) => {
  try {
    const query = gameResultQuerySchema.parse(req.query);
    const { page, limit, activityId, playerId, minScore, maxScore, startDate, endDate, sortBy, sortOrder } = query;

    // 構建查詢條件
    const where: any = {};

    // 活動篩選
    if (activityId) {
      where.activityId = activityId;
    }

    // 玩家篩選
    if (playerId) {
      where.playerId = playerId;
    }

    // 分數範圍篩選
    if (minScore !== undefined || maxScore !== undefined) {
      where.score = {};
      if (minScore !== undefined) where.score.gte = minScore;
      if (maxScore !== undefined) where.score.lte = maxScore;
    }

    // 日期範圍篩選
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // 權限檢查：只能查看公開活動的結果或自己的結果
    if (req.user) {
      where.OR = [
        { activity: { isPublic: true } },
        { playerId: req.user.id },
        { activity: { userId: req.user.id } } // 活動創建者可以查看所有結果
      ];
    } else {
      where.activity = { isPublic: true };
    }

    // 計算偏移量
    const skip = (page - 1) * limit;

    // 查詢遊戲結果
    const [gameResults, total] = await Promise.all([
      prisma.gameResult.findMany({
        where,
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              template: {
                select: { type: true, name: true }
              }
            }
          },
          player: {
            select: {
              id: true,
              username: true,
              displayName: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.gameResult.count({ where })
    ]);

    // 計算分頁信息
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: {
        gameResults,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    await trackError(error as Error, {
      action: 'get_game_results',
      userId: req.user?.id,
      query: req.query,
    });

    console.error('Get game results error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 獲取單個遊戲結果
 */
export const getGameResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gameResult = await prisma.gameResult.findUnique({
      where: { id },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            isPublic: true,
            userId: true,
            template: {
              select: { type: true, name: true }
            }
          }
        },
        player: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    if (!gameResult) {
      return res.status(404).json({
        success: false,
        error: 'Game result not found',
        code: 'GAME_RESULT_NOT_FOUND'
      });
    }

    // 檢查訪問權限
    const canAccess = gameResult.activity.isPublic || 
                     (req.user && (req.user.id === gameResult.playerId || req.user.id === gameResult.activity.userId));

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({
      success: true,
      data: { gameResult }
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_game_result',
      userId: req.user?.id,
      gameResultId: req.params.id,
    });

    console.error('Get game result error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 獲取用戶統計
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userId = req.params.userId || req.user.id;

    // 檢查權限：只能查看自己的統計或公開統計
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 獲取或創建用戶統計
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!userStats) {
      userStats = await prisma.userStats.create({
        data: { userId }
      });
    }

    res.json({
      success: true,
      data: { stats: userStats }
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_user_stats',
      userId: req.user?.id,
      targetUserId: req.params.userId,
    });

    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 更新用戶統計
 */
const updateUserStats = async (userId: string, gameData: any) => {
  try {
    const stats = await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalGames: { increment: 1 },
        totalScore: { increment: gameData.score },
        totalTimeSpent: { increment: gameData.timeSpent },
        bestScore: {
          set: await prisma.gameResult.aggregate({
            where: { playerId: userId },
            _max: { score: true }
          }).then(result => Math.max(result._max.score || 0, gameData.score))
        }
      },
      create: {
        userId,
        totalGames: 1,
        totalScore: gameData.score,
        bestScore: gameData.score,
        totalTimeSpent: gameData.timeSpent,
      }
    });

    // 計算平均分數
    await prisma.userStats.update({
      where: { userId },
      data: {
        averageScore: stats.totalGames > 0 ? stats.totalScore / stats.totalGames : 0
      }
    });
  } catch (error) {
    console.error('Update user stats error:', error);
  }
};

/**
 * 更新活動統計
 */
const updateActivityStats = async (activityId: string) => {
  try {
    const [totalPlayers, totalCompletions, avgData, bestScore] = await Promise.all([
      prisma.gameResult.groupBy({
        by: ['playerId'],
        where: { activityId },
        _count: true
      }).then(results => results.length),
      
      prisma.gameResult.count({
        where: { activityId }
      }),
      
      prisma.gameResult.aggregate({
        where: { activityId },
        _avg: { percentage: true, timeSpent: true }
      }),
      
      prisma.gameResult.aggregate({
        where: { activityId },
        _max: { score: true }
      })
    ]);

    await prisma.activityStats.upsert({
      where: { activityId },
      update: {
        totalPlayers,
        totalCompletions,
        averageScore: avgData._avg.percentage || 0,
        averageTime: avgData._avg.timeSpent || 0,
        bestScore: bestScore._max.score || 0,
      },
      create: {
        activityId,
        totalPlayers,
        totalCompletions,
        averageScore: avgData._avg.percentage || 0,
        averageTime: avgData._avg.timeSpent || 0,
        bestScore: bestScore._max.score || 0,
      }
    });
  } catch (error) {
    console.error('Update activity stats error:', error);
  }
};
