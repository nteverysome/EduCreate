import { test, expect, devices } from '@playwright/test';

// 測試不同的移動設備
const mobileDevices = [
  'iPhone 12',
  'iPhone 12 Pro',
  'Pixel 5',
  'Galaxy S21',
  'iPad Pro',
];

for (const deviceName of mobileDevices) {
  test.describe(`移動端 iframe 測試 - ${deviceName}`, () => {
    test.use({ ...devices[deviceName] });

    test(`${deviceName} - 基本 iframe 載入測試`, async ({ page }) => {
      // 監聽控制台消息
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      });

      // 監聽網絡錯誤
      const networkErrors: string[] = [];
      page.on('response', response => {
        if (!response.ok()) {
          networkErrors.push(`${response.status()} ${response.url()}`);
        }
      });

      // 導航到測試頁面
      await page.goto('/test-mobile-iframe');
      
      // 等待頁面載入
      await page.waitForLoadState('networkidle');
      
      // 檢查設備信息是否正確顯示
      const deviceInfo = await page.locator('text=設備信息').isVisible();
      expect(deviceInfo).toBe(true);
      
      // 檢查 WebGL 支援
      const webglSupport = await page.locator('text=WebGL 支援').textContent();
      console.log(`${deviceName} WebGL 支援: ${webglSupport}`);
      
      // 運行第一個測試
      await page.click('button:has-text("測試 1")');
      
      // 等待 iframe 載入
      await page.waitForTimeout(5000);
      
      // 檢查 iframe 是否存在
      const iframe = page.frameLocator('iframe').first();
      await expect(iframe.locator('body')).toBeVisible({ timeout: 10000 });
      
      // 檢查控制台是否有遊戲載入消息
      const hasGameMessages = consoleMessages.some(msg => 
        msg.includes('Phaser') || msg.includes('遊戲') || msg.includes('Game')
      );
      
      console.log(`${deviceName} 控制台消息數量: ${consoleMessages.length}`);
      console.log(`${deviceName} 有遊戲消息: ${hasGameMessages}`);
      console.log(`${deviceName} 網絡錯誤: ${networkErrors.length}`);
      
      // 截圖保存
      await page.screenshot({ 
        path: `test-results/mobile-iframe-${deviceName.replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });
    });

    test(`${deviceName} - 觸摸互動測試`, async ({ page }) => {
      await page.goto('/test-mobile-iframe');
      await page.waitForLoadState('networkidle');
      
      // 運行完整權限測試
      await page.click('button:has-text("測試 2")');
      await page.waitForTimeout(3000);
      
      // 嘗試在 iframe 中進行觸摸操作
      const iframe = page.frameLocator('iframe').first();
      
      try {
        // 模擬觸摸點擊
        await iframe.locator('body').click({ position: { x: 100, y: 100 } });
        await page.waitForTimeout(1000);
        
        // 模擬觸摸滑動
        await iframe.locator('body').hover({ position: { x: 100, y: 100 } });
        await page.mouse.down();
        await page.mouse.move(200, 200);
        await page.mouse.up();
        
        console.log(`${deviceName} 觸摸互動測試完成`);
      } catch (error) {
        console.log(`${deviceName} 觸摸互動失敗: ${error}`);
      }
      
      await page.screenshot({ 
        path: `test-results/mobile-touch-${deviceName.replace(/\s+/g, '-')}.png` 
      });
    });

    test(`${deviceName} - 性能測試`, async ({ page }) => {
      // 開始性能監控
      await page.goto('/test-mobile-iframe');
      
      const startTime = Date.now();
      
      // 運行 Vite 版本測試
      await page.click('button:has-text("測試 3")');
      
      // 等待遊戲載入
      await page.waitForTimeout(10000);
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      console.log(`${deviceName} 載入時間: ${loadTime}ms`);
      
      // 檢查 FPS（如果可能）
      const performanceMetrics = await page.evaluate(() => {
        return {
          memory: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          } : null,
          timing: performance.timing,
        };
      });
      
      console.log(`${deviceName} 性能指標:`, performanceMetrics);
      
      // 確保載入時間合理（小於 15 秒）
      expect(loadTime).toBeLessThan(15000);
    });
  });
}

// 通用移動端測試
test.describe('移動端 iframe 通用測試', () => {
  test('遊戲切換器移動端測試', async ({ page }) => {
    // 使用 iPhone 12 設備
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 檢查響應式佈局
    const gameContainer = page.locator('.game-switcher');
    await expect(gameContainer).toBeVisible();
    
    // 檢查 GEPT 選擇器在移動端的顯示
    const geptButtons = page.locator('button:has-text("初級"), button:has-text("中級"), button:has-text("高級")');
    await expect(geptButtons.first()).toBeVisible();
    
    // 測試遊戲切換
    await page.click('button:has-text("切換遊戲")');
    await page.waitForTimeout(1000);
    
    // 檢查下拉選單是否適應移動端
    const dropdown = page.locator('text=可用遊戲');
    await expect(dropdown).toBeVisible();
    
    // 選擇不同的遊戲
    await page.click('button:has-text("飛機碰撞遊戲")');
    await page.waitForTimeout(3000);
    
    // 檢查遊戲是否載入
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    
    // 測試直接遊玩按鈕
    const directPlayButton = page.locator('button:has-text("🎮")');
    await expect(directPlayButton).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/mobile-game-switcher.png',
      fullPage: true 
    });
  });
});

// 錯誤處理測試
test.describe('iframe 錯誤處理測試', () => {
  test('網絡錯誤處理', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    page.on('response', response => {
      if (!response.ok()) {
        errors.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    await page.goto('/test-mobile-iframe');
    await page.click('button:has-text("測試 1")');
    await page.waitForTimeout(5000);
    
    console.log('檢測到的錯誤:', errors);
    
    // 記錄錯誤但不讓測試失敗
    if (errors.length > 0) {
      console.warn('發現錯誤，但測試繼續進行:', errors);
    }
  });
});
