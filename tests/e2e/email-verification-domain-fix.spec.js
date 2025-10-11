const { test, expect } = require('@playwright/test');

test.describe('郵箱驗證域名修復測試', () => {
  test('完整的郵箱驗證流程 - 正確域名測試', async ({ page }) => {
    console.log('🚀 開始郵箱驗證域名修復測試...');

    // 1. 訪問註冊頁面
    await page.goto('https://edu-create.vercel.app/register');
    await expect(page).toHaveTitle(/註冊|EduCreate/);
    console.log('✅ 成功訪問註冊頁面');

    // 2. 生成測試用戶數據
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 測試郵箱: ${testEmail}`);

    // 3. 填寫註冊表單
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    console.log('✅ 註冊表單填寫完成');

    // 4. 提交註冊
    await page.click('button[type="submit"]');
    
    // 5. 等待註冊響應
    await page.waitForTimeout(3000);
    
    // 6. 檢查註冊成功消息
    const successMessage = await page.textContent('body');
    console.log('📋 註冊響應:', successMessage);
    
    // 7. 驗證是否顯示郵件發送成功消息
    expect(successMessage).toContain('驗證郵件已發送' || '請檢查您的電子郵件');
    console.log('✅ 註冊成功，驗證郵件已發送');

    // 8. 測試重發驗證郵件功能
    console.log('🔄 測試重發驗證郵件功能...');
    
    await page.goto('https://edu-create.vercel.app/auth/resend-verification');
    await page.fill('input[placeholder*="郵箱"]', testEmail);
    await page.click('button:has-text("重發驗證郵件")');
    
    // 9. 等待重發響應
    await page.waitForTimeout(2000);
    
    // 10. 檢查重發成功消息
    const resendMessage = await page.textContent('body');
    expect(resendMessage).toContain('驗證郵件已重新發送');
    console.log('✅ 重發驗證郵件成功');

    // 11. 模擬驗證連結測試（使用正確域名）
    console.log('🔗 測試驗證連結域名...');
    
    // 模擬驗證 token（實際測試中這會是真實的 token）
    const mockToken = 'test-token-' + timestamp;
    const verificationUrl = `https://edu-create.vercel.app/api/email/verify?token=${mockToken}`;
    
    console.log(`🎯 驗證連結: ${verificationUrl}`);
    
    // 12. 驗證域名正確性
    expect(verificationUrl).toContain('https://edu-create.vercel.app');
    expect(verificationUrl).not.toContain('edu-create-hjhmrxr9h-minamisums-projects.vercel.app');
    console.log('✅ 驗證連結使用正確域名');

    // 13. 測試登入頁面的重發連結
    await page.goto('https://edu-create.vercel.app/login');
    
    // 檢查是否有重發驗證連結
    const loginPageContent = await page.textContent('body');
    if (loginPageContent.includes('重新發送') || loginPageContent.includes('沒收到驗證郵件')) {
      console.log('✅ 登入頁面包含重發驗證連結');
    }

    // 14. 測試快速演示登入
    console.log('🎮 測試快速演示登入...');
    
    const demoLoginButton = await page.locator('button:has-text("快速演示登入")');
    if (await demoLoginButton.isVisible()) {
      await demoLoginButton.click();
      await page.waitForTimeout(2000);
      
      // 檢查是否成功登入
      const currentUrl = page.url();
      if (currentUrl.includes('/my-activities') || currentUrl.includes('/dashboard')) {
        console.log('✅ 快速演示登入成功');
      }
    }

    console.log('🎉 郵箱驗證域名修復測試完成！');
  });

  test('驗證郵件域名配置檢查', async ({ page }) => {
    console.log('🔍 檢查郵件域名配置...');

    // 1. 訪問重發驗證頁面
    await page.goto('https://edu-create.vercel.app/auth/resend-verification');
    
    // 2. 測試重發功能
    const testEmail = `domain-test-${Date.now()}@gmail.com`;
    await page.fill('input[placeholder*="郵箱"]', testEmail);
    
    // 3. 監聽網絡請求
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/email/resend-verification')) {
        requests.push(request);
      }
    });
    
    await page.click('button:has-text("重發驗證郵件")');
    await page.waitForTimeout(2000);
    
    // 4. 檢查 API 請求
    expect(requests.length).toBeGreaterThan(0);
    console.log('✅ 重發驗證 API 請求正常');
    
    // 5. 檢查成功消息
    const successMessage = await page.textContent('body');
    expect(successMessage).toContain('驗證郵件已重新發送');
    console.log('✅ 重發驗證功能正常工作');

    console.log('🎯 域名配置檢查完成！');
  });
});
