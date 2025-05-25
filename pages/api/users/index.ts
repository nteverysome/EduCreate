import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withAnyPermission } from '../../../middleware/withAuth';
import { PERMISSIONS } from '../../../lib/permissions';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET 請求 - 獲取用戶列表
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          // 不返回密碼
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(users);
    } catch (error) {
      console.error('獲取用戶列表失敗:', error);
      return res.status(500).json({ message: '獲取用戶列表失敗' });
    }
  }

  // POST 請求 - 創建新用戶
  if (req.method === 'POST') {
    try {
      const { name, email, password, role } = req.body;

      // 驗證輸入
      if (!name || !email || !password) {
        return res.status(400).json({ message: '所有必填欄位都必須提供' });
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

      // 驗證角色
      const validRoles = ['USER', 'PREMIUM_USER', 'TEACHER', 'ADMIN'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: '無效的用戶角色' });
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 12);

      // 創建用戶
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'USER',
        }
      });

      // 不返回密碼
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        message: '用戶創建成功',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('創建用戶失敗:', error);
      return res.status(500).json({ message: '創建用戶失敗' });
    }
  }

  // 不支持的方法
  return res.status(405).json({ message: '方法不允許' });
}

// 使用權限中間件包裝處理程序
export default withAnyPermission([PERMISSIONS.READ_USERS, PERMISSIONS.UPDATE_USERS], handler);