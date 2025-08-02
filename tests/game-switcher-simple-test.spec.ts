import { test, expect } from '@playwright/test';

test('簡化版 GameSwitcher 功能確認', async ({ page }) => {
  console.log('🔍 開始簡化版 GameSwitcher 功能確認');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3000/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：GameSwitcher 開啟狀態
  await page.screenshot({ 
    path: 'test-results/game-switcher-simple-test.png',
    fullPage: true
  });

  // 檢查是否有 GameSwitcher 相關元素
  const gameSwitcherExists = await page.locator('button:has-text("切換遊戲")').count();
  console.log(`🎮 GameSwitcher 按鈕數量: ${gameSwitcherExists}`);

  // 檢查是否有載入中的 GameSwitcher
  const loadingGameSwitcher = await page.locator('div:has-text("載入")').count();
  console.log(`⏳ 載入中的 GameSwitcher: ${loadingGameSwitcher}`);

  // 檢查頁面內容
  const pageContent = await page.content();
  const hasGameSwitcherInHTML = pageContent.includes('GameSwitcher') || pageContent.includes('切換遊戲');
  console.log(`📄 HTML 中包含 GameSwitcher: ${hasGameSwitcherInHTML}`);

  // 等待更長時間讓組件完全載入
  await page.waitForTimeout(5000);

  // 再次檢查
  const gameSwitcherAfterWait = await page.locator('button:has-text("切換遊戲")').count();
  console.log(`🎮 等待後 GameSwitcher 按鈕數量: ${gameSwitcherAfterWait}`);

  // 截圖：等待後的狀態
  await page.screenshot({ 
    path: 'test-results/game-switcher-simple-after-wait.png',
    fullPage: true
  });

  // 檢查遊戲容器
  const gameContainerInfo = await page.evaluate(() => {
    const gameContainer = document.querySelector('.bg-gray-50.rounded-lg.overflow-hidden');
    if (gameContainer) {
      const rect = gameContainer.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        visible: rect.width > 0 && rect.height > 0
      };
    }
    return null;
  });

  console.log('📦 遊戲容器資訊:', JSON.stringify(gameContainerInfo, null, 2));

  // 簡化的驗證結果
  const simpleValidation = {
    hasGameSwitcherButton: gameSwitcherAfterWait > 0,
    hasSwitcherInHTML: hasGameSwitcherInHTML,
    gameContainerVisible: gameContainerInfo?.visible || false
  };

  console.log('📊 簡化驗證結果:', JSON.stringify(simpleValidation, null, 2));

  const allValid = simpleValidation.hasGameSwitcherButton && 
                   simpleValidation.hasSwitcherInHTML && 
                   simpleValidation.gameContainerVisible;

  console.log(`✅ GameSwitcher 功能驗證: ${allValid ? '成功' : '失敗'}`);
  console.log('✅ 簡化版 GameSwitcher 功能確認完成');
});
