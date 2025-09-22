const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 手機版診斷測試', () => {
  test('診斷手機橫向模式座標偏移和視覺反饋問題', async ({ page }) => {
    console.log('📱 開始診斷手機版問題');
    
    // 監聽所有日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`📝 ${text}`);
    });
    
    // 設置手機橫向模式 (iPhone 14 Pro 橫向)
    await page.setViewportSize({ width: 932, height: 430 });
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ 等待遊戲完全載入...');
    await page.waitForTimeout(8000);
    
    // 檢查遊戲基本狀態
    const gameStatus = await page.evaluate(() => {
      if (!window.game || !window.game.scene) {
        return { error: 'No game instance' };
      }
      
      const titleScene = window.game.scene.getScene('title');
      if (!titleScene) {
        return { error: 'No title scene' };
      }
      
      return {
        sceneActive: titleScene.scene.isActive(),
        sceneVisible: titleScene.scene.isVisible(),
        hasPlayer: !!titleScene.player,
        playerPosition: titleScene.player ? {
          x: titleScene.player.x,
          y: titleScene.player.y
        } : null,
        canvasSize: {
          width: window.game.canvas.width,
          height: window.game.canvas.height
        },
        gameSize: {
          width: window.game.config.width,
          height: window.game.config.height
        },
        scaleMode: window.game.scale.scaleMode,
        zoom: titleScene.cameras.main.zoom
      };
    });
    
    console.log('🎮 遊戲狀態:', JSON.stringify(gameStatus, null, 2));
    
    // 檢查視覺反饋系統
    const visualFeedbackStatus = await page.evaluate(() => {
      const titleScene = window.game.scene.getScene('title');
      if (!titleScene) return { error: 'No title scene' };
      
      return {
        hasShowPlayerFeedback: typeof titleScene.showPlayerFeedback === 'function',
        hasShowTouchFeedback: typeof titleScene.showTouchFeedback === 'function',
        hasCreateVisualFeedback: typeof titleScene.createVisualFeedback === 'function',
        touchHandlerExists: !!titleScene.touchHandler,
        coordinateFixExists: !!titleScene.coordinateFix
      };
    });
    
    console.log('🎨 視覺反饋系統:', JSON.stringify(visualFeedbackStatus, null, 2));
    
    // 測試觸控點擊
    if (gameStatus.playerPosition) {
      console.log('🎯 測試觸控點擊...');
      
      // 點擊太空船上方
      const clickX = gameStatus.playerPosition.x;
      const clickY = gameStatus.playerPosition.y - 100;
      
      console.log(`🖱️ 點擊位置: (${clickX}, ${clickY})`);
      
      // 監聽觸控事件
      const touchResult = await page.evaluate((x, y) => {
        const titleScene = window.game.scene.getScene('title');
        if (!titleScene) return { error: 'No title scene' };
        
        // 模擬觸控事件
        const pointer = {
          x: x,
          y: y,
          worldX: x,
          worldY: y
        };
        
        let result = {
          clickProcessed: false,
          visualFeedbackTriggered: false,
          playerMoved: false,
          originalPlayerY: titleScene.player.y
        };
        
        // 檢查是否有觸控處理
        if (titleScene.input && titleScene.input.activePointer) {
          result.hasInputSystem = true;
        }
        
        // 嘗試觸發觸控事件
        try {
          if (typeof titleScene.showPlayerFeedback === 'function') {
            titleScene.showPlayerFeedback('up');
            result.visualFeedbackTriggered = true;
          }
          
          if (typeof titleScene.showTouchFeedback === 'function') {
            titleScene.showTouchFeedback(x, y);
            result.touchFeedbackTriggered = true;
          }
          
          result.clickProcessed = true;
        } catch (error) {
          result.error = error.message;
        }
        
        return result;
      }, clickX, clickY);
      
      console.log('🎯 觸控測試結果:', JSON.stringify(touchResult, null, 2));
      
      // 實際點擊測試
      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(1000);
      
      // 檢查點擊後的狀態
      const afterClickStatus = await page.evaluate(() => {
        const titleScene = window.game.scene.getScene('title');
        if (!titleScene) return { error: 'No title scene' };
        
        return {
          playerY: titleScene.player.y,
          playerTargetY: titleScene.playerTargetY || 'undefined',
          hasVisualEffects: titleScene.children.list.some(child => 
            child.texture && (child.texture.key === 'ripple' || child.alpha < 1)
          )
        };
      });
      
      console.log('🎯 點擊後狀態:', JSON.stringify(afterClickStatus, null, 2));
    }
    
    // 檢查座標系統
    const coordinateStatus = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'No canvas' };
      
      const rect = canvas.getBoundingClientRect();
      
      return {
        canvasRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        },
        canvasActual: {
          width: canvas.width,
          height: canvas.height
        },
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        scaleRatio: {
          x: canvas.width / rect.width,
          y: canvas.height / rect.height
        }
      };
    });
    
    console.log('📐 座標系統狀態:', JSON.stringify(coordinateStatus, null, 2));
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo手機_診斷測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    // 總結診斷結果
    console.log('\n📊 手機版診斷結果:');
    console.log(`  - 場景可見: ${gameStatus.sceneVisible ? '✅' : '❌'}`);
    console.log(`  - 太空船存在: ${gameStatus.hasPlayer ? '✅' : '❌'}`);
    console.log(`  - 視覺反饋系統: ${visualFeedbackStatus.hasShowPlayerFeedback ? '✅' : '❌'}`);
    console.log(`  - 座標修復工具: ${visualFeedbackStatus.coordinateFixExists ? '✅' : '❌'}`);
    
    let diagnosisScore = 0;
    if (gameStatus.sceneVisible) diagnosisScore += 25;
    if (gameStatus.hasPlayer) diagnosisScore += 25;
    if (visualFeedbackStatus.hasShowPlayerFeedback) diagnosisScore += 25;
    if (visualFeedbackStatus.coordinateFixExists) diagnosisScore += 25;
    
    console.log(`\n🏆 診斷評分: ${diagnosisScore}/100`);
    
    if (diagnosisScore < 75) {
      console.log('⚠️ 發現問題：手機版功能不完整');
      
      if (!gameStatus.sceneVisible) {
        console.log('❌ 問題1：場景不可見 - 可能是 scene.launch() vs scene.start() 問題');
      }
      
      if (!visualFeedbackStatus.hasShowPlayerFeedback) {
        console.log('❌ 問題2：視覺反饋系統缺失 - 沒有綠色波紋和太空船閃爍效果');
      }
      
      if (!visualFeedbackStatus.coordinateFixExists) {
        console.log('❌ 問題3：座標修復工具缺失 - 可能導致座標偏移');
      }
    } else {
      console.log('🌟 手機版功能正常');
    }
    
    console.log('✅ 手機版診斷完成');
    
    // 基本驗證
    expect(gameStatus.hasPlayer).toBe(true);
  });
});
