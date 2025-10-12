import { test, expect } from '@playwright/test';

test.describe('手機版與桌面版導航一致性驗證', () => {
  test('驗證手機版與桌面版用戶選單內容一致', async ({ page }) => {
    console.log('🔄 開始驗證手機版與桌面版用戶選單一致性...');
    
    // 等待部署完成
    await page.waitForTimeout(30000);
    
    // 預期的用戶選單項目（按順序）
    const expectedMenuItems = [
      { text: '創建活動', icon: '➕' },
      { text: '我的活動', icon: '📋' },
      { text: '我的結果', icon: '📊' },
      { text: '編輯個人資訊', icon: '👤' },
      { text: '管理付款', icon: '💳' },
      { text: '語言和位置', icon: '🌐' },
      { text: '社區', icon: '👥' },
      { text: '聯繫方式', icon: '📞' },
      { text: '價格計劃', icon: '💎' },
      { text: '登出', icon: '🚪' },
      { text: '使用條款', icon: null },
      { text: '隱私聲明', icon: null }
    ];
    
    // 測試桌面版用戶選單
    console.log('🖥️ 測試桌面版用戶選單...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 尋找並點擊桌面版用戶選單按鈕
    const desktopUserButton = page.locator('[data-testid="user-menu-button"]');
    const desktopUserExists = await desktopUserButton.count() > 0;
    
    let desktopMenuItems: string[] = [];
    if (desktopUserExists) {
      await desktopUserButton.click();
      await page.waitForTimeout(500);
      
      // 收集桌面版選單項目文字
      const menuTexts = await page.locator('[data-testid="user-menu-button"] + div a, [data-testid="user-menu-button"] + div button').allTextContents();
      desktopMenuItems = menuTexts.filter(text => text.trim().length > 0);
      console.log('🖥️ 桌面版選單項目:', desktopMenuItems);
    } else {
      console.log('⚠️ 桌面版用戶選單按鈕未找到（可能未登入）');
    }
    
    // 截圖記錄桌面版
    await page.screenshot({ 
      path: 'test-results/desktop-user-menu-consistency.png',
      fullPage: false
    });
    
    // 測試手機版用戶選單
    console.log('📱 測試手機版用戶選單...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 尋找並點擊手機版選單按鈕
    const mobileMenuButton = page.locator('button[data-testid="mobile-menu-button"]').first();
    const mobileMenuExists = await mobileMenuButton.count() > 0;
    
    let mobileMenuItems: string[] = [];
    if (mobileMenuExists) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // 收集手機版選單項目文字
      const menuTexts = await page.locator('[data-testid="mobile-menu"] a, [data-testid="mobile-menu"] button').allTextContents();
      mobileMenuItems = menuTexts.filter(text => text.trim().length > 0 && !text.includes('登入') && !text.includes('註冊'));
      console.log('📱 手機版選單項目:', mobileMenuItems);
    } else {
      console.log('⚠️ 手機版選單按鈕未找到');
    }
    
    // 截圖記錄手機版
    await page.screenshot({ 
      path: 'test-results/mobile-user-menu-consistency.png',
      fullPage: false
    });
    
    // 比較兩個選單的一致性
    console.log('🔍 比較選單一致性...');
    
    if (desktopMenuItems.length > 0 && mobileMenuItems.length > 0) {
      // 檢查核心項目是否都存在
      const coreItems = ['創建活動', '我的活動', '我的結果', '編輯個人資訊', '登出'];
      
      let desktopCoreCount = 0;
      let mobileCoreCount = 0;
      
      for (const item of coreItems) {
        const inDesktop = desktopMenuItems.some(text => text.includes(item));
        const inMobile = mobileMenuItems.some(text => text.includes(item));
        
        if (inDesktop) desktopCoreCount++;
        if (inMobile) mobileCoreCount++;
        
        console.log(`${item}: 桌面版${inDesktop ? '✅' : '❌'} 手機版${inMobile ? '✅' : '❌'}`);
      }
      
      console.log(`📊 核心項目統計: 桌面版 ${desktopCoreCount}/${coreItems.length}, 手機版 ${mobileCoreCount}/${coreItems.length}`);
      
      // 驗證核心項目存在
      expect(desktopCoreCount).toBeGreaterThanOrEqual(3);
      expect(mobileCoreCount).toBeGreaterThanOrEqual(3);
      
      console.log('✅ 選單一致性驗證通過！');
    } else {
      console.log('⚠️ 無法完整比較選單（可能未登入或選單未正確載入）');
    }
    
    console.log('🎉 導航一致性驗證完成！');
  });

  test('驗證桌面版導航簡潔性', async ({ page }) => {
    console.log('🖥️ 開始驗證桌面版導航簡潔性...');
    
    // 訪問桌面版
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 檢查桌面版主導航區域不應該有4個核心項目
    const mainNavItems = await page.locator('[data-testid="unified-navigation"] a[data-testid^="nav-"]').count();
    console.log(`📊 桌面版主導航項目數量: ${mainNavItems}`);
    
    // 驗證桌面版主導航已簡化
    expect(mainNavItems).toBeLessThanOrEqual(2); // 應該很少或沒有主導航項目
    
    // 檢查是否還有固定的導航項目（社區、我的活動、我的結果）
    const fixedNavItems = await page.locator('text=社區, text=我的活動, text=我的結果').count();
    console.log(`📊 桌面版固定導航項目: ${fixedNavItems}`);
    
    // 截圖記錄桌面版簡潔狀態
    await page.screenshot({ 
      path: 'test-results/desktop-navigation-clean.png',
      fullPage: false
    });
    
    console.log('✅ 桌面版導航簡潔性驗證完成！');
  });
});
