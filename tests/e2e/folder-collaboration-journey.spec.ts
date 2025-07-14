/**
 * 檔案夾協作系統完整用戶旅程測試
 * 驗證從主頁開始的檔案夾分享和協作功能
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾協作系統用戶旅程測試', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });

  test('主頁到檔案夾協作的完整用戶旅程', async ({ page }) => {
    console.log('🚀 開始檔案夾協作系統完整用戶旅程測試...');
    
    // 步驟1: 訪問主頁
    console.log('📍 步驟1: 訪問主頁並檢查檔案夾協作功能入口');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/collaboration-journey-step1-homepage.png', fullPage: true });
    
    // 驗證主頁載入
    const heroTitle = await page.locator('[data-testid="hero-title"]').textContent();
    console.log(`✅ 主頁標題: ${heroTitle}`);
    expect(heroTitle).toContain('EduCreate');
    
    // 檢查檔案夾協作功能卡片
    const collaborationFeature = page.locator('[data-testid="feature-folder-collaboration"]');
    await expect(collaborationFeature).toBeVisible();
    console.log('✅ 在主頁找到檔案夾協作功能卡片');
    
    // 檢查功能連結
    const collaborationLink = page.locator('[data-testid="folder-collaboration-link"]');
    await expect(collaborationLink).toBeVisible();
    console.log('✅ 檔案夾協作功能連結可見');
    
    // 步驟2: 點擊進入檔案夾協作
    console.log('📍 步驟2: 點擊進入檔案夾協作功能');
    await collaborationLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/collaboration-journey-step2-page.png', fullPage: true });
    
    // 驗證檔案夾協作頁面載入
    const collaborationTitle = page.locator('[data-testid="collaboration-title"]');
    await expect(collaborationTitle).toBeVisible();
    const titleText = await collaborationTitle.textContent();
    console.log(`✅ 檔案夾協作頁面標題: ${titleText}`);
    expect(titleText).toContain('檔案夾分享和協作');
    
    // 步驟3: 檢查統計概覽
    console.log('📍 步驟3: 檢查統計概覽');
    const statsElements = [
      'total-collaborations',
      'total-collaborators', 
      'total-shares',
      'total-views'
    ];
    
    for (const statElement of statsElements) {
      const element = page.locator(`[data-testid="${statElement}"]`);
      await expect(element).toBeVisible();
      const value = await element.textContent();
      console.log(`✅ 統計項目 ${statElement}: ${value}`);
    }
    
    // 步驟4: 檢查檔案夾列表
    console.log('📍 步驟4: 檢查檔案夾列表');
    const foldersTitle = page.locator('[data-testid="folders-title"]');
    await expect(foldersTitle).toBeVisible();
    console.log('✅ 檔案夾列表標題可見');
    
    // 檢查檔案夾項目
    const folderItems = page.locator('[data-testid^="folder-item-"]');
    const folderCount = await folderItems.count();
    expect(folderCount).toBeGreaterThan(0);
    console.log(`✅ 找到 ${folderCount} 個檔案夾項目`);
    
    // 步驟5: 選擇檔案夾並測試協作功能
    console.log('📍 步驟5: 選擇檔案夾並測試協作功能');
    const firstFolder = page.locator('[data-testid="folder-item-folder_1"]');
    await expect(firstFolder).toBeVisible();
    await firstFolder.click();
    await page.waitForTimeout(2000);
    
    // 檢查概覽標籤
    const overviewTab = page.locator('[data-testid="tab-overview"]');
    await expect(overviewTab).toBeVisible();
    await overviewTab.click();
    await page.waitForTimeout(1000);
    
    const overviewContent = page.locator('[data-testid="overview-tab"]');
    await expect(overviewContent).toBeVisible();
    console.log('✅ 概覽標籤內容正常顯示');
    
    await page.screenshot({ path: 'test-results/collaboration-journey-step5-overview.png', fullPage: true });
    
    console.log('🎉 檔案夾協作系統完整用戶旅程測試成功！');
  });

  test('檔案夾協作功能標籤測試', async ({ page }) => {
    console.log('🚀 開始檔案夾協作功能標籤測試...');
    
    // 訪問檔案夾協作頁面
    await page.goto('/collaboration/folders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 選擇第一個檔案夾
    const firstFolder = page.locator('[data-testid="folder-item-folder_1"]');
    await firstFolder.click();
    await page.waitForTimeout(1000);
    
    // 測試所有標籤
    const tabs = [
      { id: 'overview', name: '概覽' },
      { id: 'collaborators', name: '協作者' },
      { id: 'sharing', name: '分享設定' },
      { id: 'invitations', name: '邀請' },
      { id: 'activity', name: '活動記錄' }
    ];
    
    for (const tab of tabs) {
      console.log(`📍 測試 ${tab.name} 標籤`);
      
      const tabButton = page.locator(`[data-testid="tab-${tab.id}"]`);
      await expect(tabButton).toBeVisible();
      await tabButton.click();
      await page.waitForTimeout(1000);
      
      const tabContent = page.locator(`[data-testid="${tab.id}-tab"]`);
      await expect(tabContent).toBeVisible();
      console.log(`✅ ${tab.name} 標籤內容正常顯示`);
      
      await page.screenshot({ 
        path: `test-results/collaboration-tab-${tab.id}.png`, 
        fullPage: true 
      });
    }
    
    console.log('🎉 檔案夾協作功能標籤測試完成！');
  });

  test('檔案夾協作互動功能測試', async ({ page }) => {
    console.log('🚀 開始檔案夾協作互動功能測試...');
    
    // 訪問檔案夾協作頁面
    await page.goto('/collaboration/folders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 選擇第一個檔案夾
    const firstFolder = page.locator('[data-testid="folder-item-folder_1"]');
    await firstFolder.click();
    await page.waitForTimeout(1000);
    
    // 測試快速操作按鈕
    console.log('📍 測試快速操作按鈕');
    const quickActions = [
      'create-public-share',
      'create-class-share',
      'manage-collaborators'
    ];
    
    for (const action of quickActions) {
      const button = page.locator(`[data-testid="${action}"]`);
      await expect(button).toBeVisible();
      console.log(`✅ 快速操作按鈕 ${action} 可見`);
    }
    
    // 測試協作者管理
    console.log('📍 測試協作者管理功能');
    const collaboratorsTab = page.locator('[data-testid="tab-collaborators"]');
    await collaboratorsTab.click();
    await page.waitForTimeout(1000);
    
    const addCollaboratorButton = page.locator('[data-testid="add-collaborator-button"]');
    await expect(addCollaboratorButton).toBeVisible();
    console.log('✅ 添加協作者按鈕可見');
    
    // 測試邀請管理
    console.log('📍 測試邀請管理功能');
    const invitationsTab = page.locator('[data-testid="tab-invitations"]');
    await invitationsTab.click();
    await page.waitForTimeout(1000);
    
    const sendInvitationButton = page.locator('[data-testid="send-invitation-button"]');
    await expect(sendInvitationButton).toBeVisible();
    console.log('✅ 發送邀請按鈕可見');
    
    await page.screenshot({ path: 'test-results/collaboration-interactions.png', fullPage: true });
    
    console.log('🎉 檔案夾協作互動功能測試完成！');
  });

  test('從儀表板訪問檔案夾協作測試', async ({ page }) => {
    console.log('🚀 開始從儀表板訪問檔案夾協作測試...');
    
    // 步驟1: 訪問儀表板
    console.log('📍 步驟1: 訪問儀表板');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/collaboration-dashboard-step1.png', fullPage: true });
    
    // 檢查檔案夾協作功能卡片
    const collaborationCard = page.locator('[data-testid="feature-card-folder-collaboration"]');
    await expect(collaborationCard).toBeVisible();
    console.log('✅ 在儀表板找到檔案夾協作功能卡片');
    
    // 檢查功能連結
    const collaborationLink = page.locator('[data-testid="feature-link-folder-collaboration"]');
    await expect(collaborationLink).toBeVisible();
    console.log('✅ 檔案夾協作功能連結可見');
    
    // 步驟2: 點擊進入檔案夾協作
    console.log('📍 步驟2: 從儀表板點擊進入檔案夾協作');
    await collaborationLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 驗證成功跳轉
    const collaborationTitle = page.locator('[data-testid="collaboration-title"]');
    await expect(collaborationTitle).toBeVisible();
    const titleText = await collaborationTitle.textContent();
    console.log(`✅ 成功從儀表板跳轉到檔案夾協作: ${titleText}`);
    expect(titleText).toContain('檔案夾分享和協作');
    
    await page.screenshot({ path: 'test-results/collaboration-dashboard-step2.png', fullPage: true });
    
    console.log('🎉 從儀表板訪問檔案夾協作測試成功！');
  });

  test('統一導航系統檔案夾協作測試', async ({ page }) => {
    console.log('🚀 開始統一導航系統檔案夾協作測試...');
    
    // 步驟1: 訪問主頁檢查導航
    console.log('📍 步驟1: 檢查統一導航中的檔案夾協作項目');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 檢查統一導航
    const unifiedNav = page.locator('[data-testid="unified-navigation"]');
    await expect(unifiedNav).toBeVisible();
    console.log('✅ 統一導航組件可見');
    
    // 檢查檔案夾協作導航項目
    const navCollaboration = page.locator('[data-testid="nav-folder-collaboration"]');
    await expect(navCollaboration).toBeVisible();
    console.log('✅ 統一導航中的檔案夾協作項目可見');
    
    // 步驟2: 通過導航訪問檔案夾協作
    console.log('📍 步驟2: 通過統一導航訪問檔案夾協作');
    await navCollaboration.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 驗證成功跳轉
    const collaborationTitle = page.locator('[data-testid="collaboration-title"]');
    await expect(collaborationTitle).toBeVisible();
    console.log('✅ 通過統一導航成功訪問檔案夾協作');
    
    await page.screenshot({ path: 'test-results/collaboration-navigation.png', fullPage: true });
    
    console.log('🎉 統一導航系統檔案夾協作測試成功！');
  });

  test('檔案夾協作響應式設計測試', async ({ page }) => {
    console.log('🚀 開始檔案夾協作響應式設計測試...');
    
    const viewports = [
      { width: 1200, height: 800, name: '桌面' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手機' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 測試 ${viewport.name} 視圖下的檔案夾協作功能`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/collaboration/folders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // 檢查主要元素在不同視圖下的可見性
      const collaborationTitle = page.locator('[data-testid="collaboration-title"]');
      const foldersTitle = page.locator('[data-testid="folders-title"]');
      
      await expect(collaborationTitle).toBeVisible();
      await expect(foldersTitle).toBeVisible();
      
      // 選擇檔案夾測試
      const firstFolder = page.locator('[data-testid="folder-item-folder_1"]');
      if (await firstFolder.isVisible()) {
        await firstFolder.click();
        await page.waitForTimeout(1000);
        
        // 檢查標籤在不同視圖下的可見性
        const overviewTab = page.locator('[data-testid="tab-overview"]');
        await expect(overviewTab).toBeVisible();
      }
      
      await page.screenshot({ 
        path: `test-results/collaboration-responsive-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      console.log(`✅ ${viewport.name} 視圖下檔案夾協作功能正常`);
    }
    
    console.log('🎉 檔案夾協作響應式設計測試成功！');
  });

  test('檔案夾協作無選擇狀態測試', async ({ page }) => {
    console.log('🚀 開始檔案夾協作無選擇狀態測試...');
    
    // 訪問檔案夾協作頁面
    await page.goto('/collaboration/folders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 檢查無選擇狀態
    const noFolderSelected = page.locator('[data-testid="no-folder-selected"]');
    await expect(noFolderSelected).toBeVisible();
    const noSelectionText = await noFolderSelected.textContent();
    console.log(`✅ 無選擇狀態顯示: ${noSelectionText}`);
    expect(noSelectionText).toContain('選擇檔案夾開始協作');
    
    await page.screenshot({ path: 'test-results/collaboration-no-selection.png', fullPage: true });
    
    console.log('🎉 檔案夾協作無選擇狀態測試成功！');
  });

  test('檔案夾協作返回導航測試', async ({ page }) => {
    console.log('🚀 開始檔案夾協作返回導航測試...');
    
    // 訪問檔案夾協作頁面
    await page.goto('/collaboration/folders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 檢查返回儀表板按鈕
    const backToDashboard = page.locator('[data-testid="back-to-dashboard"]');
    await expect(backToDashboard).toBeVisible();
    console.log('✅ 返回儀表板按鈕可見');
    
    // 測試返回功能
    await backToDashboard.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 驗證返回到儀表板
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    await expect(dashboardTitle).toBeVisible();
    console.log('✅ 成功返回儀表板');
    
    await page.screenshot({ path: 'test-results/collaboration-back-navigation.png', fullPage: true });
    
    console.log('🎉 檔案夾協作返回導航測試成功！');
  });
});
