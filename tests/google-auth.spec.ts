import { test, expect, Page, BrowserContext } from '@playwright/test';

// 測試配置
const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Google 測試帳戶配置（使用環境變量）
const GOOGLE_EMAIL = process.env.GOOGLE_TEST_EMAIL || 'test@example.com';
const GOOGLE_PASSWORD = process.env.GOOGLE_TEST_PASSWORD || 'testpassword';

test.describe('Google 登入和註冊測試', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // 創建新的瀏覽器上下文，模擬真實用戶環境
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    // 清除所有 cookies 和本地存儲
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('應該顯示登入頁面和 Google 登入按鈕', async () => {
    await test.step('導航到登入頁面', async () => {
      await page.goto(`${BASE_URL}/login`);
      await expect(page).toHaveTitle(/登入.*EduCreate/);
    });

    await test.step('驗證頁面元素', async () => {
      // 檢查頁面標題
      await expect(page.locator('h2')).toContainText('登入您的帳戶');
      
      // 檢查表單元素
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("登入")')).toBeVisible();
      
      // 檢查 Google 登入按鈕
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
    });

    await test.step('截圖記錄', async () => {
      await page.screenshot({ 
        path: 'test-results/login-page.png',
        fullPage: true 
      });
    });
  });

  test('應該顯示註冊頁面', async () => {
    await test.step('導航到註冊頁面', async () => {
      await page.goto(`${BASE_URL}/register`);
      await expect(page).toHaveTitle(/註冊.*EduCreate/);
    });

    await test.step('驗證註冊表單', async () => {
      await expect(page.locator('h2')).toContainText('創建您的帳戶');
      
      // 檢查註冊表單字段
      await expect(page.locator('input[placeholder*="姓名"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
      await expect(page.locator('input[placeholder*="確認密碼"]')).toBeVisible();
      await expect(page.locator('button:has-text("註冊")')).toBeVisible();
    });

    await test.step('截圖記錄', async () => {
      await page.screenshot({ 
        path: 'test-results/register-page.png',
        fullPage: true 
      });
    });
  });

  test('Google 登入流程測試', async () => {
    await test.step('開始 Google 登入流程', async () => {
      await page.goto(`${BASE_URL}/login`);
      
      // 點擊 Google 登入按鈕
      const googleButton = page.locator('button:has-text("Google")');
      await expect(googleButton).toBeVisible();
      
      // 監聽頁面跳轉
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        googleButton.click()
      ]);

      // 等待 Google OAuth 頁面加載
      await popup.waitForLoadState('networkidle');
      
      // 檢查是否跳轉到 Google 認證頁面
      const url = popup.url();
      expect(url).toContain('accounts.google.com');
      
      await popup.screenshot({ 
        path: 'test-results/google-oauth-page.png',
        fullPage: true 
      });
    });
  });

  test('測試 NextAuth API 端點', async () => {
    await test.step('測試 session API', async () => {
      const response = await page.goto(`${BASE_URL}/api/auth/session`);
      expect(response?.status()).toBe(200);
      
      const sessionData = await page.textContent('body');
      expect(sessionData).toBeTruthy();
      
      // 解析 session 數據
      const session = JSON.parse(sessionData || '{}');
      console.log('Session data:', session);
    });

    await test.step('測試 providers API', async () => {
      const response = await page.goto(`${BASE_URL}/api/auth/providers`);
      expect(response?.status()).toBe(200);
      
      const providersData = await page.textContent('body');
      const providers = JSON.parse(providersData || '{}');
      
      // 驗證 Google 提供者存在
      expect(providers).toHaveProperty('google');
      expect(providers.google.name).toBe('Google');
      
      console.log('Available providers:', Object.keys(providers));
    });

    await test.step('測試 CSRF token API', async () => {
      const response = await page.goto(`${BASE_URL}/api/auth/csrf`);
      expect(response?.status()).toBe(200);
      
      const csrfData = await page.textContent('body');
      const csrf = JSON.parse(csrfData || '{}');
      
      expect(csrf).toHaveProperty('csrfToken');
      expect(csrf.csrfToken).toBeTruthy();
      
      console.log('CSRF token received:', csrf.csrfToken.substring(0, 10) + '...');
    });
  });

  test('測試登入後的頁面跳轉', async () => {
    await test.step('模擬已登入狀態', async () => {
      // 設置模擬的 session cookie
      await context.addCookies([
        {
          name: 'next-auth.session-token',
          value: 'mock-session-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false
        }
      ]);
    });

    await test.step('測試受保護頁面訪問', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // 檢查是否能訪問儀表板
      await expect(page.locator('h1')).toContainText('儀表板');
      
      await page.screenshot({ 
        path: 'test-results/dashboard-page.png',
        fullPage: true 
      });
    });
  });

  test('測試登出功能', async () => {
    await test.step('訪問登出 API', async () => {
      const response = await page.goto(`${BASE_URL}/api/auth/signout`);
      expect(response?.status()).toBe(200);
    });

    await test.step('驗證登出後重定向', async () => {
      // 檢查是否重定向到主頁
      await page.waitForURL(`${BASE_URL}/`);
      await expect(page).toHaveURL(`${BASE_URL}/`);
      
      // 檢查登入按鈕是否重新出現
      await expect(page.locator('a:has-text("登入")')).toBeVisible();
    });
  });

  test('測試錯誤處理', async () => {
    await test.step('測試無效的認證請求', async () => {
      // 嘗試訪問不存在的認證端點
      const response = await page.goto(`${BASE_URL}/api/auth/invalid-endpoint`);
      expect(response?.status()).toBe(404);
    });

    await test.step('測試 CSRF 保護', async () => {
      // 嘗試不帶 CSRF token 的 POST 請求
      const response = await page.evaluate(async () => {
        return fetch('/api/auth/signin/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password'
          })
        });
      });
      
      // 應該被 CSRF 保護拒絕
      expect(response.status).toBe(400);
    });
  });

  test('性能測試', async () => {
    await test.step('測試頁面加載性能', async () => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`登入頁面加載時間: ${loadTime}ms`);
      
      // 頁面應該在 3 秒內加載完成
      expect(loadTime).toBeLessThan(3000);
    });

    await test.step('測試 API 響應時間', async () => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/api/auth/session`);
      
      const responseTime = Date.now() - startTime;
      console.log(`Session API 響應時間: ${responseTime}ms`);
      
      // API 應該在 1 秒內響應
      expect(responseTime).toBeLessThan(1000);
    });
  });

  test('可訪問性測試', async () => {
    await test.step('檢查登入頁面可訪問性', async () => {
      await page.goto(`${BASE_URL}/login`);
      
      // 檢查表單標籤
      await expect(page.locator('label, [aria-label]')).toHaveCount(4); // 電子郵件、密碼、記住我、Google按鈕
      
      // 檢查鍵盤導航
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // 檢查 ARIA 屬性
      const googleButton = page.locator('button:has-text("Google")');
      await expect(googleButton).toHaveAttribute('type', 'button');
    });
  });

  test('響應式設計測試', async () => {
    await test.step('測試移動端視圖', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(`${BASE_URL}/login`);
      
      // 檢查元素是否正確顯示
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/login-mobile.png',
        fullPage: true 
      });
    });

    await test.step('測試平板視圖', async () => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto(`${BASE_URL}/login`);
      
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/login-tablet.png',
        fullPage: true 
      });
    });

    await test.step('測試桌面視圖', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await page.goto(`${BASE_URL}/login`);
      
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/login-desktop.png',
        fullPage: true 
      });
    });
  });
});
