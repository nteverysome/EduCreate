import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { withTestAuth } from '../../../middleware/withTestAuth';

const prisma = new PrismaClient();

async function searchHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息（可能來自會話或測試令牌）
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  // 檢查用戶認證狀態
  if (!session && !(req as any).testUser) {
    return res.status(401).json({ 
      error: '未授權訪問',
      message: '請先登入以使用搜索功能',
      code: 'UNAUTHORIZED'
    });
  }
  
  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    const { query, type, published, sort = 'updatedAt', order = 'desc', page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // 構建搜索條件
    const where: any = {};
    
    // 如果有查詢字符串，搜索標題和描述
    if (query && typeof query === 'string') {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // 根據活動類型過濾
    if (type && typeof type === 'string') {
      where.type = type;
    }
    
    // 根據發布狀態過濾
    if (published !== undefined) {
      where.published = published === 'true';
    }
    
    // 執行搜索查詢
    const [activities, totalCount] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { [sort as string]: order },
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.activity.count({ where })
    ]);
    
    // 返回搜索結果和分頁信息
    return res.status(200).json({
      activities,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('搜索錯誤:', error);
    return res.status(500).json({ error: '搜索失敗' });
  } finally {
    await prisma.$disconnect();
  }
}

// 使用測試認證中間件包裝處理器
export default withTestAuth(searchHandler);