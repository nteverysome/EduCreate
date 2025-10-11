import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// 僅用於測試環境的 API
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
    // 查找最新的驗證令牌
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: 'desc' }
    });

    if (!verificationToken) {
      return res.status(404).json({ message: '未找到驗證令牌' });
    }

    return res.status(200).json({
      token: verificationToken.token,
      expires: verificationToken.expires,
      email: verificationToken.identifier
    });

  } catch (error) {
    console.error('❌ 獲取驗證令牌錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤' });
  }
}
