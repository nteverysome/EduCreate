#!/usr/bin/env node

/**
 * 自動化構建和部署腳本
 * 功能：
 * 1. 構建 Vite 專案
 * 2. 優化資源文件
 * 3. 複製到 Next.js public 目錄
 * 4. 版本控制和緩存管理
 * 5. 錯誤處理和日誌記錄
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  // 項目路徑
  projectRoot: path.resolve(__dirname, '..'),
  distDir: path.resolve(__dirname, '../dist'),
  publicDir: path.resolve(__dirname, '../../../public/games/airplane-game'),
  
  // 版本信息
  version: process.env.npm_package_version || '1.0.0',
  buildTime: new Date().toISOString(),
  
  // 構建選項
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  
  // 日誌選項
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  quiet: process.argv.includes('--quiet') || process.argv.includes('-q'),
};

/**
 * 日誌工具
 */
class Logger {
  static info(message, ...args) {
    if (!CONFIG.quiet) {
      console.log(`ℹ️  ${message}`, ...args);
    }
  }
  
  static success(message, ...args) {
    if (!CONFIG.quiet) {
      console.log(`✅ ${message}`, ...args);
    }
  }
  
  static warn(message, ...args) {
    console.warn(`⚠️  ${message}`, ...args);
  }
  
  static error(message, ...args) {
    console.error(`❌ ${message}`, ...args);
  }
  
  static verbose(message, ...args) {
    if (CONFIG.verbose && !CONFIG.quiet) {
      console.log(`🔍 ${message}`, ...args);
    }
  }
}

/**
 * 執行命令工具
 */
function execCommand(command, options = {}) {
  Logger.verbose(`執行命令: ${command}`);
  try {
    const result = execSync(command, {
      cwd: CONFIG.projectRoot,
      encoding: 'utf8',
      stdio: CONFIG.verbose ? 'inherit' : 'pipe',
      ...options
    });
    return result;
  } catch (error) {
    Logger.error(`命令執行失敗: ${command}`);
    Logger.error(error.message);
    throw error;
  }
}

/**
 * 確保目錄存在
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    Logger.verbose(`創建目錄: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 複製文件或目錄
 */
function copyRecursive(src, dest) {
  Logger.verbose(`複製: ${src} -> ${dest}`);
  
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    ensureDir(dest);
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * 刪除目錄
 */
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    Logger.verbose(`刪除目錄: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * 獲取文件大小（人類可讀格式）
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 分析構建結果
 */
function analyzeBuild() {
  Logger.info('📊 分析構建結果...');
  
  if (!fs.existsSync(CONFIG.distDir)) {
    Logger.warn('dist 目錄不存在');
    return;
  }
  
  const files = [];
  
  function scanDir(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath, prefix + item + '/');
      } else {
        files.push({
          name: prefix + item,
          path: itemPath,
          size: stat.size,
          sizeFormatted: getFileSize(itemPath)
        });
      }
    }
  }
  
  scanDir(CONFIG.distDir);
  
  // 按大小排序
  files.sort((a, b) => b.size - a.size);
  
  Logger.info('📁 構建文件列表:');
  files.forEach(file => {
    Logger.info(`   ${file.name}: ${file.sizeFormatted}`);
  });
  
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  Logger.info(`📦 總大小: ${getFileSize(CONFIG.distDir)}`);
  
  // 檢查大文件警告
  const largeFiles = files.filter(file => file.size > 500 * 1024); // 500KB
  if (largeFiles.length > 0) {
    Logger.warn('⚠️  發現大文件:');
    largeFiles.forEach(file => {
      Logger.warn(`   ${file.name}: ${file.sizeFormatted}`);
    });
    Logger.warn('建議考慮代碼分割或資源優化');
  }
}

/**
 * 創建部署信息文件
 */
function createDeployInfo() {
  const deployInfo = {
    version: CONFIG.version,
    buildTime: CONFIG.buildTime,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    git: {
      branch: '',
      commit: '',
      tag: ''
    }
  };
  
  // 嘗試獲取 Git 信息
  try {
    deployInfo.git.branch = execCommand('git rev-parse --abbrev-ref HEAD').trim();
    deployInfo.git.commit = execCommand('git rev-parse HEAD').trim();
    deployInfo.git.tag = execCommand('git describe --tags --exact-match HEAD 2>/dev/null || echo ""').trim();
  } catch (error) {
    Logger.verbose('無法獲取 Git 信息');
  }
  
  const deployInfoPath = path.join(CONFIG.distDir, 'deploy-info.json');
  fs.writeFileSync(deployInfoPath, JSON.stringify(deployInfo, null, 2));
  
  Logger.verbose(`創建部署信息文件: ${deployInfoPath}`);
  return deployInfo;
}

/**
 * 主要部署流程
 */
async function deploy() {
  const startTime = Date.now();
  
  try {
    Logger.info('🚀 開始自動化構建和部署流程...');
    Logger.info(`📦 版本: ${CONFIG.version}`);
    Logger.info(`🕐 構建時間: ${CONFIG.buildTime}`);
    
    // 步驟 1: 清理舊的構建文件
    Logger.info('🧹 清理舊的構建文件...');
    removeDir(CONFIG.distDir);
    
    // 步驟 2: 執行 Vite 構建
    Logger.info('⚡ 執行 Vite 構建...');
    execCommand('npm run build');
    Logger.success('Vite 構建完成');
    
    // 步驟 3: 分析構建結果
    analyzeBuild();
    
    // 步驟 4: 創建部署信息
    Logger.info('📝 創建部署信息...');
    const deployInfo = createDeployInfo();
    
    // 步驟 5: 清理目標目錄
    Logger.info('🧹 清理目標目錄...');
    removeDir(CONFIG.publicDir);
    
    // 步驟 6: 複製構建文件到 public 目錄
    Logger.info('📂 複製構建文件到 public 目錄...');
    ensureDir(path.dirname(CONFIG.publicDir));
    copyRecursive(CONFIG.distDir, CONFIG.publicDir);
    Logger.success(`文件已複製到: ${CONFIG.publicDir}`);
    
    // 步驟 7: 驗證部署
    Logger.info('✅ 驗證部署...');
    const indexPath = path.join(CONFIG.publicDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error('index.html 文件不存在，部署可能失敗');
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    Logger.success('🎉 自動化構建和部署完成！');
    Logger.success(`⏱️  總耗時: ${duration}s`);
    Logger.success(`🌐 遊戲 URL: http://localhost:3000/games/airplane-game/`);
    
    return deployInfo;
    
  } catch (error) {
    Logger.error('💥 部署失敗:');
    Logger.error(error.message);
    
    if (CONFIG.verbose) {
      Logger.error(error.stack);
    }
    
    process.exit(1);
  }
}

// 執行部署
const isMainModule = process.argv[1] && process.argv[1].endsWith('deploy.js');
if (isMainModule) {
  deploy().catch(error => {
    Logger.error('未處理的錯誤:', error);
    process.exit(1);
  });
}

export { deploy, CONFIG, Logger };
