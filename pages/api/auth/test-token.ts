import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

// 注意：此端點僅用於開發環境，不應在生產環境中使用
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 確保只在開發環境中可用
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: '端點不存在' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    // 獲取測試用戶
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@example.com' },
          { email: 'user@example.com' }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: '找不到測試用戶，請先運行 prisma:seed 命令' });
    }

    // 創建測試令牌
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.NEXTAUTH_SECRET || 'development-secret-key',
      { expiresIn: '1d' }
    );

    // 返回令牌和用戶信息
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('獲取測試令牌失敗:', error);
    return res.status(500).json({ error: '獲取測試令牌失敗' });
  }
}