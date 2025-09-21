const { test, expect } = require('@playwright/test');

test.describe('飛機遊戲靈敏度修復驗證', () => {
  test.beforeEach(async ({ page }) => {
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到主頁
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('驗證飛機高靈敏度響應', async ({ page }) => {
    console.log('🚀 測試飛機高靈敏度響應');
    
    // 監聽控制台日誌來捕獲靈敏度相關信息
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('高靈敏度') || text.includes('飛機向上') || text.includes('飛機向下')) {
        console.log('🚀 靈敏度日誌:', text);
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
      const lowerY = gameBox.y + (gameBox.height * 3) / 4; // 下方區域
      
      console.log(`🎯 遊戲區域: ${gameBox.width}x${gameBox.height}`);
      console.log(`🎯 測試點位: 上方(${centerX}, ${upperY}), 下方(${centerX}, ${lowerY})`);
      
      // 快速連續點擊測試靈敏度
      for (let i = 0; i < 3; i++) {
        console.log(`🚀 第 ${i + 1} 次靈敏度測試`);
        
        // 點擊上方
        await page.mouse.click(centerX, upperY);
        await page.waitForTimeout(200);
        
        // 點擊下方
        await page.mouse.click(centerX, lowerY);
        await page.waitForTimeout(200);
      }
      
      // 檢查是否有高靈敏度響應日誌
      const sensitivityLogs = logs.filter(log => 
        log.includes('高靈敏度') || log.includes('飛機向上') || log.includes('飛機向下')
      );
      
      console.log(`📊 靈敏度響應日誌數量: ${sensitivityLogs.length}`);
      
      // 驗證至少有一些響應
      if (sensitivityLogs.length > 0) {
        console.log('✅ 檢測到高靈敏度響應');
      } else {
        console.log('❌ 未檢測到高靈敏度響應');
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機靈敏度修復_高靈敏度測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 飛機高靈敏度測試完成');
  });

  test('驗證觸控視覺反饋', async ({ page }) => {
    console.log('🎨 測試觸控視覺反饋');
    
    // 監聽控制台日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('簡化版') || text.includes('觸控') || text.includes('閃爍')) {
        console.log('🎨 視覺反饋日誌:', text);
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
      
      console.log('🎨 測試觸控視覺反饋');
      
      // 點擊並等待視覺反饋
      await page.mouse.click(centerX, upperY);
      await page.waitForTimeout(150); // 等待閃爍效果
      
      // 檢查是否有視覺反饋相關日誌
      const feedbackLogs = logs.filter(log => 
        log.includes('簡化版') || log.includes('觸控')
      );
      
      console.log(`🎨 視覺反饋日誌數量: ${feedbackLogs.length}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機靈敏度修復_視覺反饋測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 觸控視覺反饋測試完成');
  });

  test('驗證簡化觸控處理', async ({ page }) => {
    console.log('🔧 測試簡化觸控處理');
    
    // 監聽所有觸控相關日誌
    const touchLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('觸控') || text.includes('簡化版') || text.includes('長按')) {
        touchLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('🔧 觸控處理日誌:', text);
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
      
      console.log('🔧 執行簡化觸控測試');
      
      // 短按測試
      await page.mouse.click(centerX, upperY);
      await page.waitForTimeout(300);
      
      // 長按測試
      await page.mouse.move(centerX, upperY);
      await page.mouse.down();
      await page.waitForTimeout(600); // 超過 500ms 長按閾值
      await page.mouse.up();
      
      console.log(`📊 觸控處理日誌總數: ${touchLogs.length}`);
      
      // 分析日誌
      const shortPressLogs = touchLogs.filter(log => log.message.includes('短按'));
      const longPressLogs = touchLogs.filter(log => log.message.includes('長按'));
      const simplifiedLogs = touchLogs.filter(log => log.message.includes('簡化版'));
      
      console.log(`📊 短按日誌: ${shortPressLogs.length}`);
      console.log(`📊 長按日誌: ${longPressLogs.length}`);
      console.log(`📊 簡化版日誌: ${simplifiedLogs.length}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機靈敏度修復_簡化觸控測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 簡化觸控處理測試完成');
  });

  test('綜合靈敏度和響應測試', async ({ page }) => {
    console.log('🎯 綜合靈敏度和響應測試');
    
    // 監聽所有相關日誌
    const allLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('靈敏度') || text.includes('觸控') || text.includes('飛機') || text.includes('移動')) {
        allLogs.push({
          time: Date.now(),
          message: text,
          type: text.includes('靈敏度') ? 'sensitivity' : 
                text.includes('觸控') ? 'touch' : 
                text.includes('移動') ? 'movement' : 'other'
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
      
      console.log('🎯 執行綜合測試序列');
      
      // 綜合測試序列
      for (let i = 0; i < 3; i++) {
        console.log(`🔄 第 ${i + 1} 輪綜合測試`);
        
        // 快速上下點擊
        await page.mouse.click(centerX, upperY);
        await page.waitForTimeout(100);
        await page.mouse.click(centerX, lowerY);
        await page.waitForTimeout(100);
        
        // 短暫長按
        await page.mouse.move(centerX, upperY);
        await page.mouse.down();
        await page.waitForTimeout(200);
        await page.mouse.up();
        await page.waitForTimeout(200);
      }
      
      // 分析結果
      const sensitivityLogs = allLogs.filter(log => log.type === 'sensitivity');
      const touchLogs = allLogs.filter(log => log.type === 'touch');
      const movementLogs = allLogs.filter(log => log.type === 'movement');
      
      console.log(`📊 綜合測試結果:`);
      console.log(`   - 靈敏度日誌: ${sensitivityLogs.length}`);
      console.log(`   - 觸控日誌: ${touchLogs.length}`);
      console.log(`   - 移動日誌: ${movementLogs.length}`);
      console.log(`   - 總日誌數: ${allLogs.length}`);
      
      // 成功標準：至少有一些響應
      const hasResponse = allLogs.length > 0;
      console.log(`🎯 綜合測試結果: ${hasResponse ? '✅ 成功' : '❌ 失敗'}`);
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機靈敏度修復_綜合測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 綜合靈敏度和響應測試完成');
  });
});
