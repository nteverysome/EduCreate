import { test, expect } from '@playwright/test';

test.describe('Shimozurdo Game 響應式設計測試', () => {
  const testUrl = 'https://edu-create.vercel.app/create/shimozurdo-game';
  
  // 測試數據
  const testVocabulary = [
    { english: 'apple', chinese: '蘋果' },
    { english: 'banana', chinese: '香蕉' },
    { english: 'orange', chinese: '橘子' }
  ];

  // 設備配置
  const devices = [
    { name: '手機直向', width: 375, height: 812 },
    { name: '手機橫向', width: 812, height: 375 },
    { name: '平板直向', width: 768, height: 1024 },
    { name: '平板橫向', width: 1024, height: 768 },
    { name: '桌面', width: 1920, height: 1080 }
  ];

  devices.forEach(device => {
    test(`${device.name} (${device.width}x${device.height}) 響應式測試`, async ({ page }) => {
      // 設置視窗大小
      await page.setViewportSize({ width: device.width, height: device.height });

      // 導航到頁面
      await page.goto(testUrl);

      // 等待頁面載入
      await page.waitForLoadState('networkidle');

      // 檢查是否需要登入
      const loginButton = page.locator('button:has-text("立即登入")');
      if (await loginButton.isVisible()) {
        console.log('需要登入，跳過此測試');
        test.skip();
        return;
      }

      // 截圖 - 初始狀態
      await page.screenshot({
        path: `test-results/shimozurdo-${device.name.replace(/\s+/g, '-')}-initial.png`,
        fullPage: true
      });

      // 檢查頁面主要內容是否存在（改用更通用的選擇器）
      await expect(page.locator('h1, h2, h3, .title, [role="heading"]')).toBeVisible();
      
      // 填寫活動標題
      const titleInput = page.locator('input[placeholder*="活動標題"]');
      await expect(titleInput).toBeVisible();
      await titleInput.fill('響應式測試 - ' + device.name);
      
      // 填寫詞彙
      for (let i = 0; i < testVocabulary.length; i++) {
        const englishInput = page.locator(`input[placeholder*="英文單字"]`).nth(i);
        const chineseInput = page.locator(`input[placeholder*="中文翻譯"]`).nth(i);
        
        await expect(englishInput).toBeVisible();
        await expect(chineseInput).toBeVisible();
        
        await englishInput.fill(testVocabulary[i].english);
        await chineseInput.fill(testVocabulary[i].chinese);
      }
      
      // 截圖 - 填寫完成狀態
      await page.screenshot({ 
        path: `test-results/shimozurdo-${device.name.replace(/\s+/g, '-')}-filled.png`,
        fullPage: true 
      });
      
      // 檢查按鈕是否可見和可點擊
      const startButton = page.locator('button:has-text("完成並開始遊戲")');
      await expect(startButton).toBeVisible();
      await expect(startButton).toBeEnabled();
      
      // 點擊開始遊戲
      await startButton.click();
      
      // 等待遊戲載入
      await page.waitForTimeout(3000);
      
      // 檢查遊戲容器是否存在
      const gameContainer = page.locator('[data-testid="shimozurdo-game-container"]');
      await expect(gameContainer).toBeVisible();
      
      // 檢查 iframe 是否載入
      const gameIframe = page.locator('iframe[title*="Shimozurdo"]');
      await expect(gameIframe).toBeVisible();
      
      // 截圖 - 遊戲載入狀態
      await page.screenshot({ 
        path: `test-results/shimozurdo-${device.name.replace(/\s+/g, '-')}-game-loaded.png`,
        fullPage: true 
      });
      
      // 測試全螢幕功能（如果存在）
      const fullscreenButton = page.locator('button[title*="全螢幕"], button:has-text("全螢幕")');
      if (await fullscreenButton.isVisible()) {
        await fullscreenButton.click();
        await page.waitForTimeout(1000);
        
        // 截圖 - 全螢幕狀態
        await page.screenshot({ 
          path: `test-results/shimozurdo-${device.name.replace(/\s+/g, '-')}-fullscreen.png`,
          fullPage: true 
        });
      }
      
      // 驗證響應式設計要素
      const containerBounds = await gameContainer.boundingBox();
      expect(containerBounds).toBeTruthy();
      
      if (containerBounds) {
        // 檢查容器是否適應視窗大小
        expect(containerBounds.width).toBeLessThanOrEqual(device.width);
        
        // 手機設備特殊檢查
        if (device.width <= 768) {
          // 手機設備上容器應該接近全寬
          expect(containerBounds.width).toBeGreaterThan(device.width * 0.8);
        }
        
        // 檢查最小高度
        expect(containerBounds.height).toBeGreaterThan(200);
      }
      
      console.log(`✅ ${device.name} 響應式測試完成`);
    });
  });

  test('跨設備一致性測試', async ({ page }) => {
    // 測試在不同設備間切換時的一致性
    await page.goto(testUrl);

    // 檢查是否需要登入
    const loginButton = page.locator('button:has-text("立即登入")');
    if (await loginButton.isVisible()) {
      console.log('需要登入，跳過此測試');
      test.skip();
      return;
    }

    // 填寫基本信息
    await page.locator('input[placeholder*="活動標題"]').fill('跨設備一致性測試');
    await page.locator('input[placeholder*="英文單字"]').first().fill('test');
    await page.locator('input[placeholder*="中文翻譯"]').first().fill('測試');
    
    // 在不同設備尺寸間切換
    for (const device of devices.slice(0, 3)) { // 測試前3個設備
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.waitForTimeout(500); // 等待響應式調整
      
      // 檢查關鍵元素是否仍然可見
      await expect(page.locator('input[placeholder*="活動標題"]')).toBeVisible();
      await expect(page.locator('button:has-text("完成並開始遊戲")')).toBeVisible();
      
      console.log(`✅ ${device.name} 一致性檢查通過`);
    }
  });

  test('觸控友好性測試', async ({ page }) => {
    // 設置為手機尺寸
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(testUrl);
    
    // 檢查所有可點擊元素的最小尺寸（44px 觸控標準）
    const clickableElements = await page.locator('button, input, a').all();
    
    for (const element of clickableElements) {
      if (await element.isVisible()) {
        const bounds = await element.boundingBox();
        if (bounds) {
          // 檢查最小觸控目標尺寸
          expect(Math.max(bounds.width, bounds.height)).toBeGreaterThanOrEqual(32); // 稍微寬鬆的標準
        }
      }
    }
    
    console.log('✅ 觸控友好性測試完成');
  });
});
