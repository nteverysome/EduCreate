import prisma from '../prisma';
import { Activity, ActivityVersion, User } from '@prisma/client';

export interface ActivityWithVersions extends Activity {
  versions: ActivityVersion[];
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  content: any;
  templateId?: string;
  userId: string;
}

export interface UpdateActivityData {
  title?: string;
  description?: string;
  content?: any;
  status?: string;
}

/**
 * 活動服務層
 * 封裝所有與活動相關的數據庫操作
 */
export class ActivityService {
  /**
   * 創建新活動
   */
  static async createActivity(data: CreateActivityData): Promise<Activity> {
    return await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        templateId: data.templateId,
        userId: data.userId,
        status: 'DRAFT',
      },
    });
  }

  /**
   * 根據 ID 獲取活動
   */
  static async getActivityById(
    id: string, 
    includeVersions = false
  ): Promise<ActivityWithVersions | null> {
    return await prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: includeVersions ? {
          orderBy: { createdAt: 'desc' },
        } : false,
      },
    }) as ActivityWithVersions | null;
  }

  /**
   * 獲取用戶的所有活動
   */
  static async getUserActivities(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ activities: Activity[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.activity.count({
        where: { userId },
      }),
    ]);

    return { activities, total };
  }

  /**
   * 更新活動
   */
  static async updateActivity(
    id: string,
    data: UpdateActivityData,
    userId: string
  ): Promise<Activity> {
    // 檢查權限
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!activity || activity.userId !== userId) {
      throw new Error('無權限更新此活動');
    }

    return await prisma.activity.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 刪除活動
   */
  static async deleteActivity(id: string, userId: string): Promise<void> {
    // 檢查權限
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!activity || activity.userId !== userId) {
      throw new Error('無權限刪除此活動');
    }

    await prisma.activity.delete({
      where: { id },
    });
  }

  /**
   * 創建活動版本
   */
  static async createVersion(
    activityId: string,
    versionName: string,
    content: any,
    description?: string
  ): Promise<ActivityVersion> {
    return await prisma.activityVersion.create({
      data: {
        activityId,
        versionName,
        content,
        description,
      },
    });
  }

  /**
   * 獲取活動的所有版本
   */
  static async getActivityVersions(activityId: string): Promise<ActivityVersion[]> {
    return await prisma.activityVersion.findMany({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: {
          select: {
            title: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 恢復到指定版本
   */
  static async restoreToVersion(
    activityId: string,
    versionId: string,
    userId: string
  ): Promise<Activity> {
    // 檢查權限
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { userId: true },
    });

    if (!activity || activity.userId !== userId) {
      throw new Error('無權限恢復此活動');
    }

    // 獲取版本內容
    const version = await prisma.activityVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.activityId !== activityId) {
      throw new Error('版本不存在或不屬於此活動');
    }

    // 更新活動內容
    return await prisma.activity.update({
      where: { id: activityId },
      data: {
        content: version.content,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 搜索活動
   */
  static async searchActivities(
    query: string,
    userId?: string,
    page = 1,
    limit = 10
  ): Promise<{ activities: Activity[]; total: number }> {
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
          ],
        },
        userId ? { userId } : {},
      ],
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return { activities, total };
  }
}

export default ActivityService;
