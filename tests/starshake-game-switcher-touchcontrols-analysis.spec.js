const { test, expect } = require('@playwright/test');

test.describe('Starshake 遊戲切換器與 TouchControls 分析', () => {
  test('分析遊戲切換器中的 Starshake 和 TouchControls 問題', async ({ page }) => {
    console.log('🎮 開始分析遊戲切換器中的 Starshake...');
    
    // 設置移動設備視窗大小來觸發 TouchControls
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8 大小
    
    // 導航到主頁
    console.log('🌐 導航到主頁...');
    await page.goto('http://localhost:3000/');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    console.log('✅ 主頁載入完成');
    
    // 檢查遊戲切換器是否存在
    const gameSwitcher = page.locator('#game-switcher');
    const gameSwitcherExists = await gameSwitcher.count() > 0;
    console.log(`🎯 遊戲切換器: ${gameSwitcherExists ? '✅ 存在' : '❌ 不存在'}`);
    
    if (gameSwitcherExists) {
      // 檢查 Starshake 選項是否存在
      const starshakeOption = page.locator('#game-switcher option[value*="starshake"]');
      const starshakeExists = await starshakeOption.count() > 0;
      console.log(`🚀 Starshake 選項: ${starshakeExists ? '✅ 存在' : '❌ 不存在'}`);
      
      if (starshakeExists) {
        // 選擇 Starshake 遊戲
        console.log('🎮 選擇 Starshake 遊戲...');
        await gameSwitcher.selectOption({ label: /starshake/i });
        
        // 等待遊戲載入
        await page.waitForTimeout(3000);
        
        // 檢查遊戲 iframe 是否載入
        const gameIframe = page.locator('#game-iframe');
        const iframeExists = await gameIframe.count() > 0;
        console.log(`🖼️ 遊戲 iframe: ${iframeExists ? '✅ 存在' : '❌ 不存在'}`);
        
        if (iframeExists) {
          // 等待 iframe 內容載入
          await page.waitForTimeout(2000);
          
          // 檢查 iframe 的 src
          const iframeSrc = await gameIframe.getAttribute('src');
          console.log(`🔗 iframe src: ${iframeSrc}`);
          
          // 檢查 iframe 內的內容
          try {
            const iframeContent = await gameIframe.contentFrame();
            if (iframeContent) {
              console.log('✅ 可以訪問 iframe 內容');
              
              // 檢查 iframe 內的遊戲容器
              const gameContainer = await iframeContent.locator('#game-container').count();
              console.log(`🎮 iframe 內遊戲容器: ${gameContainer > 0 ? '✅ 存在' : '❌ 不存在'}`);
              
              // 檢查 iframe 內的 TouchControls
              const touchControls = await iframeContent.locator('#touch-controls').count();
              console.log(`📱 iframe 內 TouchControls: ${touchControls > 0 ? '✅ 存在' : '❌ 不存在'}`);
              
              if (touchControls > 0) {
                // 檢查 TouchControls 的可見性
                const touchControlsVisible = await iframeContent.locator('#touch-controls').isVisible();
                console.log(`👁️ TouchControls 可見性: ${touchControlsVisible ? '✅ 可見' : '❌ 不可見'}`);
                
                // 檢查各個觸摸控制元素
                const joystick = await iframeContent.locator('#touch-joystick').count();
                const shootBtn = await iframeContent.locator('#touch-shoot').count();
                const fullscreenBtn = await iframeContent.locator('#fullscreen-btn').count();
                
                console.log(`🕹️ 虛擬搖桿: ${joystick > 0 ? '✅ 存在' : '❌ 不存在'}`);
                console.log(`🚀 射擊按鈕: ${shootBtn > 0 ? '✅ 存在' : '❌ 不存在'}`);
                console.log(`⛶ 全螢幕按鈕: ${fullscreenBtn > 0 ? '✅ 存在' : '❌ 不存在'}`);
                
                // 檢查 TouchControls JavaScript 對象
                const touchControlsJS = await iframeContent.evaluate(() => {
                  return {
                    exists: typeof window.touchControls !== 'undefined',
                    hasGetInputState: window.touchControls && typeof window.touchControls.getInputState === 'function',
                    currentState: window.touchControls ? window.touchControls.getInputState() : null
                  };
                });
                
                console.log('🔍 TouchControls JavaScript 狀態:');
                console.log(`  - 對象存在: ${touchControlsJS.exists ? '✅' : '❌'}`);
                console.log(`  - getInputState 方法: ${touchControlsJS.hasGetInputState ? '✅' : '❌'}`);
                console.log(`  - 當前狀態: ${JSON.stringify(touchControlsJS.currentState)}`);
                
                // 檢查 Phaser 遊戲狀態
                const phaserStatus = await iframeContent.evaluate(() => {
                  return {
                    gameExists: typeof window.game !== 'undefined',
                    sceneCount: window.game ? window.game.scene.scenes.length : 0,
                    activeScene: window.game && window.game.scene.scenes.length > 0 ? 
                      window.game.scene.scenes.find(s => s.scene.isActive())?.scene.key : null
                  };
                });
                
                console.log('🎯 Phaser 遊戲狀態:');
                console.log(`  - 遊戲對象: ${phaserStatus.gameExists ? '✅' : '❌'}`);
                console.log(`  - 場景數量: ${phaserStatus.sceneCount}`);
                console.log(`  - 活躍場景: ${phaserStatus.activeScene || '無'}`);
                
                // 測試觸摸事件
                if (touchControlsJS.exists && joystick > 0) {
                  console.log('🧪 測試虛擬搖桿觸摸事件...');
                  try {
                    await iframeContent.locator('#touch-joystick').click();
                    await page.waitForTimeout(500);
                    
                    const afterClickState = await iframeContent.evaluate(() => {
                      return window.touchControls ? window.touchControls.getInputState() : null;
                    });
                    console.log(`📊 點擊後狀態: ${JSON.stringify(afterClickState)}`);
                  } catch (error) {
                    console.log(`❌ 觸摸測試失敗: ${error.message}`);
                  }
                }
              }
            } else {
              console.log('❌ 無法訪問 iframe 內容（可能是跨域問題）');
            }
          } catch (error) {
            console.log(`❌ iframe 內容檢查失敗: ${error.message}`);
          }
        }
      }
    }
    
    // 截圖記錄當前狀態
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/analysis/20250924_starshake_game_switcher_touchcontrols_analysis_v1_001.png',
      fullPage: true 
    });
    console.log('📸 已截圖記錄分析狀態');
    
    console.log('🎉 Starshake 遊戲切換器與 TouchControls 分析完成！');
  });
  
  test('直接測試 Starshake TouchControls 頁面', async ({ page }) => {
    console.log('🎮 直接測試 Starshake TouchControls 頁面...');
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 直接導航到 Starshake 遊戲頁面
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    await page.waitForLoadState('networkidle');
    
    // 檢查 TouchControls 相關元素
    const touchControlsExists = await page.locator('#touch-controls').count() > 0;
    console.log(`📱 TouchControls 容器: ${touchControlsExists ? '✅ 存在' : '❌ 不存在'}`);
    
    if (touchControlsExists) {
      const isVisible = await page.locator('#touch-controls').isVisible();
      console.log(`👁️ TouchControls 可見: ${isVisible ? '✅ 是' : '❌ 否'}`);
      
      // 檢查 CSS 媒體查詢
      const mediaQueryResult = await page.evaluate(() => {
        return {
          isMobile: window.matchMedia('(max-width: 768px)').matches,
          isTouchDevice: 'ontouchstart' in window,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight
        };
      });
      
      console.log('📱 設備檢測結果:');
      console.log(`  - 媒體查詢 (移動): ${mediaQueryResult.isMobile ? '✅' : '❌'}`);
      console.log(`  - 觸摸設備: ${mediaQueryResult.isTouchDevice ? '✅' : '❌'}`);
      console.log(`  - 螢幕尺寸: ${mediaQueryResult.screenWidth}x${mediaQueryResult.screenHeight}`);
      
      // 檢查 TouchControls JavaScript
      const jsStatus = await page.evaluate(() => {
        return {
          touchControlsExists: typeof window.touchControls !== 'undefined',
          touchControlsClass: typeof TouchControls !== 'undefined',
          initializationError: window.touchControlsError || null
        };
      });
      
      console.log('💻 JavaScript 狀態:');
      console.log(`  - TouchControls 實例: ${jsStatus.touchControlsExists ? '✅' : '❌'}`);
      console.log(`  - TouchControls 類: ${jsStatus.touchControlsClass ? '✅' : '❌'}`);
      console.log(`  - 初始化錯誤: ${jsStatus.initializationError || '無'}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/analysis/20250924_starshake_direct_touchcontrols_test_v1_001.png',
      fullPage: true 
    });
    
    console.log('🎉 直接 TouchControls 測試完成！');
  });
});
