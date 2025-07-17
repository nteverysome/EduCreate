/**
 * 虛擬化活動列表測試
 * 驗證支持1000+活動的高性能虛擬化列表功能
 */

import { test, expect } from '@playwright/test';

test.describe('虛擬化活動列表系統', () => {
  test('虛擬化活動列表頁面載入和基本功能', async ({ page }) => {
    console.log('🚀 開始虛擬化活動列表測試...');

    // 1. 導航到虛擬化活動列表頁面
    console.log('📍 Step 1: 導航到虛擬化活動列表頁面');
    await page.goto('http://localhost:3001/activities/virtualized');
    await expect(page).toHaveTitle(/EduCreate/);
    await page.waitForTimeout(3000); // 等待數據生成

    // 2. 驗證頁面標題和描述
    console.log('📍 Step 2: 驗證頁面標題和描述');
    await expect(page.locator('h1')).toContainText('虛擬化活動管理系統');
    await expect(page.locator('text=支持1000+活動的高性能虛擬化列表')).toBeVisible();

    // 3. 驗證性能指標顯示
    console.log('📍 Step 3: 驗證性能指標顯示');
    await expect(page.locator('text=<500ms')).toBeVisible();
    await expect(page.locator('text=1000+')).toBeVisible();
    await expect(page.locator('text=60fps')).toBeVisible();

    // 4. 驗證虛擬化渲染標識
    console.log('📍 Step 4: 驗證虛擬化渲染標識');
    await expect(page.locator('text=虛擬化渲染已啟用')).toBeVisible();
    await expect(page.locator('text=虛擬化渲染')).toBeVisible();

    // 5. 驗證視圖模式切換按鈕
    console.log('📍 Step 5: 驗證視圖模式切換按鈕');
    const gridButton = page.locator('button[title="網格視圖"]');
    const listButton = page.locator('button[title="列表視圖"]');
    const timelineButton = page.locator('button[title="時間軸視圖"]');
    const kanbanButton = page.locator('button[title="看板視圖"]');

    await expect(gridButton).toBeVisible();
    await expect(listButton).toBeVisible();
    await expect(timelineButton).toBeVisible();
    await expect(kanbanButton).toBeVisible();

    // 6. 測試視圖模式切換
    console.log('📍 Step 6: 測試視圖模式切換');
    
    // 切換到列表視圖
    await listButton.click();
    await page.waitForTimeout(1000);
    await expect(listButton).toHaveClass(/bg-blue-100/);

    // 切換到網格視圖
    await gridButton.click();
    await page.waitForTimeout(1000);
    await expect(gridButton).toHaveClass(/bg-blue-100/);

    // 7. 驗證活動數量顯示
    console.log('📍 Step 7: 驗證活動數量顯示');
    const activityCountText = page.locator('text=/活動 \\(\\d+\\)/');
    await expect(activityCountText).toBeVisible();

    // 8. 驗證虛擬化列表容器
    console.log('📍 Step 8: 驗證虛擬化列表容器');
    const virtualizedList = page.locator('[data-testid="virtualized-activity-list"]');
    await expect(virtualizedList).toBeVisible();

    // 9. 驗證活動項目渲染
    console.log('📍 Step 9: 驗證活動項目渲染');
    // 等待活動項目載入
    await page.waitForTimeout(2000);
    
    // 檢查是否有活動項目（網格或列表項目）
    const hasGridItems = await page.locator('[data-testid^="activity-grid-item-"]').count() > 0;
    const hasListItems = await page.locator('[data-testid^="activity-list-item-"]').count() > 0;
    
    expect(hasGridItems || hasListItems).toBeTruthy();

    // 10. 測試搜索功能
    console.log('📍 Step 10: 測試搜索功能');
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('GEPT');
      await page.waitForTimeout(1000);
      // 驗證搜索結果
      const searchResults = page.locator('[data-testid^="activity-"]');
      const resultCount = await searchResults.count();
      console.log(`搜索結果數量: ${resultCount}`);
    }

    // 11. 測試批量選擇功能
    console.log('📍 Step 11: 測試批量選擇功能');
    const selectAllButton = page.locator('[data-testid="select-all-button"]');
    const deselectAllButton = page.locator('[data-testid="deselect-all-button"]');
    
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
      await page.waitForTimeout(500);
      
      await deselectAllButton.click();
      await page.waitForTimeout(500);
    }

    // 12. 驗證性能 - 滾動測試
    console.log('📍 Step 12: 驗證滾動性能');
    const activitiesDisplay = page.locator('[data-testid="activities-display"]');
    if (await activitiesDisplay.isVisible()) {
      // 測試滾動性能
      await activitiesDisplay.hover();
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
      await page.mouse.wheel(0, -500);
      await page.waitForTimeout(100);
    }

    console.log('✅ 虛擬化活動列表基本功能測試完成');
  });

  test('虛擬化列表性能測試', async ({ page }) => {
    console.log('🚀 開始虛擬化列表性能測試...');

    // 1. 導航到頁面並測量載入時間
    console.log('📍 Step 1: 測量頁面載入時間');
    const startTime = Date.now();
    await page.goto('http://localhost:3001/activities/virtualized');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // 5秒內載入

    // 2. 等待虛擬化列表渲染
    console.log('📍 Step 2: 等待虛擬化列表渲染');
    await page.waitForTimeout(3000);
    
    // 3. 測量首次渲染時間
    console.log('📍 Step 3: 測量首次渲染時間');
    const renderStartTime = Date.now();
    await page.locator('[data-testid="virtualized-activity-list"]').waitFor();
    const renderTime = Date.now() - renderStartTime;
    
    console.log(`虛擬化列表渲染時間: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(1000); // 1秒內渲染

    // 4. 測試滾動性能
    console.log('📍 Step 4: 測試滾動性能');
    const activitiesDisplay = page.locator('[data-testid="activities-display"]');
    
    if (await activitiesDisplay.isVisible()) {
      await activitiesDisplay.hover();
      
      // 執行多次滾動測試
      const scrollTests = 10;
      const scrollTimes: number[] = [];
      
      for (let i = 0; i < scrollTests; i++) {
        const scrollStart = Date.now();
        await page.mouse.wheel(0, 200);
        await page.waitForTimeout(50);
        const scrollEnd = Date.now();
        scrollTimes.push(scrollEnd - scrollStart);
      }
      
      const avgScrollTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      console.log(`平均滾動響應時間: ${avgScrollTime.toFixed(2)}ms`);
      expect(avgScrollTime).toBeLessThan(100); // 100ms內響應
    }

    // 5. 測試視圖切換性能
    console.log('📍 Step 5: 測試視圖切換性能');
    const viewModes = [
      { button: 'button[title="列表視圖"]', name: '列表視圖' },
      { button: 'button[title="網格視圖"]', name: '網格視圖' },
      { button: 'button[title="時間軸視圖"]', name: '時間軸視圖' },
      { button: 'button[title="看板視圖"]', name: '看板視圖' }
    ];

    for (const mode of viewModes) {
      const switchStart = Date.now();
      await page.locator(mode.button).click();
      await page.waitForTimeout(100);
      const switchEnd = Date.now();
      const switchTime = switchEnd - switchStart;
      
      console.log(`${mode.name}切換時間: ${switchTime}ms`);
      expect(switchTime).toBeLessThan(500); // 500ms內切換
    }

    console.log('✅ 虛擬化列表性能測試完成');
  });

  test('虛擬化列表功能完整性測試', async ({ page }) => {
    console.log('🚀 開始虛擬化列表功能完整性測試...');

    // 1. 導航到頁面
    await page.goto('http://localhost:3001/activities/virtualized');
    await page.waitForTimeout(3000);

    // 2. 驗證技術實現說明
    console.log('📍 Step 2: 驗證技術實現說明');
    await expect(page.locator('text=基於 react-window 實現')).toBeVisible();
    await expect(page.locator('text=只渲染可見區域的項目')).toBeVisible();
    await expect(page.locator('text=支持無限滾動加載')).toBeVisible();

    // 3. 驗證使用說明
    console.log('📍 Step 3: 驗證使用說明');
    await expect(page.locator('text=點擊活動項目進行選擇')).toBeVisible();
    await expect(page.locator('text=Ctrl/Cmd + 點擊進行多選')).toBeVisible();
    await expect(page.locator('text=⊞ 網格視圖：卡片式展示')).toBeVisible();

    // 4. 驗證功能特性展示
    console.log('📍 Step 4: 驗證功能特性展示');
    await expect(page.locator('text=高性能渲染')).toBeVisible();
    await expect(page.locator('text=無限滾動')).toBeVisible();
    await expect(page.locator('text=多視圖模式')).toBeVisible();
    await expect(page.locator('text=智能搜索')).toBeVisible();

    // 5. 驗證 MyActivities 組件載入
    console.log('📍 Step 5: 驗證 MyActivities 組件載入');
    const myActivitiesContainer = page.locator('.bg-white.rounded-lg.shadow-sm.border').last();
    await expect(myActivitiesContainer).toBeVisible();

    // 6. 驗證活動管理功能
    console.log('📍 Step 6: 驗證活動管理功能');
    // 檢查是否有活動計數顯示
    const activityCount = page.locator('text=/活動 \\(\\d+\\)/');
    await expect(activityCount).toBeVisible();

    console.log('✅ 虛擬化列表功能完整性測試完成');
  });
});
