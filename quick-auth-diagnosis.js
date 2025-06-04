const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function diagnoseAuth() {
  console.log('🔍 開始 NextAuth 診斷...');
  console.log('=' .repeat(50));
  
  try {
    // 1. 測試資料庫連接
    console.log('\n1. 測試資料庫連接...');
    await prisma.$connect();
    console.log('✅ 資料庫連接成功');
    
    // 2. 檢查用戶表
    console.log('\n2. 檢查用戶表...');
    const userCount = await prisma.user.count();
    console.log(`📊 用戶總數: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  沒有用戶，需要運行 seed');
      console.log('請執行: npx prisma db seed');
      return;
    }
    
    // 3. 列出所有用戶
    console.log('\n3. 現有用戶列表:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        password: true // 檢查是否有密碼
      }
    });
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   角色: ${user.role}`);
      console.log(`   有密碼: ${user.password ? '是' : '否'}`);
      console.log(`   創建時間: ${user.createdAt}`);
      console.log('');
    });
    
    // 4. 測試密碼驗證
    console.log('4. 測試密碼驗證...');
    const testUser = users.find(u => u.email === 'admin@example.com') || users[0];
    
    if (testUser && testUser.password) {
      console.log(`測試用戶: ${testUser.email}`);
      
      // 測試正確密碼
      const correctPassword = 'password123';
      const isValid = await bcrypt.compare(correctPassword, testUser.password);
      console.log(`密碼 '${correctPassword}' 驗證: ${isValid ? '✅ 成功' : '❌ 失敗'}`);
      
      // 測試錯誤密碼
      const wrongPassword = 'wrongpassword';
      const isInvalid = await bcrypt.compare(wrongPassword, testUser.password);
      console.log(`密碼 '${wrongPassword}' 驗證: ${isInvalid ? '❌ 意外成功' : '✅ 正確失敗'}`);
    }
    
    // 5. 檢查環境變數
    console.log('\n5. 檢查環境變數...');
    const envVars = {
      'DATABASE_URL': process.env.DATABASE_URL ? '✅ 已設定' : '❌ 未設定',
      'NEXTAUTH_URL': process.env.NEXTAUTH_URL ? '✅ 已設定' : '❌ 未設定',
      'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET ? '✅ 已設定' : '❌ 未設定'
    };
    
    Object.entries(envVars).forEach(([key, status]) => {
      console.log(`${key}: ${status}`);
    });
    
    console.log('\n🎉 診斷完成！');
    console.log('\n建議的測試步驟:');
    console.log('1. 啟動開發服務器: npm run dev');
    console.log('2. 訪問登入頁面: http://localhost:3000/login');
    console.log('3. 使用測試帳號登入:');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');
    console.log('4. 檢查瀏覽器控制台和服務器日誌');
    
  } catch (error) {
    console.error('❌ 診斷過程中發生錯誤:', error);
    
    if (error.code === 'P1000' || error.code === 'P1001') {
      console.log('\n💡 資料庫連接問題解決方案:');
      console.log('1. 確認 PostgreSQL 服務正在運行');
      console.log('2. 檢查 .env 檔案中的 DATABASE_URL');
      console.log('3. 運行: npx prisma db push');
      console.log('4. 運行: npx prisma db seed');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  diagnoseAuth().catch(console.error);
}

module.exports = { diagnoseAuth };