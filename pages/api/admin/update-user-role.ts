import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔧 用戶角色更新API被調用:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' });
  }

  try {
    // 驗證用戶身份
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      console.log('❌ 未授權訪問');
      return res.status(401).json({ message: '請先登入' });
    }

    const { userId, newRole } = req.body;
    
    // 如果沒有指定 userId，則更新當前用戶
    const targetUserId = userId || session.user.id;
    
    console.log('🎯 更新用戶角色:', {
      targetUserId,
      newRole,
      currentUser: session.user.id
    });

    // 驗證角色值
    const validRoles = ['USER', 'PREMIUM_USER', 'ADMIN'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ 
        message: '無效的角色',
        validRoles 
      });
    }

    // 更新用戶角色
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('✅ 用戶角色更新成功:', updatedUser);

    return res.status(200).json({
      success: true,
      message: `用戶角色已更新為 ${newRole}`,
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ 更新用戶角色失敗:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ message: '用戶不存在' });
    }
    
    return res.status(500).json({ 
      message: '服務器錯誤',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : error) : undefined
    });
  }
}
