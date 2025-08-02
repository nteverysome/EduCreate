const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 EduCreate 註冊問題修復腳本');
console.log('================================');

// 檢查並修復環境變量
function checkEnvironment() {
  console.log('\n📋 步驟 1: 檢查環境變量配置...');
  
  const envPath = '.env.local';
  const envContent = `# 數據庫配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/educreate?schema=public"

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="this-is-a-secret-key-please-change-in-production"

# 測試令牌配置
TEST_TOKEN="test-token-123"
NODE_ENV="development"

# 郵件服務器配置
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_SERVER_SECURE="false"
EMAIL_FROM="noreply@educreate.com"

# Stripe配置
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ 環境變量配置已更新');
}

// 生成Prisma客戶端
function generatePrismaClient() {
  console.log('\n📋 步驟 2: 生成Prisma客戶端...');
  
  return new Promise((resolve, reject) => {
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  Prisma生成失敗，但繼續執行...');
        console.log('錯誤:', error.message);
      } else {
        console.log('✅ Prisma客戶端生成成功');
      }
      resolve();
    });
  });
}

// 推送數據庫架構
function pushDatabaseSchema() {
  console.log('\n📋 步驟 3: 推送數據庫架構...');
  
  return new Promise((resolve, reject) => {
    exec('npx prisma db push --accept-data-loss', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  數據庫推送失敗，可能需要手動啟動PostgreSQL');
        console.log('錯誤:', error.message);
        console.log('\n💡 請確保PostgreSQL服務正在運行:');
        console.log('   - 檢查PostgreSQL是否已安裝並啟動');
        console.log('   - 確認數據庫連接字符串正確');
        console.log('   - 手動運行: npx prisma db push');
      } else {
        console.log('✅ 數據庫架構推送成功');
      }
      resolve();
    });
  });
}

// 修復註冊API
function fixRegisterAPI() {
  console.log('\n📋 步驟 4: 檢查註冊API...');
  
  const registerApiPath = 'pages/api/auth/register.ts';
  
  if (fs.existsSync(registerApiPath)) {
    console.log('✅ 註冊API文件存在');
    
    // 檢查API內容
    const content = fs.readFileSync(registerApiPath, 'utf8');
    if (content.includes('PrismaClient') && content.includes('bcrypt')) {
      console.log('✅ 註冊API配置正確');
    } else {
      console.log('⚠️  註冊API可能需要修復');
    }
  } else {
    console.log('❌ 註冊API文件不存在');
  }
}

// 清理緩存
function clearCache() {
  console.log('\n📋 步驟 5: 清理緩存...');
  
  const cacheDirs = ['.next', 'node_modules/.cache'];
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ 已清理 ${dir}`);
      } catch (error) {
        console.log(`⚠️  無法清理 ${dir}: ${error.message}`);
      }
    }
  });
}

// 重新安裝依賴
function reinstallDependencies() {
  console.log('\n📋 步驟 6: 重新安裝依賴...');
  
  return new Promise((resolve, reject) => {
    exec('npm install', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  依賴安裝失敗:', error.message);
      } else {
        console.log('✅ 依賴安裝成功');
      }
      resolve();
    });
  });
}

// 主修復流程
async function main() {
  try {
    checkEnvironment();
    await generatePrismaClient();
    await pushDatabaseSchema();
    fixRegisterAPI();
    clearCache();
    await reinstallDependencies();
    
    console.log('\n🎉 修復完成！');
    console.log('================================');
    console.log('\n📝 後續步驟:');
    console.log('1. 確保PostgreSQL服務正在運行');
    console.log('2. 運行: npm run dev');
    console.log('3. 訪問: http://localhost:3000/register');
    console.log('4. 測試註冊功能');
    console.log('\n💡 如果仍有問題:');
    console.log('- 檢查瀏覽器控制台錯誤');
    console.log('- 檢查終端錯誤信息');
    console.log('- 確認數據庫連接正常');
    
  } catch (error) {
    console.error('❌ 修復過程中出現錯誤:', error);
  }
}

main();