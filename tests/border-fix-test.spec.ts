import { test } from '@playwright/test';

test('檢查遊戲容器邊框修復', async ({ page }) => {
  console.log('🔍 開始檢查遊戲容器邊框修復');

  // 導航到頁面
  await page.goto('http://localhost:3000/games/switcher');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 頁面載入完成');

  // 截圖修復後的效果
  await page.screenshot({ 
    path: 'test-results/game-container-border-fixed.png',
    fullPage: true 
  });
  console.log('📸 已截圖：邊框修復後的完整頁面');

  // 截圖遊戲容器區域
  const gameContainer = page.locator('.game-switcher');
  await gameContainer.screenshot({ 
    path: 'test-results/game-container-border-fixed-detail.png'
  });
  console.log('📸 已截圖：遊戲容器詳細區域');

  // 檢查 iframe 的樣式
  const iframe = page.locator('iframe');
  const iframeStyles = await iframe.evaluate((el) => {
    const computedStyle = window.getComputedStyle(el);
    return {
      border: computedStyle.border,
      outline: computedStyle.outline,
      borderColor: computedStyle.borderColor,
      outlineColor: computedStyle.outlineColor
    };
  });
  
  console.log('🔍 iframe 樣式檢查:', iframeStyles);

  // 檢查容器的樣式
  const container = page.locator('.game-switcher > div').last();
  const containerStyles = await container.evaluate((el) => {
    const computedStyle = window.getComputedStyle(el);
    return {
      border: computedStyle.border,
      outline: computedStyle.outline,
      borderColor: computedStyle.borderColor,
      outlineColor: computedStyle.outlineColor
    };
  });
  
  console.log('🔍 容器樣式檢查:', containerStyles);

  console.log('✅ 遊戲容器邊框修復檢查完成');
});
