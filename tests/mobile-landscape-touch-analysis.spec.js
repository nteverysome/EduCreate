const { test, expect } = require('@playwright/test');

test.describe('手機橫向觸控問題分析', () => {
  test('分析橫向模式下的觸控座標和縮放', async ({ page }) => {
    console.log('📱 分析手機橫向模式觸控問題');
    
    // 監聽所有相關日誌
    const touchLogs = [];
    const scaleLogs = [];
    const coordinateLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('觸控檢測') || text.includes('飛機基準')) {
        touchLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('👆 觸控日誌:', text);
      }
      
      if (text.includes('縮放') || text.includes('scale') || text.includes('resize')) {
        scaleLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('📏 縮放日誌:', text);
      }
      
      if (text.includes('座標') || text.includes('pointer') || text.includes('Y:')) {
        coordinateLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🎯 座標日誌:', text);
      }
    });
    
    // 設置手機橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    console.log('📱 設置手機橫向視窗: 812x375');
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    // 獲取遊戲容器信息
    const containerInfo = await page.evaluate(() => {
      const container = document.querySelector('.game-iframe-container');
      const iframe = container?.querySelector('iframe');
      const canvas = iframe?.contentDocument?.querySelector('canvas');
      
      return {
        container: container ? {
          width: container.offsetWidth,
          height: container.offsetHeight,
          clientWidth: container.clientWidth,
          clientHeight: container.clientHeight,
          style: {
            width: container.style.width,
            height: container.style.height,
            aspectRatio: container.style.aspectRatio
          }
        } : null,
        iframe: iframe ? {
          width: iframe.offsetWidth,
          height: iframe.offsetHeight,
          clientWidth: iframe.clientWidth,
          clientHeight: iframe.clientHeight
        } : null,
        canvas: canvas ? {
          width: canvas.width,
          height: canvas.height,
          offsetWidth: canvas.offsetWidth,
          offsetHeight: canvas.offsetHeight,
          style: {
            width: canvas.style.width,
            height: canvas.style.height
          }
        } : null,
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        }
      };
    });
    
    console.log('📊 橫向模式容器分析:');
    console.log('  視窗尺寸:', containerInfo.viewport);
    console.log('  容器尺寸:', containerInfo.container);
    console.log('  iframe尺寸:', containerInfo.iframe);
    console.log('  canvas尺寸:', containerInfo.canvas);
    
    // 啟動遊戲
    const startButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    if (await startButton.count() > 0) {
      await startButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 查找遊戲畫面並開始遊戲
    const gameArea = page.locator('canvas, iframe').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    // 點擊開始遊戲
    await gameArea.click();
    await page.waitForTimeout(2000);
    
    console.log('🎮 開始橫向模式觸控測試');
    
    // 測試不同位置的點擊
    const testPositions = [
      { x: 100, y: 100, description: '左上角' },
      { x: 400, y: 100, description: '中上方' },
      { x: 700, y: 100, description: '右上角' },
      { x: 100, y: 200, description: '左中間' },
      { x: 400, y: 200, description: '正中央' },
      { x: 700, y: 200, description: '右中間' },
      { x: 100, y: 300, description: '左下角' },
      { x: 400, y: 300, description: '中下方' },
      { x: 700, y: 300, description: '右下角' }
    ];
    
    for (let i = 0; i < testPositions.length; i++) {
      const pos = testPositions[i];
      console.log(`🎯 測試位置 ${i + 1}: ${pos.description} (${pos.x}, ${pos.y})`);
      
      // 記錄點擊前的日誌數量
      const touchLogsBefore = touchLogs.length;
      const coordinateLogsBefore = coordinateLogs.length;
      
      // 執行點擊
      await gameArea.click({ position: { x: pos.x, y: pos.y } });
      
      // 等待響應
      await page.waitForTimeout(500);
      
      // 檢查響應
      const newTouchLogs = touchLogs.length - touchLogsBefore;
      const newCoordinateLogs = coordinateLogs.length - coordinateLogsBefore;
      
      console.log(`📊 位置 ${i + 1} 響應: 觸控日誌+${newTouchLogs}, 座標日誌+${newCoordinateLogs}`);
      
      if (newTouchLogs > 0) {
        const latestLogs = touchLogs.slice(touchLogsBefore);
        latestLogs.forEach(log => console.log(`  - ${log.message}`));
      }
      
      if (newCoordinateLogs > 0) {
        const latestLogs = coordinateLogs.slice(coordinateLogsBefore);
        latestLogs.forEach(log => console.log(`  - ${log.message}`));
      }
    }
    
    // 分析響應模式
    const totalClicks = testPositions.length;
    const responsiveClicks = touchLogs.filter(log => 
      log.message.includes('觸控檢測') || log.message.includes('飛機基準')
    ).length;
    
    const responseRate = (responsiveClicks / totalClicks) * 100;
    console.log(`📊 橫向模式觸控響應率: ${responseRate.toFixed(1)}% (${responsiveClicks}/${totalClicks})`);
    
    // 分析座標分佈
    const coordinateData = coordinateLogs.map(log => {
      const match = log.message.match(/點擊Y:\s*(\d+(?:\.\d+)?),\s*飛機Y:\s*(\d+(?:\.\d+)?)/);
      if (match) {
        return {
          clickY: parseFloat(match[1]),
          planeY: parseFloat(match[2]),
          diff: parseFloat(match[1]) - parseFloat(match[2])
        };
      }
      return null;
    }).filter(Boolean);
    
    if (coordinateData.length > 0) {
      console.log('📊 座標分析:');
      console.log(`  點擊Y範圍: ${Math.min(...coordinateData.map(d => d.clickY))} - ${Math.max(...coordinateData.map(d => d.clickY))}`);
      console.log(`  飛機Y範圍: ${Math.min(...coordinateData.map(d => d.planeY))} - ${Math.max(...coordinateData.map(d => d.planeY))}`);
      console.log(`  差值範圍: ${Math.min(...coordinateData.map(d => d.diff))} - ${Math.max(...coordinateData.map(d => d.diff))}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_手機橫向_觸控分析_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 手機橫向觸控分析完成');
  });

  test('對比直向模式的觸控響應', async ({ page }) => {
    console.log('📱 對比手機直向模式觸控響應');
    
    // 監聽觸控日誌
    const touchLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('觸控檢測') || text.includes('飛機基準')) {
        touchLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('👆 直向觸控日誌:', text);
      }
    });
    
    // 設置手機直向模式
    await page.setViewportSize({ width: 375, height: 812 });
    console.log('📱 設置手機直向視窗: 375x812');
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 啟動遊戲
    const startButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    if (await startButton.count() > 0) {
      await startButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 查找遊戲畫面並開始遊戲
    const gameArea = page.locator('canvas, iframe').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    // 點擊開始遊戲
    await gameArea.click();
    await page.waitForTimeout(2000);
    
    console.log('🎮 開始直向模式觸控測試');
    
    // 測試相同的點擊模式
    const testPositions = [
      { x: 100, y: 200, description: '上方' },
      { x: 200, y: 300, description: '中央' },
      { x: 100, y: 400, description: '下方' },
      { x: 200, y: 500, description: '更下方' },
      { x: 150, y: 600, description: '底部' }
    ];
    
    for (let i = 0; i < testPositions.length; i++) {
      const pos = testPositions[i];
      console.log(`🎯 直向測試位置 ${i + 1}: ${pos.description} (${pos.x}, ${pos.y})`);
      
      const touchLogsBefore = touchLogs.length;
      
      await gameArea.click({ position: { x: pos.x, y: pos.y } });
      await page.waitForTimeout(500);
      
      const newTouchLogs = touchLogs.length - touchLogsBefore;
      console.log(`📊 直向位置 ${i + 1} 響應: 觸控日誌+${newTouchLogs}`);
    }
    
    // 計算直向模式響應率
    const totalClicks = testPositions.length;
    const responsiveClicks = touchLogs.filter(log => 
      log.message.includes('觸控檢測') || log.message.includes('飛機基準')
    ).length;
    
    const responseRate = (responsiveClicks / totalClicks) * 100;
    console.log(`📊 直向模式觸控響應率: ${responseRate.toFixed(1)}% (${responsiveClicks}/${totalClicks})`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_手機直向_觸控對比_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 手機直向觸控對比完成');
  });
});
