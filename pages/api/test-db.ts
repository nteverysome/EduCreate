import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 测试数据库连接
    await prisma.$connect();
    
    // 测试查辂
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // 检查用户表
    const userCount = await prisma.user.count();
    
    res.status(200).json({
      success: true,
      message: '数据库连接成功',
      data: {
        testQuery: result,
        userCount: userCount,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('数据库测试错误：', error);
    
    res.status(500).json({
      success: false,
      message: '数据库远接申敄',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // 不靠要手动断开远接，统一的 prisma 实例会自动管理
  }
}
