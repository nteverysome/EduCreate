// 詳細測試Vite版遊戲在切換器中的訪問
const { chromium } = require('playwright');

async function testViteSwitcherDetailed() {
  console.log('🔍 詳細測試Vite版遊戲切換器訪問...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 先確認兩個服務器都在運行
    console.log('🌐 檢查服務器狀態...');
    
    try {
      const mainResponse = await fetch('http://localhost:3000');
      console.log(`✅ 主服務器 (3000): ${mainResponse.status}`);
    } catch (e) {
      console.log(`❌ 主服務器 (3000): 無法連接`);
    }
    
    try {
      const viteResponse = await fetch('http://localhost:3001');
      console.log(`✅ Vite服務器 (3001): ${viteResponse.status}`);
    } catch (e) {
      console.log(`❌ Vite服務器 (3001): 無法連接`);
    }
    
    // 2. 訪問遊戲切換器
    console.log('📱 訪問遊戲切換器...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 3. 點擊切換遊戲按鈕
    console.log('🔘 尋找切換遊戲按鈕...');
    const switchButton = page.locator('text=切換遊戲');
    const buttonExists = await switchButton.count() > 0;
    console.log(`切換遊戲按鈕存在: ${buttonExists}`);
    
    if (buttonExists) {
      await switchButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 已點擊切換遊戲按鈕');
      
      // 4. 檢查下拉選單中的所有選項
      console.log('📋 檢查下拉選單選項...');
      const dropdown = page.locator('.absolute.right-0.mt-2');
      const dropdownVisible = await dropdown.isVisible();
      console.log(`下拉選單可見: ${dropdownVisible}`);
      
      if (dropdownVisible) {
        // 列出所有按鈕
        const allButtons = await dropdown.locator('button').count();
        console.log(`下拉選單中的按鈕數量: ${allButtons}`);
        
        // 檢查每個按鈕的文字
        for (let i = 0; i < allButtons; i++) {
          const buttonText = await dropdown.locator('button').nth(i).textContent();
          console.log(`按鈕 ${i + 1}: "${buttonText}"`);
        }
        
        // 5. 嘗試點擊Vite版遊戲
        console.log('🎯 嘗試點擊Vite版遊戲...');
        const viteButtons = await dropdown.locator('button:has-text("Vite")').count();
        console.log(`包含"Vite"的按鈕數量: ${viteButtons}`);
        
        if (viteButtons > 0) {
          const viteButton = dropdown.locator('button:has-text("Vite")').first();
          await viteButton.click();
          await page.waitForTimeout(5000);
          console.log('✅ 已點擊Vite版遊戲按鈕');
          
          // 6. 檢查遊戲是否載入
          const gameFrame = await page.locator('iframe').count();
          const gameCanvas = await page.locator('canvas').count();
          console.log(`iframe數量: ${gameFrame}`);
          console.log(`canvas數量: ${gameCanvas}`);
          
          // 檢查是否有錯誤信息
          const errorMessages = await page.locator('text=/error|錯誤|failed|失敗|拒絕|refused/i').count();
          console.log(`錯誤信息數量: ${errorMessages}`);
          
          // 7. 截圖記錄最終狀態
          await page.screenshot({ 
            path: 'vite-switcher-final-state.png',
            fullPage: true 
          });
          console.log('📸 已保存最終狀態截圖');
          
          // 8. 如果有iframe，檢查其內容
          if (gameFrame > 0) {
            const iframe = page.locator('iframe').first();
            const iframeSrc = await iframe.getAttribute('src');
            console.log(`iframe源地址: ${iframeSrc}`);
          }
        } else {
          console.log('❌ 未找到Vite版遊戲按鈕');
        }
      } else {
        console.log('❌ 下拉選單未顯示');
      }
    } else {
      console.log('❌ 未找到切換遊戲按鈕');
    }
    
    console.log('🎉 詳細測試完成！');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await browser.close();
  }
}

testViteSwitcherDetailed();
