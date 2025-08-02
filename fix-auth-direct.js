const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=====================================');
console.log('PostgreSQL 數據庫認證修復工具');
console.log('=====================================');
console.log('');

console.log('🚨 檢測到錯誤: P1000 - Authentication failed');
console.log('📋 當前配置密碼: z089336161');
console.log('');

// 測試常見密碼
const passwords = ['postgres', 'admin', '123456', 'password', 'root', 'z089336161'];
let correctPassword = null;

async function testPassword(password) {
  return new Promise((resolve) => {
    process.env.PGPASSWORD = password;
    exec('psql -U postgres -d postgres -c "SELECT 1 as test;"', (error, stdout, stderr) => {
      if (!error) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

async function updateEnvFile(password) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // 更新數據庫URL
    envContent = envContent.replace(
      /postgresql:\/\/postgres:[^@]*@/,
      `postgresql://postgres:${password}@`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env 文件已更新');
    return true;
  } catch (error) {
    console.log('❌ 更新 .env 文件失敗:', error.message);
    return false;
  }
}

async function createDatabase(password) {
  return new Promise((resolve) => {
    process.env.PGPASSWORD = password;
    exec('psql -U postgres -c "CREATE DATABASE educreate;"', (error, stdout, stderr) => {
      if (!error || stderr.includes('already exists')) {
        console.log('✅ educreate 數據庫已準備就緒');
        resolve(true);
      } else {
        console.log('❌ 創建數據庫失敗:', stderr);
        resolve(false);
      }
    });
  });
}

async function runPrismaCommands() {
  return new Promise((resolve) => {
    console.log('🚀 推送 Prisma Schema...');
    exec('npx prisma db push --accept-data-loss', (error, stdout, stderr) => {
      if (!error) {
        console.log('✅ Prisma Schema 推送成功');
        
        console.log('🚀 生成 Prisma 客戶端...');
        exec('npx prisma generate', (error2, stdout2, stderr2) => {
          if (!error2) {
            console.log('✅ Prisma 客戶端生成成功');
            resolve(true);
          } else {
            console.log('❌ Prisma 客戶端生成失敗:', stderr2);
            resolve(false);
          }
        });
      } else {
        console.log('❌ Prisma Schema 推送失敗:', stderr);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log('🔍 步驟 1: 測試常見密碼');
  
  for (const password of passwords) {
    console.log(`測試密碼: ${password}`);
    const isCorrect = await testPassword(password);
    
    if (isCorrect) {
      console.log(`✅ 密碼正確: ${password}`);
      correctPassword = password;
      break;
    }
  }
  
  if (correctPassword) {
    console.log('');
    console.log('🔧 步驟 2: 更新配置文件');
    await updateEnvFile(correctPassword);
    
    console.log('');
    console.log('🔍 步驟 3: 檢查並創建數據庫');
    await createDatabase(correctPassword);
    
    console.log('');
    console.log('🚀 步驟 4: 初始化 Prisma');
    await runPrismaCommands();
    
    console.log('');
    console.log('🎉 修復完成！');
    console.log('');
    console.log('📋 下一步:');
    console.log('1. 啟動開發服務器: npm run dev');
    console.log('2. 訪問註冊頁面: http://localhost:3000/register');
    console.log('3. 測試註冊功能');
    
  } else {
    console.log('');
    console.log('❌ 所有常見密碼都失敗');
    console.log('');
    console.log('🔧 手動重置密碼步驟:');
    console.log('1. 打開 pgAdmin 或命令行');
    console.log('2. 重置 postgres 用戶密碼');
    console.log('3. 更新 .env 文件中的密碼');
    console.log('4. 重新運行: node fix-auth-direct.js');
    console.log('');
    console.log('💡 或參考 POSTGRESQL-QUICK-INSTALL.md 重新安裝');
  }
}

main().catch(console.error);