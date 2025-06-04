// 簡單的數據庫連接測試
const { PrismaClient } = require('@prisma/client');

console.log('=====================================');
console.log('數據庫連接測試');
console.log('=====================================');
console.log('');

console.log('📋 當前配置:');
console.log('- 數據庫: PostgreSQL');
console.log('- 主機: localhost:5432');
console.log('- 用戶: postgres');
console.log('- 密碼: z089336161');
console.log('- 數據庫名: educreate');
console.log('');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 測試數據庫連接...');
    await prisma.$connect();
    console.log('✅ 數據庫連接成功！');
    
    console.log('🔍 測試查詢...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 查詢測試成功:', result);
    
    console.log('');
    console.log('🎉 數據庫連接正常！');
    console.log('💡 註冊功能應該可以正常工作了');
    
  } catch (error) {
    console.log('❌ 數據庫連接失敗:');
    console.log('錯誤代碼:', error.code);
    console.log('錯誤信息:', error.message);
    console.log('');
    
    if (error.code === 'P1000') {
      console.log('🔧 解決方案:');
      console.log('1. 檢查 PostgreSQL 服務是否運行:');
      console.log('   Get-Service postgresql-x64-14');
      console.log('');
      console.log('2. 檢查密碼是否正確:');
      console.log('   psql -U postgres -d postgres');
      console.log('');
      console.log('3. 常見密碼嘗試:');
      console.log('   - postgres');
      console.log('   - admin');
      console.log('   - 123456');
      console.log('   - password');
      console.log('');
      console.log('4. 重置密碼步驟:');
      console.log('   a) 停止服務: Stop-Service postgresql-x64-14');
      console.log('   b) 修改 pg_hba.conf 為 trust 認證');
      console.log('   c) 重啟服務並重置密碼');
      console.log('   d) 恢復 md5 認證');
      console.log('');
      console.log('5. 如果問題持續，考慮重新安裝 PostgreSQL');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();