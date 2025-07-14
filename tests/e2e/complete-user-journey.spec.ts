/**
 * 完整用戶旅程測試
 * 驗證從主頁開始的完整功能發現和使用流程
 * 確保所有功能都正確整合到主要用戶界面
 */

import { test, expect } from '@playwright/test';

test.describe('完整用戶旅程測試', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });

  test('主頁到智能排序的完整用戶旅程', async ({ page }) => {
    console.log('🚀 開始主頁到智能排序的完整用戶旅程測試...');
    
    // 步驟1: 訪問主頁
    console.log('📍 步驟1: 訪問主頁');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/journey-step1-homepage.png', fullPage: true });
    
    // 驗證主頁載入
    const heroTitle = await page.locator('[data-testid="hero-title"]').textContent();
    console.log(`✅ 主頁標題: ${heroTitle}`);
    expect(heroTitle).toContain('EduCreate');
    
    // 步驟2: 在主頁找到智能排序功能
    console.log('📍 步驟2: 在主頁尋找智能排序功能入口');
    const smartSortingFeature = page.locator('[data-testid="feature-smart-sorting"]');
    await expect(smartSortingFeature).toBeVisible();
    
    const smartSortingLink = page.locator('[data-testid="smart-sorting-link"]');
    await expect(smartSortingLink).toBeVisible();
    console.log('✅ 在主頁找到智能排序功能入口');
    
    // 步驟3: 點擊進入智能排序
    console.log('📍 步驟3: 點擊進入智能排序功能');
    await smartSortingLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/journey-step3-smart-sorting.png', fullPage: true });
    
    // 驗證智能排序頁面載入
    const sortingTitle = await page.locator('h1').first().textContent();
    console.log(`✅ 智能排序頁面標題: ${sortingTitle}`);
    expect(sortingTitle).toContain('智能排序');
    
    // 步驟4: 使用智能排序功能
    console.log('📍 步驟4: 測試智能排序功能互動');
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await expect(sortingTrigger).toBeVisible();
    await sortingTrigger.click();
    await page.waitForTimeout(1000);
    
    const sortingPanel = page.locator('[data-testid="smart-sorting-panel"]');
    await expect(sortingPanel).toBeVisible();
    console.log('✅ 智能排序功能正常互動');
    
    await page.screenshot({ path: 'test-results/journey-step4-sorting-interaction.png', fullPage: true });
    
    console.log('🎉 主頁到智能排序的完整用戶旅程測試成功！');
  });

  test('主頁到檔案夾統計的完整用戶旅程', async ({ page }) => {
    console.log('🚀 開始主頁到檔案夾統計的完整用戶旅程測試...');
    
    // 步驟1: 訪問主頁
    console.log('📍 步驟1: 訪問主頁');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/journey-analytics-step1-homepage.png', fullPage: true });
    
    // 步驟2: 在主頁找到檔案夾統計功能
    console.log('📍 步驟2: 在主頁尋找檔案夾統計功能入口');
    const folderAnalyticsFeature = page.locator('[data-testid="feature-folder-analytics"]');
    await expect(folderAnalyticsFeature).toBeVisible();
    
    const folderAnalyticsLink = page.locator('[data-testid="folder-analytics-link"]');
    await expect(folderAnalyticsLink).toBeVisible();
    console.log('✅ 在主頁找到檔案夾統計功能入口');
    
    // 步驟3: 點擊進入檔案夾統計
    console.log('📍 步驟3: 點擊進入檔案夾統計功能');
    await folderAnalyticsLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/journey-analytics-step3-page.png', fullPage: true });
    
    // 驗證檔案夾統計頁面載入
    const analyticsTitle = await page.locator('h1').first().textContent();
    console.log(`✅ 檔案夾統計頁面標題: ${analyticsTitle}`);
    expect(analyticsTitle).toContain('檔案夾統計分析');
    
    // 步驟4: 使用檔案夾統計功能
    console.log('📍 步驟4: 測試檔案夾統計功能互動');
    const analyticsPanel = page.locator('[data-testid="folder-analytics-panel"]');
    await expect(analyticsPanel).toBeVisible();
    
    // 測試檔案夾切換
    const folder2Button = page.locator('[data-testid="folder-2-button"]');
    await folder2Button.click();
    await page.waitForTimeout(2000);
    console.log('✅ 檔案夾統計功能正常互動');
    
    await page.screenshot({ path: 'test-results/journey-analytics-step4-interaction.png', fullPage: true });
    
    console.log('🎉 主頁到檔案夾統計的完整用戶旅程測試成功！');
  });

  test('主頁到功能儀表板的完整用戶旅程', async ({ page }) => {
    console.log('🚀 開始主頁到功能儀表板的完整用戶旅程測試...');
    
    // 步驟1: 訪問主頁
    console.log('📍 步驟1: 訪問主頁');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/journey-dashboard-step1-homepage.png', fullPage: true });
    
    // 步驟2: 在主頁找到儀表板入口
    console.log('📍 步驟2: 在主頁尋找功能儀表板入口');
    const dashboardButton = page.locator('[data-testid="main-dashboard-button"]');
    await expect(dashboardButton).toBeVisible();
    console.log('✅ 在主頁找到功能儀表板入口');
    
    // 步驟3: 點擊進入功能儀表板
    console.log('📍 步驟3: 點擊進入功能儀表板');
    await dashboardButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/journey-dashboard-step3-page.png', fullPage: true });
    
    // 驗證儀表板頁面載入
    const dashboardTitle = await page.locator('[data-testid="dashboard-title"]').textContent();
    console.log(`✅ 功能儀表板標題: ${dashboardTitle}`);
    expect(dashboardTitle).toContain('EduCreate 功能儀表板');
    
    // 步驟4: 驗證儀表板功能
    console.log('📍 步驟4: 驗證儀表板功能展示');
    
    // 檢查統計數據
    const statsTotal = page.locator('[data-testid="stats-total"]');
    const statsAvailable = page.locator('[data-testid="stats-available"]');
    await expect(statsTotal).toBeVisible();
    await expect(statsAvailable).toBeVisible();
    
    // 檢查功能卡片
    const smartSortingCard = page.locator('[data-testid="feature-card-smart-sorting"]');
    const folderAnalyticsCard = page.locator('[data-testid="feature-card-folder-analytics"]');
    await expect(smartSortingCard).toBeVisible();
    await expect(folderAnalyticsCard).toBeVisible();
    
    console.log('✅ 功能儀表板正常顯示所有功能');
    
    // 步驟5: 從儀表板訪問具體功能
    console.log('📍 步驟5: 從儀表板訪問智能排序功能');
    const smartSortingLink = page.locator('[data-testid="feature-link-smart-sorting"]');
    await expect(smartSortingLink).toBeVisible();
    await smartSortingLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 驗證成功跳轉到智能排序
    const sortingPageTitle = await page.locator('h1').first().textContent();
    console.log(`✅ 從儀表板成功跳轉到智能排序: ${sortingPageTitle}`);
    expect(sortingPageTitle).toContain('智能排序');
    
    await page.screenshot({ path: 'test-results/journey-dashboard-step5-navigation.png', fullPage: true });
    
    console.log('🎉 主頁到功能儀表板的完整用戶旅程測試成功！');
  });

  test('快速訪問功能測試', async ({ page }) => {
    console.log('🚀 開始快速訪問功能測試...');
    
    // 步驟1: 訪問主頁
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/quick-access-step1-homepage.png', fullPage: true });
    
    // 步驟2: 測試快速訪問按鈕
    console.log('📍 步驟2: 測試快速訪問按鈕');
    const quickDashboard = page.locator('[data-testid="quick-dashboard"]');
    const quickSmartSorting = page.locator('[data-testid="quick-smart-sorting"]');
    const quickFolderAnalytics = page.locator('[data-testid="quick-folder-analytics"]');
    
    await expect(quickDashboard).toBeVisible();
    await expect(quickSmartSorting).toBeVisible();
    await expect(quickFolderAnalytics).toBeVisible();
    
    console.log('✅ 所有快速訪問按鈕都可見');
    
    // 測試快速訪問智能排序
    await quickSmartSorting.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const sortingTitle = await page.locator('h1').first().textContent();
    console.log(`✅ 快速訪問智能排序成功: ${sortingTitle}`);
    expect(sortingTitle).toContain('智能排序');
    
    await page.screenshot({ path: 'test-results/quick-access-step2-sorting.png', fullPage: true });
    
    console.log('🎉 快速訪問功能測試成功！');
  });

  test('導航一致性測試', async ({ page }) => {
    console.log('🚀 開始導航一致性測試...');
    
    // 測試主頁導航
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const navDashboardLink = page.locator('[data-testid="dashboard-nav-link"]');
    await expect(navDashboardLink).toBeVisible();
    console.log('✅ 主頁導航欄包含儀表板連結');
    
    // 測試儀表板返回主頁
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    const backToHomeLink = page.locator('[data-testid="back-to-home"]');
    await expect(backToHomeLink).toBeVisible();
    console.log('✅ 儀表板包含返回主頁連結');
    
    // 測試返回主頁功能
    await backToHomeLink.click();
    await page.waitForLoadState('domcontentloaded');
    
    const heroTitle = await page.locator('[data-testid="hero-title"]').textContent();
    expect(heroTitle).toContain('EduCreate');
    console.log('✅ 返回主頁功能正常');
    
    await page.screenshot({ path: 'test-results/navigation-consistency.png', fullPage: true });
    
    console.log('🎉 導航一致性測試成功！');
  });

  test('響應式設計用戶旅程測試', async ({ page }) => {
    console.log('🚀 開始響應式設計用戶旅程測試...');
    
    const viewports = [
      { width: 1200, height: 800, name: '桌面' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手機' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 測試 ${viewport.name} 視圖用戶旅程`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      // 檢查主要元素在不同視圖下的可見性
      const heroTitle = page.locator('[data-testid="hero-title"]');
      const mainDashboardButton = page.locator('[data-testid="main-dashboard-button"]');
      
      await expect(heroTitle).toBeVisible();
      await expect(mainDashboardButton).toBeVisible();
      
      // 測試功能訪問
      await mainDashboardButton.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
      await expect(dashboardTitle).toBeVisible();
      
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name.toLowerCase()}-journey.png`, 
        fullPage: true 
      });
      
      console.log(`✅ ${viewport.name} 視圖用戶旅程測試通過`);
    }
    
    console.log('🎉 響應式設計用戶旅程測試成功！');
  });

  test('完整功能發現流程測試', async ({ page }) => {
    console.log('🚀 開始完整功能發現流程測試...');
    
    const discoveryReport = {
      homepage: {
        coreFeatures: 0,
        quickAccess: 0,
        navigation: 0
      },
      dashboard: {
        totalFeatures: 0,
        availableFeatures: 0,
        categories: 0
      },
      accessibility: {
        fromHomepage: [],
        fromDashboard: []
      }
    };
    
    // 步驟1: 分析主頁功能發現
    console.log('📍 步驟1: 分析主頁功能發現能力');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // 統計核心功能展示
    const coreFeatures = await page.locator('[data-testid^="feature-"]').count();
    const quickAccessItems = await page.locator('[data-testid^="quick-"]').count();
    const navigationItems = await page.locator('[data-testid*="nav"], [data-testid*="dashboard"]').count();
    
    discoveryReport.homepage.coreFeatures = coreFeatures;
    discoveryReport.homepage.quickAccess = quickAccessItems;
    discoveryReport.homepage.navigation = navigationItems;
    
    console.log(`✅ 主頁核心功能: ${coreFeatures} 個`);
    console.log(`✅ 主頁快速訪問: ${quickAccessItems} 個`);
    console.log(`✅ 主頁導航項目: ${navigationItems} 個`);
    
    // 步驟2: 分析儀表板功能發現
    console.log('📍 步驟2: 分析儀表板功能發現能力');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    const totalFeatures = await page.locator('[data-testid^="feature-card-"]').count();
    const availableFeatures = await page.locator('[data-testid^="feature-link-"]').count();
    const categories = await page.locator('[data-testid^="category-"]').count();
    
    discoveryReport.dashboard.totalFeatures = totalFeatures;
    discoveryReport.dashboard.availableFeatures = availableFeatures;
    discoveryReport.dashboard.categories = categories;
    
    console.log(`✅ 儀表板總功能: ${totalFeatures} 個`);
    console.log(`✅ 儀表板可用功能: ${availableFeatures} 個`);
    console.log(`✅ 儀表板功能分類: ${categories} 個`);
    
    // 步驟3: 測試功能可訪問性
    console.log('📍 步驟3: 測試功能可訪問性');
    
    // 從主頁測試可訪問的功能
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const homepageLinks = [
      { testId: 'smart-sorting-link', name: '智能排序' },
      { testId: 'folder-analytics-link', name: '檔案夾統計' },
      { testId: 'main-dashboard-button', name: '功能儀表板' }
    ];
    
    for (const link of homepageLinks) {
      try {
        const linkElement = page.locator(`[data-testid="${link.testId}"]`);
        if (await linkElement.isVisible()) {
          discoveryReport.accessibility.fromHomepage.push(link.name);
        }
      } catch (error) {
        console.log(`❌ 主頁連結 ${link.name} 不可訪問`);
      }
    }
    
    // 從儀表板測試可訪問的功能
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    const dashboardLinks = [
      { testId: 'feature-link-smart-sorting', name: '智能排序' },
      { testId: 'feature-link-folder-analytics', name: '檔案夾統計' }
    ];
    
    for (const link of dashboardLinks) {
      try {
        const linkElement = page.locator(`[data-testid="${link.testId}"]`);
        if (await linkElement.isVisible()) {
          discoveryReport.accessibility.fromDashboard.push(link.name);
        }
      } catch (error) {
        console.log(`❌ 儀表板連結 ${link.name} 不可訪問`);
      }
    }
    
    await page.screenshot({ path: 'test-results/feature-discovery-report.png', fullPage: true });
    
    console.log('📊 功能發現流程報告:', JSON.stringify(discoveryReport, null, 2));
    
    // 驗證功能發現的有效性
    expect(discoveryReport.homepage.coreFeatures).toBeGreaterThan(0);
    expect(discoveryReport.dashboard.totalFeatures).toBeGreaterThan(0);
    expect(discoveryReport.accessibility.fromHomepage.length).toBeGreaterThan(0);
    expect(discoveryReport.accessibility.fromDashboard.length).toBeGreaterThan(0);
    
    console.log('🎉 完整功能發現流程測試成功！');
  });
});
