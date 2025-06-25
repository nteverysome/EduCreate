import { Request, Response } from 'express';
import { PrismaClient, TemplateType } from '@prisma/client';
import { z } from 'zod';
import { trackUserBehavior, trackError } from '../utils/langfuse';

const prisma = new PrismaClient();

// 驗證模式
const createActivitySchema = z.object({
  templateId: z.string().cuid('無效的模板ID'),
  title: z.string().min(1, '標題不能為空').max(100, '標題最多100個字符'),
  description: z.string().max(500, '描述最多500個字符').optional(),
  content: z.object({}).passthrough(), // 遊戲內容（題目、選項等）
  settings: z.object({}).passthrough().optional(), // 遊戲設置
  visualStyle: z.string().optional().default('default'),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  language: z.string().optional().default('zh-TW'),
  difficultyLevel: z.number().min(1).max(5).optional().default(1),
  estimatedDuration: z.number().positive().optional(),
});

const updateActivitySchema = createActivitySchema.partial();

const activityQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default(20),
  search: z.string().optional(),
  templateType: z.nativeEnum(TemplateType).optional(),
  isPublic: z.string().transform(val => val === 'true').optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'playCount', 'likeCount', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * 創建活動
 */
export const createActivity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const validatedData = createActivitySchema.parse(req.body);

    // 驗證模板是否存在
    const template = await prisma.template.findUnique({
      where: { id: validatedData.templateId },
      select: { id: true, type: true, isActive: true, isPremium: true }
    });

    if (!template || !template.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Template not found or inactive',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    // 檢查用戶是否有權限使用高級模板
    if (template.isPremium && req.user.subscriptionType === 'FREE') {
      return res.status(403).json({
        success: false,
        error: 'Premium template requires subscription',
        code: 'PREMIUM_REQUIRED'
      });
    }

    // 創建活動
    const activity = await prisma.activity.create({
      data: {
        userId: req.user.id,
        templateId: validatedData.templateId,
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        settings: validatedData.settings || {},
        visualStyle: validatedData.visualStyle,
        isPublic: validatedData.isPublic,
        tags: validatedData.tags,
        language: validatedData.language,
        difficultyLevel: validatedData.difficultyLevel,
        estimatedDuration: validatedData.estimatedDuration,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
            iconUrl: true,
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    // 創建初始版本
    await prisma.activityVersion.create({
      data: {
        activityId: activity.id,
        versionNumber: 1,
        content: validatedData.content,
        settings: validatedData.settings || {},
        changeDescription: '初始版本',
        createdBy: req.user.id,
      }
    });

    // 追蹤用戶行為
    await trackUserBehavior('create_activity', {
      userId: req.user.id,
      activityId: activity.id,
      templateType: template.type,
    });

    res.status(201).json({
      success: true,
      data: { activity },
      message: 'Activity created successfully'
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
      action: 'create_activity',
      userId: req.user?.id,
      body: req.body,
    });

    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 獲取活動列表
 */
export const getActivities = async (req: Request, res: Response) => {
  try {
    const query = activityQuerySchema.parse(req.query);
    const { page, limit, search, templateType, isPublic, tags, sortBy, sortOrder } = query;

    // 構建查詢條件
    const where: any = {};

    // 如果用戶已登入，顯示其私有活動；否則只顯示公開活動
    if (req.user) {
      where.OR = [
        { isPublic: true },
        { userId: req.user.id }
      ];
    } else {
      where.isPublic = true;
    }

    // 搜索條件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    // 模板類型篩選
    if (templateType) {
      where.template = { type: templateType };
    }

    // 公開性篩選
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    // 標籤篩選
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagList };
    }

    // 計算偏移量
    const skip = (page - 1) * limit;

    // 查詢活動
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              type: true,
              iconUrl: true,
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            }
          },
          _count: {
            select: {
              gameResults: true,
              likes: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where })
    ]);

    // 計算分頁信息
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: {
        activities,
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
      action: 'get_activities',
      userId: req.user?.id,
      query: req.query,
    });

    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 獲取單個活動
 */
export const getActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
            iconUrl: true,
            config: true,
            defaultSettings: true,
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          }
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 5,
          select: {
            id: true,
            versionNumber: true,
            changeDescription: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            gameResults: true,
            likes: true,
            gameSessions: true,
          }
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
    if (!activity.isPublic && (!req.user || req.user.id !== activity.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 增加瀏覽次數
    await prisma.activity.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_activity',
      userId: req.user?.id,
      activityId: req.params.id,
    });

    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 更新活動
 */
export const updateActivity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const { id } = req.params;
    const validatedData = updateActivitySchema.parse(req.body);

    // 檢查活動是否存在且用戶有權限
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, userId: true, content: true, settings: true }
    });

    if (!existingActivity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      });
    }

    if (existingActivity.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 檢查內容是否有變化
    const contentChanged = validatedData.content && 
      JSON.stringify(validatedData.content) !== JSON.stringify(existingActivity.content);
    const settingsChanged = validatedData.settings && 
      JSON.stringify(validatedData.settings) !== JSON.stringify(existingActivity.settings);

    // 更新活動
    const activity = await prisma.activity.update({
      where: { id },
      data: validatedData,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
            iconUrl: true,
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    // 如果內容或設置有變化，創建新版本
    if (contentChanged || settingsChanged) {
      const latestVersion = await prisma.activityVersion.findFirst({
        where: { activityId: id },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true }
      });

      await prisma.activityVersion.create({
        data: {
          activityId: id,
          versionNumber: (latestVersion?.versionNumber || 0) + 1,
          content: validatedData.content || existingActivity.content,
          settings: validatedData.settings || existingActivity.settings,
          changeDescription: req.body.changeDescription || '更新活動',
          createdBy: req.user.id,
        }
      });
    }

    // 追蹤用戶行為
    await trackUserBehavior('update_activity', {
      userId: req.user.id,
      activityId: id,
      contentChanged,
      settingsChanged,
    });

    res.json({
      success: true,
      data: { activity },
      message: 'Activity updated successfully'
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
      action: 'update_activity',
      userId: req.user?.id,
      activityId: req.params.id,
      body: req.body,
    });

    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 刪除活動
 */
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const { id } = req.params;

    // 檢查活動是否存在且用戶有權限
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, userId: true, title: true }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      });
    }

    if (activity.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 刪除活動（級聯刪除相關數據）
    await prisma.activity.delete({
      where: { id }
    });

    // 追蹤用戶行為
    await trackUserBehavior('delete_activity', {
      userId: req.user.id,
      activityId: id,
      activityTitle: activity.title,
    });

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'delete_activity',
      userId: req.user?.id,
      activityId: req.params.id,
    });

    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * 複製活動
 */
export const duplicateActivity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const { id } = req.params;
    const { title } = req.body;

    // 獲取原活動
    const originalActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        template: {
          select: { isPremium: true }
        }
      }
    });

    if (!originalActivity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      });
    }

    // 檢查訪問權限
    if (!originalActivity.isPublic && originalActivity.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // 檢查高級模板權限
    if (originalActivity.template.isPremium && req.user.subscriptionType === 'FREE') {
      return res.status(403).json({
        success: false,
        error: 'Premium template requires subscription',
        code: 'PREMIUM_REQUIRED'
      });
    }

    // 創建副本
    const duplicatedActivity = await prisma.activity.create({
      data: {
        userId: req.user.id,
        templateId: originalActivity.templateId,
        title: title || `${originalActivity.title} (副本)`,
        description: originalActivity.description,
        content: originalActivity.content,
        settings: originalActivity.settings,
        visualStyle: originalActivity.visualStyle,
        isPublic: false, // 副本默認為私有
        tags: originalActivity.tags,
        language: originalActivity.language,
        difficultyLevel: originalActivity.difficultyLevel,
        estimatedDuration: originalActivity.estimatedDuration,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
            iconUrl: true,
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    // 創建初始版本
    await prisma.activityVersion.create({
      data: {
        activityId: duplicatedActivity.id,
        versionNumber: 1,
        content: originalActivity.content,
        settings: originalActivity.settings,
        changeDescription: `從活動 "${originalActivity.title}" 複製`,
        createdBy: req.user.id,
      }
    });

    // 更新原活動的複製次數
    await prisma.activity.update({
      where: { id },
      data: { copyCount: { increment: 1 } }
    });

    // 追蹤用戶行為
    await trackUserBehavior('duplicate_activity', {
      userId: req.user.id,
      originalActivityId: id,
      newActivityId: duplicatedActivity.id,
    });

    res.status(201).json({
      success: true,
      data: { activity: duplicatedActivity },
      message: 'Activity duplicated successfully'
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'duplicate_activity',
      userId: req.user?.id,
      activityId: req.params.id,
      body: req.body,
    });

    console.error('Duplicate activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};
