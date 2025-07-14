/**
 * 整合驗證測試
 * 快速驗證四個整合任務的核心功能
 */

import { test, expect } from '@playwright/test';

test.describe('EduCreate 整合驗證測試', () => {
  test('驗證統一導航和四個整合任務', async ({ page }) => {
    console.log('🚀 開始整合驗證測試...');
    
    // 步驟1: 驗證主頁和統一導航
    console.log('📍 步驟1: 驗證主頁和統一導航');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 截取主頁
    await page.screenshot({ path: 'test-results/integration-verify-homepage.png', fullPage: true });
    
    // 檢查統一導航
    const unifiedNav = page.locator('[data-testid="unified-navigation"]');
    const isNavVisible = await unifiedNav.isVisible();
    console.log(`✅ 統一導航可見: ${isNavVisible}`);
    
    // 檢查主頁內容
    const heroTitle = page.locator('[data-testid="hero-title"]');
    const isHeroVisible = await heroTitle.isVisible();
    console.log(`✅ 主頁標題可見: ${isHeroVisible}`);
    
    // 步驟2: 驗證儀表板訪問
    console.log('📍 步驟2: 驗證儀表板訪問');
    const dashboardButton = page.locator('[data-testid="main-dashboard-button"]');
    const isDashboardButtonVisible = await dashboardButton.isVisible();
    console.log(`✅ 儀表板按鈕可見: ${isDashboardButtonVisible}`);
    
    if (isDashboardButtonVisible) {
      await dashboardButton.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 截取儀表板
      await page.screenshot({ path: 'test-results/integration-verify-dashboard.png', fullPage: true });
      
      const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
      const isDashboardTitleVisible = await dashboardTitle.isVisible();
      console.log(`✅ 儀表板標題可見: ${isDashboardTitleVisible}`);
      
      // 檢查功能卡片
      const featureCards = page.locator('[data-testid^="feature-card-"]');
      const featureCount = await featureCards.count();
      console.log(`✅ 功能卡片數量: ${featureCount}`);
      
      // 步驟3: 驗證自動保存系統
      console.log('📍 步驟3: 驗證自動保存系統');
      const autoSaveLink = page.locator('[data-testid="feature-link-auto-save"]');
      const isAutoSaveLinkVisible = await autoSaveLink.isVisible();
      console.log(`✅ 自動保存連結可見: ${isAutoSaveLinkVisible}`);
      
      if (isAutoSaveLinkVisible) {
        await autoSaveLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        
        // 截取自動保存頁面
        await page.screenshot({ path: 'test-results/integration-verify-autosave.png', fullPage: true });
        
        const autosaveTitle = page.locator('[data-testid="autosave-title"]');
        const isAutosaveTitleVisible = await autosaveTitle.isVisible();
        console.log(`✅ 自動保存標題可見: ${isAutosaveTitleVisible}`);
        
        // 返回儀表板
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }
      
      // 步驟4: 驗證內容編輯器
      console.log('📍 步驟4: 驗證內容編輯器');
      const editorLink = page.locator('[data-testid="feature-link-content-editor"]');
      const isEditorLinkVisible = await editorLink.isVisible();
      console.log(`✅ 內容編輯器連結可見: ${isEditorLinkVisible}`);
      
      if (isEditorLinkVisible) {
        await editorLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        
        // 截取內容編輯器頁面
        await page.screenshot({ path: 'test-results/integration-verify-editor.png', fullPage: true });
        
        const documentSidebar = page.locator('[data-testid="document-sidebar"]');
        const isSidebarVisible = await documentSidebar.isVisible();
        console.log(`✅ 文檔側邊欄可見: ${isSidebarVisible}`);
        
        // 返回儀表板
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }
      
      // 步驟5: 驗證檔案管理器
      console.log('📍 步驟5: 驗證檔案管理器');
      const fileManagerLink = page.locator('[data-testid="feature-link-file-manager"]');
      const isFileManagerLinkVisible = await fileManagerLink.isVisible();
      console.log(`✅ 檔案管理器連結可見: ${isFileManagerLinkVisible}`);
      
      if (isFileManagerLinkVisible) {
        await fileManagerLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        
        // 截取檔案管理器頁面
        await page.screenshot({ path: 'test-results/integration-verify-files.png', fullPage: true });
        
        const fileManagerTitle = page.locator('[data-testid="file-manager-title"]');
        const isFileManagerTitleVisible = await fileManagerTitle.isVisible();
        console.log(`✅ 檔案管理器標題可見: ${isFileManagerTitleVisible}`);
      }
    }
    
    // 生成整合報告
    const integrationReport = {
      unifiedNavigation: isNavVisible,
      homepage: isHeroVisible,
      dashboard: isDashboardButtonVisible && await page.locator('[data-testid="dashboard-title"]').isVisible().catch(() => false),
      autosave: isAutoSaveLinkVisible,
      editor: isEditorLinkVisible,
      fileManager: isFileManagerLinkVisible,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 整合驗證報告:', JSON.stringify(integrationReport, null, 2));
    
    // 驗證核心整合
    expect(integrationReport.unifiedNavigation).toBe(true);
    expect(integrationReport.homepage).toBe(true);
    expect(integrationReport.dashboard).toBe(true);
    
    console.log('🎉 整合驗證測試完成！');
  });
});
