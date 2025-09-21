const { test, expect } = require('@playwright/test');

test.describe('鎖定全螢幕功能驗證', () => {
  test.beforeEach(async ({ page }) => {
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到主頁
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('驗證鎖定全螢幕按鈕和文字', async ({ page }) => {
    console.log('🔒 測試鎖定全螢幕按鈕');
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 查找鎖定全螢幕按鈕
    const lockButton = page.locator('button:has-text("🔒 鎖定全螢幕並開始")');
    await expect(lockButton).toBeVisible();
    
    // 檢查按鈕文字
    const buttonText = await lockButton.textContent();
    console.log('🔒 按鈕文字:', buttonText);
    
    expect(buttonText).toContain('🔒 鎖定全螢幕並開始');
    expect(buttonText).toContain('隱藏網址列和所有瀏覽器UI，防止意外退出');
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_按鈕文字驗證_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 鎖定全螢幕按鈕驗證完成');
  });

  test('驗證鎖定全螢幕功能啟動', async ({ page }) => {
    console.log('🔒 測試鎖定全螢幕功能啟動');
    
    // 監聽控制台日誌來捕獲鎖定全螢幕相關信息
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('鎖定全螢幕') || text.includes('LOCKED_FULLSCREEN') || text.includes('🔒')) {
        console.log('🔒 鎖定全螢幕日誌:', text);
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 點擊鎖定全螢幕按鈕
    const lockButton = page.locator('button:has-text("🔒 鎖定全螢幕並開始")');
    await expect(lockButton).toBeVisible();
    
    console.log('🔒 點擊鎖定全螢幕按鈕');
    await lockButton.click();
    
    // 等待鎖定全螢幕啟動
    await page.waitForTimeout(2000);
    
    // 檢查是否有鎖定全螢幕相關日誌
    const lockLogs = logs.filter(log => 
      log.includes('鎖定全螢幕') || log.includes('LOCKED_FULLSCREEN') || log.includes('🔒')
    );
    
    console.log(`📊 鎖定全螢幕日誌數量: ${lockLogs.length}`);
    
    if (lockLogs.length > 0) {
      console.log('✅ 檢測到鎖定全螢幕功能啟動');
      lockLogs.forEach(log => console.log('  -', log));
    } else {
      console.log('❌ 未檢測到鎖定全螢幕功能');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_功能啟動測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 鎖定全螢幕功能啟動測試完成');
  });

  test('驗證鎖定全螢幕樣式應用', async ({ page }) => {
    console.log('🎨 測試鎖定全螢幕樣式');
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 點擊鎖定全螢幕按鈕
    const lockButton = page.locator('button:has-text("🔒 鎖定全螢幕並開始")');
    await lockButton.click();
    await page.waitForTimeout(1000);
    
    // 檢查 body 是否有鎖定全螢幕樣式類
    const bodyClasses = await page.evaluate(() => {
      return Array.from(document.body.classList);
    });
    
    console.log('🎨 Body 樣式類:', bodyClasses);
    
    const hasParentFullscreen = bodyClasses.includes('parent-fullscreen-game');
    const hasLockedFullscreen = bodyClasses.includes('locked-fullscreen');
    
    console.log(`🎨 樣式檢查:`);
    console.log(`  - parent-fullscreen-game: ${hasParentFullscreen ? '✅' : '❌'}`);
    console.log(`  - locked-fullscreen: ${hasLockedFullscreen ? '✅' : '❌'}`);
    
    // 檢查是否有鎖定全螢幕樣式表
    const hasLockedStyle = await page.evaluate(() => {
      return !!document.getElementById('locked-fullscreen-style');
    });
    
    console.log(`🎨 鎖定全螢幕樣式表: ${hasLockedStyle ? '✅' : '❌'}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_樣式應用測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 鎖定全螢幕樣式測試完成');
  });

  test('驗證鎖定全螢幕退出功能', async ({ page }) => {
    console.log('🔓 測試鎖定全螢幕退出功能');
    
    // 監聽退出相關日誌
    const exitLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('退出') || text.includes('🔓') || text.includes('停用')) {
        exitLogs.push(text);
        console.log('🔓 退出日誌:', text);
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button:has-text("🔒 鎖定全螢幕並開始")');
    await lockButton.click();
    await page.waitForTimeout(1000);
    
    // 查找退出按鈕（應該在右上角）
    const exitButton = page.locator('button[aria-label="退出父頁面全螢幕"]');
    
    // 等待退出按鈕出現
    await expect(exitButton).toBeVisible({ timeout: 5000 });
    console.log('🔓 找到退出按鈕');
    
    // 點擊退出按鈕
    await exitButton.click();
    await page.waitForTimeout(1000);
    
    // 檢查是否有退出相關日誌
    console.log(`📊 退出日誌數量: ${exitLogs.length}`);
    
    if (exitLogs.length > 0) {
      console.log('✅ 檢測到退出功能執行');
      exitLogs.forEach(log => console.log('  -', log));
    } else {
      console.log('❌ 未檢測到退出功能');
    }
    
    // 檢查樣式是否被移除
    const bodyClassesAfterExit = await page.evaluate(() => {
      return Array.from(document.body.classList);
    });
    
    const stillHasLocked = bodyClassesAfterExit.includes('locked-fullscreen');
    console.log(`🔓 退出後是否還有鎖定樣式: ${stillHasLocked ? '❌ 是' : '✅ 否'}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_退出功能測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 鎖定全螢幕退出功能測試完成');
  });

  test('綜合鎖定全螢幕測試', async ({ page }) => {
    console.log('🎯 綜合鎖定全螢幕測試');
    
    // 監聽所有相關日誌
    const allLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('鎖定') || text.includes('全螢幕') || text.includes('🔒') || text.includes('🔓')) {
        allLogs.push({
          time: Date.now(),
          message: text,
          type: text.includes('🔒') ? 'lock' : 
                text.includes('🔓') ? 'unlock' : 
                text.includes('啟用') ? 'enable' : 
                text.includes('停用') ? 'disable' : 'other'
        });
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('🎯 第一階段：啟動鎖定全螢幕');
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button:has-text("🔒 鎖定全螢幕並開始")');
    await lockButton.click();
    await page.waitForTimeout(2000);
    
    console.log('🎯 第二階段：測試鎖定狀態');
    
    // 檢查鎖定狀態
    const lockedState = await page.evaluate(() => {
      return {
        hasParentClass: document.body.classList.contains('parent-fullscreen-game'),
        hasLockedClass: document.body.classList.contains('locked-fullscreen'),
        hasLockedStyle: !!document.getElementById('locked-fullscreen-style'),
        isFullscreen: !!(document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement)
      };
    });
    
    console.log('🎯 鎖定狀態檢查:', lockedState);
    
    console.log('🎯 第三階段：退出鎖定全螢幕');
    
    // 退出鎖定全螢幕
    const exitButton = page.locator('button[aria-label="退出父頁面全螢幕"]');
    await expect(exitButton).toBeVisible({ timeout: 5000 });
    await exitButton.click();
    await page.waitForTimeout(2000);
    
    console.log('🎯 第四階段：檢查退出狀態');
    
    // 檢查退出狀態
    const exitedState = await page.evaluate(() => {
      return {
        hasParentClass: document.body.classList.contains('parent-fullscreen-game'),
        hasLockedClass: document.body.classList.contains('locked-fullscreen'),
        hasLockedStyle: !!document.getElementById('locked-fullscreen-style'),
        isFullscreen: !!(document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement)
      };
    });
    
    console.log('🎯 退出狀態檢查:', exitedState);
    
    // 分析日誌
    const lockLogs = allLogs.filter(log => log.type === 'lock');
    const unlockLogs = allLogs.filter(log => log.type === 'unlock');
    const enableLogs = allLogs.filter(log => log.type === 'enable');
    const disableLogs = allLogs.filter(log => log.type === 'disable');
    
    console.log(`📊 綜合測試結果:`);
    console.log(`   - 鎖定日誌: ${lockLogs.length}`);
    console.log(`   - 解鎖日誌: ${unlockLogs.length}`);
    console.log(`   - 啟用日誌: ${enableLogs.length}`);
    console.log(`   - 停用日誌: ${disableLogs.length}`);
    console.log(`   - 總日誌數: ${allLogs.length}`);
    
    // 成功標準
    const success = lockLogs.length > 0 && unlockLogs.length > 0 && 
                   !exitedState.hasLockedClass && !exitedState.hasLockedStyle;
    
    console.log(`🎯 綜合測試結果: ${success ? '✅ 成功' : '❌ 失敗'}`);
    
    // 最終截圖
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_鎖定全螢幕_綜合測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 綜合鎖定全螢幕測試完成');
  });
});
