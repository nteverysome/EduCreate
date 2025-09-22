const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 用戶體驗優化測試', () => {
  test('響應延遲優化測試 - 橫向模式', async ({ page }) => {
    console.log('🚀 測試 Shimozurdo 橫向模式響應延遲優化');
    
    // 監聽性能相關日誌
    const performanceLogs = [];
    const feedbackLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('觸控響應時間') || text.includes('響應延遲')) {
        performanceLogs.push({
          time: Date.now(),
          message: text,
          responseTime: parseFloat(text.match(/(\d+\.\d+)ms/)?.[1] || '0')
        });
        console.log('⚡ 性能日誌:', text);
      }
      
      if (text.includes('太空船基準') || text.includes('向上移動') || text.includes('向下移動')) {
        feedbackLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🎯 反饋日誌:', text);
      }
    });
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    console.log('📱 設置手機橫向視窗: 812x375');
    
    // 導航到 Shimozurdo 遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: /鎖定全螢幕並開始/ });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 查找遊戲畫面
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🚀 開始響應延遲測試');
    
    // 快速連續點擊測試 - 模擬真實使用場景
    const rapidClickPositions = [
      { x: 200, y: 100, description: '快速上方點擊' },
      { x: 600, y: 100, description: '快速上方點擊' },
      { x: 200, y: 250, description: '快速下方點擊' },
      { x: 600, y: 250, description: '快速下方點擊' },
      { x: 400, y: 100, description: '快速中上點擊' },
      { x: 400, y: 250, description: '快速中下點擊' }
    ];
    
    console.log('⚡ 執行快速連續點擊測試');
    const startTime = Date.now();
    
    for (let i = 0; i < rapidClickPositions.length; i++) {
      const pos = rapidClickPositions[i];
      console.log(`🎯 快速點擊 ${i + 1}: ${pos.description} (${pos.x}, ${pos.y})`);
      
      await gameArea.click({ position: { x: pos.x, y: pos.y } });
      await page.waitForTimeout(200); // 短間隔模擬快速操作
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`⚡ 快速連續點擊完成，總時間: ${totalTime}ms`);
    
    // 等待所有響應完成
    await page.waitForTimeout(2000);
    
    // 分析性能數據
    if (performanceLogs.length > 0) {
      const responseTimes = performanceLogs.map(log => log.responseTime);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      console.log(`📊 響應時間統計:`);
      console.log(`  - 平均響應時間: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  - 最大響應時間: ${maxResponseTime.toFixed(2)}ms`);
      console.log(`  - 最小響應時間: ${minResponseTime.toFixed(2)}ms`);
      console.log(`  - 總測試次數: ${responseTimes.length}`);
      
      // 性能評估
      const excellentCount = responseTimes.filter(t => t < 8).length;
      const goodCount = responseTimes.filter(t => t >= 8 && t < 16).length;
      const acceptableCount = responseTimes.filter(t => t >= 16 && t < 32).length;
      const poorCount = responseTimes.filter(t => t >= 32).length;
      
      console.log(`📊 性能分級:`);
      console.log(`  - 優秀 (<8ms): ${excellentCount} 次 (${(excellentCount/responseTimes.length*100).toFixed(1)}%)`);
      console.log(`  - 良好 (8-16ms): ${goodCount} 次 (${(goodCount/responseTimes.length*100).toFixed(1)}%)`);
      console.log(`  - 可接受 (16-32ms): ${acceptableCount} 次 (${(acceptableCount/responseTimes.length*100).toFixed(1)}%)`);
      console.log(`  - 需改善 (>32ms): ${poorCount} 次 (${(poorCount/responseTimes.length*100).toFixed(1)}%)`);
    }
    
    // 分析反饋響應
    const feedbackRate = (feedbackLogs.length / rapidClickPositions.length) * 100;
    console.log(`🎯 觸控反饋響應率: ${feedbackRate.toFixed(1)}% (${feedbackLogs.length}/${rapidClickPositions.length})`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_響應延遲優化_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 響應延遲優化測試完成');
  });

  test('視覺反饋增強測試', async ({ page }) => {
    console.log('🎨 測試 Shimozurdo 視覺反饋增強');
    
    // 監聽視覺效果相關的錯誤
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('頁面錯誤:', error.message);
    });
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    // 啟動遊戲
    const lockButton = page.locator('button').filter({ hasText: /鎖定全螢幕並開始/ });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🎨 開始視覺反饋測試');
    
    // 測試不同位置的視覺反饋
    const feedbackTestPositions = [
      { x: 150, y: 100, description: '左上角反饋測試' },
      { x: 650, y: 100, description: '右上角反饋測試' },
      { x: 400, y: 180, description: '中央反饋測試' },
      { x: 150, y: 280, description: '左下角反饋測試' },
      { x: 650, y: 280, description: '右下角反饋測試' }
    ];
    
    for (let i = 0; i < feedbackTestPositions.length; i++) {
      const pos = feedbackTestPositions[i];
      console.log(`🎨 測試位置 ${i + 1}: ${pos.description}`);
      
      // 點擊並等待視覺效果
      await gameArea.click({ position: { x: pos.x, y: pos.y } });
      
      // 等待視覺反饋動畫完成
      await page.waitForTimeout(500);
      
      // 檢查是否有 JavaScript 錯誤
      if (errors.length > 0) {
        console.warn(`⚠️ 檢測到錯誤: ${errors[errors.length - 1]}`);
      }
    }
    
    // 檢查整體錯誤狀況
    if (errors.length === 0) {
      console.log('✅ 視覺反饋系統運行正常，無 JavaScript 錯誤');
    } else {
      console.warn(`⚠️ 檢測到 ${errors.length} 個錯誤`);
      errors.forEach((error, index) => {
        console.warn(`  錯誤 ${index + 1}: ${error}`);
      });
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_視覺反饋測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 視覺反饋增強測試完成');
  });

  test('特定場景壓力測試', async ({ page }) => {
    console.log('🔥 Shimozurdo 特定場景壓力測試');
    
    // 監聽所有相關日誌
    const allLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('太空船') || text.includes('觸控') || text.includes('響應')) {
        allLogs.push({
          time: Date.now(),
          type: msg.type(),
          message: text
        });
      }
    });
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    // 啟動遊戲
    const lockButton = page.locator('button').filter({ hasText: /鎖定全螢幕並開始/ });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🔥 開始特定場景壓力測試');
    
    // 場景1: 極快速點擊
    console.log('🔥 場景1: 極快速連續點擊測試');
    for (let i = 0; i < 20; i++) {
      const x = 200 + (i % 4) * 150;
      const y = 100 + (i % 2) * 150;
      await gameArea.click({ position: { x, y } });
      await page.waitForTimeout(50); // 極短間隔
    }
    
    await page.waitForTimeout(1000);
    
    // 場景2: 邊緣位置點擊
    console.log('🔥 場景2: 邊緣位置點擊測試');
    const edgePositions = [
      { x: 10, y: 10 },     // 左上角邊緣
      { x: 800, y: 10 },    // 右上角邊緣
      { x: 10, y: 360 },    // 左下角邊緣
      { x: 800, y: 360 },   // 右下角邊緣
      { x: 400, y: 5 },     // 頂部邊緣
      { x: 400, y: 370 },   // 底部邊緣
      { x: 5, y: 180 },     // 左邊緣
      { x: 805, y: 180 }    // 右邊緣
    ];
    
    for (const pos of edgePositions) {
      await gameArea.click({ position: pos });
      await page.waitForTimeout(300);
    }
    
    // 場景3: 長時間持續操作
    console.log('🔥 場景3: 長時間持續操作測試');
    const sustainedTestDuration = 10000; // 10秒
    const startTime = Date.now();
    let clickCount = 0;
    
    while (Date.now() - startTime < sustainedTestDuration) {
      const x = 200 + (clickCount % 6) * 100;
      const y = 100 + (clickCount % 3) * 80;
      await gameArea.click({ position: { x, y } });
      clickCount++;
      await page.waitForTimeout(200);
    }
    
    console.log(`🔥 持續操作完成: ${clickCount} 次點擊，持續 ${sustainedTestDuration/1000} 秒`);
    
    // 等待系統穩定
    await page.waitForTimeout(2000);
    
    // 分析壓力測試結果
    const errorLogs = allLogs.filter(log => log.type === 'error');
    const warningLogs = allLogs.filter(log => log.type === 'warning');
    const totalLogs = allLogs.length;
    
    console.log(`📊 壓力測試結果:`);
    console.log(`  - 總日誌數: ${totalLogs}`);
    console.log(`  - 錯誤數: ${errorLogs.length}`);
    console.log(`  - 警告數: ${warningLogs.length}`);
    console.log(`  - 總點擊數: ${clickCount + 20 + edgePositions.length}`);
    
    if (errorLogs.length === 0) {
      console.log('✅ 壓力測試通過，系統穩定');
    } else {
      console.warn('⚠️ 壓力測試發現問題');
      errorLogs.forEach((log, index) => {
        console.warn(`  錯誤 ${index + 1}: ${log.message}`);
      });
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_壓力測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 特定場景壓力測試完成');
  });
});
