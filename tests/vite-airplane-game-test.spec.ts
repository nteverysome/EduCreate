import { test, expect } from '@playwright/test';

test('Vite 版飛機遊戲連線測試', async ({ page }) => {
  console.log('🔍 開始測試 Vite 版飛機遊戲連線');

  // 導航到 Vite 版飛機遊戲
  await page.goto('http://localhost:3001/games/airplane-game/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ Vite 版飛機遊戲頁面載入完成');

  // 截圖：Vite 版遊戲
  await page.screenshot({ 
    path: 'test-results/vite-airplane-game-loaded.png',
    fullPage: true
  });

  // 檢查頁面標題
  const pageTitle = await page.title();
  console.log(`📄 頁面標題: ${pageTitle}`);

  // 檢查是否有遊戲容器
  const gameContainer = await page.locator('#game-container').count();
  console.log(`🎮 遊戲容器數量: ${gameContainer}`);

  // 檢查是否有載入畫面
  const loadingElement = await page.locator('#loading').count();
  console.log(`⏳ 載入元素數量: ${loadingElement}`);

  // 等待遊戲完全載入
  await page.waitForTimeout(5000);

  // 檢查 Phaser 遊戲是否載入
  const phaserGame = await page.evaluate(() => {
    return typeof window.Phaser !== 'undefined';
  });
  console.log(`🎯 Phaser 遊戲載入: ${phaserGame}`);

  // 檢查 Canvas 元素
  const canvasElements = await page.locator('canvas').count();
  console.log(`🖼️ Canvas 元素數量: ${canvasElements}`);

  // 截圖：遊戲載入後
  await page.screenshot({ 
    path: 'test-results/vite-airplane-game-after-load.png',
    fullPage: true
  });

  // 檢查控制台錯誤
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 驗證結果
  const viteGameStatus = {
    pageLoaded: pageTitle.includes('Airplane'),
    gameContainerExists: gameContainer > 0,
    canvasExists: canvasElements > 0,
    noConsoleErrors: consoleErrors.length === 0
  };

  console.log('📊 Vite 遊戲狀態:', JSON.stringify(viteGameStatus, null, 2));

  const allValid = viteGameStatus.pageLoaded && 
                   viteGameStatus.gameContainerExists && 
                   viteGameStatus.canvasExists;

  console.log(`✅ Vite 版飛機遊戲連線測試: ${allValid ? '成功' : '失敗'}`);
  console.log('✅ Vite 版飛機遊戲連線測試完成');
});
