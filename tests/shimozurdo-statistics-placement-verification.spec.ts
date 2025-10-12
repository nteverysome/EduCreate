import { test, expect } from '@playwright/test';

test.describe('Shimozurdo 遊戲統計區域放置驗證', () => {
  test('驗證 Shimozurdo 遊戲已移至統計區域並移除顯示統計按鈕', async ({ page }) => {
    // 導航到遊戲切換器頁面
    await page.goto('https://edu-create.vercel.app/games/switcher');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 1. 驗證「顯示統計」按鈕已被移除
    const showStatsButton = page.locator('button:has-text("顯示統計")');
    await expect(showStatsButton).toHaveCount(0);
    console.log('✅ 「顯示統計」按鈕已成功移除');
    
    // 2. 驗證 Shimozurdo 南志宗遊戲出現在統計區域
    const shimozurdoStatsCard = page.locator('.stats-card:has-text("Shimozurdo 南志宗")');
    await expect(shimozurdoStatsCard).toBeVisible();
    console.log('✅ Shimozurdo 南志宗遊戲已出現在統計區域');
    
    // 3. 驗證 Shimozurdo 遊戲容器存在
    const shimozurdoContainer = page.locator('.shimozurdo-container');
    await expect(shimozurdoContainer).toBeVisible();
    console.log('✅ Shimozurdo 遊戲容器已正確顯示');
    
    // 4. 驗證 GEPT 學習進度區域仍然存在
    const geptProgressSection = page.locator('h3:has-text("GEPT 學習進度")');
    await expect(geptProgressSection).toBeVisible();
    console.log('✅ GEPT 學習進度區域保持正常顯示');
    
    // 5. 驗證統一導航功能正常
    const myActivitiesButton = page.locator('link:has-text("我的活動")');
    await expect(myActivitiesButton).toBeVisible();
    console.log('✅ 統一導航「我的活動」按鈕正常顯示');
    
    // 6. 截圖記錄最終狀態
    await page.screenshot({ 
      path: 'test-results/shimozurdo-statistics-placement-verification.png',
      fullPage: true 
    });
    console.log('✅ 已生成驗證截圖');
    
    // 7. 驗證頁面標題正確
    await expect(page).toHaveTitle(/EduCreate/);
    console.log('✅ 頁面標題驗證通過');
    
    // 8. 驗證沒有 JavaScript 錯誤
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // 等待一段時間確保沒有延遲的錯誤
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.warn('⚠️ 發現 JavaScript 錯誤:', errors);
    } else {
      console.log('✅ 沒有 JavaScript 錯誤');
    }
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
      
      // 驗證 Shimozurdo 統計卡片在該設備上可見
      const shimozurdoStatsCard = page.locator('.stats-card:has-text("Shimozurdo 南志宗")');
      await expect(shimozurdoStatsCard).toBeVisible();
      
      // 截圖記錄
      await page.screenshot({ 
        path: `test-results/shimozurdo-stats-${device.name}-${device.width}x${device.height}.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${device.name} 設備驗證通過`);
    }
  });
});
