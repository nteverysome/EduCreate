const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 96e93ed 版本測試', () => {
  test('驗證回退到 96e93ed 版本的狀態', async ({ page }) => {
    console.log('🔄 開始測試 96e93ed 版本狀態');
    
    // 監聽關鍵日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('座標') || text.includes('修復') || text.includes('場景') || text.includes('載入')) {
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
    
    console.log('⏳ 等待遊戲載入...');
    await page.waitForTimeout(8000);
    
    // 檢查遊戲基本狀態
    const gameStatus = await page.evaluate(() => {
      if (!window.game || !window.game.scene) {
        return { error: 'No game instance' };
      }
      
      const activeScenes = window.game.scene.getScenes(true).map(s => ({
        key: s.scene.key,
        isActive: s.scene.isActive(),
        isVisible: s.scene.isVisible()
      }));
      
      // 檢查座標修復工具是否存在
      const hasCoordinateFix = !!window.CoordinateFix;
      
      return {
        gameRunning: window.game.isRunning,
        totalScenes: Object.keys(window.game.scene.scenes).length,
        activeScenes: activeScenes,
        hasCoordinateFix: hasCoordinateFix
      };
    });
    
    console.log('🎮 遊戲狀態:', JSON.stringify(gameStatus, null, 2));
    
    // 檢查 Canvas 狀態
    const canvasStatus = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        exists: !!canvas,
        visible: canvas ? canvas.offsetWidth > 0 && canvas.offsetHeight > 0 : false,
        size: canvas ? { width: canvas.offsetWidth, height: canvas.offsetHeight } : null
      };
    });
    
    console.log('🖼️ Canvas 狀態:', JSON.stringify(canvasStatus, null, 2));
    
    // 檢查是否有 Play 按鈕或鎖定全螢幕按鈕
    const buttonStatus = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return {
        totalButtons: buttons.length,
        buttonTexts: buttons.map(btn => btn.textContent.trim()),
        hasLockButton: buttons.some(btn => 
          btn.textContent.includes('鎖定全螢幕') || 
          btn.textContent.includes('開始')
        )
      };
    });
    
    console.log('🔒 按鈕狀態:', JSON.stringify(buttonStatus, null, 2));
    
    // 如果有鎖定全螢幕按鈕，嘗試點擊
    if (buttonStatus.hasLockButton) {
      console.log('🔒 發現鎖定全螢幕按鈕，嘗試點擊...');
      
      const lockButton = page.locator('button').filter({ 
        hasText: /鎖定全螢幕|開始/ 
      });
      
      if (await lockButton.count() > 0) {
        await lockButton.first().click();
        console.log('✅ 已點擊鎖定全螢幕按鈕');
        
        await page.waitForTimeout(3000);
        
        // 檢查點擊後的遊戲狀態
        const afterClickStatus = await page.evaluate(() => {
          if (!window.game || !window.game.scene) {
            return { error: 'No game instance' };
          }
          
          const titleScene = window.game.scene.getScene('title');
          if (!titleScene) {
            return { error: 'No title scene' };
          }
          
          return {
            titleSceneActive: titleScene.scene.isActive(),
            titleSceneVisible: titleScene.scene.isVisible(),
            hasPlayer: !!titleScene.player,
            playerVisible: titleScene.player ? titleScene.player.visible : false,
            hasCoordinateFix: !!titleScene.coordinateFix
          };
        });
        
        console.log('🎮 點擊後遊戲狀態:', JSON.stringify(afterClickStatus, null, 2));
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo版本_96e93ed回退_成功_v1_001.png`,
      fullPage: true 
    });
    
    // 總結結果
    console.log('\n📊 96e93ed 版本測試結果:');
    console.log(`  - 遊戲實例存在: ${gameStatus.gameRunning ? '✅' : '❌'}`);
    console.log(`  - Canvas 可見: ${canvasStatus.visible ? '✅' : '❌'}`);
    console.log(`  - 座標修復工具: ${gameStatus.hasCoordinateFix ? '✅' : '❌'}`);
    console.log(`  - 場景數量: ${gameStatus.totalScenes || 0}`);
    console.log(`  - 鎖定按鈕: ${buttonStatus.hasLockButton ? '✅' : '❌'}`);
    
    let versionScore = 0;
    if (gameStatus.gameRunning) versionScore += 25;
    if (canvasStatus.visible) versionScore += 25;
    if (gameStatus.hasCoordinateFix) versionScore += 25;
    if (buttonStatus.hasLockButton) versionScore += 25;
    
    console.log(`\n🏆 版本狀態評分: ${versionScore}/100`);
    
    if (versionScore >= 75) {
      console.log('🌟 優秀：96e93ed 版本狀態良好');
    } else if (versionScore >= 50) {
      console.log('👍 良好：基本功能正常');
    } else {
      console.log('⚠️ 需檢查：版本可能有問題');
    }
    
    console.log('✅ 96e93ed 版本測試完成');
    
    // 基本驗證
    expect(gameStatus.gameRunning).toBe(true);
    expect(canvasStatus.visible).toBe(true);
  });
});
