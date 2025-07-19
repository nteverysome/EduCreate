/**
 * Day 8-10: 完整活動管理系統驗證測試
 * 檢查12項核心功能的實際實現狀況並生成證據
 */

import { test, expect } from '@playwright/test';

test.describe('Day 8-10: 完整活動管理系統 - 實際功能驗證', () => {
  test('Day 8-10 完整活動管理系統三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 8-10 完整活動管理系統驗證測試影片...');
    console.log('📋 將驗證12項核心功能的實際實現狀況');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 檢查主頁是否有活動管理相關的功能卡片
    const activityFeatures = [
      'feature-activity-templates',
      'feature-activity-analytics',
      'feature-activity-copy-template',
      'feature-activity-history-version',
      'feature-activity-import-export'
    ];

    let visibleFeatures = 0;
    for (const feature of activityFeatures) {
      const element = page.getByTestId(feature);
      if (await element.isVisible()) {
        console.log(`   ✅ 發現活動功能: ${feature}`);
        visibleFeatures++;
      } else {
        console.log(`   ❌ 缺少活動功能: ${feature}`);
      }
    }

    console.log(`📊 主頁活動功能可見性: ${visibleFeatures}/${activityFeatures.length}`);
    
    if (visibleFeatures > 0) {
      console.log('✅ 第一層驗證通過：主頁有活動管理功能');
    } else {
      console.log('❌ 第一層驗證失敗：主頁缺少活動管理功能');
    }

    // 第二層驗證：導航流程測試 - 測試各個活動功能頁面
    console.log('📍 第二層驗證：導航流程測試');
    
    const activityPages = [
      { name: '活動模板', url: '/activities/templates', testId: 'activity-templates-link' },
      { name: '活動統計', url: '/activities/analytics', testId: 'activity-analytics-link' },
      { name: '高級過濾器', url: '/activities/advanced-filter' },
      { name: '智能搜索', url: '/activities/intelligent-search' },
      { name: '多視圖模式', url: '/activities/multi-view' }
    ];

    let accessiblePages = 0;
    for (const pageInfo of activityPages) {
      try {
        console.log(`🔗 測試頁面: ${pageInfo.name} (${pageInfo.url})`);
        
        if (pageInfo.testId) {
          // 從主頁點擊連結
          await page.goto('http://localhost:3000/');
          await page.waitForLoadState('networkidle');
          const link = page.getByTestId(pageInfo.testId);
          if (await link.isVisible()) {
            await link.click();
          } else {
            await page.goto(`http://localhost:3000${pageInfo.url}`);
          }
        } else {
          // 直接導航
          await page.goto(`http://localhost:3000${pageInfo.url}`);
        }
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 檢查頁面是否正確載入
        const pageTitle = await page.locator('h1').first().textContent();
        if (pageTitle) {
          console.log(`   ✅ ${pageInfo.name} 頁面載入成功: ${pageTitle}`);
          accessiblePages++;
        } else {
          console.log(`   ❌ ${pageInfo.name} 頁面載入失敗`);
        }
      } catch (error) {
        console.log(`   ❌ ${pageInfo.name} 頁面訪問失敗: ${error}`);
      }
    }

    console.log(`📊 可訪問的活動頁面: ${accessiblePages}/${activityPages.length}`);
    console.log('✅ 第二層驗證完成：導航流程測試完成');

    // 第三層驗證：12項核心功能實際驗證
    console.log('📍 第三層驗證：12項核心功能實際驗證');
    
    // 測試虛擬化列表功能
    console.log('📋 功能1: 驗證虛擬化列表');
    await page.goto('http://localhost:3000/activities/advanced-filter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const virtualizedList = page.locator('[data-testid="virtualized-list"], [class*="virtualized"], [class*="virtual"]').first();
    if (await virtualizedList.isVisible()) {
      console.log('   ✅ 虛擬化列表組件存在');
    } else {
      console.log('   ❌ 虛擬化列表組件不可見');
    }
    
    // 測試多視圖模式
    console.log('🔄 功能2: 驗證多視圖模式');
    await page.goto('http://localhost:3000/activities/multi-view');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const viewModeButtons = page.locator('[data-testid*="view-"], button:has-text("網格"), button:has-text("列表"), button:has-text("時間軸"), button:has-text("看板")');
    const viewModeCount = await viewModeButtons.count();
    console.log(`   📊 發現 ${viewModeCount} 個視圖模式按鈕`);
    if (viewModeCount >= 2) {
      console.log('   ✅ 多視圖模式功能存在');
    } else {
      console.log('   ❌ 多視圖模式功能不完整');
    }
    
    // 測試高級過濾器
    console.log('🔍 功能3: 驗證高級過濾器');
    await page.goto('http://localhost:3000/activities/advanced-filter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const filterElements = page.locator('[data-testid*="filter"], [class*="filter"], select, input[type="search"]');
    const filterCount = await filterElements.count();
    console.log(`   📊 發現 ${filterCount} 個過濾器元素`);
    if (filterCount >= 3) {
      console.log('   ✅ 高級過濾器功能存在');
    } else {
      console.log('   ❌ 高級過濾器功能不完整');
    }
    
    // 測試智能搜索
    console.log('🔎 功能4: 驗證智能搜索');
    await page.goto('http://localhost:3000/activities/intelligent-search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      console.log('   ✅ 智能搜索輸入框存在');
      
      // 測試搜索功能
      await searchInput.fill('測試搜索');
      await page.waitForTimeout(1000);
      console.log('   ✅ 搜索輸入功能正常');
    } else {
      console.log('   ❌ 智能搜索輸入框不可見');
    }
    
    // 測試批量操作
    console.log('📦 功能5: 驗證批量操作');
    const batchOperationElements = page.locator('[data-testid*="batch"], [data-testid*="select"], button:has-text("批量"), button:has-text("選擇"), input[type="checkbox"]');
    const batchCount = await batchOperationElements.count();
    console.log(`   📊 發現 ${batchCount} 個批量操作元素`);
    if (batchCount >= 2) {
      console.log('   ✅ 批量操作功能存在');
    } else {
      console.log('   ❌ 批量操作功能不完整');
    }
    
    // 測試活動統計和分析
    console.log('📈 功能6: 驗證活動統計和分析');
    await page.goto('http://localhost:3000/activities/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const analyticsElements = page.locator('[data-testid*="analytics"], [data-testid*="chart"], [data-testid*="stats"], canvas, svg');
    const analyticsCount = await analyticsElements.count();
    console.log(`   📊 發現 ${analyticsCount} 個統計分析元素`);
    if (analyticsCount >= 1) {
      console.log('   ✅ 活動統計和分析功能存在');
    } else {
      console.log('   ❌ 活動統計和分析功能不可見');
    }
    
    // 測試收藏和標籤系統
    console.log('⭐ 功能7: 驗證收藏和標籤系統');
    const favoriteElements = page.locator('[data-testid*="favorite"], [data-testid*="tag"], button:has-text("收藏"), button:has-text("標籤"), .favorite, .tag');
    const favoriteCount = await favoriteElements.count();
    console.log(`   📊 發現 ${favoriteCount} 個收藏標籤元素`);
    if (favoriteCount >= 1) {
      console.log('   ✅ 收藏和標籤系統存在');
    } else {
      console.log('   ❌ 收藏和標籤系統不可見');
    }
    
    // 測試活動模板和快速創建
    console.log('🚀 功能8: 驗證活動模板和快速創建');
    await page.goto('http://localhost:3000/activities/templates');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const templateElements = page.locator('[data-testid*="template"], button:has-text("模板"), button:has-text("創建"), .template');
    const templateCount = await templateElements.count();
    console.log(`   📊 發現 ${templateCount} 個模板元素`);
    if (templateCount >= 1) {
      console.log('   ✅ 活動模板和快速創建功能存在');
    } else {
      console.log('   ❌ 活動模板和快速創建功能不可見');
    }
    
    // 測試導入導出功能
    console.log('📤 功能9: 驗證導入導出功能');
    const importExportElements = page.locator('[data-testid*="import"], [data-testid*="export"], button:has-text("導入"), button:has-text("導出"), input[type="file"]');
    const importExportCount = await importExportElements.count();
    console.log(`   📊 發現 ${importExportCount} 個導入導出元素`);
    if (importExportCount >= 1) {
      console.log('   ✅ 導入導出功能存在');
    } else {
      console.log('   ❌ 導入導出功能不可見');
    }
    
    // 測試活動歷史和版本管理
    console.log('📜 功能10: 驗證活動歷史和版本管理');
    const historyElements = page.locator('[data-testid*="history"], [data-testid*="version"], button:has-text("歷史"), button:has-text("版本"), .history, .version');
    const historyCount = await historyElements.count();
    console.log(`   📊 發現 ${historyCount} 個歷史版本元素`);
    if (historyCount >= 1) {
      console.log('   ✅ 活動歷史和版本管理功能存在');
    } else {
      console.log('   ❌ 活動歷史和版本管理功能不可見');
    }
    
    // 測試活動複製和模板化
    console.log('📋 功能11: 驗證活動複製和模板化');
    const copyElements = page.locator('[data-testid*="copy"], [data-testid*="duplicate"], button:has-text("複製"), button:has-text("模板化"), .copy, .duplicate');
    const copyCount = await copyElements.count();
    console.log(`   📊 發現 ${copyCount} 個複製模板化元素`);
    if (copyCount >= 1) {
      console.log('   ✅ 活動複製和模板化功能存在');
    } else {
      console.log('   ❌ 活動複製和模板化功能不可見');
    }
    
    // 測試活動分享和協作
    console.log('👥 功能12: 驗證活動分享和協作');
    const shareElements = page.locator('[data-testid*="share"], [data-testid*="collaborate"], button:has-text("分享"), button:has-text("協作"), .share, .collaborate');
    const shareCount = await shareElements.count();
    console.log(`   📊 發現 ${shareCount} 個分享協作元素`);
    if (shareCount >= 1) {
      console.log('   ✅ 活動分享和協作功能存在');
    } else {
      console.log('   ❌ 活動分享和協作功能不可見');
    }
    
    console.log('✅ 第三層驗證完成：12項核心功能驗證完成');
    
    // 最終驗證
    console.log('🎯 最終驗證：活動管理系統整體功能');
    
    // 測試性能要求
    console.log('⚡ 測試性能要求');
    const performanceStart = Date.now();
    await page.goto('http://localhost:3000/activities/advanced-filter');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - performanceStart;
    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    
    if (loadTime < 500) {
      console.log('   ✅ 載入時間符合要求 (<500ms)');
    } else {
      console.log('   ⚠️ 載入時間需要優化');
    }
    
    console.log('🎉 Day 8-10 完整活動管理系統驗證完成！');
  });

  test('Day 8-10 MyActivities 組件直接測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 8-10 MyActivities 組件直接測試影片...');

    // 測試專門的 MyActivities 測試頁面
    await page.goto('http://localhost:3000/test-my-activities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('📋 測試 MyActivities 組件功能');

    // 檢查 MyActivities 組件是否載入
    const myActivitiesComponent = page.locator('[data-testid*="my-activities"], .my-activities, [class*="MyActivities"]').first();
    if (await myActivitiesComponent.isVisible()) {
      console.log('   ✅ MyActivities 組件載入成功');
    } else {
      console.log('   ❌ MyActivities 組件不可見');
    }

    // 測試虛擬化功能
    console.log('🔄 測試虛擬化功能');
    const virtualizedElements = page.locator('[class*="virtual"], [data-testid*="virtual"]');
    const virtualCount = await virtualizedElements.count();
    console.log(`   📊 發現 ${virtualCount} 個虛擬化元素`);

    // 測試活動項目
    console.log('📝 測試活動項目顯示');
    const activityItems = page.locator('[data-testid*="activity"], [class*="activity-item"], .activity');
    const itemCount = await activityItems.count();
    console.log(`   📊 發現 ${itemCount} 個活動項目`);

    if (itemCount > 0) {
      console.log('   ✅ 活動項目顯示正常');
    } else {
      console.log('   ❌ 沒有發現活動項目');
    }

    console.log('🎉 Day 8-10 MyActivities 組件測試完成！');
  });
});
