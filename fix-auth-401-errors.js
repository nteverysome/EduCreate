#!/usr/bin/env node

/**
 * 修復 401 認證錯誤的綜合腳本
 * 解決 API 認證中間件和測試令牌相關問題
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 開始修復 401 認證錯誤...');

// 1. 檢查環境變量
function checkEnvironmentVariables() {
  console.log('\n📋 檢查環境變量...');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env 文件不存在，從 .env.example 複製...');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ 已創建 .env 文件');
    } else {
      console.log('❌ .env.example 文件也不存在，請手動創建 .env 文件');
      return false;
    }
  }
  
  // 檢查必要的環境變量
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName + '=') || envContent.includes(varName + '=\n')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('⚠️  缺少以下環境變量:', missingVars.join(', '));
    
    // 自動添加缺少的環境變量
    let updatedContent = envContent;
    if (missingVars.includes('NEXTAUTH_SECRET')) {
      const secret = require('crypto').randomBytes(32).toString('hex');
      updatedContent += `\nNEXTAUTH_SECRET=${secret}`;
    }
    if (missingVars.includes('NEXTAUTH_URL')) {
      updatedContent += `\nNEXTAUTH_URL=http://localhost:3000`;
    }
    if (missingVars.includes('DATABASE_URL')) {
      updatedContent += `\nDATABASE_URL="file:./dev.db"`;
    }
    
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ 已自動添加缺少的環境變量');
  }
  
  console.log('✅ 環境變量檢查完成');
  return true;
}

// 2. 檢查並修復數據庫
function fixDatabase() {
  console.log('\n🗄️  檢查數據庫...');
  
  try {
    // 檢查 Prisma 是否已安裝
    execSync('npx prisma --version', { stdio: 'pipe' });
    
    // 生成 Prisma 客戶端
    console.log('📦 生成 Prisma 客戶端...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 推送數據庫架構
    console.log('🔄 推送數據庫架構...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    // 運行種子數據
    console.log('🌱 運行種子數據...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
    } catch (seedError) {
      console.log('⚠️  種子數據運行失敗，這可能是正常的');
    }
    
    console.log('✅ 數據庫設置完成');
    return true;
  } catch (error) {
    console.log('❌ 數據庫設置失敗:', error.message);
    return false;
  }
}

// 3. 檢查認證配置
function checkAuthConfiguration() {
  console.log('\n🔐 檢查認證配置...');
  
  const authConfigPath = path.join(process.cwd(), 'lib', 'auth.ts');
  const testTokenPath = path.join(process.cwd(), 'pages', 'api', 'auth', 'test-token.ts');
  const withTestAuthPath = path.join(process.cwd(), 'middleware', 'withTestAuth.ts');
  
  const requiredFiles = [
    { path: authConfigPath, name: 'lib/auth.ts' },
    { path: testTokenPath, name: 'pages/api/auth/test-token.ts' },
    { path: withTestAuthPath, name: 'middleware/withTestAuth.ts' }
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`✅ ${file.name} 存在`);
    } else {
      console.log(`❌ ${file.name} 不存在`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// 4. 測試 API 端點
function testApiEndpoints() {
  console.log('\n🧪 測試 API 端點...');
  
  const testEndpoints = [
    '/api/auth/test-token',
    '/api/search',
    '/api/search/advanced'
  ];
  
  console.log('ℹ️  API 端點測試需要在服務器運行時進行');
  console.log('請運行以下命令啟動服務器後測試:');
  console.log('npm run dev');
  console.log('\n然後在瀏覽器中訪問:');
  testEndpoints.forEach(endpoint => {
    console.log(`  http://localhost:3000${endpoint}`);
  });
}

// 5. 清理緩存
function clearCache() {
  console.log('\n🧹 清理緩存...');
  
  const cacheDirs = [
    '.next',
    'node_modules/.cache'
  ];
  
  cacheDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ 已清理 ${dir}`);
      } catch (error) {
        console.log(`⚠️  清理 ${dir} 失敗:`, error.message);
      }
    }
  });
}

// 主函數
function main() {
  console.log('🚀 EduCreate 401 認證錯誤修復工具');
  console.log('=====================================\n');
  
  let success = true;
  
  // 執行修復步驟
  success &= checkEnvironmentVariables();
  success &= fixDatabase();
  success &= checkAuthConfiguration();
  
  clearCache();
  testApiEndpoints();
  
  console.log('\n=====================================');
  if (success) {
    console.log('✅ 修復完成！請重新啟動開發服務器:');
    console.log('npm run dev');
  } else {
    console.log('⚠️  修復過程中遇到一些問題，請檢查上述錯誤信息');
  }
  
  console.log('\n📚 如果問題仍然存在，請查看:');
  console.log('- ERROR-FIX-README.md');
  console.log('- REGISTER-FIX-README.md');
}

// 運行主函數
if (require.main === module) {
  main();
}

module.exports = { main };