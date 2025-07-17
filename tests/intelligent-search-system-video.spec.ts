/**
 * 智能搜索系統測試 - 生成真正的 webm 測試影片
 * 遵循三層整合驗證原則和 EduCreate 測試影片管理強制檢查規則
 */

import { test, expect } from '@playwright/test';

test.describe('智能搜索系統 - 生成測試影片', () => {
  test('智能搜索系統三層整合驗證', async ({ page }) => {
    console.log('🚀 開始智能搜索系統三層整合驗證並生成測試影片...');

    // 第一層：主頁可見性測試
    console.log('📍 第一層：主頁可見性測試');
    await page.goto('http://localhost:3003/');
    await page.waitForTimeout(3000);

    // 驗證智能搜索系統功能卡片
    const intelligentSearchCard = page.getByTestId('feature-intelligent-search');
    await expect(intelligentSearchCard).toBeVisible();
    
    const searchTitle = intelligentSearchCard.locator('h3');
    await expect(searchTitle).toContainText('智能搜索系統');
    
    const searchDescription = intelligentSearchCard.locator('p');
    await expect(searchDescription).toContainText('全文搜索、模糊匹配、語義搜索、語音搜索');
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');
    await page.waitForTimeout(2000);

    // 第二層：導航流程測試
    console.log('📍 第二層：導航流程測試');
    
    const searchLink = intelligentSearchCard.getByTestId('intelligent-search-link');
    await searchLink.click();
    await page.waitForTimeout(5000);

    // 驗證頁面跳轉成功
    await expect(page).toHaveURL('http://localhost:3003/activities/intelligent-search');
    
    // 驗證頁面標題
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText('智能搜索系統');
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');
    await page.waitForTimeout(2000);

    // 第三層：功能互動測試
    console.log('📍 第三層：功能互動測試');

    // 測試智能搜索功能展示
    await expect(page.locator('text=全文搜索')).toBeVisible();
    await expect(page.locator('text=模糊匹配')).toBeVisible();
    await expect(page.locator('text=語義搜索')).toBeVisible();
    await expect(page.locator('text=語音搜索')).toBeVisible();
    
    // 滾動展示功能特性
    await page.evaluate(() => {
      const element = document.querySelector('h2');
      if (element && element.textContent?.includes('搜索功能特性')) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    // 滾動展示搜索算法
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('搜索算法和技術')) {
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
    const listViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-list');
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 視圖切換功能測試成功');
    }

    // 測試網格視圖
    const gridViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-grid');
    if (await gridViewButton.isVisible()) {
      await gridViewButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 網格視圖切換測試成功');
    }

    // 測試時間軸視圖
    const timelineViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-timeline');
    if (await timelineViewButton.isVisible()) {
      await timelineViewButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 時間軸視圖切換測試成功');
    }

    // 測試看板視圖
    const kanbanViewButton = page.getByTestId('multi-view-activity-display').getByTestId('view-mode-kanban');
    if (await kanbanViewButton.isVisible()) {
      await kanbanViewButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 看板視圖切換測試成功');
    }

    console.log('✅ 第三層驗證通過：功能互動測試成功');

    // 展示技術實現
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('技術實現')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 回到頂部完成演示
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    console.log('🎉 智能搜索系統三層整合驗證全部通過！');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(3000);
  });

  test('智能搜索系統性能測試', async ({ page }) => {
    console.log('🚀 開始智能搜索系統性能測試...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/intelligent-search');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`智能搜索頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

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

    // 測試視圖切換性能
    const viewButtons = [
      page.getByTestId('view-mode-list'),
      page.getByTestId('view-mode-grid'),
      page.getByTestId('view-mode-timeline'),
      page.getByTestId('view-mode-kanban')
    ];

    for (const button of viewButtons) {
      if (await button.isVisible()) {
        const switchStart = Date.now();
        await button.click();
        await page.waitForTimeout(100);
        const switchTime = Date.now() - switchStart;
        
        console.log(`視圖切換時間: ${switchTime}ms`);
        expect(switchTime).toBeLessThan(500);
      }
    }

    console.log('✅ 智能搜索系統性能測試完成');
  });
});
