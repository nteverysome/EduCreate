const { test, expect } = require('@playwright/test');

test.describe('Starshake 簡單載入測試', () => {
  test('檢查遊戲基本載入和 JavaScript 錯誤', async ({ page }) => {
    console.log('🔍 開始簡單載入測試...');
    
    // 監聽控制台錯誤
    const consoleMessages = [];
    const jsErrors = [];
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
      
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
        console.log(`❌ JavaScript 錯誤: ${msg.text()}`);
      } else if (msg.type() === 'log') {
        console.log(`📝 控制台日誌: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.log(`❌ 頁面錯誤: ${error.message}`);
    });
    
    // 導航到遊戲頁面
    console.log('🌐 導航到 Starshake 遊戲頁面...');
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    
    // 等待頁面載入
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ DOM 內容載入完成');
    
    // 等待更長時間讓 JavaScript 執行
    await page.waitForTimeout(5000);
    
    // 檢查基本 DOM 元素
    console.log('\n🔍 檢查基本 DOM 元素:');
    
    const gameContainer = await page.locator('#game-container').count();
    console.log(`  - 遊戲容器: ${gameContainer > 0 ? '✅' : '❌'}`);
    
    const touchControls = await page.locator('#touch-controls').count();
    console.log(`  - TouchControls: ${touchControls > 0 ? '✅' : '❌'}`);
    
    // 檢查 JavaScript 對象
    console.log('\n🔍 檢查 JavaScript 對象:');
    
    const jsObjectsStatus = await page.evaluate(() => {
      return {
        windowExists: typeof window !== 'undefined',
        touchControlsExists: typeof window.touchControls !== 'undefined',
        phaserExists: typeof Phaser !== 'undefined',
        gameExists: typeof window.game !== 'undefined',
        documentReady: document.readyState,
        scriptsLoaded: document.querySelectorAll('script').length,
        errors: window.jsErrors || []
      };
    });
    
    console.log(`  - Window 對象: ${jsObjectsStatus.windowExists ? '✅' : '❌'}`);
    console.log(`  - TouchControls: ${jsObjectsStatus.touchControlsExists ? '✅' : '❌'}`);
    console.log(`  - Phaser: ${jsObjectsStatus.phaserExists ? '✅' : '❌'}`);
    console.log(`  - Game 對象: ${jsObjectsStatus.gameExists ? '✅' : '❌'}`);
    console.log(`  - 文檔狀態: ${jsObjectsStatus.documentReady}`);
    console.log(`  - 腳本數量: ${jsObjectsStatus.scriptsLoaded}`);
    
    // 如果 TouchControls 存在，測試其功能
    if (jsObjectsStatus.touchControlsExists) {
      console.log('\n🧪 測試 TouchControls 功能:');
      
      const touchControlsTest = await page.evaluate(() => {
        try {
          const state = window.touchControls.getInputState();
          return {
            success: true,
            state: state,
            hasGetInputState: typeof window.touchControls.getInputState === 'function',
            hasDirection: state && typeof state.direction === 'object',
            hasShooting: state && typeof state.shooting === 'boolean'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      if (touchControlsTest.success) {
        console.log('  ✅ TouchControls 功能正常');
        console.log(`  - getInputState: ${touchControlsTest.hasGetInputState ? '✅' : '❌'}`);
        console.log(`  - direction 屬性: ${touchControlsTest.hasDirection ? '✅' : '❌'}`);
        console.log(`  - shooting 屬性: ${touchControlsTest.hasShooting ? '✅' : '❌'}`);
        console.log(`  - 當前狀態: ${JSON.stringify(touchControlsTest.state)}`);
      } else {
        console.log(`  ❌ TouchControls 測試失敗: ${touchControlsTest.error}`);
      }
    }
    
    // 嘗試手動初始化 Phaser 遊戲（如果不存在）
    if (!jsObjectsStatus.gameExists && jsObjectsStatus.phaserExists) {
      console.log('\n🔧 嘗試手動檢查 Phaser 初始化...');
      
      const phaserInitResult = await page.evaluate(() => {
        try {
          // 檢查是否有遊戲配置
          const gameContainerExists = document.getElementById('game-container') !== null;
          
          // 檢查是否有 Phaser 場景
          const hasPhaserScenes = typeof Phaser !== 'undefined' && 
                                 typeof Phaser.Scene !== 'undefined';
          
          return {
            success: true,
            gameContainerExists,
            hasPhaserScenes,
            phaserVersion: typeof Phaser !== 'undefined' ? Phaser.VERSION : null
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      console.log(`  - 遊戲容器存在: ${phaserInitResult.gameContainerExists ? '✅' : '❌'}`);
      console.log(`  - Phaser 場景: ${phaserInitResult.hasPhaserScenes ? '✅' : '❌'}`);
      console.log(`  - Phaser 版本: ${phaserInitResult.phaserVersion || '未知'}`);
    }
    
    // 總結錯誤
    console.log('\n📋 錯誤總結:');
    if (jsErrors.length === 0) {
      console.log('✅ 沒有發現 JavaScript 錯誤');
    } else {
      console.log(`❌ 發現 ${jsErrors.length} 個 JavaScript 錯誤:`);
      jsErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // 控制台消息統計
    const messageStats = {
      log: consoleMessages.filter(m => m.type === 'log').length,
      warn: consoleMessages.filter(m => m.type === 'warning').length,
      error: consoleMessages.filter(m => m.type === 'error').length,
      info: consoleMessages.filter(m => m.type === 'info').length
    };
    
    console.log('\n📊 控制台消息統計:');
    console.log(`  - 日誌: ${messageStats.log}`);
    console.log(`  - 警告: ${messageStats.warn}`);
    console.log(`  - 錯誤: ${messageStats.error}`);
    console.log(`  - 信息: ${messageStats.info}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/analysis/20250924_starshake_simple_loading_test_v1_001.png',
      fullPage: true 
    });
    
    // 基本斷言
    expect(gameContainer).toBeGreaterThan(0);
    expect(touchControls).toBeGreaterThan(0);
    expect(jsObjectsStatus.windowExists).toBe(true);
    expect(jsObjectsStatus.touchControlsExists).toBe(true);
    
    // 如果有 JavaScript 錯誤，測試應該失敗
    if (jsErrors.length > 0) {
      console.log('❌ 由於 JavaScript 錯誤，測試失敗');
      throw new Error(`發現 ${jsErrors.length} 個 JavaScript 錯誤: ${jsErrors.join('; ')}`);
    }
    
    console.log('🎉 簡單載入測試完成！');
  });
  
  test('測試 TouchControls 界面互動', async ({ page }) => {
    console.log('🎮 測試 TouchControls 界面互動...');
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到遊戲頁面
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 檢查 TouchControls 可見性
    const touchControls = page.locator('#touch-controls');
    const isVisible = await touchControls.isVisible();
    console.log(`📱 TouchControls 可見: ${isVisible ? '✅' : '❌'}`);
    
    if (isVisible) {
      // 測試虛擬搖桿
      const joystick = page.locator('#touch-joystick');
      if (await joystick.count() > 0) {
        console.log('🕹️ 測試虛擬搖桿互動...');
        
        // 獲取初始狀態
        const initialState = await page.evaluate(() => {
          return window.touchControls ? window.touchControls.getInputState() : null;
        });
        console.log(`📊 初始狀態: ${JSON.stringify(initialState)}`);
        
        // 點擊搖桿
        await joystick.click();
        await page.waitForTimeout(500);
        
        // 獲取點擊後狀態
        const afterClickState = await page.evaluate(() => {
          return window.touchControls ? window.touchControls.getInputState() : null;
        });
        console.log(`📊 點擊後狀態: ${JSON.stringify(afterClickState)}`);
      }
      
      // 測試射擊按鈕
      const shootButton = page.locator('#touch-shoot');
      if (await shootButton.count() > 0) {
        console.log('🚀 測試射擊按鈕互動...');
        
        // 點擊射擊按鈕
        await shootButton.click();
        await page.waitForTimeout(500);
        
        // 獲取點擊後狀態
        const afterShootState = await page.evaluate(() => {
          return window.touchControls ? window.touchControls.getInputState() : null;
        });
        console.log(`📊 射擊後狀態: ${JSON.stringify(afterShootState)}`);
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/analysis/20250924_starshake_touchcontrols_interaction_test_v1_001.png',
      fullPage: true 
    });
    
    console.log('🎉 TouchControls 界面互動測試完成！');
  });
});
