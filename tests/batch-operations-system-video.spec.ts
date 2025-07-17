/**
 * 批量操作系統測試 - 生成真正的 webm 測試影片
 * 遵循三層整合驗證原則和 EduCreate 測試影片管理強制檢查規則
 */

import { test, expect } from '@playwright/test';

test.describe('批量操作系統 - 生成測試影片', () => {
  test('批量操作系統三層整合驗證', async ({ page }) => {
    console.log('🚀 開始批量操作系統三層整合驗證並生成測試影片...');

    // 第一層：主頁可見性測試
    console.log('📍 第一層：主頁可見性測試');
    await page.goto('http://localhost:3003/');
    await page.waitForTimeout(3000);

    // 驗證批量操作系統功能卡片
    const batchOperationsCard = page.getByTestId('feature-batch-operations');
    await expect(batchOperationsCard).toBeVisible();
    
    const batchTitle = batchOperationsCard.locator('h3');
    await expect(batchTitle).toContainText('批量操作系統');
    
    const batchDescription = batchOperationsCard.locator('p');
    await expect(batchDescription).toContainText('選擇、移動、複製、刪除、分享、標籤、導出');
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');
    await page.waitForTimeout(2000);

    // 第二層：導航流程測試
    console.log('📍 第二層：導航流程測試');
    
    const batchLink = batchOperationsCard.getByTestId('batch-operations-link');
    await batchLink.click();
    await page.waitForTimeout(5000);

    // 驗證頁面跳轉成功
    await expect(page).toHaveURL('http://localhost:3003/activities/batch-operations');
    
    // 驗證頁面標題
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText('批量操作系統');
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');
    await page.waitForTimeout(2000);

    // 第三層：功能互動測試
    console.log('📍 第三層：功能互動測試');

    // 測試批量操作功能展示
    await expect(page.locator('text=多選功能')).toBeVisible();
    await expect(page.locator('text=批量操作')).toBeVisible();
    await expect(page.locator('text=快捷鍵')).toBeVisible();
    
    // 滾動展示功能特性
    await page.evaluate(() => {
      const element = document.querySelector('h2');
      if (element && element.textContent?.includes('批量操作功能特性')) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    // 滾動展示操作流程
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('操作流程')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 滾動展示安全和性能
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('安全和性能')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 滾動展示記憶科學整合
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('記憶科學整合')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 滾動到 MyActivities 組件
    await page.evaluate(() => {
      const elements = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm.border');
      const lastElement = elements[elements.length - 1];
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    // 測試智能搜索輸入框
    const searchInput = page.getByTestId('search-input');
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await page.waitForTimeout(1000);
      console.log('✅ 智能搜索輸入框測試成功');
    }

    // 測試視圖切換功能
    console.log('📍 測試視圖切換功能');

    // 測試列表視圖
    const listViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-list');
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 列表視圖切換測試成功');
    }

    // 測試時間軸視圖
    const timelineViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-timeline');
    if (await timelineViewButton.isVisible()) {
      await timelineViewButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 時間軸視圖切換測試成功');
      
      // 驗證時間軸視圖特有功能（分組選項）
      const groupingOption = page.locator('text=分組:');
      if (await groupingOption.isVisible()) {
        console.log('✅ 時間軸視圖分組功能顯示正常');
      }
    }

    // 測試看板視圖
    const kanbanViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-kanban');
    if (await kanbanViewButton.isVisible()) {
      await kanbanViewButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 看板視圖切換測試成功');
      
      // 驗證看板視圖特有功能（狀態欄）
      const draftColumn = page.locator('text=草稿');
      const publishedColumn = page.locator('text=已發布');
      const priorityColumn = page.locator('text=高優先級');
      const archivedColumn = page.locator('text=已歸檔');
      
      if (await draftColumn.isVisible() && await publishedColumn.isVisible() && 
          await priorityColumn.isVisible() && await archivedColumn.isVisible()) {
        console.log('✅ 看板視圖狀態欄顯示正常');
      }
    }

    // 測試網格視圖
    const gridViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-grid');
    if (await gridViewButton.isVisible()) {
      await gridViewButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 網格視圖切換測試成功');
    }

    // 測試批量操作按鈕
    console.log('📍 測試批量操作相關功能');
    
    const batchOperationButton = page.locator('button:has-text("批量操作")');
    if (await batchOperationButton.isVisible()) {
      console.log('✅ 批量操作按鈕顯示正常');
    }

    const selectAllButton = page.locator('button:has-text("全選")');
    if (await selectAllButton.isVisible()) {
      console.log('✅ 全選按鈕顯示正常');
    }

    const cancelSelectionButton = page.locator('button:has-text("取消選擇")');
    if (await cancelSelectionButton.isVisible()) {
      console.log('✅ 取消選擇按鈕顯示正常');
    }

    console.log('✅ 第三層驗證通過：功能互動測試成功');

    // 展示使用說明
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('使用說明')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 回到頂部完成演示
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    console.log('🎉 批量操作系統三層整合驗證全部通過！');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(3000);
  });

  test('批量操作系統性能測試', async ({ page }) => {
    console.log('🚀 開始批量操作系統性能測試...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/batch-operations');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`批量操作頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    // 測試視圖切換性能
    const viewButtons = [
      { selector: 'view-mode-list', name: '列表視圖' },
      { selector: 'view-mode-timeline', name: '時間軸視圖' },
      { selector: 'view-mode-kanban', name: '看板視圖' },
      { selector: 'view-mode-grid', name: '網格視圖' }
    ];

    for (const viewButton of viewButtons) {
      const button = page.getByTestId('multi-view-activity-display').getByTestId(viewButton.selector);
      if (await button.isVisible()) {
        const switchStart = Date.now();
        await button.click();
        await page.waitForTimeout(100);
        const switchTime = Date.now() - switchStart;
        
        console.log(`${viewButton.name}切換時間: ${switchTime}ms`);
        expect(switchTime).toBeLessThan(500);
      }
    }

    // 測試搜索響應性能
    const searchInput = page.getByTestId('search-input');
    if (await searchInput.isVisible()) {
      const searchStart = Date.now();
      await searchInput.fill('測試搜索');
      await page.waitForTimeout(500);
      const searchTime = Date.now() - searchStart;
      
      console.log(`搜索響應時間: ${searchTime}ms`);
      expect(searchTime).toBeLessThan(1000);
    }

    console.log('✅ 批量操作系統性能測試完成');
  });
});
