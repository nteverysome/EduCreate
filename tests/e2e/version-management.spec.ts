/**
 * 版本管理系統 Playwright 端到端測試
 * 驗證版本創建、歷史查看、版本比較、版本恢復、協作者追蹤等功能
 */

import { test, expect } from '@playwright/test';

test.describe('版本管理系統', () => {
  test.beforeEach(async ({ page }) => {
    // 登入測試帳號
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // 導航到版本管理演示頁面
    await page.goto('/demo/version-management');
  });

  test('應該能顯示版本管理演示頁面', async ({ page }) => {
    // 驗證頁面標題
    await expect(page.locator('h1')).toContainText('版本管理演示');
    
    // 驗證功能描述
    await expect(page.locator('p')).toContainText('展示完整的變更追蹤、版本對比、歷史回滾');
    
    // 驗證活動選擇區域
    await expect(page.locator('[data-testid="activity-selector"]')).toBeVisible();
    
    // 驗證版本歷史組件
    await expect(page.locator('[data-testid="version-history-component"]')).toBeVisible();
  });

  test('應該能選擇不同的活動', async ({ page }) => {
    // 點擊第一個活動
    await page.click('[data-testid="activity-item-0"]');
    
    // 驗證活動被選中
    await expect(page.locator('[data-testid="activity-item-0"]')).toHaveClass(/border-blue-500/);
    
    // 點擊第二個活動
    await page.click('[data-testid="activity-item-1"]');
    
    // 驗證新活動被選中，舊活動取消選中
    await expect(page.locator('[data-testid="activity-item-1"]')).toHaveClass(/border-blue-500/);
    await expect(page.locator('[data-testid="activity-item-0"]')).not.toHaveClass(/border-blue-500/);
  });

  test('應該能創建新版本', async ({ page }) => {
    // 點擊創建新版本按鈕
    await page.click('[data-testid="create-version-button"]');
    
    // 等待請求完成
    await page.waitForResponse(response => 
      response.url().includes('/api/activities/') && 
      response.url().includes('/versions') &&
      response.request().method() === 'POST'
    );
    
    // 驗證成功通知
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('成功創建新版本');
    
    // 驗證通知自動消失
    await expect(page.locator('[data-testid="notification"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('應該能查看版本歷史', async ({ page }) => {
    // 切換到版本歷史標籤
    await page.click('[data-testid="versions-tab"]');
    
    // 等待版本歷史載入
    await page.waitForSelector('[data-testid="version-list"]');
    
    // 驗證版本列表顯示
    await expect(page.locator('[data-testid="version-list"]')).toBeVisible();
    
    // 驗證版本項目
    const versionItems = page.locator('[data-testid="version-item"]');
    await expect(versionItems).toHaveCount({ min: 1 });
    
    // 驗證版本信息顯示
    const firstVersion = versionItems.first();
    await expect(firstVersion.locator('[data-testid="version-title"]')).toBeVisible();
    await expect(firstVersion.locator('[data-testid="version-number"]')).toBeVisible();
    await expect(firstVersion.locator('[data-testid="version-author"]')).toBeVisible();
    await expect(firstVersion.locator('[data-testid="version-date"]')).toBeVisible();
  });

  test('應該能選擇版本進行比較', async ({ page }) => {
    // 切換到版本歷史標籤
    await page.click('[data-testid="versions-tab"]');
    await page.waitForSelector('[data-testid="version-list"]');
    
    // 選擇第一個版本
    await page.click('[data-testid="version-item"]:first-child');
    
    // 驗證版本被選中
    await expect(page.locator('[data-testid="version-item"]:first-child')).toHaveClass(/border-blue-500/);
    
    // 選擇第二個版本
    await page.click('[data-testid="version-item"]:nth-child(2)');
    
    // 驗證兩個版本都被選中
    await expect(page.locator('[data-testid="version-item"]:first-child')).toHaveClass(/border-blue-500/);
    await expect(page.locator('[data-testid="version-item"]:nth-child(2)')).toHaveClass(/border-blue-500/);
    
    // 驗證自動切換到比較標籤
    await expect(page.locator('[data-testid="comparison-tab"]')).toHaveClass(/border-blue-500/);
  });

  test('應該能查看版本比較結果', async ({ page }) => {
    // 模擬選擇兩個版本後的比較狀態
    await page.click('[data-testid="versions-tab"]');
    await page.waitForSelector('[data-testid="version-list"]');
    
    // 選擇兩個版本
    await page.click('[data-testid="version-item"]:first-child');
    await page.click('[data-testid="version-item"]:nth-child(2)');
    
    // 等待比較結果載入
    await page.waitForSelector('[data-testid="comparison-results"]');
    
    // 驗證比較摘要
    await expect(page.locator('[data-testid="comparison-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-changes"]')).toBeVisible();
    await expect(page.locator('[data-testid="additions-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="deletions-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="modifications-count"]')).toBeVisible();
    
    // 驗證相似度分數
    await expect(page.locator('[data-testid="similarity-score"]')).toBeVisible();
    
    // 驗證詳細差異列表
    await expect(page.locator('[data-testid="differences-list"]')).toBeVisible();
  });

  test('應該能恢復版本', async ({ page }) => {
    // 切換到版本歷史標籤
    await page.click('[data-testid="versions-tab"]');
    await page.waitForSelector('[data-testid="version-list"]');
    
    // 點擊非當前版本的恢復按鈕
    const nonCurrentVersions = page.locator('[data-testid="version-item"]:not(:has([data-testid="current-version-badge"]))');
    const firstNonCurrentVersion = nonCurrentVersions.first();
    
    await firstNonCurrentVersion.locator('[data-testid="restore-button"]').click();
    
    // 驗證恢復確認對話框
    await expect(page.locator('[data-testid="restore-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="restore-dialog"]')).toContainText('確認恢復版本');
    
    // 點擊確認恢復
    await page.click('[data-testid="confirm-restore-button"]');
    
    // 等待恢復請求完成
    await page.waitForResponse(response => 
      response.url().includes('/api/activities/') && 
      response.url().includes('/versions/restore') &&
      response.request().method() === 'POST'
    );
    
    // 驗證成功通知
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('成功恢復到版本');
    
    // 驗證對話框關閉
    await expect(page.locator('[data-testid="restore-dialog"]')).not.toBeVisible();
  });

  test('應該能查看協作者活動', async ({ page }) => {
    // 切換到協作活動標籤
    await page.click('[data-testid="activities-tab"]');
    
    // 等待協作者活動載入
    await page.waitForSelector('[data-testid="collaborator-activities"]');
    
    // 驗證活動列表顯示
    await expect(page.locator('[data-testid="collaborator-activities"]')).toBeVisible();
    
    // 驗證活動項目
    const activityItems = page.locator('[data-testid="activity-item"]');
    
    if (await activityItems.count() > 0) {
      const firstActivity = activityItems.first();
      
      // 驗證活動信息顯示
      await expect(firstActivity.locator('[data-testid="user-avatar"]')).toBeVisible();
      await expect(firstActivity.locator('[data-testid="user-name"]')).toBeVisible();
      await expect(firstActivity.locator('[data-testid="activity-action"]')).toBeVisible();
      await expect(firstActivity.locator('[data-testid="activity-timestamp"]')).toBeVisible();
    }
  });

  test('應該能處理載入錯誤', async ({ page }) => {
    // 攔截API請求並返回錯誤
    await page.route('/api/activities/*/versions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '服務器錯誤' })
      });
    });
    
    // 刷新頁面觸發API請求
    await page.reload();
    
    // 驗證錯誤提示顯示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('載入版本歷史失敗');
  });

  test('應該能處理版本比較錯誤', async ({ page }) => {
    // 攔截版本比較API請求並返回錯誤
    await page.route('/api/activities/*/versions/compare', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: '版本不存在' })
      });
    });
    
    // 嘗試選擇兩個版本進行比較
    await page.click('[data-testid="versions-tab"]');
    await page.waitForSelector('[data-testid="version-list"]');
    
    await page.click('[data-testid="version-item"]:first-child');
    await page.click('[data-testid="version-item"]:nth-child(2)');
    
    // 驗證錯誤提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('版本比較失敗');
  });

  test('應該能處理版本恢復錯誤', async ({ page }) => {
    // 攔截版本恢復API請求並返回錯誤
    await page.route('/api/activities/*/versions/restore', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: '權限不足' })
      });
    });
    
    // 嘗試恢復版本
    await page.click('[data-testid="versions-tab"]');
    await page.waitForSelector('[data-testid="version-list"]');
    
    const nonCurrentVersions = page.locator('[data-testid="version-item"]:not(:has([data-testid="current-version-badge"]))');
    if (await nonCurrentVersions.count() > 0) {
      await nonCurrentVersions.first().locator('[data-testid="restore-button"]').click();
      await page.click('[data-testid="confirm-restore-button"]');
      
      // 驗證錯誤提示
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('版本恢復失敗');
    }
  });

  test('應該能響應式顯示', async ({ page }) => {
    // 測試桌面視圖
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
    
    // 測試平板視圖
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    
    // 測試手機視圖
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
  });

  test('應該能正確顯示版本類型和狀態', async ({ page }) => {
    await page.click('[data-testid="versions-tab"]');
    await page.waitForSelector('[data-testid="version-list"]');
    
    const versionItems = page.locator('[data-testid="version-item"]');
    
    if (await versionItems.count() > 0) {
      const firstVersion = versionItems.first();
      
      // 驗證版本類型標籤
      await expect(firstVersion.locator('[data-testid="version-type-badge"]')).toBeVisible();
      
      // 驗證穩定版本標籤（如果適用）
      const stableBadge = firstVersion.locator('[data-testid="stable-version-badge"]');
      if (await stableBadge.isVisible()) {
        await expect(stableBadge).toContainText('穩定版本');
      }
      
      // 驗證當前版本標籤（如果適用）
      const currentBadge = firstVersion.locator('[data-testid="current-version-badge"]');
      if (await currentBadge.isVisible()) {
        await expect(currentBadge).toContainText('當前版本');
      }
    }
  });

  test('應該能顯示版本變更摘要', async ({ page }) => {
    await page.click('[data-testid="versions-tab"]');
    await page.waitForSelector('[data-testid="version-list"]');
    
    const versionItems = page.locator('[data-testid="version-item"]');
    
    if (await versionItems.count() > 0) {
      const firstVersion = versionItems.first();
      
      // 驗證變更摘要區域
      const changesSummary = firstVersion.locator('[data-testid="changes-summary"]');
      if (await changesSummary.isVisible()) {
        // 驗證變更圖標和描述
        await expect(changesSummary.locator('[data-testid="change-icon"]')).toBeVisible();
        await expect(changesSummary.locator('[data-testid="change-description"]')).toBeVisible();
      }
    }
  });
});
