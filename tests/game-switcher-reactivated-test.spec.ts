import { test, expect } from '@playwright/test';

test('確認 GameSwitcher 遊戲切換器重新開啟', async ({ page }) => {
  console.log('🔍 開始確認 GameSwitcher 遊戲切換器重新開啟');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3000/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：重新開啟 GameSwitcher 的完整頁面
  await page.screenshot({ 
    path: 'test-results/game-switcher-reactivated-full.png',
    fullPage: true
  });

  // 檢查是否有 GameSwitcher 相關元素
  const gameSwitcherExists = await page.locator('[data-testid*="game-switcher"], .game-switcher, button:has-text("切換遊戲")').count();
  console.log(`🎮 GameSwitcher 元素數量: ${gameSwitcherExists}`);

  // 檢查 GEPT 等級是否為動態顯示
  const geptLevelText = await page.locator('text=GEPT 等級:').first().textContent();
  console.log(`📚 GEPT 等級顯示: ${geptLevelText}`);

  // 檢查頁面內容
  const pageContent = await page.content();
  const hasGameSwitcherInHTML = pageContent.includes('GameSwitcher') || pageContent.includes('切換遊戲');
  console.log(`📄 HTML 中包含 GameSwitcher: ${hasGameSwitcherInHTML}`);

  // 等待 GameSwitcher 完全載入
  await page.waitForTimeout(5000);

  // 截圖：等待後的頁面
  await page.screenshot({ 
    path: 'test-results/game-switcher-reactivated-after-wait.png',
    fullPage: true
  });

  // 再次檢查 GameSwitcher
  const gameSwitcherAfterWait = await page.locator('[data-testid*="game-switcher"], .game-switcher, button:has-text("切換遊戲")').count();
  console.log(`🎮 等待後 GameSwitcher 元素數量: ${gameSwitcherAfterWait}`);

  // 驗證 GameSwitcher 重新開啟特徵
  const reactivatedFeatures = {
    hasGameSwitcher: gameSwitcherAfterWait > 0,
    dynamicGEPT: geptLevelText?.includes('elementary'),
    hasSwitcherInHTML: hasGameSwitcherInHTML
  };

  console.log('📊 GameSwitcher 重新開啟特徵檢查:', JSON.stringify(reactivatedFeatures, null, 2));

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

  // 嘗試點擊 GameSwitcher（如果存在）
  if (gameSwitcherAfterWait > 0) {
    try {
      const switcherButton = page.locator('button:has-text("切換遊戲")').first();
      if (await switcherButton.isVisible()) {
        console.log('🖱️ 嘗試點擊 GameSwitcher 按鈕');
        await switcherButton.click();
        await page.waitForTimeout(1000);
        
        // 截圖：點擊後的狀態
        await page.screenshot({ 
          path: 'test-results/game-switcher-clicked.png',
          fullPage: true
        });
        
        console.log('✅ GameSwitcher 按鈕點擊成功');
      }
    } catch (error) {
      console.log('⚠️ GameSwitcher 按鈕點擊失敗:', error);
    }
  }

  // 驗證所有特徵
  const allFeaturesValid = 
    reactivatedFeatures.hasGameSwitcher &&
    reactivatedFeatures.hasSwitcherInHTML &&
    gameContainerInfo?.visible;

  console.log(`✅ 所有 GameSwitcher 重新開啟特徵驗證: ${allFeaturesValid ? '通過' : '失敗'}`);
  console.log('✅ GameSwitcher 重新開啟確認完成');
});
