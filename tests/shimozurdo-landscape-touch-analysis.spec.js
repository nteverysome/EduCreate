const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 遊戲橫向觸控問題分析', () => {
  test('分析 Shimozurdo 橫向模式下的觸控座標和縮放', async ({ page }) => {
    console.log('🚀 分析 Shimozurdo 遊戲橫向模式觸控問題');
    
    // 監聽所有相關日誌
    const touchLogs = [];
    const scaleLogs = [];
    const coordinateLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('太空船基準線') || text.includes('觸控檢測')) {
        touchLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🚀 觸控日誌:', text);
      }
      
      if (text.includes('螢幕信息') || text.includes('座標詳情')) {
        coordinateLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('📊 座標日誌:', text);
      }
      
      if (text.includes('縮放') || text.includes('scale') || text.includes('zoom')) {
        scaleLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('📏 縮放日誌:', text);
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
    
    // 等待頁面載入
    await page.waitForTimeout(5000);
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 查找遊戲畫面
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🚀 開始 Shimozurdo 橫向模式觸控測試');
    
    // 測試不同位置的點擊
    const testPositions = [
      { x: 100, y: 80, description: '左上角' },
      { x: 400, y: 80, description: '中上方' },
      { x: 700, y: 80, description: '右上角' },
      { x: 100, y: 150, description: '左中間' },
      { x: 400, y: 150, description: '正中央' },
      { x: 700, y: 150, description: '右中間' },
      { x: 100, y: 220, description: '左下方' },
      { x: 400, y: 220, description: '中下方' },
      { x: 700, y: 220, description: '右下方' },
      { x: 100, y: 300, description: '左底部' },
      { x: 400, y: 300, description: '中底部' },
      { x: 700, y: 300, description: '右底部' }
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
      await page.waitForTimeout(800);
      
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
      log.message.includes('觸控檢測') || log.message.includes('太空船基準線')
    ).length;
    
    const responseRate = (responsiveClicks / totalClicks) * 100;
    console.log(`📊 Shimozurdo 橫向模式觸控響應率: ${responseRate.toFixed(1)}% (${responsiveClicks}/${totalClicks})`);
    
    // 分析座標數據
    const coordinateData = coordinateLogs.map(log => {
      try {
        const match = log.message.match(/座標詳情.*({.*})/);
        if (match) {
          const data = JSON.parse(match[1]);
          return data;
        }
      } catch (e) {
        console.warn('解析座標數據失敗:', e);
      }
      return null;
    }).filter(Boolean);
    
    if (coordinateData.length > 0) {
      console.log('📊 Shimozurdo 座標分析:');
      coordinateData.forEach((data, index) => {
        console.log(`  點擊 ${index + 1}:`, data);
      });
      
      // 分析縮放比例
      const zoomData = coordinateData.map(d => ({
        actualZoom: parseFloat(d.actualZoom),
        cameraZoom: parseFloat(d.cameraZoom)
      }));
      
      if (zoomData.length > 0) {
        const avgActualZoom = zoomData.reduce((sum, d) => sum + d.actualZoom, 0) / zoomData.length;
        const avgCameraZoom = zoomData.reduce((sum, d) => sum + d.cameraZoom, 0) / zoomData.length;
        
        console.log(`📊 平均縮放比例: actualZoom=${avgActualZoom.toFixed(3)}, cameraZoom=${avgCameraZoom.toFixed(3)}`);
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo橫向_觸控分析_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ Shimozurdo 橫向觸控分析完成');
  });

  test('對比 Shimozurdo 直向模式的觸控響應', async ({ page }) => {
    console.log('🚀 對比 Shimozurdo 直向模式觸控響應');
    
    // 監聽觸控日誌
    const touchLogs = [];
    const coordinateLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('太空船基準線') || text.includes('觸控檢測')) {
        touchLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🚀 直向觸控日誌:', text);
      }
      
      if (text.includes('座標詳情')) {
        coordinateLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('📊 直向座標日誌:', text);
      }
    });
    
    // 設置手機直向模式
    await page.setViewportSize({ width: 375, height: 812 });
    console.log('📱 設置手機直向視窗: 375x812');
    
    // 導航到 Shimozurdo 遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    // 啟動鎖定全螢幕
    const lockButton = page.locator('button').filter({ hasText: '🔒 鎖定全螢幕並開始' });
    if (await lockButton.count() > 0) {
      await lockButton.first().click();
      await page.waitForTimeout(2000);
    }
    
    // 查找遊戲畫面
    const gameArea = page.locator('canvas, #game').first();
    await expect(gameArea).toBeVisible({ timeout: 10000 });
    
    console.log('🚀 開始 Shimozurdo 直向模式觸控測試');
    
    // 測試相同的點擊模式
    const testPositions = [
      { x: 150, y: 200, description: '上方' },
      { x: 200, y: 300, description: '中上' },
      { x: 150, y: 400, description: '中央' },
      { x: 200, y: 500, description: '中下' },
      { x: 150, y: 600, description: '下方' }
    ];
    
    for (let i = 0; i < testPositions.length; i++) {
      const pos = testPositions[i];
      console.log(`🎯 直向測試位置 ${i + 1}: ${pos.description} (${pos.x}, ${pos.y})`);
      
      const touchLogsBefore = touchLogs.length;
      const coordinateLogsBefore = coordinateLogs.length;
      
      await gameArea.click({ position: { x: pos.x, y: pos.y } });
      await page.waitForTimeout(800);
      
      const newTouchLogs = touchLogs.length - touchLogsBefore;
      const newCoordinateLogs = coordinateLogs.length - coordinateLogsBefore;
      
      console.log(`📊 直向位置 ${i + 1} 響應: 觸控日誌+${newTouchLogs}, 座標日誌+${newCoordinateLogs}`);
    }
    
    // 計算直向模式響應率
    const totalClicks = testPositions.length;
    const responsiveClicks = touchLogs.filter(log => 
      log.message.includes('觸控檢測') || log.message.includes('太空船基準線')
    ).length;
    
    const responseRate = (responsiveClicks / totalClicks) * 100;
    console.log(`📊 Shimozurdo 直向模式觸控響應率: ${responseRate.toFixed(1)}% (${responsiveClicks}/${totalClicks})`);
    
    // 分析直向模式的座標數據
    const coordinateData = coordinateLogs.map(log => {
      try {
        const match = log.message.match(/座標詳情.*({.*})/);
        if (match) {
          const data = JSON.parse(match[1]);
          return data;
        }
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    if (coordinateData.length > 0) {
      console.log('📊 Shimozurdo 直向座標分析:');
      const zoomData = coordinateData.map(d => ({
        actualZoom: parseFloat(d.actualZoom),
        cameraZoom: parseFloat(d.cameraZoom)
      }));
      
      if (zoomData.length > 0) {
        const avgActualZoom = zoomData.reduce((sum, d) => sum + d.actualZoom, 0) / zoomData.length;
        const avgCameraZoom = zoomData.reduce((sum, d) => sum + d.cameraZoom, 0) / zoomData.length;
        
        console.log(`📊 直向平均縮放比例: actualZoom=${avgActualZoom.toFixed(3)}, cameraZoom=${avgCameraZoom.toFixed(3)}`);
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo直向_觸控對比_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ Shimozurdo 直向觸控對比完成');
  });
});
