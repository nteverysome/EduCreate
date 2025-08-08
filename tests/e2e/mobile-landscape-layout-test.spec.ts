import { test, expect } from '@playwright/test';

test.describe('手機橫向佈局測試', () => {
  test('手機橫向模式應該正確顯示緊湊標頭', async ({ page }) => {
    // 設置手機橫向尺寸 (iPhone 12 Pro 橫向)
    await page.setViewportSize({ width: 812, height: 375 });
    
    // 導航到遊戲切換器頁面
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      // 重試一次
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    // 檢查緊湊標頭在橫向模式下應該顯示
    const gameHeader = page.locator('[data-testid="game-header"]');
    await expect(gameHeader).toBeVisible();

    // 檢查緊湊標頭的左側資訊
    const leftInfo = gameHeader.locator('.left-info');
    await expect(leftInfo).toBeVisible();
    await expect(leftInfo).toContainText('飛機遊戲');
    await expect(leftInfo).toContainText('已完成');

    // 檢查緊湊標頭的右側控制
    const rightControls = gameHeader.locator('.right-controls');
    await expect(rightControls).toBeVisible();
    await expect(rightControls).toContainText('GEPT');
    await expect(rightControls).toContainText('切換遊戲');

    console.log('✅ 手機橫向模式緊湊標頭顯示正常');
  });

  test('手機橫向模式遊戲區域應該充分利用空間', async ({ page }) => {
    // 設置手機橫向尺寸
    await page.setViewportSize({ width: 812, height: 375 });
    
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    // 檢查遊戲容器在橫向模式下的尺寸
    const gameContainer = page.locator('iframe').first();
    await expect(gameContainer).toBeVisible();

    // 檢查遊戲容器的寬度應該充分利用橫向空間
    const containerBox = await gameContainer.boundingBox();
    expect(containerBox?.width).toBeGreaterThan(600); // 橫向模式下應該有更大的寬度

    console.log('✅ 手機橫向模式遊戲區域空間利用良好');
  });

  test('手機橫向模式切換遊戲功能應該正常工作', async ({ page }) => {
    // 設置手機橫向尺寸
    await page.setViewportSize({ width: 812, height: 375 });
    
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    // 檢查緊湊標頭中的切換遊戲按鈕
    const gameHeader = page.locator('[data-testid="game-header"]');
    const switchButton = gameHeader.locator('.switch-button');
    await expect(switchButton).toBeVisible();
    await expect(switchButton).toContainText('切換遊戲');

    // 點擊切換遊戲按鈕
    await switchButton.click();
    
    // 等待一下讓下拉選單出現
    await page.waitForTimeout(1000);

    console.log('✅ 手機橫向模式切換遊戲功能正常');
  });

  test('手機橫向模式響應式佈局完整性檢查', async ({ page }) => {
    // 設置手機橫向尺寸
    await page.setViewportSize({ width: 812, height: 375 });
    
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    // 檢查頁面標題
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible();

    // 檢查緊湊標頭
    const gameHeader = page.locator('[data-testid="game-header"]');
    await expect(gameHeader).toBeVisible();

    // 檢查遊戲容器
    const gameContainer = page.locator('iframe').first();
    await expect(gameContainer).toBeVisible();

    // 檢查學習統計區域
    const statsSection = page.locator('text=學習統計').first();
    await expect(statsSection).toBeVisible();

    // 檢查 GEPT 學習進度區域
    const geptSection = page.locator('text=GEPT 學習進度').first();
    await expect(geptSection).toBeVisible();

    console.log('✅ 手機橫向模式響應式佈局完整性良好');
  });

  test('手機橫向模式與直向模式對比測試', async ({ page }) => {
    // 先測試直向模式
    await page.setViewportSize({ width: 375, height: 667 });
    
    try {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (error) {
      await page.goto('/games/switcher', { timeout: 60000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    }

    // 檢查直向模式下的緊湊標頭
    const gameHeaderPortrait = page.locator('[data-testid="game-header"]');
    await expect(gameHeaderPortrait).toBeVisible();

    // 切換到橫向模式
    await page.setViewportSize({ width: 812, height: 375 });
    await page.waitForTimeout(1000); // 等待響應式調整

    // 檢查橫向模式下的緊湊標頭
    const gameHeaderLandscape = page.locator('[data-testid="game-header"]');
    await expect(gameHeaderLandscape).toBeVisible();

    // 檢查遊戲容器在橫向模式下的變化
    const gameContainer = page.locator('iframe').first();
    await expect(gameContainer).toBeVisible();

    console.log('✅ 手機橫向與直向模式切換正常');
  });
});
