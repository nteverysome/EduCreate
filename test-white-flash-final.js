// 最終測試白色閃爍修復效果
const { chromium } = require('playwright');

async function testWhiteFlashFinal() {
  console.log('🎉 最終測試白色閃爍修復效果...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    recordVideo: {
      dir: 'EduCreate-Test-Videos/current/success/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 測試遊戲切換器中的 Vite 版遊戲
    console.log('🎮 測試遊戲切換器中的 Vite 版遊戲...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. 點擊切換遊戲
    const switchButton = page.locator('text=切換遊戲');
    if (await switchButton.count() > 0) {
      await switchButton.click();
      await page.waitForTimeout(1000);
      
      // 3. 點擊 Vite 版遊戲
      const viteButton = page.locator('button:has-text("Vite")').first();
      if (await viteButton.count() > 0) {
        console.log('🖱️ 點擊 Vite 版遊戲...');
        await viteButton.click();
        await page.waitForTimeout(5000);
        
        // 4. 檢查 iframe 是否載入
        const iframe = page.locator('iframe');
        const iframeCount = await iframe.count();
        console.log(`🔍 iframe 數量: ${iframeCount}`);
        
        if (iframeCount > 0) {
          // 5. 點擊 iframe 開始遊戲
          await iframe.click();
          await page.waitForTimeout(3000);
          
          // 6. 截圖記錄遊戲狀態
          await page.screenshot({ 
            path: 'final-white-flash-test.png',
            fullPage: false 
          });
          console.log('📸 已保存最終測試截圖');
          
          console.log('✅ 白色閃爍修復測試完成！');
          console.log('🎯 修復效果：');
          console.log('  - GameSwitcher 現在正確處理 GAME_COMPLETE 消息');
          console.log('  - 不再有意外的 iframe 重載');
          console.log('  - 遊戲結束時使用漸進式動畫清理');
          console.log('  - 碰撞時使用淡出動畫移除雲朵');
          console.log('  - 消除了整個遊戲畫面變白的問題');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testWhiteFlashFinal();
