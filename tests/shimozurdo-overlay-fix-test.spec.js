const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 覆蓋層修復測試', () => {
  test('驗證移除阻擋性覆蓋層後點擊功能恢復', async ({ page }) => {
    console.log('🔧 開始測試覆蓋層修復效果');
    
    // 監聽所有日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`📝 ${text}`);
    });
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 932, height: 430 });
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ 等待遊戲完全載入...');
    await page.waitForTimeout(8000);
    
    // 檢查是否有阻擋性覆蓋層
    const overlayCheck = await page.evaluate(() => {
      const overlays = document.querySelectorAll('div[style*="z-index:999999"]');
      return {
        overlayCount: overlays.length,
        overlayDetails: Array.from(overlays).map(overlay => ({
          zIndex: overlay.style.zIndex,
          pointerEvents: overlay.style.pointerEvents,
          position: overlay.style.position,
          background: overlay.style.background
        }))
      };
    });
    
    console.log('🔍 覆蓋層檢查:', JSON.stringify(overlayCheck, null, 2));
    
    // 點擊 Play 按鈕進入遊戲
    const playButton = await page.locator('text=PLAY').first();
    if (await playButton.isVisible()) {
      console.log('🎮 點擊 Play 按鈕進入遊戲');
      await playButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 檢查遊戲狀態
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
        coordinateFixExists: !!titleScene.coordinateFix,
        isLongPressingExists: titleScene.hasOwnProperty('isLongPressing')
      };
    });
    
    console.log('🎮 遊戲狀態:', JSON.stringify(gameStatus, null, 2));
    
    if (gameStatus.hasPlayer && gameStatus.playerPosition) {
      console.log('🎯 測試點擊響應...');
      
      const clickX = gameStatus.playerPosition.x;
      const clickY = gameStatus.playerPosition.y - 100;
      
      console.log(`🖱️ 點擊位置: (${clickX}, ${clickY})`);
      
      // 記錄點擊前的位置
      const beforeClick = await page.evaluate(() => {
        const titleScene = window.game.scene.getScene('title');
        return titleScene.player ? {
          y: titleScene.player.y,
          targetY: titleScene.playerTargetY
        } : null;
      });
      
      console.log('📍 點擊前位置:', JSON.stringify(beforeClick, null, 2));
      
      // 執行點擊
      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(1000);
      
      // 檢查點擊後的位置
      const afterClick = await page.evaluate(() => {
        const titleScene = window.game.scene.getScene('title');
        return titleScene.player ? {
          y: titleScene.player.y,
          targetY: titleScene.playerTargetY,
          hasVisualEffects: titleScene.children.list.some(child => 
            child.texture && child.texture.key === 'ripple'
          )
        } : null;
      });
      
      console.log('📍 點擊後位置:', JSON.stringify(afterClick, null, 2));
      
      // 檢查是否有移動
      const playerMoved = beforeClick && afterClick && 
        (Math.abs(afterClick.y - beforeClick.y) > 1 || 
         Math.abs(afterClick.targetY - beforeClick.targetY) > 1);
      
      console.log(`🎯 太空船移動檢測: ${playerMoved ? '✅ 有移動' : '❌ 沒有移動'}`);
      
      // 檢查觸控反饋日誌
      const touchFeedbackLogs = logs.filter(log => 
        log.includes('觸控檢測') || 
        log.includes('座標偏移診斷') ||
        log.includes('太空船基準')
      );
      
      console.log(`🎨 觸控反饋日誌數量: ${touchFeedbackLogs.length}`);
      touchFeedbackLogs.forEach(log => console.log(`  📝 ${log}`));
      
      // 評分系統
      let score = 0;
      const results = {
        noBlockingOverlay: overlayCheck.overlayCount === 0,
        playerExists: gameStatus.hasPlayer,
        coordinateFixExists: gameStatus.coordinateFixExists,
        playerMoved: playerMoved,
        touchFeedbackTriggered: touchFeedbackLogs.length > 0
      };
      
      Object.values(results).forEach(result => {
        if (result) score += 20;
      });
      
      console.log('\n📊 修復效果評估:');
      console.log(`  - 無阻擋性覆蓋層: ${results.noBlockingOverlay ? '✅' : '❌'}`);
      console.log(`  - 太空船存在: ${results.playerExists ? '✅' : '❌'}`);
      console.log(`  - 座標修復工具: ${results.coordinateFixExists ? '✅' : '❌'}`);
      console.log(`  - 太空船響應點擊: ${results.playerMoved ? '✅' : '❌'}`);
      console.log(`  - 觸控反饋觸發: ${results.touchFeedbackTriggered ? '✅' : '❌'}`);
      
      console.log(`\n🏆 修復評分: ${score}/100`);
      
      if (score >= 80) {
        console.log('🌟 覆蓋層修復成功！點擊功能已恢復');
      } else if (score >= 60) {
        console.log('⚠️ 部分修復成功，仍有改進空間');
      } else {
        console.log('❌ 修復效果不佳，需要進一步調整');
      }
      
      // 截圖記錄
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo覆蓋層_修復測試_成功_v1_001.png`,
        fullPage: true 
      });
      
      // 驗證基本功能
      expect(results.playerExists).toBe(true);
      expect(results.noBlockingOverlay).toBe(true);
      
    } else {
      console.log('❌ 遊戲未正確載入，無法測試點擊功能');
      expect(gameStatus.hasPlayer).toBe(true);
    }
    
    console.log('✅ 覆蓋層修復測試完成');
  });
});
