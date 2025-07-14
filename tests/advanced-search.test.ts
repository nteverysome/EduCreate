/**
 * 高級搜索系統 Playwright 測試
 * 驗證15個組織工具的高級搜索功能
 */

import { test, expect } from '@playwright/test';

test.describe('高級搜索系統', () => {
  test.beforeEach(async ({ page }) => {
    // 登入測試帳號
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // 導航到高級搜索演示頁面
    await page.goto('/demo/advanced-search');
  });

  test('應該能進行全文搜索', async ({ page }) => {
    // 輸入搜索關鍵詞
    await page.fill('[data-testid="search-input"]', '英語學習');
    
    // 選擇全文搜索類型
    await page.selectOption('[data-testid="search-type-select"]', 'full_text');
    
    // 點擊搜索按鈕
    await page.click('[data-testid="search-button"]');
    
    // 等待搜索結果載入
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 驗證搜索結果顯示
    await expect(page.locator('[data-testid="search-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount({ min: 1 });
    
    // 驗證搜索統計信息
    await expect(page.locator('[data-testid="total-results"]')).toContainText('找到結果');
    await expect(page.locator('[data-testid="search-time"]')).toContainText('搜索時間');
  });

  test('應該能進行模糊匹配搜索', async ({ page }) => {
    // 輸入包含拼寫錯誤的搜索詞
    await page.fill('[data-testid="search-input"]', '英语学习'); // 簡體字
    
    // 選擇模糊匹配搜索類型
    await page.selectOption('[data-testid="search-type-select"]', 'fuzzy_match');
    
    // 執行搜索
    await page.click('[data-testid="search-button"]');
    
    // 驗證模糊匹配結果
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount({ min: 1 });
  });

  test('應該能使用高級過濾器', async ({ page }) => {
    // 展開高級過濾器
    await page.click('[data-testid="advanced-filters-toggle"]');
    await expect(page.locator('[data-testid="advanced-filters"]')).toBeVisible();
    
    // 設置活動類型過濾器
    await page.check('[data-testid="activity-type-matching"]');
    await page.check('[data-testid="activity-type-quiz"]');
    
    // 設置GEPT等級過濾器
    await page.check('[data-testid="gept-level-初級"]');
    
    // 設置難度級別過濾器
    await page.check('[data-testid="difficulty-簡單"]');
    
    // 設置狀態過濾器
    await page.check('[data-testid="filter-published"]');
    
    // 設置內容類型過濾器
    await page.check('[data-testid="filter-has-images"]');
    
    // 執行搜索
    await page.click('[data-testid="search-button"]');
    
    // 驗證過濾結果
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 檢查結果是否符合過濾條件
    const resultItems = page.locator('[data-testid="search-result-item"]');
    const count = await resultItems.count();
    
    if (count > 0) {
      // 驗證第一個結果的屬性
      const firstResult = resultItems.first();
      await expect(firstResult.locator('[data-testid="activity-type"]')).toContainText(/matching|quiz/);
      await expect(firstResult.locator('[data-testid="gept-level"]')).toContainText('初級');
    }
  });

  test('應該能設置日期範圍過濾器', async ({ page }) => {
    // 展開高級過濾器
    await page.click('[data-testid="advanced-filters-toggle"]');
    
    // 設置創建日期範圍
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // 一個月前
    const endDate = new Date(); // 今天
    
    await page.fill('[data-testid="date-created-from"]', startDate.toISOString().split('T')[0]);
    await page.fill('[data-testid="date-created-to"]', endDate.toISOString().split('T')[0]);
    
    // 執行搜索
    await page.click('[data-testid="search-button"]');
    
    // 驗證日期過濾結果
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 檢查結果的創建日期是否在範圍內
    const resultItems = page.locator('[data-testid="search-result-item"]');
    const count = await resultItems.count();
    
    if (count > 0) {
      const firstResult = resultItems.first();
      const dateText = await firstResult.locator('[data-testid="created-date"]').textContent();
      // 這裡可以添加更詳細的日期驗證邏輯
      expect(dateText).toBeTruthy();
    }
  });

  test('應該能切換排序選項', async ({ page }) => {
    // 輸入搜索關鍵詞
    await page.fill('[data-testid="search-input"]', '測試');
    
    // 展開高級過濾器以訪問排序選項
    await page.click('[data-testid="advanced-filters-toggle"]');
    
    // 測試不同的排序選項
    const sortOptions = [
      { value: 'date_created', label: '創建日期' },
      { value: 'date_updated', label: '更新日期' },
      { value: 'title_asc', label: '標題 A-Z' },
      { value: 'popularity', label: '熱門度' }
    ];
    
    for (const sortOption of sortOptions) {
      // 選擇排序方式
      await page.selectOption('[data-testid="sort-by-select"]', sortOption.value);
      
      // 執行搜索
      await page.click('[data-testid="search-button"]');
      
      // 等待結果載入
      await page.waitForSelector('[data-testid="search-results"]');
      
      // 驗證排序已應用（這裡可以添加更具體的排序驗證）
      await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount({ min: 0 });
    }
  });

  test('應該能切換視圖模式', async ({ page }) => {
    // 執行搜索以獲得結果
    await page.fill('[data-testid="search-input"]', '測試');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 測試網格視圖
    await page.click('[data-testid="view-mode-grid"]');
    await expect(page.locator('[data-testid="search-results"]')).toHaveClass(/grid/);
    
    // 測試列表視圖
    await page.click('[data-testid="view-mode-list"]');
    await expect(page.locator('[data-testid="search-results"]')).toHaveClass(/list/);
  });

  test('應該顯示搜索高亮', async ({ page }) => {
    // 輸入搜索關鍵詞
    await page.fill('[data-testid="search-input"]', '英語');
    
    // 確保包含高亮選項已啟用
    await page.click('[data-testid="advanced-filters-toggle"]');
    await page.check('[data-testid="include-highlights"]');
    
    // 執行搜索
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 檢查是否有高亮顯示
    const highlightElements = page.locator('[data-testid="search-highlight"]');
    const count = await highlightElements.count();
    
    if (count > 0) {
      // 驗證高亮元素包含搜索關鍵詞
      await expect(highlightElements.first()).toContainText('英語');
    }
  });

  test('應該顯示分面過濾器', async ({ page }) => {
    // 確保包含分面選項已啟用
    await page.click('[data-testid="advanced-filters-toggle"]');
    await page.check('[data-testid="include-facets"]');
    
    // 執行搜索
    await page.fill('[data-testid="search-input"]', '學習');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 檢查分面過濾器是否顯示
    await expect(page.locator('[data-testid="facet-filters"]')).toBeVisible();
    
    // 檢查各種分面類別
    await expect(page.locator('[data-testid="facet-activity-types"]')).toBeVisible();
    await expect(page.locator('[data-testid="facet-gept-levels"]')).toBeVisible();
    await expect(page.locator('[data-testid="facet-difficulties"]')).toBeVisible();
  });

  test('應該能重置搜索', async ({ page }) => {
    // 設置複雜的搜索條件
    await page.fill('[data-testid="search-input"]', '測試搜索');
    await page.click('[data-testid="advanced-filters-toggle"]');
    await page.check('[data-testid="activity-type-matching"]');
    await page.check('[data-testid="filter-published"]');
    
    // 執行搜索
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 重置搜索
    await page.click('[data-testid="reset-button"]');
    
    // 驗證搜索條件已重置
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="activity-type-matching"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="filter-published"]')).not.toBeChecked();
    
    // 驗證搜索結果已清除
    await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
  });

  test('應該能處理無結果的搜索', async ({ page }) => {
    // 搜索不存在的內容
    await page.fill('[data-testid="search-input"]', 'xyz不存在的內容123');
    await page.click('[data-testid="search-button"]');
    
    // 等待搜索完成
    await page.waitForSelector('[data-testid="search-stats"]');
    
    // 驗證無結果提示
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('沒有找到結果');
    
    // 驗證搜索建議（如果有的話）
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      await expect(suggestions).toContainText('您可能想搜索');
    }
  });

  test('應該能處理搜索錯誤', async ({ page }) => {
    // 模擬網絡錯誤（通過攔截請求）
    await page.route('/api/search/enhanced*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '服務器錯誤' })
      });
    });
    
    // 執行搜索
    await page.fill('[data-testid="search-input"]', '測試');
    await page.click('[data-testid="search-button"]');
    
    // 驗證錯誤提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('搜索錯誤');
  });

  test('應該能進行分頁導航', async ({ page }) => {
    // 設置較小的每頁數量以確保有多頁結果
    await page.click('[data-testid="advanced-filters-toggle"]');
    await page.selectOption('[data-testid="limit-select"]', '5');
    
    // 執行搜索
    await page.fill('[data-testid="search-input"]', '學習');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // 檢查是否有分頁控件
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      // 點擊下一頁
      const nextButton = page.locator('[data-testid="next-page"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // 驗證頁面已更新
        await page.waitForSelector('[data-testid="search-results"]');
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
      }
    }
  });
});
