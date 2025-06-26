import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 樨擥數據库連接
    await prisma.$connect();
    
    // 獲取用户數量
    const userCount = await prisma.user.count();
    
    // 獲取帳架數量（OAuth帳户）
    const accountCount = await prisma.account.count();
    
    // 獲取會次數量
    const sessionCount = await prisma.session.count();
    
    // 獲取最近的用戵
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
            type: true,
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      database: {
        connected: true,
        status: 'healthy'
      },
      statistics: {
        users: userCount,
        accounts: accountCount,
        sessions: sessionCount
      },
      recentUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('数据库状態横查錯誤:', error);
    
    return res.status(500).json({
      success: false,
      database: {
        connected: false,
        status: 'error'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    // 不需要手动断開连接，統一的 prisma 实例會寙動管理
  }
}
