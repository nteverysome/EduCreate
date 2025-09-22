const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 座標偏移診斷', () => {
  test('座標偏移深度分析 - 橫向模式', async ({ page }) => {
    console.log('🔍 開始 Shimozurdo 座標偏移深度診斷');
    
    // 監聽所有座標相關日誌
    const coordinateLogs = [];
    const clickEvents = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('座標詳情') || text.includes('觸控檢測') || text.includes('螢幕信息')) {
        coordinateLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('📊 座標日誌:', text);
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
    
    await page.waitForTimeout(5000);
    
    // 啟動調試模式
    await page.evaluate(() => {
      // 嘗試啟用調試模式
      if (window.game && window.game.scene && window.game.scene.scenes[0]) {
        window.game.scene.scenes[0].debugMode = true;
        console.log('🔧 調試模式已啟用');
      }
    });
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: /鎖定全螢幕並開始/ });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(3000);
    }
    
    // 查找遊戲畫面
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    // 獲取遊戲容器的詳細信息
    const containerInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const gameContainer = canvas?.parentElement;
      
      if (!canvas || !gameContainer) return null;
      
      const canvasRect = canvas.getBoundingClientRect();
      const containerRect = gameContainer.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      
      return {
        canvas: {
          width: canvas.width,
          height: canvas.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
          offsetWidth: canvas.offsetWidth,
          offsetHeight: canvas.offsetHeight,
          rect: {
            x: canvasRect.x,
            y: canvasRect.y,
            width: canvasRect.width,
            height: canvasRect.height,
            top: canvasRect.top,
            left: canvasRect.left
          },
          style: {
            transform: canvas.style.transform,
            position: canvas.style.position,
            top: canvas.style.top,
            left: canvas.style.left,
            margin: canvas.style.margin,
            padding: canvas.style.padding
          }
        },
        container: {
          rect: {
            x: containerRect.x,
            y: containerRect.y,
            width: containerRect.width,
            height: containerRect.height,
            top: containerRect.top,
            left: containerRect.left
          },
          style: {
            transform: gameContainer.style.transform,
            position: gameContainer.style.position,
            top: gameContainer.style.top,
            left: gameContainer.style.left,
            margin: gameContainer.style.margin,
            padding: gameContainer.style.padding
          }
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        body: {
          rect: {
            x: bodyRect.x,
            y: bodyRect.y,
            width: bodyRect.width,
            height: bodyRect.height
          }
        }
      };
    });
    
    console.log('📊 容器信息分析:');
    console.log(JSON.stringify(containerInfo, null, 2));
    
    // 測試精確座標點擊
    console.log('🎯 開始精確座標偏移測試');
    
    const testPoints = [
      { x: 100, y: 100, description: '左上角測試點' },
      { x: 200, y: 150, description: '左中測試點' },
      { x: 400, y: 180, description: '中央測試點' },
      { x: 600, y: 150, description: '右中測試點' },
      { x: 700, y: 100, description: '右上角測試點' },
      { x: 100, y: 250, description: '左下測試點' },
      { x: 400, y: 280, description: '中下測試點' },
      { x: 700, y: 250, description: '右下測試點' }
    ];
    
    for (let i = 0; i < testPoints.length; i++) {
      const point = testPoints[i];
      console.log(`🎯 測試點 ${i + 1}: ${point.description} - 點擊座標 (${point.x}, ${point.y})`);
      
      // 記錄點擊前的日誌數量
      const logsBefore = coordinateLogs.length;
      
      // 執行點擊
      await gameArea.click({ position: { x: point.x, y: point.y } });
      
      // 等待響應
      await page.waitForTimeout(1000);
      
      // 檢查新增的日誌
      const newLogs = coordinateLogs.slice(logsBefore);
      
      if (newLogs.length > 0) {
        console.log(`  ✅ 檢測到響應 (${newLogs.length} 條日誌)`);
        newLogs.forEach(log => {
          console.log(`    📝 ${log.message}`);
          
          // 分析座標偏移
          if (log.message.includes('座標詳情')) {
            try {
              const match = log.message.match(/座標詳情.*({.*})/);
              if (match) {
                const coordData = JSON.parse(match[1]);
                const rawPointer = coordData.rawPointer?.split(', ');
                if (rawPointer && rawPointer.length === 2) {
                  const detectedX = parseFloat(rawPointer[0]);
                  const detectedY = parseFloat(rawPointer[1]);
                  const offsetX = detectedX - point.x;
                  const offsetY = detectedY - point.y;
                  
                  console.log(`    📐 座標偏移分析:`);
                  console.log(`      預期座標: (${point.x}, ${point.y})`);
                  console.log(`      檢測座標: (${detectedX}, ${detectedY})`);
                  console.log(`      偏移量: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})`);
                  
                  clickEvents.push({
                    expected: { x: point.x, y: point.y },
                    detected: { x: detectedX, y: detectedY },
                    offset: { x: offsetX, y: offsetY },
                    description: point.description
                  });
                }
              }
            } catch (e) {
              console.warn('    ⚠️ 座標數據解析失敗:', e.message);
            }
          }
        });
      } else {
        console.log(`  ❌ 無響應`);
        clickEvents.push({
          expected: { x: point.x, y: point.y },
          detected: null,
          offset: null,
          description: point.description,
          noResponse: true
        });
      }
    }
    
    // 分析座標偏移模式
    console.log('\n📊 座標偏移分析結果:');
    
    const validEvents = clickEvents.filter(e => !e.noResponse && e.offset);
    const noResponseEvents = clickEvents.filter(e => e.noResponse);
    
    console.log(`📈 統計摘要:`);
    console.log(`  - 總測試點: ${testPoints.length}`);
    console.log(`  - 有響應點: ${validEvents.length}`);
    console.log(`  - 無響應點: ${noResponseEvents.length}`);
    console.log(`  - 響應率: ${(validEvents.length / testPoints.length * 100).toFixed(1)}%`);
    
    if (validEvents.length > 0) {
      // 計算平均偏移
      const avgOffsetX = validEvents.reduce((sum, e) => sum + e.offset.x, 0) / validEvents.length;
      const avgOffsetY = validEvents.reduce((sum, e) => sum + e.offset.y, 0) / validEvents.length;
      
      // 計算偏移範圍
      const offsetXValues = validEvents.map(e => e.offset.x);
      const offsetYValues = validEvents.map(e => e.offset.y);
      const maxOffsetX = Math.max(...offsetXValues);
      const minOffsetX = Math.min(...offsetXValues);
      const maxOffsetY = Math.max(...offsetYValues);
      const minOffsetY = Math.min(...offsetYValues);
      
      console.log(`📐 偏移分析:`);
      console.log(`  - 平均X偏移: ${avgOffsetX.toFixed(2)}px`);
      console.log(`  - 平均Y偏移: ${avgOffsetY.toFixed(2)}px`);
      console.log(`  - X偏移範圍: ${minOffsetX.toFixed(2)}px ~ ${maxOffsetX.toFixed(2)}px`);
      console.log(`  - Y偏移範圍: ${minOffsetY.toFixed(2)}px ~ ${maxOffsetY.toFixed(2)}px`);
      
      // 判斷偏移類型
      const isConsistentOffsetX = Math.abs(maxOffsetX - minOffsetX) < 5;
      const isConsistentOffsetY = Math.abs(maxOffsetY - minOffsetY) < 5;
      const hasSignificantOffsetX = Math.abs(avgOffsetX) > 10;
      const hasSignificantOffsetY = Math.abs(avgOffsetY) > 10;
      
      console.log(`🔍 偏移模式分析:`);
      if (isConsistentOffsetX && hasSignificantOffsetX) {
        console.log(`  - X軸一致性偏移: ${avgOffsetX.toFixed(2)}px (可能是容器定位問題)`);
      }
      if (isConsistentOffsetY && hasSignificantOffsetY) {
        console.log(`  - Y軸一致性偏移: ${avgOffsetY.toFixed(2)}px (可能是容器定位問題)`);
      }
      if (!isConsistentOffsetX || !isConsistentOffsetY) {
        console.log(`  - 不一致偏移 (可能是縮放或變換問題)`);
      }
      
      // 詳細偏移數據
      console.log(`📋 詳細偏移數據:`);
      validEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.description}:`);
        console.log(`     預期: (${event.expected.x}, ${event.expected.y})`);
        console.log(`     檢測: (${event.detected.x}, ${event.detected.y})`);
        console.log(`     偏移: (${event.offset.x.toFixed(2)}, ${event.offset.y.toFixed(2)})`);
      });
    }
    
    if (noResponseEvents.length > 0) {
      console.log(`❌ 無響應區域:`);
      noResponseEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.description}: (${event.expected.x}, ${event.expected.y})`);
      });
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_座標偏移診斷_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 座標偏移診斷完成');
  });

  test('座標修正方案測試', async ({ page }) => {
    console.log('🔧 測試座標修正方案');
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    // 注入座標修正腳本
    await page.evaluate(() => {
      // 座標修正函數
      window.fixCoordinateOffset = function(pointer, gameContainer) {
        const canvas = gameContainer.querySelector('canvas');
        if (!canvas) return pointer;
        
        const canvasRect = canvas.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        // 計算相對於 canvas 的座標
        const relativeX = pointer.x - (canvasRect.left - containerRect.left);
        const relativeY = pointer.y - (canvasRect.top - containerRect.top);
        
        // 考慮縮放比例
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        
        return {
          x: relativeX * scaleX,
          y: relativeY * scaleY,
          originalX: pointer.x,
          originalY: pointer.y,
          canvasRect: canvasRect,
          containerRect: containerRect,
          scale: { x: scaleX, y: scaleY }
        };
      };
      
      console.log('🔧 座標修正函數已注入');
    });
    
    // 啟動遊戲
    const lockButton = page.locator('button').filter({ hasText: /鎖定全螢幕並開始/ });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🔧 測試座標修正效果');
    
    // 測試修正後的座標
    const correctionTests = [
      { x: 200, y: 120, description: '修正測試 - 左上' },
      { x: 400, y: 180, description: '修正測試 - 中央' },
      { x: 600, y: 240, description: '修正測試 - 右下' }
    ];
    
    for (const test of correctionTests) {
      console.log(`🔧 ${test.description}: (${test.x}, ${test.y})`);
      
      // 使用修正後的座標點擊
      const correctionResult = await page.evaluate((clickPos) => {
        const gameContainer = document.querySelector('#game') || document.querySelector('canvas')?.parentElement;
        if (!gameContainer || !window.fixCoordinateOffset) return null;
        
        const corrected = window.fixCoordinateOffset(clickPos, gameContainer);
        console.log('🔧 座標修正結果:', corrected);
        return corrected;
      }, test);
      
      if (correctionResult) {
        console.log(`  📐 修正結果:`);
        console.log(`    原始座標: (${correctionResult.originalX}, ${correctionResult.originalY})`);
        console.log(`    修正座標: (${correctionResult.x.toFixed(2)}, ${correctionResult.y.toFixed(2)})`);
        console.log(`    縮放比例: (${correctionResult.scale.x.toFixed(3)}, ${correctionResult.scale.y.toFixed(3)})`);
      }
      
      await gameArea.click({ position: { x: test.x, y: test.y } });
      await page.waitForTimeout(500);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_座標修正測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 座標修正方案測試完成');
  });
});
