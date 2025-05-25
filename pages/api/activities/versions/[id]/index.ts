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
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '缺少版本ID' });
  }
  
  // 根據請求方法處理不同的操作
  switch (req.method) {
    case 'GET':
      return getActivityVersion(req, res, session);
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
            id: true,
            userId: true,
            title: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
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
    console.error('獲取版本詳情失敗:', error);
    return res.status(500).json({ error: '獲取版本詳情失敗' });
  }
}