import { test, expect } from '@playwright/test';

test.describe('視差背景系統快速驗證', () => {
  test.setTimeout(60000); // 設置60秒超時

  test('主頁入口快速測試', async ({ page }) => {
    console.log('🔍 快速測試主頁視差背景入口');
    
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // 等待頁面基本載入
    await page.waitForSelector('body', { timeout: 30000 });
    
    // 檢查視差背景功能卡片
    const parallaxCard = page.locator('[data-testid="feature-parallax-background"]');
    
    // 等待元素出現，如果30秒內沒出現就失敗
    try {
      await expect(parallaxCard).toBeVisible({ timeout: 30000 });
      console.log('✅ 主頁入口測試通過');
    } catch (error) {
      console.error('❌ 主頁入口測試失敗:', error);
      
      // 截圖調試
      await page.screenshot({ path: 'test-results/homepage-debug.png' });
      
      // 檢查頁面內容
      const bodyContent = await page.locator('body').textContent();
      console.log('頁面內容:', bodyContent?.substring(0, 500));
      
      throw error;
    }
  });

  test('視差背景頁面基本載入測試', async ({ page }) => {
    console.log('🔍 快速測試視差背景頁面載入');
    
    try {
      await page.goto('http://localhost:3000/games/parallax-background-demo', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // 等待頁面基本載入
      await page.waitForSelector('body', { timeout: 30000 });
      
      // 檢查頁面標題
      const title = page.locator('text=EduCreate 視差背景系統');
      await expect(title).toBeVisible({ timeout: 30000 });
      
      console.log('✅ 視差背景頁面載入測試通過');
      
    } catch (error) {
      console.error('❌ 視差背景頁面載入測試失敗:', error);
      
      // 截圖調試
      await page.screenshot({ path: 'test-results/parallax-page-debug.png' });
      
      // 檢查頁面內容
      const bodyContent = await page.locator('body').textContent();
      console.log('頁面內容:', bodyContent?.substring(0, 500));
      
      throw error;
    }
  });

  test('基本主題按鈕存在測試', async ({ page }) => {
    console.log('🔍 快速測試主題按鈕存在');
    
    await page.goto('http://localhost:3000/games/parallax-background-demo', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 等待頁面基本載入
    await page.waitForSelector('body', { timeout: 30000 });
    
    // 檢查四個主題按鈕是否存在
    const forestButton = page.locator('button:has-text("森林")');
    const desertButton = page.locator('button:has-text("沙漠")');
    const skyButton = page.locator('button:has-text("天空")');
    const moonButton = page.locator('button:has-text("月亮")');
    
    await expect(forestButton).toBeVisible({ timeout: 30000 });
    await expect(desertButton).toBeVisible({ timeout: 30000 });
    await expect(skyButton).toBeVisible({ timeout: 30000 });
    await expect(moonButton).toBeVisible({ timeout: 30000 });
    
    console.log('✅ 基本主題按鈕存在測試通過');
  });
});
