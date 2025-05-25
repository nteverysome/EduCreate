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
      return getActivities(req, res, session);
    case 'POST':
      return createActivity(req, res, session);
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 獲取用戶的活動列表
async function getActivities(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userId = session.user.id;
    
    // 獲取用戶的所有活動
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    
    return res.status(200).json(activities);
  } catch (error) {
    console.error('獲取活動失敗:', error);
    return res.status(500).json({ error: '獲取活動失敗' });
  }
}

// 創建新活動
async function createActivity(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userId = session.user.id;
    const { title, description, type, elements, templateId } = req.body;
    
    // 驗證必要字段
    if (!title || !type) {
      return res.status(400).json({ error: '標題和類型是必填項' });
    }
    
    // 檢查用戶是否可以創建更多活動
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    // 管理員可以創建無限活動
    if (user?.role !== 'ADMIN') {
      // 檢查用戶是否有有效訂閱
      const hasActiveSubscription = 
        user?.subscription && user.subscription.status === 'ACTIVE';

      // 如果用戶沒有有效訂閱，檢查是否超過免費限制
      if (!hasActiveSubscription) {
        const activityCount = await prisma.activity.count({
          where: { userId: userId },
        });

        const FREE_ACTIVITY_LIMIT = 5;
        if (activityCount >= FREE_ACTIVITY_LIMIT) {
          return res.status(403).json({ 
            error: `免費用戶最多只能創建${FREE_ACTIVITY_LIMIT}個活動`,
            requiresSubscription: true
          });
        }
      }
    }
    
    // 創建新活動
    const activity = await prisma.activity.create({
      data: {
        title,
        description: description || '',
        type,
        elements: elements || [],
        templateId,
        published: false,
        userId
      }
    });
    
    return res.status(201).json(activity);
  } catch (error) {
    console.error('創建活動失敗:', error);
    return res.status(500).json({ error: '創建活動失敗' });
  }
}