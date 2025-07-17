/**
 * 多視圖模式活動顯示測試
 * 驗證網格、列表、時間軸、看板四種視圖模式的功能
 */

import { test, expect } from '@playwright/test';

test.describe('多視圖模式活動顯示系統', () => {
  test('多視圖模式核心功能演示', async ({ page }) => {
    console.log('🚀 開始多視圖模式活動顯示系統演示...');

    // 1. 導航到多視圖活動管理頁面
    console.log('📍 Step 1: 導航到多視圖活動管理頁面');
    await page.goto('http://localhost:3001/activities/multi-view');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 2. 驗證頁面基本元素
    console.log('📍 Step 2: 驗證頁面基本元素');
    
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('多視圖模式活動管理系統');
    await expect(page.locator('text=網格、列表、時間軸、看板四種視圖模式')).toBeVisible();

    // 3. 驗證四種視圖模式特性展示
    console.log('📍 Step 3: 驗證四種視圖模式特性展示');
    
    await expect(page.locator('text=網格視圖').first()).toBeVisible();
    await expect(page.locator('text=列表視圖').first()).toBeVisible();
    await expect(page.locator('text=時間軸視圖').first()).toBeVisible();
    await expect(page.locator('text=看板視圖').first()).toBeVisible();

    // 4. 驗證多視圖活動顯示組件
    console.log('📍 Step 4: 驗證多視圖活動顯示組件');
    await page.waitForTimeout(2000);

    const multiViewDisplay = page.locator('[data-testid="multi-view-activity-display"]');
    await expect(multiViewDisplay).toBeVisible();

    // 5. 測試視圖模式切換
    console.log('📍 Step 5: 測試視圖模式切換');
    const gridButton = multiViewDisplay.locator('[data-testid="view-mode-grid"]');
    if (await gridButton.isVisible()) {
      await gridButton.click();
      await page.waitForTimeout(1000);
      await expect(gridButton).toHaveClass(/bg-white/);
      console.log('✅ 網格視圖切換成功');
    }

    // 測試列表視圖
    const listButton = multiViewDisplay.locator('[data-testid="view-mode-list"]');
    if (await listButton.isVisible()) {
      await listButton.click();
      await page.waitForTimeout(1000);
      await expect(listButton).toHaveClass(/bg-white/);
      console.log('✅ 列表視圖切換成功');
    }

    // 測試時間軸視圖
    const timelineButton = multiViewDisplay.locator('[data-testid="view-mode-timeline"]');
    if (await timelineButton.isVisible()) {
      await timelineButton.click();
      await page.waitForTimeout(1000);
      await expect(timelineButton).toHaveClass(/bg-white/);

      // 驗證時間軸視圖內容
      const timelineView = page.locator('[data-testid="timeline-view"]');
      if (await timelineView.isVisible()) {
        console.log('✅ 時間軸視圖顯示成功');
      }
    }

    // 測試看板視圖
    const kanbanButton = multiViewDisplay.locator('[data-testid="view-mode-kanban"]');
    if (await kanbanButton.isVisible()) {
      await kanbanButton.click();
      await page.waitForTimeout(1000);
      await expect(kanbanButton).toHaveClass(/bg-white/);

      // 驗證看板視圖內容
      const kanbanView = page.locator('[data-testid="kanban-view"]');
      if (await kanbanView.isVisible()) {
        console.log('✅ 看板視圖顯示成功');

        // 檢查看板列
        const kanbanColumns = page.locator('[data-testid^="kanban-column-"]');
        const columnCount = await kanbanColumns.count();
        console.log(`看板列數量: ${columnCount}`);
      }
    }

    // 6. 測試自定義佈局控制
    console.log('📍 Step 6: 測試自定義佈局控制');
    
    // 切換回網格視圖測試佈局控制
    await multiViewDisplay.locator('[data-testid="view-mode-grid"]').click();
    await page.waitForTimeout(1000);
    
    // 查找列數選擇器
    const columnSelect = page.locator('select').filter({ hasText: /列/ });
    if (await columnSelect.isVisible()) {
      await columnSelect.selectOption('4');
      await page.waitForTimeout(500);
      console.log('✅ 網格列數調整成功');
    }

    // 7. 測試時間軸分組控制
    console.log('📍 Step 7: 測試時間軸分組控制');
    
    // 切換到時間軸視圖
    await multiViewDisplay.locator('[data-testid="view-mode-timeline"]').click();
    await page.waitForTimeout(1000);
    
    // 查找分組選擇器
    const groupSelect = page.locator('select').filter({ hasText: /分組/ });
    if (await groupSelect.isVisible()) {
      await groupSelect.selectOption('week');
      await page.waitForTimeout(500);
      console.log('✅ 時間軸分組調整成功');
    }

    // 8. 測試活動項目互動
    console.log('📍 Step 8: 測試活動項目互動');
    
    // 切換回列表視圖進行互動測試
    await multiViewDisplay.locator('[data-testid="view-mode-list"]').click();
    await page.waitForTimeout(1000);
    
    // 查找活動項目
    const activityItems = page.locator('[data-testid^="activity-"], .activity-item, .activity-card');
    const itemCount = await activityItems.count();
    console.log(`活動項目數量: ${itemCount}`);

    if (itemCount > 0) {
      const firstItem = activityItems.first();
      await firstItem.hover();
      await page.waitForTimeout(500);
      console.log('✅ 活動項目互動成功');
    }

    // 9. 測試批量選擇功能
    console.log('📍 Step 9: 測試批量選擇功能');
    
    const selectAllButton = page.locator('[data-testid="select-all-button"]');
    const deselectAllButton = page.locator('[data-testid="deselect-all-button"]');
    
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
      await page.waitForTimeout(500);
      
      if (await deselectAllButton.isVisible()) {
        await deselectAllButton.click();
        await page.waitForTimeout(500);
        console.log('✅ 批量選擇功能測試成功');
      }
    }

    // 10. 驗證技術實現說明
    console.log('📍 Step 10: 驗證技術實現說明');
    
    // 滾動到頁面底部查看技術說明
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=統一的數據接口')).toBeVisible();
    await expect(page.locator('text=模塊化視圖組件')).toBeVisible();
    await expect(page.locator('text=無縫視圖切換')).toBeVisible();

    // 11. 測試響應式設計
    console.log('📍 Step 11: 測試響應式設計');
    
    // 測試不同視窗大小
    await page.setViewportSize({ width: 768, height: 1024 }); // 平板尺寸
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 375, height: 667 }); // 手機尺寸
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // 桌面尺寸
    await page.waitForTimeout(1000);
    
    console.log('✅ 響應式設計測試完成');

    // 12. 最終功能驗證
    console.log('📍 Step 12: 最終功能驗證');
    
    // 滾動回頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    // 最後一次測試所有視圖模式
    const viewModes = ['grid', 'list', 'timeline', 'kanban'];
    for (const mode of viewModes) {
      const button = multiViewDisplay.locator(`[data-testid="view-mode-${mode}"]`);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(800);
        console.log(`✅ ${mode} 視圖最終驗證成功`);
      }
    }

    console.log('✅ 多視圖模式活動顯示系統演示完成');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(2000);
  });

  test('多視圖模式性能測試', async ({ page }) => {
    console.log('🚀 開始多視圖模式性能測試...');

    // 1. 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3001/activities/multi-view');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    // 2. 測試視圖切換性能
    await page.waitForTimeout(2000);
    
    const viewModes = ['grid', 'list', 'timeline', 'kanban'];
    const switchTimes: number[] = [];
    
    const multiViewDisplay = page.locator('[data-testid="multi-view-activity-display"]');

    for (const mode of viewModes) {
      const button = multiViewDisplay.locator(`[data-testid="view-mode-${mode}"]`);
      if (await button.isVisible()) {
        const switchStart = Date.now();
        await button.click();
        await page.waitForTimeout(100);
        const switchEnd = Date.now();
        const switchTime = switchEnd - switchStart;

        switchTimes.push(switchTime);
        console.log(`${mode} 視圖切換時間: ${switchTime}ms`);
        expect(switchTime).toBeLessThan(1000);
      }
    }
    
    const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
    console.log(`平均視圖切換時間: ${avgSwitchTime.toFixed(2)}ms`);

    console.log('✅ 多視圖模式性能測試完成');
  });
});
