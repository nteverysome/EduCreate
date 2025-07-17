/**
 * 完整縮圖和預覽系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('完整縮圖和預覽系統 - 生成測試影片', () => {
  test('完整縮圖和預覽系統三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整縮圖和預覽系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 驗證完整縮圖和預覽系統功能卡片存在
    await expect(page.getByTestId('feature-thumbnail-preview')).toBeVisible();
    await expect(page.getByTestId('feature-thumbnail-preview').locator('h3:has-text("完整縮圖和預覽系統")')).toBeVisible();
    await expect(page.locator('text=400px標準縮圖、多尺寸支持、CDN集成、懶加載、批量管理等完整功能')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('thumbnail-preview-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("完整縮圖和預覽系統")')).toBeVisible();
    await expect(page.locator('text=400px標準縮圖、多尺寸支持、CDN集成、懶加載、批量管理等完整功能')).toBeVisible();
    
    // 驗證功能展示
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("400px標準")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("多尺寸支持")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("CDN集成")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("懶加載")')).toBeVisible();
    
    // 驗證縮圖尺寸展示 - 使用 .first() 避免 strict mode violation
    await expect(page.locator('.bg-blue-50 h2:has-text("支持的縮圖尺寸")')).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("100px")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("200px")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("400px")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("800px")').first()).toBeVisible();
    
    // 驗證記憶科學整合
    await expect(page.locator('text=記憶科學整合')).toBeVisible();
    await expect(page.locator('text=視覺記憶優化')).toBeVisible();
    await expect(page.locator('text=認知負荷管理')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=等級視覺標識')).toBeVisible();
    await expect(page.locator('text=內容預覽優化')).toBeVisible();
    await expect(page.locator('text=個人化縮圖')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 ThumbnailPreviewPanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試標籤切換
    console.log('📑 測試標籤切換功能');
    await expect(page.getByTestId('thumbnail-preview-panel')).toBeVisible();
    await expect(page.getByTestId('upload-tab')).toBeVisible();
    await expect(page.getByTestId('manage-tab')).toBeVisible();
    await expect(page.getByTestId('settings-tab')).toBeVisible();
    
    // 測試上傳圖像標籤
    await page.getByTestId('upload-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('upload-content')).toBeVisible();
    await expect(page.getByTestId('upload-content').locator('h3:has-text("上傳圖像")')).toBeVisible();
    await expect(page.getByTestId('file-input')).toBeAttached();
    await expect(page.getByTestId('select-files-button')).toBeVisible();
    
    // 測試上傳設置
    console.log('⚙️ 測試上傳設置');
    await expect(page.getByTestId('quality-select')).toBeVisible();
    await expect(page.getByTestId('format-select')).toBeVisible();
    await expect(page.getByTestId('enable-cdn')).toBeVisible();
    await expect(page.getByTestId('enable-lazy-loading')).toBeVisible();
    
    // 測試縮圖管理標籤
    console.log('🖼️ 測試縮圖管理功能');
    await page.getByTestId('manage-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('manage-content')).toBeVisible();
    await expect(page.getByTestId('manage-content').locator('h3:has-text("縮圖管理")')).toBeVisible();
    
    // 測試批量操作
    await expect(page.getByTestId('select-all-button')).toBeVisible();
    await expect(page.getByTestId('clear-selection-button')).toBeVisible();
    await expect(page.getByTestId('batch-regenerate-button')).toBeVisible();
    
    // 測試全選功能
    await page.getByTestId('select-all-button').click();
    await page.waitForTimeout(500);
    
    // 測試系統設置標籤
    console.log('⚙️ 測試系統設置功能');
    await page.getByTestId('settings-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('settings-content')).toBeVisible();
    await expect(page.getByTestId('settings-content').locator('h3:has-text("系統設置")')).toBeVisible();
    
    // 測試壓縮設置
    await expect(page.getByTestId('compression-slider')).toBeVisible();
    await expect(page.getByTestId('settings-content').locator('text=系統統計')).toBeVisible();
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('thumbnail-preview-panel')).toBeVisible();
    
    console.log('🎉 完整縮圖和預覽系統三層整合驗證完全成功！');
  });

  test('完整縮圖和預覽系統性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整縮圖和預覽系統性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3000/content/thumbnail-preview');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 完整縮圖和預覽系統頁面載入時間: ${pageLoadTime}ms`);

    // 等待 ThumbnailPreviewPanel 載入
    await page.waitForTimeout(3000);

    // 測量標籤切換時間
    const uploadTabStart = Date.now();
    await page.getByTestId('upload-tab').click();
    await page.waitForTimeout(1000);
    const uploadTabTime = Date.now() - uploadTabStart;
    console.log(`📊 上傳標籤切換時間: ${uploadTabTime}ms`);

    const manageTabStart = Date.now();
    await page.getByTestId('manage-tab').click();
    await page.waitForTimeout(1000);
    const manageTabTime = Date.now() - manageTabStart;
    console.log(`📊 管理標籤切換時間: ${manageTabTime}ms`);

    const settingsTabStart = Date.now();
    await page.getByTestId('settings-tab').click();
    await page.waitForTimeout(1000);
    const settingsTabTime = Date.now() - settingsTabStart;
    console.log(`📊 設置標籤切換時間: ${settingsTabTime}ms`);

    // 測量設置調整時間
    const compressionStart = Date.now();
    await page.getByTestId('compression-slider').fill('60');
    await page.waitForTimeout(500);
    const compressionTime = Date.now() - compressionStart;
    console.log(`📊 壓縮設置調整時間: ${compressionTime}ms`);

    // 測量批量操作時間
    await page.getByTestId('manage-tab').click();
    const selectAllStart = Date.now();
    await page.getByTestId('select-all-button').click();
    await page.waitForTimeout(500);
    const selectAllTime = Date.now() - selectAllStart;
    console.log(`📊 全選操作時間: ${selectAllTime}ms`);

    const clearSelectionStart = Date.now();
    await page.getByTestId('clear-selection-button').click();
    await page.waitForTimeout(500);
    const clearSelectionTime = Date.now() - clearSelectionStart;
    console.log(`📊 清除選擇時間: ${clearSelectionTime}ms`);

    // 測量上傳設置時間
    await page.getByTestId('upload-tab').click();
    const qualitySelectStart = Date.now();
    await page.getByTestId('quality-select').selectOption('ultra');
    await page.waitForTimeout(500);
    const qualitySelectTime = Date.now() - qualitySelectStart;
    console.log(`📊 質量選擇時間: ${qualitySelectTime}ms`);

    const formatSelectStart = Date.now();
    await page.getByTestId('format-select').selectOption('avif');
    await page.waitForTimeout(500);
    const formatSelectTime = Date.now() - formatSelectStart;
    console.log(`📊 格式選擇時間: ${formatSelectTime}ms`);

    console.log('🎉 完整縮圖和預覽系統性能測試完成！');
  });
});
