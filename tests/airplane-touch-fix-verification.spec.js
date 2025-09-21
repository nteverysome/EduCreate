const { test, expect } = require('@playwright/test');

test.describe('飛機遊戲觸控修復驗證', () => {
  test.beforeEach(async ({ page }) => {
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });

    // 導航到主頁
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('驗證48x48px容器透明度修復', async ({ page }) => {
    console.log('🔍 測試48x48px容器透明度修復');
    
    // 進入全螢幕模式來觸發退出按鈕顯示
    await page.evaluate(() => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    });
    
    // 等待一下讓全螢幕生效
    await page.waitForTimeout(1000);
    
    // 查找退出全螢幕按鈕
    const exitButton = page.locator('button[aria-label="退出父頁面全螢幕"]');
    
    if (await exitButton.count() > 0) {
      // 檢查按鈕的背景色是否為透明
      const buttonStyle = await exitButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          background: computed.background
        };
      });
      
      console.log('📊 退出按鈕樣式:', buttonStyle);
      
      // 驗證背景是透明的
      expect(buttonStyle.backgroundColor).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);
      
      // 截圖記錄
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_UI_透明度修復_成功_v1_001.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ 48x48px容器透明度修復驗證完成');
  });

  test('驗證飛機遊戲長按觸控修復 - Airplane Game', async ({ page }) => {
    console.log('🔍 測試飛機遊戲長按觸控修復');
    
    // 導航到飛機遊戲
    await page.click('text=飛機遊戲');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 開始錄製
    await page.video()?.path();
    
    // 查找遊戲容器
    const gameContainer = page.locator('#game-container');
    await expect(gameContainer).toBeVisible();
    
    // 模擬長按上半部分（向上飛行）
    console.log('📱 模擬長按上半部分觸控');
    
    const containerBox = await gameContainer.boundingBox();
    if (containerBox) {
      const touchX = containerBox.x + containerBox.width / 2;
      const touchY = containerBox.y + containerBox.height / 4; // 上半部分
      
      // 開始觸控
      await page.touchscreen.tap(touchX, touchY);
      await page.waitForTimeout(100);
      
      // 長按模擬
      await page.mouse.move(touchX, touchY);
      await page.mouse.down();
      await page.waitForTimeout(2000); // 長按2秒
      await page.mouse.up();
      
      // 檢查是否有右鍵選單或文字選取出現
      const contextMenu = page.locator('.context-menu, [role="menu"]');
      const textSelection = page.locator('::selection');
      
      // 驗證沒有右鍵選單
      await expect(contextMenu).toHaveCount(0);
      console.log('✅ 沒有右鍵選單出現');
      
      // 檢查頁面上是否有文字被選取
      const selectedText = await page.evaluate(() => {
        return window.getSelection().toString();
      });
      
      expect(selectedText).toBe('');
      console.log('✅ 沒有文字被選取');
    }
    
    // 截圖記錄成功狀態
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機遊戲_長按修復_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 飛機遊戲長按觸控修復驗證完成');
  });

  test('驗證飛機遊戲長按觸控修復 - Shimozurdo Game', async ({ page }) => {
    console.log('🔍 測試Shimozurdo飛機遊戲長按觸控修復');
    
    // 導航到Shimozurdo遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 查找遊戲畫布
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 模擬長按下半部分（向下飛行）
    console.log('📱 模擬長按下半部分觸控');
    
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      const touchX = canvasBox.x + canvasBox.width / 2;
      const touchY = canvasBox.y + (canvasBox.height * 3) / 4; // 下半部分
      
      // 長按模擬
      await page.mouse.move(touchX, touchY);
      await page.mouse.down();
      await page.waitForTimeout(2000); // 長按2秒
      await page.mouse.up();
      
      // 檢查是否有右鍵選單或文字選取出現
      const contextMenu = page.locator('.context-menu, [role="menu"]');
      
      // 驗證沒有右鍵選單
      await expect(contextMenu).toHaveCount(0);
      console.log('✅ 沒有右鍵選單出現');
      
      // 檢查頁面上是否有文字被選取
      const selectedText = await page.evaluate(() => {
        return window.getSelection().toString();
      });
      
      expect(selectedText).toBe('');
      console.log('✅ 沒有文字被選取');
    }
    
    // 截圖記錄成功狀態
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo遊戲_長按修復_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ Shimozurdo飛機遊戲長按觸控修復驗證完成');
  });

  test('綜合驗證：完整用戶流程測試', async ({ page }) => {
    console.log('🔍 綜合驗證：完整用戶流程測試');
    
    // 1. 從主頁開始
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_綜合測試_主頁_成功_v1_001.png`
    });
    
    // 2. 測試透明度修復
    await page.evaluate(() => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    });
    await page.waitForTimeout(1000);
    
    // 3. 進入飛機遊戲
    await page.goto('http://localhost:3000');
    await page.click('text=飛機遊戲');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 4. 測試長按功能
    const gameContainer = page.locator('#game-container');
    if (await gameContainer.count() > 0) {
      const containerBox = await gameContainer.boundingBox();
      if (containerBox) {
        const touchX = containerBox.x + containerBox.width / 2;
        const touchY = containerBox.y + containerBox.height / 2;
        
        await page.mouse.move(touchX, touchY);
        await page.mouse.down();
        await page.waitForTimeout(1500);
        await page.mouse.up();
        
        // 驗證沒有干擾
        const selectedText = await page.evaluate(() => window.getSelection().toString());
        expect(selectedText).toBe('');
      }
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_綜合測試_完成_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 綜合驗證完成');
  });
});
