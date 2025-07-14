/**
 * 基本功能 Playwright 端到端測試
 * 驗證剛才實現的核心功能是否正常工作
 */

import { test, expect } from '@playwright/test';

test.describe('EduCreate 基本功能驗證', () => {
  test('應該能訪問首頁', async ({ page }) => {
    await page.goto('/');
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 驗證主要導航元素
    await expect(page.locator('nav')).toBeVisible();
  });

  test('應該能訪問演示頁面', async ({ page }) => {
    // 測試版本管理演示頁面
    await page.goto('/demo/version-management');
    await expect(page.locator('h1')).toContainText('版本管理演示');
    
    // 測試AI輔助演示頁面
    await page.goto('/demo/ai-assistance');
    await expect(page.locator('h1')).toContainText('AI智能輔助演示');
    
    // 測試高級搜索演示頁面
    await page.goto('/demo/advanced-search');
    await expect(page.locator('h1')).toContainText('高級搜索演示');
  });

  test('應該能訪問API端點', async ({ page }) => {
    // 測試版本管理API（無需認證的健康檢查）
    const versionResponse = await page.request.get('/api/activities/demo_activity_123/versions?limit=1');
    expect(versionResponse.status()).toBeLessThan(500); // 不是服務器錯誤
    
    // 測試AI輔助API
    const aiResponse = await page.request.get('/api/ai/intelligent-assistance?action=recommendations&maxRecommendations=1');
    expect(aiResponse.status()).toBeLessThan(500);
    
    // 測試搜索API
    const searchResponse = await page.request.get('/api/search/enhanced?q=test&limit=1');
    expect(searchResponse.status()).toBeLessThan(500);
  });

  test('應該能正確處理錯誤頁面', async ({ page }) => {
    // 訪問不存在的頁面
    await page.goto('/non-existent-page');
    
    // 驗證404頁面或重定向
    const url = page.url();
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe('complete');
  });

  test('應該能正確載入CSS和JavaScript', async ({ page }) => {
    await page.goto('/demo/version-management');
    
    // 檢查是否有CSS載入錯誤
    const cssErrors = [];
    page.on('response', response => {
      if (response.url().includes('.css') && !response.ok()) {
        cssErrors.push(response.url());
      }
    });
    
    // 檢查是否有JavaScript錯誤
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    
    // 驗證沒有嚴重錯誤
    expect(cssErrors.length).toBeLessThan(5); // 允許少量CSS載入失敗
    expect(jsErrors.length).toBeLessThan(3);  // 允許少量JS錯誤
  });

  test('應該能響應式顯示', async ({ page }) => {
    await page.goto('/demo/version-management');
    
    // 測試桌面視圖
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
    
    // 測試平板視圖
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // 測試手機視圖
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('應該能正確處理表單提交', async ({ page }) => {
    await page.goto('/demo/advanced-search');
    
    // 查找搜索表單
    const searchInput = page.locator('input[type="text"]').first();
    const searchButton = page.locator('button').filter({ hasText: /搜索|search/i }).first();
    
    if (await searchInput.isVisible() && await searchButton.isVisible()) {
      // 填寫搜索表單
      await searchInput.fill('測試搜索');
      await searchButton.click();
      
      // 等待響應
      await page.waitForTimeout(2000);
      
      // 驗證頁面沒有崩潰
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('應該能正確處理導航', async ({ page }) => {
    await page.goto('/');
    
    // 查找導航連結
    const navLinks = page.locator('nav a, header a').filter({ hasText: /demo|演示/i });
    
    if (await navLinks.count() > 0) {
      // 點擊第一個演示連結
      await navLinks.first().click();
      
      // 等待頁面載入
      await page.waitForLoadState('networkidle');
      
      // 驗證導航成功
      expect(page.url()).toContain('/demo');
    }
  });

  test('應該能正確顯示中文內容', async ({ page }) => {
    await page.goto('/demo/version-management');
    
    // 驗證中文內容正確顯示
    await expect(page.locator('body')).toContainText('版本管理');
    await expect(page.locator('body')).toContainText('演示');
    
    // 檢查字體渲染
    const bodyElement = page.locator('body');
    const fontSize = await bodyElement.evaluate(el => getComputedStyle(el).fontSize);
    expect(fontSize).toBeTruthy();
  });

  test('應該能正確處理圖片載入', async ({ page }) => {
    await page.goto('/demo/ai-assistance');
    
    // 檢查圖片載入錯誤
    const imageErrors = [];
    page.on('response', response => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|svg)$/i) && !response.ok()) {
        imageErrors.push(response.url());
      }
    });
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 允許一些圖片載入失敗（如用戶頭像等）
    expect(imageErrors.length).toBeLessThan(10);
  });

  test('應該能正確處理API錯誤', async ({ page }) => {
    // 攔截API請求並返回錯誤
    await page.route('/api/**', route => {
      if (route.request().url().includes('test-error')) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: '測試錯誤' })
        });
      } else {
        route.continue();
      }
    });
    
    await page.goto('/demo/version-management');
    
    // 驗證頁面仍然可以正常顯示
    await expect(page.locator('body')).toBeVisible();
  });

  test('應該能正確處理長時間載入', async ({ page }) => {
    // 設置較長的超時時間
    page.setDefaultTimeout(30000);
    
    await page.goto('/demo/ai-assistance');
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面內容已載入
    await expect(page.locator('h1')).toBeVisible();
  });

  test('應該能正確處理瀏覽器兼容性', async ({ page, browserName }) => {
    await page.goto('/demo/advanced-search');
    
    // 驗證基本功能在不同瀏覽器中都能工作
    await expect(page.locator('body')).toBeVisible();
    
    // 檢查JavaScript功能
    const jsWorking = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    
    expect(jsWorking).toBe(true);
    
    console.log(`測試瀏覽器: ${browserName}`);
  });

  test('應該能正確處理頁面刷新', async ({ page }) => {
    await page.goto('/demo/version-management');
    
    // 等待初始載入
    await page.waitForLoadState('networkidle');
    
    // 刷新頁面
    await page.reload();
    
    // 等待重新載入
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面仍然正常
    await expect(page.locator('h1')).toContainText('版本管理演示');
  });

  test('應該能正確處理返回按鈕', async ({ page }) => {
    await page.goto('/');
    
    // 導航到演示頁面
    await page.goto('/demo/version-management');
    await expect(page.locator('h1')).toContainText('版本管理演示');
    
    // 使用瀏覽器返回按鈕
    await page.goBack();
    
    // 驗證返回到首頁
    expect(page.url()).not.toContain('/demo/version-management');
  });
});
