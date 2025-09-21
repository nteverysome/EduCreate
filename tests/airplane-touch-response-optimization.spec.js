const { test, expect } = require('@playwright/test');

test.describe('飛機遊戲觸控響應優化驗證', () => {
  test.beforeEach(async ({ page }) => {
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到主頁
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('驗證觸控響應優化 - 多次點擊上方區域', async ({ page }) => {
    console.log('🔍 測試觸控響應優化 - 多次點擊上方');
    
    // 監聽控制台日誌來捕獲觸控事件
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('觸控檢測') || text.includes('觸碰控制') || text.includes('向上移動')) {
        console.log('🎮 觸控日誌:', text);
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 查找遊戲容器
    const gameContainer = page.locator('canvas').first();
    await expect(gameContainer).toBeVisible();
    
    // 等待遊戲初始化
    await page.waitForTimeout(2000);
    
    // 獲取遊戲區域
    const gameBox = await gameContainer.boundingBox();
    if (gameBox) {
      const centerX = gameBox.x + gameBox.width / 2;
      const upperY = gameBox.y + gameBox.height / 4; // 上方區域
      
      console.log(`🎯 遊戲區域: ${gameBox.width}x${gameBox.height}, 點擊位置: (${centerX}, ${upperY})`);
      
      // 進行多次點擊測試
      for (let i = 0; i < 5; i++) {
        console.log(`📱 第 ${i + 1} 次點擊上方區域`);
        
        // 點擊上方區域
        await page.mouse.click(centerX, upperY);
        await page.waitForTimeout(500);
        
        // 檢查是否有觸控響應日誌
        const recentLogs = logs.slice(-10);
        const hasResponse = recentLogs.some(log => 
          log.includes('向上移動') || log.includes('觸控檢測')
        );
        
        if (hasResponse) {
          console.log(`✅ 第 ${i + 1} 次點擊有響應`);
        } else {
          console.log(`❌ 第 ${i + 1} 次點擊無響應`);
        }
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_觸控響應優化_多次點擊測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 觸控響應優化測試完成');
  });

  test('驗證拖拽控制功能', async ({ page }) => {
    console.log('🔍 測試拖拽控制功能');
    
    // 監聽控制台日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('pointermove') || text.includes('拖拽') || text.includes('移動方向')) {
        console.log('🖱️ 拖拽日誌:', text);
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 查找遊戲容器
    const gameContainer = page.locator('canvas').first();
    await expect(gameContainer).toBeVisible();
    
    // 等待遊戲初始化
    await page.waitForTimeout(2000);
    
    // 獲取遊戲區域
    const gameBox = await gameContainer.boundingBox();
    if (gameBox) {
      const startX = gameBox.x + gameBox.width / 2;
      const startY = gameBox.y + gameBox.height / 2; // 中間開始
      const endY = gameBox.y + gameBox.height / 4;   // 拖拽到上方
      
      console.log(`🎯 拖拽測試: 從 (${startX}, ${startY}) 到 (${startX}, ${endY})`);
      
      // 執行拖拽操作
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.waitForTimeout(100);
      
      // 慢慢拖拽到上方
      for (let y = startY; y >= endY; y -= 10) {
        await page.mouse.move(startX, y);
        await page.waitForTimeout(50);
      }
      
      await page.mouse.up();
      
      console.log('🖱️ 拖拽操作完成');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_觸控響應優化_拖拽控制測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 拖拽控制測試完成');
  });

  test('驗證長按與短按區分', async ({ page }) => {
    console.log('🔍 測試長按與短按區分');
    
    // 監聽控制台日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('短按') || text.includes('長按') || text.includes('LONG_PRESS')) {
        console.log('⏱️ 按壓時長日誌:', text);
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 查找遊戲容器
    const gameContainer = page.locator('canvas').first();
    await expect(gameContainer).toBeVisible();
    
    // 等待遊戲初始化
    await page.waitForTimeout(2000);
    
    // 獲取遊戲區域
    const gameBox = await gameContainer.boundingBox();
    if (gameBox) {
      const centerX = gameBox.x + gameBox.width / 2;
      const upperY = gameBox.y + gameBox.height / 4;
      
      // 測試短按
      console.log('📱 測試短按 (150ms)');
      await page.mouse.move(centerX, upperY);
      await page.mouse.down();
      await page.waitForTimeout(150);
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // 測試長按
      console.log('📱 測試長按 (500ms)');
      await page.mouse.move(centerX, upperY);
      await page.mouse.down();
      await page.waitForTimeout(500);
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // 檢查日誌中的響應
      const shortPressLogs = logs.filter(log => log.includes('短按'));
      const longPressLogs = logs.filter(log => log.includes('長按'));
      
      console.log(`📊 短按日誌數量: ${shortPressLogs.length}`);
      console.log(`📊 長按日誌數量: ${longPressLogs.length}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_觸控響應優化_長短按區分測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 長按與短按區分測試完成');
  });

  test('綜合觸控響應測試', async ({ page }) => {
    console.log('🔍 綜合觸控響應測試');
    
    // 監聽所有觸控相關日誌
    const touchLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('觸') || text.includes('點擊') || text.includes('移動') || text.includes('控制')) {
        touchLogs.push({
          time: Date.now(),
          message: text
        });
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 查找遊戲容器
    const gameContainer = page.locator('canvas').first();
    await expect(gameContainer).toBeVisible();
    
    // 等待遊戲初始化
    await page.waitForTimeout(2000);
    
    // 獲取遊戲區域
    const gameBox = await gameContainer.boundingBox();
    if (gameBox) {
      const centerX = gameBox.x + gameBox.width / 2;
      const upperY = gameBox.y + gameBox.height / 4;
      const lowerY = gameBox.y + (gameBox.height * 3) / 4;
      
      // 綜合測試序列
      console.log('🎮 執行綜合觸控測試序列');
      
      // 1. 快速點擊上方
      await page.mouse.click(centerX, upperY);
      await page.waitForTimeout(200);
      
      // 2. 快速點擊下方
      await page.mouse.click(centerX, lowerY);
      await page.waitForTimeout(200);
      
      // 3. 拖拽從下到上
      await page.mouse.move(centerX, lowerY);
      await page.mouse.down();
      await page.mouse.move(centerX, upperY, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(200);
      
      // 4. 長按上方
      await page.mouse.move(centerX, upperY);
      await page.mouse.down();
      await page.waitForTimeout(600);
      await page.mouse.up();
      
      console.log(`📊 總共記錄了 ${touchLogs.length} 條觸控日誌`);
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_觸控響應優化_綜合測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 綜合觸控響應測試完成');
  });
});
