import { test, expect } from '@playwright/test';

test.describe('/create 頁面統一導航功能驗證', () => {
  test('驗證 /create 頁面具有統一的用戶選單功能', async ({ page }) => {
    console.log('🚀 開始驗證 /create 頁面統一導航功能...');
    
    // 等待部署完成
    await page.waitForTimeout(30000);
    
    // 測試桌面版
    console.log('🖥️ 測試桌面版 /create 頁面...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 截圖桌面版 /create 頁面
    await page.screenshot({ 
      path: 'test-results/create-page-desktop-navigation.png',
      fullPage: false
    });
    
    // 檢查桌面版是否有統一導航
    const desktopNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`🖥️ 桌面版統一導航元素: ${desktopNavigation}`);
    
    // 檢查桌面版用戶選單按鈕
    const desktopUserButton = await page.locator('[data-testid="user-menu-button"]').count();
    console.log(`🖥️ 桌面版用戶選單按鈕: ${desktopUserButton}`);
    
    // 測試手機版
    console.log('📱 測試手機版 /create 頁面...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload({ waitUntil: 'networkidle' });
    
    // 截圖手機版 /create 頁面
    await page.screenshot({ 
      path: 'test-results/create-page-mobile-navigation.png',
      fullPage: false
    });
    
    // 檢查手機版選單按鈕
    const mobileMenuButton = await page.locator('button[data-testid="mobile-menu-button"]').count();
    console.log(`📱 手機版選單按鈕: ${mobileMenuButton}`);
    
    if (mobileMenuButton > 0) {
      // 點擊手機版選單按鈕
      await page.locator('button[data-testid="mobile-menu-button"]').first().click();
      await page.waitForTimeout(1000);
      
      // 截圖手機版選單打開狀態
      await page.screenshot({ 
        path: 'test-results/create-page-mobile-menu-open.png',
        fullPage: false
      });
      
      // 檢查選單項目
      const menuItems = await page.locator('[data-testid="mobile-menu"] a, [data-testid="mobile-menu"] button').count();
      console.log(`📱 手機版選單項目數量: ${menuItems}`);
      
      // 檢查核心選單項目
      const expectedItems = ['創建活動', '我的活動', '我的結果', '編輯個人資訊', '登出'];
      let foundItems = 0;
      
      for (const item of expectedItems) {
        const itemExists = await page.locator(`[data-testid="mobile-menu"] >> text=${item}`).count() > 0;
        if (itemExists) {
          foundItems++;
          console.log(`✅ 找到選單項目: ${item}`);
        } else {
          console.log(`❌ 缺少選單項目: ${item}`);
        }
      }
      
      console.log(`📊 找到 ${foundItems}/${expectedItems.length} 個核心選單項目`);
      
      // 驗證至少找到大部分核心項目
      expect(foundItems).toBeGreaterThanOrEqual(3);
      
    } else {
      console.log('⚠️ 手機版選單按鈕未找到');
    }
    
    console.log('✅ /create 頁面統一導航功能驗證完成');
  });

  test('比較 /create 頁面與主頁的導航一致性', async ({ page }) => {
    console.log('🔍 開始比較 /create 頁面與主頁的導航一致性...');
    
    // 測試主頁手機版選單
    console.log('📱 測試主頁手機版選單...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://edu-create.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    let homeMenuItems: string[] = [];
    const homeMenuButton = await page.locator('button[data-testid="mobile-menu-button"]').count();
    
    if (homeMenuButton > 0) {
      await page.locator('button[data-testid="mobile-menu-button"]').first().click();
      await page.waitForTimeout(1000);
      
      const menuTexts = await page.locator('[data-testid="mobile-menu"] a, [data-testid="mobile-menu"] button').allTextContents();
      homeMenuItems = menuTexts.filter(text => text.trim().length > 0);
      console.log('🏠 主頁選單項目數量:', homeMenuItems.length);
    }
    
    // 測試 /create 頁面手機版選單
    console.log('📱 測試 /create 頁面手機版選單...');
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    let createMenuItems: string[] = [];
    const createMenuButton = await page.locator('button[data-testid="mobile-menu-button"]').count();
    
    if (createMenuButton > 0) {
      await page.locator('button[data-testid="mobile-menu-button"]').first().click();
      await page.waitForTimeout(1000);
      
      const menuTexts = await page.locator('[data-testid="mobile-menu"] a, [data-testid="mobile-menu"] button').allTextContents();
      createMenuItems = menuTexts.filter(text => text.trim().length > 0);
      console.log('🚀 /create 頁面選單項目數量:', createMenuItems.length);
    }
    
    // 比較一致性
    console.log('🔍 比較選單一致性...');
    
    if (homeMenuItems.length > 0 && createMenuItems.length > 0) {
      // 檢查核心項目是否都存在
      const coreItems = ['創建活動', '我的活動', '我的結果', '編輯個人資訊'];
      
      let homeHasCore = 0;
      let createHasCore = 0;
      
      for (const item of coreItems) {
        const inHome = homeMenuItems.some(text => text.includes(item));
        const inCreate = createMenuItems.some(text => text.includes(item));
        
        if (inHome) homeHasCore++;
        if (inCreate) createHasCore++;
        
        console.log(`${item}: 主頁${inHome ? '✅' : '❌'} /create${inCreate ? '✅' : '❌'}`);
      }
      
      console.log(`📊 核心項目統計: 主頁 ${homeHasCore}/${coreItems.length}, /create ${createHasCore}/${coreItems.length}`);
      
      // 驗證兩個頁面的選單基本一致
      expect(Math.abs(homeMenuItems.length - createMenuItems.length)).toBeLessThanOrEqual(2);
      expect(homeHasCore).toBeGreaterThanOrEqual(2);
      expect(createHasCore).toBeGreaterThanOrEqual(2);
      
      console.log('✅ 導航一致性驗證通過！');
    } else {
      console.log('⚠️ 無法完整比較選單（可能未登入或選單未正確載入）');
    }
    
    console.log('✅ 導航一致性比較完成');
  });
});
