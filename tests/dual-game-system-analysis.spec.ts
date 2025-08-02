import { test, expect } from '@playwright/test';

test('雙重遊戲系統分析測試', async ({ page }) => {
  console.log('🔍 開始分析雙重遊戲系統問題');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3002/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：雙重遊戲系統問題
  await page.screenshot({ 
    path: 'test-results/dual-game-system-full.png',
    fullPage: true
  });

  // 等待所有組件載入
  await page.waitForTimeout(5000);

  // 截圖：等待後的頁面
  await page.screenshot({ 
    path: 'test-results/dual-game-system-after-wait.png',
    fullPage: true
  });

  // 分析雙重遊戲系統
  console.log('📊 分析雙重遊戲系統...');

  // 檢查 GameSwitcher 組件
  const gameSwitcherElements = await page.locator('.game-switcher').count();
  console.log(`🎛️ GameSwitcher 組件數量: ${gameSwitcherElements}`);

  // 檢查 AirplaneCollisionGame 組件
  const airplaneGameElements = await page.locator('.airplane-collision-game').count();
  console.log(`✈️ AirplaneCollisionGame 組件數量: ${airplaneGameElements}`);

  // 檢查 iframe 元素（GameSwitcher 內部的遊戲載入器）
  const iframeElements = await page.locator('iframe').count();
  console.log(`🖼️ iframe 元素數量: ${iframeElements}`);

  // 檢查遊戲容器
  const gameContainers = await page.locator('.game-container').count();
  console.log(`📦 遊戲容器數量: ${gameContainers}`);

  // 檢查 "切換遊戲" 按鈕
  const switchButtons = await page.locator('button:has-text("切換遊戲")').count();
  console.log(`🔄 "切換遊戲" 按鈕數量: ${switchButtons}`);

  // 檢查 "開始遊戲" 按鈕
  const startButtons = await page.locator('button:has-text("開始遊戲")').count();
  console.log(`🎮 "開始遊戲" 按鈕數量: ${startButtons}`);

  // 檢查 GEPT 等級選擇器
  const geptSelectors = await page.locator('text=GEPT 等級:').count();
  console.log(`📚 GEPT 等級選擇器數量: ${geptSelectors}`);

  // 分析頁面結構
  const pageStructure = await page.evaluate(() => {
    const mainContainer = document.querySelector('.bg-white.rounded-xl.shadow-lg');
    if (mainContainer) {
      const children = Array.from(mainContainer.children);
      return children.map((child, index) => {
        const hasGameSwitcher = child.querySelector('.game-switcher') !== null;
        const hasAirplaneGame = child.querySelector('.airplane-collision-game') !== null;
        const hasIframe = child.querySelector('iframe') !== null;
        const hasGameContainer = child.querySelector('.game-container') !== null;
        
        return {
          index: index + 1,
          className: child.className,
          hasGameSwitcher,
          hasAirplaneGame,
          hasIframe,
          hasGameContainer,
          textPreview: child.textContent?.substring(0, 50) + '...'
        };
      });
    }
    return [];
  });

  console.log('🏗️ 頁面結構分析:');
  pageStructure.forEach(section => {
    console.log(`  區塊 ${section.index}:`);
    console.log(`    - GameSwitcher: ${section.hasGameSwitcher ? '✅' : '❌'}`);
    console.log(`    - AirplaneGame: ${section.hasAirplaneGame ? '✅' : '❌'}`);
    console.log(`    - iframe: ${section.hasIframe ? '✅' : '❌'}`);
    console.log(`    - GameContainer: ${section.hasGameContainer ? '✅' : '❌'}`);
  });

  // 檢查 GameSwitcher 內部結構
  const gameSwitcherStructure = await page.evaluate(() => {
    const gameSwitcher = document.querySelector('.game-switcher');
    if (gameSwitcher) {
      const hasGameInfo = gameSwitcher.querySelector('h3') !== null;
      const hasSwitchButton = gameSwitcher.querySelector('button:has-text("切換遊戲")') !== null;
      const hasGeptSelector = gameSwitcher.querySelector('text=GEPT 等級:') !== null;
      const hasIframe = gameSwitcher.querySelector('iframe') !== null;
      const hasGameStatus = gameSwitcher.querySelector('.bg-gray-50') !== null;
      
      return {
        hasGameInfo,
        hasSwitchButton,
        hasGeptSelector,
        hasIframe,
        hasGameStatus
      };
    }
    return null;
  });

  console.log('🎛️ GameSwitcher 內部結構:', JSON.stringify(gameSwitcherStructure, null, 2));

  // 雙重系統問題分析
  const dualSystemAnalysis = {
    hasMultipleGameSystems: gameSwitcherElements > 0 && airplaneGameElements > 0,
    hasGameSwitcherWithIframe: gameSwitcherElements > 0 && iframeElements > 0,
    hasRedundantGameContainers: gameContainers > 1,
    hasMultipleSwitchButtons: switchButtons > 1,
    hasMultipleStartButtons: startButtons > 1,
    hasMultipleGeptSelectors: geptSelectors > 1
  };

  console.log('📊 雙重系統問題分析:', JSON.stringify(dualSystemAnalysis, null, 2));

  // 推測問題原因
  let problemCause = '';
  if (dualSystemAnalysis.hasMultipleGameSystems) {
    problemCause = 'GameSwitcher 和 AirplaneCollisionGame 同時存在，造成雙重遊戲系統';
  }
  if (dualSystemAnalysis.hasGameSwitcherWithIframe) {
    problemCause += ' GameSwitcher 內部有 iframe 載入器，與直接的遊戲組件衝突';
  }

  console.log(`🔍 推測問題原因: ${problemCause}`);

  // 最終截圖
  await page.screenshot({ 
    path: 'test-results/dual-game-system-analysis-final.png',
    fullPage: true
  });

  console.log('✅ 雙重遊戲系統分析完成');
});
