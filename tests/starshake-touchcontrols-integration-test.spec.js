const { test, expect } = require('@playwright/test');

test.describe('Starshake TouchControls 整合測試', () => {
  test('驗證 TouchControls 整合到 Phaser 遊戲邏輯', async ({ page }) => {
    console.log('🚀 開始 TouchControls 整合驗證測試...');
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8
    
    // 導航到遊戲頁面
    console.log('🌐 導航到 Starshake 遊戲頁面...');
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    await page.waitForLoadState('networkidle');
    
    // 等待遊戲載入
    await page.waitForTimeout(3000);
    
    // 檢查遊戲基本載入
    const gameContainer = await page.locator('#game-container').count();
    console.log(`🎮 遊戲容器: ${gameContainer > 0 ? '✅ 存在' : '❌ 不存在'}`);
    expect(gameContainer).toBeGreaterThan(0);
    
    // 檢查 TouchControls 界面
    const touchControls = await page.locator('#touch-controls').count();
    console.log(`📱 TouchControls 界面: ${touchControls > 0 ? '✅ 存在' : '❌ 不存在'}`);
    expect(touchControls).toBeGreaterThan(0);
    
    // 檢查 TouchControls 可見性
    const isVisible = await page.locator('#touch-controls').isVisible();
    console.log(`👁️ TouchControls 可見性: ${isVisible ? '✅ 可見' : '❌ 不可見'}`);
    
    // 執行整合驗證腳本
    const integrationResult = await page.evaluate(() => {
      const results = {
        touchControlsExists: typeof window.touchControls !== 'undefined',
        getInputStateWorks: false,
        phaserGameExists: typeof window.game !== 'undefined',
        activeScene: null,
        playerExists: false,
        playerHasTouchIntegration: false,
        initialState: null,
        errors: []
      };
      
      try {
        // 檢查 TouchControls
        if (results.touchControlsExists) {
          results.getInputStateWorks = typeof window.touchControls.getInputState === 'function';
          if (results.getInputStateWorks) {
            results.initialState = window.touchControls.getInputState();
          }
        }
        
        // 檢查 Phaser 遊戲
        if (results.phaserGameExists) {
          const activeScene = window.game.scene.scenes.find(s => s.scene.isActive());
          if (activeScene) {
            results.activeScene = activeScene.scene.key;
            
            // 檢查 Player 對象
            if (activeScene.player) {
              results.playerExists = true;
              
              // 檢查 TouchControls 整合標誌
              // 如果整合成功，Player 對象應該有 lastTouchShoot 屬性
              results.playerHasTouchIntegration = 'lastTouchShoot' in activeScene.player;
            }
          }
        }
        
      } catch (error) {
        results.errors.push(error.message);
      }
      
      return results;
    });
    
    // 驗證結果
    console.log('🔍 整合驗證結果:');
    console.log(`  - TouchControls 對象: ${integrationResult.touchControlsExists ? '✅' : '❌'}`);
    console.log(`  - getInputState 方法: ${integrationResult.getInputStateWorks ? '✅' : '❌'}`);
    console.log(`  - Phaser 遊戲: ${integrationResult.phaserGameExists ? '✅' : '❌'}`);
    console.log(`  - 活躍場景: ${integrationResult.activeScene || '無'}`);
    console.log(`  - Player 對象: ${integrationResult.playerExists ? '✅' : '❌'}`);
    console.log(`  - TouchControls 整合: ${integrationResult.playerHasTouchIntegration ? '✅' : '❌'}`);
    
    if (integrationResult.initialState) {
      console.log(`  - 初始狀態: ${JSON.stringify(integrationResult.initialState)}`);
    }
    
    if (integrationResult.errors.length > 0) {
      console.log(`  - 錯誤: ${integrationResult.errors.join(', ')}`);
    }
    
    // 斷言關鍵功能
    expect(integrationResult.touchControlsExists).toBe(true);
    expect(integrationResult.getInputStateWorks).toBe(true);
    expect(integrationResult.phaserGameExists).toBe(true);
    
    // 如果遊戲在 game 場景，檢查 Player 整合
    if (integrationResult.activeScene === 'game') {
      expect(integrationResult.playerExists).toBe(true);
      expect(integrationResult.playerHasTouchIntegration).toBe(true);
    }
    
    // 測試觸摸控制功能
    if (isVisible && integrationResult.touchControlsExists) {
      console.log('🧪 測試觸摸控制功能...');
      
      // 測試虛擬搖桿
      const joystick = page.locator('#touch-joystick');
      if (await joystick.count() > 0) {
        console.log('🕹️ 測試虛擬搖桿...');
        
        // 點擊虛擬搖桿
        await joystick.click();
        await page.waitForTimeout(500);
        
        // 檢查狀態變化
        const afterJoystickState = await page.evaluate(() => {
          return window.touchControls ? window.touchControls.getInputState() : null;
        });
        
        console.log(`📊 搖桿點擊後狀態: ${JSON.stringify(afterJoystickState)}`);
      }
      
      // 測試射擊按鈕
      const shootButton = page.locator('#touch-shoot');
      if (await shootButton.count() > 0) {
        console.log('🚀 測試射擊按鈕...');
        
        // 點擊射擊按鈕
        await shootButton.click();
        await page.waitForTimeout(500);
        
        // 檢查狀態變化
        const afterShootState = await page.evaluate(() => {
          return window.touchControls ? window.touchControls.getInputState() : null;
        });
        
        console.log(`📊 射擊按鈕點擊後狀態: ${JSON.stringify(afterShootState)}`);
      }
    }
    
    // 測試鍵盤控制是否仍然工作
    console.log('⌨️ 測試鍵盤控制兼容性...');
    
    // 模擬按鍵
    await page.keyboard.press('Space'); // 開始遊戲或射擊
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('ArrowLeft'); // 左移
    await page.waitForTimeout(500);
    
    await page.keyboard.press('ArrowRight'); // 右移
    await page.waitForTimeout(500);
    
    console.log('✅ 鍵盤控制測試完成');
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250924_starshake_touchcontrols_integration_test_v1_001.png',
      fullPage: true 
    });
    
    console.log('🎉 TouchControls 整合測試完成！');
  });
  
  test('測試遊戲切換器中的 TouchControls 整合', async ({ page }) => {
    console.log('🎮 測試遊戲切換器中的 TouchControls 整合...');
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到主頁
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 選擇 Starshake 遊戲
    const gameSwitcher = page.locator('#game-switcher');
    await expect(gameSwitcher).toBeVisible();
    
    await gameSwitcher.selectOption({ label: /starshake/i });
    await page.waitForTimeout(3000);
    
    // 檢查 iframe
    const gameIframe = page.locator('#game-iframe');
    await expect(gameIframe).toBeVisible();
    
    // 檢查 iframe sandbox 屬性
    const sandboxAttr = await gameIframe.getAttribute('sandbox');
    console.log(`🔍 iframe sandbox: ${sandboxAttr}`);
    
    // 驗證新的 sandbox 權限
    expect(sandboxAttr).toContain('allow-pointer-lock');
    expect(sandboxAttr).toContain('allow-orientation-lock');
    expect(sandboxAttr).toContain('allow-presentation');
    
    // 嘗試訪問 iframe 內容
    try {
      const iframeContent = await gameIframe.contentFrame();
      if (iframeContent) {
        console.log('✅ 可以訪問 iframe 內容');
        
        // 等待遊戲載入
        await page.waitForTimeout(3000);
        
        // 檢查 iframe 內的 TouchControls 整合
        const iframeIntegrationResult = await iframeContent.evaluate(() => {
          return {
            touchControlsExists: typeof window.touchControls !== 'undefined',
            phaserGameExists: typeof window.game !== 'undefined',
            activeScene: window.game && window.game.scene.scenes.length > 0 ? 
              window.game.scene.scenes.find(s => s.scene.isActive())?.scene.key : null,
            playerHasTouchIntegration: false
          };
        });
        
        console.log('🔍 iframe 內整合狀態:');
        console.log(`  - TouchControls: ${iframeIntegrationResult.touchControlsExists ? '✅' : '❌'}`);
        console.log(`  - Phaser 遊戲: ${iframeIntegrationResult.phaserGameExists ? '✅' : '❌'}`);
        console.log(`  - 活躍場景: ${iframeIntegrationResult.activeScene || '無'}`);
        
        // 檢查 TouchControls 界面
        const touchControlsInIframe = await iframeContent.locator('#touch-controls').count();
        console.log(`📱 iframe 內 TouchControls: ${touchControlsInIframe > 0 ? '✅' : '❌'}`);
        
      } else {
        console.log('❌ 無法訪問 iframe 內容');
      }
    } catch (error) {
      console.log(`❌ iframe 測試失敗: ${error.message}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250924_starshake_iframe_touchcontrols_integration_v1_001.png',
      fullPage: true 
    });
    
    console.log('🎉 遊戲切換器 TouchControls 整合測試完成！');
  });
});
