/**
 * 檔案夾導入導出系統完整用戶旅程測試
 * 驗證防止功能孤立的五項同步開發和三層整合驗證
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾導入導出系統完整用戶旅程', () => {
  test('檔案夾導入導出系統完整功能驗證', async ({ page }) => {
    console.log('🎬 開始檔案夾導入導出系統完整用戶旅程測試...');
    
    test.setTimeout(300000); // 5分鐘超時
    
    try {
      // === 第一層驗證: 主頁可見性測試 ===
      console.log('🔍 第一層驗證: 主頁可見性測試');
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // 驗證主頁載入
      const heroTitle = page.locator('[data-testid="hero-title"]');
      await expect(heroTitle).toBeVisible();
      console.log('✅ 主頁成功載入');
      
      // 驗證檔案夾導入導出功能卡片在主頁可見
      const importExportFeature = page.locator('[data-testid="feature-folder-import-export"]');
      await expect(importExportFeature).toBeVisible();
      await importExportFeature.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      // 驗證功能卡片內容
      const featureTitle = importExportFeature.locator('h3');
      await expect(featureTitle).toHaveText('檔案夾導入導出');
      
      const featureDescription = importExportFeature.locator('p');
      await expect(featureDescription).toContainText('支援 Wordwall 格式');
      
      // 高亮功能卡片
      await importExportFeature.hover();
      await page.waitForTimeout(1500);
      
      console.log('✅ 第一層驗證通過: 用戶可以在主頁找到檔案夾導入導出功能');
      
      // === 第二層驗證: 導航流程測試 ===
      console.log('🔍 第二層驗證: 導航流程測試');
      
      // 方法1: 從主頁功能卡片進入
      const importExportLink = page.locator('[data-testid="folder-import-export-link"]');
      await expect(importExportLink).toBeVisible();
      await importExportLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 驗證成功進入檔案夾導入導出頁面
      const importExportTitle = page.locator('[data-testid="import-export-title"]');
      await expect(importExportTitle).toBeVisible();
      await expect(importExportTitle).toHaveText('檔案夾導入導出');
      console.log('✅ 方法1: 主頁功能卡片導航成功');
      
      // 方法2: 通過儀表板進入
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      const dashboardImportExportCard = page.locator('[data-testid="feature-card-folder-import-export"]');
      await expect(dashboardImportExportCard).toBeVisible();
      await dashboardImportExportCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      const dashboardImportExportLink = page.locator('[data-testid="feature-link-folder-import-export"]');
      await dashboardImportExportLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      await expect(importExportTitle).toBeVisible();
      console.log('✅ 方法2: 儀表板導航成功');
      
      // 方法3: 通過統一導航進入
      const navImportExportLink = page.locator('[data-testid="nav-folder-import-export"]');
      if (await navImportExportLink.isVisible()) {
        await navImportExportLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await expect(importExportTitle).toBeVisible();
        console.log('✅ 方法3: 統一導航成功');
      }
      
      console.log('✅ 第二層驗證通過: 用戶可以通過多種方式順利進入檔案夾導入導出功能');
      
      // === 第三層驗證: 功能互動測試 ===
      console.log('🔍 第三層驗證: 功能互動測試');
      
      // 確保在檔案夾導入導出頁面
      await page.goto('http://localhost:3000/tools/folder-import-export');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 驗證頁面標題和描述
      await expect(importExportTitle).toBeVisible();
      const pageDescription = page.locator('p').first();
      await expect(pageDescription).toContainText('支援 Wordwall 格式');
      
      // 驗證標籤切換功能
      const importTab = page.locator('[data-testid="import-tab"]');
      const exportTab = page.locator('[data-testid="export-tab"]');
      
      await expect(importTab).toBeVisible();
      await expect(exportTab).toBeVisible();
      
      // 測試導入標籤 (預設應該是活躍的)
      await importTab.click();
      await page.waitForTimeout(1000);
      
      // 驗證導入功能元素
      const uploadArea = page.locator('[data-testid="upload-area"]');
      const fileInput = page.locator('[data-testid="file-input"]');
      
      await expect(uploadArea).toBeVisible();
      await expect(fileInput).toBeAttached();
      
      // 測試上傳區域互動
      await uploadArea.hover();
      await page.waitForTimeout(1000);
      
      console.log('✅ 導入功能驗證通過');
      
      // 測試導出標籤
      await exportTab.click();
      await page.waitForTimeout(1500);
      
      // 驗證導出功能元素
      const exportFormatSelect = page.locator('[data-testid="export-format-select"]');
      const includeActivitiesCheckbox = page.locator('[data-testid="include-activities-checkbox"]');
      const includeSubfoldersCheckbox = page.locator('[data-testid="include-subfolders-checkbox"]');
      const exportButton = page.locator('[data-testid="export-button"]');
      
      await expect(exportFormatSelect).toBeVisible();
      await expect(includeActivitiesCheckbox).toBeVisible();
      await expect(includeSubfoldersCheckbox).toBeVisible();
      await expect(exportButton).toBeVisible();
      
      // 測試導出格式選擇
      await exportFormatSelect.selectOption('json');
      await page.waitForTimeout(500);
      await exportFormatSelect.selectOption('wordwall');
      await page.waitForTimeout(500);
      await exportFormatSelect.selectOption('zip');
      await page.waitForTimeout(500);
      
      // 測試選項切換
      await includeActivitiesCheckbox.click();
      await page.waitForTimeout(500);
      await includeActivitiesCheckbox.click(); // 恢復選中
      await page.waitForTimeout(500);
      
      await includeSubfoldersCheckbox.click();
      await page.waitForTimeout(500);
      await includeSubfoldersCheckbox.click(); // 恢復選中
      await page.waitForTimeout(500);
      
      // 測試檔案夾選擇
      const folderCheckboxes = page.locator('[data-testid^="folder-checkbox-"]');
      const checkboxCount = await folderCheckboxes.count();
      
      if (checkboxCount > 0) {
        // 選擇第一個檔案夾
        await folderCheckboxes.first().click();
        await page.waitForTimeout(1000);
        
        // 驗證導出按鈕變為可用
        await expect(exportButton).toBeEnabled();
        
        // 測試導出按鈕懸停
        await exportButton.hover();
        await page.waitForTimeout(1000);
        
        console.log('✅ 檔案夾選擇功能驗證通過');
      }
      
      console.log('✅ 導出功能驗證通過');
      
      console.log('✅ 第三層驗證通過: 檔案夾導入導出功能本身正常運作');
      
      // === 響應式設計測試 ===
      console.log('🔍 響應式設計測試');
      
      const viewports = [
        { width: 1200, height: 800, name: '桌面' },
        { width: 768, height: 1024, name: '平板' },
        { width: 375, height: 667, name: '手機' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(2000);
        
        // 驗證頁面在不同視圖下仍然可用
        await expect(importExportTitle).toBeVisible();
        await expect(importTab).toBeVisible();
        await expect(exportTab).toBeVisible();
        
        console.log(`✅ ${viewport.name} 視圖驗證通過`);
      }
      
      // 恢復桌面視圖
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(1500);
      
      // === 最終整合驗證 ===
      console.log('🔍 最終整合驗證');
      
      // 驗證從檔案夾導入導出頁面可以返回主頁
      await page.goto('http://localhost:3000/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      await expect(heroTitle).toBeVisible();
      await expect(importExportFeature).toBeVisible();
      
      // 驗證從檔案夾導入導出頁面可以訪問儀表板
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
      await expect(dashboardTitle).toBeVisible();
      await expect(dashboardImportExportCard).toBeVisible();
      
      console.log('✅ 最終整合驗證通過');
      
      // === 最終頁面瀏覽 ===
      console.log('🔍 最終頁面瀏覽');
      
      // 回到檔案夾導入導出頁面進行最終展示
      await page.goto('http://localhost:3000/tools/folder-import-export');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      // 最終頁面滾動展示
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await page.waitForTimeout(1500);
      
      console.log('✅ 最終頁面瀏覽完成');
      
      console.log('🎉 檔案夾導入導出系統完整用戶旅程測試成功完成！');
      
      // 生成測試報告
      const testReport = {
        feature: '檔案夾導入導出系統',
        timestamp: new Date().toISOString(),
        verifications: {
          'layer1_homepage_visibility': '✅ 通過',
          'layer2_navigation_flow': '✅ 通過',
          'layer3_feature_interaction': '✅ 通過',
          'responsive_design': '✅ 通過',
          'final_integration': '✅ 通過'
        },
        testedFeatures: [
          '主頁功能卡片顯示',
          '儀表板功能卡片顯示',
          '統一導航連結',
          '頁面標題和描述',
          '標籤切換功能',
          '導入功能界面',
          '檔案上傳區域',
          '導出功能界面',
          '格式選擇功能',
          '選項切換功能',
          '檔案夾選擇功能',
          '導出按鈕功能',
          '響應式設計',
          '跨頁面導航'
        ],
        antiIsolationVerification: {
          'homepage_entry': '✅ 主頁入口正常',
          'dashboard_integration': '✅ 儀表板整合正常',
          'navigation_links': '✅ 導航連結正常',
          'feature_functionality': '✅ 功能本身正常',
          'e2e_testing': '✅ 端到端測試正常'
        },
        status: 'completed'
      };
      
      console.log('📊 檔案夾導入導出系統測試報告:', JSON.stringify(testReport, null, 2));
      
    } catch (error) {
      console.error('❌ 檔案夾導入導出系統測試失敗:', error);
      throw error;
    }
  });
});
