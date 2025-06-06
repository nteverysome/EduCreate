import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../../lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * H5P內容管理API
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

  switch (req.method) {
    case 'GET':
      try {
        // 獲取所有H5P內容
        const h5pContents = await prisma.h5PContent.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' }
        });
        
        return res.status(200).json(h5pContents);
      } catch (error) {
        console.error('獲取H5P內容失敗:', error);
        return res.status(500).json({ error: '獲取H5P內容失敗' });
      }

    case 'POST':
      try {
        const { title, description, contentType, contentData } = req.body;
        
        if (!title || !contentType) {
          return res.status(400).json({ error: '標題和內容類型為必填項' });
        }

        // 創建新的H5P內容記錄
        const newH5pContent = await prisma.h5PContent.create({
          data: {
            title,
            content: contentData || {},
            userId,
            library: contentType || 'H5P.InteractiveVideo',
            isPublic: false
          },
        });

        return res.status(201).json(newH5pContent);
      } catch (error) {
        console.error('創建H5P內容失敗:', error);
        return res.status(500).json({ error: '創建H5P內容失敗' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `方法 ${req.method} 不允許` });
  }
}