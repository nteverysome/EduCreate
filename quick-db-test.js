// 快速數據庫連接測試
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 快速數據庫連接測試');
  console.log('========================');
  
  const prisma = new PrismaClient();
  
  try {
    console.log('📋 嘗試連接數據庫...');
    await prisma.$connect();
    console.log('✅ 數據庫連接成功！');
    
    console.log('📋 測試查詢...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 查詢測試成功:', result);
    
  } catch (error) {
    console.log('❌ 數據庫連接失敗:');
    console.log('錯誤類型:', error.constructor.name);
    console.log('錯誤信息:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 解決方案:');
      console.log('1. PostgreSQL 服務未運行');
      console.log('2. 檢查端口 5432 是否正確');
      console.log('3. 確認數據庫服務器地址');
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 解決方案:');
      console.log('1. 創建數據庫: createdb educreate');
      console.log('2. 或運行: npx prisma db push');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 解決方案:');
      console.log('1. 檢查用戶名和密碼');
      console.log('2. 確認 PostgreSQL 用戶權限');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);