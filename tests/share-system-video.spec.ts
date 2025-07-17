/**
 * 完整分享系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('完整分享系統 - 生成測試影片', () => {
  test('完整分享系統三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整分享系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 驗證完整分享系統功能卡片存在
    await expect(page.getByTestId('feature-share-system')).toBeVisible();
    await expect(page.getByTestId('feature-share-system').locator('h3:has-text("完整分享系統")')).toBeVisible();
    await expect(page.locator('text=三層分享模式、連結管理、權限控制、社交媒體集成、嵌入代碼生成等完整功能')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('share-system-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("完整分享系統")')).toBeVisible();
    await expect(page.locator('text=三層分享模式、連結管理、權限控制、社交媒體集成、嵌入代碼生成等完整功能')).toBeVisible();
    
    // 驗證功能展示
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("三層分享")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("連結管理")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("權限控制")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("社交集成")').first()).toBeVisible();
    
    // 驗證三層分享模式展示
    await expect(page.locator('.bg-blue-50 h2:has-text("三層分享模式")')).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("公開分享")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("班級分享")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("私人分享")').first()).toBeVisible();
    
    // 驗證記憶科學整合
    await expect(page.locator('text=記憶科學整合')).toBeVisible();
    await expect(page.locator('text=社交學習促進')).toBeVisible();
    await expect(page.locator('text=記憶鞏固機制')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=等級適配分享')).toBeVisible();
    await expect(page.locator('text=分級權限管理')).toBeVisible();
    await expect(page.locator('text=跨等級協作')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 ShareSystemPanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試標籤切換
    console.log('📑 測試標籤切換功能');
    await expect(page.getByTestId('share-system-panel')).toBeVisible();
    await expect(page.getByTestId('create-tab')).toBeVisible();
    await expect(page.getByTestId('manage-tab')).toBeVisible();
    await expect(page.getByTestId('analytics-tab')).toBeVisible();
    await expect(page.getByTestId('settings-tab')).toBeVisible();
    
    // 測試創建分享標籤
    await page.getByTestId('create-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('create-content')).toBeVisible();
    await expect(page.getByTestId('create-content').locator('h3:has-text("創建分享")')).toBeVisible();
    
    // 選擇一個項目
    console.log('📋 測試項目選擇功能');
    await page.getByTestId('item-activity-1').click();
    await page.waitForTimeout(1000);
    
    // 測試分享模式選擇
    console.log('🌐 測試分享模式選擇');
    await expect(page.getByTestId('share-mode-public')).toBeVisible();
    await expect(page.getByTestId('share-mode-class')).toBeVisible();
    await expect(page.getByTestId('share-mode-private')).toBeVisible();
    
    // 選擇班級分享模式
    await page.getByTestId('share-mode-class').click();
    await page.waitForTimeout(500);
    
    // 測試權限設置
    console.log('🔒 測試權限設置');
    await expect(page.getByTestId('permission-view')).toBeVisible();
    await expect(page.getByTestId('permission-edit')).toBeVisible();
    await expect(page.getByTestId('permission-comment')).toBeVisible();
    await expect(page.getByTestId('permission-download')).toBeVisible();
    
    // 測試高級設置
    console.log('⚙️ 測試高級設置');
    await expect(page.getByTestId('require-password')).toBeVisible();
    await expect(page.getByTestId('allow-copy')).toBeVisible();
    await expect(page.getByTestId('track-views')).toBeVisible();
    await expect(page.getByTestId('enable-embed')).toBeVisible();
    await expect(page.getByTestId('enable-social')).toBeVisible();
    
    // 測試創建分享按鈕
    console.log('⚡ 測試創建分享按鈕');
    await expect(page.getByTestId('create-share-button')).toBeVisible();
    await expect(page.getByTestId('create-share-button')).toBeEnabled();
    
    // 測試管理分享標籤
    console.log('📊 測試管理分享功能');
    await page.getByTestId('manage-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('manage-content')).toBeVisible();
    await expect(page.getByTestId('manage-content').locator('h3:has-text("管理分享")')).toBeVisible();
    await expect(page.locator('text=總分享數')).toBeVisible();
    await expect(page.locator('text=活躍分享')).toBeVisible();
    await expect(page.locator('text=總瀏覽量')).toBeVisible();
    
    // 測試分享分析標籤
    console.log('📈 測試分享分析功能');
    await page.getByTestId('analytics-tab').click();
    await page.waitForTimeout(1000);
    
    // 測試分享設置標籤
    console.log('⚙️ 測試分享設置功能');
    await page.getByTestId('settings-tab').click();
    await page.waitForTimeout(1000);
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('share-system-panel')).toBeVisible();
    
    console.log('🎉 完整分享系統三層整合驗證完全成功！');
  });

  test('完整分享系統性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整分享系統性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3000/content/share-system');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 完整分享系統頁面載入時間: ${pageLoadTime}ms`);

    // 等待 ShareSystemPanel 載入
    await page.waitForTimeout(3000);

    // 測量標籤切換時間
    const createTabStart = Date.now();
    await page.getByTestId('create-tab').click();
    await page.waitForTimeout(1000);
    const createTabTime = Date.now() - createTabStart;
    console.log(`📊 創建標籤切換時間: ${createTabTime}ms`);

    const manageTabStart = Date.now();
    await page.getByTestId('manage-tab').click();
    await page.waitForTimeout(1000);
    const manageTabTime = Date.now() - manageTabStart;
    console.log(`📊 管理標籤切換時間: ${manageTabTime}ms`);

    const analyticsTabStart = Date.now();
    await page.getByTestId('analytics-tab').click();
    await page.waitForTimeout(1000);
    const analyticsTabTime = Date.now() - analyticsTabStart;
    console.log(`📊 分析標籤切換時間: ${analyticsTabTime}ms`);

    const settingsTabStart = Date.now();
    await page.getByTestId('settings-tab').click();
    await page.waitForTimeout(1000);
    const settingsTabTime = Date.now() - settingsTabStart;
    console.log(`📊 設置標籤切換時間: ${settingsTabTime}ms`);

    // 測量項目選擇時間
    await page.getByTestId('create-tab').click();
    const itemSelectStart = Date.now();
    await page.getByTestId('item-activity-1').click();
    await page.waitForTimeout(1000);
    const itemSelectTime = Date.now() - itemSelectStart;
    console.log(`📊 項目選擇時間: ${itemSelectTime}ms`);

    // 測量分享模式切換時間
    const shareModeStart = Date.now();
    await page.getByTestId('share-mode-class').click();
    await page.waitForTimeout(500);
    const shareModeTime = Date.now() - shareModeStart;
    console.log(`📊 分享模式切換時間: ${shareModeTime}ms`);

    // 測量權限設置時間
    const permissionStart = Date.now();
    await page.getByTestId('permission-edit').click();
    await page.waitForTimeout(500);
    const permissionTime = Date.now() - permissionStart;
    console.log(`📊 權限設置時間: ${permissionTime}ms`);

    // 測量高級設置時間
    const advancedStart = Date.now();
    await page.getByTestId('require-password').click();
    await page.waitForTimeout(500);
    const advancedTime = Date.now() - advancedStart;
    console.log(`📊 高級設置時間: ${advancedTime}ms`);

    console.log('🎉 完整分享系統性能測試完成！');
  });
});
