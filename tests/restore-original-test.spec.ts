import { test } from '@playwright/test';

test('確認回到原本狀態', async ({ page }) => {
  console.log('🔍 開始確認回到原本狀態');

  // 導航到頁面
  await page.goto('http://localhost:3000/games/switcher');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 頁面載入完成');

  // 截圖原本狀態
  await page.screenshot({ 
    path: 'test-results/game-container-original-state.png',
    fullPage: true 
  });
  console.log('📸 已截圖：回到原本狀態的完整頁面');

  // 截圖遊戲容器區域
  const gameContainer = page.locator('.game-switcher');
  await gameContainer.screenshot({ 
    path: 'test-results/game-container-original-state-detail.png'
  });
  console.log('📸 已截圖：原本狀態的遊戲容器');

  // 檢查容器樣式是否回到原本狀態
  const container = page.locator('.flex.justify-center.mb-8 > div');
  const containerStyles = await container.evaluate((el) => {
    const computedStyle = window.getComputedStyle(el);
    return {
      maxWidth: computedStyle.maxWidth,
      padding: computedStyle.padding,
      backgroundColor: computedStyle.backgroundColor,
      borderRadius: computedStyle.borderRadius
    };
  });
  
  console.log('📦 容器樣式（應該回到原本）:', containerStyles);

  // 檢查 iframe 邊框是否回到原本狀態
  const iframe = page.locator('iframe');
  const iframeStyles = await iframe.evaluate((el) => {
    const computedStyle = window.getComputedStyle(el);
    return {
      border: computedStyle.border,
      borderColor: computedStyle.borderColor,
      outline: computedStyle.outline
    };
  });
  
  console.log('🎨 iframe 樣式（應該回到原本）:', iframeStyles);

  console.log('✅ 確認回到原本狀態檢查完成');
});
