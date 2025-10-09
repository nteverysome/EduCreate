import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 檢查用戶 API 被調用');
  
  try {
    // 查詢所有用戶
    console.log('🔍 查詢所有用戶...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            vocabularySets: true
          }
        }
      }
    });
    
    console.log(`📊 找到 ${users.length} 個用戶`);
    
    return res.status(200).json({
      success: true,
      message: '用戶查詢成功',
      data: {
        users,
        totalCount: users.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ 查詢用戶失敗:', error);
    
    return res.status(500).json({
      success: false,
      message: '查詢用戶失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}
