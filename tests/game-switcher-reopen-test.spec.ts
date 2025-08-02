import { test, expect } from '@playwright/test';

test('GameSwitcher 重新開啟驗證測試', async ({ page }) => {
  console.log('🔍 開始驗證 GameSwitcher 重新開啟功能');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3002/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：重新開啟 GameSwitcher 的完整頁面
  await page.screenshot({ 
    path: 'test-results/game-switcher-reopen-full.png',
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
    path: 'test-results/game-switcher-reopen-after-wait.png',
    fullPage: true
  });

  // 再次檢查 GameSwitcher
  const gameSwitcherAfterWait = await page.locator('button:has-text("切換遊戲")').count();
  console.log(`🎮 等待後 GameSwitcher 按鈕數量: ${gameSwitcherAfterWait}`);

  // 驗證 GameSwitcher 重新開啟特徵
  const reopenFeatures = {
    hasGameSwitcher: gameSwitcherAfterWait > 0,
    dynamicGEPT: geptLevelText?.includes('elementary'),
    hasSwitcherInHTML: hasGameSwitcherInHTML
  };

  console.log('📊 GameSwitcher 重新開啟特徵檢查:', JSON.stringify(reopenFeatures, null, 2));

  // 嘗試點擊 GameSwitcher（如果存在）
  if (gameSwitcherAfterWait > 0) {
    try {
      console.log('🖱️ 嘗試點擊 GameSwitcher 按鈕');
      await page.locator('button:has-text("切換遊戲")').first().click();
      await page.waitForTimeout(1000);
      
      // 截圖：點擊後的下拉選單
      await page.screenshot({ 
        path: 'test-results/game-switcher-dropdown-reopen.png',
        fullPage: true
      });
      
      // 檢查下拉選單中的遊戲選項
      const gameOptions = await page.locator('button:has-text("飛機")').count();
      console.log(`🎯 飛機遊戲選項數量: ${gameOptions}`);

      // 檢查是否有開發中遊戲
      const developmentGames = await page.locator('text=開發中').count();
      console.log(`🚧 開發中遊戲數量: ${developmentGames}`);

      // 檢查具體的遊戲選項
      const availableGamesList = await page.evaluate(() => {
        const gameButtons = Array.from(document.querySelectorAll('button[class*="w-full text-left"]'));
        return gameButtons.map(button => {
          const nameElement = button.querySelector('.font-medium');
          return nameElement ? nameElement.textContent : '';
        }).filter(name => name);
      });

      console.log('📋 可用遊戲列表:', availableGamesList);
      
      console.log('✅ GameSwitcher 按鈕點擊成功');
      
      // 關閉下拉選單
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
    } catch (error) {
      console.log('⚠️ GameSwitcher 按鈕點擊失敗:', error);
    }
  }

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

  // 驗證所有特徵
  const allFeaturesValid = 
    reopenFeatures.hasGameSwitcher &&
    reopenFeatures.hasSwitcherInHTML &&
    gameContainerInfo?.visible;

  console.log(`✅ 所有 GameSwitcher 重新開啟特徵驗證: ${allFeaturesValid ? '通過' : '失敗'}`);

  // 最終截圖
  await page.screenshot({ 
    path: 'test-results/game-switcher-reopen-final.png',
    fullPage: true
  });

  console.log('✅ GameSwitcher 重新開啟驗證測試完成');
});
