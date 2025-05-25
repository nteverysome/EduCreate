import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withAnyPermission } from '../../../middleware/withAuth';
import { PERMISSIONS } from '../../../lib/permissions';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: '無效的用戶ID' });
  }

  // GET 請求 - 獲取單個用戶
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          // 不返回密碼
        }
      });

      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('獲取用戶失敗:', error);
      return res.status(500).json({ message: '獲取用戶失敗' });
    }
  }

  // PUT 請求 - 更新用戶
  if (req.method === 'PUT') {
    try {
      const { name, email, password, role } = req.body;

      // 檢查用戶是否存在
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      // 如果更新郵箱，檢查郵箱是否已被其他用戶使用
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email,
            id: { not: id }
          }
        });

        if (emailExists) {
          return res.status(400).json({ message: '此電子郵件已被其他用戶使用' });
        }
      }

      // 驗證角色
      const validRoles = ['USER', 'PREMIUM_USER', 'TEACHER', 'ADMIN'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: '無效的用戶角色' });
      }

      // 準備更新數據
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;

      // 如果提供了密碼，則加密
      if (password && password.trim() !== '') {
        if (password.length < 8) {
          return res.status(400).json({ message: '密碼必須至少8個字符' });
        }
        updateData.password = await bcrypt.hash(password, 12);
      }

      // 更新用戶
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });

      // 不返回密碼
      const { password: _, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        message: '用戶更新成功',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('更新用戶失敗:', error);
      return res.status(500).json({ message: '更新用戶失敗' });
    }
  }

  // DELETE 請求 - 刪除用戶
  if (req.method === 'DELETE') {
    try {
      // 檢查用戶是否存在
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      // 刪除用戶
      await prisma.user.delete({
        where: { id }
      });

      return res.status(200).json({ message: '用戶刪除成功' });
    } catch (error) {
      console.error('刪除用戶失敗:', error);
      return res.status(500).json({ message: '刪除用戶失敗' });
    }
  }

  // 不支持的方法
  return res.status(405).json({ message: '方法不允許' });
}

// 使用權限中間件包裝處理程序
export default withAnyPermission([PERMISSIONS.READ_USERS, PERMISSIONS.UPDATE_USERS, PERMISSIONS.DELETE_USERS], handler);