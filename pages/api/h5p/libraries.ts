import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { installH5PLibrary, getH5PLibraries } from '../../../lib/h5p';

// 禁用默認的bodyParser，以便處理文件上傳
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * H5P庫管理API
 * GET: 獲取已安裝的H5P庫列表
 * POST: 上傳並安裝H5P庫
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // 只允許管理員訪問
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: '需要管理員權限' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const libraries = await getH5PLibraries();
        return res.status(200).json(libraries);
      } catch (error) {
        console.error('獲取H5P庫列表失敗:', error);
        return res.status(500).json({ error: '獲取H5P庫列表失敗' });
      }

    case 'POST':
      try {
        // 使用formidable解析上傳的文件
        const form = new formidable.IncomingForm({
          keepExtensions: true
        });
        
        const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
          });
        });

        // 檢查是否有上傳的H5P庫文件
        const libraryFileArray = files.libraryFile;
        const uploadedFile = Array.isArray(libraryFileArray) ? libraryFileArray[0] : libraryFileArray;
        if (!uploadedFile) {
          return res.status(400).json({ error: '未找到上傳的H5P庫文件' });
        }

        // 檢查文件類型
        if (path.extname(uploadedFile.originalFilename || '') !== '.h5p') {
          return res.status(400).json({ error: '僅支持.h5p格式的庫文件' });
        }

        // 安裝H5P庫
        const success = await installH5PLibrary(uploadedFile.filepath);
        
        if (!success) {
          return res.status(500).json({ error: '安裝H5P庫失敗' });
        }

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('安裝H5P庫失敗:', error);
        return res.status(500).json({ error: '安裝H5P庫失敗' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `不支持的方法: ${req.method}` });
  }
}