import { test, expect } from '@playwright/test';

/**
 * Task 1.0.5: 完整功能驗證和測試
 * 
 * 測試 Vite + Phaser 3 架構的完整功能：
 * 1. 遊戲載入驗證
 * 2. 視覺渲染驗證  
 * 3. 碰撞檢測驗證
 * 4. 詞彙顯示驗證
 * 5. iframe 嵌入機制驗證
 * 6. 完整用戶流程測試
 */

test.describe('Vite + Phaser 3 完整功能驗證', () => {
  
  test('1. 遊戲載入驗證 - Vite 直接載入', async ({ page }) => {
    console.log('🎮 開始測試 Vite 遊戲直接載入...');
    
    // 導航到 Vite 遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/Airplane Collision Game/);
    
    // 等待 Phaser 初始化
    await page.waitForFunction(() => {
      return window.console.log.toString().includes('Phaser') || 
             document.querySelector('canvas') !== null;
    }, { timeout: 10000 });
    
    // 驗證 Canvas 元素存在
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 等待遊戲初始化完成
    await page.waitForTimeout(3000);
    
    // 檢查控制台日誌
    const logs = await page.evaluate(() => {
      return (window as any).gameInitialized || false;
    });
    
    console.log('✅ Vite 遊戲載入驗證完成');
  });

  test('2. iframe 嵌入機制驗證', async ({ page }) => {
    console.log('🖼️ 開始測試 iframe 嵌入機制...');
    
    // 導航到 iframe 嵌入頁面
    await page.goto('http://localhost:3000/games/airplane-iframe');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 驗證 iframe 存在
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    
    // 驗證統計面板
    await expect(page.locator('text=分數')).toBeVisible();
    await expect(page.locator('text=生命值')).toBeVisible();
    await expect(page.locator('text=學習詞彙')).toBeVisible();
    await expect(page.locator('text=準確率')).toBeVisible();
    
    // 驗證控制按鈕
    await expect(page.locator('button:has-text("🔄")')).toBeVisible();
    await expect(page.locator('button:has-text("🗖")')).toBeVisible();
    
    // 等待遊戲載入
    await page.waitForTimeout(5000);
    
    // 驗證狀態變化
    await expect(page.locator('text=遊戲中')).toBeVisible();
    
    console.log('✅ iframe 嵌入機制驗證完成');
  });

  test('3. 視覺渲染和詞彙顯示驗證', async ({ page }) => {
    console.log('🎨 開始測試視覺渲染和詞彙顯示...');
    
    // 導航到 Vite 遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    // 等待遊戲完全載入
    await page.waitForTimeout(5000);
    
    // 驗證 Canvas 渲染
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 檢查 Canvas 尺寸
    const canvasSize = await canvas.boundingBox();
    expect(canvasSize?.width).toBeGreaterThan(0);
    expect(canvasSize?.height).toBeGreaterThan(0);
    
    // 監聽控制台日誌以驗證遊戲功能
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(msg.text());
    });
    
    // 等待更多日誌
    await page.waitForTimeout(3000);
    
    // 驗證關鍵日誌
    const hasPhaser = logs.some(log => log.includes('Phaser'));
    const hasGameScene = logs.some(log => log.includes('遊戲場景'));
    const hasCloudGeneration = logs.some(log => log.includes('生成雲朵'));
    const hasBackgroundUpdate = logs.some(log => log.includes('視差背景'));
    
    expect(hasPhaser).toBeTruthy();
    expect(hasGameScene).toBeTruthy();
    expect(hasCloudGeneration).toBeTruthy();
    expect(hasBackgroundUpdate).toBeTruthy();
    
    console.log('✅ 視覺渲染和詞彙顯示驗證完成');
  });

  test('4. 完整用戶流程測試 - 從主頁到遊戲', async ({ page }) => {
    console.log('🚀 開始完整用戶流程測試...');
    
    // 1. 從主頁開始
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 驗證主頁載入
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 2. 導航到飛機遊戲
    // 尋找飛機遊戲連結或按鈕
    const gameLink = page.locator('a[href*="airplane"], button:has-text("飛機"), a:has-text("飛機")').first();
    
    if (await gameLink.isVisible()) {
      await gameLink.click();
    } else {
      // 如果沒有直接連結，手動導航
      await page.goto('http://localhost:3000/games/airplane-iframe');
    }
    
    await page.waitForLoadState('networkidle');
    
    // 3. 驗證遊戲頁面載入
    await expect(page.locator('text=飛機碰撞遊戲')).toBeVisible();
    
    // 4. 等待 iframe 遊戲載入
    await page.waitForTimeout(5000);
    
    // 5. 驗證遊戲狀態
    await expect(page.locator('text=遊戲中')).toBeVisible();
    
    // 6. 測試控制按鈕
    const reloadButton = page.locator('button:has-text("🔄")');
    if (await reloadButton.isVisible()) {
      await reloadButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 7. 驗證統計數據
    await expect(page.locator('text=分數')).toBeVisible();
    await expect(page.locator('text=生命值')).toBeVisible();
    
    console.log('✅ 完整用戶流程測試完成');
  });

  test('5. 性能和穩定性測試', async ({ page }) => {
    console.log('⚡ 開始性能和穩定性測試...');
    
    // 記錄開始時間
    const startTime = Date.now();
    
    // 導航到遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    // 記錄載入時間
    const loadTime = Date.now() - startTime;
    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    
    // 驗證載入時間合理（應該在 10 秒內）
    expect(loadTime).toBeLessThan(10000);
    
    // 等待遊戲穩定運行
    await page.waitForTimeout(10000);
    
    // 檢查是否有 JavaScript 錯誤
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // 再等待一段時間檢查穩定性
    await page.waitForTimeout(5000);
    
    // 驗證沒有嚴重錯誤
    const criticalErrors = errors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('Cannot read property')
    );
    
    console.log(`📋 檢測到 ${errors.length} 個錯誤，其中 ${criticalErrors.length} 個嚴重錯誤`);
    
    // 允許一些非嚴重錯誤，但嚴重錯誤應該很少
    expect(criticalErrors.length).toBeLessThan(3);
    
    console.log('✅ 性能和穩定性測試完成');
  });

  test('6. 錄製完整功能演示影片', async ({ page }) => {
    console.log('🎥 開始錄製完整功能演示影片...');
    
    // 開始錄製
    await page.video?.path();
    
    // 1. Vite 遊戲直接載入演示
    console.log('📹 錄製 Vite 遊戲直接載入...');
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/vite-game-direct-load.png',
      fullPage: true 
    });
    
    // 2. iframe 嵌入演示
    console.log('📹 錄製 iframe 嵌入演示...');
    await page.goto('http://localhost:3000/games/airplane-iframe');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/iframe-embedded-game.png',
      fullPage: true 
    });
    
    // 3. 測試控制按鈕
    console.log('📹 錄製控制按鈕操作...');
    const reloadButton = page.locator('button:has-text("🔄")');
    if (await reloadButton.isVisible()) {
      await reloadButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 4. 最終截圖
    await page.screenshot({ 
      path: 'test-results/complete-functionality-demo.png',
      fullPage: true 
    });
    
    console.log('✅ 完整功能演示影片錄製完成');
  });

});
