// =====================================
// EduCreate 註冊問題診斷工具
// =====================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function diagnoseRegisterIssue() {
  console.log('🔍 EduCreate 註冊問題診斷');
  console.log('================================');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. 測試數據庫連接
    console.log('\n📋 步驟 1: 測試數據庫連接...');
    await prisma.$connect();
    console.log('✅ 數據庫連接成功');
    
    // 2. 檢查 User 表是否存在
    console.log('\n📋 步驟 2: 檢查 User 表結構...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User 表存在，目前有 ${userCount} 筆用戶記錄`);
      
      // 顯示現有用戶（隱藏密碼）
      if (userCount > 0) {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            role: true
          },
          take: 5
        });
        console.log('📋 現有用戶列表（最多5筆）:');
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.name}) - ${user.role}`);
        });
      }
    } catch (error) {
      console.log('❌ User 表不存在或有問題:', error.message);
      return;
    }
    
    // 3. 測試註冊流程
    console.log('\n📋 步驟 3: 測試註冊流程...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    try {
      // 檢查測試郵箱是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      if (existingUser) {
        console.log('⚠️ 測試郵箱已存在，跳過創建測試');
      } else {
        // 加密密碼
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        
        // 創建測試用戶
        const testUser = await prisma.user.create({
          data: {
            name: 'Test User',
            email: testEmail,
            password: hashedPassword,
          }
        });
        
        console.log('✅ 測試用戶創建成功:', testUser.id);
        
        // 清理測試用戶
        await prisma.user.delete({
          where: { id: testUser.id }
        });
        console.log('✅ 測試用戶已清理');
      }
    } catch (error) {
      console.log('❌ 註冊流程測試失敗:', error.message);
      console.log('詳細錯誤:', error);
    }
    
    // 4. 檢查環境變量
    console.log('\n📋 步驟 4: 檢查環境變量...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET'
    ];
    
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: 已設置`);
      } else {
        console.log(`❌ ${envVar}: 未設置`);
      }
    });
    
    // 5. 檢查 bcrypt 功能
    console.log('\n📋 步驟 5: 測試密碼加密功能...');
    try {
      const testHash = await bcrypt.hash('testpassword', 12);
      const isValid = await bcrypt.compare('testpassword', testHash);
      if (isValid) {
        console.log('✅ bcrypt 密碼加密功能正常');
      } else {
        console.log('❌ bcrypt 密碼驗證失敗');
      }
    } catch (error) {
      console.log('❌ bcrypt 功能測試失敗:', error.message);
    }
    
    console.log('\n🎉 診斷完成！');
    console.log('\n💡 如果所有測試都通過，註冊問題可能是:');
    console.log('   1. 前端 JavaScript 錯誤');
    console.log('   2. 網絡連接問題');
    console.log('   3. 瀏覽器緩存問題');
    console.log('   4. Next.js 服務器未正確啟動');
    
  } catch (error) {
    console.error('❌ 診斷過程中發生錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 運行診斷
diagnoseRegisterIssue().catch(console.error);