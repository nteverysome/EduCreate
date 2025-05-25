import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

/**
 * H5P內容列表API
 * GET: 獲取用戶的H5P內容列表
 * POST: 創建新的H5P內容
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session?.user) {
    return res.status(401).json({ error: '未授權訪問' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const h5pContents = await prisma.h5pContent.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        });
        return res.status(200).json(h5pContents);
      } catch (error) {
        console.error('獲取H5P內容列表失敗:', error);
        return res.status(500).json({ error: '獲取H5P內容列表失敗' });
      }

    case 'POST':
      try {
        const { title, description, contentType } = req.body;
        
        if (!title || !contentType) {
          return res.status(400).json({ error: '標題和內容類型為必填項' });
        }

        const newH5pContent = await prisma.h5pContent.create({
          data: {
            title,
            description: description || '',
            contentType,
            userId,
            status: 'draft',
            contentPath: '', // 將在上傳處理後更新
          },
        });

        return res.status(201).json(newH5pContent);
      } catch (error) {
        console.error('創建H5P內容失敗:', error);
        return res.status(500).json({ error: '創建H5P內容失敗' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `不支持的方法: ${req.method}` });
  }
}