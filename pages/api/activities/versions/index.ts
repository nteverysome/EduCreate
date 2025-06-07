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
      return getActivityVersions(req, res, session);
    case 'POST':
      return createActivityVersion(req, res, session);
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 獲取活動的版本歷史
async function getActivityVersions(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { activityId } = req.query;
    
    if (!activityId || typeof activityId !== 'string') {
      return res.status(400).json({ error: '缺少活動ID' });
    }
    
    // 檢查用戶是否有權限訪問該活動
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { userId: true }
    });
    
    if (!activity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    if (activity.userId !== session.user.id) {
      return res.status(403).json({ error: '無權訪問此活動的版本歷史' });
    }
    
    // 獲取活動的所有版本
    const versions = await prisma.activityVersion.findMany({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: {
          select: {
            title: true
          }
        }
      }
    });
    
    return res.status(200).json(versions);
  } catch (error) {
    console.error('獲取活動版本失敗:', error);
    return res.status(500).json({ error: '獲取活動版本失敗' });
  }
}

// 創建活動的新版本
async function createActivityVersion(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userId = session.user.id;
    const { activityId, versionName, versionNotes } = req.body;
    
    if (!activityId) {
      return res.status(400).json({ error: '缺少活動ID' });
    }
    
    // 檢查用戶是否有權限為該活動創建版本
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        userId: true,
        title: true,
        description: true,
        content: true,
        type: true
      }
    });
    
    if (!activity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    if (activity.userId !== userId) {
      return res.status(403).json({ error: '無權為此活動創建版本' });
    }
    
    // 創建新的活動版本
    const newVersion = await prisma.activityVersion.create({
      data: {
        versionName: versionName || `版本 ${new Date().toLocaleString('zh-TW')}`,
        versionNotes: versionNotes || '',
        content: activity.content as any,
        elements: activity.content as any,
        activityId: activityId,
        userId: userId
      }
    });
    
    return res.status(201).json(newVersion);
  } catch (error) {
    console.error('創建活動版本失敗:', error);
    return res.status(500).json({ error: '創建活動版本失敗' });
  }
}