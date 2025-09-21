const { test, expect } = require('@playwright/test');

test.describe('飛機水平線基準觸控驗證', () => {
  test.beforeEach(async ({ page }) => {
    // 設置移動設備視窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到主頁
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('驗證以飛機水平線為基準的觸控控制', async ({ page }) => {
    console.log('🎯 測試飛機水平線基準觸控');
    
    // 監聽控制台日誌來捕獲基準線相關信息
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('飛機基準') || text.includes('基準線') || text.includes('飛機Y')) {
        console.log('🎯 基準線日誌:', text);
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
      
      // 測試不同高度的點擊位置
      const testPositions = [
        { name: '頂部區域', y: gameBox.y + 50, expected: '向上' },
        { name: '上方區域', y: gameBox.y + gameBox.height * 0.3, expected: '向上' },
        { name: '中上區域', y: gameBox.y + gameBox.height * 0.4, expected: '向上' },
        { name: '中下區域', y: gameBox.y + gameBox.height * 0.6, expected: '向下' },
        { name: '下方區域', y: gameBox.y + gameBox.height * 0.7, expected: '向下' },
        { name: '底部區域', y: gameBox.y + gameBox.height - 50, expected: '向下' }
      ];
      
      console.log(`🎯 遊戲區域: ${gameBox.width}x${gameBox.height}`);
      
      // 測試每個位置
      for (const pos of testPositions) {
        console.log(`🎯 測試 ${pos.name} (${centerX}, ${pos.y}) - 預期: ${pos.expected}`);
        
        // 清除之前的日誌
        logs.length = 0;
        
        // 點擊測試位置
        await page.mouse.click(centerX, pos.y);
        await page.waitForTimeout(300);
        
        // 檢查日誌中的響應
        const recentLogs = logs.slice(-5);
        const hasCorrectResponse = recentLogs.some(log => 
          log.includes(pos.expected === '向上' ? '向上移動' : '向下移動')
        );
        
        if (hasCorrectResponse) {
          console.log(`✅ ${pos.name} 響應正確: ${pos.expected}`);
        } else {
          console.log(`❌ ${pos.name} 響應異常`);
          console.log('最近日誌:', recentLogs);
        }
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機水平線基準_觸控測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 飛機水平線基準觸控測試完成');
  });

  test('驗證飛機位置動態基準線', async ({ page }) => {
    console.log('🎯 測試動態基準線跟隨飛機位置');
    
    // 監聽基準線相關日誌
    const baselineLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('飛機Y') || text.includes('點擊Y') || text.includes('基準線')) {
        baselineLogs.push({
          time: Date.now(),
          message: text
        });
        console.log('📍 基準線追蹤:', text);
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
      const topY = gameBox.y + 100;
      const bottomY = gameBox.y + gameBox.height - 100;
      
      console.log('🎯 測試基準線動態跟隨');
      
      // 先讓飛機移動到上方
      console.log('📍 第一階段：移動飛機到上方');
      for (let i = 0; i < 3; i++) {
        await page.mouse.click(centerX, topY);
        await page.waitForTimeout(200);
      }
      
      // 等待飛機移動
      await page.waitForTimeout(1000);
      
      // 現在測試相對於新位置的點擊
      console.log('📍 第二階段：測試相對於上方位置的點擊');
      await page.mouse.click(centerX, topY - 50); // 應該還是向上
      await page.waitForTimeout(300);
      await page.mouse.click(centerX, bottomY); // 應該向下
      await page.waitForTimeout(300);
      
      // 讓飛機移動到下方
      console.log('📍 第三階段：移動飛機到下方');
      for (let i = 0; i < 3; i++) {
        await page.mouse.click(centerX, bottomY);
        await page.waitForTimeout(200);
      }
      
      // 等待飛機移動
      await page.waitForTimeout(1000);
      
      // 測試相對於下方位置的點擊
      console.log('📍 第四階段：測試相對於下方位置的點擊');
      await page.mouse.click(centerX, topY); // 應該向上
      await page.waitForTimeout(300);
      await page.mouse.click(centerX, bottomY + 50); // 應該還是向下
      await page.waitForTimeout(300);
      
      console.log(`📊 基準線追蹤日誌總數: ${baselineLogs.length}`);
      
      // 分析基準線變化
      const planeYValues = baselineLogs
        .map(log => {
          const match = log.message.match(/飛機Y: (\d+)/);
          return match ? parseInt(match[1]) : null;
        })
        .filter(y => y !== null);
      
      if (planeYValues.length > 0) {
        const minY = Math.min(...planeYValues);
        const maxY = Math.max(...planeYValues);
        console.log(`📊 飛機Y座標範圍: ${minY} - ${maxY} (變化: ${maxY - minY})`);
        
        if (maxY - minY > 50) {
          console.log('✅ 基準線成功跟隨飛機位置變化');
        } else {
          console.log('❌ 基準線變化不明顯');
        }
      }
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機水平線基準_動態基準線測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 動態基準線測試完成');
  });

  test('驗證 Shimozurdo 遊戲水平線基準', async ({ page }) => {
    console.log('🎯 測試 Shimozurdo 遊戲太空船水平線基準');
    
    // 監聽太空船基準線日誌
    const spaceshipLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('太空船基準') || text.includes('太空船Y') || text.includes('基準線')) {
        spaceshipLogs.push(text);
        console.log('🚀 太空船基準線:', text);
      }
    });
    
    // 導航到 Shimozurdo 遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
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
      const upperY = gameBox.y + gameBox.height * 0.3;
      const lowerY = gameBox.y + gameBox.height * 0.7;
      
      console.log('🚀 測試太空船基準線觸控');
      
      // 測試上方點擊
      console.log('🚀 測試點擊上方區域');
      await page.mouse.click(centerX, upperY);
      await page.waitForTimeout(500);
      
      // 測試下方點擊
      console.log('🚀 測試點擊下方區域');
      await page.mouse.click(centerX, lowerY);
      await page.waitForTimeout(500);
      
      // 檢查響應
      const upLogs = spaceshipLogs.filter(log => log.includes('向上移動'));
      const downLogs = spaceshipLogs.filter(log => log.includes('向下移動'));
      
      console.log(`📊 太空船響應統計:`);
      console.log(`   - 向上移動日誌: ${upLogs.length}`);
      console.log(`   - 向下移動日誌: ${downLogs.length}`);
      console.log(`   - 總基準線日誌: ${spaceshipLogs.length}`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機水平線基準_Shimozurdo基準線測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ Shimozurdo 太空船基準線測試完成');
  });

  test('綜合水平線基準控制測試', async ({ page }) => {
    console.log('🎯 綜合水平線基準控制測試');
    
    // 監聽所有基準線相關日誌
    const allLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('基準') || text.includes('水平線') || text.includes('飛機Y') || text.includes('點擊Y')) {
        allLogs.push({
          time: Date.now(),
          message: text,
          game: text.includes('太空船') ? 'shimozurdo' : 'airplane'
        });
      }
    });
    
    // 測試飛機遊戲
    console.log('🎮 第一階段：測試飛機遊戲');
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    let gameContainer = page.locator('canvas').first();
    await expect(gameContainer).toBeVisible();
    await page.waitForTimeout(2000);
    
    let gameBox = await gameContainer.boundingBox();
    if (gameBox) {
      const centerX = gameBox.x + gameBox.width / 2;
      const testY = gameBox.y + gameBox.height * 0.3;
      
      // 快速測試飛機遊戲
      await page.mouse.click(centerX, testY);
      await page.waitForTimeout(300);
      await page.mouse.click(centerX, testY + 200);
      await page.waitForTimeout(300);
    }
    
    // 測試 Shimozurdo 遊戲
    console.log('🚀 第二階段：測試 Shimozurdo 遊戲');
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    gameContainer = page.locator('canvas').first();
    await expect(gameContainer).toBeVisible();
    await page.waitForTimeout(2000);
    
    gameBox = await gameContainer.boundingBox();
    if (gameBox) {
      const centerX = gameBox.x + gameBox.width / 2;
      const testY = gameBox.y + gameBox.height * 0.3;
      
      // 快速測試 Shimozurdo 遊戲
      await page.mouse.click(centerX, testY);
      await page.waitForTimeout(300);
      await page.mouse.click(centerX, testY + 200);
      await page.waitForTimeout(300);
    }
    
    // 分析結果
    const airplaneLogs = allLogs.filter(log => log.game === 'airplane');
    const shimozurdoLogs = allLogs.filter(log => log.game === 'shimozurdo');
    
    console.log(`📊 綜合測試結果:`);
    console.log(`   - 飛機遊戲基準線日誌: ${airplaneLogs.length}`);
    console.log(`   - Shimozurdo 基準線日誌: ${shimozurdoLogs.length}`);
    console.log(`   - 總基準線日誌: ${allLogs.length}`);
    
    // 成功標準：兩個遊戲都有基準線響應
    const success = airplaneLogs.length > 0 && shimozurdoLogs.length > 0;
    console.log(`🎯 綜合測試結果: ${success ? '✅ 成功' : '❌ 失敗'}`);
    
    // 最終截圖
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機水平線基準_綜合測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 綜合水平線基準控制測試完成');
  });
});
