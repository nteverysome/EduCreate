import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { sendWelcomeEmail } from '../../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許 GET 請求' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: '無效的驗證令牌' });
  }

  try {
    // 查找驗證令牌
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return res.status(400).json({ message: '驗證令牌不存在或已過期' });
    }

    // 檢查令牌是否過期（24小時）
    const now = new Date();
    if (verificationToken.expires < now) {
      // 刪除過期令牌
      await prisma.verificationToken.delete({
        where: { token }
      });
      return res.status(400).json({ message: '驗證令牌已過期，請重新註冊' });
    }

    // 更新用戶的 emailVerified 狀態
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: now }
    });

    // 刪除已使用的令牌
    await prisma.verificationToken.delete({
      where: { token }
    });

    // 發送歡迎郵件
    await sendWelcomeEmail(user.email, user.name || user.email.split('@')[0]);

    // 重定向到成功頁面
    return res.redirect('/auth/email-verified?success=true');

  } catch (error) {
    console.error('❌ 郵箱驗證錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤' });
  }
}
