import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * H5P內容下載API
 * 允許用戶下載特定的H5P內容
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  // 檢查用戶是否已登入
  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '缺少內容ID' });
    }

    // 獲取H5P內容信息
    const h5pContent = await prisma.h5PContent.findUnique({
      where: { id },
      include: {
        activities: true
      }
    });

    if (!h5pContent) {
      return res.status(404).json({ error: 'H5P內容不存在' });
    }

    // 檢查用戶是否有權限下載該內容
    // 注意：這裡可以根據實際需求調整權限檢查邏輯
    // 例如，公開的內容可以允許任何登入用戶下載
    if (h5pContent.activities.length > 0 && h5pContent.activities[0].userId !== session.user.id) {
      return res.status(403).json({ error: '無權下載此內容' });
    }

    // H5P內容文件路徑
    const contentFilePath = path.join(process.cwd(), 'public', 'h5p', 'content', id, 'content.json');
    
    if (!fs.existsSync(contentFilePath)) {
      return res.status(404).json({ error: 'H5P內容文件不存在' });
    }

    // 讀取內容文件
    const contentData = fs.readFileSync(contentFilePath, 'utf8');
    
    // 設置響應頭
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="h5p-content-${id}.json"`);
    
    // 發送文件內容
    res.status(200).send(contentData);
  } catch (error) {
    console.error('下載H5P內容失敗:', error);
    return res.status(500).json({ error: '下載H5P內容失敗' });
  }
}