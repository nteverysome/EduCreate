// 測試Vite版遊戲訪問
const { chromium } = require('playwright');

async function testViteGameAccess() {
  console.log('🎮 測試Vite版遊戲訪問...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 測試直接訪問Vite遊戲
    console.log('🔗 直接測試Vite遊戲URL...');
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const viteTitle = await page.title();
    console.log(`✅ Vite遊戲頁面標題: ${viteTitle}`);
    
    // 檢查遊戲是否載入
    const gameCanvas = await page.locator('canvas').count();
    console.log(`🎮 遊戲Canvas數量: ${gameCanvas}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'vite-game-direct-access.png',
      fullPage: true 
    });
    console.log('📸 已保存Vite遊戲直接訪問截圖');
    
    // 2. 測試遊戲切換器中的Vite版
    console.log('🔄 測試遊戲切換器中的Vite版...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 點擊切換遊戲按鈕
    const switchButton = page.locator('text=切換遊戲');
    if (await switchButton.count() > 0) {
      await switchButton.click();
      await page.waitForTimeout(1000);
      
      // 點擊Vite版遊戲 - 使用更精確的選擇器
      const viteOption = page.locator('button:has-text("⚡ 飛機遊戲 (Vite版)")');
      if (await viteOption.count() > 0) {
        console.log('🖱️ 點擊Vite版遊戲選項...');
        await viteOption.click();
        await page.waitForTimeout(5000);
        
        // 檢查是否成功載入
        const gameFrame = await page.locator('iframe, canvas, .game-content').count();
        console.log(`🎮 遊戲內容載入: ${gameFrame > 0 ? '成功' : '失敗'}`);
        
        // 截圖記錄
        await page.screenshot({ 
          path: 'vite-game-switcher-access.png',
          fullPage: true 
        });
        console.log('📸 已保存遊戲切換器中Vite版截圖');
      }
    }
    
    console.log('✅ Vite版遊戲訪問測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await browser.close();
  }
}

testViteGameAccess();
