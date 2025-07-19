const fs = require('fs');
const path = require('path');

/**
 * 生成完整的檔案路徑報告
 * 包含所有測試影片的詳細路徑信息
 */
async function generateFilePathReport() {
  console.log('📁 生成檔案路徑報告...');
  
  const baseDir = __dirname;
  const testResultsDir = path.join(baseDir, 'test-results');
  const videoManagementDir = path.join(baseDir, 'EduCreate-Test-Videos');
  
  // 搜索所有相關的影片文件
  const videoFiles = [];
  
  // 1. 搜索 test-results 目錄
  if (fs.existsSync(testResultsDir)) {
    const testFiles = fs.readdirSync(testResultsDir).filter(f => f.endsWith('.webm'));
    testFiles.forEach(file => {
      const filePath = path.join(testResultsDir, file);
      const stats = fs.statSync(filePath);
      videoFiles.push({
        category: 'test-results',
        fileName: file,
        relativePath: `test-results/${file}`,
        absolutePath: path.resolve(filePath),
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size),
        lastModified: stats.mtime.toISOString(),
        exists: true
      });
    });
  }
  
  // 2. 搜索 EduCreate-Test-Videos 目錄
  if (fs.existsSync(videoManagementDir)) {
    searchVideoFiles(videoManagementDir, videoFiles, 'EduCreate-Test-Videos');
  }
  
  // 3. 按日期和功能分組
  const groupedFiles = groupFilesByDateAndFunction(videoFiles);
  
  // 4. 生成報告
  const report = {
    timestamp: new Date().toISOString(),
    baseDirectory: path.resolve(baseDir),
    totalFiles: videoFiles.length,
    totalSize: videoFiles.reduce((sum, file) => sum + file.size, 0),
    totalSizeFormatted: formatFileSize(videoFiles.reduce((sum, file) => sum + file.size, 0)),
    directories: {
      testResults: path.resolve(testResultsDir),
      videoManagement: path.resolve(videoManagementDir)
    },
    groupedFiles: groupedFiles,
    allFiles: videoFiles
  };
  
  // 5. 保存報告
  const reportPath = path.join(testResultsDir, 'file-path-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 6. 顯示報告
  displayReport(report);
  
  return report;
}

function searchVideoFiles(dir, videoFiles, category, relativePath = '') {
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      const currentRelativePath = relativePath ? `${relativePath}/${item}` : item;
      
      if (stats.isDirectory()) {
        searchVideoFiles(itemPath, videoFiles, category, currentRelativePath);
      } else if (item.endsWith('.webm')) {
        videoFiles.push({
          category: category,
          fileName: item,
          relativePath: currentRelativePath,
          absolutePath: path.resolve(itemPath),
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          lastModified: stats.mtime.toISOString(),
          exists: true
        });
      }
    });
  } catch (error) {
    console.warn(`⚠️ 無法讀取目錄: ${dir} - ${error.message}`);
  }
}

function groupFilesByDateAndFunction(videoFiles) {
  const groups = {};
  
  videoFiles.forEach(file => {
    // 解析檔案名稱
    const match = file.fileName.match(/^(\d{8})_([^_]+)_([^_]+)_([^_]+)_([^_]+)_(\d+)\.webm$/);
    if (match) {
      const [, date, module, feature, result, version, sequence] = match;
      const groupKey = `${date}_${module}_${feature}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          date: date,
          module: module,
          feature: feature,
          files: []
        };
      }
      
      groups[groupKey].files.push({
        ...file,
        parsedInfo: {
          date: date,
          module: module,
          feature: feature,
          result: result,
          version: version,
          sequence: sequence
        }
      });
    } else {
      // 未匹配的檔案
      if (!groups['unmatched']) {
        groups['unmatched'] = {
          date: 'unknown',
          module: 'unknown',
          feature: 'unknown',
          files: []
        };
      }
      groups['unmatched'].files.push(file);
    }
  });
  
  return groups;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function displayReport(report) {
  console.log('\n📊 檔案路徑報告');
  console.log('='.repeat(80));
  
  console.log(`\n📁 基本信息:`);
  console.log(`   基礎目錄: ${report.baseDirectory}`);
  console.log(`   總檔案數: ${report.totalFiles}`);
  console.log(`   總大小: ${report.totalSizeFormatted}`);
  console.log(`   生成時間: ${report.timestamp}`);
  
  console.log(`\n📂 目錄結構:`);
  console.log(`   測試結果目錄: ${report.directories.testResults}`);
  console.log(`   影片管理目錄: ${report.directories.videoManagement}`);
  
  console.log(`\n🎬 深度測試影片證據 - 完整檔案路徑:`);
  console.log('-'.repeat(80));
  
  // 顯示今天的深度測試影片
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const todayFiles = report.allFiles.filter(file => 
    file.fileName.includes(today) && 
    file.fileName.includes('deep-test')
  ).sort((a, b) => a.fileName.localeCompare(b.fileName));
  
  if (todayFiles.length > 0) {
    todayFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.fileName} (${file.sizeFormatted})`);
      console.log(`   📁 完整路徑: ${file.absolutePath}`);
      console.log(`   📂 相對路徑: ${file.relativePath}`);
      console.log(`   📅 修改時間: ${new Date(file.lastModified).toLocaleString('zh-TW')}`);
      console.log(`   ✅ 檔案存在: ${file.exists ? '是' : '否'}`);
      console.log('');
    });
  } else {
    console.log('   ⚠️ 未找到今天的深度測試影片');
  }
  
  console.log(`\n📊 按功能分組:`);
  console.log('-'.repeat(80));
  
  Object.entries(report.groupedFiles).forEach(([groupKey, group]) => {
    if (group.files.length > 0 && groupKey !== 'unmatched') {
      console.log(`\n🎯 ${group.feature} (${group.module})`);
      group.files.forEach(file => {
        console.log(`   📁 ${file.absolutePath}`);
        console.log(`   📊 ${file.sizeFormatted} | ${new Date(file.lastModified).toLocaleString('zh-TW')}`);
      });
    }
  });
  
  console.log(`\n📋 報告已保存至: ${path.resolve(path.join(__dirname, 'test-results', 'file-path-report.json'))}`);
}

// 如果直接執行此腳本
if (require.main === module) {
  generateFilePathReport().catch(console.error);
}

module.exports = { generateFilePathReport };
