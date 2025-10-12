import { test, expect } from '@playwright/test';

test.describe('Shimozurdo Game 視覺響應式測試', () => {
  const testUrl = 'https://edu-create.vercel.app/create/shimozurdo-game';
  
  // 設備配置
  const devices = [
    { name: '手機直向', width: 375, height: 812 },
    { name: '手機橫向', width: 812, height: 375 },
    { name: '平板直向', width: 768, height: 1024 },
    { name: '平板橫向', width: 1024, height: 768 },
    { name: '桌面', width: 1920, height: 1080 }
  ];

  devices.forEach(device => {
    test(`${device.name} (${device.width}x${device.height}) 視覺響應式測試`, async ({ page }) => {
      // 設置視窗大小
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // 導航到頁面
      await page.goto(testUrl);
      
      // 等待頁面載入
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // 額外等待確保頁面完全載入
      
      // 截圖 - 初始狀態
      await page.screenshot({ 
        path: `test-results/visual-${device.name.replace(/\s+/g, '-')}-${device.width}x${device.height}.png`,
        fullPage: true 
      });

      // 檢查頁面是否載入（不管是登入頁面還是實際頁面）
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
      expect(pageContent.length).toBeGreaterThan(10);
      
      // 檢查基本響應式元素
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // 檢查視窗尺寸是否正確設置
      const viewportSize = await page.viewportSize();
      expect(viewportSize?.width).toBe(device.width);
      expect(viewportSize?.height).toBe(device.height);
      
      console.log(`✅ ${device.name} (${device.width}x${device.height}) 視覺測試完成`);
    });
  });

  test('響應式佈局元素檢查', async ({ page }) => {
    // 測試不同尺寸下的佈局元素
    const testSizes = [
      { width: 320, height: 568 }, // 小手機
      { width: 375, height: 812 }, // iPhone X
      { width: 768, height: 1024 }, // iPad
      { width: 1200, height: 800 }  // 桌面
    ];

    for (const size of testSizes) {
      await page.setViewportSize(size);
      await page.goto(testUrl);
      await page.waitForLoadState('networkidle');
      
      // 檢查頁面基本結構
      const body = await page.locator('body').boundingBox();
      expect(body).toBeTruthy();
      
      if (body) {
        // 確保內容不會超出視窗寬度
        expect(body.width).toBeLessThanOrEqual(size.width + 50); // 允許一些誤差
        
        // 檢查是否有水平滾動條（通過檢查 scrollWidth）
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        
        // 如果有明顯的水平滾動，可能表示響應式設計有問題
        if (scrollWidth > clientWidth + 20) {
          console.warn(`⚠️ 在 ${size.width}x${size.height} 尺寸下可能存在水平滾動`);
        }
      }
      
      console.log(`✅ ${size.width}x${size.height} 佈局檢查完成`);
    }
  });

  test('觸控目標尺寸檢查', async ({ page }) => {
    // 設置為手機尺寸
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(testUrl);
    await page.waitForLoadState('networkidle');
    
    // 檢查所有可點擊元素的尺寸
    const clickableElements = await page.locator('button, a, input[type="button"], input[type="submit"], [role="button"]').all();
    
    let touchFriendlyCount = 0;
    let totalClickableElements = 0;
    
    for (const element of clickableElements) {
      if (await element.isVisible()) {
        const bounds = await element.boundingBox();
        if (bounds) {
          totalClickableElements++;
          const minDimension = Math.min(bounds.width, bounds.height);
          
          // 檢查是否符合觸控友好標準（至少 32px）
          if (minDimension >= 32) {
            touchFriendlyCount++;
          } else {
            const elementText = await element.textContent();
            console.warn(`⚠️ 觸控目標過小: "${elementText}" (${bounds.width}x${bounds.height})`);
          }
        }
      }
    }
    
    console.log(`觸控友好性統計: ${touchFriendlyCount}/${totalClickableElements} 個元素符合標準`);
    
    // 至少 80% 的可點擊元素應該是觸控友好的
    if (totalClickableElements > 0) {
      const touchFriendlyRatio = touchFriendlyCount / totalClickableElements;
      expect(touchFriendlyRatio).toBeGreaterThanOrEqual(0.8);
    }
  });

  test('字體和文字可讀性檢查', async ({ page }) => {
    const testSizes = [
      { width: 375, height: 812, name: '手機' },
      { width: 768, height: 1024, name: '平板' }
    ];

    for (const size of testSizes) {
      await page.setViewportSize(size);
      await page.goto(testUrl);
      await page.waitForLoadState('networkidle');
      
      // 檢查文字元素的字體大小
      const textElements = await page.locator('p, span, div, label, h1, h2, h3, h4, h5, h6').all();
      
      let readableTextCount = 0;
      let totalTextElements = 0;
      
      for (const element of textElements.slice(0, 20)) { // 只檢查前20個元素
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            totalTextElements++;
            
            const fontSize = await element.evaluate(el => {
              const style = window.getComputedStyle(el);
              return parseFloat(style.fontSize);
            });
            
            // 檢查字體大小是否適合閱讀（至少 14px）
            if (fontSize >= 14) {
              readableTextCount++;
            } else {
              console.warn(`⚠️ ${size.name}上字體過小: "${text.substring(0, 30)}..." (${fontSize}px)`);
            }
          }
        }
      }
      
      console.log(`${size.name}文字可讀性: ${readableTextCount}/${totalTextElements} 個元素字體大小適中`);
    }
  });
});
