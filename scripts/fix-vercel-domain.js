#!/usr/bin/env node

/**
 * 修復 Vercel 環境變數中的域名配置
 * 將 NEXTAUTH_URL 更新為正確的域名
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修復 Vercel 域名配置...');

// 讀取環境配置
const configPath = path.join(__dirname, '..', 'vercel-env-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📋 當前配置：');
console.log(JSON.stringify(config, null, 2));

// 確認域名已更新
if (config.NEXTAUTH_URL === 'https://edu-create.vercel.app') {
  console.log('✅ 域名配置正確！');
} else {
  console.log('❌ 域名配置需要更新');
}

console.log('\n🎯 下一步操作：');
console.log('1. 在 Vercel Dashboard 中設定環境變數：');
console.log('   NEXTAUTH_URL = https://edu-create.vercel.app');
console.log('2. 重新部署應用');
console.log('3. 測試新的驗證郵件');

console.log('\n📧 臨時解決方案：');
console.log('手動修改驗證連結中的域名：');
console.log('將：edu-create-hjhmrxr9h-minamisums-projects.vercel.app');
console.log('改為：edu-create.vercel.app');
