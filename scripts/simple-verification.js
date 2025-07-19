const { chromium } = require('playwright');
const fs = require('fs');

async function simpleVerification() {
  console.log('🔍 簡單驗證開始...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 測試主頁
    console.log('🧪 測試主頁...');
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    console.log(`✅ 主頁標題: ${title}`);
    
    await page.screenshot({ path: 'test-results/simple-homepage.png' });
    console.log('📸 主頁截圖已保存');
    
    // 測試飛機遊戲頁面
    console.log('🧪 測試飛機遊戲頁面...');
    await page.goto('http://localhost:3001/games/airplane', { waitUntil: 'domcontentloaded' });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    const gameTitle = await page.title();
    console.log(`✅ 遊戲頁面標題: ${gameTitle}`);
    
    // 檢查關鍵元素
    const titleElement = await page.locator('h1').first().textContent();
    console.log(`✅ 頁面標題元素: ${titleElement}`);
    
    const statsCards = await page.locator('div:has-text("分數")').count();
    console.log(`✅ 統計卡片數量: ${statsCards}`);
    
    await page.screenshot({ path: 'test-results/simple-airplane-game.png' });
    console.log('📸 飛機遊戲截圖已保存');
    
    // 測試 API
    console.log('🧪 測試 API...');
    const response = await page.request.get('http://localhost:3001/api/games/stats');
    const apiData = await response.json();
    console.log(`✅ API 響應: ${JSON.stringify(apiData)}`);
    
    console.log('🎉 簡單驗證完成！');
    
  } catch (error) {
    console.log(`❌ 驗證失敗: ${error.message}`);
    await page.screenshot({ path: 'test-results/simple-error.png' });
  }
  
  await browser.close();
}

simpleVerification().catch(console.error);
