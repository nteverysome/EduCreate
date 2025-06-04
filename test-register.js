const fetch = require('node-fetch');

// 測試註冊API
async function testRegisterAPI() {
  console.log('🧪 測試註冊 API...');
  console.log('================================');
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123'
  };
  
  console.log('📋 測試用戶數據:', {
    name: testUser.name,
    email: testUser.email,
    password: '***隱藏***'
  });
  
  try {
    console.log('\n🚀 發送註冊請求...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    console.log('📡 響應狀態:', response.status, response.statusText);
    
    const data = await response.text();
    console.log('📋 響應內容:', data);
    
    if (response.ok) {
      console.log('✅ 註冊測試成功！');
      try {
        const jsonData = JSON.parse(data);
        console.log('📊 解析後的數據:', jsonData);
      } catch (e) {
        console.log('⚠️  響應不是有效的 JSON');
      }
    } else {
      console.log('❌ 註冊測試失敗');
      console.log('錯誤詳情:', data);
    }
    
  } catch (error) {
    console.error('❌ 測試過程中出現錯誤:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 提示: 請確保開發服務器正在運行 (npm run dev)');
    }
  }
}

// 檢查服務器是否運行
async function checkServer() {
  console.log('🔍 檢查服務器狀態...');
  
  try {
    const response = await fetch('http://localhost:3000/', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ 服務器正在運行');
      return true;
    } else {
      console.log('⚠️  服務器響應異常:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ 無法連接到服務器');
    console.log('💡 請運行: npm run dev');
    return false;
  }
}

// 主函數
async function main() {
  console.log('🧪 EduCreate 註冊功能測試');
  console.log('================================\n');
  
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    console.log('\n');
    await testRegisterAPI();
  }
  
  console.log('\n🎯 測試完成！');
}

// 如果直接運行此腳本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testRegisterAPI, checkServer };