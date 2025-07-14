/**
 * AI智能輔助系統 Playwright 端到端測試
 * 驗證智能推薦、難度調整、個人化學習、無障礙輔助等功能
 */

import { test, expect } from '@playwright/test';

test.describe('AI智能輔助系統', () => {
  test.beforeEach(async ({ page }) => {
    // 登入測試帳號
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // 導航到AI輔助演示頁面
    await page.goto('/demo/ai-assistance');
  });

  test('應該能顯示AI智能輔助演示頁面', async ({ page }) => {
    // 驗證頁面標題
    await expect(page.locator('h1')).toContainText('AI智能輔助演示');
    
    // 驗證功能描述
    await expect(page.locator('p')).toContainText('體驗智能內容推薦、自適應難度調整');
    
    // 驗證AI輔助面板
    await expect(page.locator('[data-testid="ai-assistance-panel"]')).toBeVisible();
    
    // 驗證側邊欄狀態顯示
    await expect(page.locator('[data-testid="current-content-status"]')).toBeVisible();
  });

  test('應該能切換AI輔助標籤頁', async ({ page }) => {
    // 驗證默認標籤頁
    await expect(page.locator('[data-testid="recommendations-tab"]')).toHaveClass(/border-blue-500/);
    
    // 切換到難度調整標籤
    await page.click('[data-testid="difficulty-tab"]');
    await expect(page.locator('[data-testid="difficulty-tab"]')).toHaveClass(/border-blue-500/);
    await expect(page.locator('[data-testid="recommendations-tab"]')).not.toHaveClass(/border-blue-500/);
    
    // 切換到學習路徑標籤
    await page.click('[data-testid="learning-tab"]');
    await expect(page.locator('[data-testid="learning-tab"]')).toHaveClass(/border-blue-500/);
    
    // 切換到無障礙標籤
    await page.click('[data-testid="accessibility-tab"]');
    await expect(page.locator('[data-testid="accessibility-tab"]')).toHaveClass(/border-blue-500/);
  });

  test('應該能載入和顯示智能推薦', async ({ page }) => {
    // 確保在推薦標籤頁
    await page.click('[data-testid="recommendations-tab"]');
    
    // 等待推薦載入
    await page.waitForSelector('[data-testid="recommendations-list"]');
    
    // 驗證推薦列表顯示
    await expect(page.locator('[data-testid="recommendations-list"]')).toBeVisible();
    
    // 驗證推薦項目
    const recommendationItems = page.locator('[data-testid="recommendation-item"]');
    
    if (await recommendationItems.count() > 0) {
      const firstRecommendation = recommendationItems.first();
      
      // 驗證推薦項目內容
      await expect(firstRecommendation.locator('[data-testid="recommendation-title"]')).toBeVisible();
      await expect(firstRecommendation.locator('[data-testid="recommendation-description"]')).toBeVisible();
      await expect(firstRecommendation.locator('[data-testid="confidence-score"]')).toBeVisible();
      await expect(firstRecommendation.locator('[data-testid="priority-level"]')).toBeVisible();
      await expect(firstRecommendation.locator('[data-testid="estimated-time"]')).toBeVisible();
    }
  });

  test('應該能重新生成推薦', async ({ page }) => {
    // 確保在推薦標籤頁
    await page.click('[data-testid="recommendations-tab"]');
    
    // 點擊重新生成按鈕
    await page.click('[data-testid="regenerate-recommendations-button"]');
    
    // 驗證載入狀態
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // 等待新推薦載入
    await page.waitForResponse(response => 
      response.url().includes('/api/ai/intelligent-assistance') && 
      response.url().includes('action=generate-recommendations') &&
      response.request().method() === 'POST'
    );
    
    // 驗證載入狀態消失
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
    
    // 驗證推薦列表更新
    await expect(page.locator('[data-testid="recommendations-list"]')).toBeVisible();
  });

  test('應該能選擇推薦項目', async ({ page }) => {
    // 確保在推薦標籤頁
    await page.click('[data-testid="recommendations-tab"]');
    await page.waitForSelector('[data-testid="recommendations-list"]');
    
    const recommendationItems = page.locator('[data-testid="recommendation-item"]');
    
    if (await recommendationItems.count() > 0) {
      // 點擊第一個推薦項目
      await recommendationItems.first().click();
      
      // 驗證側邊欄顯示選中的推薦
      await expect(page.locator('[data-testid="selected-recommendation"]')).toBeVisible();
      await expect(page.locator('[data-testid="selected-recommendation"]')).toContainText('選中的推薦');
      
      // 驗證推薦詳情顯示
      await expect(page.locator('[data-testid="recommendation-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="recommendation-reasoning"]')).toBeVisible();
    }
  });

  test('應該能進行難度分析', async ({ page }) => {
    // 切換到難度調整標籤
    await page.click('[data-testid="difficulty-tab"]');
    
    // 點擊分析難度按鈕
    await page.click('[data-testid="analyze-difficulty-button"]');
    
    // 驗證載入狀態
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // 等待難度分析完成
    await page.waitForResponse(response => 
      response.url().includes('/api/ai/intelligent-assistance') && 
      response.url().includes('action=analyze-difficulty') &&
      response.request().method() === 'POST'
    );
    
    // 驗證載入狀態消失
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
    
    // 驗證難度調整結果顯示
    await expect(page.locator('[data-testid="difficulty-adjustment-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-difficulty"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommended-difficulty"]')).toBeVisible();
    await expect(page.locator('[data-testid="adjustment-reason"]')).toBeVisible();
  });

  test('應該能顯示難度調整建議', async ({ page }) => {
    // 切換到難度調整標籤並執行分析
    await page.click('[data-testid="difficulty-tab"]');
    await page.click('[data-testid="analyze-difficulty-button"]');
    
    // 等待分析完成
    await page.waitForSelector('[data-testid="difficulty-adjustment-result"]');
    
    // 驗證調整建議內容
    await expect(page.locator('[data-testid="adjustment-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="adjustment-confidence"]')).toBeVisible();
    await expect(page.locator('[data-testid="expected-impact"]')).toBeVisible();
    
    // 驗證側邊欄顯示難度調整結果
    await expect(page.locator('[data-testid="difficulty-adjustment-sidebar"]')).toBeVisible();
  });

  test('應該能載入無障礙配置', async ({ page }) => {
    // 切換到無障礙標籤
    await page.click('[data-testid="accessibility-tab"]');
    
    // 等待無障礙配置載入
    await page.waitForSelector('[data-testid="accessibility-profile"]');
    
    // 驗證無障礙配置顯示
    await expect(page.locator('[data-testid="accessibility-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="accessibility-needs"]')).toBeVisible();
    await expect(page.locator('[data-testid="accessibility-preferences"]')).toBeVisible();
    
    // 驗證偏好設定顯示
    await expect(page.locator('[data-testid="font-size-setting"]')).toBeVisible();
    await expect(page.locator('[data-testid="contrast-setting"]')).toBeVisible();
    await expect(page.locator('[data-testid="color-scheme-setting"]')).toBeVisible();
  });

  test('應該能適配內容', async ({ page }) => {
    // 切換到無障礙標籤
    await page.click('[data-testid="accessibility-tab"]');
    await page.waitForSelector('[data-testid="accessibility-profile"]');
    
    // 點擊適配內容按鈕
    await page.click('[data-testid="adapt-content-button"]');
    
    // 驗證載入狀態
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // 等待內容適配完成
    await page.waitForResponse(response => 
      response.url().includes('/api/ai/intelligent-assistance') && 
      response.url().includes('action=adapt-content') &&
      response.request().method() === 'POST'
    );
    
    // 驗證載入狀態消失
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
    
    // 驗證側邊欄顯示內容適配結果
    await expect(page.locator('[data-testid="content-adaptation-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="accessibility-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="wcag-compliance"]')).toBeVisible();
  });

  test('應該能顯示當前內容狀態', async ({ page }) => {
    // 驗證當前內容狀態卡片
    await expect(page.locator('[data-testid="current-content-status"]')).toBeVisible();
    
    // 驗證內容信息顯示
    await expect(page.locator('[data-testid="content-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-difficulty"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-description"]')).toBeVisible();
    
    // 驗證難度進度條
    await expect(page.locator('[data-testid="difficulty-progress-bar"]')).toBeVisible();
  });

  test('應該能處理AI服務錯誤', async ({ page }) => {
    // 攔截AI API請求並返回錯誤
    await page.route('/api/ai/intelligent-assistance*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI服務暫時不可用' })
      });
    });
    
    // 嘗試重新生成推薦
    await page.click('[data-testid="recommendations-tab"]');
    await page.click('[data-testid="regenerate-recommendations-button"]');
    
    // 驗證錯誤提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('AI服務暫時不可用');
  });

  test('應該能顯示技術特色', async ({ page }) => {
    // 滾動到技術特色區域
    await page.locator('[data-testid="tech-features"]').scrollIntoViewIfNeeded();
    
    // 驗證技術特色卡片
    await expect(page.locator('[data-testid="machine-learning-feature"]')).toBeVisible();
    await expect(page.locator('[data-testid="real-time-adaptation-feature"]')).toBeVisible();
    await expect(page.locator('[data-testid="personalization-feature"]')).toBeVisible();
    await expect(page.locator('[data-testid="accessibility-feature"]')).toBeVisible();
    
    // 驗證特色內容
    await expect(page.locator('[data-testid="machine-learning-feature"]')).toContainText('機器學習');
    await expect(page.locator('[data-testid="real-time-adaptation-feature"]')).toContainText('實時適配');
    await expect(page.locator('[data-testid="personalization-feature"]')).toContainText('個人化');
    await expect(page.locator('[data-testid="accessibility-feature"]')).toContainText('無障礙');
  });

  test('應該能響應式顯示', async ({ page }) => {
    // 測試桌面視圖
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="desktop-grid-layout"]')).toBeVisible();
    
    // 測試平板視圖
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    
    // 測試手機視圖
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-stack-layout"]')).toBeVisible();
  });

  test('應該能顯示學習路徑功能（開發中）', async ({ page }) => {
    // 切換到學習路徑標籤
    await page.click('[data-testid="learning-tab"]');
    
    // 驗證開發中提示
    await expect(page.locator('[data-testid="learning-path-placeholder"]')).toBeVisible();
    await expect(page.locator('[data-testid="learning-path-placeholder"]')).toContainText('學習路徑功能開發中');
  });

  test('應該能正確顯示推薦信心度和優先級', async ({ page }) => {
    await page.click('[data-testid="recommendations-tab"]');
    await page.waitForSelector('[data-testid="recommendations-list"]');
    
    const recommendationItems = page.locator('[data-testid="recommendation-item"]');
    
    if (await recommendationItems.count() > 0) {
      const firstRecommendation = recommendationItems.first();
      
      // 驗證信心度顯示
      const confidenceScore = firstRecommendation.locator('[data-testid="confidence-score"]');
      await expect(confidenceScore).toBeVisible();
      await expect(confidenceScore).toContainText('%');
      
      // 驗證優先級顯示
      const priorityLevel = firstRecommendation.locator('[data-testid="priority-level"]');
      await expect(priorityLevel).toBeVisible();
      await expect(priorityLevel).toContainText('優先級');
    }
  });

  test('應該能顯示無障礙輔助技術建議', async ({ page }) => {
    await page.click('[data-testid="accessibility-tab"]');
    await page.waitForSelector('[data-testid="accessibility-profile"]');
    
    // 檢查是否有輔助技術建議
    const assistiveTechSection = page.locator('[data-testid="assistive-technologies"]');
    
    if (await assistiveTechSection.isVisible()) {
      await expect(assistiveTechSection).toContainText('建議輔助技術');
      
      // 驗證輔助技術標籤
      const techTags = assistiveTechSection.locator('[data-testid="tech-tag"]');
      if (await techTags.count() > 0) {
        await expect(techTags.first()).toBeVisible();
      }
    }
  });
});
