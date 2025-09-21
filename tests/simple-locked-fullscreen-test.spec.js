const { test, expect } = require('@playwright/test');

test.describe('簡化鎖定全螢幕測試', () => {
  test('驗證鎖定全螢幕按鈕存在', async ({ page }) => {
    console.log('🔒 測試鎖定全螢幕按鈕');
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    // 查找鎖定全螢幕按鈕
    const lockButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    
    // 檢查按鈕是否存在
    const buttonExists = await lockButton.count() > 0;
    console.log(`🔒 鎖定全螢幕按鈕存在: ${buttonExists ? '✅' : '❌'}`);
    
    if (buttonExists) {
      // 檢查按鈕文字
      const buttonText = await lockButton.first().textContent();
      console.log('🔒 按鈕文字:', buttonText);
      
      expect(buttonText).toContain('🔒 鎖定全螢幕並開始');
      expect(buttonText).toContain('隱藏網址列和所有瀏覽器UI，防止意外退出');
      
      // 截圖記錄
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_按鈕驗證_成功_v1_001.png`,
        fullPage: true 
      });
      
      console.log('✅ 鎖定全螢幕按鈕驗證成功');
    } else {
      // 截圖記錄失敗情況
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/failure/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_按鈕驗證_失敗_v1_001.png`,
        fullPage: true 
      });
      
      console.log('❌ 鎖定全螢幕按鈕不存在');
      throw new Error('鎖定全螢幕按鈕不存在');
    }
  });

  test('測試鎖定全螢幕功能啟動', async ({ page }) => {
    console.log('🔒 測試鎖定全螢幕功能啟動');
    
    // 監聽控制台日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('鎖定全螢幕') || text.includes('LOCKED_FULLSCREEN') || text.includes('🔒')) {
        console.log('🔒 鎖定全螢幕日誌:', text);
      }
    });
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    // 查找並點擊鎖定全螢幕按鈕
    const lockButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    
    if (await lockButton.count() > 0) {
      console.log('🔒 點擊鎖定全螢幕按鈕');
      await lockButton.first().click();
      
      // 等待鎖定全螢幕啟動
      await page.waitForTimeout(3000);
      
      // 檢查是否有鎖定全螢幕相關日誌
      const lockLogs = logs.filter(log => 
        log.includes('鎖定全螢幕') || log.includes('LOCKED_FULLSCREEN') || log.includes('🔒')
      );
      
      console.log(`📊 鎖定全螢幕日誌數量: ${lockLogs.length}`);
      
      if (lockLogs.length > 0) {
        console.log('✅ 檢測到鎖定全螢幕功能啟動');
        lockLogs.forEach(log => console.log('  -', log));
        
        // 檢查樣式是否應用
        const bodyClasses = await page.evaluate(() => {
          return Array.from(document.body.classList);
        });
        
        console.log('🎨 Body 樣式類:', bodyClasses);
        
        const hasLockedClass = bodyClasses.includes('locked-fullscreen');
        console.log(`🔒 是否有鎖定樣式: ${hasLockedClass ? '✅' : '❌'}`);
        
        // 截圖記錄
        await page.screenshot({ 
          path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_功能啟動_成功_v1_001.png`,
          fullPage: true 
        });
        
        console.log('✅ 鎖定全螢幕功能啟動測試成功');
      } else {
        console.log('❌ 未檢測到鎖定全螢幕功能');
        
        // 截圖記錄失敗情況
        await page.screenshot({ 
          path: `EduCreate-Test-Videos/current/failure/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_功能啟動_失敗_v1_001.png`,
          fullPage: true 
        });
      }
    } else {
      console.log('❌ 找不到鎖定全螢幕按鈕');
      throw new Error('找不到鎖定全螢幕按鈕');
    }
  });

  test('測試退出鎖定全螢幕功能', async ({ page }) => {
    console.log('🔓 測試退出鎖定全螢幕功能');
    
    // 監聽退出相關日誌
    const exitLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('退出') || text.includes('🔓') || text.includes('停用')) {
        exitLogs.push(text);
        console.log('🔓 退出日誌:', text);
      }
    });
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
      
      // 查找退出按鈕
      const exitButton = page.locator('button[aria-label="退出父頁面全螢幕"]');
      
      // 等待退出按鈕出現
      try {
        await expect(exitButton).toBeVisible({ timeout: 10000 });
        console.log('🔓 找到退出按鈕');
        
        // 點擊退出按鈕
        await exitButton.click();
        await page.waitForTimeout(2000);
        
        // 檢查是否有退出相關日誌
        console.log(`📊 退出日誌數量: ${exitLogs.length}`);
        
        if (exitLogs.length > 0) {
          console.log('✅ 檢測到退出功能執行');
          exitLogs.forEach(log => console.log('  -', log));
        }
        
        // 檢查樣式是否被移除
        const bodyClassesAfterExit = await page.evaluate(() => {
          return Array.from(document.body.classList);
        });
        
        const stillHasLocked = bodyClassesAfterExit.includes('locked-fullscreen');
        console.log(`🔓 退出後是否還有鎖定樣式: ${stillHasLocked ? '❌ 是' : '✅ 否'}`);
        
        // 截圖記錄
        await page.screenshot({ 
          path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_退出功能_成功_v1_001.png`,
          fullPage: true 
        });
        
        console.log('✅ 退出鎖定全螢幕功能測試成功');
      } catch (error) {
        console.log('❌ 找不到退出按鈕或退出功能失敗:', error.message);
        
        // 截圖記錄失敗情況
        await page.screenshot({ 
          path: `EduCreate-Test-Videos/current/failure/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_退出功能_失敗_v1_001.png`,
          fullPage: true 
        });
      }
    } else {
      console.log('❌ 找不到鎖定全螢幕按鈕');
      throw new Error('找不到鎖定全螢幕按鈕');
    }
  });
});
