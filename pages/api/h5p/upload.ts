import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
// 需要先安装formidable: npm install formidable @types/formidable
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../lib/prisma';
import { extractH5PContent } from '../../../lib/h5p';

// 禁用默認的bodyParser，以便處理文件上傳
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * H5P內容上傳API
 * POST: 上傳H5P內容包並處理
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `不支持的方法: ${req.method}` });
  }

  const session = await getSession({ req });
  
  if (!session?.user) {
    return res.status(401).json({ error: '未授權訪問' });
  }

  const userId = session.user.id;
  const contentId = req.query.contentId as string;

  try {
    // 使用formidable解析上傳的文件
    const form = formidable({
      keepExtensions: true,
    });
    
    const [fields, files] = await form.parse(req);

    // 檢查是否有上傳的H5P文件
    const uploadedFile = Array.isArray(files.h5pFile) ? files.h5pFile[0] : files.h5pFile;
    if (!uploadedFile) {
      return res.status(400).json({ error: '未找到上傳的H5P文件' });
    }

    // 檢查文件類型
    if (path.extname(uploadedFile.originalFilename || '') !== '.h5p') {
      return res.status(400).json({ error: '僅支持.h5p格式的文件' });
    }

    // 創建唯一的內容目錄
    const contentDirId = uuidv4();
    const contentDir = path.join(process.cwd(), 'public', 'h5p', 'content', contentDirId);
    
    // 確保目錄存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // 解壓並處理H5P文件
    const h5pInfo = await extractH5PContent(uploadedFile.filepath, contentDir);
    
    // 更新或創建H5P內容記錄
    let h5pContent;
    if (contentId) {
      // 更新現有內容
      h5pContent = await prisma.h5PContent.update({
        where: { id: contentId },
        data: {
          updatedAt: new Date(),
        },
      });
    } else {
      // 創建新內容記錄
      h5pContent = await prisma.h5PContent.create({
        data: {
          title: h5pInfo.title || '未命名H5P內容',
          content: {},
          contentType: h5pInfo.contentType || 'H5P.InteractiveVideo',
          contentPath: `/h5p/uploads/${Date.now()}`,
          library: h5pInfo.contentType || 'H5P.InteractiveVideo',
          userId,
          published: false
        },
      });
    }

    return res.status(200).json({
      success: true,
      h5pContent,
    });
  } catch (error) {
    console.error('H5P內容上傳處理失敗:', error);
    return res.status(500).json({ error: '處理H5P內容失敗' });
  }
}