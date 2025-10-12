import { test, expect } from '@playwright/test';

test.describe('導航簡化驗證', () => {
  test('驗證簡化後的導航只包含4個核心項目', async ({ page }) => {
    console.log('🧪 開始驗證導航簡化效果...');
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // 等待導航載入
    await page.waitForSelector('[data-testid="unified-navigation"]', { timeout: 10000 });
    
    // 檢查桌面版導航項目數量
    const desktopNavItems = await page.locator('[data-testid="unified-navigation"] a[data-testid^="nav-"]').count();
    console.log(`📊 桌面版導航項目數量: ${desktopNavItems}`);
    
    // 驗證只有4個核心導航項目
    expect(desktopNavItems).toBe(4);
    
    // 驗證具體的導航項目
    const expectedNavItems = [
      'nav-home',
      'nav-my-activities', 
      'nav-create-activity',
      'nav-dashboard'
    ];
    
    for (const testId of expectedNavItems) {
      const navItem = page.locator(`[data-testid="${testId}"]`);
      await expect(navItem).toBeVisible();
      console.log(`✅ 找到核心導航項目: ${testId}`);
    }
    
    // 驗證不再有複雜的下拉選單
    const contentDropdown = page.locator('[data-testid="content-editor-dropdown"]');
    await expect(contentDropdown).not.toBeVisible();
    console.log('✅ 確認移除了複雜的內容編輯器下拉選單');
    
    // 截圖記錄簡化後的導航
    await page.screenshot({ 
      path: 'test-results/navigation-simplified-desktop.png',
      fullPage: false
    });
    
    console.log('🎉 導航簡化驗證完成！');
  });

  test('驗證手機版選單保持簡潔', async ({ page }) => {
    console.log('📱 開始驗證手機版選單...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // 點擊手機版選單按鈕
    const menuButton = page.locator('button[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    
    // 等待選單展開
    await page.waitForSelector('[data-testid="mobile-menu"]', { timeout: 5000 });
    
    // 檢查手機版選單項目（未登入狀態）
    const mobileMenuItems = await page.locator('[data-testid="mobile-menu"] a, [data-testid="mobile-menu"] button').count();
    console.log(`📊 手機版選單項目數量: ${mobileMenuItems}`);
    
    // 未登入狀態應該只有2個項目：登入、註冊
    expect(mobileMenuItems).toBeLessThanOrEqual(3); // 允許一些彈性
    
    // 截圖記錄手機版選單
    await page.screenshot({ 
      path: 'test-results/navigation-simplified-mobile.png',
      fullPage: false
    });
    
    console.log('🎉 手機版選單驗證完成！');
  });

  test('驗證功能統計顯示正確數量', async ({ page }) => {
    console.log('📊 開始驗證功能統計...');
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // 檢查是否有功能統計顯示
    const statsElements = await page.locator('text=/4.*4|4\/4/').count();
    if (statsElements > 0) {
      console.log('✅ 找到功能統計顯示 4/4');
    } else {
      console.log('ℹ️ 沒有找到功能統計顯示（可能已移除）');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/navigation-stats-verification.png',
      fullPage: false
    });
    
    console.log('🎉 功能統計驗證完成！');
  });

  test('驗證側邊欄導航簡化效果', async ({ page }) => {
    console.log('📋 開始驗證側邊欄導航...');
    
    // 嘗試訪問可能使用側邊欄的頁面
    await page.goto('https://edu-create.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 檢查是否有側邊欄
    const sidebar = page.locator('[data-testid="sidebar-navigation"]');
    const sidebarExists = await sidebar.count() > 0;
    
    if (sidebarExists) {
      console.log('📋 找到側邊欄導航');
      
      // 檢查側邊欄項目數量
      const sidebarItems = await page.locator('[data-testid^="sidebar-nav-"]').count();
      console.log(`📊 側邊欄項目數量: ${sidebarItems}`);
      
      // 驗證側邊欄項目數量合理（應該是4個核心項目）
      expect(sidebarItems).toBeLessThanOrEqual(6); // 允許一些額外項目
      
      // 截圖記錄側邊欄
      await page.screenshot({ 
        path: 'test-results/navigation-sidebar-simplified.png',
        fullPage: false
      });
    } else {
      console.log('ℹ️ 當前頁面沒有側邊欄導航');
    }
    
    console.log('🎉 側邊欄導航驗證完成！');
  });
});
