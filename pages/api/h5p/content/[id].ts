import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../../lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * 單個H5P內容管理API
 * GET: 獲取特定H5P內容的詳細信息
 * PUT: 更新H5P內容的元數據
 * DELETE: 刪除H5P內容
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session?.user) {
    return res.status(401).json({ error: '未授權訪問' });
  }

  const userId = session.user.id;
  const { id } = req.query;

  // 確保id是字符串
  const contentId = Array.isArray(id) ? id[0] : id;
  
  if (!contentId) {
    return res.status(400).json({ error: '內容ID為必填項' });
  }

  // 檢查內容是否存在並屬於當前用戶
  const h5pContent = await prisma.h5PContent.findFirst({
    where: {
      id: contentId,
      userId
    }
  });

  if (!h5pContent) {
    return res.status(404).json({ error: 'H5P內容不存在或無權訪問' });
  }

  switch (req.method) {
    case 'GET':
      try {
        return res.status(200).json(h5pContent);
      } catch (error) {
        console.error('獲取H5P內容詳情失敗:', error);
        return res.status(500).json({ error: '獲取H5P內容詳情失敗' });
      }

    case 'PUT':
      try {
        const { title, description, status } = req.body;
        
        const updatedContent = await prisma.h5PContent.update({
          where: { id: contentId },
          data: {
            title: title || h5pContent.title,
            description: description !== undefined ? description : h5pContent.description,
            status: status || h5pContent.status,
            updatedAt: new Date()
          }
        });

        return res.status(200).json(updatedContent);
      } catch (error) {
        console.error('更新H5P內容失敗:', error);
        return res.status(500).json({ error: '更新H5P內容失敗' });
      }

    case 'DELETE':
      try {
        // 刪除數據庫記錄
        await prisma.h5PContent.delete({
          where: { id: contentId }
        });

        // 如果有關聯的文件，也需要刪除
        if (h5pContent.contentPath) {
          const contentDirPath = path.join(process.cwd(), 'public', h5pContent.contentPath);
          if (fs.existsSync(contentDirPath)) {
            fs.rmSync(contentDirPath, { recursive: true, force: true });
          }
        }

        return res.status(200).json({ success: true, message: 'H5P內容已刪除' });
      } catch (error) {
        console.error('刪除H5P內容失敗:', error);
        return res.status(500).json({ error: '刪除H5P內容失敗' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `方法 ${req.method} 不允許` });
  }
}