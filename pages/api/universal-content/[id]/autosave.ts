/**
 * 自動保存 API - 模仿 wordwall.net 的自動保存機制
 * 支持草稿保存、版本控制和錯誤恢復
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { UniversalContent } from '../../../../lib/content/UniversalContentManager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支持 POST 請求' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: '未授權訪問' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '無效的活動 ID' });
  }

  try {
    const autoSaveData: Partial<UniversalContent> & { 
      isAutoSave: boolean;
      lastModified: string;
    } = req.body;

    // 驗證自動保存數據
    if (!autoSaveData.isAutoSave) {
      return res.status(400).json({ error: '無效的自動保存請求' });
    }

    // 檢查活動是否存在
    let activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    // 如果活動不存在，創建新的草稿
    if (!activity) {
      activity = await prisma.activity.create({
        data: {
          id,
          title: autoSaveData.title || 'Untitled',
          description: autoSaveData.description || '',
          type: 'UNIVERSAL_CONTENT',
          templateType: 'UNIVERSAL',
          content: {
            items: autoSaveData.items || [],
            tags: autoSaveData.tags || [],
            language: autoSaveData.language || 'zh-TW',
            isAutoSave: true,
            autoSaveVersion: 1
          },
          userId: session.user.id,
          isPublic: false,
          isDraft: true // 標記為草稿
        }
      });
    } else {
      // 更新現有活動的自動保存數據
      const currentContent = activity.content as any;
      const newVersion = (currentContent?.autoSaveVersion || 0) + 1;

      activity = await prisma.activity.update({
        where: { id },
        data: {
          title: autoSaveData.title || activity.title,
          description: autoSaveData.description || activity.description,
          content: {
            ...currentContent,
            items: autoSaveData.items || currentContent.items || [],
            tags: autoSaveData.tags || currentContent.tags || [],
            language: autoSaveData.language || currentContent.language || 'zh-TW',
            isAutoSave: true,
            autoSaveVersion: newVersion,
            lastAutoSave: new Date().toISOString()
          },
          updatedAt: new Date(),
          isDraft: true
        }
      });
    }

    // 清理舊的自動保存版本（保留最近 5 個版本）
    await cleanupOldAutoSaveVersions(id, session.user.id);

    // 返回自動保存結果
    const result = {
      success: true,
      activityId: activity.id,
      title: activity.title,
      lastSaved: activity.updatedAt,
      version: (activity.content as any)?.autoSaveVersion || 1,
      message: '自動保存成功'
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('自動保存失敗:', error);
    
    // 根據錯誤類型返回不同的錯誤信息
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          error: '保存衝突，請刷新頁面重試',
          code: 'CONFLICT'
        });
      }
      
      if (error.message.includes('timeout')) {
        return res.status(408).json({ 
          error: '保存超時，請檢查網絡連接',
          code: 'TIMEOUT'
        });
      }
    }

    return res.status(500).json({ 
      error: '自動保存失敗，請稍後重試',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * 清理舊的自動保存版本
 */
async function cleanupOldAutoSaveVersions(activityId: string, userId: string) {
  try {
    // 獲取該用戶的所有自動保存記錄
    const autoSaveActivities = await prisma.activity.findMany({
      where: {
        userId,
        isDraft: true,
        title: {
          startsWith: 'Untitled'
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: 5 // 保留最近 5 個
    });

    // 刪除超過限制的舊版本
    if (autoSaveActivities.length > 0) {
      const idsToDelete = autoSaveActivities.map(activity => activity.id);
      await prisma.activity.deleteMany({
        where: {
          id: {
            in: idsToDelete
          },
          userId
        }
      });
    }
  } catch (error) {
    console.error('清理舊版本失敗:', error);
    // 不拋出錯誤，因為這不是關鍵操作
  }
}
