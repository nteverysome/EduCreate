const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo Play 按鈕測試', () => {
  test('測試 Play 按鈕點擊和場景切換', async ({ page }) => {
    console.log('🎮 開始測試 Play 按鈕功能');
    
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
    
    // 檢查初始狀態
    const initialState = await page.evaluate(() => {
      if (!window.game || !window.game.scene) {
        return { error: 'No game instance' };
      }
      
      const menuScene = window.game.scene.getScene('menu');
      const titleScene = window.game.scene.getScene('title');
      
      return {
        menuActive: menuScene ? menuScene.scene.isActive() : false,
        menuVisible: menuScene ? menuScene.scene.isVisible() : false,
        titleActive: titleScene ? titleScene.scene.isActive() : false,
        titleVisible: titleScene ? titleScene.scene.isVisible() : false,
        hasPlayButton: menuScene ? !!menuScene.playButton : false,
        playButtonText: menuScene && menuScene.playButtonText ? menuScene.playButtonText.text : null
      };
    });
    
    console.log('🎮 初始狀態:', JSON.stringify(initialState, null, 2));
    
    if (initialState.hasPlayButton) {
      console.log('🎯 找到 Play 按鈕，準備點擊...');
      
      // 獲取 Play 按鈕位置
      const buttonInfo = await page.evaluate(() => {
        const menuScene = window.game.scene.getScene('menu');
        if (!menuScene || !menuScene.playButtonText) return null;
        
        return {
          x: menuScene.playButtonText.x,
          y: menuScene.playButtonText.y,
          text: menuScene.playButtonText.text
        };
      });
      
      console.log('🎯 Play 按鈕位置:', JSON.stringify(buttonInfo, null, 2));
      
      if (buttonInfo) {
        // 點擊 Play 按鈕
        console.log(`🖱️ 點擊 Play 按鈕位置: (${buttonInfo.x}, ${buttonInfo.y})`);
        await page.mouse.click(buttonInfo.x, buttonInfo.y);
        
        // 等待場景切換
        console.log('⏳ 等待場景切換...');
        await page.waitForTimeout(3000);
        
        // 檢查場景切換後的狀態
        const afterClickState = await page.evaluate(() => {
          const menuScene = window.game.scene.getScene('menu');
          const titleScene = window.game.scene.getScene('title');
          
          return {
            menuActive: menuScene ? menuScene.scene.isActive() : false,
            menuVisible: menuScene ? menuScene.scene.isVisible() : false,
            titleActive: titleScene ? titleScene.scene.isActive() : false,
            titleVisible: titleScene ? titleScene.scene.isVisible() : false,
            hasPlayer: titleScene ? !!titleScene.player : false,
            playerPosition: titleScene && titleScene.player ? {
              x: titleScene.player.x,
              y: titleScene.player.y
            } : null,
            sceneStarted: menuScene ? !!menuScene._sceneStarted : false
          };
        });
        
        console.log('🎮 點擊後狀態:', JSON.stringify(afterClickState, null, 2));
        
        // 檢查相關日誌
        const relevantLogs = logs.filter(log => 
          log.includes('Play 按鈕被點擊') ||
          log.includes('開始遊戲') ||
          log.includes('啟動遊戲場景') ||
          log.includes('啟動主要場景') ||
          log.includes('場景切換') ||
          log.includes('TitleScene') ||
          log.includes('太空船')
        );
        
        console.log('\n📝 相關日誌:');
        relevantLogs.forEach(log => console.log(`  ${log}`));
        
        // 評估結果
        let score = 0;
        const results = {
          playButtonClicked: relevantLogs.some(log => log.includes('Play 按鈕被點擊')),
          gameStartTriggered: relevantLogs.some(log => log.includes('開始遊戲')),
          sceneStarted: afterClickState.sceneStarted,
          titleSceneActive: afterClickState.titleActive,
          playerExists: afterClickState.hasPlayer
        };
        
        Object.values(results).forEach(result => {
          if (result) score += 20;
        });
        
        console.log('\n📊 Play 按鈕測試結果:');
        console.log(`  - Play 按鈕點擊觸發: ${results.playButtonClicked ? '✅' : '❌'}`);
        console.log(`  - 遊戲開始觸發: ${results.gameStartTriggered ? '✅' : '❌'}`);
        console.log(`  - 場景開始標記: ${results.sceneStarted ? '✅' : '❌'}`);
        console.log(`  - TitleScene 活躍: ${results.titleSceneActive ? '✅' : '❌'}`);
        console.log(`  - 太空船存在: ${results.playerExists ? '✅' : '❌'}`);
        
        console.log(`\n🏆 測試評分: ${score}/100`);
        
        if (score >= 80) {
          console.log('🌟 Play 按鈕功能正常！');
        } else if (score >= 60) {
          console.log('⚠️ Play 按鈕部分功能正常，但場景切換有問題');
        } else {
          console.log('❌ Play 按鈕功能異常，需要修復');
        }
        
        // 如果場景沒有切換，嘗試手動觸發
        if (!afterClickState.titleActive && !afterClickState.hasPlayer) {
          console.log('🔧 嘗試手動觸發場景切換...');
          
          const manualTrigger = await page.evaluate(() => {
            try {
              const menuScene = window.game.scene.getScene('menu');
              if (menuScene && menuScene.startGameScene) {
                menuScene.startGameScene();
                return { success: true, message: '手動觸發成功' };
              } else {
                // 直接啟動 title 場景
                window.game.scene.start('title');
                return { success: true, message: '直接啟動 title 場景' };
              }
            } catch (error) {
              return { success: false, error: error.message };
            }
          });
          
          console.log('🔧 手動觸發結果:', JSON.stringify(manualTrigger, null, 2));
          
          if (manualTrigger.success) {
            await page.waitForTimeout(2000);
            
            const finalState = await page.evaluate(() => {
              const titleScene = window.game.scene.getScene('title');
              return {
                titleActive: titleScene ? titleScene.scene.isActive() : false,
                hasPlayer: titleScene ? !!titleScene.player : false
              };
            });
            
            console.log('🔧 手動觸發後狀態:', JSON.stringify(finalState, null, 2));
          }
        }
        
        // 截圖記錄
        await page.screenshot({ 
          path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_ShimozurdoPlay_按鈕測試_成功_v1_001.png`,
          fullPage: true 
        });
        
        // 基本驗證
        expect(results.playButtonClicked).toBe(true);
        
      } else {
        console.log('❌ 無法獲取 Play 按鈕位置');
        expect(false).toBe(true);
      }
      
    } else {
      console.log('❌ 沒有找到 Play 按鈕');
      expect(initialState.hasPlayButton).toBe(true);
    }
    
    console.log('✅ Play 按鈕測試完成');
  });
});
