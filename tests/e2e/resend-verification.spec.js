const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test.describe('重發驗證郵件功能', () => {
  test('應該能夠重發驗證郵件', async ({ page }) => {
    // 設定測試郵箱
    const testEmail = `test-resend-${Date.now()}@example.com`;
    
    await test.step('導航到重發驗證頁面', async () => {
      await page.goto(`${BASE_URL}/auth/resend-verification`);
      await expect(page).toHaveTitle(/重發驗證郵件/);
    });

    await test.step('驗證頁面元素', async () => {
      // 檢查標題
      await expect(page.locator('h1')).toContainText('重發驗證郵件');
      
      // 檢查表單元素
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('重發驗證郵件');
      
      // 檢查說明文字
      await expect(page.locator('text=沒有收到驗證郵件？我們可以重新發送給您')).toBeVisible();
    });

    await test.step('測試空郵箱驗證', async () => {
      await page.click('button[type="submit"]');
      
      // 應該顯示錯誤信息（HTML5 驗證）
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(el => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });

    await test.step('測試無效郵箱格式', async () => {
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      // 應該顯示格式錯誤
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(el => el.validationMessage);
      expect(validationMessage).toContain('email');
    });

    await test.step('測試不存在的郵箱', async () => {
      await page.fill('input[type="email"]', 'nonexistent@example.com');
      await page.click('button[type="submit"]');
      
      // 等待響應
      await page.waitForSelector('[class*="bg-blue-50"], [class*="bg-red-50"]', { timeout: 10000 });
      
      // 應該顯示成功信息（為了安全不透露用戶是否存在）
      const message = await page.locator('[class*="text-blue-800"], [class*="text-red-800"]').textContent();
      expect(message).toContain('如果該郵箱已註冊且未驗證');
    });

    await test.step('截圖記錄', async () => {
      await page.screenshot({ 
        path: 'test-results/resend-verification-page.png',
        fullPage: true 
      });
    });
  });

  test('應該能從註冊頁面跳轉到重發驗證頁面', async ({ page }) => {
    await test.step('導航到註冊頁面', async () => {
      await page.goto(`${BASE_URL}/register`);
    });

    await test.step('模擬註冊成功狀態', async () => {
      // 填寫註冊表單
      await page.fill('input[placeholder*="姓名"]', '測試用戶');
      await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[type="password"]', 'testpassword123');
      await page.fill('input[placeholder*="確認密碼"]', 'testpassword123');
      
      // 接受條款
      await page.check('input[type="checkbox"]');
      
      // 提交註冊
      await page.click('button[type="submit"]');
      
      // 等待成功信息
      await page.waitForSelector('.bg-green-50', { timeout: 15000 });
    });

    await test.step('檢查重發驗證連結', async () => {
      // 應該顯示重發驗證連結
      const resendLink = page.locator('text=沒收到郵件？點擊重新發送');
      await expect(resendLink).toBeVisible();
      
      // 點擊連結
      await resendLink.click();
      
      // 應該跳轉到重發驗證頁面
      await expect(page).toHaveURL(/\/auth\/resend-verification/);
      await expect(page.locator('h1')).toContainText('重發驗證郵件');
    });
  });

  test('應該能從登入頁面跳轉到重發驗證頁面', async ({ page }) => {
    await test.step('導航到登入頁面', async () => {
      await page.goto(`${BASE_URL}/login`);
    });

    await test.step('檢查重發驗證連結', async () => {
      // 應該顯示重發驗證連結
      const resendLink = page.locator('text=重新發送');
      await expect(resendLink).toBeVisible();
      
      // 點擊連結
      await resendLink.click();
      
      // 應該跳轉到重發驗證頁面
      await expect(page).toHaveURL(/\/auth\/resend-verification/);
      await expect(page.locator('h1')).toContainText('重發驗證郵件');
    });
  });

  test('應該能處理已驗證的用戶', async ({ page }) => {
    // 這個測試需要一個已驗證的用戶
    // 在實際環境中，可以使用測試數據庫或 mock 數據
    
    await test.step('導航到重發驗證頁面', async () => {
      await page.goto(`${BASE_URL}/auth/resend-verification`);
    });

    await test.step('測試已驗證用戶的郵箱', async () => {
      // 使用一個假設已驗證的郵箱
      await page.fill('input[type="email"]', 'verified@example.com');
      await page.click('button[type="submit"]');
      
      // 等待響應
      await page.waitForSelector('[class*="bg-green-50"], [class*="bg-blue-50"]', { timeout: 10000 });
      
      // 檢查是否顯示已驗證信息
      const messageExists = await page.locator('text=已經驗證').count() > 0;
      if (messageExists) {
        const message = await page.locator('[class*="text-green-800"]').textContent();
        expect(message).toContain('已經驗證');
      }
    });
  });

  test('應該顯示載入狀態', async ({ page }) => {
    await test.step('導航到重發驗證頁面', async () => {
      await page.goto(`${BASE_URL}/auth/resend-verification`);
    });

    await test.step('測試載入狀態', async () => {
      await page.fill('input[type="email"]', 'test@example.com');
      
      // 點擊提交按鈕
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // 檢查載入狀態
      await expect(submitButton).toContainText('發送中...');
      await expect(submitButton).toBeDisabled();
      
      // 等待請求完成
      await page.waitForSelector('[class*="bg-blue-50"], [class*="bg-red-50"]', { timeout: 10000 });
      
      // 載入狀態應該消失
      await expect(submitButton).toContainText('重發驗證郵件');
      await expect(submitButton).toBeEnabled();
    });
  });
});
