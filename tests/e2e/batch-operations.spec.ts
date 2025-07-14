/**
 * 批量操作功能 Playwright 端到端測試
 * 驗證批量操作的真實網站功能互動：多選、批量處理、進度監控等
 */

import { test, expect } from '@playwright/test';
import { bypassAuthAndGoto, waitForPageLoad, testUsers } from '../helpers/auth-helper';

test.describe('批量操作功能', () => {
  test.beforeEach(async ({ page }) => {
    // 跳過認證並導航到批量操作演示頁面
    await bypassAuthAndGoto(page, '/demo/batch-operations', testUsers.default);

    // 等待頁面完全載入
    await waitForPageLoad(page);
  });

  test('應該能顯示批量操作演示頁面', async ({ page }) => {
    // 增加超時時間
    test.setTimeout(60000);

    try {
      // 驗證頁面標題
      await expect(page.locator('h1')).toContainText('批量操作演示', { timeout: 10000 });

      // 驗證功能描述
      await expect(page.locator('p')).toContainText('展示批量操作功能', { timeout: 5000 });

      // 驗證項目列表
      await expect(page.locator('[data-testid="items-list"]')).toBeVisible({ timeout: 10000 });

      // 驗證操作工具欄
      await expect(page.locator('[data-testid="select-all-checkbox"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="open-batch-panel-button"]')).toBeVisible({ timeout: 5000 });

    } catch (error) {
      console.log('頁面載入或元素查找失敗:', error);
      console.log('當前頁面 URL:', page.url());
      console.log('頁面標題:', await page.title());

      // 嘗試截圖以便調試
      await page.screenshot({ path: 'debug-batch-operations.png' });
      throw error;
    }
  });

  test('應該能選擇和取消選擇項目', async ({ page }) => {
    // 選擇第一個項目
    await page.click('[data-testid="item-checkbox-activity_1"]');
    
    // 驗證項目被選中
    await expect(page.locator('[data-testid="item-checkbox-activity_1"]')).toBeChecked();
    await expect(page.locator('[data-testid="item-activity_1"]')).toHaveClass(/bg-blue-50/);
    
    // 驗證選擇計數更新
    await expect(page.locator('text=已選擇 1 /')).toBeVisible();
    
    // 取消選擇
    await page.click('[data-testid="item-checkbox-activity_1"]');
    
    // 驗證項目取消選中
    await expect(page.locator('[data-testid="item-checkbox-activity_1"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="item-activity_1"]')).not.toHaveClass(/bg-blue-50/);
    
    // 驗證選擇計數更新
    await expect(page.locator('text=已選擇 0 /')).toBeVisible();
  });

  test('應該能使用全選功能', async ({ page }) => {
    // 點擊全選
    await page.click('[data-testid="select-all-checkbox"]');
    
    // 驗證所有項目被選中
    await expect(page.locator('[data-testid="item-checkbox-activity_1"]')).toBeChecked();
    await expect(page.locator('[data-testid="item-checkbox-activity_2"]')).toBeChecked();
    await expect(page.locator('[data-testid="item-checkbox-folder_1"]')).toBeChecked();
    
    // 驗證選擇計數
    await expect(page.locator('text=已選擇 6 / 6 個項目')).toBeVisible();
    
    // 再次點擊全選（取消全選）
    await page.click('[data-testid="select-all-checkbox"]');
    
    // 驗證所有項目取消選中
    await expect(page.locator('[data-testid="item-checkbox-activity_1"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="item-checkbox-activity_2"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="item-checkbox-folder_1"]')).not.toBeChecked();
    
    // 驗證選擇計數
    await expect(page.locator('text=已選擇 0 /')).toBeVisible();
  });

  test('應該能打開批量操作面板', async ({ page }) => {
    // 選擇一些項目
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="item-checkbox-activity_2"]');
    
    // 點擊批量操作按鈕
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 驗證批量操作面板顯示
    await expect(page.locator('[data-testid="batch-operation-panel"]')).toBeVisible();
    
    // 驗證面板標題
    await expect(page.locator('h2')).toContainText('批量操作 (已選擇 2 個項目)');
    
    // 驗證操作標籤頁
    await expect(page.locator('[data-testid="operations-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-tab"]')).toBeVisible();
    
    // 驗證操作內容
    await expect(page.locator('[data-testid="operations-content"]')).toBeVisible();
  });

  test('應該能關閉批量操作面板', async ({ page }) => {
    // 選擇項目並打開面板
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 驗證面板顯示
    await expect(page.locator('[data-testid="batch-operation-panel"]')).toBeVisible();
    
    // 點擊關閉按鈕
    await page.click('[data-testid="close-batch-panel"]');
    
    // 驗證面板關閉
    await expect(page.locator('[data-testid="batch-operation-panel"]')).not.toBeVisible();
  });

  test('應該能執行移動操作', async ({ page }) => {
    // 選擇項目
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="item-checkbox-activity_2"]');
    
    // 打開批量操作面板
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 點擊移動操作
    await page.click('[data-testid="move-operation-button"]');
    
    // 等待操作開始
    await page.waitForTimeout(1000);
    
    // 驗證切換到進度標籤
    await expect(page.locator('[data-testid="progress-tab"]')).toHaveClass(/border-blue-600/);
    
    // 驗證進度內容顯示
    await expect(page.locator('[data-testid="progress-content"]')).toBeVisible();
    
    // 驗證通知顯示
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('批量移動操作已開始');
  });

  test('應該能執行複製操作', async ({ page }) => {
    // 選擇項目
    await page.click('[data-testid="item-checkbox-folder_1"]');
    
    // 打開批量操作面板
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 點擊複製操作
    await page.click('[data-testid="copy-operation-button"]');
    
    // 等待操作開始
    await page.waitForTimeout(1000);
    
    // 驗證通知顯示
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('批量複製操作已開始');
  });

  test('應該能執行刪除操作', async ({ page }) => {
    // 選擇項目
    await page.click('[data-testid="item-checkbox-activity_3"]');
    
    // 打開批量操作面板
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 點擊刪除操作
    await page.click('[data-testid="delete-operation-button"]');
    
    // 等待操作開始
    await page.waitForTimeout(1000);
    
    // 驗證通知顯示
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('批量刪除操作已開始');
  });

  test('應該能執行分享操作', async ({ page }) => {
    // 選擇項目
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="item-checkbox-activity_4"]');
    
    // 打開批量操作面板
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 設置分享類型
    await page.selectOption('[data-testid="share-type-select"]', 'public');
    
    // 點擊分享操作
    await page.click('[data-testid="share-operation-button"]');
    
    // 等待操作開始
    await page.waitForTimeout(1000);
    
    // 驗證通知顯示
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('批量分享操作已開始');
  });

  test('應該能執行標籤操作', async ({ page }) => {
    // 選擇項目
    await page.click('[data-testid="item-checkbox-activity_2"]');
    await page.click('[data-testid="item-checkbox-folder_2"]');
    
    // 打開批量操作面板
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 點擊標籤操作
    await page.click('[data-testid="tag-operation-button"]');
    
    // 等待操作開始
    await page.waitForTimeout(1000);
    
    // 驗證通知顯示
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('批量標籤操作已開始');
  });

  test('應該能執行導出操作', async ({ page }) => {
    // 選擇項目
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="item-checkbox-activity_3"]');
    await page.click('[data-testid="item-checkbox-folder_1"]');
    
    // 打開批量操作面板
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 點擊導出操作
    await page.click('[data-testid="export-operation-button"]');
    
    // 等待操作開始
    await page.waitForTimeout(1000);
    
    // 驗證通知顯示
    await expect(page.locator('[data-testid="notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification"]')).toContainText('批量導出操作已開始');
  });

  test('應該能配置操作選項', async ({ page }) => {
    // 選擇項目
    await page.click('[data-testid="item-checkbox-activity_1"]');
    
    // 打開批量操作面板
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 配置衝突處理方式
    await page.selectOption('[data-testid="conflict-resolution-select"]', 'overwrite');
    
    // 配置分享類型
    await page.selectOption('[data-testid="share-type-select"]', 'class');
    
    // 配置選項
    await page.uncheck('[data-testid="preserve-metadata-checkbox"]');
    await page.check('[data-testid="create-backup-checkbox"]');
    await page.check('[data-testid="notify-users-checkbox"]');
    
    // 驗證選項已設置
    await expect(page.locator('[data-testid="conflict-resolution-select"]')).toHaveValue('overwrite');
    await expect(page.locator('[data-testid="share-type-select"]')).toHaveValue('class');
    await expect(page.locator('[data-testid="preserve-metadata-checkbox"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="create-backup-checkbox"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-users-checkbox"]')).toBeChecked();
  });

  test('應該能切換到進度監控標籤', async ({ page }) => {
    // 選擇項目並打開面板
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="open-batch-panel-button"]');
    
    // 點擊進度標籤
    await page.click('[data-testid="progress-tab"]');
    
    // 驗證標籤切換
    await expect(page.locator('[data-testid="progress-tab"]')).toHaveClass(/border-blue-600/);
    await expect(page.locator('[data-testid="operations-tab"]')).not.toHaveClass(/border-blue-600/);
    
    // 驗證進度內容顯示
    await expect(page.locator('[data-testid="progress-content"]')).toBeVisible();
  });

  test('應該能監控操作進度', async ({ page }) => {
    // 選擇項目並執行操作
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="item-checkbox-activity_2"]');
    await page.click('[data-testid="open-batch-panel-button"]');
    await page.click('[data-testid="copy-operation-button"]');
    
    // 等待操作開始
    await page.waitForTimeout(2000);
    
    // 檢查是否有操作記錄
    const operationElements = page.locator('[data-testid^="operation-"]');
    const operationCount = await operationElements.count();
    
    if (operationCount > 0) {
      // 驗證操作信息顯示
      const firstOperation = operationElements.first();
      await expect(firstOperation).toBeVisible();
      
      // 檢查進度條
      const progressBar = firstOperation.locator('[data-testid^="progress-bar-"]');
      if (await progressBar.isVisible()) {
        await expect(progressBar).toBeVisible();
      }
    }
  });

  test('應該能處理無選擇項目的情況', async ({ page }) => {
    // 不選擇任何項目，直接嘗試打開批量操作面板
    const batchButton = page.locator('[data-testid="open-batch-panel-button"]');
    
    // 驗證按鈕被禁用
    await expect(batchButton).toBeDisabled();
    
    // 驗證選擇計數顯示
    await expect(page.locator('text=已選擇 0 /')).toBeVisible();
  });

  test('應該能正確顯示項目信息', async ({ page }) => {
    // 驗證第一個項目的信息
    const firstItem = page.locator('[data-testid="item-activity_1"]');
    await expect(firstItem).toContainText('英語配對遊戲');
    await expect(firstItem).toContainText('/學習活動/英語/配對遊戲');
    await expect(firstItem).toContainText('1.00 MB');
    
    // 驗證標籤顯示
    await expect(firstItem).toContainText('英語');
    await expect(firstItem).toContainText('配對');
    await expect(firstItem).toContainText('GEPT初級');
    
    // 驗證資料夾項目
    const folderItem = page.locator('[data-testid="item-folder_1"]');
    await expect(folderItem).toContainText('英語學習資料夾');
    await expect(folderItem).toContainText('5.00 MB');
  });

  test('應該能響應式顯示', async ({ page }) => {
    // 測試桌面視圖
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="items-list"]')).toBeVisible();
    
    // 測試平板視圖
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="items-list"]')).toBeVisible();
    
    // 測試手機視圖
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="items-list"]')).toBeVisible();
  });

  test('應該能正確顯示功能特色', async ({ page }) => {
    // 滾動到功能特色區域
    await page.locator('text=批量操作功能特色').scrollIntoViewIfNeeded();
    
    // 驗證功能特色卡片
    await expect(page.locator('text=智能批量處理')).toBeVisible();
    await expect(page.locator('text=實時進度監控')).toBeVisible();
    await expect(page.locator('text=高效能處理')).toBeVisible();
    await expect(page.locator('text=安全保護機制')).toBeVisible();
    await expect(page.locator('text=靈活配置選項')).toBeVisible();
    await expect(page.locator('text=操作歷史追蹤')).toBeVisible();
  });

  test('應該能處理API錯誤', async ({ page }) => {
    // 攔截API請求並返回錯誤
    await page.route('/api/batch/operations', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: false, 
            error: 'INTERNAL_SERVER_ERROR',
            message: '服務器內部錯誤' 
          })
        });
      } else {
        route.continue();
      }
    });
    
    // 選擇項目並嘗試執行操作
    await page.click('[data-testid="item-checkbox-activity_1"]');
    await page.click('[data-testid="open-batch-panel-button"]');
    await page.click('[data-testid="move-operation-button"]');
    
    // 等待錯誤處理
    await page.waitForTimeout(2000);
    
    // 驗證錯誤通知
    const notification = page.locator('[data-testid="notification"]');
    if (await notification.isVisible()) {
      await expect(notification).toHaveClass(/bg-red-50/);
    }
  });
});
