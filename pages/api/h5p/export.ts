import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const prisma = new PrismaClient();

/**
 * H5P內容導出API
 * 將H5P內容打包為.h5p文件供下載
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
    const { contentId } = req.body;

    if (!contentId) {
      return res.status(400).json({ error: '缺少內容ID' });
    }

    // 獲取H5P內容信息
    const h5pContent = await prisma.h5PContent.findUnique({
      where: { id: contentId }
    });

    if (!h5pContent) {
      return res.status(404).json({ error: 'H5P內容不存在' });
    }

    // 檢查用戶是否有權限導出該內容
    if (h5pContent.userId !== session.user.id) {
      return res.status(403).json({ error: '無權導出此內容' });
    }

    // H5P內容目錄路徑
    const contentDir = path.join(process.cwd(), 'public', 'h5p', 'content', contentId);
    
    if (!fs.existsSync(contentDir)) {
      return res.status(404).json({ error: 'H5P內容文件不存在' });
    }

    // 創建臨時目錄用於打包
    const tempDir = path.join(process.cwd(), 'tmp', `h5p-export-${contentId}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 創建zip文件
    const zip = new AdmZip();

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
          zip.addFile(zipFilePath, fileData);
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
            addFilesToZip(libPath, `libraries/${libName}`);
          }
        }
      }
    }

    // 生成.h5p文件
    const h5pFileName = `${h5pContent.title || 'h5p-content'}.h5p`;
    const h5pFilePath = path.join(tempDir, h5pFileName);
    
    // 寫入zip文件
    zip.writeZip(h5pFilePath);

    // 設置響應頭，指示瀏覽器下載文件
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(h5pFileName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // 讀取並發送文件
    const fileStream = fs.createReadStream(h5pFilePath);
    fileStream.pipe(res);

    // 設置清理函數
    fileStream.on('close', () => {
      // 刪除臨時文件
      try {
        fs.unlinkSync(h5pFilePath);
        fs.rmdirSync(tempDir, { recursive: true });
      } catch (err) {
        console.error('清理臨時文件失敗:', err);
      }
    });
  } catch (error) {
    console.error('導出H5P內容失敗:', error);
    return res.status(500).json({ error: '導出H5P內容失敗' });
  }
}