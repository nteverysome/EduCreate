/**
 * 手機版遊戲頁面佈局優化測試
 * 驗證緊湊標頭設計和垂直空間優化
 */

import { test, expect } from '@playwright/test';

test.describe('手機版遊戲頁面佈局優化', () => {
  test.beforeEach(async ({ page }) => {
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/games/switcher');
    await page.waitForLoadState('networkidle');
  });

  test('應該顯示緊湊標頭設計', async ({ page }) => {
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
  });

  test('應該移除重複的遊戲資訊卡片', async ({ page }) => {
    // 確認沒有重複的手機版遊戲狀態資訊
    const duplicateInfo = page.locator('.md\\:hidden.mb-3.flex.items-center.justify-between.bg-blue-50');
    await expect(duplicateInfo).toHaveCount(0);

    // 確認沒有重複的遊戲詳細信息卡片（非緊湊模式）
    const gameDetails = page.locator('.flex.items-center.space-x-2.md\\:space-x-4.w-full');
    await expect(gameDetails).toHaveCount(0);
  });

  test('應該減少垂直空間佔用', async ({ page }) => {
    // 測量遊戲容器的位置
    const gameContainer = page.locator('[data-testid="game-container"]');
    await expect(gameContainer).toBeVisible();

    const containerBox = await gameContainer.boundingBox();
    expect(containerBox).not.toBeNull();
    
    // 遊戲容器應該在更高的位置（更接近頁面頂部）
    // 之前的位置大約在 227px，現在應該顯著減少
    expect(containerBox!.y).toBeLessThan(150); // 目標：減少至少 40%
  });

  test('緊湊標頭應該響應式適配', async ({ page }) => {
    const gameHeader = page.locator('[data-testid="game-header"]');
    
    // 檢查手機版樣式
    await expect(gameHeader).toHaveCSS('padding', '6px 10px');
    await expect(gameHeader).toHaveCSS('font-size', '13px');

    // 檢查元素是否正確換行
    const leftInfo = gameHeader.locator('.left-info');
    const rightControls = gameHeader.locator('.right-controls');
    
    await expect(leftInfo).toBeVisible();
    await expect(rightControls).toBeVisible();
  });

  test('切換遊戲功能應該正常工作', async ({ page }) => {
    const gameHeader = page.locator('[data-testid="game-header"]');
    const switchButton = gameHeader.locator('.switch-button');
    
    // 點擊切換遊戲按鈕
    await switchButton.click();
    
    // 檢查下拉選單是否出現
    const dropdown = page.locator('.dropdown-menu');
    await expect(dropdown).toBeVisible();
    
    // 檢查遊戲選項
    const gameOptions = dropdown.locator('.dropdown-item');
    await expect(gameOptions).toHaveCount(3); // 應該有3個遊戲選項
  });

  test('GEPT 等級顯示應該正確', async ({ page }) => {
    const gameHeader = page.locator('[data-testid="game-header"]');
    const geptDisplay = gameHeader.locator('.gept');
    
    // 檢查初始 GEPT 等級
    await expect(geptDisplay).toContainText('GEPT：初級');
    
    // 檢查樣式
    await expect(geptDisplay).toHaveCSS('font-size', '11px');
    await expect(geptDisplay).toHaveClass(/bg-blue-50/);
  });

  test('遊戲畫面應該立即可見', async ({ page }) => {
    // 檢查遊戲 iframe 容器
    const gameIframe = page.locator('iframe');
    await expect(gameIframe).toBeVisible();
    
    // 檢查遊戲容器的位置
    const gameContainer = page.locator('[data-testid="game-container"]');
    const containerBox = await gameContainer.boundingBox();
    
    // 遊戲容器應該在視窗可見範圍內
    expect(containerBox!.y).toBeLessThan(667); // 小於視窗高度
    expect(containerBox!.y + containerBox!.height).toBeGreaterThan(0);
  });

  test('桌面版應該不受影響', async ({ page }) => {
    // 切換到桌面視窗大小
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 檢查緊湊標頭不應該在桌面版顯示
    const gameHeader = page.locator('[data-testid="game-header"]');
    await expect(gameHeader).toHaveCount(0);

    // 檢查原始的遊戲詳細信息應該存在
    const gameDetails = page.locator('.flex.items-center.space-x-2.md\\:space-x-4.w-full');
    await expect(gameDetails).toBeVisible();
  });

  test('無障礙功能應該保持', async ({ page }) => {
    const gameHeader = page.locator('[data-testid="game-header"]');
    const switchButton = gameHeader.locator('.switch-button');
    
    // 檢查按鈕的最小觸控目標大小
    const buttonBox = await switchButton.boundingBox();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(32); // 最小 32px 高度
    
    // 檢查按鈕是否可聚焦
    await switchButton.focus();
    await expect(switchButton).toBeFocused();
    
    // 檢查鍵盤操作
    await page.keyboard.press('Enter');
    const dropdown = page.locator('.dropdown-menu');
    await expect(dropdown).toBeVisible();
  });
});

test.describe('手機版佈局優化性能測試', () => {
  test('頁面載入性能應該保持', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/games/switcher');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 頁面載入時間應該小於 3 秒
    expect(loadTime).toBeLessThan(3000);
  });

  test('遊戲切換性能應該保持', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/games/switcher');
    await page.waitForLoadState('networkidle');

    const gameHeader = page.locator('[data-testid="game-header"]');
    const switchButton = gameHeader.locator('.switch-button');
    
    const startTime = Date.now();
    await switchButton.click();
    await page.locator('.dropdown-menu').waitFor({ state: 'visible' });
    const switchTime = Date.now() - startTime;
    
    // 切換時間應該小於 500ms
    expect(switchTime).toBeLessThan(500);
  });
});
