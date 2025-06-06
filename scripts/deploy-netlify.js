#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始 Netlify 部署...');

// 檢查是否已安裝 Netlify CLI
try {
  execSync('netlify --version', { stdio: 'pipe' });
  console.log('✅ Netlify CLI 已安裝');
} catch (error) {
  console.log('📦 安裝 Netlify CLI...');
  execSync('npm install -g netlify-cli', { stdio: 'inherit' });
}

// 確保構建目錄存在
console.log('🔧 檢查構建狀態...');
if (!fs.existsSync('.next')) {
  console.log('🏗️ 執行構建...');
  execSync('npm run build', { stdio: 'inherit' });
} else {
  console.log('✅ 構建目錄已存在');
}

// 檢查 Netlify 配置
if (!fs.existsSync('netlify.toml')) {
  console.error('❌ 找不到 netlify.toml 配置文件');
  process.exit(1);
}

console.log('🌐 準備部署到 Netlify...');
console.log('');
console.log('請按照以下步驟操作：');
console.log('1. 運行: netlify login');
console.log('2. 運行: netlify init');
console.log('3. 運行: netlify deploy --prod');
console.log('');
console.log('或者直接運行: netlify deploy --prod --dir=.next');
console.log('');
console.log('🔧 環境變量設置：');
console.log('在 Netlify Dashboard 中設置以下環境變量：');
console.log('DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require');
console.log('NEXTAUTH_URL=https://your-netlify-url.netlify.app');
console.log('NEXTAUTH_SECRET=your-production-secret-key');
console.log('');
console.log('✅ 準備完成！');