import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * 支付API入口點
 * 提供支付相關API的基本信息
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    // 返回支付相關的基本信息
    return res.status(200).json({
      message: '支付API入口點',
      endpoints: [
        '/api/payments/create-subscription',
        '/api/payments/cancel-subscription',
        '/api/payments/update-payment-method'
      ],
      user: {
        id: session.user.id,
        hasActiveSubscription: session.user.hasSubscription || false
      }
    });
  } catch (error) {
    console.error('支付API錯誤:', error);
    return res.status(500).json({ error: '內部服務器錯誤' });
  }
}