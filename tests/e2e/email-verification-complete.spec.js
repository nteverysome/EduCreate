const { test, expect } = require('@playwright/test');

test.describe('完整郵箱驗證流程測試', () => {
  const testEmail = `test-${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  test('完整的註冊和郵箱驗證流程', async ({ page }) => {
    console.log('🚀 開始完整郵箱驗證流程測試');
    console.log('📧 測試郵箱:', testEmail);
    
    // 1. 前往註冊頁面
    console.log('📝 步驟 1: 前往註冊頁面');
    await page.goto('https://edu-create.vercel.app/register');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 截圖記錄註冊頁面
    await page.screenshot({ 
      path: 'email-verification-01-register-page.png',
      fullPage: true 
    });
    
    // 2. 填寫註冊表單
    console.log('✍️ 步驟 2: 填寫註冊表單');
    
    await page.getByRole('textbox', { name: '電子郵件地址' }).fill(testEmail);
    await page.getByRole('textbox', { name: '密碼', exact: true }).fill(testPassword);
    await page.getByRole('textbox', { name: '確認密碼' }).fill(testPassword);
    
    // 選擇位置
    await page.getByLabel('位置').selectOption('JP');
    
    // 勾選條款同意
    await page.getByRole('checkbox', { name: '我接受 使用條款 和 隱私權政策' }).check();
    
    await page.screenshot({ 
      path: 'email-verification-02-form-filled.png',
      fullPage: true 
    });
    
    // 3. 提交註冊表單
    console.log('📤 步驟 3: 提交註冊表單');
    
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/register') && response.status() === 201
    );
    
    await page.getByRole('button', { name: '註冊', exact: true }).click();
    
    const response = await responsePromise;
    const responseData = await response.json();
    
    console.log('✅ 註冊 API 回應:', responseData);
    
    // 4. 驗證成功訊息
    console.log('✅ 步驟 4: 驗證成功訊息');
    
    await expect(page.locator('text=用戶創建成功，請檢查您的電子郵件以驗證帳戶')).toBeVisible();
    
    await page.screenshot({ 
      path: 'email-verification-03-success-message.png',
      fullPage: true 
    });
    
    // 5. 檢查用戶是否創建（使用測試 API）
    console.log('🔍 步驟 5: 檢查用戶創建狀態');
    
    if (process.env.NODE_ENV === 'development') {
      const checkUserResponse = await page.request.get(`/api/auth/check-user?email=${testEmail}`);
      const userData = await checkUserResponse.json();
      
      console.log('👤 用戶數據:', userData);
      
      expect(userData.exists).toBe(true);
      expect(userData.emailVerified).toBe(false);
    }
    
    // 6. 模擬郵箱驗證（在開發環境中）
    console.log('📧 步驟 6: 模擬郵箱驗證');
    
    if (process.env.NODE_ENV === 'development') {
      // 獲取驗證 token
      const tokenResponse = await page.request.get(`/api/test/get-verification-token?email=${testEmail}`);
      const tokenData = await tokenResponse.json();
      
      if (tokenData.token) {
        console.log('🔑 找到驗證 token:', tokenData.token.substring(0, 8) + '...');
        
        // 訪問驗證連結
        await page.goto(`/api/auth/verify-email?token=${tokenData.token}`);
        
        // 應該重定向到成功頁面
        await page.waitForURL('**/auth/email-verified**');
        
        await page.screenshot({ 
          path: 'email-verification-04-verified-success.png',
          fullPage: true 
        });
        
        // 驗證成功頁面內容
        await expect(page.locator('text=電子郵件驗證成功')).toBeVisible();
        
        console.log('✅ 郵箱驗證成功！');
      }
    }
    
    // 7. 測試登入功能
    console.log('🔐 步驟 7: 測試登入功能');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('textbox', { name: '電子郵件' }).fill(testEmail);
    await page.getByRole('textbox', { name: '密碼' }).fill(testPassword);
    
    await page.getByRole('button', { name: '登入' }).click();
    
    // 等待登入成功（重定向到首頁或儀表板）
    await page.waitForURL('**/', { timeout: 10000 });
    
    await page.screenshot({ 
      path: 'email-verification-05-login-success.png',
      fullPage: true 
    });
    
    console.log('✅ 登入成功！');
    
    // 8. 清理測試數據（在開發環境中）
    console.log('🧹 步驟 8: 清理測試數據');
    
    if (process.env.NODE_ENV === 'development') {
      // 這裡可以添加清理測試用戶的邏輯
      console.log('⚠️ 測試用戶已創建，請手動清理:', testEmail);
    }
    
    console.log('🎉 完整郵箱驗證流程測試完成！');
  });
  
  test('Gmail SMTP 配置驗證', async ({ page }) => {
    console.log('🔧 Gmail SMTP 配置驗證測試');
    
    // 檢查環境變數是否正確設定
    const envVars = [
      'EMAIL_SERVER_HOST',
      'EMAIL_SERVER_PORT', 
      'EMAIL_SERVER_USER',
      'EMAIL_SERVER_PASSWORD',
      'EMAIL_FROM'
    ];
    
    console.log('📋 檢查環境變數配置:');
    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${varName.includes('PASSWORD') ? '***' : value}`);
      } else {
        console.log(`❌ ${varName}: 未設定`);
      }
    });
    
    // 檢查 Gmail SMTP 設定是否正確
    const gmailUser = process.env.EMAIL_SERVER_USER;
    if (gmailUser && gmailUser.includes('@gmail.com')) {
      console.log('✅ Gmail 地址格式正確');
    } else {
      console.log('❌ Gmail 地址格式錯誤或未設定');
    }
    
    const appPassword = process.env.EMAIL_SERVER_PASSWORD;
    if (appPassword && appPassword.length >= 16) {
      console.log('✅ 應用程式密碼長度正確');
    } else {
      console.log('❌ 應用程式密碼長度不正確或未設定');
    }
    
    console.log('🎯 Gmail SMTP 配置檢查完成');
  });
});
