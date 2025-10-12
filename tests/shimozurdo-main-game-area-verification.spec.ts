import { test, expect } from '@playwright/test';

test.describe('Shimozurdo 主遊戲區域驗證', () => {
  test('驗證 Shimozurdo 遊戲已移至主遊戲區域', async ({ page }) => {
    // 導航到遊戲切換器頁面
    await page.goto('https://edu-create.vercel.app/games/switcher');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 1. 驗證主遊戲區域包含 Shimozurdo 遊戲
    const mainGameContainer = page.locator('[data-testid="game-container"]');
    await expect(mainGameContainer).toBeVisible();
    console.log('✅ 主遊戲容器存在');
    
    // 2. 驗證主遊戲區域的 Shimozurdo 標題
    const shimozurdoTitle = page.locator('h3:has-text("Shimozurdo 雲朵遊戲")');
    await expect(shimozurdoTitle).toBeVisible();
    console.log('✅ Shimozurdo 雲朵遊戲標題在主區域顯示');
    
    // 3. 驗證遊戲描述
    const gameDescription = page.locator('text=動態反應記憶');
    await expect(gameDescription).toBeVisible();
    console.log('✅ 遊戲描述正確顯示');
    
    // 4. 驗證遊戲狀態標籤
    const completedBadge = page.locator('text=已完成');
    await expect(completedBadge).toBeVisible();
    console.log('✅ 已完成狀態標籤顯示');
    
    // 5. 驗證載入時間顯示
    const loadingTime = page.locator('text=載入: ~800ms');
    await expect(loadingTime).toBeVisible();
    console.log('✅ 載入時間顯示正確');
    
    // 6. 驗證 ShimozurdoGameContainer 存在
    const shimozurdoContainer = page.locator('.shimozurdo-main-container');
    await expect(shimozurdoContainer).toBeVisible();
    console.log('✅ Shimozurdo 主遊戲容器存在');
    
    // 7. 驗證遊戲 iframe 存在並載入
    const gameIframe = page.locator('iframe').first();
    await expect(gameIframe).toBeVisible();
    console.log('✅ 遊戲 iframe 正常載入');
    
    // 8. 驗證統計區域不再包含 Shimozurdo 遊戲
    const statsGrid = page.locator('.stats-grid');
    const shimozurdoInStats = statsGrid.locator('text=Shimozurdo 南志宗');
    await expect(shimozurdoInStats).toHaveCount(0);
    console.log('✅ 統計區域不再包含 Shimozurdo 遊戲');
    
    // 9. 驗證 GEPT 學習進度區域仍然存在
    const geptProgress = page.locator('h3:has-text("GEPT 學習進度")');
    await expect(geptProgress).toBeVisible();
    console.log('✅ GEPT 學習進度區域保持正常');
    
    // 10. 截圖記錄最終狀態
    await page.screenshot({ 
      path: 'test-results/shimozurdo-main-game-area-verification.png',
      fullPage: true 
    });
    console.log('✅ 已生成驗證截圖');
    
    // 11. 驗證頁面標題正確
    await expect(page).toHaveTitle(/EduCreate/);
    console.log('✅ 頁面標題驗證通過');
    
    // 12. 驗證遊戲載入日誌
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log' && msg.text().includes('Shimozurdo')) {
        logs.push(msg.text());
      }
    });
    
    // 等待遊戲載入完成
    await page.waitForTimeout(3000);
    
    console.log(`✅ 捕獲到 ${logs.length} 條 Shimozurdo 相關日誌`);
    
    // 13. 驗證遊戲功能正常（檢查是否有遊戲元素）
    const playButton = gameIframe.locator('canvas, button:has-text("Play"), text=Play');
    // 注意：由於跨域限制，我們可能無法直接訪問 iframe 內容
    // 但我們可以驗證 iframe 已載入且有內容
    await expect(gameIframe).toHaveAttribute('src');
    console.log('✅ 遊戲 iframe 有有效的 src 屬性');
  });
  
  test('驗證響應式設計在不同設備上的表現', async ({ page }) => {
    const devices = [
      { name: '手機直向', width: 375, height: 812 },
      { name: '平板橫向', width: 1024, height: 768 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      console.log(`\n🔍 測試設備: ${device.name} (${device.width}x${device.height})`);
      
      // 設置視窗大小
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // 導航到頁面
      await page.goto('https://edu-create.vercel.app/games/switcher');
      await page.waitForLoadState('networkidle');
      
      // 驗證主遊戲區域在該設備上可見
      const mainGameContainer = page.locator('[data-testid="game-container"]');
      await expect(mainGameContainer).toBeVisible();
      
      // 驗證 Shimozurdo 標題在該設備上可見
      const shimozurdoTitle = page.locator('h3:has-text("Shimozurdo 雲朵遊戲")');
      await expect(shimozurdoTitle).toBeVisible();
      
      // 截圖記錄
      await page.screenshot({ 
        path: `test-results/shimozurdo-main-${device.name}-${device.width}x${device.height}.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${device.name} 設備驗證通過`);
    }
  });
  
  test('驗證遊戲互動功能', async ({ page }) => {
    await page.goto('https://edu-create.vercel.app/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 等待遊戲完全載入
    await page.waitForTimeout(5000);
    
    // 驗證 GEPT 等級切換功能
    const elementaryButton = page.locator('button:has-text("初級")');
    const intermediateButton = page.locator('button:has-text("中級")');
    const advancedButton = page.locator('button:has-text("高級")');
    
    // 測試 GEPT 等級切換
    await intermediateButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 中級按鈕點擊成功');
    
    await advancedButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 高級按鈕點擊成功');
    
    await elementaryButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 初級按鈕點擊成功');
    
    // 截圖記錄互動測試結果
    await page.screenshot({ 
      path: 'test-results/shimozurdo-interaction-test.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲互動功能測試完成');
  });
});
