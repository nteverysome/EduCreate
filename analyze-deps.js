const fs = require('fs');
const path = require('path');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    }
  }
  
  try {
    calculateSize(dirPath);
    return totalSize;
  } catch (error) {
    return 0;
  }
}

console.log('🔍 分析 node_modules 中的大型依賴...\n');

const nodeModulesPath = './node_modules';
const directories = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const sizeData = [];

directories.forEach(dir => {
  const dirPath = path.join(nodeModulesPath, dir);
  const size = getDirectorySize(dirPath);
  const sizeMB = (size / (1024 * 1024)).toFixed(2);
  
  if (sizeMB > 1) { // 只顯示大於 1MB 的依賴
    sizeData.push({
      name: dir,
      sizeMB: parseFloat(sizeMB)
    });
  }
});

// 按大小排序
sizeData.sort((a, b) => b.sizeMB - a.sizeMB);

console.log('📊 大型依賴排行榜 (>1MB):');
console.log('================================');

sizeData.slice(0, 15).forEach((item, index) => {
  const bar = '█'.repeat(Math.min(Math.floor(item.sizeMB / 5), 20));
  console.log(`${(index + 1).toString().padStart(2)}. ${item.name.padEnd(30)} ${item.sizeMB.toString().padStart(8)} MB ${bar}`);
});

const totalSize = sizeData.reduce((sum, item) => sum + item.sizeMB, 0);
console.log('\n================================');
console.log(`📦 總大小: ${totalSize.toFixed(2)} MB`);
console.log(`🎯 Vercel 限制: 250 MB`);
console.log(`⚠️  超出: ${totalSize > 250 ? (totalSize - 250).toFixed(2) : '0'} MB`);

// 建議移除的依賴
console.log('\n🚨 建議優化的大型依賴:');
const suggestions = sizeData.filter(item => item.sizeMB > 10);
suggestions.forEach(item => {
  console.log(`- ${item.name} (${item.sizeMB} MB) - 考慮 CDN 或移除`);
});
