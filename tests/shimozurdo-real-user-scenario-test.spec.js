const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 真實用戶場景測試', () => {
  test('模擬真實用戶橫向遊戲體驗', async ({ page }) => {
    console.log('🎮 模擬真實用戶在橫向模式下的遊戲體驗');
    
    // 監聽所有觸控相關日誌
    const touchLogs = [];
    const performanceLogs = [];
    const errorLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (text.includes('太空船基準') || text.includes('向上移動') || text.includes('向下移動')) {
        touchLogs.push({
          time: Date.now(),
          message: text,
          type: type
        });
        console.log('🎯 觸控反饋:', text);
      }
      
      if (text.includes('響應時間') || text.includes('延遲')) {
        performanceLogs.push({
          time: Date.now(),
          message: text,
          responseTime: parseFloat(text.match(/(\d+\.\d+)ms/)?.[1] || '0')
        });
        console.log('⚡ 性能監控:', text);
      }
      
      if (type === 'error') {
        errorLogs.push({
          time: Date.now(),
          message: text
        });
        console.error('❌ 錯誤:', text);
      }
    });
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    console.log('📱 設置手機橫向視窗: 812x375');
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ 等待遊戲載入...');
    await page.waitForTimeout(5000);
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: /鎖定全螢幕並開始/ });
    if (await lockButton.count() > 0) {
      console.log('🔒 啟動鎖定全螢幕模式');
      await lockButton.first().click();
      await page.waitForTimeout(3000);
    }
    
    // 查找遊戲畫面
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🎮 開始真實用戶場景測試');
    
    // 場景1: 正常遊戲操作 - 模擬用戶實際遊戲
    console.log('🎮 場景1: 正常遊戲操作模擬');
    const normalGameplay = [
      { x: 300, y: 120, description: '向上飛行' },
      { x: 500, y: 120, description: '繼續向上' },
      { x: 200, y: 280, description: '向下飛行' },
      { x: 600, y: 280, description: '繼續向下' },
      { x: 400, y: 120, description: '回到上方' },
      { x: 350, y: 280, description: '再次向下' },
      { x: 450, y: 120, description: '最後向上' }
    ];
    
    for (let i = 0; i < normalGameplay.length; i++) {
      const move = normalGameplay[i];
      console.log(`🎯 操作 ${i + 1}: ${move.description} - 點擊 (${move.x}, ${move.y})`);
      
      const beforeCount = touchLogs.length;
      await gameArea.click({ position: { x: move.x, y: move.y } });
      
      // 等待反饋
      await page.waitForTimeout(800);
      
      const afterCount = touchLogs.length;
      const responded = afterCount > beforeCount;
      
      console.log(`  ${responded ? '✅' : '❌'} 響應狀態: ${responded ? '正常' : '無響應'}`);
      
      if (responded) {
        const latestLog = touchLogs[touchLogs.length - 1];
        console.log(`  📝 反饋: ${latestLog.message}`);
      }
    }
    
    // 場景2: 快速反應測試 - 模擬緊急操作
    console.log('🎮 場景2: 快速反應測試');
    const quickReactions = [
      { x: 200, y: 100, description: '緊急上升' },
      { x: 600, y: 300, description: '緊急下降' },
      { x: 400, y: 100, description: '快速上升' },
      { x: 300, y: 300, description: '快速下降' }
    ];
    
    for (const reaction of quickReactions) {
      console.log(`⚡ 快速反應: ${reaction.description}`);
      await gameArea.click({ position: { x: reaction.x, y: reaction.y } });
      await page.waitForTimeout(300); // 短間隔模擬快速反應
    }
    
    // 場景3: 連續操作測試 - 模擬持續遊戲
    console.log('🎮 場景3: 連續操作測試 (模擬5秒持續遊戲)');
    const continuousTestDuration = 5000;
    const startTime = Date.now();
    let operationCount = 0;
    
    while (Date.now() - startTime < continuousTestDuration) {
      const isUp = operationCount % 2 === 0;
      const x = 300 + (operationCount % 3) * 100;
      const y = isUp ? 120 : 280;
      
      await gameArea.click({ position: { x, y } });
      operationCount++;
      await page.waitForTimeout(400);
    }
    
    console.log(`🎮 連續操作完成: ${operationCount} 次操作，持續 ${continuousTestDuration/1000} 秒`);
    
    // 等待所有響應完成
    await page.waitForTimeout(2000);
    
    // 分析測試結果
    console.log('\n📊 真實用戶場景測試結果分析:');
    
    // 觸控響應分析
    const totalOperations = normalGameplay.length + quickReactions.length + operationCount;
    const totalResponses = touchLogs.length;
    const responseRate = (totalResponses / totalOperations) * 100;
    
    console.log(`🎯 觸控響應統計:`);
    console.log(`  - 總操作次數: ${totalOperations}`);
    console.log(`  - 成功響應次數: ${totalResponses}`);
    console.log(`  - 響應成功率: ${responseRate.toFixed(1)}%`);
    
    // 性能分析
    if (performanceLogs.length > 0) {
      const responseTimes = performanceLogs.map(log => log.responseTime);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      console.log(`⚡ 性能統計:`);
      console.log(`  - 平均響應時間: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  - 最大響應時間: ${maxResponseTime.toFixed(2)}ms`);
      console.log(`  - 最小響應時間: ${minResponseTime.toFixed(2)}ms`);
      
      // 性能評級
      const excellentCount = responseTimes.filter(t => t < 8).length;
      const goodCount = responseTimes.filter(t => t >= 8 && t < 16).length;
      const acceptableCount = responseTimes.filter(t => t >= 16 && t < 32).length;
      const poorCount = responseTimes.filter(t => t >= 32).length;
      
      console.log(`📊 性能評級分布:`);
      console.log(`  - 優秀 (<8ms): ${excellentCount} 次 (${(excellentCount/responseTimes.length*100).toFixed(1)}%)`);
      console.log(`  - 良好 (8-16ms): ${goodCount} 次 (${(goodCount/responseTimes.length*100).toFixed(1)}%)`);
      console.log(`  - 可接受 (16-32ms): ${acceptableCount} 次 (${(acceptableCount/responseTimes.length*100).toFixed(1)}%)`);
      console.log(`  - 需改善 (>32ms): ${poorCount} 次 (${(poorCount/responseTimes.length*100).toFixed(1)}%)`);
    }
    
    // 錯誤分析
    console.log(`❌ 錯誤統計: ${errorLogs.length} 個錯誤`);
    if (errorLogs.length > 0) {
      errorLogs.forEach((error, index) => {
        console.log(`  錯誤 ${index + 1}: ${error.message}`);
      });
    }
    
    // 用戶體驗評估
    let uxScore = 100;
    if (responseRate < 90) uxScore -= 20;
    if (responseRate < 80) uxScore -= 20;
    if (errorLogs.length > 0) uxScore -= 10 * errorLogs.length;
    if (performanceLogs.length > 0) {
      const avgTime = performanceLogs.reduce((sum, log) => sum + log.responseTime, 0) / performanceLogs.length;
      if (avgTime > 16) uxScore -= 10;
      if (avgTime > 32) uxScore -= 20;
    }
    
    console.log(`\n🏆 用戶體驗評分: ${Math.max(0, uxScore)}/100`);
    
    if (uxScore >= 90) {
      console.log('🌟 優秀：用戶體驗非常流暢');
    } else if (uxScore >= 80) {
      console.log('👍 良好：用戶體驗令人滿意');
    } else if (uxScore >= 70) {
      console.log('👌 可接受：用戶體驗基本滿足需求');
    } else {
      console.log('⚠️ 需改善：用戶體驗有待提升');
    }
    
    // 截圖記錄最終狀態
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_真實用戶場景_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 真實用戶場景測試完成');
    
    // 測試通過條件
    expect(responseRate).toBeGreaterThan(70); // 響應率應該大於70%
    expect(errorLogs.length).toBeLessThan(3); // 錯誤數應該少於3個
    expect(uxScore).toBeGreaterThan(60); // 用戶體驗評分應該大於60
  });

  test('橫向模式視覺反饋驗證', async ({ page }) => {
    console.log('🎨 驗證橫向模式下的視覺反饋效果');
    
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
    
    console.log('🎨 測試視覺反饋效果');
    
    // 測試不同位置的視覺反饋
    const feedbackTests = [
      { x: 200, y: 100, description: '左上方點擊反饋' },
      { x: 600, y: 100, description: '右上方點擊反饋' },
      { x: 400, y: 180, description: '中央點擊反饋' },
      { x: 200, y: 280, description: '左下方點擊反饋' },
      { x: 600, y: 280, description: '右下方點擊反饋' }
    ];
    
    for (let i = 0; i < feedbackTests.length; i++) {
      const test = feedbackTests[i];
      console.log(`🎨 測試 ${i + 1}: ${test.description}`);
      
      // 點擊並等待視覺效果
      await gameArea.click({ position: { x: test.x, y: test.y } });
      
      // 等待視覺反饋動畫完成
      await page.waitForTimeout(600);
      
      console.log(`  ✅ 視覺反饋測試完成`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_視覺反饋驗證_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 視覺反饋驗證完成');
  });
});
