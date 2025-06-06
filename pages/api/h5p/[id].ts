import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

/**
 * H5P內容詳情API
 * GET: 獲取特定H5P內容詳情
 * PUT: 更新H5P內容
 * DELETE: 刪除H5P內容
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session?.user) {
    return res.status(401).json({ error: '未授權訪問' });
  }

  const userId = session.user.id;
  const contentId = req.query.id as string;

  if (!contentId) {
    return res.status(400).json({ error: '內容ID為必填項' });
  }

  // 檢查內容是否存在並屬於當前用戶
  const content = await prisma.h5PContent.findFirst({
    where: {
      id: contentId,
      userId,
    },
  });

  if (!content && req.method !== 'GET') {
    return res.status(404).json({ error: '內容不存在或無權訪問' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // 允許公開訪問已發布的內容
        const h5pContent = await prisma.h5PContent.findFirst({
          where: {
            id: contentId,
            OR: [
              { userId },
              { status: 'PUBLISHED' },
            ],
          },
        });

        if (!h5pContent) {
          return res.status(404).json({ error: '內容不存在或無權訪問' });
        }

        return res.status(200).json(h5pContent);
      } catch (error) {
        console.error('獲取H5P內容詳情失敗:', error);
        return res.status(500).json({ error: '獲取H5P內容詳情失敗' });
      }

    case 'PUT':
      try {
        const { title, description, status, contentPath } = req.body;
        
        const updatedContent = await prisma.h5PContent.update({
          where: { id: contentId },
          data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            ...(contentPath && { contentPath }),
            updatedAt: new Date(),
          },
        });

        return res.status(200).json(updatedContent);
      } catch (error) {
        console.error('更新H5P內容失敗:', error);
        return res.status(500).json({ error: '更新H5P內容失敗' });
      }

    case 'DELETE':
      try {
        await prisma.h5PContent.delete({
          where: { id: contentId },
        });

        // 這裡應該添加刪除相關文件的邏輯
        // TODO: 刪除存儲在文件系統中的H5P內容文件

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('刪除H5P內容失敗:', error);
        return res.status(500).json({ error: '刪除H5P內容失敗' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `不支持的方法: ${req.method}` });
  }
}