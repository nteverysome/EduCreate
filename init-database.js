const { exec } = require('child_process');
const fs = require('fs');

console.log('🗄️  EduCreate 數據庫初始化腳本');
console.log('================================');

// 檢查PostgreSQL連接
function checkPostgreSQL() {
  console.log('\n📋 步驟 1: 檢查PostgreSQL連接...');
  
  return new Promise((resolve) => {
    exec('psql --version', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  PostgreSQL命令行工具未找到');
        console.log('💡 請確保PostgreSQL已安裝並添加到PATH');
        console.log('   下載地址: https://www.postgresql.org/download/');
      } else {
        console.log('✅ PostgreSQL已安裝:', stdout.trim());
      }
      resolve();
    });
  });
}

// 創建數據庫（如果不存在）
function createDatabase() {
  console.log('\n📋 步驟 2: 創建數據庫...');
  
  return new Promise((resolve) => {
    // 嘗試連接並創建數據庫
    const createDbCommand = 'psql -U postgres -c "CREATE DATABASE educreate;"';
    
    exec(createDbCommand, (error, stdout, stderr) => {
      if (error) {
        if (error.message.includes('already exists')) {
          console.log('✅ 數據庫已存在');
        } else {
          console.log('⚠️  無法創建數據庫，可能需要手動創建');
          console.log('錯誤:', error.message);
          console.log('\n💡 手動創建數據庫步驟:');
          console.log('1. 打開PostgreSQL命令行或pgAdmin');
          console.log('2. 連接到PostgreSQL服務器');
          console.log('3. 執行: CREATE DATABASE educreate;');
        }
      } else {
        console.log('✅ 數據庫創建成功');
      }
      resolve();
    });
  });
}

// 生成Prisma客戶端
function generatePrisma() {
  console.log('\n📋 步驟 3: 生成Prisma客戶端...');
  
  return new Promise((resolve) => {
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Prisma客戶端生成失敗');
        console.log('錯誤:', error.message);
      } else {
        console.log('✅ Prisma客戶端生成成功');
      }
      resolve();
    });
  });
}

// 推送數據庫架構
function pushSchema() {
  console.log('\n📋 步驟 4: 推送數據庫架構...');
  
  return new Promise((resolve) => {
    exec('npx prisma db push --accept-data-loss', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 數據庫架構推送失敗');
        console.log('錯誤:', error.message);
        console.log('\n💡 可能的解決方案:');
        console.log('1. 確保PostgreSQL服務正在運行');
        console.log('2. 檢查.env.local中的DATABASE_URL配置');
        console.log('3. 確認數據庫用戶權限');
      } else {
        console.log('✅ 數據庫架構推送成功');
        console.log(stdout);
      }
      resolve();
    });
  });
}

// 創建測試用戶
function createTestUser() {
  console.log('\n📋 步驟 5: 創建測試用戶...');
  
  const testUserScript = `
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      },
    });
    
    console.log('✅ 測試用戶創建成功:', user.email);
  } catch (error) {
    console.log('⚠️  測試用戶創建失敗:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
`;
  
  fs.writeFileSync('create-test-user.js', testUserScript);
  
  return new Promise((resolve) => {
    exec('node create-test-user.js', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  測試用戶創建失敗:', error.message);
      } else {
        console.log(stdout);
      }
      
      // 清理臨時文件
      try {
        fs.unlinkSync('create-test-user.js');
      } catch (e) {}
      
      resolve();
    });
  });
}

// 主函數
async function main() {
  try {
    await checkPostgreSQL();
    await createDatabase();
    await generatePrisma();
    await pushSchema();
    await createTestUser();
    
    console.log('\n🎉 數據庫初始化完成！');
    console.log('================================');
    console.log('\n📝 測試信息:');
    console.log('測試用戶郵箱: test@example.com');
    console.log('測試用戶密碼: testpassword123');
    console.log('\n📝 下一步:');
    console.log('1. 運行: npm run dev');
    console.log('2. 訪問: http://localhost:3000/register');
    console.log('3. 測試註冊新用戶');
    console.log('4. 或使用測試用戶登入');
    
  } catch (error) {
    console.error('❌ 初始化過程中出現錯誤:', error);
  }
}

main();