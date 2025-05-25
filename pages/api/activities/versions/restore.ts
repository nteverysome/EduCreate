import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { restoreActivityVersion } from '@/models/activityVersion';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // 檢查用戶是否已登入
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  // 只允許POST請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    const { activityId, versionId } = req.body;
    
    if (!activityId || !versionId) {
      return res.status(400).json({ error: '缺少必要參數' });
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
      return res.status(403).json({ error: '無權恢復此活動的版本' });
    }
    
    // 恢復到指定版本
    const restoredVersion = await restoreActivityVersion(
      activityId,
      versionId,
      session.user.id
    );
    
    // 更新活動的內容
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        content: restoredVersion.content,
        updatedAt: new Date(),
      },
    });
    
    return res.status(200).json({
      success: true,
      message: '版本恢復成功',
      version: restoredVersion,
    });
  } catch (error) {
    console.error('恢復版本失敗:', error);
    return res.status(500).json({ error: '恢復版本失敗' });
  }
}