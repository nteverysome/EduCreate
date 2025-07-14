/**
 * 影片證據收集測試
 * 生成檔案夾協作系統的完整用戶旅程影片
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾協作系統影片證據收集', () => {
  test('完整用戶旅程影片錄製', async ({ page }) => {
    console.log('🎬 開始錄製檔案夾協作系統完整用戶旅程影片...');
    
    // 設置較慢的操作速度以便錄影清晰
    test.setTimeout(300000); // 5分鐘超時
    
    try {
      // 步驟1: 主頁功能發現
      console.log('🎬 場景1: 主頁功能發現');
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // 滾動到檔案夾協作功能卡片
      const collaborationFeature = page.locator('[data-testid="feature-folder-collaboration"]');
      if (await collaborationFeature.isVisible()) {
        await collaborationFeature.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        
        // 高亮功能卡片（模擬用戶發現過程）
        await collaborationFeature.hover();
        await page.waitForTimeout(1500);
        
        console.log('✅ 主頁功能發現場景錄製完成');
      }
      
      // 步驟2: 功能卡片點擊和頁面跳轉
      console.log('🎬 場景2: 功能卡片點擊和頁面跳轉');
      const collaborationLink = page.locator('[data-testid="folder-collaboration-link"]');
      if (await collaborationLink.isVisible()) {
        await collaborationLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        
        console.log('✅ 頁面跳轉場景錄製完成');
      }
      
      // 步驟3: 檔案夾協作頁面瀏覽
      console.log('🎬 場景3: 檔案夾協作頁面瀏覽');
      
      // 驗證頁面載入
      const collaborationTitle = page.locator('[data-testid="collaboration-title"]');
      await expect(collaborationTitle).toBeVisible();
      await page.waitForTimeout(2000);
      
      // 瀏覽統計概覽
      const statsElements = [
        'total-collaborations',
        'total-collaborators', 
        'total-shares',
        'total-views'
      ];
      
      for (const statElement of statsElements) {
        const element = page.locator(`[data-testid="${statElement}"]`);
        if (await element.isVisible()) {
          await element.hover();
          await page.waitForTimeout(800);
        }
      }
      
      console.log('✅ 頁面瀏覽場景錄製完成');
      
      // 步驟4: 檔案夾選擇和互動
      console.log('🎬 場景4: 檔案夾選擇和互動');
      
      // 檢查檔案夾列表
      const foldersTitle = page.locator('[data-testid="folders-title"]');
      if (await foldersTitle.isVisible()) {
        await foldersTitle.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);
      }
      
      // 選擇第一個檔案夾
      const firstFolder = page.locator('[data-testid="folder-item-folder_1"]');
      if (await firstFolder.isVisible()) {
        await firstFolder.hover();
        await page.waitForTimeout(1000);
        await firstFolder.click();
        await page.waitForTimeout(2500);
        
        console.log('✅ 檔案夾選擇場景錄製完成');
      }
      
      // 步驟5: 標籤頁切換演示
      console.log('🎬 場景5: 標籤頁切換演示');
      
      const tabs = [
        { id: 'overview', name: '概覽', delay: 2000 },
        { id: 'collaborators', name: '協作者', delay: 2500 },
        { id: 'sharing', name: '分享設定', delay: 2500 },
        { id: 'invitations', name: '邀請', delay: 2000 },
        { id: 'activity', name: '活動記錄', delay: 2000 }
      ];
      
      for (const tab of tabs) {
        const tabButton = page.locator(`[data-testid="tab-${tab.id}"]`);
        if (await tabButton.isVisible()) {
          await tabButton.hover();
          await page.waitForTimeout(500);
          await tabButton.click();
          await page.waitForTimeout(tab.delay);
          
          // 如果是概覽標籤，演示快速操作
          if (tab.id === 'overview') {
            const quickActions = [
              'create-public-share',
              'create-class-share',
              'manage-collaborators'
            ];
            
            for (const action of quickActions) {
              const button = page.locator(`[data-testid="${action}"]`);
              if (await button.isVisible()) {
                await button.hover();
                await page.waitForTimeout(800);
              }
            }
          }
          
          // 如果是協作者標籤，演示添加協作者按鈕
          if (tab.id === 'collaborators') {
            const addButton = page.locator('[data-testid="add-collaborator-button"]');
            if (await addButton.isVisible()) {
              await addButton.hover();
              await page.waitForTimeout(1000);
            }
          }
          
          console.log(`✅ ${tab.name} 標籤演示完成`);
        }
      }
      
      // 步驟6: 響應式設計演示
      console.log('🎬 場景6: 響應式設計演示');
      
      const viewports = [
        { width: 1200, height: 800, name: '桌面', delay: 2000 },
        { width: 768, height: 1024, name: '平板', delay: 3000 },
        { width: 375, height: 667, name: '手機', delay: 3000 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(viewport.delay);
        
        // 在手機視圖下測試導航
        if (viewport.name === '手機') {
          const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
          if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();
            await page.waitForTimeout(1500);
            await mobileMenuButton.click(); // 關閉菜單
            await page.waitForTimeout(1000);
          }
        }
        
        console.log(`✅ ${viewport.name} 視圖演示完成`);
      }
      
      // 恢復桌面視圖
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(1500);
      
      // 步驟7: 導航系統演示
      console.log('🎬 場景7: 導航系統演示');
      
      // 返回主頁
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // 通過統一導航訪問
      const navCollaboration = page.locator('[data-testid="nav-folder-collaboration"]');
      if (await navCollaboration.isVisible()) {
        await navCollaboration.hover();
        await page.waitForTimeout(1000);
        await navCollaboration.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }
      
      // 通過儀表板訪問
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const dashboardCard = page.locator('[data-testid="feature-card-folder-collaboration"]');
      if (await dashboardCard.isVisible()) {
        await dashboardCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await dashboardCard.hover();
        await page.waitForTimeout(1500);
        
        const dashboardLink = page.locator('[data-testid="feature-link-folder-collaboration"]');
        if (await dashboardLink.isVisible()) {
          await dashboardLink.click();
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);
        }
      }
      
      console.log('✅ 導航系統演示完成');
      
      // 步驟8: 最終演示和總結
      console.log('🎬 場景8: 最終演示和總結');
      
      // 最終頁面瀏覽
      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      await page.waitForTimeout(1500);
      
      console.log('✅ 最終演示完成');
      
      console.log('🎉 檔案夾協作系統完整用戶旅程影片錄製完成！');
      
      // 生成影片報告
      const videoReport = {
        title: '檔案夾協作系統完整用戶旅程',
        duration: '約 4-5 分鐘',
        scenes: [
          '主頁功能發現',
          '功能卡片點擊和頁面跳轉',
          '檔案夾協作頁面瀏覽',
          '檔案夾選擇和互動',
          '標籤頁切換演示',
          '響應式設計演示',
          '導航系統演示',
          '最終演示和總結'
        ],
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      console.log('📊 影片錄製報告:', JSON.stringify(videoReport, null, 2));
      
    } catch (error) {
      console.error('❌ 影片錄製失敗:', error);
      throw error;
    }
  });
});
