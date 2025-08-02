// 詳細的遊戲切換器功能測試
const { chromium } = require('playwright');

async function detailedSwitcherTest() {
  console.log('🔍 開始詳細測試遊戲切換器功能...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 訪問遊戲切換器頁面
    console.log('📱 訪問遊戲切換器頁面...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. 檢查頁面內容
    console.log('🔍 檢查頁面內容...');
    const bodyText = await page.textContent('body');
    console.log('頁面包含的文字:', bodyText.substring(0, 200) + '...');
    
    // 3. 檢查是否有錯誤信息
    const errorMessages = await page.locator('text=/error|錯誤|failed|失敗/i').count();
    console.log(`❌ 錯誤信息數量: ${errorMessages}`);
    
    // 4. 檢查遊戲切換器組件
    const gameSwitcherComponent = page.locator('.game-switcher');
    const componentExists = await gameSwitcherComponent.count() > 0;
    console.log(`🎮 遊戲切換器組件存在: ${componentExists}`);
    
    if (componentExists) {
      // 5. 檢查下拉選單按鈕
      const dropdownButton = page.locator('button, [role="button"]').first();
      const buttonExists = await dropdownButton.count() > 0;
      console.log(`🔘 下拉按鈕存在: ${buttonExists}`);
      
      if (buttonExists) {
        console.log('🖱️ 點擊下拉按鈕...');
        await dropdownButton.click();
        await page.waitForTimeout(1000);
        
        // 6. 檢查遊戲選項
        const gameOptions = await page.locator('[role="option"], .game-option').count();
        console.log(`📋 遊戲選項數量: ${gameOptions}`);
        
        // 7. 列出所有可見的遊戲選項
        const optionTexts = await page.locator('[role="option"], .game-option').allTextContents();
        console.log('🎯 可用遊戲選項:');
        optionTexts.forEach((text, index) => {
          console.log(`  ${index + 1}. ${text}`);
        });
        
        // 8. 測試切換到不同遊戲
        if (optionTexts.length > 0) {
          console.log('🔄 測試遊戲切換...');
          
          // 嘗試切換到第一個可用遊戲
          const firstOption = page.locator('[role="option"], .game-option').first();
          await firstOption.click();
          await page.waitForTimeout(3000);
          
          // 檢查是否有載入指示器
          const loadingIndicator = await page.locator('.loading, [data-loading], .spinner').count();
          console.log(`⏳ 載入指示器: ${loadingIndicator > 0 ? '顯示中' : '未顯示'}`);
          
          // 檢查遊戲內容是否載入
          const gameContent = await page.locator('iframe, .game-content, canvas').count();
          console.log(`🎮 遊戲內容載入: ${gameContent > 0 ? '成功' : '失敗'}`);
        }
      }
    }
    
    // 9. 檢查控制台錯誤
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 10. 檢查網絡請求失敗
    const failedRequests = [];
    page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    console.log(`🚨 控制台錯誤數量: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('控制台錯誤:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log(`🌐 失敗的網絡請求: ${failedRequests.length}`);
    if (failedRequests.length > 0) {
      console.log('失敗的請求:');
      failedRequests.forEach(req => console.log(`  - ${req}`));
    }
    
    // 11. 最終截圖
    await page.screenshot({ 
      path: 'detailed-switcher-test.png',
      fullPage: true 
    });
    console.log('📸 已保存詳細測試截圖');
    
    console.log('✅ 詳細測試完成！');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await browser.close();
  }
}

detailedSwitcherTest();
