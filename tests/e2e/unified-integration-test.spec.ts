/**
 * 統一整合測試
 * 驗證四個整合任務的完整用戶旅程
 * 1. 統一導航系統
 * 2. 主儀表板
 * 3. 自動保存系統
 * 4. 內容編輯入口
 */

import { test, expect } from '@playwright/test';

test.describe('EduCreate 統一整合測試', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });

  test('任務1: 統一導航系統完整測試', async ({ page }) => {
    console.log('🚀 開始統一導航系統測試...');
    
    // 步驟1: 訪問主頁，檢查統一導航
    console.log('📍 步驟1: 檢查主頁統一導航');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/unified-nav-step1-homepage.png', fullPage: true });
    
    // 驗證統一導航組件存在
    const unifiedNav = page.locator('[data-testid="unified-navigation"]');
    await expect(unifiedNav).toBeVisible();
    console.log('✅ 統一導航組件已載入');
    
    // 檢查導航項目
    const navItems = [
      'nav-home',
      'nav-dashboard', 
      'nav-smart-sorting',
      'nav-folder-analytics'
    ];
    
    for (const navItem of navItems) {
      const navElement = page.locator(`[data-testid="${navItem}"]`);
      await expect(navElement).toBeVisible();
      console.log(`✅ 導航項目 ${navItem} 可見`);
    }
    
    // 步驟2: 測試導航功能
    console.log('📍 步驟2: 測試導航功能');
    const dashboardNav = page.locator('[data-testid="nav-dashboard"]');
    await dashboardNav.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 驗證跳轉到儀表板
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    await expect(dashboardTitle).toBeVisible();
    console.log('✅ 導航跳轉功能正常');
    
    await page.screenshot({ path: 'test-results/unified-nav-step2-navigation.png', fullPage: true });
    
    console.log('🎉 統一導航系統測試完成！');
  });

  test('任務2: 主儀表板展示所有功能測試', async ({ page }) => {
    console.log('🚀 開始主儀表板功能展示測試...');
    
    // 步驟1: 訪問儀表板
    console.log('📍 步驟1: 訪問主儀表板');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/dashboard-step1-main.png', fullPage: true });
    
    // 驗證儀表板標題
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    await expect(dashboardTitle).toBeVisible();
    await expect(dashboardTitle).toContainText('EduCreate 功能儀表板');
    console.log('✅ 儀表板標題正確');
    
    // 步驟2: 檢查功能統計
    console.log('📍 步驟2: 檢查功能統計');
    const statsCards = [
      'stats-total',
      'stats-available', 
      'stats-development',
      'stats-coming-soon'
    ];
    
    for (const statCard of statsCards) {
      const cardElement = page.locator(`[data-testid="${statCard}"]`);
      await expect(cardElement).toBeVisible();
      console.log(`✅ 統計卡片 ${statCard} 可見`);
    }
    
    // 步驟3: 檢查功能卡片
    console.log('📍 步驟3: 檢查所有功能卡片');
    const featureCards = [
      'feature-card-smart-sorting',
      'feature-card-folder-analytics',
      'feature-card-content-editor',
      'feature-card-auto-save',
      'feature-card-file-manager'
    ];
    
    for (const featureCard of featureCards) {
      const cardElement = page.locator(`[data-testid="${featureCard}"]`);
      await expect(cardElement).toBeVisible();
      console.log(`✅ 功能卡片 ${featureCard} 可見`);
    }
    
    // 步驟4: 測試功能訪問
    console.log('📍 步驟4: 測試功能訪問');
    const smartSortingLink = page.locator('[data-testid="feature-link-smart-sorting"]');
    await expect(smartSortingLink).toBeVisible();
    await smartSortingLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 驗證跳轉成功
    const sortingTitle = await page.locator('h1').first().textContent();
    expect(sortingTitle).toContain('智能排序');
    console.log('✅ 儀表板功能訪問正常');
    
    await page.screenshot({ path: 'test-results/dashboard-step4-access.png', fullPage: true });
    
    console.log('🎉 主儀表板功能展示測試完成！');
  });

  test('任務3: 自動保存系統整合測試', async ({ page }) => {
    console.log('🚀 開始自動保存系統整合測試...');
    
    // 步驟1: 從主頁訪問自動保存系統
    console.log('📍 步驟1: 從主頁訪問自動保存系統');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // 通過導航訪問儀表板
    const dashboardNav = page.locator('[data-testid="nav-dashboard"]');
    await dashboardNav.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 從儀表板訪問自動保存
    const autoSaveCard = page.locator('[data-testid="feature-card-auto-save"]');
    await expect(autoSaveCard).toBeVisible();
    
    const autoSaveLink = page.locator('[data-testid="feature-link-auto-save"]');
    await expect(autoSaveLink).toBeVisible();
    await autoSaveLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/autosave-step1-access.png', fullPage: true });
    
    // 步驟2: 驗證自動保存頁面
    console.log('📍 步驟2: 驗證自動保存頁面功能');
    const autosaveTitle = page.locator('[data-testid="autosave-title"]');
    await expect(autosaveTitle).toBeVisible();
    await expect(autosaveTitle).toContainText('自動保存系統');
    console.log('✅ 自動保存頁面標題正確');
    
    // 檢查自動保存設定
    const autosaveToggle = page.locator('[data-testid="autosave-toggle"]');
    const saveIntervalSelect = page.locator('[data-testid="save-interval-select"]');
    const totalSaves = page.locator('[data-testid="total-saves"]');
    
    await expect(autosaveToggle).toBeVisible();
    await expect(saveIntervalSelect).toBeVisible();
    await expect(totalSaves).toBeVisible();
    console.log('✅ 自動保存設定元素正常');
    
    // 檢查保存會話
    const sessionsTitle = page.locator('[data-testid="sessions-title"]');
    await expect(sessionsTitle).toBeVisible();
    
    const sessionItems = page.locator('[data-testid^="session-"]');
    const sessionCount = await sessionItems.count();
    expect(sessionCount).toBeGreaterThan(0);
    console.log(`✅ 找到 ${sessionCount} 個自動保存會話`);
    
    await page.screenshot({ path: 'test-results/autosave-step2-features.png', fullPage: true });
    
    console.log('🎉 自動保存系統整合測試完成！');
  });

  test('任務4: 內容編輯入口整合測試', async ({ page }) => {
    console.log('🚀 開始內容編輯入口整合測試...');
    
    // 步驟1: 從主頁訪問內容編輯器
    console.log('📍 步驟1: 從主頁訪問內容編輯器');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 從儀表板訪問內容編輯器
    const contentEditorCard = page.locator('[data-testid="feature-card-content-editor"]');
    await expect(contentEditorCard).toBeVisible();
    
    const contentEditorLink = page.locator('[data-testid="feature-link-content-editor"]');
    await expect(contentEditorLink).toBeVisible();
    await contentEditorLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/editor-step1-access.png', fullPage: true });
    
    // 步驟2: 驗證內容編輯器頁面
    console.log('📍 步驟2: 驗證內容編輯器功能');
    
    // 檢查文檔側邊欄
    const documentSidebar = page.locator('[data-testid="document-sidebar"]');
    await expect(documentSidebar).toBeVisible();
    console.log('✅ 文檔側邊欄可見');
    
    // 檢查創建文檔按鈕
    const createDocButton = page.locator('[data-testid="create-document-button"]');
    await expect(createDocButton).toBeVisible();
    console.log('✅ 創建文檔按鈕可見');
    
    // 檢查空狀態
    const emptyStateTitle = page.locator('[data-testid="empty-state-title"]');
    await expect(emptyStateTitle).toBeVisible();
    console.log('✅ 空狀態顯示正常');
    
    // 步驟3: 測試文檔創建功能
    console.log('📍 步驟3: 測試文檔創建功能');
    await createDocButton.click();
    await page.waitForTimeout(1000);
    
    // 檢查編輯器是否出現
    const contentEditor = page.locator('[data-testid="content-editor"]');
    await expect(contentEditor).toBeVisible();
    console.log('✅ 內容編輯器正常載入');
    
    // 測試輸入功能
    await contentEditor.fill('這是測試內容');
    await page.waitForTimeout(1000);
    
    const inputValue = await contentEditor.inputValue();
    expect(inputValue).toContain('這是測試內容');
    console.log('✅ 內容輸入功能正常');
    
    await page.screenshot({ path: 'test-results/editor-step3-editing.png', fullPage: true });
    
    console.log('🎉 內容編輯入口整合測試完成！');
  });

  test('檔案管理器整合測試', async ({ page }) => {
    console.log('🚀 開始檔案管理器整合測試...');
    
    // 步驟1: 從儀表板訪問檔案管理器
    console.log('📍 步驟1: 從儀表板訪問檔案管理器');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const fileManagerCard = page.locator('[data-testid="feature-card-file-manager"]');
    await expect(fileManagerCard).toBeVisible();
    
    const fileManagerLink = page.locator('[data-testid="feature-link-file-manager"]');
    await expect(fileManagerLink).toBeVisible();
    await fileManagerLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/files-step1-access.png', fullPage: true });
    
    // 步驟2: 驗證檔案管理器功能
    console.log('📍 步驟2: 驗證檔案管理器功能');
    
    const fileManagerTitle = page.locator('[data-testid="file-manager-title"]');
    await expect(fileManagerTitle).toBeVisible();
    await expect(fileManagerTitle).toContainText('檔案管理器');
    console.log('✅ 檔案管理器標題正確');
    
    // 檢查工具欄
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    const sortSelect = page.locator('[data-testid="sort-select"]');
    const listViewButton = page.locator('[data-testid="list-view-button"]');
    
    await expect(breadcrumb).toBeVisible();
    await expect(sortSelect).toBeVisible();
    await expect(listViewButton).toBeVisible();
    console.log('✅ 檔案管理器工具欄正常');
    
    // 檢查檔案項目
    const fileItems = page.locator('[data-testid^="file-item-"]');
    const fileCount = await fileItems.count();
    expect(fileCount).toBeGreaterThan(0);
    console.log(`✅ 找到 ${fileCount} 個檔案項目`);
    
    await page.screenshot({ path: 'test-results/files-step2-features.png', fullPage: true });
    
    console.log('🎉 檔案管理器整合測試完成！');
  });

  test('完整用戶旅程整合測試', async ({ page }) => {
    console.log('🚀 開始完整用戶旅程整合測試...');
    
    const journeyReport = {
      homepage: { accessible: false, navigation: false },
      dashboard: { accessible: false, features: 0 },
      autosave: { accessible: false, functional: false },
      editor: { accessible: false, functional: false },
      fileManager: { accessible: false, functional: false }
    };
    
    // 步驟1: 主頁測試
    console.log('📍 步驟1: 主頁完整測試');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const heroTitle = page.locator('[data-testid="hero-title"]');
    if (await heroTitle.isVisible()) {
      journeyReport.homepage.accessible = true;
      console.log('✅ 主頁可訪問');
    }
    
    const unifiedNav = page.locator('[data-testid="unified-navigation"]');
    if (await unifiedNav.isVisible()) {
      journeyReport.homepage.navigation = true;
      console.log('✅ 統一導航可用');
    }
    
    // 步驟2: 儀表板測試
    console.log('📍 步驟2: 儀表板完整測試');
    const dashboardButton = page.locator('[data-testid="main-dashboard-button"]');
    await dashboardButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    if (await dashboardTitle.isVisible()) {
      journeyReport.dashboard.accessible = true;
      console.log('✅ 儀表板可訪問');
    }
    
    const featureCards = page.locator('[data-testid^="feature-card-"]');
    journeyReport.dashboard.features = await featureCards.count();
    console.log(`✅ 儀表板顯示 ${journeyReport.dashboard.features} 個功能`);
    
    // 步驟3-5: 測試各個功能
    const features = [
      { name: 'autosave', link: 'feature-link-auto-save', title: 'autosave-title' },
      { name: 'editor', link: 'feature-link-content-editor', title: 'empty-state-title' },
      { name: 'fileManager', link: 'feature-link-file-manager', title: 'file-manager-title' }
    ];
    
    for (const feature of features) {
      console.log(`📍 測試 ${feature.name} 功能`);
      
      // 返回儀表板
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      // 點擊功能連結
      const featureLink = page.locator(`[data-testid="${feature.link}"]`);
      if (await featureLink.isVisible()) {
        await featureLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        
        // 檢查功能頁面
        const featureTitle = page.locator(`[data-testid="${feature.title}"]`);
        if (await featureTitle.isVisible()) {
          (journeyReport as any)[feature.name].accessible = true;
          (journeyReport as any)[feature.name].functional = true;
          console.log(`✅ ${feature.name} 功能正常`);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/complete-journey-final.png', fullPage: true });
    
    console.log('📊 完整用戶旅程報告:', JSON.stringify(journeyReport, null, 2));
    
    // 驗證整合成功
    expect(journeyReport.homepage.accessible).toBe(true);
    expect(journeyReport.homepage.navigation).toBe(true);
    expect(journeyReport.dashboard.accessible).toBe(true);
    expect(journeyReport.dashboard.features).toBeGreaterThan(4);
    expect(journeyReport.autosave.accessible).toBe(true);
    expect(journeyReport.editor.accessible).toBe(true);
    expect(journeyReport.fileManager.accessible).toBe(true);
    
    console.log('🎉 完整用戶旅程整合測試成功！');
  });
});
