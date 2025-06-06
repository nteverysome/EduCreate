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
  
  const { id } = req.query;
  const activityId = Array.isArray(id) ? id[0] : id;
  
  // 獲取活動版本歷史
  if (req.method === 'GET') {
    try {
      // 檢查用戶是否有權限訪問該活動
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        select: { userId: true }
      });
      
      if (!activity) {
        return res.status(404).json({ error: '活動不存在' });
      }
      
      if (activity.userId !== session.user.id) {
        return res.status(403).json({ error: '無權訪問此活動' });
      }
      
      // 獲取版本歷史
      const versions = await prisma.activityVersion.findMany({
        where: { activityId },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.status(200).json(versions);
    } catch (error) {
      console.error('獲取版本歷史失敗:', error);
      return res.status(500).json({ error: '獲取版本歷史失敗' });
    }
  }
  
  // 創建新版本
  if (req.method === 'POST') {
    try {
      const { snapshot, comment } = req.body;
      
      if (!snapshot) {
        return res.status(400).json({ error: '缺少必要參數' });
      }
      
      // 檢查用戶是否有權限修改該活動
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        select: { userId: true }
      });
      
      if (!activity) {
        return res.status(404).json({ error: '活動不存在' });
      }
      
      if (activity.userId !== session.user.id) {
        return res.status(403).json({ error: '無權修改此活動' });
      }
      
      // Generate version name based on existing versions count
      const existingVersionsCount = await prisma.activityVersion.count({
        where: { activityId }
      });
      const newVersionNumber = existingVersionsCount + 1;
      
      // 創建新版本
      const newVersion = await prisma.activityVersion.create({
        data: {
          activityId: activityId as string,
          userId: session.user.id,
          versionName: `Version ${new Date().toISOString()}`,
          versionNotes: comment || null,
          content: snapshot.content || null,
          elements: snapshot.elements || []
        }
      });
      
      return res.status(201).json(newVersion);
    } catch (error) {
      console.error('創建版本失敗:', error);
      return res.status(500).json({ error: '創建版本失敗' });
    }
  }
  
  // 不支持的方法
  return res.status(405).json({ error: '方法不允許' });
}