#!/usr/bin/env node

/**
 * 檢查 Vercel 部署所需的環境變數
 */

console.log('🔍 檢查 EduCreate 環境變數...\n');

const requiredVars = [
  {
    name: 'NEXTAUTH_URL',
    description: 'NextAuth 基礎 URL (必須是 Vercel 網址)',
    required: true,
    example: 'https://your-app.vercel.app'
  },
  {
    name: 'NEXTAUTH_SECRET',
    description: 'NextAuth 密鑰 (32+ 字符隨機字串)',
    required: true,
    example: 'Zx8K9mN2pQ7rS4tU6vW8xY1zA3bC5dE7fG9hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA'
  },
  {
    name: 'DATABASE_URL',
    description: 'Neon PostgreSQL 連接字串',
    required: true,
    example: 'postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require'
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth 客戶端 ID',
    required: false,
    example: 'xxx.apps.googleusercontent.com'
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth 客戶端密鑰',
    required: false,
    example: 'GOCSPX-xxx'
  },
  {
    name: 'GITHUB_ID',
    description: 'GitHub OAuth 應用 ID',
    required: false,
    example: 'Iv1.xxx'
  },
  {
    name: 'GITHUB_SECRET',
    description: 'GitHub OAuth 應用密鑰',
    required: false,
    example: 'xxx'
  }
];

let hasErrors = false;
let hasWarnings = false;

console.log('📋 環境變數檢查結果:\n');

requiredVars.forEach(variable => {
  const value = process.env[variable.name];
  const hasValue = !!value;
  const isValid = hasValue && value.length > 0;
  
  if (variable.required) {
    if (!isValid) {
      console.log(`❌ ${variable.name}: 缺少 (必需)`);
      console.log(`   描述: ${variable.description}`);
      console.log(`   範例: ${variable.example}\n`);
      hasErrors = true;
    } else {
      // 檢查特定格式
      if (variable.name === 'NEXTAUTH_SECRET' && value.length < 32) {
        console.log(`⚠️  ${variable.name}: 太短 (建議 32+ 字符)`);
        console.log(`   當前長度: ${value.length} 字符\n`);
        hasWarnings = true;
      } else if (variable.name === 'NEXTAUTH_URL' && value.includes('localhost')) {
        console.log(`⚠️  ${variable.name}: 使用 localhost (應該是 Vercel 網址)`);
        console.log(`   當前值: ${value}\n`);
        hasWarnings = true;
      } else if (variable.name === 'DATABASE_URL' && !value.includes('neon.tech')) {
        console.log(`⚠️  ${variable.name}: 可能不是 Neon 資料庫`);
        console.log(`   當前值: ${value.substring(0, 50)}...\n`);
        hasWarnings = true;
      } else {
        console.log(`✅ ${variable.name}: 已設定`);
        if (variable.name === 'NEXTAUTH_SECRET') {
          console.log(`   長度: ${value.length} 字符`);
        } else if (variable.name === 'NEXTAUTH_URL') {
          console.log(`   值: ${value}`);
        } else if (variable.name === 'DATABASE_URL') {
          console.log(`   主機: ${value.split('@')[1]?.split('/')[0] || '未知'}`);
        }
        console.log();
      }
    }
  } else {
    if (isValid) {
      console.log(`✅ ${variable.name}: 已設定 (可選)`);
    } else {
      console.log(`⚪ ${variable.name}: 未設定 (可選)`);
      console.log(`   描述: ${variable.description}`);
    }
    console.log();
  }
});

console.log('📊 檢查總結:');

if (hasErrors) {
  console.log('❌ 發現必需的環境變數缺失！');
  console.log('   請在 Vercel Dashboard → Settings → Environment Variables 中設定');
  console.log('   設定完成後重新部署專案');
} else {
  console.log('✅ 所有必需的環境變數都已設定');
}

if (hasWarnings) {
  console.log('⚠️  發現一些建議修正的設定');
  console.log('   建議檢查並更新相關變數');
}

if (!hasErrors && !hasWarnings) {
  console.log('🎉 環境變數配置完美！');
}

console.log('\n🔗 相關連結:');
console.log('   Vercel 環境變數設定: https://vercel.com/docs/concepts/projects/environment-variables');
console.log('   Neon 資料庫控制台: https://console.neon.tech/app/projects/dry-cloud-00816876/branches');
console.log('   NextAuth 密鑰生成器: https://generate-secret.vercel.app/32');

process.exit(hasErrors ? 1 : 0);