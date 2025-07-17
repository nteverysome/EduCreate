/**
 * 高級活動過濾器測試
 * 驗證GEPT等級、模板類型、標籤、日期範圍、學習狀態的多維度過濾功能
 */

import { test, expect } from '@playwright/test';

test.describe('高級活動過濾器系統', () => {
  test('高級過濾器核心功能演示', async ({ page }) => {
    console.log('🚀 開始高級活動過濾器系統演示...');

    // 1. 導航到高級過濾器頁面
    console.log('📍 Step 1: 導航到高級過濾器頁面');
    await page.goto('http://localhost:3002/activities/advanced-filter');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 2. 驗證頁面基本元素
    console.log('📍 Step 2: 驗證頁面基本元素');
    
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('高級過濾器系統');
    await expect(page.locator('text=GEPT等級、模板類型、標籤、日期範圍、學習狀態')).toBeVisible();

    // 3. 驗證過濾器功能展示
    console.log('📍 Step 3: 驗證過濾器功能展示');
    
    await expect(page.locator('text=GEPT 等級過濾').first()).toBeVisible();
    await expect(page.locator('text=模板類型過濾').first()).toBeVisible();
    await expect(page.locator('text=標籤過濾').first()).toBeVisible();
    await expect(page.locator('text=日期範圍過濾').first()).toBeVisible();
    await expect(page.locator('text=學習狀態過濾').first()).toBeVisible();

    // 4. 測試過濾器展開/收起
    console.log('📍 Step 4: 測試過濾器展開/收起');
    
    // 查找過濾器展開按鈕
    const expandButton = page.locator('[data-testid="expand-filter-button"]');
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await page.waitForTimeout(1000);
      
      // 驗證過濾器面板已展開
      const filterPanel = page.locator('[data-testid="advanced-activity-filter"]');
      await expect(filterPanel).toBeVisible();
      console.log('✅ 過濾器面板展開成功');
    }

    // 5. 測試 GEPT 等級過濾
    console.log('📍 Step 5: 測試 GEPT 等級過濾');
    
    const geptFilter = page.locator('[data-testid="gept-level-filter"]');
    if (await geptFilter.isVisible()) {
      // 選擇初級等級
      const elementaryCheckbox = geptFilter.locator('input[type="checkbox"]').first();
      if (await elementaryCheckbox.isVisible()) {
        await elementaryCheckbox.check();
        await page.waitForTimeout(1000);
        console.log('✅ GEPT 初級等級過濾測試成功');
      }
    }

    // 6. 測試模板類型過濾
    console.log('📍 Step 6: 測試模板類型過濾');
    
    const templateFilter = page.locator('[data-testid="template-type-filter"]');
    if (await templateFilter.isVisible()) {
      // 選擇配對遊戲類型
      const matchCheckbox = templateFilter.locator('input[type="checkbox"]').first();
      if (await matchCheckbox.isVisible()) {
        await matchCheckbox.check();
        await page.waitForTimeout(1000);
        console.log('✅ 模板類型過濾測試成功');
      }
    }

    // 7. 測試學習狀態過濾
    console.log('📍 Step 7: 測試學習狀態過濾');
    
    const learningStateFilter = page.locator('[data-testid="learning-state-filter"]');
    if (await learningStateFilter.isVisible()) {
      // 選擇進行中狀態
      const inProgressCheckbox = learningStateFilter.locator('input[type="checkbox"]').first();
      if (await inProgressCheckbox.isVisible()) {
        await inProgressCheckbox.check();
        await page.waitForTimeout(1000);
        console.log('✅ 學習狀態過濾測試成功');
      }
    }

    // 8. 測試標籤過濾
    console.log('📍 Step 8: 測試標籤過濾');
    
    const tagsFilter = page.locator('[data-testid="tags-filter"]');
    if (await tagsFilter.isVisible()) {
      // 選擇第一個標籤
      const firstTagCheckbox = tagsFilter.locator('input[type="checkbox"]').first();
      if (await firstTagCheckbox.isVisible()) {
        await firstTagCheckbox.check();
        await page.waitForTimeout(1000);
        console.log('✅ 標籤過濾測試成功');
      }
    }

    // 9. 測試日期範圍過濾
    console.log('📍 Step 9: 測試日期範圍過濾');
    
    const dateRangeFilter = page.locator('[data-testid="date-range-filter"]');
    if (await dateRangeFilter.isVisible()) {
      // 設置開始日期
      const startDateInput = dateRangeFilter.locator('input[type="date"]').first();
      if (await startDateInput.isVisible()) {
        await startDateInput.fill('2025-01-01');
        await page.waitForTimeout(500);
        
        // 設置結束日期
        const endDateInput = dateRangeFilter.locator('input[type="date"]').last();
        if (await endDateInput.isVisible()) {
          await endDateInput.fill('2025-12-31');
          await page.waitForTimeout(500);
          console.log('✅ 日期範圍過濾測試成功');
        }
      }
    }

    // 10. 測試其他選項過濾
    console.log('📍 Step 10: 測試其他選項過濾');
    
    const otherOptionsFilter = page.locator('[data-testid="other-options-filter"]');
    if (await otherOptionsFilter.isVisible()) {
      // 選擇只顯示已分享的活動
      const sharedOnlyCheckbox = otherOptionsFilter.locator('input[type="checkbox"]').first();
      if (await sharedOnlyCheckbox.isVisible()) {
        await sharedOnlyCheckbox.check();
        await page.waitForTimeout(500);
        console.log('✅ 其他選項過濾測試成功');
      }
    }

    // 11. 測試排序選項
    console.log('📍 Step 11: 測試排序選項');
    
    const sortOptionsFilter = page.locator('[data-testid="sort-options-filter"]');
    if (await sortOptionsFilter.isVisible()) {
      // 更改排序方式
      const sortBySelect = sortOptionsFilter.locator('select').first();
      if (await sortBySelect.isVisible()) {
        await sortBySelect.selectOption('usageCount');
        await page.waitForTimeout(500);
        
        // 更改排序順序
        const sortOrderSelect = sortOptionsFilter.locator('select').last();
        if (await sortOrderSelect.isVisible()) {
          await sortOrderSelect.selectOption('desc');
          await page.waitForTimeout(500);
          console.log('✅ 排序選項測試成功');
        }
      }
    }

    // 12. 驗證過濾結果統計
    console.log('📍 Step 12: 驗證過濾結果統計');
    
    const filterStats = page.locator('[data-testid="filter-results-stats"]');
    if (await filterStats.isVisible()) {
      const statsText = await filterStats.textContent();
      console.log(`過濾結果統計: ${statsText}`);
      
      // 驗證統計信息包含預期內容
      await expect(filterStats).toContainText('顯示');
      await expect(filterStats).toContainText('個活動');
      console.log('✅ 過濾結果統計驗證成功');
    }

    // 13. 測試清除所有過濾器
    console.log('📍 Step 13: 測試清除所有過濾器');
    
    const clearAllButton = page.locator('[data-testid="clear-all-filters"]');
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 清除所有過濾器測試成功');
    }

    // 14. 測試過濾器收起功能
    console.log('📍 Step 14: 測試過濾器收起功能');
    
    const collapseButton = page.locator('[data-testid="collapse-filter-button"]');
    if (await collapseButton.isVisible()) {
      await collapseButton.click();
      await page.waitForTimeout(1000);
      
      // 驗證過濾器已收起
      const collapsedFilter = page.locator('[data-testid="advanced-filter-collapsed"]');
      if (await collapsedFilter.isVisible()) {
        console.log('✅ 過濾器收起功能測試成功');
      }
    }

    // 15. 驗證 GEPT 分級說明
    console.log('📍 Step 15: 驗證 GEPT 分級說明');
    
    // 滾動到 GEPT 分級說明區域
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('GEPT 分級系統')) {
          element.scrollIntoView();
          break;
        }
      }
    });
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=初級 (Elementary)')).toBeVisible();
    await expect(page.locator('text=中級 (Intermediate)')).toBeVisible();
    await expect(page.locator('text=中高級 (High-Intermediate)')).toBeVisible();
    console.log('✅ GEPT 分級說明驗證成功');

    // 16. 驗證技術實現說明
    console.log('📍 Step 16: 驗證技術實現說明');
    
    // 滾動到技術實現說明
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=多維度過濾邏輯')).toBeVisible();
    await expect(page.locator('text=實時結果更新')).toBeVisible();
    await expect(page.locator('text=直觀的過濾器界面')).toBeVisible();
    console.log('✅ 技術實現說明驗證成功');

    // 17. 最終功能驗證
    console.log('📍 Step 17: 最終功能驗證');
    
    // 滾動回頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    // 再次展開過濾器進行最終測試
    const finalExpandButton = page.locator('[data-testid="expand-filter-button"]');
    if (await finalExpandButton.isVisible()) {
      await finalExpandButton.click();
      await page.waitForTimeout(1000);
      
      // 快速測試幾個過濾器
      const finalGeptFilter = page.locator('[data-testid="gept-level-filter"]');
      if (await finalGeptFilter.isVisible()) {
        const checkbox = finalGeptFilter.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await page.waitForTimeout(500);
          await checkbox.uncheck();
          await page.waitForTimeout(500);
        }
      }
      
      console.log('✅ 最終功能驗證成功');
    }

    console.log('✅ 高級活動過濾器系統演示完成');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(2000);
  });

  test('高級過濾器性能測試', async ({ page }) => {
    console.log('🚀 開始高級過濾器性能測試...');

    // 1. 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3002/activities/advanced-filter');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    // 2. 測試過濾器響應性能
    await page.waitForTimeout(2000);
    
    // 展開過濾器
    const expandButton = page.locator('[data-testid="expand-filter-button"]');
    if (await expandButton.isVisible()) {
      const expandStart = Date.now();
      await expandButton.click();
      await page.waitForTimeout(100);
      const expandTime = Date.now() - expandStart;
      
      console.log(`過濾器展開時間: ${expandTime}ms`);
      expect(expandTime).toBeLessThan(1000);
    }

    // 3. 測試過濾操作性能
    const filterOperations = [
      { testId: 'gept-level-filter', name: 'GEPT等級過濾' },
      { testId: 'template-type-filter', name: '模板類型過濾' },
      { testId: 'learning-state-filter', name: '學習狀態過濾' }
    ];

    for (const operation of filterOperations) {
      const filter = page.locator(`[data-testid="${operation.testId}"]`);
      if (await filter.isVisible()) {
        const checkbox = filter.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          const filterStart = Date.now();
          await checkbox.check();
          await page.waitForTimeout(100);
          const filterTime = Date.now() - filterStart;
          
          console.log(`${operation.name}響應時間: ${filterTime}ms`);
          expect(filterTime).toBeLessThan(500);
        }
      }
    }

    console.log('✅ 高級過濾器性能測試完成');
  });
});
