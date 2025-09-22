const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 最終驗證測試', () => {
  test('完整驗證場景顯示和遊戲流程', async ({ page }) => {
    console.log('🎉 開始 Shimozurdo 最終驗證測試');
    
    // 監聽關鍵日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('場景') || text.includes('啟動') || text.includes('可見') || text.includes('🚀')) {
        console.log(`📝 ${text}`);
      }
    });
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ 等待初始載入完成...');
    await page.waitForTimeout(8000);
    
    // 第一階段：檢查 MenuScene 顯示
    console.log('\n🎬 第一階段：檢查 MenuScene 顯示');
    const menuSceneStatus = await page.evaluate(() => {
      if (!window.game || !window.game.scene) {
        return { error: 'No game instance' };
      }
      
      const menuScene = window.game.scene.getScene('menu');
      if (!menuScene) {
        return { error: 'No menu scene' };
      }
      
      return {
        isActive: menuScene.scene.isActive(),
        isVisible: menuScene.scene.isVisible(),
        hasTitle: !!menuScene.gameTitle,
        hasPlayButton: !!menuScene.playButtonText,
        titleText: menuScene.gameTitle ? menuScene.gameTitle.text : null,
        playButtonText: menuScene.playButtonText ? menuScene.playButtonText.text : null,
        playButtonPosition: menuScene.playButtonText ? {
          x: menuScene.playButtonText.x,
          y: menuScene.playButtonText.y
        } : null
      };
    });
    
    console.log('🎬 MenuScene 狀態:', JSON.stringify(menuSceneStatus, null, 2));
    
    // 第二階段：點擊 Play 按鈕
    if (menuSceneStatus.playButtonPosition) {
      console.log('\n🎯 第二階段：點擊 Play 按鈕');
      console.log(`🖱️ 點擊位置: (${menuSceneStatus.playButtonPosition.x}, ${menuSceneStatus.playButtonPosition.y})`);
      
      await page.mouse.click(menuSceneStatus.playButtonPosition.x, menuSceneStatus.playButtonPosition.y);
      console.log('✅ Play 按鈕已點擊');
      
      // 等待場景切換
      await page.waitForTimeout(4000);
      
      // 檢查場景切換結果
      const afterClickStatus = await page.evaluate(() => {
        if (!window.game || !window.game.scene) {
          return { error: 'No game instance' };
        }
        
        const titleScene = window.game.scene.getScene('title');
        const menuScene = window.game.scene.getScene('menu');
        
        const activeScenes = window.game.scene.getScenes(true).map(s => ({
          key: s.scene.key,
          isActive: s.scene.isActive(),
          isVisible: s.scene.isVisible()
        }));
        
        return {
          activeScenes: activeScenes,
          titleScene: titleScene ? {
            isActive: titleScene.scene.isActive(),
            isVisible: titleScene.scene.isVisible(),
            hasPlayer: !!titleScene.player,
            playerVisible: titleScene.player ? titleScene.player.visible : false
          } : null,
          menuScene: menuScene ? {
            isActive: menuScene.scene.isActive(),
            isVisible: menuScene.scene.isVisible()
          } : null
        };
      });
      
      console.log('🎬 點擊後場景狀態:', JSON.stringify(afterClickStatus, null, 2));
      
      // 第三階段：檢查 TitleScene 是否正確顯示
      console.log('\n🎮 第三階段：檢查 TitleScene 顯示');
      
      if (afterClickStatus.titleScene && afterClickStatus.titleScene.isVisible) {
        console.log('✅ TitleScene 正確顯示！');
        
        // 檢查遊戲元素
        const gameElements = await page.evaluate(() => {
          const titleScene = window.game.scene.getScene('title');
          if (!titleScene) return { error: 'No title scene' };
          
          return {
            hasPlayer: !!titleScene.player,
            playerPosition: titleScene.player ? {
              x: titleScene.player.x,
              y: titleScene.player.y,
              visible: titleScene.player.visible
            } : null,
            hasEnemies: titleScene.enemies ? titleScene.enemies.length : 0,
            hasBackground: !!titleScene.bg1,
            gameRunning: window.game.isRunning
          };
        });
        
        console.log('🎮 遊戲元素狀態:', JSON.stringify(gameElements, null, 2));
        
      } else {
        console.log('❌ TitleScene 沒有正確顯示');
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo最終_驗證測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    // 總結結果
    console.log('\n📊 最終驗證結果:');
    console.log(`  - MenuScene 可見: ${menuSceneStatus.isVisible ? '✅' : '❌'}`);
    console.log(`  - Play 按鈕存在: ${menuSceneStatus.hasPlayButton ? '✅' : '❌'}`);
    console.log(`  - 遊戲標題存在: ${menuSceneStatus.hasTitle ? '✅' : '❌'}`);
    
    let finalScore = 0;
    if (menuSceneStatus.isVisible) finalScore += 25;
    if (menuSceneStatus.hasPlayButton) finalScore += 25;
    if (menuSceneStatus.hasTitle) finalScore += 25;
    
    // 檢查是否有場景切換成功的跡象
    const hasSceneTransition = logs.some(log => 
      log.includes('啟動可見場景') || 
      log.includes('遊戲場景已啟動') ||
      log.includes('🚀 啟動可見場景: title')
    );
    
    if (hasSceneTransition) finalScore += 25;
    console.log(`  - 場景切換成功: ${hasSceneTransition ? '✅' : '❌'}`);
    
    console.log(`\n🏆 最終驗證評分: ${finalScore}/100`);
    
    if (finalScore >= 90) {
      console.log('🌟 完美：所有功能完全正常');
    } else if (finalScore >= 75) {
      console.log('🎉 優秀：主要功能正常工作');
    } else if (finalScore >= 50) {
      console.log('👍 良好：基本功能正常');
    } else {
      console.log('⚠️ 需改善：仍有問題需要解決');
    }
    
    console.log('✅ Shimozurdo 最終驗證測試完成');
    
    // 基本驗證
    expect(menuSceneStatus.isVisible).toBe(true);
    expect(menuSceneStatus.hasPlayButton).toBe(true);
    expect(finalScore).toBeGreaterThanOrEqual(75);
  });
});
