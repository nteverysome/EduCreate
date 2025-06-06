import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許GET請求' });
  }

  try {
    // 檢查用戶是否已登入
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: '請先登入' });
    }

    // 獲取用戶的訂閱信息
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { 
        id: true,
        status: true,
        planId: true,
        startDate: true,
        endDate: true
      },
    });

    // 檢查訂閱是否有效
    const hasSubscription = !!subscription && subscription.status === 'ACTIVE';
    
    // 檢查用戶是否需要升級
    // 如果用戶角色不是高級用戶或管理員，則需要升級
    const requiresUpgrade = !['PREMIUM_USER', 'ADMIN'].includes(session.user.role);

    // 獲取用戶已創建的活動數量
    const activityCount = await prisma.activity.count({
      where: { userId: session.user.id },
    });

    // 免費用戶的活動限制
    const FREE_ACTIVITY_LIMIT = 5;

    return res.status(200).json({
      hasSubscription,
      subscription,
      requiresUpgrade,
      activityCount,
      activityLimit: FREE_ACTIVITY_LIMIT,
      canCreateMore: hasSubscription || session.user.role === 'ADMIN' || activityCount < FREE_ACTIVITY_LIMIT
    });
  } catch (error) {
    console.error('獲取訂閱狀態錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}