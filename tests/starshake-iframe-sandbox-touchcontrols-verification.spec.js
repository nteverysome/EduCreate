const { test, expect } = require('@playwright/test');

test.describe('Starshake iframe Sandbox 和 TouchControls 驗證', () => {
  test('驗證 iframe sandbox 優化和 TouchControls 功能', async ({ page }) => {
    console.log('🔧 開始驗證 iframe sandbox 優化和 TouchControls...');
    
    // 設置移動設備視窗來觸發 TouchControls
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8
    
    // 導航到主頁
    console.log('🌐 導航到主頁...');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 檢查遊戲切換器
    const gameSwitcher = page.locator('#game-switcher');
    await expect(gameSwitcher).toBeVisible();
    console.log('✅ 遊戲切換器可見');
    
    // 選擇 Starshake 遊戲
    console.log('🎮 選擇 Starshake 遊戲...');
    await gameSwitcher.selectOption({ label: /starshake/i });
    await page.waitForTimeout(3000); // 等待遊戲載入
    
    // 檢查 iframe
    const gameIframe = page.locator('#game-iframe');
    await expect(gameIframe).toBeVisible();
    console.log('✅ 遊戲 iframe 可見');
    
    // 檢查 iframe 的 sandbox 屬性
    const sandboxAttr = await gameIframe.getAttribute('sandbox');
    console.log(`🔍 iframe sandbox 屬性: ${sandboxAttr}`);
    
    // 驗證新增的 sandbox 權限
    const expectedPermissions = [
      'allow-same-origin',
      'allow-scripts', 
      'allow-forms',
      'allow-popups',
      'allow-modals',
      'allow-pointer-lock',
      'allow-orientation-lock',
      'allow-presentation',
      'allow-top-navigation-by-user-activation'
    ];
    
    expectedPermissions.forEach(permission => {
      const hasPermission = sandboxAttr.includes(permission);
      console.log(`${hasPermission ? '✅' : '❌'} ${permission}`);
      expect(sandboxAttr).toContain(permission);
    });
    
    // 嘗試訪問 iframe 內容
    try {
      const iframeContent = await gameIframe.contentFrame();
      if (iframeContent) {
        console.log('✅ 可以訪問 iframe 內容');
        
        // 等待遊戲載入
        await page.waitForTimeout(2000);
        
        // 檢查 TouchControls DOM 元素
        const touchControls = await iframeContent.locator('#touch-controls').count();
        console.log(`📱 TouchControls 容器: ${touchControls > 0 ? '✅ 存在' : '❌ 不存在'}`);
        
        if (touchControls > 0) {
          // 檢查 TouchControls 可見性
          const isVisible = await iframeContent.locator('#touch-controls').isVisible();
          console.log(`👁️ TouchControls 可見: ${isVisible ? '✅ 是' : '❌ 否'}`);
          
          // 檢查各個控制元素
          const joystick = await iframeContent.locator('#touch-joystick').count();
          const shootBtn = await iframeContent.locator('#touch-shoot').count();
          const fullscreenBtn = await iframeContent.locator('#fullscreen-btn').count();
          
          console.log(`🕹️ 虛擬搖桿: ${joystick > 0 ? '✅' : '❌'}`);
          console.log(`🚀 射擊按鈕: ${shootBtn > 0 ? '✅' : '❌'}`);
          console.log(`⛶ 全螢幕按鈕: ${fullscreenBtn > 0 ? '✅' : '❌'}`);
          
          // 檢查 TouchControls JavaScript 對象
          const touchControlsJS = await iframeContent.evaluate(() => {
            return {
              exists: typeof window.touchControls !== 'undefined',
              hasGetInputState: window.touchControls && typeof window.touchControls.getInputState === 'function',
              currentState: window.touchControls ? window.touchControls.getInputState() : null,
              domElementsCount: {
                touchControls: document.querySelectorAll('#touch-controls').length,
                joystick: document.querySelectorAll('#touch-joystick').length,
                shootBtn: document.querySelectorAll('#touch-shoot').length,
                fullscreenBtn: document.querySelectorAll('#fullscreen-btn').length
              }
            };
          });
          
          console.log('🔍 TouchControls JavaScript 狀態:');
          console.log(`  - 對象存在: ${touchControlsJS.exists ? '✅' : '❌'}`);
          console.log(`  - getInputState 方法: ${touchControlsJS.hasGetInputState ? '✅' : '❌'}`);
          console.log(`  - DOM 元素數量: ${JSON.stringify(touchControlsJS.domElementsCount)}`);
          
          if (touchControlsJS.currentState) {
            console.log(`  - 當前狀態: ${JSON.stringify(touchControlsJS.currentState)}`);
          }
          
          // 檢查 CSS 媒體查詢
          const mediaQueryResult = await iframeContent.evaluate(() => {
            return {
              isMobile: window.matchMedia('(max-width: 768px)').matches,
              isTouchDevice: 'ontouchstart' in window,
              screenWidth: window.innerWidth,
              screenHeight: window.innerHeight,
              touchControlsDisplay: window.getComputedStyle(document.getElementById('touch-controls')).display
            };
          });
          
          console.log('📱 設備和媒體查詢檢測:');
          console.log(`  - 媒體查詢 (移動): ${mediaQueryResult.isMobile ? '✅' : '❌'}`);
          console.log(`  - 觸摸設備: ${mediaQueryResult.isTouchDevice ? '✅' : '❌'}`);
          console.log(`  - 螢幕尺寸: ${mediaQueryResult.screenWidth}x${mediaQueryResult.screenHeight}`);
          console.log(`  - TouchControls display: ${mediaQueryResult.touchControlsDisplay}`);
          
          // 測試觸摸事件（如果元素可見）
          if (isVisible && joystick > 0) {
            console.log('🧪 測試虛擬搖桿觸摸事件...');
            try {
              // 點擊虛擬搖桿
              await iframeContent.locator('#touch-joystick').click();
              await page.waitForTimeout(500);
              
              // 檢查點擊後的狀態
              const afterClickState = await iframeContent.evaluate(() => {
                return window.touchControls ? window.touchControls.getInputState() : null;
              });
              
              console.log(`📊 點擊後狀態: ${JSON.stringify(afterClickState)}`);
              
              // 測試射擊按鈕
              if (shootBtn > 0) {
                console.log('🧪 測試射擊按鈕...');
                await iframeContent.locator('#touch-shoot').click();
                await page.waitForTimeout(500);
                
                const afterShootState = await iframeContent.evaluate(() => {
                  return window.touchControls ? window.touchControls.getInputState() : null;
                });
                
                console.log(`🚀 射擊後狀態: ${JSON.stringify(afterShootState)}`);
              }
              
            } catch (error) {
              console.log(`❌ 觸摸測試失敗: ${error.message}`);
            }
          }
          
          // 檢查 Phaser 遊戲整合
          const phaserIntegration = await iframeContent.evaluate(() => {
            return {
              gameExists: typeof window.game !== 'undefined',
              sceneCount: window.game ? window.game.scene.scenes.length : 0,
              activeScene: window.game && window.game.scene.scenes.length > 0 ? 
                window.game.scene.scenes.find(s => s.scene.isActive())?.scene.key : null,
              playerExists: window.game && window.game.scene.scenes.length > 0 ? 
                window.game.scene.scenes.some(s => s.player) : false
            };
          });
          
          console.log('🎯 Phaser 遊戲整合狀態:');
          console.log(`  - 遊戲對象: ${phaserIntegration.gameExists ? '✅' : '❌'}`);
          console.log(`  - 場景數量: ${phaserIntegration.sceneCount}`);
          console.log(`  - 活躍場景: ${phaserIntegration.activeScene || '無'}`);
          console.log(`  - Player 對象: ${phaserIntegration.playerExists ? '✅' : '❌'}`);
        }
        
      } else {
        console.log('❌ 無法訪問 iframe 內容');
      }
    } catch (error) {
      console.log(`❌ iframe 內容檢查失敗: ${error.message}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250924_starshake_iframe_sandbox_touchcontrols_verification_v1_001.png',
      fullPage: true 
    });
    
    console.log('🎉 iframe sandbox 和 TouchControls 驗證完成！');
  });
  
  test('直接測試 Starshake 頁面的 TouchControls', async ({ page }) => {
    console.log('🎮 直接測試 Starshake 頁面的 TouchControls...');
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 直接導航到 Starshake 遊戲頁面
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面載入
    const gameContainer = await page.locator('#game-container').count();
    console.log(`🎮 遊戲容器: ${gameContainer > 0 ? '✅ 存在' : '❌ 不存在'}`);
    
    // 檢查 TouchControls
    const touchControlsExists = await page.locator('#touch-controls').count() > 0;
    console.log(`📱 TouchControls 容器: ${touchControlsExists ? '✅ 存在' : '❌ 不存在'}`);
    
    if (touchControlsExists) {
      const isVisible = await page.locator('#touch-controls').isVisible();
      console.log(`👁️ TouchControls 可見: ${isVisible ? '✅ 是' : '❌ 否'}`);
      
      // 執行 TouchControls 測試腳本
      const testResult = await page.evaluate(() => {
        // 內嵌測試腳本
        const results = {
          touchControlsExists: typeof window.touchControls !== 'undefined',
          getInputStateExists: window.touchControls && typeof window.touchControls.getInputState === 'function',
          currentState: null,
          domElements: {},
          mediaQuery: {},
          errors: []
        };
        
        try {
          if (results.touchControlsExists && results.getInputStateExists) {
            results.currentState = window.touchControls.getInputState();
          }
          
          results.domElements = {
            touchControls: document.querySelectorAll('#touch-controls').length,
            joystick: document.querySelectorAll('#touch-joystick').length,
            shootBtn: document.querySelectorAll('#touch-shoot').length,
            fullscreenBtn: document.querySelectorAll('#fullscreen-btn').length
          };
          
          results.mediaQuery = {
            isMobile: window.matchMedia('(max-width: 768px)').matches,
            isTouchDevice: 'ontouchstart' in window,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
          };
          
        } catch (error) {
          results.errors.push(error.message);
        }
        
        return results;
      });
      
      console.log('📊 直接測試結果:');
      console.log(`  - TouchControls 對象: ${testResult.touchControlsExists ? '✅' : '❌'}`);
      console.log(`  - getInputState 方法: ${testResult.getInputStateExists ? '✅' : '❌'}`);
      console.log(`  - DOM 元素: ${JSON.stringify(testResult.domElements)}`);
      console.log(`  - 媒體查詢: ${JSON.stringify(testResult.mediaQuery)}`);
      
      if (testResult.currentState) {
        console.log(`  - 當前狀態: ${JSON.stringify(testResult.currentState)}`);
      }
      
      if (testResult.errors.length > 0) {
        console.log(`  - 錯誤: ${testResult.errors.join(', ')}`);
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250924_starshake_direct_touchcontrols_test_v1_001.png',
      fullPage: true 
    });
    
    console.log('🎉 直接 TouchControls 測試完成！');
  });
});
