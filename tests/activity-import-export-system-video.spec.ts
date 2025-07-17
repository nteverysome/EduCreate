/**
 * 活動導入導出功能系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('活動導入導出功能系統 - 生成測試影片', () => {
  test('活動導入導出功能三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動導入導出功能系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3003/');
    await page.waitForLoadState('networkidle');
    
    // 驗證活動導入導出功能卡片存在 - 使用更精確的選擇器避免 strict mode violation
    await expect(page.getByTestId('feature-activity-import-export')).toBeVisible();
    await expect(page.getByTestId('feature-activity-import-export').locator('h3:has-text("活動導入導出功能")')).toBeVisible();
    await expect(page.locator('text=支持多種格式的活動導入導出，批量處理，輕鬆遷移和分享學習內容')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('activity-import-export-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("活動導入導出功能")')).toBeVisible();
    await expect(page.locator('text=支持多種格式的活動導入導出，批量處理，輕鬆遷移和分享學習內容')).toBeVisible();
    
    // 驗證功能展示
    await expect(page.locator('text=多格式導入')).toBeVisible();
    await expect(page.locator('text=多格式導出')).toBeVisible();
    await expect(page.locator('text=批量處理')).toBeVisible();
    
    // 驗證支持格式展示
    await expect(page.locator('text=支持的文件格式')).toBeVisible();
    await expect(page.locator('text=JSON')).toBeVisible();
    await expect(page.locator('text=CSV')).toBeVisible();
    await expect(page.locator('text=Wordwall')).toBeVisible();
    await expect(page.locator('text=ZIP')).toBeVisible();
    
    // 驗證記憶科學整合
    await expect(page.locator('text=記憶科學整合')).toBeVisible();
    await expect(page.locator('text=導入時的記憶科學處理')).toBeVisible();
    await expect(page.locator('text=導出時的記憶科學保持')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=導入時的等級處理')).toBeVisible();
    await expect(page.locator('text=導出時的等級保持')).toBeVisible();
    await expect(page.locator('text=等級轉換功能')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 ActivityImportExportPanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試導入標籤
    console.log('📥 測試導入功能');
    await expect(page.getByTestId('import-tab')).toBeVisible();
    await expect(page.getByTestId('export-tab')).toBeVisible();
    
    // 確保導入標籤是激活的
    await page.getByTestId('import-tab').click();
    await page.waitForTimeout(1000);
    
    // 驗證導入功能元素
    await expect(page.getByTestId('import-content')).toBeVisible();
    await expect(page.getByTestId('file-input')).toBeAttached();
    await expect(page.getByTestId('select-files-button')).toBeVisible();
    
    // 測試導出標籤
    console.log('📤 測試導出功能');
    await page.getByTestId('export-tab').click();
    await page.waitForTimeout(1000);
    
    // 驗證導出功能元素
    await expect(page.getByTestId('export-content')).toBeVisible();
    await expect(page.getByTestId('export-format-select')).toBeVisible();
    await expect(page.getByTestId('include-progress-checkbox')).toBeVisible();
    await expect(page.getByTestId('include-gept-checkbox')).toBeVisible();
    await expect(page.getByTestId('include-memory-science-checkbox')).toBeVisible();
    
    // 測試活動選擇功能
    console.log('✅ 測試活動選擇功能');
    await expect(page.getByTestId('select-all-button')).toBeVisible();
    await expect(page.getByTestId('clear-selection-button')).toBeVisible();
    await expect(page.getByTestId('export-button')).toBeVisible();
    
    // 測試全選功能
    await page.getByTestId('select-all-button').click();
    await page.waitForTimeout(500);
    
    // 測試導出按鈕
    await page.getByTestId('export-button').click();
    await page.waitForTimeout(2000);
    
    // 處理可能的下載對話框
    page.on('dialog', async dialog => {
      console.log(`📢 對話框訊息: ${dialog.message()}`);
      await dialog.accept();
    });
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('activity-import-export-panel')).toBeVisible();
    
    console.log('🎉 活動導入導出功能三層整合驗證完全成功！');
  });

  test('活動導入導出功能性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動導入導出功能性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/import-export');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 活動導入導出功能頁面載入時間: ${pageLoadTime}ms`);

    // 等待 ActivityImportExportPanel 載入
    await page.waitForTimeout(3000);

    // 測量標籤切換時間
    const importTabStart = Date.now();
    await page.getByTestId('import-tab').click();
    await page.waitForTimeout(1000);
    const importTabTime = Date.now() - importTabStart;
    console.log(`📊 導入標籤切換時間: ${importTabTime}ms`);

    const exportTabStart = Date.now();
    await page.getByTestId('export-tab').click();
    await page.waitForTimeout(1000);
    const exportTabTime = Date.now() - exportTabStart;
    console.log(`📊 導出標籤切換時間: ${exportTabTime}ms`);

    // 測量全選功能時間
    const selectAllStart = Date.now();
    await page.getByTestId('select-all-button').click();
    await page.waitForTimeout(500);
    const selectAllTime = Date.now() - selectAllStart;
    console.log(`📊 全選功能時間: ${selectAllTime}ms`);

    // 測量清除選擇時間
    const clearSelectionStart = Date.now();
    await page.getByTestId('clear-selection-button').click();
    await page.waitForTimeout(500);
    const clearSelectionTime = Date.now() - clearSelectionStart;
    console.log(`📊 清除選擇時間: ${clearSelectionTime}ms`);

    // 測量導出選項變更時間
    const formatChangeStart = Date.now();
    await page.getByTestId('export-format-select').selectOption('csv');
    await page.waitForTimeout(500);
    const formatChangeTime = Date.now() - formatChangeStart;
    console.log(`📊 導出格式變更時間: ${formatChangeTime}ms`);

    // 測量複選框切換時間
    const checkboxStart = Date.now();
    await page.getByTestId('include-progress-checkbox').click();
    await page.waitForTimeout(500);
    const checkboxTime = Date.now() - checkboxStart;
    console.log(`📊 複選框切換時間: ${checkboxTime}ms`);

    console.log('🎉 活動導入導出功能性能測試完成！');
  });
});
