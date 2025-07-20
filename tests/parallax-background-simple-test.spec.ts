import { test, expect } from '@playwright/test';

test.describe('視差背景系統簡化測試', () => {
  test('主頁入口可見性測試', async ({ page }) => {
    console.log('🔍 測試主頁視差背景入口');
    
    await page.goto('/');
    
    // 檢查視差背景功能卡片
    const parallaxCard = page.locator('[data-testid="feature-parallax-background"]');
    await expect(parallaxCard).toBeVisible();
    
    // 檢查標題
    await expect(parallaxCard.locator('h3')).toContainText('視差背景系統');
    
    // 檢查連結
    const link = parallaxCard.locator('[data-testid="parallax-background-link"]');
    await expect(link).toBeVisible();
    
    console.log('✅ 主頁入口測試通過');
  });

  test('視差背景頁面基本載入測試', async ({ page }) => {
    console.log('🔍 測試視差背景頁面載入');
    
    await page.goto('/games/parallax-background-demo');
    
    // 檢查頁面標題
    const title = page.locator('text=EduCreate 視差背景系統');
    await expect(title).toBeVisible();
    
    // 檢查主題選擇按鈕
    await expect(page.locator('button:has-text("森林")')).toBeVisible();
    await expect(page.locator('button:has-text("沙漠")')).toBeVisible();
    await expect(page.locator('button:has-text("天空")')).toBeVisible();
    await expect(page.locator('button:has-text("月亮")')).toBeVisible();
    
    console.log('✅ 視差背景頁面載入測試通過');
  });

  test('基本主題切換測試', async ({ page }) => {
    console.log('🔍 測試基本主題切換功能');
    
    await page.goto('/games/parallax-background-demo');
    
    // 測試切換到沙漠主題
    const desertButton = page.locator('button:has-text("沙漠")');
    await desertButton.click();
    
    // 檢查按鈕狀態變化
    await expect(desertButton).toHaveClass(/border-blue-500/);
    
    console.log('✅ 基本主題切換測試通過');
  });
});
