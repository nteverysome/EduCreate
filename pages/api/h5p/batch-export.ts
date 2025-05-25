import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const prisma = new PrismaClient();

/**
 * H5P內容批量導出API
 * 將多個H5P內容打包為zip文件供下載
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許POST請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  // 檢查用戶是否已登入
  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }

  try {
    const { contentIds } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: '缺少有效的內容ID列表' });
    }

    // 創建一個新的zip文件
    const zip = new AdmZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFileName = `h5p-contents-${timestamp}.zip`;
    
    // 處理每個H5P內容
    for (const contentId of contentIds) {
      // 獲取H5P內容信息
      const h5pContent = await prisma.h5pContent.findUnique({
        where: { id: contentId },
        include: {
          activity: true
        }
      });

      if (!h5pContent) {
        console.warn(`H5P內容不存在: ${contentId}`);
        continue;
      }

      // 檢查用戶是否有權限導出該內容
      if (h5pContent.activity && h5pContent.activity.userId !== session.user.id) {
        console.warn(`用戶無權導出內容: ${contentId}`);
        continue;
      }

      // H5P內容文件路徑
      const h5pFilePath = path.join(process.cwd(), 'public', 'h5p', 'content', `${contentId}.h5p`);
      
      // 如果已經存在打包好的H5P文件，直接添加到zip
      if (fs.existsSync(h5pFilePath)) {
        const fileData = fs.readFileSync(h5pFilePath);
        zip.addFile(`${h5pContent.title}.h5p`, fileData);
        continue;
      }
      
      // 否則，需要從內容目錄打包
      const contentDir = path.join(process.cwd(), 'public', 'h5p', 'content', contentId);
      
      if (!fs.existsSync(contentDir)) {
        console.warn(`H5P內容目錄不存在: ${contentId}`);
        continue;
      }

      // 創建單個H5P內容的臨時zip
      const tempZip = new AdmZip();

      // 添加內容文件
      const addFilesToZip = (dir: string, zipPath: string = '') => {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            // 遞歸添加子目錄
            addFilesToZip(filePath, path.join(zipPath, file));
          } else {
            // 添加文件到zip
            const fileData = fs.readFileSync(filePath);
            const zipFilePath = zipPath ? path.join(zipPath, file) : file;
            tempZip.addFile(zipFilePath, fileData);
          }
        }
      };

      // 添加內容目錄下的所有文件
      addFilesToZip(contentDir);

      // 添加必要的H5P庫文件
      const h5pJsonPath = path.join(contentDir, 'h5p.json');
      if (fs.existsSync(h5pJsonPath)) {
        const h5pJson = JSON.parse(fs.readFileSync(h5pJsonPath, 'utf8'));
        
        // 添加依賴的庫文件
        if (h5pJson.preloadedDependencies) {
          for (const dep of h5pJson.preloadedDependencies) {
            const libName = `${dep.machineName}-${dep.majorVersion}.${dep.minorVersion}`;
            const libPath = path.join(process.cwd(), 'public', 'h5p', 'libraries', libName);
            
            if (fs.existsSync(libPath)) {
              // 添加庫文件到臨時zip
              addFilesToZip(libPath, `libraries/${libName}`);
            }
          }
        }
      }

      // 將臨時zip添加到主zip中
      zip.addFile(`${h5pContent.title}.h5p`, tempZip.toBuffer());
    }

    // 檢查是否有內容被添加到zip中
    if (zip.getEntries().length === 0) {
      return res.status(404).json({ error: '沒有找到可導出的H5P內容' });
    }

    // 設置響應頭
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    
    // 發送zip文件
    return res.send(zip.toBuffer());
  } catch (error) {
    console.error('批量導出H5P內容時出錯:', error);
    return res.status(500).json({ error: '批量導出H5P內容失敗' });
  }
}