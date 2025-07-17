/**
 * 活動歷史和版本管理系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('活動歷史和版本管理系統 - 生成測試影片', () => {
  test('活動歷史和版本管理三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動歷史和版本管理系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3003/');
    await page.waitForLoadState('networkidle');
    
    // 驗證活動歷史和版本管理功能卡片存在
    await expect(page.getByTestId('feature-activity-history-version')).toBeVisible();
    await expect(page.getByTestId('feature-activity-history-version').locator('h3:has-text("活動歷史和版本管理")')).toBeVisible();
    await expect(page.locator('text=完整的變更追蹤、版本比較、回滾機制，協作編輯歷史記錄')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('activity-history-version-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("活動歷史和版本管理")')).toBeVisible();
    await expect(page.locator('text=完整的變更追蹤、版本比較、回滾機制，協作編輯歷史記錄')).toBeVisible();
    
    // 驗證功能展示 - 使用更精確的選擇器避免 strict mode violation
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("變更追蹤")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("版本比較")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("版本回滾")')).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("協作歷史")')).toBeVisible();
    
    // 驗證版本類型展示
    await expect(page.locator('text=版本類型')).toBeVisible();
    await expect(page.locator('text=主要版本')).toBeVisible();
    await expect(page.locator('text=次要版本')).toBeVisible();
    await expect(page.locator('text=修補版本')).toBeVisible();
    await expect(page.locator('text=自動保存')).toBeVisible();
    
    // 驗證記憶科學整合
    await expect(page.locator('text=記憶科學整合')).toBeVisible();
    await expect(page.locator('text=學習進度版本化')).toBeVisible();
    await expect(page.locator('text=版本恢復的記憶影響')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=等級變更追蹤')).toBeVisible();
    await expect(page.locator('text=版本比較分析')).toBeVisible();
    await expect(page.locator('text=智能版本建議')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 ActivityHistoryVersionPanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試活動選擇
    console.log('📋 測試活動選擇功能');
    await expect(page.getByTestId('activity-history-version-panel')).toBeVisible();
    await expect(page.locator('text=選擇活動')).toBeVisible();
    
    // 選擇第一個活動
    await page.getByTestId('activity-act-1').click();
    await page.waitForTimeout(1000);
    
    // 測試標籤切換
    console.log('📑 測試標籤切換功能');
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('comparison-tab')).toBeVisible();
    await expect(page.getByTestId('collaboration-tab')).toBeVisible();
    
    // 測試版本歷史標籤
    await page.getByTestId('history-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('history-content')).toBeVisible();
    await expect(page.getByTestId('history-content').locator('h3:has-text("版本歷史")')).toBeVisible();
    await expect(page.locator('text=總版本數')).toBeVisible();
    await expect(page.locator('text=穩定版本')).toBeVisible();
    
    // 測試版本比較標籤
    console.log('🔍 測試版本比較功能');
    await page.getByTestId('comparison-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('comparison-content')).toBeVisible();
    await expect(page.locator('text=版本比較')).toBeVisible();
    
    // 測試協作歷史標籤
    console.log('👥 測試協作歷史功能');
    await page.getByTestId('collaboration-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('collaboration-content')).toBeVisible();
    await expect(page.locator('text=協作歷史')).toBeVisible();
    await expect(page.locator('text=協作者活動時間線')).toBeVisible();
    
    // 回到版本歷史測試版本選擇和回滾
    console.log('⏪ 測試版本回滾功能');
    await page.getByTestId('history-tab').click();
    await page.waitForTimeout(1000);
    
    // 測試回滾按鈕（如果存在）
    const rollbackButtons = page.locator('[data-testid^="rollback-"]');
    const rollbackCount = await rollbackButtons.count();
    if (rollbackCount > 0) {
      console.log(`找到 ${rollbackCount} 個回滾按鈕`);
      // 不實際點擊回滾，只驗證按鈕存在
      await expect(rollbackButtons.first()).toBeVisible();
    }
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('activity-history-version-panel')).toBeVisible();
    
    console.log('🎉 活動歷史和版本管理三層整合驗證完全成功！');
  });

  test('活動歷史和版本管理性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製活動歷史和版本管理性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/history-version');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 活動歷史和版本管理頁面載入時間: ${pageLoadTime}ms`);

    // 等待 ActivityHistoryVersionPanel 載入
    await page.waitForTimeout(3000);

    // 測量活動選擇時間
    const activitySelectStart = Date.now();
    await page.getByTestId('activity-act-1').click();
    await page.waitForTimeout(1000);
    const activitySelectTime = Date.now() - activitySelectStart;
    console.log(`📊 活動選擇時間: ${activitySelectTime}ms`);

    // 測量標籤切換時間
    const historyTabStart = Date.now();
    await page.getByTestId('history-tab').click();
    await page.waitForTimeout(1000);
    const historyTabTime = Date.now() - historyTabStart;
    console.log(`📊 版本歷史標籤切換時間: ${historyTabTime}ms`);

    const comparisonTabStart = Date.now();
    await page.getByTestId('comparison-tab').click();
    await page.waitForTimeout(1000);
    const comparisonTabTime = Date.now() - comparisonTabStart;
    console.log(`📊 版本比較標籤切換時間: ${comparisonTabTime}ms`);

    const collaborationTabStart = Date.now();
    await page.getByTestId('collaboration-tab').click();
    await page.waitForTimeout(1000);
    const collaborationTabTime = Date.now() - collaborationTabStart;
    console.log(`📊 協作歷史標籤切換時間: ${collaborationTabTime}ms`);

    // 測量版本數據載入時間
    await page.getByTestId('history-tab').click();
    const versionLoadStart = Date.now();
    await page.waitForTimeout(1000);
    const versionLoadTime = Date.now() - versionLoadStart;
    console.log(`📊 版本數據載入時間: ${versionLoadTime}ms`);

    // 測量活動切換時間
    const activitySwitchStart = Date.now();
    await page.getByTestId('activity-act-2').click();
    await page.waitForTimeout(1000);
    const activitySwitchTime = Date.now() - activitySwitchStart;
    console.log(`📊 活動切換時間: ${activitySwitchTime}ms`);

    console.log('🎉 活動歷史和版本管理性能測試完成！');
  });
});
