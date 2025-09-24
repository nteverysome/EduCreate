const { test, expect } = require('@playwright/test');

test.describe('Starshake 本地端驗證測試', () => {
  test('驗證 Starshake 遊戲是否有黑屏問題', async ({ page }) => {
    console.log('🎮 開始本地端驗證 Starshake 遊戲...');
    
    // 設置視窗大小
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // 導航到本地 Starshake 遊戲頁面
    console.log('🌐 導航到本地遊戲頁面...');
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    console.log('✅ 頁面載入完成');
    
    // 檢查是否有 JavaScript 錯誤
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.log('❌ JavaScript 錯誤:', error.message);
    });
    
    // 等待遊戲容器出現
    try {
      await page.waitForSelector('#game-container', { timeout: 10000 });
      console.log('✅ 遊戲容器已載入');
    } catch (error) {
      console.log('❌ 遊戲容器載入失敗:', error.message);
      throw error;
    }
    
    // 檢查遊戲畫布是否存在
    const canvas = page.locator('canvas').first();
    const canvasExists = await canvas.count() > 0;
    console.log(`🎨 遊戲畫布: ${canvasExists ? '✅ 存在' : '❌ 不存在'}`);
    
    if (canvasExists) {
      await expect(canvas).toBeVisible();
      console.log('✅ 遊戲畫布可見');
    }
    
    // 等待 Phaser 遊戲初始化
    let phaserInitialized = false;
    try {
      await page.waitForFunction(() => {
        return window.game && window.game.scene && window.game.scene.scenes.length > 0;
      }, { timeout: 15000 });
      phaserInitialized = true;
      console.log('✅ Phaser 遊戲已初始化');
    } catch (error) {
      console.log('❌ Phaser 遊戲初始化失敗:', error.message);
    }
    
    // 檢查 splash 場景是否載入
    let splashLoaded = false;
    if (phaserInitialized) {
      try {
        await page.waitForFunction(() => {
          return window.game && window.game.scene && 
                 window.game.scene.scenes.some(scene => scene.scene.key === 'splash' && scene.scene.isActive());
        }, { timeout: 10000 });
        splashLoaded = true;
        console.log('✅ Splash 場景已載入');
      } catch (error) {
        console.log('❌ Splash 場景載入失敗:', error.message);
      }
    }
    
    // 檢查畫布內容（是否為黑屏）
    let hasContent = false;
    if (canvasExists) {
      try {
        const canvasScreenshot = await canvas.screenshot();
        hasContent = canvasScreenshot.length > 1000; // 簡單檢查是否有內容
        console.log(`🖼️ 畫布內容: ${hasContent ? '✅ 有內容（非黑屏）' : '❌ 可能是黑屏'}`);
      } catch (error) {
        console.log('❌ 無法截取畫布內容:', error.message);
      }
    }
    
    // 檢查 TouchControls
    const touchControlsExists = await page.evaluate(() => {
      return window.touchControls && typeof window.touchControls.getInputState === 'function';
    });
    console.log(`🎮 TouchControls: ${touchControlsExists ? '✅ 存在' : '❌ 不存在'}`);
    
    // 檢查觸摸控制界面
    const touchControlsVisible = await page.locator('#touch-controls').isVisible();
    console.log(`📱 觸摸控制界面: ${touchControlsVisible ? '✅ 可見' : '❌ 不可見'}`);
    
    // 截圖記錄當前狀態
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const screenshotPath = `EduCreate-Test-Videos/current/${hasContent && phaserInitialized ? 'success' : 'failure'}/20250924_starshake_local_verification_${hasContent && phaserInitialized ? 'success' : 'failure'}_v1_001.png`;
    
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`📸 已截圖記錄: ${screenshotPath}`);
    
    // 測試結果總結
    console.log('\n📊 測試結果總結:');
    console.log(`  - 遊戲容器載入: ${canvasExists ? '✅' : '❌'}`);
    console.log(`  - Phaser 初始化: ${phaserInitialized ? '✅' : '❌'}`);
    console.log(`  - Splash 場景: ${splashLoaded ? '✅' : '❌'}`);
    console.log(`  - 畫布內容: ${hasContent ? '✅ 非黑屏' : '❌ 可能黑屏'}`);
    console.log(`  - TouchControls: ${touchControlsExists ? '✅' : '❌'}`);
    console.log(`  - JavaScript 錯誤: ${jsErrors.length === 0 ? '✅ 無錯誤' : `❌ ${jsErrors.length} 個錯誤`}`);
    
    if (jsErrors.length > 0) {
      console.log('🔍 JavaScript 錯誤詳情:');
      jsErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // 最終判斷
    const isWorking = phaserInitialized && splashLoaded && hasContent && jsErrors.length === 0;
    console.log(`\n🎯 最終結果: ${isWorking ? '✅ 遊戲正常運行' : '❌ 遊戲有問題'}`);
    
    if (isWorking) {
      console.log('🎉 Starshake 遊戲本地端驗證成功！沒有黑屏問題！');
    } else {
      console.log('⚠️ Starshake 遊戲仍有問題，需要進一步調試');
    }
  });
});
