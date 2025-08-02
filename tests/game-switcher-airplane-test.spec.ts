import { test, expect } from '@playwright/test';

test('飛機遊戲頁面 GameSwitcher 功能測試', async ({ page }) => {
  console.log('🔍 開始測試飛機遊戲頁面的 GameSwitcher 功能');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3000/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：完整頁面
  await page.screenshot({ 
    path: 'test-results/airplane-game-with-switcher-full.png',
    fullPage: true
  });

  // 檢查是否有 GameSwitcher 相關元素
  const gameSwitcherExists = await page.locator('[data-testid*="game-switcher"], .game-switcher, button:has-text("切換遊戲")').count();
  console.log(`🎮 GameSwitcher 元素數量: ${gameSwitcherExists}`);

  // 檢查是否有載入中的文字
  const loadingText = await page.locator('text=載入完整版 Airplane 遊戲中...').count();
  console.log(`⏳ 載入文字數量: ${loadingText}`);

  // 等待更長時間讓組件完全載入
  await page.waitForTimeout(5000);

  // 再次檢查 GameSwitcher
  const gameSwitcherAfterWait = await page.locator('[data-testid*="game-switcher"], .game-switcher, button:has-text("切換遊戲")').count();
  console.log(`🎮 等待後 GameSwitcher 元素數量: ${gameSwitcherAfterWait}`);

  // 截圖：等待後的頁面
  await page.screenshot({ 
    path: 'test-results/airplane-game-after-wait.png',
    fullPage: true
  });

  // 檢查頁面內容
  const pageContent = await page.content();
  const hasGameSwitcherInHTML = pageContent.includes('GameSwitcher') || pageContent.includes('切換遊戲');
  console.log(`📄 HTML 中包含 GameSwitcher: ${hasGameSwitcherInHTML}`);

  // 檢查控制台錯誤
  const consoleMessages = await page.evaluate(() => {
    return window.console.error.toString();
  });

  console.log('✅ 飛機遊戲 GameSwitcher 功能測試完成');
});
