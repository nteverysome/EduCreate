import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '../../../../middleware/withAuth';
import { PERMISSIONS } from '../../../../lib/permissions';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許 PUT 請求
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // 檢查角色是否有效
    const validRoles = ['USER', 'PREMIUM_USER', 'TEACHER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: '無效的角色' });
    }

    // 檢查用戶是否存在
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    // 更新用戶角色
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json({
      message: '用戶角色已更新',
      user: updatedUser,
    });
  } catch (error) {
    console.error('更新用戶角色時出錯:', error);
    return res.status(500).json({ error: '更新用戶角色時發生錯誤' });
  } finally {
    await prisma.$disconnect();
  }
}

// 使用權限中間件確保只有管理員可以更改用戶角色
export default withPermission(PERMISSIONS.UPDATE_USERS, handler);