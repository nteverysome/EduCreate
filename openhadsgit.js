const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('🔧 EduCreate 註冊功能修復測試');
console.log('================================');

// 測試數據庫連接
async function testDatabaseConnection() {
  console.log('\n🔍 測試數據庫連接...');
  
  const prisma = new PrismaClient();
  
  try {
    // 測試連接
    await prisma.$connect();
    console.log('✅ 數據庫連接成功');
    
    // 測試查詢
    const userCount = await prisma.user.count();
    console.log(`✅ 用戶表查詢成功，當前用戶數: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 解決方案:');
      console.log('1. 檢查 PostgreSQL 服務是否運行');
      console.log('2. 運行: check-postgresql-simple.bat');
      console.log('3. 如果服務未運行，請啟動 PostgreSQL 服務');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// 測試註冊功能
async function testRegisterFunction() {
  console.log('\n🧪 測試註冊功能...');
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 註冊API測試成功');
      console.log('📋 響應數據:', data);
    } else {
      console.error('❌ 註冊API測試失敗:', {
        status: response.status,
        data
      });
    }
    
  } catch (error) {
    console.error('❌ 註冊API請求失敗:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 解決方案:');
      console.log('1. 確保開發服務器正在運行: npm run dev');
      console.log('2. 檢查端口 3000 是否被占用');
    }
  }
}

// 主測試函數
async function runTests() {
  try {
    const dbConnected = await testDatabaseConnection();
    
    if (dbConnected) {
      console.log('\n⏳ 等待 3 秒後測試註冊API...');
      setTimeout(async () => {
        await testRegisterFunction();
      }, 3000);
    } else {
      console.log('\n⚠️ 數據庫連接失敗，跳過註冊API測試');
      console.log('\n🔧 修復步驟:');
      console.log('1. 運行 check-postgresql-simple.bat 檢查PostgreSQL狀態');
      console.log('2. 如果PostgreSQL未安裝，運行 install-postgresql-auto.ps1');
      console.log('3. 確保 .env 文件中的 DATABASE_URL 配置正確');
      console.log('4. 重新運行此測試腳本');
    }
  } catch (error) {
    console.error('❌ 測試過程中出現錯誤:', error);
  }
}

// 運行測試
runTests();