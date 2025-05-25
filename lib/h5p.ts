import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import AdmZip from 'adm-zip';

const execPromise = promisify(exec);

/**
 * H5P內容信息接口
 */
export interface H5PInfo {
  title?: string;
  description?: string;
  contentType?: string;
  mainLibrary?: string;
  preloadedDependencies?: Array<{ machineName: string; majorVersion: number; minorVersion: number }>;
}

/**
 * 解壓並處理H5P內容包
 * @param filePath H5P文件路徑
 * @param targetDir 目標目錄
 * @returns H5P內容信息
 */
export async function extractH5PContent(filePath: string, targetDir: string): Promise<H5PInfo> {
  try {
    // 確保目標目錄存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 使用AdmZip解壓H5P文件
    const zip = new AdmZip(filePath);
    zip.extractAllTo(targetDir, true);

    // 讀取h5p.json文件獲取內容信息
    const h5pJsonPath = path.join(targetDir, 'h5p.json');
    if (!fs.existsSync(h5pJsonPath)) {
      throw new Error('無效的H5P包：缺少h5p.json文件');
    }

    const h5pJson = JSON.parse(fs.readFileSync(h5pJsonPath, 'utf8'));
    const contentJsonPath = path.join(targetDir, 'content', 'content.json');
    let contentJson = {};

    if (fs.existsSync(contentJsonPath)) {
      contentJson = JSON.parse(fs.readFileSync(contentJsonPath, 'utf8'));
    }

    // 提取內容信息
    const h5pInfo: H5PInfo = {
      title: h5pJson.title,
      description: h5pJson.description,
      contentType: h5pJson.mainLibrary,
      mainLibrary: h5pJson.mainLibrary,
      preloadedDependencies: h5pJson.preloadedDependencies,
    };

    return h5pInfo;
  } catch (error) {
    console.error('處理H5P內容包失敗:', error);
    throw error;
  }
}

/**
 * 獲取H5P庫列表
 * @returns H5P庫列表
 */
export async function getH5PLibraries(): Promise<string[]> {
  const librariesDir = path.join(process.cwd(), 'public', 'h5p', 'libraries');
  
  if (!fs.existsSync(librariesDir)) {
    return [];
  }

  const libraries = fs.readdirSync(librariesDir)
    .filter(item => {
      const itemPath = path.join(librariesDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

  return libraries;
}

/**
 * 安裝H5P庫
 * @param libraryPath H5P庫文件路徑
 * @returns 安裝結果
 */
export async function installH5PLibrary(libraryPath: string): Promise<boolean> {
  try {
    const librariesDir = path.join(process.cwd(), 'public', 'h5p', 'libraries');
    
    // 確保庫目錄存在
    if (!fs.existsSync(librariesDir)) {
      fs.mkdirSync(librariesDir, { recursive: true });
    }

    // 解壓庫文件
    const zip = new AdmZip(libraryPath);
    zip.extractAllTo(librariesDir, true);

    return true;
  } catch (error) {
    console.error('安裝H5P庫失敗:', error);
    return false;
  }
}

/**
 * 創建H5P內容包
 * @param contentDir 內容目錄
 * @param outputPath 輸出路徑
 * @returns 創建結果
 */
export async function createH5PPackage(contentDir: string, outputPath: string): Promise<boolean> {
  try {
    const zip = new AdmZip();
    
    // 添加內容目錄中的所有文件
    const addDirectoryToZip = (dir: string, zipPath: string = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const zipItemPath = zipPath ? path.join(zipPath, item) : item;
        
        if (fs.statSync(itemPath).isDirectory()) {
          addDirectoryToZip(itemPath, zipItemPath);
        } else {
          zip.addLocalFile(itemPath, path.dirname(zipItemPath));
        }
      }
    };
    
    addDirectoryToZip(contentDir);
    
    // 寫入zip文件
    zip.writeZip(outputPath);
    
    return true;
  } catch (error) {
    console.error('創建H5P包失敗:', error);
    return false;
  }
}