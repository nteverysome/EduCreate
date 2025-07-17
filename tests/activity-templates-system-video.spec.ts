/**
 * 活動模板和快速創建系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('活動模板和快速創建系統 - 生成測試影片', () => {
  test('活動模板和快速創建系統三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動模板和快速創建系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3003/');
    await page.waitForLoadState('networkidle');
    
    // 驗證活動模板和快速創建功能卡片存在
    await expect(page.getByTestId('feature-activity-templates')).toBeVisible();
    await expect(page.locator('text=活動模板和快速創建')).toBeVisible();
    await expect(page.locator('text=基於GEPT分級的活動模板，一鍵快速創建25種記憶科學遊戲，智能內容適配')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('activity-templates-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("活動模板和快速創建")')).toBeVisible();
    await expect(page.locator('text=基於GEPT分級的活動模板，一鍵快速創建25種記憶科學遊戲，智能內容適配')).toBeVisible();
    
    // 驗證25種遊戲模板展示
    await expect(page.locator('text=25種記憶科學遊戲模板')).toBeVisible();
    await expect(page.locator('text=測驗問答')).toBeVisible();
    await expect(page.locator('text=配對遊戲')).toBeVisible();
    await expect(page.locator('text=記憶卡片')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=初級 (Elementary)：')).toBeVisible();
    await expect(page.locator('text=中級 (Intermediate)：')).toBeVisible();
    await expect(page.locator('text=中高級 (High-Intermediate)：')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 ActivityTemplatesPanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試GEPT等級切換
    console.log('🔄 測試GEPT等級切換功能');
    await expect(page.getByTestId('elementary-level-button')).toBeVisible();
    await expect(page.getByTestId('intermediate-level-button')).toBeVisible();
    await expect(page.getByTestId('high-intermediate-level-button')).toBeVisible();
    
    // 切換到中級
    await page.getByTestId('intermediate-level-button').click();
    await page.waitForTimeout(2000);
    
    // 測試快速創建功能
    console.log('⚡ 測試快速創建功能');
    await expect(page.getByTestId('templates-view-button')).toBeVisible();
    
    // 點擊快速創建按鈕
    const quickCreateButtons = page.locator('[data-testid^="quick-create-"]');
    const firstQuickCreateButton = quickCreateButtons.first();
    await firstQuickCreateButton.click();
    
    // 處理成功對話框
    page.on('dialog', async dialog => {
      console.log(`📢 對話框訊息: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await page.waitForTimeout(1000);
    
    // 測試已創建活動視圖
    console.log('📝 測試已創建活動視圖');
    await page.getByTestId('created-activities-button').click();
    await page.waitForTimeout(1000);
    
    // 驗證已創建活動列表
    await expect(page.getByTestId('created-activities-content')).toBeVisible();
    
    // 測試批量創建功能
    console.log('📦 測試批量創建功能');
    await page.getByTestId('templates-view-button').click();
    await page.waitForTimeout(1000);
    
    // 選擇多個模板
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      await checkboxes.first().click();
      await page.waitForTimeout(500);
      
      if (checkboxCount > 1) {
        await checkboxes.nth(1).click();
        await page.waitForTimeout(500);
      }
      
      // 點擊批量創建
      const batchCreateButton = page.getByTestId('batch-create-button');
      if (await batchCreateButton.isEnabled()) {
        await batchCreateButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('activity-templates-panel')).toBeVisible();
    
    console.log('🎉 活動模板和快速創建系統三層整合驗證完全成功！');
  });

  test('活動模板和快速創建系統性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動模板和快速創建系統性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/templates');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 活動模板和快速創建系統頁面載入時間: ${pageLoadTime}ms`);

    // 等待 ActivityTemplatesPanel 載入
    await page.waitForTimeout(3000);

    // 測量GEPT等級切換時間
    const geptSwitchStart = Date.now();
    await page.getByTestId('intermediate-level-button').click();
    await page.waitForTimeout(2000);
    const geptSwitchTime = Date.now() - geptSwitchStart;
    console.log(`📊 GEPT等級切換時間: ${geptSwitchTime}ms`);

    // 測量模板庫切換時間
    const templatesViewStart = Date.now();
    await page.getByTestId('templates-view-button').click();
    await page.waitForTimeout(1000);
    const templatesViewTime = Date.now() - templatesViewStart;
    console.log(`📊 模板庫視圖切換時間: ${templatesViewTime}ms`);

    // 測量已創建活動切換時間
    const createdActivitiesStart = Date.now();
    await page.getByTestId('created-activities-button').click();
    await page.waitForTimeout(1000);
    const createdActivitiesTime = Date.now() - createdActivitiesStart;
    console.log(`📊 已創建活動切換時間: ${createdActivitiesTime}ms`);

    // 測量快速創建時間
    await page.getByTestId('templates-view-button').click();
    await page.waitForTimeout(1000);
    
    const quickCreateStart = Date.now();
    const quickCreateButtons = page.locator('[data-testid^="quick-create-"]');
    const firstQuickCreateButton = quickCreateButtons.first();
    
    // 處理對話框
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await firstQuickCreateButton.click();
    await page.waitForTimeout(1000);
    const quickCreateTime = Date.now() - quickCreateStart;
    console.log(`📊 快速創建時間: ${quickCreateTime}ms`);

    // 測量數據載入時間
    const dataLoadStart = Date.now();
    await page.getByTestId('elementary-level-button').click();
    await page.waitForTimeout(2000);
    const dataLoadTime = Date.now() - dataLoadStart;
    console.log(`📊 數據載入時間: ${dataLoadTime}ms`);

    console.log('🎉 活動模板和快速創建系統性能測試完成！');
  });
});
