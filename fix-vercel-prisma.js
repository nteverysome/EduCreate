// 修復 Vercel Prisma 構建問題的腳本
const fs = require('fs');
const path = require('path');

console.log('🔧 開始修復 Vercel Prisma 構建問題...');

// 1. 檢查 package.json 中的構建腳本
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📍 步驟 1: 檢查當前構建腳本');
console.log(`當前 build 腳本: ${packageJson.scripts.build}`);

// 2. 更新構建腳本以包含 Prisma 生成
const newBuildScript = 'prisma generate && next build';

if (packageJson.scripts.build !== newBuildScript) {
  console.log('📍 步驟 2: 更新構建腳本');
  packageJson.scripts.build = newBuildScript;
  
  // 添加 postinstall 腳本確保 Prisma 客戶端在安裝後生成
  packageJson.scripts.postinstall = 'prisma generate';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ 已更新 package.json 構建腳本');
  console.log(`新的 build 腳本: ${newBuildScript}`);
  console.log('✅ 已添加 postinstall 腳本: prisma generate');
} else {
  console.log('✅ 構建腳本已經正確');
}

// 3. 檢查 Prisma schema 文件
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Prisma schema 文件存在');
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // 檢查是否有正確的 generator 配置
  if (schemaContent.includes('generator client')) {
    console.log('✅ Prisma client generator 配置正確');
  } else {
    console.log('❌ Prisma client generator 配置缺失');
  }
  
  // 檢查數據源配置
  if (schemaContent.includes('datasource db')) {
    console.log('✅ 數據源配置存在');
  } else {
    console.log('❌ 數據源配置缺失');
  }
} else {
  console.log('❌ Prisma schema 文件不存在');
}

// 4. 檢查環境變數
console.log('📍 步驟 3: 檢查環境變數配置');
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local 文件存在');
} else if (fs.existsSync(envExamplePath)) {
  console.log('⚠️ 只有 .env.example 存在，缺少 .env.local');
} else {
  console.log('❌ 環境變數文件不存在');
}

// 5. 創建 Vercel 構建配置
console.log('📍 步驟 4: 創建 Vercel 構建配置');

const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
let vercelConfig = {};

if (fs.existsSync(vercelJsonPath)) {
  vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  console.log('✅ 現有 vercel.json 已載入');
} else {
  console.log('📝 創建新的 vercel.json');
}

// 確保有正確的構建配置
vercelConfig.buildCommand = 'prisma generate && next build';
vercelConfig.installCommand = 'npm install && prisma generate';

// 確保有正確的環境變數配置
if (!vercelConfig.env) {
  vercelConfig.env = {};
}

// 添加 Prisma 相關的環境變數提醒
vercelConfig.env.SKIP_ENV_VALIDATION = 'true';

fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
console.log('✅ 已更新 vercel.json 配置');

// 6. 創建 Prisma 生成腳本
console.log('📍 步驟 5: 創建 Prisma 生成腳本');

const prismaGenerateScript = `#!/bin/bash
echo "🔧 生成 Prisma 客戶端..."
npx prisma generate
echo "✅ Prisma 客戶端生成完成"
`;

const scriptsDir = path.join(process.cwd(), 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

const generateScriptPath = path.join(scriptsDir, 'generate-prisma.sh');
fs.writeFileSync(generateScriptPath, prismaGenerateScript);
console.log('✅ 已創建 Prisma 生成腳本');

console.log('\n🎯 修復完成！主要更改：');
console.log('1. ✅ 更新 package.json build 腳本包含 prisma generate');
console.log('2. ✅ 添加 postinstall 腳本確保 Prisma 客戶端生成');
console.log('3. ✅ 更新 vercel.json 配置');
console.log('4. ✅ 創建 Prisma 生成腳本');

console.log('\n📋 下一步：');
console.log('1. 提交這些更改到 Git');
console.log('2. 推送到 shimozurdo-default-minimal 分支');
console.log('3. 觸發新的 Vercel 部署');

console.log('\n🚀 預期結果：');
console.log('- Prisma 客戶端應該能在 Vercel 構建時正確生成');
console.log('- 構建過程應該成功完成');
console.log('- shimozurdo-game 應該能正常部署');
