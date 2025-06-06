import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 檢查用戶是否已登入
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: '請先登入' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '缺少活動ID' });
  }

  // 根據HTTP方法處理不同的請求
  switch (req.method) {
    case 'GET':
      return getActivityVersions(req, res, session);
    case 'POST':
      return createActivityVersion(req, res, session);
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 獲取活動的所有版本
async function getActivityVersions(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { id } = req.query;
    
    // 檢查活動是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: id as string },
    });
    
    if (!activity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    // 檢查用戶是否有權限查看該活動的版本
    if (activity.userId !== session.user.id) {
      return res.status(403).json({ error: '無權查看此活動的版本' });
    }
    
    // 獲取活動的所有版本
    const versions = await prisma.activityVersion.findMany({
      where: { activityId: id as string },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return res.status(200).json(versions);
  } catch (error) {
    console.error('獲取活動版本失敗:', error);
    return res.status(500).json({ error: '獲取活動版本失敗' });
  }
}

// 創建新的活動版本
async function createActivityVersion(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { id } = req.query;
    const { description } = req.body;
    
    // 檢查活動是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: id as string },
    });
    
    if (!activity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    // 檢查用戶是否有權限創建該活動的版本
    if (activity.userId !== session.user.id) {
      return res.status(403).json({ error: '無權為此活動創建版本' });
    }
    
    // 獲取當前活動的最新版本號
    const latestVersion = await prisma.activityVersion.findFirst({
      where: { activityId: id as string },
      orderBy: { createdAt: 'desc' },
    });
    
    // Generate version name based on existing versions count
    const existingVersionsCount = await prisma.activityVersion.count({
      where: { activityId: id as string }
    });
    const versionNumber = existingVersionsCount + 1;
    
    // 創建新版本
    const newVersion = await prisma.activityVersion.create({
      data: {
          activityId: id as string,
        content: activity.content as any,
        elements: activity.elements as any,
        published: activity.published,
        versionName: `版本 ${versionNumber}`,
        versionNotes: description || '',
        userId: session.user.id,
      },
    });
    
    // 記錄版本創建操作
    await prisma.activityVersionLog.create({
      data: {
        action: 'CREATE',
        activityId: id as string,
        versionId: newVersion.id,
        userId: session.user.id,
        details: JSON.stringify({ description }),
      },
    });
    
    return res.status(201).json(newVersion);
  } catch (error) {
    console.error('創建活動版本失敗:', error);
    return res.status(500).json({ error: '創建活動版本失敗' });
  }
}