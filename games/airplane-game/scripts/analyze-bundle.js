#!/usr/bin/env node

/**
 * Bundle 分析腳本
 * 分析構建後的文件大小、依賴關係和優化建議
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  distDir: path.resolve(__dirname, '../dist'),
  outputFile: path.resolve(__dirname, '../bundle-analysis.json'),
};

/**
 * 獲取文件大小（字節）
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 掃描目錄獲取所有文件
 */
function scanDirectory(dir, baseDir = dir) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scan(itemPath);
      } else {
        const relativePath = path.relative(baseDir, itemPath);
        files.push({
          name: item,
          path: relativePath,
          fullPath: itemPath,
          size: stat.size,
          sizeFormatted: formatSize(stat.size),
          extension: path.extname(item),
          directory: path.dirname(relativePath),
        });
      }
    }
  }
  
  scan(dir);
  return files;
}

/**
 * 分析 JavaScript 文件
 */
function analyzeJavaScriptFiles(files) {
  const jsFiles = files.filter(file => 
    file.extension === '.js' || file.extension === '.mjs'
  );
  
  const analysis = {
    totalFiles: jsFiles.length,
    totalSize: jsFiles.reduce((sum, file) => sum + file.size, 0),
    files: jsFiles.map(file => ({
      ...file,
      isLarge: file.size > 500 * 1024, // 500KB
      isVeryLarge: file.size > 1024 * 1024, // 1MB
    })),
  };
  
  analysis.totalSizeFormatted = formatSize(analysis.totalSize);
  analysis.largeFiles = analysis.files.filter(file => file.isLarge);
  analysis.veryLargeFiles = analysis.files.filter(file => file.isVeryLarge);
  
  return analysis;
}

/**
 * 分析資源文件
 */
function analyzeAssetFiles(files) {
  const assetFiles = files.filter(file => 
    ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(file.extension) ||
    ['.mp3', '.wav', '.ogg', '.m4a'].includes(file.extension) ||
    ['.woff', '.woff2', '.ttf', '.eot'].includes(file.extension)
  );
  
  const analysis = {
    totalFiles: assetFiles.length,
    totalSize: assetFiles.reduce((sum, file) => sum + file.size, 0),
    files: assetFiles,
    byType: {},
  };
  
  // 按類型分組
  assetFiles.forEach(file => {
    const type = file.extension.substring(1); // 移除點
    if (!analysis.byType[type]) {
      analysis.byType[type] = {
        count: 0,
        totalSize: 0,
        files: [],
      };
    }
    
    analysis.byType[type].count++;
    analysis.byType[type].totalSize += file.size;
    analysis.byType[type].files.push(file);
  });
  
  // 格式化大小
  Object.keys(analysis.byType).forEach(type => {
    analysis.byType[type].totalSizeFormatted = formatSize(analysis.byType[type].totalSize);
  });
  
  analysis.totalSizeFormatted = formatSize(analysis.totalSize);
  
  return analysis;
}

/**
 * 生成優化建議
 */
function generateOptimizationSuggestions(jsAnalysis, assetAnalysis) {
  const suggestions = [];
  
  // JavaScript 優化建議
  if (jsAnalysis.veryLargeFiles.length > 0) {
    suggestions.push({
      type: 'critical',
      category: 'JavaScript',
      title: '發現超大 JavaScript 文件',
      description: `有 ${jsAnalysis.veryLargeFiles.length} 個文件超過 1MB`,
      files: jsAnalysis.veryLargeFiles.map(f => f.name),
      recommendations: [
        '考慮使用動態導入 (dynamic import) 進行代碼分割',
        '檢查是否包含了不必要的依賴',
        '使用 Tree Shaking 移除未使用的代碼',
        '考慮使用 Webpack Bundle Analyzer 進行詳細分析',
      ],
    });
  }
  
  if (jsAnalysis.largeFiles.length > 0) {
    suggestions.push({
      type: 'warning',
      category: 'JavaScript',
      title: '發現大型 JavaScript 文件',
      description: `有 ${jsAnalysis.largeFiles.length} 個文件超過 500KB`,
      files: jsAnalysis.largeFiles.map(f => f.name),
      recommendations: [
        '考慮代碼分割以改善載入性能',
        '檢查是否可以延遲載入某些功能',
        '優化第三方庫的使用',
      ],
    });
  }
  
  // 資源文件優化建議
  const largeAssets = assetAnalysis.files.filter(file => file.size > 100 * 1024); // 100KB
  if (largeAssets.length > 0) {
    suggestions.push({
      type: 'info',
      category: 'Assets',
      title: '發現大型資源文件',
      description: `有 ${largeAssets.length} 個資源文件超過 100KB`,
      files: largeAssets.map(f => f.name),
      recommendations: [
        '考慮壓縮圖片文件',
        '使用現代圖片格式 (WebP, AVIF)',
        '實施懶加載 (lazy loading)',
        '考慮使用 CDN 託管大型資源',
      ],
    });
  }
  
  // 總體大小建議
  const totalSize = jsAnalysis.totalSize + assetAnalysis.totalSize;
  if (totalSize > 5 * 1024 * 1024) { // 5MB
    suggestions.push({
      type: 'critical',
      category: 'Overall',
      title: '總體文件大小過大',
      description: `總大小為 ${formatSize(totalSize)}，可能影響載入性能`,
      recommendations: [
        '實施代碼分割策略',
        '優化資源文件',
        '考慮服務端渲染 (SSR)',
        '實施漸進式載入',
      ],
    });
  }
  
  return suggestions;
}

/**
 * 主要分析函數
 */
function analyzeBuild() {
  console.log('📊 開始 Bundle 分析...');
  
  if (!fs.existsSync(CONFIG.distDir)) {
    console.error('❌ dist 目錄不存在，請先執行構建');
    process.exit(1);
  }
  
  // 掃描所有文件
  const allFiles = scanDirectory(CONFIG.distDir);
  console.log(`📁 發現 ${allFiles.length} 個文件`);
  
  // 分析 JavaScript 文件
  const jsAnalysis = analyzeJavaScriptFiles(allFiles);
  console.log(`🟨 JavaScript: ${jsAnalysis.totalFiles} 個文件，總大小 ${jsAnalysis.totalSizeFormatted}`);
  
  // 分析資源文件
  const assetAnalysis = analyzeAssetFiles(allFiles);
  console.log(`🖼️  資源文件: ${assetAnalysis.totalFiles} 個文件，總大小 ${assetAnalysis.totalSizeFormatted}`);
  
  // 生成優化建議
  const suggestions = generateOptimizationSuggestions(jsAnalysis, assetAnalysis);
  
  // 創建完整分析報告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: allFiles.length,
      totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
      totalSizeFormatted: formatSize(allFiles.reduce((sum, file) => sum + file.size, 0)),
    },
    javascript: jsAnalysis,
    assets: assetAnalysis,
    suggestions,
    allFiles,
  };
  
  // 保存分析報告
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
  console.log(`📄 分析報告已保存到: ${CONFIG.outputFile}`);
  
  // 顯示摘要
  console.log('\n📋 分析摘要:');
  console.log(`   總文件數: ${report.summary.totalFiles}`);
  console.log(`   總大小: ${report.summary.totalSizeFormatted}`);
  
  if (suggestions.length > 0) {
    console.log('\n💡 優化建議:');
    suggestions.forEach((suggestion, index) => {
      const icon = suggestion.type === 'critical' ? '🔴' : 
                   suggestion.type === 'warning' ? '🟡' : '🔵';
      console.log(`   ${icon} ${suggestion.title}`);
      console.log(`      ${suggestion.description}`);
    });
    console.log(`\n   詳細建議請查看: ${CONFIG.outputFile}`);
  } else {
    console.log('\n✅ 沒有發現需要優化的問題');
  }
  
  return report;
}

// 執行分析
const isMainModule = process.argv[1] && process.argv[1].endsWith('analyze-bundle.js');
if (isMainModule) {
  try {
    analyzeBuild();
  } catch (error) {
    console.error('❌ 分析失敗:', error.message);
    process.exit(1);
  }
}

export { analyzeBuild };
