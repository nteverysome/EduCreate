import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許POST請求' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: '令牌和密碼都是必填的' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: '密碼必須至少8個字符' });
    }

    // 查找有效的重置令牌
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token,
        expires: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!passwordReset) {
      return res.status(400).json({ message: '無效或已過期的重置令牌' });
    }
    
    // 加密新密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 更新用戶密碼
    await prisma.user.update({
      where: {
        id: passwordReset.userId
      },
      data: {
        password: hashedPassword
      }
    });

    // 刪除已使用的重置令牌
    await prisma.passwordReset.delete({
      where: {
        id: passwordReset.id
      }
    });

    return res.status(200).json({ message: '密碼重置成功' });
  } catch (error) {
    console.error('重置密碼錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}