const { test, expect } = require('@playwright/test');

test.describe('郵箱驗證 E2E 測試', () => {
  const testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'MySecure@Pass2024!';

  test.beforeEach(async ({ page }) => {
    // 確保開始時在註冊頁面
    await page.goto('/register');
    await expect(page).toHaveTitle(/註冊/);
  });

  test('註冊功能基本測試', async ({ page }) => {
    console.log('🧪 開始註冊功能測試');
    console.log('📧 測試郵箱:', testEmail);

    // 步驟 1: 填寫註冊表單
    console.log('📝 步驟 1: 填寫註冊表單');

    await page.getByRole('textbox', { name: '電子郵件地址' }).fill(testEmail);
    await page.getByRole('textbox', { name: '密碼', exact: true }).fill(testPassword);
    await page.getByRole('textbox', { name: '確認密碼' }).fill(testPassword);

    // 選擇位置
    await page.getByLabel('位置').selectOption('JP'); // 選擇日本

    // 勾選使用條款
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) {
        checkbox.click();
      }
    });

    // 驗證表單填寫完成
    await expect(page.getByRole('button', { name: '註冊', exact: true })).not.toBeDisabled();

    // 步驟 2: 提交註冊表單
    console.log('🚀 步驟 2: 提交註冊表單');

    // 監聽網絡請求
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/register') && response.status() === 201
    );

    await page.getByRole('button', { name: '註冊', exact: true }).click();

    // 等待註冊請求完成
    const response = await responsePromise;
    const responseData = await response.json();

    console.log('✅ 註冊響應:', {
      status: response.status(),
      message: responseData.message,
      emailSent: responseData.emailSent,
      userId: responseData.user?.id
    });

    // 步驟 3: 驗證成功提示顯示
    console.log('✅ 步驟 3: 驗證成功提示');

    await expect(page.locator('text=用戶創建成功，請檢查您的電子郵件以驗證帳戶')).toBeVisible();
    await expect(page.locator('text=📧 請檢查您的收件匣')).toBeVisible();

    // 驗證表單已清空
    await expect(page.getByRole('textbox', { name: '電子郵件地址' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: '密碼', exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: '註冊', exact: true })).toBeDisabled();

    console.log('🎉 註冊功能測試完成！');
  });

  test('測試表單驗證', async ({ page }) => {
    console.log('🧪 測試表單驗證');

    // 測試空表單提交
    await expect(page.getByRole('button', { name: '註冊', exact: true })).toBeDisabled();

    // 測試密碼不匹配
    await page.getByRole('textbox', { name: '電子郵件地址' }).fill('test@example.com');
    await page.getByRole('textbox', { name: '密碼', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: '確認密碼' }).fill('password456');

    // 按鈕應該仍然禁用
    await expect(page.getByRole('button', { name: '註冊', exact: true })).toBeDisabled();

    console.log('✅ 表單驗證正常');
  });
});
