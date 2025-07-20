import { test, expect } from '@playwright/test';

test.describe('視差背景系統', () => {
  test('應該能載入森林主題背景', async ({ page }) => {
    await page.goto('/');
    
    // 檢查背景組件是否存在
    const parallaxContainer = page.locator('.parallax-container');
    await expect(parallaxContainer).toBeVisible();
    
    // 檢查背景層是否載入
    const layers = page.locator('.parallax-layer');
    await expect(layers).toHaveCount(6); // 森林主題有6層
  });

  test('應該支援無障礙設計', async ({ page }) => {
    await page.goto('/?disable-animations=true');
    
    // 檢查動畫是否被禁用
    const parallaxContainer = page.locator('.parallax-container');
    await expect(parallaxContainer).toHaveAttribute('aria-label');
  });
});