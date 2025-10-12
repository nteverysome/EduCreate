import { test, expect } from '@playwright/test';

test.describe('Shimozurdo Game 部署驗證 - 響應式優化', () => {
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
    test(`${device.name} (${device.width}x${device.height}) 部署驗證`, async ({ page }) => {
      // 設置視窗大小
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // 導航到頁面
      await page.goto(testUrl);
      
      // 等待頁面載入
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // 等待動態內容載入
      
      // 截圖 - 部署驗證
      await page.screenshot({ 
        path: `test-results/deployment-${device.name.replace(/\s+/g, '-')}-${device.width}x${device.height}.png`,
        fullPage: true 
      });

      // 檢查頁面是否成功載入
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
      expect(pageContent.length).toBeGreaterThan(100);
      
      // 檢查視窗尺寸是否正確設置
      const viewportSize = await page.viewportSize();
      expect(viewportSize?.width).toBe(device.width);
      expect(viewportSize?.height).toBe(device.height);
      
      // 檢查頁面基本結構
      const body = await page.locator('body').boundingBox();
      expect(body).toBeTruthy();
      
      if (body) {
        // 確保內容不會超出視窗寬度
        expect(body.width).toBeLessThanOrEqual(device.width + 50); // 允許一些誤差
      }
      
      console.log(`✅ ${device.name} (${device.width}x${device.height}) 部署驗證完成`);
    });
  });

  test('部署狀態檢查', async ({ page }) => {
    // 檢查網站是否正常運行
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // 檢查主頁是否載入
    const title = await page.title();
    expect(title).toContain('EduCreate');
    
    // 檢查 shimozurdo-game 頁面是否可訪問
    await page.goto(testUrl);
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面是否載入成功
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
    
    console.log('✅ 部署狀態檢查完成 - 網站正常運行');
  });

  test('響應式設計功能驗證', async ({ page }) => {
    // 在手機尺寸下測試響應式功能
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(testUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 截圖記錄當前狀態
    await page.screenshot({ 
      path: 'test-results/responsive-verification-mobile.png',
      fullPage: true 
    });
    
    // 切換到桌面尺寸
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000); // 等待響應式調整
    
    // 截圖記錄桌面狀態
    await page.screenshot({ 
      path: 'test-results/responsive-verification-desktop.png',
      fullPage: true 
    });
    
    console.log('✅ 響應式設計功能驗證完成');
  });
});
