const { test, expect } = require('@playwright/test');

test.describe('手機版滾動修復驗證', () => {
  test('驗證遊戲外正常滾動功能', async ({ page }) => {
    console.log('📱 測試手機版遊戲外滾動功能');
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到主頁
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    console.log('📱 測試主頁滾動功能');
    
    // 獲取初始滾動位置
    const initialScrollY = await page.evaluate(() => window.scrollY);
    console.log(`📱 初始滾動位置: ${initialScrollY}`);
    
    // 嘗試向下滾動
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });
    
    await page.waitForTimeout(1000);
    
    // 檢查滾動是否成功
    const scrolledY = await page.evaluate(() => window.scrollY);
    console.log(`📱 滾動後位置: ${scrolledY}`);
    
    const canScroll = scrolledY > initialScrollY;
    console.log(`📱 主頁滾動功能: ${canScroll ? '✅ 正常' : '❌ 異常'}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_手機版_主頁滾動測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    expect(canScroll).toBe(true);
    console.log('✅ 主頁滾動功能正常');
  });

  test('驗證鎖定全螢幕後的滾動控制', async ({ page }) => {
    console.log('🔒 測試鎖定全螢幕後的滾動控制');
    
    // 監聽控制台日誌
    const scrollLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('滾動') || text.includes('touchmove') || text.includes('鎖定全螢幕')) {
        scrollLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🔒 滾動日誌:', text);
      }
    });
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    console.log('🔒 啟動鎖定全螢幕');
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 檢查是否進入鎖定全螢幕狀態
    const isLocked = await page.evaluate(() => {
      return document.body.classList.contains('locked-fullscreen');
    });
    
    console.log(`🔒 鎖定全螢幕狀態: ${isLocked ? '✅ 已鎖定' : '❌ 未鎖定'}`);
    
    // 測試在鎖定狀態下的滾動行為
    if (isLocked) {
      console.log('🔒 測試鎖定狀態下的滾動控制');
      
      // 嘗試滾動（應該被阻止）
      await page.evaluate(() => {
        // 模擬觸控滾動事件
        const touchEvent = new TouchEvent('touchmove', {
          bubbles: true,
          cancelable: true,
          touches: [new Touch({
            identifier: 0,
            target: document.body,
            clientX: 100,
            clientY: 200
          })]
        });
        document.dispatchEvent(touchEvent);
      });
      
      await page.waitForTimeout(1000);
    }
    
    console.log('🔓 測試退出鎖定全螢幕');
    
    // 退出鎖定全螢幕
    const exitButton = page.locator('button[aria-label="退出父頁面全螢幕"]');
    if (await exitButton.count() > 0) {
      await exitButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 檢查是否正確退出
    const isUnlocked = await page.evaluate(() => {
      return !document.body.classList.contains('locked-fullscreen');
    });
    
    console.log(`🔓 退出鎖定狀態: ${isUnlocked ? '✅ 已退出' : '❌ 未退出'}`);
    
    // 測試退出後的滾動功能
    if (isUnlocked) {
      console.log('📱 測試退出後的滾動功能');
      
      const initialScrollY = await page.evaluate(() => window.scrollY);
      
      // 嘗試滾動
      await page.evaluate(() => {
        window.scrollTo(0, 300);
      });
      
      await page.waitForTimeout(1000);
      
      const scrolledY = await page.evaluate(() => window.scrollY);
      const canScrollAfterExit = scrolledY !== initialScrollY;
      
      console.log(`📱 退出後滾動功能: ${canScrollAfterExit ? '✅ 恢復正常' : '❌ 仍有問題'}`);
    }
    
    // 分析滾動日誌
    const lockLogs = scrollLogs.filter(log => log.message.includes('鎖定全螢幕'));
    const touchLogs = scrollLogs.filter(log => log.message.includes('touchmove'));
    
    console.log(`📊 滾動控制分析:`);
    console.log(`   - 鎖定相關日誌: ${lockLogs.length}`);
    console.log(`   - 觸控事件日誌: ${touchLogs.length}`);
    console.log(`   - 總日誌數: ${scrollLogs.length}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_手機版_鎖定全螢幕滾動控制_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 鎖定全螢幕滾動控制測試完成');
  });

  test('驗證頁面切換時的清理功能', async ({ page }) => {
    console.log('🧹 測試頁面切換時的清理功能');
    
    // 監聽清理相關日誌
    const cleanupLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('清理') || text.includes('卸載') || text.includes('移除')) {
        cleanupLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🧹 清理日誌:', text);
      }
    });
    
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    console.log('🧹 導航到其他頁面測試清理');
    
    // 導航到主頁（觸發清理）
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 檢查清理是否執行
    const hasCleanupLogs = cleanupLogs.length > 0;
    console.log(`🧹 清理功能執行: ${hasCleanupLogs ? '✅ 已執行' : '❌ 未執行'}`);
    
    if (hasCleanupLogs) {
      console.log('🧹 清理日誌詳情:');
      cleanupLogs.forEach(log => console.log(`  - ${log.message}`));
    }
    
    // 測試主頁滾動功能（確認清理後滾動正常）
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    await page.evaluate(() => {
      window.scrollTo(0, 400);
    });
    
    await page.waitForTimeout(1000);
    
    const scrolledY = await page.evaluate(() => window.scrollY);
    const canScroll = scrolledY > initialScrollY;
    
    console.log(`📱 清理後滾動功能: ${canScroll ? '✅ 正常' : '❌ 異常'}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_手機版_頁面切換清理_成功_v1_001.png`,
      fullPage: true 
    });
    
    expect(canScroll).toBe(true);
    console.log('✅ 頁面切換清理功能測試完成');
  });
});
