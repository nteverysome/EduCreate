#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始建置 Phaser 3 飛機選擇器...\n');

// 建置步驟
const buildSteps = [
  {
    name: '清理舊建置',
    command: 'npm run clean',
    description: '清除 dist 目錄'
  },
  {
    name: 'TypeScript 類型檢查',
    command: 'npm run type-check',
    description: '檢查 TypeScript 類型錯誤'
  },
  {
    name: 'ESLint 代碼檢查',
    command: 'npm run lint',
    description: '檢查代碼品質和風格'
  },
  {
    name: '執行測試',
    command: 'npm run test',
    description: '運行單元測試'
  },
  {
    name: 'Vite 建置',
    command: 'npm run build',
    description: '建置生產版本'
  }
];

// 執行建置步驟
let currentStep = 0;
const totalSteps = buildSteps.length;

for (const step of buildSteps) {
  currentStep++;
  console.log(`\n📦 步驟 ${currentStep}/${totalSteps}: ${step.name}`);
  console.log(`   ${step.description}`);
  console.log(`   執行: ${step.command}\n`);

  try {
    const startTime = Date.now();
    execSync(step.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    const duration = Date.now() - startTime;
    console.log(`   ✅ 完成 (${duration}ms)\n`);
  } catch (error) {
    console.error(`   ❌ 失敗: ${step.name}`);
    console.error(`   錯誤: ${error.message}\n`);
    process.exit(1);
  }
}

// 建置後檢查
console.log('🔍 檢查建置結果...\n');

const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ 建置失敗：找不到 dist 目錄');
  process.exit(1);
}

// 檢查關鍵檔案
const requiredFiles = [
  'index.html',
  'assets'
];

const missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error('❌ 建置不完整，缺少檔案:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// 計算建置大小
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

const buildSize = getDirectorySize(distPath);
const buildSizeMB = (buildSize / 1024 / 1024).toFixed(2);

console.log('✅ 建置成功完成！\n');
console.log('📊 建置統計:');
console.log(`   📁 輸出目錄: ${distPath}`);
console.log(`   📏 總大小: ${buildSizeMB} MB`);
console.log(`   📄 檔案數量: ${countFiles(distPath)}`);

function countFiles(dirPath) {
  let fileCount = 0;
  
  function count(currentPath) {
    const stats = fs.statSync(currentPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        count(path.join(currentPath, file));
      });
    } else {
      fileCount++;
    }
  }
  
  count(dirPath);
  return fileCount;
}

// 生成建置報告
const buildReport = {
  timestamp: new Date().toISOString(),
  version: require('../package.json').version,
  buildSize: buildSizeMB,
  fileCount: countFiles(distPath),
  steps: buildSteps.map(step => ({
    name: step.name,
    status: 'success'
  }))
};

fs.writeFileSync(
  path.join(distPath, 'build-report.json'),
  JSON.stringify(buildReport, null, 2)
);

console.log('\n🎉 建置流程完成！');
console.log('💡 提示:');
console.log('   - 使用 npm run preview 預覽建置結果');
console.log('   - 使用 npm run serve 啟動生產服務器');
console.log('   - dist/ 目錄包含所有生產檔案\n');
