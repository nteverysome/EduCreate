import { test } from '@playwright/test';

test('檢查深灰色邊框效果', async ({ page }) => {
  console.log('🔍 開始檢查深灰色邊框效果');

  // 導航到頁面
  await page.goto('http://localhost:3000/games/switcher');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 頁面載入完成');

  // 截圖深灰色邊框效果
  await page.screenshot({ 
    path: 'test-results/game-container-gray-border.png',
    fullPage: true 
  });
  console.log('📸 已截圖：深灰色邊框完整頁面');

  // 截圖遊戲容器區域
  const gameContainer = page.locator('.game-switcher');
  await gameContainer.screenshot({ 
    path: 'test-results/game-container-gray-border-detail.png'
  });
  console.log('📸 已截圖：深灰色邊框遊戲容器');

  // 檢查邊框顏色
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

  console.log('✅ 深灰色邊框效果檢查完成');
});
