import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // 檢查用戶是否已登入
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  // 根據請求方法處理不同的操作
  switch (req.method) {
    case 'GET':
      return getActivityVersion(req, res, session);
    case 'POST':
      return restoreActivityVersion(req, res, session);
    case 'DELETE':
      return deleteActivityVersion(req, res, session);
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 獲取特定版本的詳細信息
async function getActivityVersion(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '缺少版本ID' });
    }
    
    // 獲取版本詳情
    const version = await prisma.activityVersion.findUnique({
      where: { id },
      include: {
        activity: {
          select: {
            userId: true,
            title: true
          }
        }
      }
    });
    
    if (!version) {
      return res.status(404).json({ error: '版本不存在' });
    }
    
    // 檢查用戶是否有權限訪問該版本
    if (version.activity.userId !== session.user.id) {
      return res.status(403).json({ error: '無權訪問此版本' });
    }
    
    return res.status(200).json(version);
  } catch (error) {
    console.error('獲取活動版本詳情失敗:', error);
    return res.status(500).json({ error: '獲取活動版本詳情失敗' });
  }
}

// 恢復到特定版本
async function restoreActivityVersion(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '缺少版本ID' });
    }
    
    // 獲取版本詳情
    const version = await prisma.activityVersion.findUnique({
      where: { id },
      include: {
        activity: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    });
    
    if (!version) {
      return res.status(404).json({ error: '版本不存在' });
    }
    
    // 檢查用戶是否有權限恢復該版本
    if (version.activity.userId !== session.user.id) {
      return res.status(403).json({ error: '無權恢復此版本' });
    }
    
    // 在恢復前，先創建當前狀態的版本備份
    const currentActivity = await prisma.activity.findUnique({
      where: { id: version.activityId },
      select: {
        content: true,
        published: true
      }
    });
    
    if (currentActivity) {
      await prisma.activityVersion.create({
        data: {
          versionName: `恢復前自動備份 ${new Date().toLocaleString('zh-TW')}`,
          versionNotes: '系統在恢復版本前自動創建的備份',
          content: currentActivity.content as any,
          elements: currentActivity.content as any,
          activityId: version.activityId,
          userId: session.user.id
        }
      });
    }
    
    // 恢復活動到選定的版本
    const updatedActivity = await prisma.activity.update({
      where: { id: version.activityId },
      data: {
        content: version.content as any,
        updatedAt: new Date()
      }
    });
    
    return res.status(200).json({
      success: true,
      message: '成功恢復到選定版本',
      activity: updatedActivity
    });
  } catch (error) {
    console.error('恢復活動版本失敗:', error);
    return res.status(500).json({ error: '恢復活動版本失敗' });
  }
}

// 刪除特定版本
async function deleteActivityVersion(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '缺少版本ID' });
    }
    
    // 獲取版本詳情
    const version = await prisma.activityVersion.findUnique({
      where: { id },
      include: {
        activity: {
          select: {
            userId: true
          }
        }
      }
    });
    
    if (!version) {
      return res.status(404).json({ error: '版本不存在' });
    }
    
    // 檢查用戶是否有權限刪除該版本
    if (version.activity.userId !== session.user.id) {
      return res.status(403).json({ error: '無權刪除此版本' });
    }
    
    // 刪除版本
    await prisma.activityVersion.delete({
      where: { id }
    });
    
    return res.status(200).json({
      success: true,
      message: '成功刪除版本'
    });
  } catch (error) {
    console.error('刪除活動版本失敗:', error);
    return res.status(500).json({ error: '刪除活動版本失敗' });
  }
}