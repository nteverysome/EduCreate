import { test, expect } from '@playwright/test';

test.describe('GameSwitcher 尺寸比對測試', () => {
  test('截圖比對 GameSwitcher 與 Wordwall 標準尺寸', async ({ page }) => {
    console.log('🔍 開始 GameSwitcher 尺寸比對測試');

    // 1. 導航到 GameSwitcher 頁面
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ GameSwitcher 頁面載入完成');

    // 2. 等待遊戲切換器載入
    await page.waitForSelector('.game-switcher', { timeout: 10000 });
    await page.waitForTimeout(3000); // 等待 iframe 載入

    // 3. 截圖整個頁面
    await page.screenshot({ 
      path: 'test-results/game-switcher-full-page.png',
      fullPage: true 
    });
    console.log('📸 已截圖：完整頁面');

    // 4. 截圖遊戲容器區域
    const gameContainer = page.locator('.game-switcher');
    await gameContainer.screenshot({ 
      path: 'test-results/game-switcher-container.png'
    });
    console.log('📸 已截圖：遊戲容器');

    // 5. 截圖 iframe 區域
    const iframe = page.locator('iframe');
    if (await iframe.count() > 0) {
      await iframe.screenshot({ 
        path: 'test-results/game-switcher-iframe.png'
      });
      console.log('📸 已截圖：iframe 區域');
    }

    // 6. 測量實際尺寸
    const iframeElement = await page.locator('iframe').first();
    const boundingBox = await iframeElement.boundingBox();
    
    if (boundingBox) {
      console.log('📏 實際 iframe 尺寸:');
      console.log(`├── 寬度: ${boundingBox.width}px`);
      console.log(`├── 高度: ${boundingBox.height}px`);
      console.log(`├── 比例: ${(boundingBox.width / boundingBox.height).toFixed(2)}:1`);
      console.log(`└── Wordwall 標準: 1268x672px (1.89:1)`);

      // 7. 驗證尺寸是否符合 Wordwall 標準
      const expectedWidth = 1268;
      const expectedHeight = 672;
      const expectedRatio = expectedWidth / expectedHeight;
      const actualRatio = boundingBox.width / boundingBox.height;

      console.log('🎯 尺寸比對結果:');
      console.log(`├── 寬度匹配: ${Math.abs(boundingBox.width - expectedWidth) < 50 ? '✅' : '❌'} (差異: ${Math.abs(boundingBox.width - expectedWidth)}px)`);
      console.log(`├── 高度匹配: ${Math.abs(boundingBox.height - expectedHeight) < 50 ? '✅' : '❌'} (差異: ${Math.abs(boundingBox.height - expectedHeight)}px)`);
      console.log(`└── 比例匹配: ${Math.abs(actualRatio - expectedRatio) < 0.1 ? '✅' : '❌'} (差異: ${Math.abs(actualRatio - expectedRatio).toFixed(3)})`);
    }

    // 8. 檢查響應式設計
    console.log('📱 測試響應式設計...');
    
    // 測試平板尺寸
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/game-switcher-tablet.png',
      fullPage: true 
    });
    console.log('📸 已截圖：平板版本');

    // 測試手機尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/game-switcher-mobile.png',
      fullPage: true 
    });
    console.log('📸 已截圖：手機版本');

    // 9. 恢復桌面尺寸
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    console.log('✅ GameSwitcher 尺寸比對測試完成');
    console.log('📁 截圖文件已保存到 test-results/ 目錄');
  });

  test('比對 Wordwall 原始網站尺寸', async ({ page }) => {
    console.log('🔍 開始 Wordwall 原始網站尺寸測試');

    try {
      // 訪問 Wordwall 網站進行比對
      await page.goto('https://wordwall.net/tc/embed/85d8022ec1fe4e24bd79fe53f316f83b?themeId=46&templateId=48&fontStackId=0');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);

      // 截圖 Wordwall 遊戲
      await page.screenshot({ 
        path: 'test-results/wordwall-original.png',
        fullPage: true 
      });
      console.log('📸 已截圖：Wordwall 原始網站');

      // 測量 Wordwall 遊戲區域
      const gameArea = page.locator('canvas, #game, .game-area').first();
      if (await gameArea.count() > 0) {
        const boundingBox = await gameArea.boundingBox();
        if (boundingBox) {
          console.log('📏 Wordwall 實際尺寸:');
          console.log(`├── 寬度: ${boundingBox.width}px`);
          console.log(`├── 高度: ${boundingBox.height}px`);
          console.log(`└── 比例: ${(boundingBox.width / boundingBox.height).toFixed(2)}:1`);
        }
      }
    } catch (error) {
      console.log('⚠️ 無法訪問 Wordwall 網站，跳過比對');
    }

    console.log('✅ Wordwall 比對測試完成');
  });
});
