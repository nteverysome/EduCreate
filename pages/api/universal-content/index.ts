/**
 * 統一內容管理 API
 * 支持統一內容的 CRUD 操作
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { UniversalContent } from '../../../lib/content/UniversalContentManager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: '未授權訪問' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, session.user.id);
    case 'POST':
      return handlePost(req, res, session.user.id);
    case 'PUT':
      return handlePut(req, res, session.user.id);
    case 'DELETE':
      return handleDelete(req, res, session.user.id);
    default:
      return res.status(405).json({ error: '不支持的請求方法' });
  }
}

// 獲取用戶的統一內容列表
async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ]
      })
    };

    const [contents, total] = await Promise.all([
      prisma.activity.findMany({
        where: {
          ...where,
          type: 'UNIVERSAL_CONTENT'
        },
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          isPublic: true
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.activity.count({ where: { ...where, type: 'UNIVERSAL_CONTENT' } })
    ]);

    // 轉換為 UniversalContent 格式
    const universalContents = contents.map(activity => {
      const content = activity.content as any;
      return {
        id: activity.id,
        title: activity.title,
        description: activity.description || '',
        items: content.items || [],
        tags: content.tags || [],
        language: content.language || 'zh-TW',
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        userId,
        isPublic: activity.isPublic
      };
    });

    return res.status(200).json({
      contents: universalContents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('獲取統一內容失敗:', error);
    return res.status(500).json({ error: '服務器錯誤' });
  }
}

// 創建新的統一內容
async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const contentData: UniversalContent = req.body;

    // 驗證必要字段
    if (!contentData.title || !contentData.items || contentData.items.length === 0) {
      return res.status(400).json({ error: '標題和內容項目是必需的' });
    }

    // 創建活動記錄
    const activity = await prisma.activity.create({
      data: {
        title: contentData.title,
        description: contentData.description || '',
        type: 'UNIVERSAL_CONTENT',
        templateType: 'UNIVERSAL',
        content: {
          items: contentData.items,
          tags: contentData.tags || [],
          language: contentData.language || 'zh-TW'
        },
        userId,
        isPublic: false
      }
    });

    // 返回創建的統一內容
    const universalContent: UniversalContent = {
      id: activity.id,
      title: activity.title,
      description: activity.description || '',
      items: contentData.items,
      tags: contentData.tags || [],
      language: contentData.language || 'zh-TW',
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      userId
    };

    return res.status(201).json(universalContent);
  } catch (error) {
    console.error('創建統一內容失敗:', error);
    return res.status(500).json({ error: '服務器錯誤' });
  }
}

// 更新統一內容
async function handlePut(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { id } = req.query;
    const contentData: Partial<UniversalContent> = req.body;

    if (!id) {
      return res.status(400).json({ error: '內容 ID 是必需的' });
    }

    // 檢查內容是否存在且屬於當前用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: id as string,
        userId,
        type: 'UNIVERSAL_CONTENT'
      }
    });

    if (!existingActivity) {
      return res.status(404).json({ error: '內容不存在或無權限訪問' });
    }

    // 更新活動
    const updatedActivity = await prisma.activity.update({
      where: { id: id as string },
      data: {
        title: contentData.title || existingActivity.title,
        description: contentData.description || existingActivity.description,
        content: {
          items: contentData.items || (existingActivity.content as any).items,
          tags: contentData.tags || (existingActivity.content as any).tags,
          language: contentData.language || (existingActivity.content as any).language
        },
        updatedAt: new Date()
      }
    });

    // 返回更新的統一內容
    const universalContent: UniversalContent = {
      id: updatedActivity.id,
      title: updatedActivity.title,
      description: updatedActivity.description || '',
      items: contentData.items || (existingActivity.content as any).items,
      tags: contentData.tags || (existingActivity.content as any).tags,
      language: contentData.language || (existingActivity.content as any).language,
      createdAt: updatedActivity.createdAt,
      updatedAt: updatedActivity.updatedAt,
      userId
    };

    return res.status(200).json(universalContent);
  } catch (error) {
    console.error('更新統一內容失敗:', error);
    return res.status(500).json({ error: '服務器錯誤' });
  }
}

// 刪除統一內容
async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: '內容 ID 是必需的' });
    }

    // 檢查內容是否存在且屬於當前用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: id as string,
        userId,
        type: 'UNIVERSAL_CONTENT'
      }
    });

    if (!existingActivity) {
      return res.status(404).json({ error: '內容不存在或無權限訪問' });
    }

    // 刪除活動
    await prisma.activity.delete({
      where: { id: id as string }
    });

    return res.status(200).json({ message: '內容已成功刪除' });
  } catch (error) {
    console.error('刪除統一內容失敗:', error);
    return res.status(500).json({ error: '服務器錯誤' });
  }
}
