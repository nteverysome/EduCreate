/**
 * 視覺證據收集測試
 * 生成檔案夾協作系統的完整截圖和影片證據
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾協作系統視覺證據收集', () => {
  test('收集檔案夾協作系統完整視覺證據', async ({ page }) => {
    console.log('🎬 開始收集檔案夾協作系統視覺證據...');
    
    // 開始錄影
    await page.video();
    
    // 步驟1: 主頁證據收集
    console.log('📸 步驟1: 收集主頁整合證據');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 主頁全頁截圖
    await page.screenshot({ 
      path: 'test-results/evidence-01-homepage-full.png', 
      fullPage: true 
    });
    console.log('✅ 主頁全頁截圖已保存');
    
    // 檔案夾協作功能卡片特寫
    const collaborationFeature = page.locator('[data-testid="feature-folder-collaboration"]');
    if (await collaborationFeature.isVisible()) {
      await collaborationFeature.screenshot({ 
        path: 'test-results/evidence-02-homepage-collaboration-card.png' 
      });
      console.log('✅ 主頁檔案夾協作功能卡片截圖已保存');
      
      // 滾動到功能卡片並高亮
      await collaborationFeature.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'test-results/evidence-03-homepage-collaboration-highlight.png', 
        fullPage: true 
      });
      console.log('✅ 主頁檔案夾協作功能高亮截圖已保存');
    }
    
    // 步驟2: 統一導航證據收集
    console.log('📸 步驟2: 收集統一導航整合證據');
    const unifiedNav = page.locator('[data-testid="unified-navigation"]');
    if (await unifiedNav.isVisible()) {
      await unifiedNav.screenshot({ 
        path: 'test-results/evidence-04-unified-navigation.png' 
      });
      console.log('✅ 統一導航截圖已保存');
    }
    
    // 步驟3: 儀表板證據收集
    console.log('📸 步驟3: 收集儀表板整合證據');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 儀表板全頁截圖
    await page.screenshot({ 
      path: 'test-results/evidence-05-dashboard-full.png', 
      fullPage: true 
    });
    console.log('✅ 儀表板全頁截圖已保存');
    
    // 檔案夾協作功能卡片特寫
    const collaborationCard = page.locator('[data-testid="feature-card-folder-collaboration"]');
    if (await collaborationCard.isVisible()) {
      await collaborationCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await collaborationCard.screenshot({ 
        path: 'test-results/evidence-06-dashboard-collaboration-card.png' 
      });
      console.log('✅ 儀表板檔案夾協作功能卡片截圖已保存');
    }
    
    // 步驟4: 功能頁面證據收集
    console.log('📸 步驟4: 收集功能頁面證據');
    const collaborationLink = page.locator('[data-testid="feature-link-folder-collaboration"]');
    if (await collaborationLink.isVisible()) {
      await collaborationLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 檔案夾協作頁面全頁截圖
      await page.screenshot({ 
        path: 'test-results/evidence-07-collaboration-page-full.png', 
        fullPage: true 
      });
      console.log('✅ 檔案夾協作頁面全頁截圖已保存');
      
      // 頁面標題特寫
      const collaborationTitle = page.locator('[data-testid="collaboration-title"]');
      if (await collaborationTitle.isVisible()) {
        await collaborationTitle.screenshot({ 
          path: 'test-results/evidence-08-collaboration-title.png' 
        });
        console.log('✅ 檔案夾協作頁面標題截圖已保存');
      }
      
      // 統計概覽特寫
      const statsSection = page.locator('[data-testid="total-collaborations"]').locator('..');
      if (await statsSection.isVisible()) {
        await statsSection.screenshot({ 
          path: 'test-results/evidence-09-collaboration-stats.png' 
        });
        console.log('✅ 檔案夾協作統計概覽截圖已保存');
      }
      
      // 檔案夾列表特寫
      const foldersSection = page.locator('[data-testid="folders-title"]').locator('..');
      if (await foldersSection.isVisible()) {
        await foldersSection.screenshot({ 
          path: 'test-results/evidence-10-folders-list.png' 
        });
        console.log('✅ 檔案夾列表截圖已保存');
      }
      
      // 步驟5: 功能互動證據收集
      console.log('📸 步驟5: 收集功能互動證據');
      
      // 選擇第一個檔案夾
      const firstFolder = page.locator('[data-testid="folder-item-folder_1"]');
      if (await firstFolder.isVisible()) {
        await firstFolder.click();
        await page.waitForTimeout(2000);
        
        // 檔案夾選中狀態截圖
        await page.screenshot({ 
          path: 'test-results/evidence-11-folder-selected.png', 
          fullPage: true 
        });
        console.log('✅ 檔案夾選中狀態截圖已保存');
        
        // 概覽標籤內容
        const overviewTab = page.locator('[data-testid="tab-overview"]');
        if (await overviewTab.isVisible()) {
          await overviewTab.click();
          await page.waitForTimeout(1000);
          
          const overviewContent = page.locator('[data-testid="overview-tab"]');
          if (await overviewContent.isVisible()) {
            await overviewContent.screenshot({ 
              path: 'test-results/evidence-12-overview-tab.png' 
            });
            console.log('✅ 概覽標籤內容截圖已保存');
          }
        }
        
        // 協作者標籤
        const collaboratorsTab = page.locator('[data-testid="tab-collaborators"]');
        if (await collaboratorsTab.isVisible()) {
          await collaboratorsTab.click();
          await page.waitForTimeout(1000);
          
          const collaboratorsContent = page.locator('[data-testid="collaborators-tab"]');
          if (await collaboratorsContent.isVisible()) {
            await collaboratorsContent.screenshot({ 
              path: 'test-results/evidence-13-collaborators-tab.png' 
            });
            console.log('✅ 協作者標籤內容截圖已保存');
          }
        }
        
        // 分享設定標籤
        const sharingTab = page.locator('[data-testid="tab-sharing"]');
        if (await sharingTab.isVisible()) {
          await sharingTab.click();
          await page.waitForTimeout(1000);
          
          const sharingContent = page.locator('[data-testid="sharing-tab"]');
          if (await sharingContent.isVisible()) {
            await sharingContent.screenshot({ 
              path: 'test-results/evidence-14-sharing-tab.png' 
            });
            console.log('✅ 分享設定標籤內容截圖已保存');
          }
        }
        
        // 邀請標籤
        const invitationsTab = page.locator('[data-testid="tab-invitations"]');
        if (await invitationsTab.isVisible()) {
          await invitationsTab.click();
          await page.waitForTimeout(1000);
          
          const invitationsContent = page.locator('[data-testid="invitations-tab"]');
          if (await invitationsContent.isVisible()) {
            await invitationsContent.screenshot({ 
              path: 'test-results/evidence-15-invitations-tab.png' 
            });
            console.log('✅ 邀請標籤內容截圖已保存');
          }
        }
        
        // 活動記錄標籤
        const activityTab = page.locator('[data-testid="tab-activity"]');
        if (await activityTab.isVisible()) {
          await activityTab.click();
          await page.waitForTimeout(1000);
          
          const activityContent = page.locator('[data-testid="activity-tab"]');
          if (await activityContent.isVisible()) {
            await activityContent.screenshot({ 
              path: 'test-results/evidence-16-activity-tab.png' 
            });
            console.log('✅ 活動記錄標籤內容截圖已保存');
          }
        }
      }
      
      // 步驟6: 響應式設計證據收集
      console.log('📸 步驟6: 收集響應式設計證據');
      
      const viewports = [
        { width: 1200, height: 800, name: 'desktop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `test-results/evidence-17-responsive-${viewport.name}.png`, 
          fullPage: true 
        });
        console.log(`✅ ${viewport.name} 響應式設計截圖已保存`);
      }
      
      // 恢復桌面視圖
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(1000);
    }
    
    // 步驟7: 導航流程證據收集
    console.log('📸 步驟7: 收集完整導航流程證據');
    
    // 返回主頁
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 通過主頁功能卡片訪問
    const mainPageLink = page.locator('[data-testid="folder-collaboration-link"]');
    if (await mainPageLink.isVisible()) {
      await mainPageLink.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // 點擊前截圖
      await page.screenshot({ 
        path: 'test-results/evidence-18-navigation-before-click.png', 
        fullPage: true 
      });
      
      await mainPageLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // 點擊後截圖
      await page.screenshot({ 
        path: 'test-results/evidence-19-navigation-after-click.png', 
        fullPage: true 
      });
      console.log('✅ 導航流程截圖已保存');
    }
    
    // 最終完整頁面截圖
    await page.screenshot({ 
      path: 'test-results/evidence-20-final-complete-page.png', 
      fullPage: true 
    });
    console.log('✅ 最終完整頁面截圖已保存');
    
    console.log('🎉 檔案夾協作系統視覺證據收集完成！');
    console.log('📁 所有截圖已保存到 test-results/ 目錄');
    console.log('🎬 測試影片將自動保存');
  });
});
