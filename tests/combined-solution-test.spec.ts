import { test } from '@playwright/test';

test('檢查組合解決方案效果', async ({ page }) => {
  console.log('🔍 開始檢查組合解決方案效果（深灰色邊框 + 放大容器）');

  // 導航到頁面
  await page.goto('http://localhost:3000/games/switcher');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 頁面載入完成');

  // 截圖組合解決方案效果
  await page.screenshot({ 
    path: 'test-results/game-container-combined-solution.png',
    fullPage: true 
  });
  console.log('📸 已截圖：組合解決方案完整頁面');

  // 截圖遊戲容器區域
  const gameContainer = page.locator('.game-switcher');
  await gameContainer.screenshot({ 
    path: 'test-results/game-container-combined-solution-detail.png'
  });
  console.log('📸 已截圖：組合解決方案遊戲容器');

  // 檢查容器樣式
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
  
  console.log('📦 容器樣式:', containerStyles);

  // 檢查 iframe 邊框
  const iframe = page.locator('iframe');
  const iframeStyles = await iframe.evaluate((el) => {
    const computedStyle = window.getComputedStyle(el);
    return {
      border: computedStyle.border,
      borderColor: computedStyle.borderColor,
      borderWidth: computedStyle.borderWidth
    };
  });
  
  console.log('🎨 iframe 邊框樣式:', iframeStyles);

  console.log('✅ 組合解決方案效果檢查完成');
});
