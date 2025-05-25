import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許POST請求' });
  }

  try {
    const { name, email, password } = req.body;

    // 驗證輸入
    if (!name || !email || !password) {
      return res.status(400).json({ message: '所有欄位都是必填的' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: '密碼必須至少8個字符' });
    }

    // 檢查郵箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: '此電子郵件已被註冊' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建用戶
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    // 不返回密碼
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: '用戶創建成功',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}