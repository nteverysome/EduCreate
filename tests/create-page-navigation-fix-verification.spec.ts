import { test, expect } from '@playwright/test';

test.describe('/create 頁面導航修復驗證', () => {
  test('驗證 /create 頁面統一導航修復後正常顯示', async ({ page }) => {
    console.log('🔧 開始驗證 /create 頁面導航修復...');
    
    // 等待部署完成
    await page.waitForTimeout(30000);
    
    // 測試手機版
    console.log('📱 測試手機版 /create 頁面導航...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 截圖手機版
    await page.screenshot({ 
      path: 'test-results/create-page-mobile-navigation-fixed.png',
      fullPage: false
    });
    
    // 檢查統一導航元素
    const unifiedNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 統一導航元素: ${unifiedNavigation}`);
    
    // 檢查手機版選單按鈕
    const mobileMenuButton = await page.locator('button[data-testid="mobile-menu-button"]').count();
    console.log(`📱 手機版選單按鈕: ${mobileMenuButton}`);
    
    if (mobileMenuButton > 0) {
      console.log('✅ 手機版選單按鈕找到，嘗試打開選單...');
      
      // 點擊選單按鈕
      await page.locator('button[data-testid="mobile-menu-button"]').first().click();
      await page.waitForTimeout(1000);
      
      // 截圖選單打開狀態
      await page.screenshot({ 
        path: 'test-results/create-page-mobile-menu-fixed.png',
        fullPage: false
      });
      
      // 檢查選單項目
      const menuItems = await page.locator('[data-testid="mobile-menu"] a, [data-testid="mobile-menu"] button').count();
      console.log(`📱 選單項目數量: ${menuItems}`);
      
      // 檢查核心選單項目
      const coreItems = ['創建活動', '我的活動', '我的結果'];
      let foundItems = 0;
      
      for (const item of coreItems) {
        const itemExists = await page.locator(`[data-testid="mobile-menu"] >> text=${item}`).count() > 0;
        if (itemExists) {
          foundItems++;
          console.log(`✅ 找到選單項目: ${item}`);
        } else {
          console.log(`❌ 缺少選單項目: ${item}`);
        }
      }
      
      console.log(`📊 找到 ${foundItems}/${coreItems.length} 個核心選單項目`);
      
      // 驗證找到基本的選單項目
      expect(foundItems).toBeGreaterThanOrEqual(1);
      expect(menuItems).toBeGreaterThan(0);
      
    } else {
      console.log('❌ 手機版選單按鈕未找到');
    }
    
    // 測試桌面版
    console.log('🖥️ 測試桌面版 /create 頁面導航...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload({ waitUntil: 'networkidle' });
    
    // 截圖桌面版
    await page.screenshot({ 
      path: 'test-results/create-page-desktop-navigation-fixed.png',
      fullPage: false
    });
    
    // 檢查桌面版統一導航
    const desktopNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`🖥️ 桌面版統一導航元素: ${desktopNavigation}`);
    
    // 檢查桌面版用戶選單按鈕
    const desktopUserButton = await page.locator('[data-testid="user-menu-button"]').count();
    console.log(`🖥️ 桌面版用戶選單按鈕: ${desktopUserButton}`);
    
    // 驗證統一導航存在
    expect(unifiedNavigation).toBeGreaterThan(0);
    
    console.log('✅ /create 頁面導航修復驗證完成');
  });

  test('快速驗證主頁與 /create 頁面導航一致性', async ({ page }) => {
    console.log('⚡ 快速驗證導航一致性...');
    
    // 檢查主頁
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://edu-create.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const homeNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    const homeMenuButton = await page.locator('button[data-testid="mobile-menu-button"]').count();
    
    console.log(`🏠 主頁統一導航: ${homeNavigation}, 選單按鈕: ${homeMenuButton}`);
    
    // 檢查 /create 頁面
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const createNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    const createMenuButton = await page.locator('button[data-testid="mobile-menu-button"]').count();
    
    console.log(`🚀 /create 頁面統一導航: ${createNavigation}, 選單按鈕: ${createMenuButton}`);
    
    // 驗證一致性
    expect(homeNavigation).toEqual(createNavigation);
    expect(homeMenuButton).toEqual(createMenuButton);
    
    console.log('✅ 導航一致性驗證通過');
  });
});
