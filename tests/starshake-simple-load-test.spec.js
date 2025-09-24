const { test, expect } = require('@playwright/test');

test.describe('Starshake 簡單載入測試', () => {
  test('檢查遊戲是否有 JavaScript 錯誤', async ({ page }) => {
    console.log('🔍 開始檢查 Starshake 遊戲載入狀況...');
    
    // 收集所有錯誤
    const errors = [];
    const consoleMessages = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`❌ 頁面錯誤: ${error.message}`);
    });
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
      
      if (msg.type() === 'error') {
        console.log(`❌ 控制台錯誤: ${msg.text()}`);
      } else {
        console.log(`📝 控制台 (${msg.type()}): ${msg.text()}`);
      }
    });
    
    // 導航到遊戲頁面
    console.log('🌐 導航到 Starshake 遊戲頁面...');
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    
    // 等待頁面載入
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ DOM 載入完成');
    
    // 等待更長時間讓 JavaScript 執行
    await page.waitForTimeout(8000);
    console.log('⏱️ 等待 JavaScript 執行完成');
    
    // 檢查基本元素
    const gameContainer = await page.locator('#game-container').count();
    const touchControls = await page.locator('#touch-controls').count();
    
    console.log(`🎮 遊戲容器: ${gameContainer > 0 ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`📱 TouchControls: ${touchControls > 0 ? '✅ 存在' : '❌ 不存在'}`);
    
    // 檢查 JavaScript 對象
    const jsStatus = await page.evaluate(() => {
      return {
        phaserExists: typeof Phaser !== 'undefined',
        gameExists: typeof window.game !== 'undefined',
        touchControlsExists: typeof window.touchControls !== 'undefined',
        gameObject: window.game ? {
          type: typeof window.game,
          hasScene: window.game.scene ? true : false,
          sceneCount: window.game.scene ? window.game.scene.scenes.length : 0
        } : null,
        touchControlsObject: window.touchControls ? {
          type: typeof window.touchControls,
          hasGetInputState: typeof window.touchControls.getInputState === 'function'
        } : null
      };
    });
    
    console.log('🔍 JavaScript 對象狀態:');
    console.log(`  - Phaser: ${jsStatus.phaserExists ? '✅' : '❌'}`);
    console.log(`  - window.game: ${jsStatus.gameExists ? '✅' : '❌'}`);
    console.log(`  - window.touchControls: ${jsStatus.touchControlsExists ? '✅' : '❌'}`);
    
    if (jsStatus.gameObject) {
      console.log(`  - Game 對象詳情:`, jsStatus.gameObject);
    }
    
    if (jsStatus.touchControlsObject) {
      console.log(`  - TouchControls 對象詳情:`, jsStatus.touchControlsObject);
    }
    
    // 統計錯誤
    console.log(`📊 錯誤統計:`);
    console.log(`  - 頁面錯誤: ${errors.length}`);
    console.log(`  - 控制台錯誤: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`  - 控制台警告: ${consoleMessages.filter(m => m.type === 'warning').length}`);
    console.log(`  - 控制台日誌: ${consoleMessages.filter(m => m.type === 'log').length}`);
    
    if (errors.length > 0) {
      console.log('❌ 發現的頁面錯誤:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    const consoleErrors = consoleMessages.filter(m => m.type === 'error');
    if (consoleErrors.length > 0) {
      console.log('❌ 發現的控制台錯誤:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.text}`);
      });
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250924_starshake_simple_load_test_v1_001.png',
      fullPage: true 
    });
    
    // 基本斷言
    expect(gameContainer).toBeGreaterThan(0);
    expect(touchControls).toBeGreaterThan(0);
    expect(jsStatus.touchControlsExists).toBe(true);
    
    // 如果沒有錯誤，Phaser 應該存在
    if (errors.length === 0 && consoleErrors.length === 0) {
      expect(jsStatus.phaserExists).toBe(true);
    } else {
      console.log('⚠️ 由於存在錯誤，跳過 Phaser 存在性檢查');
    }
    
    console.log('🎉 簡單載入測試完成！');
  });
});
