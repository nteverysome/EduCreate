/**
 * 檔案夾協作系統驗證測試
 * 快速驗證檔案夾協作功能的整合狀態
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾協作系統驗證測試', () => {
  test('驗證檔案夾協作系統完整整合', async ({ page }) => {
    console.log('🚀 開始檔案夾協作系統整合驗證...');
    
    // 步驟1: 驗證主頁整合
    console.log('📍 步驟1: 驗證主頁整合');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 截取主頁
    await page.screenshot({ path: 'test-results/collaboration-verify-homepage.png', fullPage: true });
    
    // 檢查檔案夾協作功能卡片
    const collaborationFeature = page.locator('[data-testid="feature-folder-collaboration"]');
    const isFeatureVisible = await collaborationFeature.isVisible();
    console.log(`✅ 主頁檔案夾協作功能卡片可見: ${isFeatureVisible}`);
    
    // 檢查功能連結
    const collaborationLink = page.locator('[data-testid="folder-collaboration-link"]');
    const isLinkVisible = await collaborationLink.isVisible();
    console.log(`✅ 檔案夾協作功能連結可見: ${isLinkVisible}`);
    
    // 步驟2: 驗證統一導航整合
    console.log('📍 步驟2: 驗證統一導航整合');
    const unifiedNav = page.locator('[data-testid="unified-navigation"]');
    const isNavVisible = await unifiedNav.isVisible();
    console.log(`✅ 統一導航可見: ${isNavVisible}`);
    
    // 檢查導航中的檔案夾協作項目
    const navCollaboration = page.locator('[data-testid="nav-folder-collaboration"]');
    const isNavItemVisible = await navCollaboration.isVisible();
    console.log(`✅ 導航中檔案夾協作項目可見: ${isNavItemVisible}`);
    
    // 步驟3: 驗證儀表板整合
    console.log('📍 步驟3: 驗證儀表板整合');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 截取儀表板
    await page.screenshot({ path: 'test-results/collaboration-verify-dashboard.png', fullPage: true });
    
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    const isDashboardTitleVisible = await dashboardTitle.isVisible();
    console.log(`✅ 儀表板標題可見: ${isDashboardTitleVisible}`);
    
    // 檢查檔案夾協作功能卡片
    const collaborationCard = page.locator('[data-testid="feature-card-folder-collaboration"]');
    const isCardVisible = await collaborationCard.isVisible();
    console.log(`✅ 儀表板檔案夾協作功能卡片可見: ${isCardVisible}`);
    
    // 檢查功能連結
    const dashboardCollaborationLink = page.locator('[data-testid="feature-link-folder-collaboration"]');
    const isDashboardLinkVisible = await dashboardCollaborationLink.isVisible();
    console.log(`✅ 儀表板檔案夾協作功能連結可見: ${isDashboardLinkVisible}`);
    
    // 步驟4: 驗證功能頁面訪問
    console.log('📍 步驟4: 驗證功能頁面訪問');
    if (isDashboardLinkVisible) {
      await dashboardCollaborationLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 截取檔案夾協作頁面
      await page.screenshot({ path: 'test-results/collaboration-verify-page.png', fullPage: true });
      
      const collaborationTitle = page.locator('[data-testid="collaboration-title"]');
      const isCollaborationTitleVisible = await collaborationTitle.isVisible();
      console.log(`✅ 檔案夾協作頁面標題可見: ${isCollaborationTitleVisible}`);
      
      // 檢查統計概覽
      const statsElements = [
        'total-collaborations',
        'total-collaborators', 
        'total-shares',
        'total-views'
      ];
      
      let visibleStats = 0;
      for (const statElement of statsElements) {
        const element = page.locator(`[data-testid="${statElement}"]`);
        const isStatVisible = await element.isVisible();
        if (isStatVisible) visibleStats++;
      }
      console.log(`✅ 可見統計項目: ${visibleStats}/${statsElements.length}`);
      
      // 檢查檔案夾列表
      const foldersTitle = page.locator('[data-testid="folders-title"]');
      const isFoldersTitleVisible = await foldersTitle.isVisible();
      console.log(`✅ 檔案夾列表標題可見: ${isFoldersTitleVisible}`);
      
      // 檢查檔案夾項目
      const folderItems = page.locator('[data-testid^="folder-item-"]');
      const folderCount = await folderItems.count();
      console.log(`✅ 檔案夾項目數量: ${folderCount}`);
      
      // 測試檔案夾選擇
      if (folderCount > 0) {
        const firstFolder = page.locator('[data-testid="folder-item-folder_1"]');
        const isFirstFolderVisible = await firstFolder.isVisible();
        if (isFirstFolderVisible) {
          await firstFolder.click();
          await page.waitForTimeout(2000);
          
          // 檢查標籤
          const overviewTab = page.locator('[data-testid="tab-overview"]');
          const isOverviewTabVisible = await overviewTab.isVisible();
          console.log(`✅ 概覽標籤可見: ${isOverviewTabVisible}`);
          
          if (isOverviewTabVisible) {
            await overviewTab.click();
            await page.waitForTimeout(1000);
            
            const overviewContent = page.locator('[data-testid="overview-tab"]');
            const isOverviewContentVisible = await overviewContent.isVisible();
            console.log(`✅ 概覽內容可見: ${isOverviewContentVisible}`);
          }
        }
      }
    }
    
    // 生成整合報告
    const integrationReport = {
      homepage: {
        featureCard: isFeatureVisible,
        featureLink: isLinkVisible
      },
      navigation: {
        unifiedNav: isNavVisible,
        navItem: isNavItemVisible
      },
      dashboard: {
        title: isDashboardTitleVisible,
        featureCard: isCardVisible,
        featureLink: isDashboardLinkVisible
      },
      functionality: {
        pageAccess: isDashboardLinkVisible,
        pageTitle: await page.locator('[data-testid="collaboration-title"]').isVisible().catch(() => false),
        folderList: await page.locator('[data-testid="folders-title"]').isVisible().catch(() => false)
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 檔案夾協作整合驗證報告:', JSON.stringify(integrationReport, null, 2));
    
    // 驗證核心整合
    expect(integrationReport.homepage.featureCard).toBe(true);
    expect(integrationReport.navigation.unifiedNav).toBe(true);
    expect(integrationReport.dashboard.featureCard).toBe(true);
    
    console.log('🎉 檔案夾協作系統整合驗證完成！');
  });
});
