// 調試遊戲切換器下拉選單
const { chromium } = require('playwright');

async function debugSwitcherDropdown() {
  console.log('🔧 調試遊戲切換器下拉選單...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 訪問遊戲切換器頁面
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📱 頁面載入完成');
    
    // 檢查遊戲切換器組件
    const gameSwitcher = page.locator('.game-switcher');
    console.log(`🎮 遊戲切換器存在: ${await gameSwitcher.count() > 0}`);
    
    // 查找切換遊戲按鈕
    const switchButton = page.locator('text=切換遊戲');
    console.log(`🔘 切換遊戲按鈕存在: ${await switchButton.count() > 0}`);
    
    if (await switchButton.count() > 0) {
      console.log('🖱️ 點擊切換遊戲按鈕...');
      await switchButton.click();
      await page.waitForTimeout(2000);
      
      // 檢查下拉選單是否出現
      const dropdown = page.locator('.absolute.right-0.mt-2');
      const dropdownVisible = await dropdown.isVisible();
      console.log(`📋 下拉選單可見: ${dropdownVisible}`);
      
      if (dropdownVisible) {
        // 檢查可用遊戲標題
        const availableGamesTitle = page.locator('text=可用遊戲');
        console.log(`📝 "可用遊戲" 標題存在: ${await availableGamesTitle.count() > 0}`);
        
        // 檢查所有按鈕元素
        const allButtons = await page.locator('button').count();
        console.log(`🔘 頁面總按鈕數量: ${allButtons}`);
        
        // 檢查下拉選單內的按鈕
        const dropdownButtons = await dropdown.locator('button').count();
        console.log(`📋 下拉選單內按鈕數量: ${dropdownButtons}`);
        
        // 獲取下拉選單的完整HTML
        const dropdownHTML = await dropdown.innerHTML();
        console.log('📄 下拉選單HTML內容:');
        console.log(dropdownHTML.substring(0, 500) + '...');
        
        // 檢查是否有遊戲選項
        const gameOptions = await dropdown.locator('button[onclick], button:has-text("飛機")').count();
        console.log(`🎮 遊戲選項數量: ${gameOptions}`);
        
        // 查找包含遊戲名稱的元素
        const airplaneOptions = await page.locator('text=/飛機/').count();
        console.log(`✈️ 包含"飛機"的元素數量: ${airplaneOptions}`);
        
        // 列出所有可見文字
        const allTexts = await dropdown.allTextContents();
        console.log('📝 下拉選單所有文字內容:');
        allTexts.forEach((text, index) => {
          if (text.trim()) {
            console.log(`  ${index + 1}. "${text.trim()}"`);
          }
        });
        
        // 嘗試點擊第一個遊戲選項
        const firstGameButton = dropdown.locator('button').first();
        if (await firstGameButton.count() > 0) {
          console.log('🎯 嘗試點擊第一個遊戲選項...');
          await firstGameButton.click();
          await page.waitForTimeout(2000);
          
          // 檢查是否成功切換
          const gameContent = await page.locator('iframe, canvas, .game-content').count();
          console.log(`🎮 遊戲內容載入: ${gameContent > 0 ? '成功' : '失敗'}`);
        }
      } else {
        console.log('❌ 下拉選單未顯示，檢查頁面結構...');
        
        // 檢查是否有其他形式的選單
        const anyDropdown = await page.locator('[class*="dropdown"], [class*="menu"], .absolute').count();
        console.log(`📋 任何下拉/選單元素數量: ${anyDropdown}`);
        
        // 檢查頁面的完整結構
        const bodyHTML = await page.locator('body').innerHTML();
        console.log('📄 頁面body結構 (前500字符):');
        console.log(bodyHTML.substring(0, 500) + '...');
      }
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'debug-switcher-dropdown.png',
      fullPage: true 
    });
    console.log('📸 已保存調試截圖');
    
  } catch (error) {
    console.error('❌ 調試過程中發生錯誤:', error);
  } finally {
    await browser.close();
  }
}

debugSwitcherDropdown();
