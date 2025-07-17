/**
 * UniversalContentEditor Playwright 完整測試套件
 * 測試統一內容編輯器的所有11個核心功能
 */
import { test, expect } from '@playwright/test';

test.describe('統一內容編輯器完整功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 設置視頻錄製
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1. 主頁可見性測試 - 統一內容編輯器入口', async ({ page }) => {
    // 測試主頁是否有統一內容編輯器的明顯入口
    await expect(page.locator('[data-testid="feature-universal-content-editor"]')).toBeVisible();
    await expect(page.locator('text=統一內容編輯器')).toBeVisible();

    // 檢查功能描述
    await expect(page.locator('text=一站式內容管理平台')).toBeVisible();

    // 檢查進入按鈕
    const enterButton = page.locator('[data-testid="universal-content-editor-link"]');
    await expect(enterButton).toBeVisible();
    await expect(enterButton).toBeEnabled();
  });

  test('2. 導航流程測試 - 從主頁到編輯器', async ({ page }) => {
    // 從主頁點擊進入統一內容編輯器
    await page.click('[data-testid="universal-content-editor-link"]');

    // 驗證頁面跳轉
    await expect(page).toHaveURL('/universal-game');
    await page.waitForLoadState('networkidle');

    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('統一內容編輯器');
  });

  test('3. 導航下拉菜單測試', async ({ page }) => {
    // 測試導航欄的內容編輯器下拉菜單
    const navButton = page.locator('[data-testid="nav-universal-content-editor"]');
    await expect(navButton).toBeVisible();
    
    // 懸停顯示下拉菜單
    await navButton.hover();
    await expect(page.locator('[data-testid="content-editor-dropdown"]')).toBeVisible();
    
    // 檢查下拉菜單中的所有功能
    const expectedFeatures = [
      'nav-rich-text-editor',
      'nav-multimedia-system', 
      'nav-voice-recording-system',
      'nav-gept-templates-system',
      'nav-realtime-collaboration-system',
      'nav-ai-content-generation-system',
      'nav-auto-save'
    ];
    
    for (const feature of expectedFeatures) {
      await expect(page.locator(`[data-testid="dropdown-${feature}"]`)).toBeVisible();
    }
  });

  test('4. 儀表板整合測試', async ({ page }) => {
    // 進入儀表板
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 檢查統一內容編輯器專區
    await expect(page.locator('[data-testid="universal-content-editor-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="universal-content-editor-dashboard"]')).toBeVisible();
    
    // 檢查統計數據
    await expect(page.locator('[data-testid="stat-documents"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-words"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-collaborations"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-versions"]')).toBeVisible();
    
    // 檢查功能統計
    await expect(page.locator('[data-testid="stat-media"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-voice"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-ai"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-gept"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-accessibility"]')).toBeVisible();
  });

  test('5. 富文本編輯器功能測試', async ({ page }) => {
    // 進入富文本編輯器
    await page.goto('/content/rich-text-editor');
    await page.waitForLoadState('networkidle');

    // 檢查頁面標題
    await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-title"]')).toContainText('富文本編輯器');

    // 檢查編輯器組件
    await expect(page.locator('[data-testid="main-rich-editor"]')).toBeVisible();

    // 檢查內容統計
    await expect(page.locator('[data-testid="content-length"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-size"]')).toBeVisible();

    // 檢查預覽切換按鈕
    await expect(page.locator('[data-testid="preview-toggle"]')).toBeVisible();
  });

  test('6. 多媒體支持系統測試', async ({ page }) => {
    // 進入多媒體管理頁面
    await page.goto('/content/multimedia');
    await page.waitForLoadState('networkidle');

    // 檢查頁面標題
    await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-title"]')).toContainText('多媒體支持系統');

    // 檢查標籤頁
    await expect(page.locator('[data-testid="upload-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="library-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-tab"]')).toBeVisible();

    // 檢查上傳器（默認標籤）
    await expect(page.locator('[data-testid="main-media-uploader"]')).toBeVisible();
  });

  test('7. 語音錄製系統測試', async ({ page }) => {
    // 進入語音錄製頁面
    await page.goto('/content/voice-recording');
    await page.waitForLoadState('networkidle');

    // 檢查頁面標題
    await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-title"]')).toContainText('語音錄製和編輯系統');

    // 檢查錄音標籤
    await expect(page.locator('[data-testid="record-tab"]')).toBeVisible();

    // 檢查主要語音錄製器
    await expect(page.locator('[data-testid="main-voice-recorder"]')).toBeVisible();

    // 檢查錄音統計
    await expect(page.locator('[data-testid="recording-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-recordings"]')).toBeVisible();
  });

  test('8. GEPT分級系統測試', async ({ page }) => {
    // 進入GEPT模板頁面
    await page.goto('/content/gept-templates');
    await page.waitForLoadState('networkidle');
    
    // 檢查GEPT模板管理器
    await expect(page.locator('[data-testid="main-template-manager"]')).toBeVisible();
    
    // 測試級別切換
    await page.click('[data-testid="level-elementary"]');
    await expect(page.locator('[data-testid="level-elementary"]')).toHaveClass(/active/);
    
    // 檢查詞彙瀏覽器
    await page.click('[data-testid="vocabulary-tab"]');
    await expect(page.locator('[data-testid="main-vocabulary-browser"]')).toBeVisible();
    
    // 檢查快速插入功能
    await page.click('[data-testid="quick-insert-tab"]');
    await expect(page.locator('[data-testid="quick-insert-panel"]')).toBeVisible();
  });

  test('9. 實時協作系統測試', async ({ page }) => {
    // 進入實時協作頁面
    await page.goto('/content/realtime-collaboration');
    await page.waitForLoadState('networkidle');
    
    // 檢查增強協作面板
    await expect(page.locator('[data-testid="enhanced-collaboration-panel"]')).toBeVisible();
    
    // 檢查協作狀態標籤
    await expect(page.locator('[data-testid="tab-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-conflicts"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-metrics"]')).toBeVisible();
    
    // 測試標籤切換
    await page.click('[data-testid="tab-activity"]');
    await page.click('[data-testid="tab-metrics"]');
    
    // 檢查快速操作按鈕
    await expect(page.locator('[data-testid="create-version-btn"]')).toBeVisible();
  });

  test('10. AI內容生成系統測試', async ({ page }) => {
    // 進入AI內容生成頁面
    await page.goto('/content/ai-content-generation');
    await page.waitForLoadState('networkidle');
    
    // 檢查AI內容生成器
    await expect(page.locator('[data-testid="ai-content-generator"]')).toBeVisible();
    
    // 檢查生成選項
    await expect(page.locator('[data-testid="content-type-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="target-level-selector"]')).toBeVisible();
    
    // 檢查生成按鈕
    await expect(page.locator('[data-testid="generate-content-btn"]')).toBeVisible();
    
    // 檢查預覽區域
    await expect(page.locator('[data-testid="content-preview"]')).toBeVisible();
  });

  test('11. 功能互動測試 - 跨功能整合', async ({ page }) => {
    // 測試從儀表板快速訪問各功能
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 測試快速操作連結
    const quickActions = [
      { testId: 'quick-rich-text', expectedUrl: '/content/rich-text-editor' },
      { testId: 'quick-gept', expectedUrl: '/content/gept-templates' },
      { testId: 'quick-collaboration', expectedUrl: '/content/realtime-collaboration' },
      { testId: 'quick-ai', expectedUrl: '/content/ai-content-generation' }
    ];
    
    for (const action of quickActions) {
      await page.click(`[data-testid="${action.testId}"]`);
      await expect(page).toHaveURL(action.expectedUrl);
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
  });

  test('12. 性能測試 - 頁面載入時間', async ({ page }) => {
    const startTime = Date.now();
    
    // 測試主要頁面的載入時間
    const pages = [
      '/universal-game',
      '/content/rich-text-editor',
      '/content/multimedia',
      '/content/voice-recording',
      '/content/gept-templates',
      '/content/realtime-collaboration',
      '/content/ai-content-generation'
    ];
    
    for (const pagePath of pages) {
      const pageStartTime = Date.now();
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      const pageLoadTime = Date.now() - pageStartTime;
      
      // 驗證頁面載入時間 < 5秒
      expect(pageLoadTime).toBeLessThan(5000);
      console.log(`頁面 ${pagePath} 載入時間: ${pageLoadTime}ms`);
    }
  });

  test('13. 無障礙性測試', async ({ page }) => {
    // 進入統一內容編輯器
    await page.goto('/universal-game');
    await page.waitForLoadState('networkidle');

    // 檢查頁面是否有適當的 ARIA 標籤
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // 檢查標題結構
    const h1 = page.locator('[data-testid="page-title"]');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('統一內容編輯器');

    // 測試鍵盤導航
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // 檢查功能卡片
    await expect(page.locator('[data-testid="feature-rich-text-editor"]')).toBeVisible();
  });

  test('14. 響應式設計測試', async ({ page }) => {
    // 測試不同螢幕尺寸
    const viewports = [
      { width: 1920, height: 1080, name: '桌面' },
      { width: 1024, height: 768, name: '平板' },
      { width: 375, height: 667, name: '手機' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/universal-game');
      await page.waitForLoadState('networkidle');
      
      // 檢查主要元素是否可見
      await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
      
      // 在手機尺寸下檢查手機菜單
      if (viewport.width < 768) {
        await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      }
      
      console.log(`${viewport.name} (${viewport.width}x${viewport.height}) 測試通過`);
    }
  });

  test('15. 錯誤處理測試', async ({ page }) => {
    // 測試不存在的頁面
    const response = await page.goto('/content/non-existent-page');

    // 檢查響應狀態或頁面內容
    const is404 = response?.status() === 404;
    const hasErrorText = await page.locator('text=404').isVisible().catch(() => false);
    const hasNotFoundText = await page.locator('text=Not Found').isVisible().catch(() => false);
    const isRedirected = page.url() !== 'http://localhost:3000/content/non-existent-page';

    // 任何一種錯誤處理方式都是可接受的
    expect(is404 || hasErrorText || hasNotFoundText || isRedirected).toBeTruthy();
  });
});

test.describe('統一內容編輯器整合驗證', () => {
  test('完整工作流程測試', async ({ page }) => {
    // 模擬完整的用戶工作流程
    
    // 1. 從主頁開始
    await page.goto('/');
    await expect(page.locator('[data-testid="feature-universal-content-editor"]')).toBeVisible();

    // 2. 進入儀表板查看統計
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="universal-content-editor-dashboard"]')).toBeVisible();

    // 3. 使用富文本編輯器創建內容
    await page.goto('/content/rich-text-editor');
    await expect(page.locator('[data-testid="main-rich-editor"]')).toBeVisible();

    // 4. 添加多媒體內容
    await page.goto('/content/multimedia');
    await expect(page.locator('[data-testid="main-media-uploader"]')).toBeVisible();

    // 5. 使用GEPT分級驗證
    await page.goto('/content/gept-templates');
    await expect(page.locator('[data-testid="main-template-manager"]')).toBeVisible();

    // 6. 啟用實時協作
    await page.goto('/content/realtime-collaboration');
    await expect(page.locator('[data-testid="enhanced-collaboration-panel"]')).toBeVisible();
    
    console.log('完整工作流程測試通過 ✅');
  });
});
