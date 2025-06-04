const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function debug401() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 檢查資料庫連接...');
    await prisma.$connect();
    console.log('✅ 資料庫連接成功');
    
    console.log('\n👥 檢查用戶數據...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });
    
    console.log(`📊 找到 ${users.length} 個用戶:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - 密碼: ${user.password ? '已設定' : '未設定'}`);
    });
    
    if (users.length === 0) {
      console.log('\n⚠️  沒有找到任何用戶，需要執行 seed 腳本');
      console.log('執行: npx prisma db seed');
    } else {
      console.log('\n🔐 測試密碼驗證...');
      const testUser = users.find(u => u.email === 'admin@example.com');
      if (testUser && testUser.password) {
        const isValid = await bcrypt.compare('password123', testUser.password);
        console.log(`密碼驗證結果: ${isValid ? '✅ 正確' : '❌ 錯誤'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    if (error.code === 'P1001') {
      console.log('💡 資料庫連接失敗，請檢查 PostgreSQL 是否運行');
    }
  } finally {
    await prisma.$disconnect();
  }
}

debug401().catch(console.error);