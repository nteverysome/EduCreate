/**
 * 活動複製和模板化系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('活動複製和模板化系統 - 生成測試影片', () => {
  test('活動複製和模板化三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動複製和模板化系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3003/');
    await page.waitForLoadState('networkidle');
    
    // 驗證活動複製和模板化功能卡片存在
    await expect(page.getByTestId('feature-activity-copy-template')).toBeVisible();
    await expect(page.getByTestId('feature-activity-copy-template').locator('h3:has-text("活動複製和模板化")')).toBeVisible();
    await expect(page.locator('text=智能內容適配，一鍵複製活動，創建個人化模板，跨等級內容轉換')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('activity-copy-template-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("活動複製和模板化")')).toBeVisible();
    await expect(page.locator('text=智能內容適配，一鍵複製活動，創建個人化模板，跨等級內容轉換')).toBeVisible();
    
    // 驗證功能展示
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("一鍵複製")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("智能適配")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("模板創建")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("跨等級轉換")')).toBeVisible();
    
    // 驗證複製類型展示 - 使用更精確的選擇器避免 strict mode violation
    await expect(page.locator('.bg-blue-50 h2:has-text("複製類型")')).toBeVisible();
    await expect(page.locator('text=完整複製')).toBeVisible();
    await expect(page.locator('text=結構複製')).toBeVisible();
    await expect(page.locator('text=適配複製')).toBeVisible();
    await expect(page.locator('text=模板複製')).toBeVisible();
    
    // 驗證記憶科學整合
    await expect(page.locator('text=記憶科學整合')).toBeVisible();
    await expect(page.locator('text=複製時的記憶科學保持')).toBeVisible();
    await expect(page.locator('text=模板化的記憶優化')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=等級檢測和分析')).toBeVisible();
    await expect(page.locator('text=跨等級轉換')).toBeVisible();
    await expect(page.locator('text=模板等級管理')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 ActivityCopyTemplatePanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試標籤切換
    console.log('📑 測試標籤切換功能');
    await expect(page.getByTestId('activity-copy-template-panel')).toBeVisible();
    await expect(page.getByTestId('copy-tab')).toBeVisible();
    await expect(page.getByTestId('template-tab')).toBeVisible();
    await expect(page.getByTestId('my-templates-tab')).toBeVisible();
    
    // 測試複製活動標籤
    await page.getByTestId('copy-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('copy-content')).toBeVisible();
    await expect(page.locator('text=選擇要複製的活動')).toBeVisible();
    
    // 選擇一個活動
    console.log('📋 測試活動選擇功能');
    await page.getByTestId('activity-act-1').click();
    await page.waitForTimeout(1000);
    
    // 測試複製類型選擇
    console.log('🎯 測試複製類型選擇');
    await expect(page.getByTestId('copy-type-complete')).toBeVisible();
    await expect(page.getByTestId('copy-type-structure')).toBeVisible();
    await expect(page.getByTestId('copy-type-adaptive')).toBeVisible();
    await expect(page.getByTestId('copy-type-template')).toBeVisible();
    
    // 測試適配複製
    await page.getByTestId('copy-type-adaptive').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('target-gept-level')).toBeVisible();
    
    // 選擇目標等級
    await page.getByTestId('target-gept-level').selectOption('intermediate');
    await page.waitForTimeout(500);
    
    // 測試適配設置
    await expect(page.getByTestId('preserve-memory-science')).toBeVisible();
    await expect(page.getByTestId('adjust-difficulty')).toBeVisible();
    await expect(page.getByTestId('convert-vocabulary')).toBeVisible();
    await expect(page.getByTestId('maintain-structure')).toBeVisible();
    
    // 測試模板複製
    console.log('📚 測試模板複製功能');
    await page.getByTestId('copy-type-template').click();
    await page.waitForTimeout(1000);
    
    await expect(page.getByTestId('template-name')).toBeVisible();
    await expect(page.getByTestId('template-description')).toBeVisible();
    await expect(page.getByTestId('template-public')).toBeVisible();
    
    // 填寫模板信息
    await page.getByTestId('template-name').fill('測試模板');
    await page.getByTestId('template-description').fill('這是一個測試模板');
    await page.waitForTimeout(500);
    
    // 測試複製按鈕
    console.log('⚡ 測試複製按鈕');
    await expect(page.getByTestId('copy-button')).toBeVisible();
    await expect(page.getByTestId('copy-button')).toBeEnabled();
    
    // 測試我的模板標籤
    console.log('🗂️ 測試我的模板功能');
    await page.getByTestId('my-templates-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('my-templates-content')).toBeVisible();
    await expect(page.locator('text=我的模板')).toBeVisible();
    await expect(page.locator('text=總模板數')).toBeVisible();
    await expect(page.locator('text=公開模板')).toBeVisible();
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('activity-copy-template-panel')).toBeVisible();
    
    console.log('🎉 活動複製和模板化三層整合驗證完全成功！');
  });

  test('活動複製和模板化性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動複製和模板化性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/copy-template');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 活動複製和模板化頁面載入時間: ${pageLoadTime}ms`);

    // 等待 ActivityCopyTemplatePanel 載入
    await page.waitForTimeout(3000);

    // 測量標籤切換時間
    const copyTabStart = Date.now();
    await page.getByTestId('copy-tab').click();
    await page.waitForTimeout(1000);
    const copyTabTime = Date.now() - copyTabStart;
    console.log(`📊 複製標籤切換時間: ${copyTabTime}ms`);

    const templateTabStart = Date.now();
    await page.getByTestId('template-tab').click();
    await page.waitForTimeout(1000);
    const templateTabTime = Date.now() - templateTabStart;
    console.log(`📊 模板標籤切換時間: ${templateTabTime}ms`);

    const myTemplatesTabStart = Date.now();
    await page.getByTestId('my-templates-tab').click();
    await page.waitForTimeout(1000);
    const myTemplatesTabTime = Date.now() - myTemplatesTabStart;
    console.log(`📊 我的模板標籤切換時間: ${myTemplatesTabTime}ms`);

    // 測量活動選擇時間
    await page.getByTestId('copy-tab').click();
    const activitySelectStart = Date.now();
    await page.getByTestId('activity-act-1').click();
    await page.waitForTimeout(1000);
    const activitySelectTime = Date.now() - activitySelectStart;
    console.log(`📊 活動選擇時間: ${activitySelectTime}ms`);

    // 測量複製類型切換時間
    const copyTypeStart = Date.now();
    await page.getByTestId('copy-type-adaptive').click();
    await page.waitForTimeout(1000);
    const copyTypeTime = Date.now() - copyTypeStart;
    console.log(`📊 複製類型切換時間: ${copyTypeTime}ms`);

    // 測量目標等級選擇時間
    const levelSelectStart = Date.now();
    await page.getByTestId('target-gept-level').selectOption('intermediate');
    await page.waitForTimeout(500);
    const levelSelectTime = Date.now() - levelSelectStart;
    console.log(`📊 目標等級選擇時間: ${levelSelectTime}ms`);

    // 測量模板設置時間
    await page.getByTestId('copy-type-template').click();
    const templateSetupStart = Date.now();
    await page.getByTestId('template-name').fill('性能測試模板');
    await page.getByTestId('template-description').fill('這是性能測試模板');
    await page.waitForTimeout(500);
    const templateSetupTime = Date.now() - templateSetupStart;
    console.log(`📊 模板設置時間: ${templateSetupTime}ms`);

    console.log('🎉 活動複製和模板化性能測試完成！');
  });
});
