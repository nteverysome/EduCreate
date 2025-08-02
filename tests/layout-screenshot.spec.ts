import { test } from '@playwright/test';

test('GameSwitcher 重新排版後截圖', async ({ page }) => {
  console.log('🔍 開始 GameSwitcher 重新排版截圖測試');

  // 導航到頁面
  await page.goto('http://localhost:3000/games/switcher');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 頁面載入完成');

  // 截圖完整頁面
  await page.screenshot({ 
    path: 'test-results/game-switcher-new-layout-full.png',
    fullPage: true 
  });
  console.log('📸 已截圖：完整頁面（新排版）');

  // 截圖遊戲區域
  const gameArea = page.locator('.game-switcher');
  await gameArea.screenshot({ 
    path: 'test-results/game-switcher-new-layout-game.png'
  });
  console.log('📸 已截圖：遊戲區域（新排版）');

  // 截圖統計區域
  const statsArea = page.locator('h3:has-text("學習統計")').locator('..');
  if (await statsArea.count() > 0) {
    await statsArea.screenshot({ 
      path: 'test-results/game-switcher-new-layout-stats.png'
    });
    console.log('📸 已截圖：統計區域（新排版）');
  }

  // 測試響應式設計
  console.log('📱 測試響應式設計...');
  
  // 平板尺寸
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(1000);
  await page.screenshot({ 
    path: 'test-results/game-switcher-new-layout-tablet.png',
    fullPage: true 
  });
  console.log('📸 已截圖：平板版本（新排版）');

  // 手機尺寸
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await page.screenshot({ 
    path: 'test-results/game-switcher-new-layout-mobile.png',
    fullPage: true 
  });
  console.log('📸 已截圖：手機版本（新排版）');

  console.log('✅ GameSwitcher 重新排版截圖測試完成');
});
