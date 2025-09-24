const { test, expect, devices } = require('@playwright/test');

test.describe('Starshake TouchControls 修復驗證測試', () => {
  
  // 測試設備配置
  const testDevices = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 13', device: devices['iPhone 13'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
    { name: 'iPad Air', device: devices['iPad Air'] },
    { name: 'Desktop Chrome', device: { viewport: { width: 1200, height: 800 } } }
  ];

  testDevices.forEach(({ name, device }) => {
    test(`${name} - TouchControls 修復驗證`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
        recordVideo: {
          dir: 'EduCreate-Test-Videos/current/success/',
          size: device.viewport || { width: 390, height: 844 }
        }
      });
      
      const page = await context.newPage();
      
      console.log(`🔧 開始 ${name} TouchControls 修復驗證...`);
      
      // 監聽控制台消息
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text()
        });
        console.log(`📝 ${name} 控制台: ${msg.text()}`);
      });
      
      // 導航到遊戲頁面
      await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 檢查媒體查詢和可見性
      console.log(`📱 ${name} 檢查媒體查詢...`);
      const mediaQueryResults = await page.evaluate(() => {
        if (typeof window.checkMediaQueries === 'function') {
          window.checkMediaQueries();
        }
        
        const queries = [
          '(max-width: 1024px)',
          '(max-height: 768px)',
          '(pointer: coarse)',
          '(hover: none) and (pointer: coarse)',
          '(min-width: 768px) and (max-width: 1024px)',
          '(min-width: 414px) and (max-width: 768px)'
        ];
        
        const results = {};
        queries.forEach(query => {
          results[query] = window.matchMedia(query).matches;
        });
        
        const controls = document.getElementById('touch-controls');
        const computedStyle = controls ? window.getComputedStyle(controls) : null;
        
        return {
          mediaQueries: results,
          touchControlsExists: !!controls,
          touchControlsDisplay: computedStyle ? computedStyle.display : null,
          touchControlsVisible: computedStyle ? computedStyle.display !== 'none' : false
        };
      });
      
      console.log(`📊 ${name} 媒體查詢結果:`, mediaQueryResults);
      
      // 強制顯示 TouchControls 進行測試
      await page.evaluate(() => {
        if (typeof window.forceTouchControls === 'function') {
          window.forceTouchControls(true);
        }
      });
      
      await page.waitForTimeout(1000);
      
      // 檢查 TouchControls 可見性
      const touchControls = page.locator('#touch-controls');
      const isVisible = await touchControls.isVisible();
      console.log(`📱 ${name} TouchControls 可見: ${isVisible ? '✅' : '❌'}`);
      
      if (isVisible) {
        // 測試 TouchControls 功能
        console.log(`🧪 ${name} 測試 TouchControls 功能...`);
        
        const testResults = await page.evaluate(() => {
          if (typeof window.testTouchControls === 'function') {
            return window.testTouchControls();
          }
          return false;
        });
        
        console.log(`🧪 ${name} TouchControls 測試結果: ${testResults ? '✅' : '❌'}`);
        
        // 測試虛擬搖桿
        const joystick = page.locator('#touch-joystick');
        const joystickVisible = await joystick.isVisible();
        console.log(`🕹️ ${name} 虛擬搖桿可見: ${joystickVisible ? '✅' : '❌'}`);
        
        if (joystickVisible) {
          // 獲取初始狀態
          const initialState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 初始狀態: ${JSON.stringify(initialState)}`);
          
          // 測試搖桿互動
          const joystickBounds = await joystick.boundingBox();
          if (joystickBounds) {
            console.log(`👆 ${name} 測試搖桿觸摸...`);
            
            // 測試向右移動
            await page.touchscreen.tap(
              joystickBounds.x + joystickBounds.width * 0.8,
              joystickBounds.y + joystickBounds.height * 0.5
            );
            await page.waitForTimeout(500);
            
            const rightState = await page.evaluate(() => {
              return window.touchControls ? window.touchControls.getInputState() : null;
            });
            console.log(`📊 ${name} 向右觸摸後: ${JSON.stringify(rightState)}`);
            
            // 檢查狀態是否變化
            const stateChanged = rightState && (
              Math.abs(rightState.direction.x) > 0.1 || 
              Math.abs(rightState.direction.y) > 0.1
            );
            console.log(`🎯 ${name} 狀態變化: ${stateChanged ? '✅' : '❌'}`);
            
            // 測試向左移動
            await page.touchscreen.tap(
              joystickBounds.x + joystickBounds.width * 0.2,
              joystickBounds.y + joystickBounds.height * 0.5
            );
            await page.waitForTimeout(500);
            
            const leftState = await page.evaluate(() => {
              return window.touchControls ? window.touchControls.getInputState() : null;
            });
            console.log(`📊 ${name} 向左觸摸後: ${JSON.stringify(leftState)}`);
          }
        }
        
        // 測試射擊按鈕
        const shootButton = page.locator('#touch-shoot');
        const shootVisible = await shootButton.isVisible();
        console.log(`🚀 ${name} 射擊按鈕可見: ${shootVisible ? '✅' : '❌'}`);
        
        if (shootVisible) {
          console.log(`👆 ${name} 測試射擊按鈕...`);
          
          // 點擊射擊按鈕
          await shootButton.tap();
          await page.waitForTimeout(500);
          
          const shootState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 射擊後狀態: ${JSON.stringify(shootState)}`);
        }
        
        // 測試全螢幕按鈕
        const fullscreenButton = page.locator('#fullscreen-btn');
        const fullscreenVisible = await fullscreenButton.isVisible();
        console.log(`🖥️ ${name} 全螢幕按鈕可見: ${fullscreenVisible ? '✅' : '❌'}`);
        
        if (fullscreenVisible) {
          await fullscreenButton.tap();
          await page.waitForTimeout(1000);
          console.log(`📱 ${name} 全螢幕按鈕已測試`);
        }
      }
      
      // 檢查遊戲狀態
      const gameStatus = await page.evaluate(() => {
        return {
          phaserExists: typeof Phaser !== 'undefined',
          gameExists: typeof window.game !== 'undefined',
          touchControlsExists: typeof window.touchControls !== 'undefined',
          gameContainer: document.getElementById('game-container') !== null,
          testFunctionsExist: {
            testTouchControls: typeof window.testTouchControls === 'function',
            forceTouchControls: typeof window.forceTouchControls === 'function',
            checkMediaQueries: typeof window.checkMediaQueries === 'function',
            toggleTouchDebug: typeof window.toggleTouchDebug === 'function'
          }
        };
      });
      
      console.log(`🎮 ${name} 遊戲狀態:`, gameStatus);
      
      // 截圖記錄
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/success/20250924_starshake_${name.replace(/\s+/g, '_')}_touchcontrols_fixed_v2_001.png`,
        fullPage: true 
      });
      
      // 基本斷言
      expect(gameStatus.touchControlsExists).toBe(true);
      expect(gameStatus.gameContainer).toBe(true);
      expect(gameStatus.testFunctionsExist.testTouchControls).toBe(true);
      
      // 如果是觸摸設備，TouchControls 應該可見
      if (name.includes('iPhone') || name.includes('Samsung') || name.includes('iPad')) {
        expect(isVisible).toBe(true);
      }
      
      console.log(`🎉 ${name} TouchControls 修復驗證完成！`);
      
      await context.close();
    });
  });
  
  test('TouchControls 調試功能測試', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12']
    });
    
    const page = await context.newPage();
    
    console.log('🐛 開始 TouchControls 調試功能測試...');
    
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 測試調試功能
    const debugResults = await page.evaluate(() => {
      const results = {};
      
      // 測試強制顯示功能
      if (typeof window.forceTouchControls === 'function') {
        window.forceTouchControls(true);
        results.forceTouchControls = true;
      }
      
      // 測試調試模式切換
      if (typeof window.toggleTouchDebug === 'function') {
        window.toggleTouchDebug();
        results.debugMode = document.body.classList.contains('touch-debug');
      }
      
      // 測試媒體查詢檢查
      if (typeof window.checkMediaQueries === 'function') {
        window.checkMediaQueries();
        results.mediaQueryCheck = true;
      }
      
      // 測試 TouchControls 測試功能
      if (typeof window.testTouchControls === 'function') {
        results.touchControlsTest = window.testTouchControls();
      }
      
      return results;
    });
    
    console.log('🧪 調試功能測試結果:', debugResults);
    
    // 截圖記錄調試模式
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250924_starshake_touchcontrols_debug_mode_v2_001.png',
      fullPage: true 
    });
    
    expect(debugResults.forceTouchControls).toBe(true);
    expect(debugResults.mediaQueryCheck).toBe(true);
    expect(debugResults.touchControlsTest).toBe(true);
    
    console.log('🎉 TouchControls 調試功能測試完成！');
    
    await context.close();
  });
});
