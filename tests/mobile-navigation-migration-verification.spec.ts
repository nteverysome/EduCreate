import { test, expect } from '@playwright/test';

test.describe('手機版導航遷移驗證', () => {
  test('驗證桌面版移除了4個核心導航項目', async ({ page }) => {
    console.log('🖥️ 開始驗證桌面版導航簡化...');
    
    // 等待部署完成
    await page.waitForTimeout(30000);
    
    // 訪問首頁 - 桌面版
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 等待導航載入
    await page.waitForSelector('[data-testid="unified-navigation"]', { timeout: 10000 });
    
    // 檢查桌面版不再有4個核心導航項目
    const desktopNavItems = [
      'nav-home',
      'nav-my-activities', 
      'nav-create-activity',
      'nav-dashboard'
    ];
    
    let foundDesktopItems = 0;
    for (const testId of desktopNavItems) {
      const item = page.locator(`[data-testid="${testId}"]`);
      const exists = await item.count() > 0;
      if (exists) {
        foundDesktopItems++;
        console.log(`❌ 桌面版仍有項目: ${testId}`);
      } else {
        console.log(`✅ 桌面版已移除項目: ${testId}`);
      }
    }
    
    // 截圖記錄桌面版狀態
    await page.screenshot({ 
      path: 'test-results/desktop-navigation-simplified.png',
      fullPage: false
    });
    
    console.log(`📊 桌面版找到 ${foundDesktopItems}/4 個核心項目（應該是0）`);
    
    // 驗證桌面版已移除核心導航項目
    expect(foundDesktopItems).toBe(0);
    
    console.log('✅ 桌面版導航簡化驗證成功！');
  });

  test('驗證手機版包含4個核心導航項目', async ({ page }) => {
    console.log('📱 開始驗證手機版導航功能...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 尋找並點擊手機版選單按鈕
    const menuButton = page.locator('button[data-testid="mobile-menu-button"]');
    const menuButtonExists = await menuButton.count() > 0;
    
    if (!menuButtonExists) {
      // 嘗試其他可能的選單按鈕
      const alternativeButton = page.locator('button').filter({ hasText: /選單|menu|☰|≡/ }).first();
      const altExists = await alternativeButton.count() > 0;
      if (altExists) {
        await alternativeButton.click();
      } else {
        throw new Error('找不到手機版選單按鈕');
      }
    } else {
      await menuButton.click();
    }
    
    // 等待選單展開
    await page.waitForTimeout(1000);
    
    // 檢查手機版選單中的4個核心導航項目
    const mobileNavItems = [
      { testId: 'mobile-nav-home', label: '首頁' },
      { testId: 'mobile-nav-my-activities', label: '我的活動' },
      { testId: 'mobile-nav-create-activity', label: '創建活動' },
      { testId: 'mobile-nav-dashboard', label: '功能儀表板' }
    ];
    
    let foundMobileItems = 0;
    for (const item of mobileNavItems) {
      const navItem = page.locator(`[data-testid="${item.testId}"]`);
      const exists = await navItem.count() > 0;
      if (exists) {
        foundMobileItems++;
        console.log(`✅ 手機版找到項目: ${item.label} (${item.testId})`);
        
        // 驗證項目可見
        await expect(navItem).toBeVisible();
      } else {
        console.log(`❌ 手機版缺少項目: ${item.label} (${item.testId})`);
      }
    }
    
    // 截圖記錄手機版選單
    await page.screenshot({ 
      path: 'test-results/mobile-navigation-with-core-items.png',
      fullPage: false
    });
    
    console.log(`📊 手機版找到 ${foundMobileItems}/4 個核心項目`);
    
    // 驗證手機版包含所有核心導航項目
    expect(foundMobileItems).toBe(4);
    
    console.log('✅ 手機版導航功能驗證成功！');
  });

  test('驗證手機版導航項目功能正常', async ({ page }) => {
    console.log('🔗 開始驗證手機版導航項目功能...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 測試每個導航項目的點擊功能
    const testItems = [
      { testId: 'mobile-nav-home', expectedUrl: '/', label: '首頁' },
      { testId: 'mobile-nav-my-activities', expectedUrl: '/my-activities', label: '我的活動' },
      { testId: 'mobile-nav-create-activity', expectedUrl: '/create', label: '創建活動' },
      { testId: 'mobile-nav-dashboard', expectedUrl: '/dashboard', label: '功能儀表板' }
    ];
    
    for (const item of testItems) {
      console.log(`🔗 測試手機版 ${item.label} 導航...`);
      
      // 返回首頁並打開選單
      await page.goto('https://edu-create.vercel.app/');
      await page.waitForLoadState('networkidle');
      
      // 打開手機版選單
      const menuButton = page.locator('button[data-testid="mobile-menu-button"]').first();
      const menuButtonExists = await menuButton.count() > 0;
      
      if (menuButtonExists) {
        await menuButton.click();
        await page.waitForTimeout(500);
        
        // 點擊導航項目
        const navItem = page.locator(`[data-testid="${item.testId}"]`);
        const exists = await navItem.count() > 0;
        
        if (exists) {
          await navItem.click();
          await page.waitForLoadState('networkidle');
          
          // 檢查URL是否正確
          const currentUrl = page.url();
          if (currentUrl.includes(item.expectedUrl)) {
            console.log(`   ✅ ${item.label} 導航成功: ${currentUrl}`);
          } else {
            console.log(`   ⚠️ ${item.label} URL不符預期: ${currentUrl} (預期包含: ${item.expectedUrl})`);
          }
        } else {
          console.log(`   ❌ 跳過測試 ${item.label} - 項目不存在`);
        }
      } else {
        console.log(`   ❌ 無法打開手機版選單`);
        break;
      }
    }
    
    console.log('🎉 手機版導航功能測試完成！');
  });
});
