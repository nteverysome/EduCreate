import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
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
    return res.status(400).json({ error: '缺少版本ID' });
  }

  // 根據HTTP方法處理不同的請求
  switch (req.method) {
    case 'POST':
      return restoreVersion(req, res, session);
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 恢復到特定版本
async function restoreVersion(req: NextApiRequest, res: NextApiResponse, session: any) {
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