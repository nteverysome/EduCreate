import { test, expect } from '@playwright/test';

test('Wordwall 尺寸飛機遊戲測試', async ({ page }) => {
  console.log('🔍 開始測試 Wordwall 尺寸的飛機遊戲');

  // 導航到 Vite 版飛機遊戲
  await page.goto('http://localhost:3001/games/airplane-game/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ Wordwall 尺寸飛機遊戲頁面載入完成');

  // 截圖：Wordwall 尺寸版本
  await page.screenshot({ 
    path: 'test-results/wordwall-size-airplane-game.png',
    fullPage: true
  });

  // 檢查遊戲容器尺寸
  const containerInfo = await page.evaluate(() => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      const rect = gameContainer.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(gameContainer);
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        cssWidth: computedStyle.width,
        cssHeight: computedStyle.height,
        visible: rect.width > 0 && rect.height > 0
      };
    }
    return null;
  });

  console.log('📦 遊戲容器尺寸資訊:', JSON.stringify(containerInfo, null, 2));

  // 檢查 Canvas 元素尺寸
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        actualWidth: canvas.width,
        actualHeight: canvas.height,
        visible: rect.width > 0 && rect.height > 0
      };
    }
    return null;
  });

  console.log('🖼️ Canvas 尺寸資訊:', JSON.stringify(canvasInfo, null, 2));

  // 等待遊戲完全載入
  await page.waitForTimeout(5000);

  // 截圖：遊戲載入後
  await page.screenshot({ 
    path: 'test-results/wordwall-size-airplane-after-load.png',
    fullPage: true
  });

  // 驗證 Wordwall 標準尺寸
  const isWordwallSize = containerInfo && 
    containerInfo.width === 1400 && 
    containerInfo.height === 750;

  console.log(`📏 Wordwall 標準尺寸驗證: ${isWordwallSize ? '✅ 符合' : '❌ 不符合'}`);

  if (containerInfo) {
    console.log(`📊 實際尺寸: ${containerInfo.width}x${containerInfo.height}`);
    console.log(`🎯 目標尺寸: 1400x750`);
    console.log(`📐 尺寸差異: 寬度${containerInfo.width - 1400}, 高度${containerInfo.height - 750}`);
  }

  // 檢查遊戲是否正常運行
  const gameRunning = await page.evaluate(() => {
    return typeof window.Phaser !== 'undefined' && 
           document.querySelector('canvas') !== null;
  });

  console.log(`🎮 遊戲運行狀態: ${gameRunning ? '✅ 正常' : '❌ 異常'}`);

  // 驗證結果
  const wordwallTestResult = {
    containerCorrectSize: isWordwallSize,
    gameRunning: gameRunning,
    containerVisible: containerInfo?.visible || false,
    canvasVisible: canvasInfo?.visible || false
  };

  console.log('📊 Wordwall 尺寸測試結果:', JSON.stringify(wordwallTestResult, null, 2));

  const allValid = wordwallTestResult.containerCorrectSize && 
                   wordwallTestResult.gameRunning && 
                   wordwallTestResult.containerVisible && 
                   wordwallTestResult.canvasVisible;

  console.log(`✅ Wordwall 尺寸飛機遊戲測試: ${allValid ? '成功' : '失敗'}`);
  console.log('✅ Wordwall 尺寸飛機遊戲測試完成');
});
