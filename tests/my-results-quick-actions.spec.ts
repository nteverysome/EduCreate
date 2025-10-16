import { test, expect } from '@playwright/test';

test.describe('課業結果快速操作按鈕測試', () => {
  test.beforeEach(async ({ page }) => {
    // 導航到登入頁面
    await page.goto('https://edu-create.vercel.app/auth/signin');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 登入
    await page.fill('input[name="email"]', 'minamisum@gmail.com');
    await page.fill('input[name="password"]', 'Aa123456');
    await page.click('button[type="submit"]');
    
    // 等待登入完成並導航到課業結果頁面
    await page.waitForURL('**/my-activities', { timeout: 10000 });
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForLoadState('networkidle');
  });

  test('應該顯示快速操作按鈕', async ({ page }) => {
    // 等待結果卡片載入
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // 截圖：課業結果列表
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250116_課業結果_快速操作按鈕_顯示_v1_01.png',
      fullPage: true 
    });
    
    // 檢查是否有快速操作按鈕區域
    const actionButtons = page.locator('.border-t.border-gray-100');
    await expect(actionButtons.first()).toBeVisible();
    
    // 檢查複製連結按鈕
    const copyLinkButton = page.locator('button:has-text("複製連結")').first();
    await expect(copyLinkButton).toBeVisible();
    
    // 檢查 QR Code 按鈕
    const qrCodeButton = page.locator('button:has-text("QR 代碼")').first();
    await expect(qrCodeButton).toBeVisible();
    
    // 檢查刪除按鈕
    const deleteButton = page.locator('button:has-text("刪除")').first();
    await expect(deleteButton).toBeVisible();
    
    console.log('✅ 所有快速操作按鈕都正確顯示');
  });

  test('應該能夠複製學生分享連結', async ({ page }) => {
    // 等待結果卡片載入
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // 點擊複製連結按鈕
    const copyLinkButton = page.locator('button:has-text("複製連結")').first();
    await copyLinkButton.click();
    
    // 等待複製成功提示
    await page.waitForTimeout(500);
    
    // 截圖：複製成功狀態
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250116_課業結果_複製連結_成功_v1_01.png',
      fullPage: true 
    });
    
    // 檢查是否顯示「已複製」提示
    const successMessage = page.locator('text=已複製');
    await expect(successMessage.first()).toBeVisible({ timeout: 3000 });
    
    console.log('✅ 複製連結功能正常工作');
  });

  test('應該能夠打開 QR Code 模態框', async ({ page }) => {
    // 等待結果卡片載入
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // 點擊 QR Code 按鈕
    const qrCodeButton = page.locator('button:has-text("QR 代碼")').first();
    await qrCodeButton.click();
    
    // 等待 QR Code 模態框出現
    await page.waitForTimeout(1000);
    
    // 截圖：QR Code 模態框
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250116_課業結果_QR代碼_顯示_v1_01.png',
      fullPage: true 
    });
    
    // 檢查 QR Code 模態框是否出現
    const qrModal = page.locator('[role="dialog"]');
    await expect(qrModal).toBeVisible({ timeout: 5000 });
    
    console.log('✅ QR Code 模態框正常打開');
  });

  test('應該能夠觸發刪除確認', async ({ page }) => {
    // 等待結果卡片載入
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // 點擊刪除按鈕
    const deleteButton = page.locator('button:has-text("刪除")').first();
    await deleteButton.click();
    
    // 等待刪除確認對話框出現
    await page.waitForTimeout(1000);
    
    // 截圖：刪除確認對話框
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250116_課業結果_刪除確認_顯示_v1_01.png',
      fullPage: true 
    });
    
    // 檢查刪除確認對話框是否出現
    const deleteModal = page.locator('[role="dialog"]');
    await expect(deleteModal).toBeVisible({ timeout: 5000 });
    
    console.log('✅ 刪除確認對話框正常打開');
  });

  test('響應式設計測試 - 手機視圖', async ({ page }) => {
    // 設置手機視口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 等待結果卡片載入
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // 截圖：手機視圖
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250116_課業結果_手機視圖_顯示_v1_01.png',
      fullPage: true 
    });
    
    // 檢查按鈕是否仍然可見（可能只顯示圖標）
    const copyLinkButton = page.locator('button[title="複製連結"]').first();
    await expect(copyLinkButton).toBeVisible();
    
    const qrCodeButton = page.locator('button[title="顯示 QR 代碼"]').first();
    await expect(qrCodeButton).toBeVisible();
    
    const deleteButton = page.locator('button[title="刪除"]').first();
    await expect(deleteButton).toBeVisible();
    
    console.log('✅ 手機視圖下按鈕正常顯示');
  });

  test('響應式設計測試 - 平板視圖', async ({ page }) => {
    // 設置平板視口
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 等待結果卡片載入
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // 截圖：平板視圖
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250116_課業結果_平板視圖_顯示_v1_01.png',
      fullPage: true 
    });
    
    // 檢查按鈕文字是否顯示
    const copyLinkButton = page.locator('button:has-text("複製連結")').first();
    await expect(copyLinkButton).toBeVisible();
    
    console.log('✅ 平板視圖下按鈕正常顯示');
  });
});

