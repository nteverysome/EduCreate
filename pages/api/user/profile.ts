import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.id) {
        return res.status(401).json({ error: '未授權' });
      }
      const { user } = session;

      // 獲取用戶資料，包括活動統計和最近活動
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          activities: {
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: {
              id: true,
              title: true,
              type: true,
              published: true,
              updatedAt: true
            }
          }
        }
      });

      // 獲取活動統計
      const [total, published] = await Promise.all([
        prisma.activity.count({ where: { userId: user.id } }),
        prisma.activity.count({ where: { userId: user.id, published: true } })
      ]);

      return res.status(200).json({
        ...userData,
        activityStats: {
          total,
          published,
          draft: total - published
        }
      });
    } catch (error) {
      console.error('獲取用戶資料時出錯:', error);
      return res.status(500).json({ error: '獲取用戶資料時發生錯誤' });
    }
  }

  // 處理 PUT 請求
  if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.id) {
        return res.status(401).json({ error: '未授權' });
      }
      const { user } = session;
      const { name, image } = req.body;

      // 更新用戶資料
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: name || undefined,
          image: image || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('更新用戶資料時出錯:', error);
      return res.status(500).json({ error: '更新用戶資料時發生錯誤' });
    } finally {
      await prisma.$disconnect();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default handler;