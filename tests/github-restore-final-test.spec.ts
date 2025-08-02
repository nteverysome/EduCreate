import { test, expect } from '@playwright/test';

test('最終 GitHub 恢復驗證測試', async ({ page }) => {
  console.log('🔍 開始驗證從 GitHub 恢復的最終狀態');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3000/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：GitHub 恢復後的完整頁面
  await page.screenshot({ 
    path: 'test-results/github-restore-final-full.png',
    fullPage: true
  });

  // 檢查是否沒有 GameSwitcher 相關元素
  const gameSwitcherExists = await page.locator('[data-testid*="game-switcher"], .game-switcher, button:has-text("切換遊戲")').count();
  console.log(`🎮 GameSwitcher 元素數量: ${gameSwitcherExists}`);

  // 檢查 GEPT 等級是否為固定的 Elementary
  const geptLevelText = await page.locator('text=GEPT 等級:').first().textContent();
  console.log(`📚 GEPT 等級顯示: ${geptLevelText}`);

  // 檢查頁面內容
  const pageContent = await page.content();
  const hasGameSwitcherInHTML = pageContent.includes('GameSwitcher') || pageContent.includes('切換遊戲');
  console.log(`📄 HTML 中包含 GameSwitcher: ${hasGameSwitcherInHTML}`);

  // 檢查是否有載入中的文字
  const loadingText = await page.locator('text=載入完整版 Airplane 遊戲中...').count();
  console.log(`⏳ 載入文字數量: ${loadingText}`);

  // 等待遊戲完全載入
  await page.waitForTimeout(5000);

  // 截圖：等待後的頁面
  await page.screenshot({ 
    path: 'test-results/github-restore-final-after-wait.png',
    fullPage: true
  });

  // 驗證 GitHub 原始版本特徵
  const githubOriginalFeatures = {
    noGameSwitcher: gameSwitcherExists === 0,
    elementaryGEPT: geptLevelText?.includes('Elementary'),
    noSwitcherInHTML: !hasGameSwitcherInHTML,
    hasLoadingText: loadingText > 0
  };

  console.log('📊 GitHub 原始版本特徵檢查:', JSON.stringify(githubOriginalFeatures, null, 2));

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

  // 檢查頁面標題和基本結構
  const pageTitle = await page.title();
  const hasAirplaneTitle = await page.locator('h1:has-text("Airplane Collision Game")').count();
  
  console.log(`📄 頁面標題: ${pageTitle}`);
  console.log(`🛩️ 飛機遊戲標題數量: ${hasAirplaneTitle}`);

  // 驗證所有特徵
  const allFeaturesValid = 
    githubOriginalFeatures.noGameSwitcher &&
    githubOriginalFeatures.elementaryGEPT &&
    githubOriginalFeatures.noSwitcherInHTML &&
    gameContainerInfo?.visible &&
    hasAirplaneTitle > 0;

  console.log(`✅ 所有 GitHub 原始版本特徵驗證: ${allFeaturesValid ? '通過' : '失敗'}`);

  // 檢查 Vite 版本是否仍然可用
  console.log('🔍 檢查 Vite 版本可用性...');
  
  try {
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    
    const viteGameContainer = await page.evaluate(() => {
      const container = document.getElementById('game-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible: rect.width > 0 && rect.height > 0
        };
      }
      return null;
    });
    
    console.log('🎮 Vite 版本容器資訊:', JSON.stringify(viteGameContainer, null, 2));
    
    // 截圖：Vite 版本狀態
    await page.screenshot({ 
      path: 'test-results/vite-version-after-restore.png',
      fullPage: true
    });
    
  } catch (error) {
    console.log('⚠️ Vite 版本檢查失敗:', error.message);
  }

  console.log('✅ GitHub 恢復最終驗證測試完成');
});
