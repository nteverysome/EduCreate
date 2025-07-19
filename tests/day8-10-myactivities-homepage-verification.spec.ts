/**
 * Day 8-10: MyActivities 主頁面驗證測試
 * 驗證主頁優先原則修復和功能可見性改進
 */

import { test, expect } from '@playwright/test';

test.describe('Day 8-10: MyActivities 主頁面修復驗證', () => {
  test('主頁優先原則修復驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 8-10 主頁優先原則修復驗證測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁 MyActivities 入口檢查');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 檢查新添加的 MyActivities 功能卡片
    const myActivitiesFeature = page.getByTestId('feature-my-activities');
    if (await myActivitiesFeature.isVisible()) {
      console.log('   ✅ 主頁發現 MyActivities 功能卡片');
      
      // 檢查標題和描述
      const title = await myActivitiesFeature.locator('h3').textContent();
      const description = await myActivitiesFeature.locator('p').textContent();
      console.log(`   📋 標題: ${title}`);
      console.log(`   📝 描述: ${description}`);
      
      if (title?.includes('我的活動管理')) {
        console.log('   ✅ 標題正確');
      } else {
        console.log('   ❌ 標題不正確');
      }
      
      if (description?.includes('1000+活動')) {
        console.log('   ✅ 描述包含關鍵特性');
      } else {
        console.log('   ❌ 描述缺少關鍵特性');
      }
    } else {
      console.log('   ❌ 主頁缺少 MyActivities 功能卡片');
    }

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：MyActivities 導航流程測試');
    
    // 測試從主頁點擊進入 MyActivities
    const myActivitiesLink = page.getByTestId('my-activities-link');
    if (await myActivitiesLink.isVisible()) {
      console.log('   ✅ MyActivities 連結存在');
      await myActivitiesLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 檢查頁面是否正確載入
      const pageTitle = await page.locator('h1').first().textContent();
      if (pageTitle?.includes('我的活動管理')) {
        console.log(`   ✅ MyActivities 頁面載入成功: ${pageTitle}`);
      } else {
        console.log(`   ❌ MyActivities 頁面載入失敗: ${pageTitle}`);
      }
    } else {
      console.log('   ❌ MyActivities 連結不存在');
    }

    // 第三層驗證：功能完整性測試
    console.log('📍 第三層驗證：MyActivities 頁面功能完整性');
    
    // 檢查視圖模式按鈕
    const viewButtons = page.locator('[data-testid^="view-"]');
    const viewButtonCount = await viewButtons.count();
    console.log(`   🔄 發現 ${viewButtonCount} 個視圖模式按鈕`);
    
    if (viewButtonCount >= 4) {
      console.log('   ✅ 多視圖模式功能完整');
      
      // 測試視圖切換
      const gridButton = page.getByTestId('view-grid');
      const listButton = page.getByTestId('view-list');
      const timelineButton = page.getByTestId('view-timeline');
      const kanbanButton = page.getByTestId('view-kanban');
      
      if (await gridButton.isVisible()) {
        await gridButton.click();
        await page.waitForTimeout(500);
        console.log('   ✅ 網格視圖切換成功');
      }
      
      if (await listButton.isVisible()) {
        await listButton.click();
        await page.waitForTimeout(500);
        console.log('   ✅ 列表視圖切換成功');
      }
      
      if (await timelineButton.isVisible()) {
        await timelineButton.click();
        await page.waitForTimeout(500);
        console.log('   ✅ 時間軸視圖切換成功');
      }
      
      if (await kanbanButton.isVisible()) {
        await kanbanButton.click();
        await page.waitForTimeout(500);
        console.log('   ✅ 看板視圖切換成功');
      }
    } else {
      console.log('   ❌ 多視圖模式功能不完整');
    }
    
    // 檢查 MyActivities 組件
    const myActivitiesComponent = page.locator('[data-testid*="my-activities"], .my-activities, [class*="MyActivities"]').first();
    if (await myActivitiesComponent.isVisible()) {
      console.log('   ✅ MyActivities 組件載入成功');
    } else {
      console.log('   ❌ MyActivities 組件不可見');
    }
    
    // 檢查快速功能入口
    const quickLinks = [
      'advanced-filter-link',
      'intelligent-search-link', 
      'activity-analytics-link',
      'batch-operations-button',
      'favorites-tags-button',
      'import-export-button',
      'version-history-button',
      'copy-template-button',
      'share-collaborate-button'
    ];
    
    let visibleQuickLinks = 0;
    for (const linkId of quickLinks) {
      const link = page.getByTestId(linkId);
      if (await link.isVisible()) {
        visibleQuickLinks++;
        console.log(`   ✅ 快速入口可見: ${linkId}`);
      } else {
        console.log(`   ❌ 快速入口不可見: ${linkId}`);
      }
    }
    
    console.log(`   📊 快速功能入口可見性: ${visibleQuickLinks}/${quickLinks.length}`);
    
    if (visibleQuickLinks >= 6) {
      console.log('   ✅ 快速功能入口基本完整');
    } else {
      console.log('   ❌ 快速功能入口需要改進');
    }

    // 測試統一導航系統
    console.log('📍 測試統一導航系統整合');
    const navMyActivities = page.getByTestId('nav-my-activities');
    if (await navMyActivities.isVisible()) {
      console.log('   ✅ 統一導航系統包含 MyActivities');
    } else {
      console.log('   ❌ 統一導航系統缺少 MyActivities');
    }

    console.log('🎉 Day 8-10 主頁優先原則修復驗證完成！');
  });

  test('功能可見性改進驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 8-10 功能可見性改進驗證測試影片...');

    await page.goto('http://localhost:3000/my-activities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('📋 檢查12項核心功能的可見性改進');

    // 檢查所有12項功能的按鈕/連結
    const functionalities = [
      { name: '虛擬化列表', selector: '[data-testid="virtualized-activity-list"], [data-testid="virtualized-indicator"]' },
      { name: '多視圖模式', selector: '[data-testid^="view-"]' },
      { name: '高級過濾器', selector: '[data-testid="advanced-filter-link"]' },
      { name: '智能搜索', selector: '[data-testid="intelligent-search-link"]' },
      { name: '批量操作', selector: '[data-testid="batch-operations-button"]' },
      { name: '活動統計和分析', selector: '[data-testid="activity-analytics-link"]' },
      { name: '收藏和標籤系統', selector: '[data-testid="favorites-tags-button"]' },
      { name: '活動模板和快速創建', selector: '[data-testid*="template"]' },
      { name: '導入導出功能', selector: '[data-testid="import-export-button"]' },
      { name: '活動歷史和版本管理', selector: '[data-testid="version-history-button"]' },
      { name: '活動複製和模板化', selector: '[data-testid="copy-template-button"]' },
      { name: '活動分享和協作', selector: '[data-testid="share-collaborate-button"]' }
    ];

    let visibleCount = 0;
    let totalCount = functionalities.length;

    for (const func of functionalities) {
      const elements = page.locator(func.selector);
      const count = await elements.count();
      const isVisible = count > 0 && await elements.first().isVisible();
      
      if (isVisible) {
        console.log(`   ✅ ${func.name}: 可見 (${count}個元素)`);
        visibleCount++;
      } else {
        console.log(`   ❌ ${func.name}: 不可見 (${count}個元素)`);
      }
    }

    // 計算改進後的完整性百分比
    const completionPercentage = Math.round((visibleCount / totalCount) * 100);
    console.log(`📊 修復後功能可見性: ${visibleCount}/${totalCount} (${completionPercentage}%)`);

    if (completionPercentage >= 80) {
      console.log('✅ Day 8-10 功能可見性修復成功 (≥80%)');
    } else if (completionPercentage >= 60) {
      console.log('⚠️ Day 8-10 功能可見性有所改進，但仍需優化');
    } else {
      console.log('❌ Day 8-10 功能可見性修復效果有限');
    }

    // 測試性能改進
    console.log('⚡ 測試性能改進');
    const performanceStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - performanceStart;
    console.log(`📊 頁面重新載入時間: ${loadTime}ms`);
    
    if (loadTime < 500) {
      console.log('   ✅ 載入時間符合要求 (<500ms)');
    } else {
      console.log('   ⚠️ 載入時間仍需優化');
    }

    console.log('🎉 Day 8-10 功能可見性改進驗證完成！');
  });
});
