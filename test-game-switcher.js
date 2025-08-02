// 遊戲切換器功能測試腳本
const { chromium } = require('playwright');

async function testGameSwitcher() {
  console.log('🎮 開始測試遊戲切換器功能...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 測試遊戲切換器頁面載入
    console.log('📱 測試遊戲切換器頁面載入...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 檢查頁面是否正常載入
    const pageTitle = await page.title();
    console.log(`✅ 頁面標題: ${pageTitle}`);
    
    // 2. 檢查遊戲切換器組件是否存在
    console.log('🔍 檢查遊戲切換器組件...');
    const gameSwitcher = page.locator('.game-switcher');
    const switcherExists = await gameSwitcher.count() > 0;
    console.log(`✅ 遊戲切換器組件存在: ${switcherExists}`);
    
    // 3. 檢查下拉選單
    console.log('📋 檢查遊戲選單...');
    const dropdown = page.locator('[role="button"]').first();
    if (await dropdown.count() > 0) {
      await dropdown.click();
      await page.waitForTimeout(1000);
      
      // 檢查遊戲選項
      const gameOptions = await page.locator('[role="option"]').count();
      console.log(`✅ 可用遊戲選項數量: ${gameOptions}`);
      
      // 檢查飛機遊戲選項
      const airplaneOption = page.locator('text=飛機遊戲');
      const airplaneExists = await airplaneOption.count() > 0;
      console.log(`✅ 飛機遊戲選項存在: ${airplaneExists}`);
      
      if (airplaneExists) {
        console.log('🎯 測試切換到飛機遊戲...');
        await airplaneOption.first().click();
        await page.waitForTimeout(2000);
        
        // 檢查是否成功切換
        const gameFrame = page.locator('iframe, .game-content');
        const gameLoaded = await gameFrame.count() > 0;
        console.log(`✅ 遊戲載入成功: ${gameLoaded}`);
      }
    }
    
    // 4. 檢查載入狀態
    console.log('⏳ 檢查載入狀態...');
    const loadingIndicator = page.locator('.loading, [data-loading="true"]');
    const hasLoading = await loadingIndicator.count() > 0;
    console.log(`✅ 載入指示器: ${hasLoading ? '存在' : '不存在'}`);
    
    // 5. 截圖記錄
    await page.screenshot({ 
      path: 'game-switcher-test.png',
      fullPage: true 
    });
    console.log('📸 已保存截圖: game-switcher-test.png');
    
    // 6. 測試主頁的遊戲入口
    console.log('🏠 測試主頁遊戲入口...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const gameLinks = await page.locator('a[href*="/games/"]').count();
    console.log(`✅ 主頁遊戲連結數量: ${gameLinks}`);
    
    // 檢查特定遊戲連結
    const airplaneLink = page.locator('a[href="/games/airplane"]');
    const airplaneLinkExists = await airplaneLink.count() > 0;
    console.log(`✅ 飛機遊戲連結存在: ${airplaneLinkExists}`);
    
    const switcherLink = page.locator('a[href="/games/switcher"]');
    const switcherLinkExists = await switcherLink.count() > 0;
    console.log(`✅ 遊戲切換器連結存在: ${switcherLinkExists}`);
    
    console.log('🎉 遊戲切換器功能測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await browser.close();
  }
}

testGameSwitcher();
