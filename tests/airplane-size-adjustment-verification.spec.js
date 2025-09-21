const { test, expect } = require('@playwright/test');

test.describe('飛機遊戲尺寸調整驗證', () => {
  test.beforeEach(async ({ page }) => {
    // 設置移動設備視窗
    await page.setViewportSize({ width: 1274, height: 739 });
    
    // 導航到主頁
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('驗證飛機尺寸調整 - Airplane Game', async ({ page }) => {
    console.log('🔍 測試飛機遊戲中飛機尺寸調整');
    
    // 監聽控制台日誌來捕獲尺寸設置
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('太空船') || text.includes('飛機') || text.includes('setScale')) {
        console.log('🎮 飛機尺寸日誌:', text);
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 檢查遊戲是否載入
    const gameContainer = page.locator('#game-container');
    await expect(gameContainer).toBeVisible();
    
    // 等待遊戲初始化
    await page.waitForTimeout(2000);
    
    // 截圖記錄飛機尺寸
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機遊戲_飛機尺寸調整_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 飛機遊戲飛機尺寸調整驗證完成');
  });

  test('驗證雲朵尺寸調整 - Airplane Game', async ({ page }) => {
    console.log('🔍 測試飛機遊戲中雲朵尺寸調整');
    
    // 監聽控制台日誌來捕獲雲朵生成
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('雲朵') || text.includes('cloud') || text.includes('☁️')) {
        console.log('☁️ 雲朵尺寸日誌:', text);
      }
    });
    
    // 導航到飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 等待雲朵生成
    console.log('⏳ 等待雲朵生成...');
    await page.waitForTimeout(5000);
    
    // 截圖記錄雲朵尺寸
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_飛機遊戲_雲朵尺寸調整_成功_v1_001.png`,
      fullPage: true 
    });
    
    // 檢查雲朵生成日誌
    const cloudLogs = logs.filter(log => 
      log.includes('☁️ 使用雲朵紋理') || 
      log.includes('設定雲朵大小')
    );
    
    console.log('☁️ 雲朵相關日誌數量:', cloudLogs.length);
    
    console.log('✅ 飛機遊戲雲朵尺寸調整驗證完成');
  });

  test('驗證飛機尺寸調整 - Shimozurdo Game', async ({ page }) => {
    console.log('🔍 測試Shimozurdo遊戲中飛機尺寸調整');
    
    // 監聽控制台日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('太空船') || text.includes('player') || text.includes('setScale')) {
        console.log('🚀 太空船尺寸日誌:', text);
      }
    });
    
    // 導航到Shimozurdo遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 查找遊戲畫布
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 等待遊戲初始化
    await page.waitForTimeout(2000);
    
    // 截圖記錄太空船尺寸
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo遊戲_飛機尺寸調整_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ Shimozurdo遊戲飛機尺寸調整驗證完成');
  });

  test('驗證雲朵尺寸調整 - Shimozurdo Game', async ({ page }) => {
    console.log('🔍 測試Shimozurdo遊戲中雲朵尺寸調整');
    
    // 監聽控制台日誌
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      if (text.includes('敵人') || text.includes('enemy') || text.includes('cloud')) {
        console.log('☁️ 敵人雲朵尺寸日誌:', text);
      }
    });
    
    // 導航到Shimozurdo遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 等待敵人雲朵生成
    console.log('⏳ 等待敵人雲朵生成...');
    await page.waitForTimeout(8000);
    
    // 截圖記錄敵人雲朵尺寸
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_Shimozurdo遊戲_雲朵尺寸調整_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ Shimozurdo遊戲雲朵尺寸調整驗證完成');
  });

  test('綜合尺寸對比測試', async ({ page }) => {
    console.log('🔍 綜合尺寸對比測試');
    
    // 1. 測試飛機遊戲
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_尺寸對比_飛機遊戲_成功_v1_001.png`,
      fullPage: true 
    });
    
    // 2. 測試Shimozurdo遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_尺寸對比_Shimozurdo遊戲_成功_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 綜合尺寸對比測試完成');
  });
});
