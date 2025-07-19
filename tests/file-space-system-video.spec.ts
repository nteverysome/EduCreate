/**
 * 完整檔案空間系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('完整檔案空間系統 - 生成測試影片', () => {
  test('完整檔案空間系統三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整檔案空間系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 驗證完整檔案空間系統功能卡片存在
    await expect(page.getByTestId('feature-file-space-system')).toBeVisible();
    await expect(page.getByTestId('feature-file-space-system').locator('h3:has-text("完整檔案空間系統")')).toBeVisible();
    await expect(page.locator('text=嵌套檔案夾結構、權限系統、高級搜索、批量操作、智能排序等完整功能')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('file-space-system-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("完整檔案空間系統")')).toBeVisible();
    await expect(page.locator('text=嵌套檔案夾結構、權限系統、高級搜索、批量操作、智能排序等完整功能')).toBeVisible();
    
    // 驗證功能展示
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("嵌套結構")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("權限系統")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("高級搜索")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("批量操作")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("智能排序")').first()).toBeVisible();
    
    // 驗證檔案夾自定義功能
    await expect(page.locator('.bg-blue-50 h2:has-text("檔案夾自定義功能")')).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("顏色自定義")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("圖標自定義")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("模板系統")').first()).toBeVisible();
    
    // 驗證智能排序功能
    await expect(page.locator('.bg-green-50 h2:has-text("智能排序功能")')).toBeVisible();
    await expect(page.locator('.bg-green-50 h3:has-text("基礎排序")')).toBeVisible();
    await expect(page.locator('.bg-green-50 h3:has-text("智能排序")')).toBeVisible();
    await expect(page.locator('.bg-green-50 h3:has-text("自定義排序")')).toBeVisible();
    
    // 驗證統計和分析功能
    await expect(page.locator('.bg-purple-50 h2:has-text("統計和分析功能")')).toBeVisible();
    await expect(page.locator('text=檔案夾統計')).toBeVisible();
    await expect(page.locator('text=學習數據分析')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 FileSpaceManager 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試標籤切換
    console.log('📑 測試標籤切換功能');
    await expect(page.getByTestId('file-space-manager')).toBeVisible();
    await expect(page.getByTestId('browser-tab')).toBeVisible();
    await expect(page.getByTestId('search-tab')).toBeVisible();
    await expect(page.getByTestId('batch-tab')).toBeVisible();
    await expect(page.getByTestId('stats-tab')).toBeVisible();
    
    // 測試檔案瀏覽標籤
    await page.getByTestId('browser-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('browser-content')).toBeVisible();
    await expect(page.getByTestId('browser-content').locator('h3:has-text("檔案瀏覽器")')).toBeVisible();
    
    // 測試視圖模式切換
    console.log('👁️ 測試視圖模式切換');
    await expect(page.getByTestId('view-list')).toBeVisible();
    await expect(page.getByTestId('view-grid')).toBeVisible();
    await expect(page.getByTestId('view-tree')).toBeVisible();
    
    // 切換到網格視圖
    await page.getByTestId('view-grid').click();
    await page.waitForTimeout(500);
    
    // 測試排序功能
    console.log('🔄 測試排序功能');
    await expect(page.getByTestId('sort-select')).toBeVisible();
    await page.getByTestId('sort-select').selectOption('date-desc');
    await page.waitForTimeout(500);
    
    // 測試全選功能
    console.log('☑️ 測試全選功能');
    await expect(page.getByTestId('select-all')).toBeVisible();
    await page.getByTestId('select-all').click();
    await page.waitForTimeout(500);
    
    // 測試高級搜索標籤
    console.log('🔍 測試高級搜索功能');
    await page.getByTestId('search-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('search-content')).toBeVisible();
    await expect(page.getByTestId('search-content').locator('h3:has-text("高級搜索")')).toBeVisible();
    
    // 測試搜索表單
    await expect(page.getByTestId('search-query')).toBeVisible();
    await expect(page.getByTestId('search-type')).toBeVisible();
    await expect(page.getByTestId('search-date')).toBeVisible();
    await expect(page.getByTestId('search-share-mode')).toBeVisible();
    
    // 填寫搜索條件
    await page.getByTestId('search-query').fill('英語');
    await page.getByTestId('search-type').selectOption('file');
    await page.getByTestId('search-date').selectOption('month');
    await page.getByTestId('search-share-mode').selectOption('public');
    
    // 執行搜索
    await page.getByTestId('search-button').click();
    await page.waitForTimeout(1000);
    
    // 測試批量操作標籤
    console.log('📦 測試批量操作功能');
    await page.getByTestId('batch-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('batch-content')).toBeVisible();
    await expect(page.getByTestId('batch-content').locator('h3:has-text("批量操作")')).toBeVisible();
    
    // 回到檔案瀏覽器選擇項目
    await page.getByTestId('browser-tab').click();
    await page.waitForTimeout(500);
    
    // 選擇一些項目
    await page.getByTestId('select-folder-1').click();
    await page.getByTestId('select-file-1').click();
    await page.waitForTimeout(500);
    
    // 回到批量操作
    await page.getByTestId('batch-tab').click();
    await page.waitForTimeout(500);
    
    // 測試批量操作按鈕
    await expect(page.getByTestId('batch-move')).toBeVisible();
    await expect(page.getByTestId('batch-copy')).toBeVisible();
    await expect(page.getByTestId('batch-delete')).toBeVisible();
    await expect(page.getByTestId('batch-share')).toBeVisible();
    await expect(page.getByTestId('batch-tag')).toBeVisible();
    
    // 測試統計分析標籤
    console.log('📊 測試統計分析功能');
    await page.getByTestId('stats-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('stats-content')).toBeVisible();
    await expect(page.getByTestId('stats-content').locator('h3:has-text("統計分析")')).toBeVisible();
    await expect(page.locator('text=整體統計')).toBeVisible();
    await expect(page.locator('text=總項目數').first()).toBeVisible();
    await expect(page.locator('text=檔案夾數').first()).toBeVisible();
    await expect(page.locator('text=使用頻率統計')).toBeVisible();
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('file-space-manager')).toBeVisible();
    
    console.log('🎉 完整檔案空間系統三層整合驗證完全成功！');
  });

  test('完整檔案空間系統性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整檔案空間系統性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3000/file-space');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 完整檔案空間系統頁面載入時間: ${pageLoadTime}ms`);

    // 等待 FileSpaceManager 載入
    await page.waitForTimeout(3000);

    // 測量標籤切換時間
    const browserTabStart = Date.now();
    await page.getByTestId('browser-tab').click();
    await page.waitForTimeout(1000);
    const browserTabTime = Date.now() - browserTabStart;
    console.log(`📊 瀏覽標籤切換時間: ${browserTabTime}ms`);

    const searchTabStart = Date.now();
    await page.getByTestId('search-tab').click();
    await page.waitForTimeout(1000);
    const searchTabTime = Date.now() - searchTabStart;
    console.log(`📊 搜索標籤切換時間: ${searchTabTime}ms`);

    const batchTabStart = Date.now();
    await page.getByTestId('batch-tab').click();
    await page.waitForTimeout(1000);
    const batchTabTime = Date.now() - batchTabStart;
    console.log(`📊 批量標籤切換時間: ${batchTabTime}ms`);

    const statsTabStart = Date.now();
    await page.getByTestId('stats-tab').click();
    await page.waitForTimeout(1000);
    const statsTabTime = Date.now() - statsTabStart;
    console.log(`📊 統計標籤切換時間: ${statsTabTime}ms`);

    // 測量視圖切換時間
    await page.getByTestId('browser-tab').click();
    const viewGridStart = Date.now();
    await page.getByTestId('view-grid').click();
    await page.waitForTimeout(500);
    const viewGridTime = Date.now() - viewGridStart;
    console.log(`📊 網格視圖切換時間: ${viewGridTime}ms`);

    const viewTreeStart = Date.now();
    await page.getByTestId('view-tree').click();
    await page.waitForTimeout(500);
    const viewTreeTime = Date.now() - viewTreeStart;
    console.log(`📊 樹狀視圖切換時間: ${viewTreeTime}ms`);

    // 測量排序時間
    const sortStart = Date.now();
    await page.getByTestId('sort-select').selectOption('date-desc');
    await page.waitForTimeout(500);
    const sortTime = Date.now() - sortStart;
    console.log(`📊 排序操作時間: ${sortTime}ms`);

    // 測量搜索時間
    await page.getByTestId('search-tab').click();
    const searchStart = Date.now();
    await page.getByTestId('search-query').fill('測試');
    await page.getByTestId('search-button').click();
    await page.waitForTimeout(1000);
    const searchTime = Date.now() - searchStart;
    console.log(`📊 搜索執行時間: ${searchTime}ms`);

    console.log('🎉 完整檔案空間系統性能測試完成！');
  });
});
