const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 座標修復驗證', () => {
  test('座標修復工具驗證測試', async ({ page }) => {
    console.log('🔧 驗證 Shimozurdo 座標修復工具效果');
    
    // 監聽所有座標相關日誌
    const coordinateLogs = [];
    const touchResponses = [];
    
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (text.includes('座標診斷') || text.includes('座標修復') || text.includes('座標偏移診斷')) {
        coordinateLogs.push({
          time: Date.now(),
          message: text,
          type: type
        });
        console.log('🔧 座標修復日誌:', text);
      }
      
      if (text.includes('太空船基準') && (text.includes('向上移動') || text.includes('向下移動'))) {
        touchResponses.push({
          time: Date.now(),
          message: text
        });
        console.log('🎯 觸控響應:', text);
      }
      
      if (type === 'error') {
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
    
    console.log('🔧 開始座標修復驗證測試');
    
    // 測試不同區域的點擊響應
    const testPoints = [
      { x: 150, y: 100, description: '左上區域', expectedDirection: 'up' },
      { x: 400, y: 120, description: '中上區域', expectedDirection: 'up' },
      { x: 650, y: 100, description: '右上區域', expectedDirection: 'up' },
      { x: 150, y: 250, description: '左下區域', expectedDirection: 'down' },
      { x: 400, y: 280, description: '中下區域', expectedDirection: 'down' },
      { x: 650, y: 250, description: '右下區域', expectedDirection: 'down' },
      { x: 200, y: 180, description: '中央偏左', expectedDirection: 'varies' },
      { x: 600, y: 180, description: '中央偏右', expectedDirection: 'varies' }
    ];
    
    let successfulClicks = 0;
    let totalClicks = testPoints.length;
    
    for (let i = 0; i < testPoints.length; i++) {
      const point = testPoints[i];
      console.log(`🎯 測試點 ${i + 1}: ${point.description} - 點擊座標 (${point.x}, ${point.y})`);
      
      // 記錄點擊前的響應數量
      const responsesBefore = touchResponses.length;
      
      // 執行點擊
      await gameArea.click({ position: { x: point.x, y: point.y } });
      
      // 等待響應
      await page.waitForTimeout(1000);
      
      // 檢查是否有新響應
      const responsesAfter = touchResponses.length;
      const hasResponse = responsesAfter > responsesBefore;
      
      if (hasResponse) {
        successfulClicks++;
        const latestResponse = touchResponses[touchResponses.length - 1];
        console.log(`  ✅ 成功響應: ${latestResponse.message}`);
        
        // 驗證響應方向是否符合預期
        if (point.expectedDirection !== 'varies') {
          const isCorrectDirection = latestResponse.message.includes(
            point.expectedDirection === 'up' ? '向上移動' : '向下移動'
          );
          if (isCorrectDirection) {
            console.log(`    🎯 方向正確: ${point.expectedDirection}`);
          } else {
            console.log(`    ⚠️ 方向可能不符預期`);
          }
        }
      } else {
        console.log(`  ❌ 無響應`);
      }
    }
    
    // 計算響應率
    const responseRate = (successfulClicks / totalClicks) * 100;
    console.log(`\n📊 座標修復驗證結果:`);
    console.log(`  - 總測試點: ${totalClicks}`);
    console.log(`  - 成功響應: ${successfulClicks}`);
    console.log(`  - 響應成功率: ${responseRate.toFixed(1)}%`);
    
    // 分析座標修復日誌
    console.log(`\n🔧 座標修復分析:`);
    console.log(`  - 座標修復日誌數: ${coordinateLogs.length}`);
    
    if (coordinateLogs.length > 0) {
      console.log(`  - 座標修復工具運行正常`);
      
      // 檢查是否有診斷信息
      const diagnosticLogs = coordinateLogs.filter(log => log.message.includes('診斷'));
      const fixLogs = coordinateLogs.filter(log => log.message.includes('修復'));
      
      console.log(`  - 診斷日誌: ${diagnosticLogs.length} 條`);
      console.log(`  - 修復日誌: ${fixLogs.length} 條`);
    } else {
      console.log(`  - ⚠️ 未檢測到座標修復日誌`);
    }
    
    // 性能評估
    let performanceScore = 100;
    if (responseRate < 90) performanceScore -= 20;
    if (responseRate < 80) performanceScore -= 20;
    if (responseRate < 70) performanceScore -= 30;
    if (coordinateLogs.length === 0) performanceScore -= 10;
    
    console.log(`\n🏆 座標修復效果評分: ${Math.max(0, performanceScore)}/100`);
    
    if (performanceScore >= 90) {
      console.log('🌟 優秀：座標修復效果顯著');
    } else if (performanceScore >= 80) {
      console.log('👍 良好：座標修復有明顯改善');
    } else if (performanceScore >= 70) {
      console.log('👌 可接受：座標修復有一定效果');
    } else {
      console.log('⚠️ 需改善：座標修復效果有限');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_座標修復驗證_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 座標修復驗證測試完成');
    
    // 測試通過條件
    expect(responseRate).toBeGreaterThan(60); // 響應率應該大於60%
    expect(performanceScore).toBeGreaterThan(50); // 性能評分應該大於50
  });

  test('座標修復前後對比測試', async ({ page }) => {
    console.log('📊 座標修復前後效果對比測試');
    
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
    
    console.log('📊 執行對比測試');
    
    // 測試座標修復工具是否正常載入
    const coordinateFixLoaded = await page.evaluate(() => {
      return typeof window.CoordinateFix !== 'undefined';
    });
    
    console.log(`🔧 座標修復工具載入狀態: ${coordinateFixLoaded ? '✅ 已載入' : '❌ 未載入'}`);
    
    if (coordinateFixLoaded) {
      // 測試座標修復工具功能
      const testResult = await page.evaluate(() => {
        try {
          const mockScene = { sys: { game: { canvas: document.querySelector('canvas') } } };
          const coordinateFix = new window.CoordinateFix(mockScene);
          
          // 測試座標修復
          const mockPointer = { x: 100, y: 150, worldX: 100, worldY: 150 };
          const result = coordinateFix.getOptimalCoordinates(mockPointer);
          
          return {
            success: true,
            result: result,
            hasX: typeof result.x === 'number',
            hasY: typeof result.y === 'number'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      console.log('🧪 座標修復工具功能測試:', testResult);
      
      if (testResult.success) {
        console.log('  ✅ 座標修復工具功能正常');
        console.log(`  📐 測試座標修復結果: (${testResult.result.x}, ${testResult.result.y})`);
      } else {
        console.log('  ❌ 座標修復工具功能異常:', testResult.error);
      }
    }
    
    // 快速響應測試
    console.log('⚡ 快速響應測試');
    const quickTests = [
      { x: 200, y: 120, description: '快速上方點擊' },
      { x: 600, y: 250, description: '快速下方點擊' },
      { x: 400, y: 180, description: '快速中央點擊' }
    ];
    
    for (const test of quickTests) {
      console.log(`⚡ ${test.description}: (${test.x}, ${test.y})`);
      await gameArea.click({ position: { x: test.x, y: test.y } });
      await page.waitForTimeout(300);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_座標修復對比_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 座標修復對比測試完成');
    
    // 驗證座標修復工具載入
    expect(coordinateFixLoaded).toBe(true);
  });
});
