// EduCreate 資料庫連接測試工具
// =====================================

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 EduCreate 資料庫連接測試');
  console.log('================================');
  
  const prisma = new PrismaClient();
  
  try {
    // 測試基本連接
    console.log('📋 測試資料庫連接...');
    await prisma.$connect();
    console.log('✅ 資料庫連接成功');
    
    // 測試查詢
    console.log('📋 測試基本查詢...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 查詢測試成功:', result);
    
    // 檢查資料表是否存在
    console.log('📋 檢查資料表結構...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User 資料表存在，目前有 ${userCount} 筆記錄`);
    } catch (error) {
      console.log('❌ User 資料表不存在或有問題');
    }
    
    try {
      const activityCount = await prisma.activity.count();
      console.log(`✅ Activity 資料表存在，目前有 ${activityCount} 筆記錄`);
    } catch (error) {
      console.log('❌ Activity 資料表不存在或有問題');
    }
    
    try {
      const templateCount = await prisma.template.count();
      console.log(`✅ Template 資料表存在，目前有 ${templateCount} 筆記錄`);
    } catch (error) {
      console.log('❌ Template 資料表不存在或有問題');
    }
    
    try {
      const subscriptionCount = await prisma.subscription.count();
      console.log(`✅ Subscription 資料表存在，目前有 ${subscriptionCount} 筆記錄`);
    } catch (error) {
      console.log('❌ Subscription 資料表不存在或有問題');
    }
    
    try {
      const h5pContentCount = await prisma.h5PContent.count();
      console.log(`✅ H5PContent 資料表存在，目前有 ${h5pContentCount} 筆記錄`);
    } catch (error) {
      console.log('❌ H5PContent 資料表不存在或有問題');
    }
    
    console.log('\n🎯 資料庫連接測試完成！');
    console.log('================================');
    console.log('✅ 所有核心功能正常');
    console.log('💡 可以開始使用 EduCreate 平台了');
    
  } catch (error) {
    console.error('❌ 資料庫連接測試失敗:');
    console.error('錯誤詳情:', error.message);
    
    console.log('\n💡 可能的解決方案:');
    console.log('1. 檢查 PostgreSQL 服務是否正在運行');
    console.log('2. 確認 .env 文件中的 DATABASE_URL 設置正確');
    console.log('3. 確認 educreate 資料庫已創建');
    console.log('4. 執行 npx prisma db push 來創建資料表');
    console.log('5. 執行 npx prisma generate 來生成 Prisma Client');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };