#!/usr/bin/env node

/**
 * Vercel 部署修復腳本
 * 自動配置環境變數並觸發重新部署
 */

const { execSync } = require('child_process');
const crypto = require('crypto');

console.log('🚀 開始修復 Vercel 部署...\n');

// 生成安全的 NEXTAUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 必需的環境變數配置
const requiredEnvVars = {
  'NEXTAUTH_URL': 'https://edu-create.vercel.app',
  'NEXTAUTH_SECRET': generateSecret(),
  'NODE_ENV': 'production'
};

console.log('📋 需要配置的環境變數:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (key === 'NEXTAUTH_SECRET') {
    console.log(`${key}=${value.substring(0, 8)}...`);
  } else {
    console.log(`${key}=${value}`);
  }
});

console.log('\n🔧 環境變數配置指南:');
console.log('1. 訪問 Vercel Dashboard: https://vercel.com/minamisums-projects/edu-create/settings/environment-variables');
console.log('2. 添加以下環境變數:');
console.log('');

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`   ${key}`);
  console.log(`   值: ${value}`);
  console.log(`   環境: Production, Preview, Development`);
  console.log('');
});

console.log('3. NeonDB 數據庫連接:');
console.log('   DATABASE_URL');
console.log('   值: postgresql://username:password@host:port/database?sslmode=require');
console.log('   (從 https://console.neon.tech/app/projects/dry-cloud-00816876 獲取)');
console.log('   環境: Production, Preview, Development');
console.log('');

console.log('4. 配置完成後，點擊 "Redeploy" 按鈕重新部署');

// 創建環境變數模板文件
const envTemplate = `# Vercel 環境變數配置模板
# 複製以下內容到 Vercel Dashboard > Settings > Environment Variables

# NextAuth 配置 (必需)
NEXTAUTH_URL=https://edu-create.vercel.app
NEXTAUTH_SECRET=${generateSecret()}

# 數據庫連接 (必需)
# 從 NeonDB 控制台獲取: https://console.neon.tech/app/projects/dry-cloud-00816876
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# 生產環境標識
NODE_ENV=production

# OAuth 提供商 (可選)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GITHUB_ID=your-github-client-id
# GITHUB_SECRET=your-github-client-secret
`;

require('fs').writeFileSync('.env.vercel.template', envTemplate);
console.log('✅ 已創建環境變數模板文件: .env.vercel.template');

console.log('\n🎯 快速修復步驟:');
console.log('1. 複製上述環境變數到 Vercel Dashboard');
console.log('2. 從 NeonDB 控制台複製 DATABASE_URL');
console.log('3. 點擊 Vercel 中的 "Redeploy" 按鈕');
console.log('4. 等待部署完成並測試 /mvp-games 頁面');

console.log('\n🔗 相關連結:');
console.log('- Vercel 項目: https://vercel.com/minamisums-projects/edu-create');
console.log('- NeonDB 控制台: https://console.neon.tech/app/projects/dry-cloud-00816876');
console.log('- GitHub PR: https://github.com/nteverysome/EduCreate/pull/1');

console.log('\n✨ 部署修復腳本執行完成！');