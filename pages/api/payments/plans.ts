import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 獲取訂閱計劃API
 * 返回所有可用的訂閱計劃
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  // 獲取用戶會話
  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }

  try {
    // 從數據庫獲取所有訂閱計劃
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        interval: true,
        features: true,
      },
    });

    // 返回計劃列表
    return res.status(200).json({ plans });
  } catch (error) {
    console.error('獲取訂閱計劃失敗:', error);
    return res.status(500).json({ error: '獲取訂閱計劃失敗' });
  }
}