/**
 * 手機版遊戲頁面佈局優化快速驗證測試
 */

import { test, expect } from '@playwright/test';

test.describe('手機版佈局優化快速驗證', () => {
  test('緊湊標頭應該正確顯示', async ({ page }) => {
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });

    // Firefox 優化：增加超時時間和重試機制
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      // 重試一次
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    // 檢查緊湊標頭是否存在
    const gameHeader = page.locator('[data-testid="game-header"]');
    await expect(gameHeader).toBeVisible();

    // 檢查左側資訊
    const leftInfo = gameHeader.locator('.left-info');
    await expect(leftInfo).toBeVisible();
    await expect(leftInfo.locator('strong')).toContainText('飛機遊戲');
    await expect(leftInfo.locator('.status')).toContainText('✅ 已完成');

    // 檢查右側控制
    const rightControls = gameHeader.locator('.right-controls');
    await expect(rightControls).toBeVisible();
    await expect(rightControls.locator('.gept')).toContainText('GEPT：初級');
    await expect(rightControls.locator('.switch-button')).toContainText('切換遊戲');

    console.log('✅ 緊湊標頭顯示正常');
  });

  test('切換遊戲功能應該正常工作', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Firefox 優化：增加超時時間和重試機制
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      // 重試一次
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    const gameHeader = page.locator('[data-testid="game-header"]');
    const switchButton = gameHeader.locator('.switch-button');
    
    // 點擊切換遊戲按鈕
    await switchButton.click();
    
    // 檢查下拉選單是否出現
    const dropdown = page.locator('.dropdown-menu');
    await expect(dropdown).toBeVisible();
    
    console.log('✅ 切換遊戲功能正常');
  });

  test('桌面版應該顯示完整功能', async ({ page }) => {
    // 切換到桌面視窗大小
    await page.setViewportSize({ width: 1024, height: 768 });

    // Firefox 優化：增加超時時間和重試機制
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      // 重試一次
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    // 檢查緊湊標頭在桌面版不應該存在（JavaScript 條件渲染）
    const gameHeader = page.locator('[data-testid="game-header"]');
    await expect(gameHeader).toHaveCount(0);

    // 檢查桌面版的詳細遊戲信息應該顯示
    const gameDetails = page.locator('.flex.items-center.space-x-2.md\\:space-x-4.w-full');
    await expect(gameDetails).toBeVisible();

    // 檢查 GEPT 選擇器在桌面版應該顯示
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    await expect(geptSelector).toBeVisible();

    console.log('✅ 桌面版顯示完整功能');
  });
});
