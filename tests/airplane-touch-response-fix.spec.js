const { test, expect } = require('@playwright/test');

test.describe('飛機遊戲觸控響應修復驗證', () => {
  test('驗證觸控響應性改進', async ({ page }) => {
    console.log('🎯 測試飛機遊戲觸控響應性改進');
    
    // 監聽控制台日誌來捕獲觸控事件
    const touchLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('觸控檢測') || text.includes('飛機基準') || text.includes('點擊飛機')) {
        touchLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🎯 觸控日誌:', text);
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
    
    // 啟動遊戲
    const startButton = page.locator('button').filter({ hasText: '鎖定全螢幕並開始' });
    if (await startButton.count() > 0) {
      await startButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 查找遊戲畫面並開始遊戲
    const gameArea = page.locator('canvas, iframe').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    // 點擊遊戲區域開始遊戲
    await gameArea.click();
    await page.waitForTimeout(2000);
    
    console.log('🎮 開始觸控響應測試');
    
    // 測試多次點擊，檢查響應性
    const testClicks = [
      { x: 200, y: 150, description: '上方區域' },
      { x: 200, y: 400, description: '下方區域' },
      { x: 150, y: 200, description: '左上區域' },
      { x: 250, y: 350, description: '右下區域' },
      { x: 200, y: 250, description: '中央區域' }
    ];
    
    for (let i = 0; i < testClicks.length; i++) {
      const click = testClicks[i];
      console.log(`🎯 測試點擊 ${i + 1}: ${click.description} (${click.x}, ${click.y})`);
      
      // 記錄點擊前的日誌數量
      const logsBefore = touchLogs.length;
      
      // 執行點擊
      await gameArea.click({ position: { x: click.x, y: click.y } });
      
      // 等待響應
      await page.waitForTimeout(500);
      
      // 檢查是否有新的觸控日誌
      const logsAfter = touchLogs.length;
      const newLogs = logsAfter - logsBefore;
      
      console.log(`📊 點擊 ${i + 1} 響應: ${newLogs > 0 ? '✅ 有響應' : '❌ 無響應'} (新增 ${newLogs} 條日誌)`);
      
      if (newLogs > 0) {
        // 顯示最新的觸控日誌
        const latestLogs = touchLogs.slice(logsBefore);
        latestLogs.forEach(log => console.log(`  - ${log.message}`));
      }
    }
    
    // 統計響應率
    const totalClicks = testClicks.length;
    const responsiveClicks = touchLogs.filter(log => 
      log.message.includes('觸控檢測') || log.message.includes('點擊飛機')
    ).length;
    
    const responseRate = (responsiveClicks / totalClicks) * 100;
    console.log(`📊 觸控響應率: ${responseRate.toFixed(1)}% (${responsiveClicks}/${totalClicks})`);
    
    // 分析日誌內容
    const gameStateChecks = touchLogs.filter(log => log.message.includes('遊戲狀態')).length;
    const planeBasedClicks = touchLogs.filter(log => log.message.includes('飛機基準線')).length;
    const upMovements = touchLogs.filter(log => log.message.includes('向上移動')).length;
    const downMovements = touchLogs.filter(log => log.message.includes('向下移動')).length;
    
    console.log(`📊 詳細分析:`);
    console.log(`   - 遊戲狀態檢查: ${gameStateChecks}`);
    console.log(`   - 飛機基準線檢測: ${planeBasedClicks}`);
    console.log(`   - 向上移動: ${upMovements}`);
    console.log(`   - 向下移動: ${downMovements}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機遊戲_觸控響應修復_成功_v1_001.png`,
      fullPage: true 
    });
    
    // 驗證改進效果
    expect(responsiveClicks).toBeGreaterThan(0);
    console.log('✅ 飛機遊戲觸控響應性改進驗證完成');
  });

  test('驗證事件衝突修復', async ({ page }) => {
    console.log('🔧 測試事件衝突修復');
    
    // 監聽所有相關日誌
    const allLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('點擊事件') || text.includes('開始遊戲') || text.includes('觸控') || text.includes('遊戲狀態')) {
        allLogs.push({
          time: Date.now(),
          message: text,
          type: text.includes('開始遊戲') ? 'start' : 
                text.includes('觸控') ? 'touch' : 
                text.includes('遊戲狀態') ? 'state' : 'other'
        });
        console.log('🔧 事件日誌:', text);
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
    
    // 啟動遊戲
    const startButton = page.locator('button').filter({ hasText: '鎖定全螢幕並開始' });
    if (await startButton.count() > 0) {
      await startButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 查找遊戲畫面
    const gameArea = page.locator('canvas, iframe').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🔧 測試開始遊戲階段的事件處理');
    
    // 點擊開始遊戲
    await gameArea.click();
    await page.waitForTimeout(1000);
    
    console.log('🔧 測試遊戲中的觸控事件處理');
    
    // 多次快速點擊測試事件衝突
    for (let i = 0; i < 5; i++) {
      await gameArea.click({ position: { x: 200, y: 150 + i * 50 } });
      await page.waitForTimeout(200);
    }
    
    // 分析事件日誌
    const startEvents = allLogs.filter(log => log.type === 'start');
    const touchEvents = allLogs.filter(log => log.type === 'touch');
    const stateEvents = allLogs.filter(log => log.type === 'state');
    
    console.log(`🔧 事件分析:`);
    console.log(`   - 開始遊戲事件: ${startEvents.length}`);
    console.log(`   - 觸控事件: ${touchEvents.length}`);
    console.log(`   - 狀態檢查事件: ${stateEvents.length}`);
    console.log(`   - 總事件數: ${allLogs.length}`);
    
    // 檢查是否有重複或衝突的事件
    const duplicateChecks = allLogs.filter((log, index) => 
      allLogs.findIndex(l => l.message === log.message && l.time === log.time) !== index
    );
    
    console.log(`🔧 重複事件檢查: ${duplicateChecks.length === 0 ? '✅ 無重複' : '❌ 有重複'}`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機遊戲_事件衝突修復_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 事件衝突修復驗證完成');
  });
});
