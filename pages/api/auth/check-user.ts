import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// 檢查用戶狀態的 API（僅用於測試）
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只在開發環境中允許此 API
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許 GET 請求' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: '需要提供郵箱地址' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        country: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        exists: false,
        message: '用戶不存在' 
      });
    }

    return res.status(200).json({
      exists: true,
      emailVerified: !!user.emailVerified,
      country: user.country,
      createdAt: user.createdAt,
      id: user.id
    });

  } catch (error) {
    console.error('❌ 檢查用戶狀態錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤' });
  }
}
