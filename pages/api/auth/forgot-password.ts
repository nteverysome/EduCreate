import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../../lib/email';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許POST請求' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: '電子郵件是必填的' });
    }

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 即使用戶不存在，也返回成功以防止枚舉攻擊
    if (!user) {
      return res.status(200).json({ message: '如果該郵箱已註冊，重置密碼鏈接將發送到您的郵箱' });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1小時後過期

    // 保存重置令牌到數據庫
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: resetToken,
        expires: resetTokenExpiry
      },
      create: {
        userId: user.id,
        token: resetToken,
        expires: resetTokenExpiry
      }
    });

    // 發送重置郵件
    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({ message: '如果該郵箱已註冊，重置密碼鏈接將發送到您的郵箱' });
  } catch (error) {
    console.error('忘記密碼錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}