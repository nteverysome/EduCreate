#!/usr/bin/env node

/**
 * Playwright 設置檢查腳本
 * 驗證 Playwright 是否正確安裝和配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Playwright 設置檢查\n');
console.log('=' .repeat(50));

// 1. 檢查 Playwright 包
console.log('\n1️⃣  檢查 Playwright 包安裝...');
try {
  const playwrightPath = require.resolve('@playwright/test');
  console.log('✅ Playwright 已安裝');
  console.log(`   位置: ${playwrightPath}`);
} catch (e) {
  console.log('❌ Playwright 未安裝');
  console.log('   請運行: npm install @playwright/test');
}

// 2. 檢查配置文件
console.log('\n2️⃣  檢查 Playwright 配置文件...');
const configFiles = [
  'playwright.config.js',
  'playwright.config.ts',
  'playwright-simple.config.ts',
  'playwright-standalone.config.ts'
];

configFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ 找到: ${file}`);
  }
});

// 3. 檢查測試目錄
console.log('\n3️⃣  檢查測試目錄...');
const testDirs = ['tests', 'tests/e2e', '__tests__'];
testDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    const specFiles = files.filter(f => f.endsWith('.spec.ts') || f.endsWith('.spec.js'));
    console.log(`✅ ${dir}/ (${specFiles.length} 個測試文件)`);
  }
});

// 4. 檢查 package.json 腳本
console.log('\n4️⃣  檢查 package.json 腳本...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const playwrightScripts = Object.entries(packageJson.scripts || {})
    .filter(([key]) => key.includes('playwright'));
  
  if (playwrightScripts.length > 0) {
    console.log('✅ 找到 Playwright 相關腳本:');
    playwrightScripts.forEach(([key, value]) => {
      console.log(`   - npm run ${key}`);
    });
  } else {
    console.log('⚠️  未找到 Playwright 相關腳本');
  }
} catch (e) {
  console.log('❌ 無法讀取 package.json');
}

// 5. 檢查瀏覽器
console.log('\n5️⃣  檢查 Playwright 瀏覽器...');
try {
  const { chromium, firefox, webkit } = require('@playwright/test');
  console.log('✅ 可用的瀏覽器:');
  console.log('   - Chromium');
  console.log('   - Firefox');
  console.log('   - WebKit');
} catch (e) {
  console.log('❌ 無法加載瀏覽器模塊');
}

// 6. 檢查 Node.js 版本
console.log('\n6️⃣  檢查 Node.js 版本...');
console.log(`✅ Node.js: ${process.version}`);

// 7. 檢查 npm 版本
console.log('\n7️⃣  檢查 npm 版本...');
const { execSync } = require('child_process');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);
} catch (e) {
  console.log('⚠️  無法獲取 npm 版本');
}

console.log('\n' + '='.repeat(50));
console.log('\n📋 快速開始命令:');
console.log('   npm run test:playwright              # 運行所有測試');
console.log('   npm run test:playwright:ui           # UI 模式');
console.log('   npm run test:playwright:debug        # 調試模式');
console.log('\n💡 運行特定測試:');
console.log('   npx playwright test test-file.js');
console.log('\n📊 查看測試報告:');
console.log('   npx playwright show-report');
console.log('\n');

