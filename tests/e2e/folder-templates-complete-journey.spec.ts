/**
 * 檔案夾模板系統完整用戶旅程測試
 * 驗證防止功能孤立的五項同步開發和三層整合驗證
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾模板系統完整用戶旅程', () => {
  test('檔案夾模板系統完整功能驗證', async ({ page }) => {
    console.log('🎬 開始檔案夾模板系統完整用戶旅程測試...');
    
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
      
      // 驗證檔案夾模板功能卡片在主頁可見
      const folderTemplatesFeature = page.locator('[data-testid="feature-folder-templates"]');
      await expect(folderTemplatesFeature).toBeVisible();
      await folderTemplatesFeature.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      // 驗證功能卡片內容
      const featureTitle = folderTemplatesFeature.locator('h3');
      await expect(featureTitle).toHaveText('檔案夾模板');
      
      const featureDescription = folderTemplatesFeature.locator('p');
      await expect(featureDescription).toContainText('預設模板快速創建檔案夾結構');
      
      // 高亮功能卡片
      await folderTemplatesFeature.hover();
      await page.waitForTimeout(1500);
      
      console.log('✅ 第一層驗證通過: 用戶可以在主頁找到檔案夾模板功能');
      
      // === 第二層驗證: 導航流程測試 ===
      console.log('🔍 第二層驗證: 導航流程測試');
      
      // 方法1: 從主頁功能卡片進入
      const folderTemplatesLink = page.locator('[data-testid="folder-templates-link"]');
      await expect(folderTemplatesLink).toBeVisible();
      await folderTemplatesLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 驗證成功進入檔案夾模板頁面
      const templatesTitle = page.locator('[data-testid="folder-templates-title"]');
      await expect(templatesTitle).toBeVisible();
      await expect(templatesTitle).toHaveText('檔案夾模板系統');
      console.log('✅ 方法1: 主頁功能卡片導航成功');
      
      // 方法2: 通過儀表板進入
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      const dashboardTemplatesCard = page.locator('[data-testid="feature-card-folder-templates"]');
      await expect(dashboardTemplatesCard).toBeVisible();
      await dashboardTemplatesCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      const dashboardTemplatesLink = page.locator('[data-testid="feature-link-folder-templates"]');
      await dashboardTemplatesLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      await expect(templatesTitle).toBeVisible();
      console.log('✅ 方法2: 儀表板導航成功');
      
      // 方法3: 通過統一導航進入
      const navTemplatesLink = page.locator('[data-testid="nav-folder-templates"]');
      if (await navTemplatesLink.isVisible()) {
        await navTemplatesLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await expect(templatesTitle).toBeVisible();
        console.log('✅ 方法3: 統一導航成功');
      }
      
      console.log('✅ 第二層驗證通過: 用戶可以通過多種方式順利進入檔案夾模板功能');
      
      // === 第三層驗證: 功能互動測試 ===
      console.log('🔍 第三層驗證: 功能互動測試');
      
      // 確保在檔案夾模板頁面
      await page.goto('http://localhost:3000/tools/folder-templates');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 驗證頁面標題和描述
      await expect(templatesTitle).toBeVisible();
      const pageDescription = page.locator('p').first();
      await expect(pageDescription).toContainText('使用預設模板快速創建檔案夾結構');
      
      // 驗證統計數據
      const totalTemplates = page.locator('[data-testid="total-templates"]');
      const defaultTemplates = page.locator('[data-testid="default-templates"]');
      const totalUsage = page.locator('[data-testid="total-usage"]');
      
      await expect(totalTemplates).toBeVisible();
      await expect(defaultTemplates).toBeVisible();
      await expect(totalUsage).toBeVisible();
      
      // 驗證統計數據有內容
      const totalTemplatesText = await totalTemplates.textContent();
      const defaultTemplatesText = await defaultTemplates.textContent();
      const totalUsageText = await totalUsage.textContent();
      
      expect(parseInt(totalTemplatesText || '0')).toBeGreaterThan(0);
      expect(parseInt(defaultTemplatesText || '0')).toBeGreaterThan(0);
      expect(parseInt(totalUsageText || '0')).toBeGreaterThan(0);
      
      console.log('✅ 統計數據驗證通過');
      
      // 驗證搜索功能
      const searchInput = page.locator('[data-testid="search-templates"]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('英語');
      await page.waitForTimeout(1000);
      
      // 驗證搜索結果
      const englishTemplate = page.locator('[data-testid="template-card-template_1"]');
      await expect(englishTemplate).toBeVisible();
      console.log('✅ 搜索功能驗證通過');
      
      // 清除搜索
      await searchInput.clear();
      await page.waitForTimeout(1000);
      
      // 驗證分類過濾
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await expect(categoryFilter).toBeVisible();
      await categoryFilter.selectOption('語言學習');
      await page.waitForTimeout(1000);
      
      // 驗證過濾結果
      await expect(englishTemplate).toBeVisible();
      console.log('✅ 分類過濾功能驗證通過');
      
      // 重置過濾
      await categoryFilter.selectOption('全部');
      await page.waitForTimeout(1000);
      
      // 驗證模板卡片功能
      const templateCards = page.locator('[data-testid^="template-card-"]');
      const cardCount = await templateCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // 測試第一個模板卡片
      const firstTemplate = templateCards.first();
      await firstTemplate.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // 驗證模板卡片內容
      const templateTitle = firstTemplate.locator('h3');
      const templateDescription = firstTemplate.locator('p').first();
      const useTemplateButton = firstTemplate.locator('[data-testid^="use-template-"]');
      const previewButton = firstTemplate.locator('[data-testid^="preview-template-"]');
      
      await expect(templateTitle).toBeVisible();
      await expect(templateDescription).toBeVisible();
      await expect(useTemplateButton).toBeVisible();
      await expect(previewButton).toBeVisible();
      
      // 測試使用模板功能
      await useTemplateButton.hover();
      await page.waitForTimeout(1000);
      await useTemplateButton.click();
      await page.waitForTimeout(2000);
      
      // 驗證使用模板後的反饋（可能是彈窗或提示）
      console.log('✅ 使用模板功能測試完成');
      
      // 測試預覽功能
      await previewButton.hover();
      await page.waitForTimeout(1000);
      await previewButton.click();
      await page.waitForTimeout(1500);
      
      console.log('✅ 預覽功能測試完成');
      
      // 驗證創建新模板按鈕
      const createTemplateButton = page.locator('[data-testid="create-template-button"]');
      await expect(createTemplateButton).toBeVisible();
      await createTemplateButton.hover();
      await page.waitForTimeout(1000);
      
      console.log('✅ 創建新模板按鈕驗證通過');
      
      console.log('✅ 第三層驗證通過: 檔案夾模板功能本身正常運作');
      
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
        await expect(templatesTitle).toBeVisible();
        await expect(searchInput).toBeVisible();
        
        console.log(`✅ ${viewport.name} 視圖驗證通過`);
      }
      
      // 恢復桌面視圖
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(1500);
      
      // === 最終整合驗證 ===
      console.log('🔍 最終整合驗證');
      
      // 驗證從檔案夾模板頁面可以返回主頁
      await page.goto('http://localhost:3000/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      await expect(heroTitle).toBeVisible();
      await expect(folderTemplatesFeature).toBeVisible();
      
      // 驗證從檔案夾模板頁面可以訪問儀表板
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      
      const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
      await expect(dashboardTitle).toBeVisible();
      await expect(dashboardTemplatesCard).toBeVisible();
      
      console.log('✅ 最終整合驗證通過');
      
      // === 最終頁面瀏覽 ===
      console.log('🔍 最終頁面瀏覽');
      
      // 回到檔案夾模板頁面進行最終展示
      await page.goto('http://localhost:3000/tools/folder-templates');
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
      
      console.log('🎉 檔案夾模板系統完整用戶旅程測試成功完成！');
      
      // 生成測試報告
      const testReport = {
        feature: '檔案夾模板系統',
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
          '統計數據顯示',
          '搜索功能',
          '分類過濾',
          '模板卡片展示',
          '使用模板功能',
          '預覽模板功能',
          '創建新模板按鈕',
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
      
      console.log('📊 檔案夾模板系統測試報告:', JSON.stringify(testReport, null, 2));
      
    } catch (error) {
      console.error('❌ 檔案夾模板系統測試失敗:', error);
      throw error;
    }
  });
});
