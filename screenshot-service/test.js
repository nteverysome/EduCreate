const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SERVICE_URL || 'http://localhost:3000';

// 測試健康檢查
async function testHealth() {
  console.log('\n========================================');
  console.log('測試 1: 健康檢查');
  console.log('========================================');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    console.log('✅ 健康檢查成功');
    console.log('響應:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ 健康檢查失敗:', error.message);
    return false;
  }
}

// 測試單個截圖
async function testSingleScreenshot() {
  console.log('\n========================================');
  console.log('測試 2: 單個截圖');
  console.log('========================================');
  
  try {
    const testUrl = 'https://edu-create.vercel.app';
    console.log(`截圖 URL: ${testUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: testUrl,
        width: 400,
        height: 300,
        waitTime: 2000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const screenshot = await response.arrayBuffer();
    const totalTime = Date.now() - startTime;
    
    // 保存截圖
    const outputPath = path.join(__dirname, 'test-screenshot.png');
    fs.writeFileSync(outputPath, Buffer.from(screenshot));
    
    console.log('✅ 單個截圖成功');
    console.log(`  總時間: ${totalTime}ms`);
    console.log(`  截圖大小: ${screenshot.byteLength} bytes`);
    console.log(`  保存位置: ${outputPath}`);
    
    // 檢查響應頭
    const screenshotTime = response.headers.get('X-Screenshot-Time');
    const screenshotSize = response.headers.get('X-Screenshot-Size');
    if (screenshotTime) {
      console.log(`  服務器報告時間: ${screenshotTime}ms`);
    }
    if (screenshotSize) {
      console.log(`  服務器報告大小: ${screenshotSize} bytes`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ 單個截圖失敗:', error.message);
    return false;
  }
}

// 測試批量截圖
async function testBatchScreenshot() {
  console.log('\n========================================');
  console.log('測試 3: 批量截圖');
  console.log('========================================');
  
  try {
    const testUrls = [
      'https://edu-create.vercel.app',
      'https://edu-create.vercel.app/my-activities'
    ];
    console.log(`截圖 ${testUrls.length} 個 URL`);
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/screenshot/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls: testUrls,
        width: 400,
        height: 300,
        waitTime: 2000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log('✅ 批量截圖成功');
    console.log(`  總時間: ${totalTime}ms`);
    console.log(`  總數: ${data.total}`);
    console.log(`  成功: ${data.succeeded}`);
    console.log(`  失敗: ${data.failed}`);
    
    // 保存截圖
    data.results.forEach((result, index) => {
      if (result.success) {
        const outputPath = path.join(__dirname, `test-batch-${index + 1}.png`);
        const buffer = Buffer.from(result.data, 'base64');
        fs.writeFileSync(outputPath, buffer);
        console.log(`  保存截圖 ${index + 1}: ${outputPath} (${result.size} bytes)`);
      } else {
        console.log(`  截圖 ${index + 1} 失敗: ${result.error}`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ 批量截圖失敗:', error.message);
    return false;
  }
}

// 測試錯誤處理
async function testErrorHandling() {
  console.log('\n========================================');
  console.log('測試 4: 錯誤處理');
  console.log('========================================');
  
  try {
    // 測試缺少 URL 參數
    console.log('測試 4.1: 缺少 URL 參數');
    const response1 = await fetch(`${BASE_URL}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response1.status === 400) {
      const error = await response1.json();
      console.log('✅ 正確返回 400 錯誤');
      console.log('  錯誤信息:', error.message);
    } else {
      console.log('❌ 應該返回 400 錯誤');
      return false;
    }
    
    // 測試無效 URL
    console.log('\n測試 4.2: 無效 URL');
    const response2 = await fetch(`${BASE_URL}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'invalid-url'
      })
    });
    
    if (response2.status === 500) {
      const error = await response2.json();
      console.log('✅ 正確返回 500 錯誤');
      console.log('  錯誤信息:', error.message);
    } else {
      console.log('❌ 應該返回 500 錯誤');
      return false;
    }
    
    // 測試不存在的端點
    console.log('\n測試 4.3: 不存在的端點');
    const response3 = await fetch(`${BASE_URL}/nonexistent`);
    
    if (response3.status === 404) {
      const error = await response3.json();
      console.log('✅ 正確返回 404 錯誤');
      console.log('  錯誤信息:', error.message);
    } else {
      console.log('❌ 應該返回 404 錯誤');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 錯誤處理測試失敗:', error.message);
    return false;
  }
}

// 運行所有測試
async function runAllTests() {
  console.log('========================================');
  console.log('Screenshot Service 測試套件');
  console.log(`服務 URL: ${BASE_URL}`);
  console.log('========================================');
  
  const results = {
    health: await testHealth(),
    singleScreenshot: await testSingleScreenshot(),
    batchScreenshot: await testBatchScreenshot(),
    errorHandling: await testErrorHandling()
  };
  
  console.log('\n========================================');
  console.log('測試結果總結');
  console.log('========================================');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${result ? '✅' : '❌'} ${name}`);
  });
  
  console.log(`\n總計: ${passed}/${total} 測試通過`);
  
  if (passed === total) {
    console.log('\n🎉 所有測試通過！');
    process.exit(0);
  } else {
    console.log('\n❌ 部分測試失敗');
    process.exit(1);
  }
}

// 運行測試
runAllTests().catch(error => {
  console.error('測試運行失敗:', error);
  process.exit(1);
});

