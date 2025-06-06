import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

/**
 * 支付API入口點
 * 提供支付相關API的基本信息
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    // 查询用户的订阅状态
    const userWithSubscription = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true
      }
    });

    const hasActiveSubscription = userWithSubscription?.subscription?.status === 'ACTIVE';

    // 返回支付相關的API端點和用戶信息
    return res.status(200).json({
      endpoints: [
        '/api/payments/create-subscription',
        '/api/payments/cancel-subscription',
        '/api/payments/update-payment-method'
      ],
      user: {
        id: session.user.id,
        hasActiveSubscription
      }
    });
  } catch (error) {
    console.error('支付API錯誤:', error);
    return res.status(500).json({ error: '內部服務器錯誤' });
  }
}