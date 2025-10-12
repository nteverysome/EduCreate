import { test, expect } from '@playwright/test';

test.describe('手機版用戶選單功能驗證', () => {
  
  test('驗證手機版用戶選單與桌面版功能一致', async ({ page }) => {
    console.log('🔍 開始驗證手機版用戶選單功能...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問主頁
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    
    console.log('📱 已設置手機視窗大小並訪問主頁');
    
    // 等待頁面完全載入
    await page.waitForTimeout(3000);
    
    // 檢查是否有登入用戶（如果沒有，先跳過測試）
    const loginButton = page.locator('text=登入');
    const isLoggedIn = !(await loginButton.isVisible());
    
    if (!isLoggedIn) {
      console.log('⚠️ 用戶未登入，跳過用戶選單測試');
      test.skip();
      return;
    }
    
    console.log('✅ 檢測到已登入用戶');
    
    // 查找手機版導航選單按鈕（漢堡選單）
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button');
    await expect(mobileMenuButton.first()).toBeVisible();
    
    console.log('📱 找到手機版導航選單按鈕');
    
    // 點擊打開手機版選單
    await mobileMenuButton.first().click();
    await page.waitForTimeout(1000);
    
    console.log('🔓 已打開手機版導航選單');
    
    // 截圖記錄手機版選單狀態
    await page.screenshot({ 
      path: `test-results/mobile-user-menu-opened.png`,
      fullPage: true 
    });
    
    // 驗證用戶信息區域
    const userInfoSection = page.locator('.md\\:hidden').filter({ hasText: '專業帳戶' }).or(
      page.locator('.md\\:hidden').filter({ hasText: '演示帳戶' })
    );
    
    if (await userInfoSection.isVisible()) {
      console.log('✅ 找到用戶信息區域');
    }
    
    // 定義期望的用戶選單項目（與桌面版一致）
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
      { text: '使用條款' }
    ];
    
    console.log('🔍 開始驗證用戶選單項目...');
    
    let foundItems = 0;
    let missingItems = [];
    
    for (const item of expectedMenuItems) {
      const menuItem = page.locator(`text=${item.text}`);
      const isVisible = await menuItem.isVisible();
      
      if (isVisible) {
        foundItems++;
        console.log(`✅ 找到選單項目: ${item.icon || ''} ${item.text}`);
        
        // 驗證圖標是否存在（如果有的話）
        if (item.icon) {
          const iconElement = page.locator(`text=${item.icon}`);
          if (await iconElement.isVisible()) {
            console.log(`  ✅ 圖標正確: ${item.icon}`);
          }
        }
      } else {
        missingItems.push(item.text);
        console.log(`❌ 缺少選單項目: ${item.icon || ''} ${item.text}`);
      }
    }
    
    console.log(`\n📊 選單項目檢查結果:`);
    console.log(`  找到項目: ${foundItems}/${expectedMenuItems.length}`);
    console.log(`  成功率: ${((foundItems / expectedMenuItems.length) * 100).toFixed(1)}%`);
    
    if (missingItems.length > 0) {
      console.log(`  缺少項目: ${missingItems.join(', ')}`);
    }
    
    // 測試幾個關鍵功能的點擊
    console.log('\n🔗 測試選單項目點擊功能...');
    
    const testItems = [
      { text: '創建活動', expectedUrl: '/create' },
      { text: '我的活動', expectedUrl: '/my-activities' },
      { text: '編輯個人資訊', expectedUrl: '/account/profile' }
    ];
    
    for (const testItem of testItems) {
      const menuItem = page.locator(`text=${testItem.text}`);
      if (await menuItem.isVisible()) {
        console.log(`🔗 測試點擊: ${testItem.text}`);
        
        // 記錄點擊前的 URL
        const currentUrl = page.url();
        
        // 點擊選單項目
        await menuItem.click();
        await page.waitForTimeout(2000);
        
        // 檢查 URL 是否改變或包含期望的路徑
        const newUrl = page.url();
        if (newUrl.includes(testItem.expectedUrl) || newUrl !== currentUrl) {
          console.log(`  ✅ 點擊成功，URL 變化: ${newUrl}`);
        } else {
          console.log(`  ⚠️ 點擊後 URL 未變化: ${newUrl}`);
        }
        
        // 返回主頁繼續測試
        await page.goto('https://edu-create.vercel.app');
        await page.waitForTimeout(1000);
        
        // 重新打開選單
        const reopenMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button');
        if (await reopenMenuButton.first().isVisible()) {
          await reopenMenuButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/mobile-user-menu-final.png`,
      fullPage: true 
    });
    
    console.log('\n🎉 手機版用戶選單功能驗證完成');
    
    // 驗證至少找到 80% 的選單項目
    expect(foundItems).toBeGreaterThanOrEqual(Math.ceil(expectedMenuItems.length * 0.8));
  });

  test('對比桌面版和手機版用戶選單功能', async ({ page }) => {
    console.log('🔍 開始對比桌面版和手機版用戶選單...');
    
    // 先測試桌面版
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('🖥️ 測試桌面版用戶選單');
    
    // 檢查桌面版用戶選單
    const desktopUserButton = page.locator('[data-testid="user-menu-button"]');
    let desktopMenuItems = [];
    
    if (await desktopUserButton.isVisible()) {
      await desktopUserButton.click();
      await page.waitForTimeout(1000);
      
      // 截圖桌面版選單
      await page.screenshot({ 
        path: `test-results/desktop-user-menu.png`,
        fullPage: true 
      });
      
      // 收集桌面版選單項目
      const menuTexts = await page.locator('.absolute.right-0 a, .absolute.right-0 button').allTextContents();
      desktopMenuItems = menuTexts.filter(text => text.trim().length > 0);
      
      console.log(`🖥️ 桌面版選單項目數量: ${desktopMenuItems.length}`);
    }
    
    // 再測試手機版
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📱 測試手機版用戶選單');
    
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button');
    let mobileMenuItems = [];
    
    if (await mobileMenuButton.first().isVisible()) {
      await mobileMenuButton.first().click();
      await page.waitForTimeout(1000);
      
      // 截圖手機版選單
      await page.screenshot({ 
        path: `test-results/mobile-user-menu-comparison.png`,
        fullPage: true 
      });
      
      // 收集手機版選單項目
      const mobileTexts = await page.locator('.md\\:hidden a, .md\\:hidden button').allTextContents();
      mobileMenuItems = mobileTexts.filter(text => text.trim().length > 0);
      
      console.log(`📱 手機版選單項目數量: ${mobileMenuItems.length}`);
    }
    
    // 對比結果
    console.log('\n📊 桌面版 vs 手機版對比結果:');
    console.log(`  桌面版項目數: ${desktopMenuItems.length}`);
    console.log(`  手機版項目數: ${mobileMenuItems.length}`);
    
    const similarity = mobileMenuItems.length > 0 ? 
      (Math.min(desktopMenuItems.length, mobileMenuItems.length) / Math.max(desktopMenuItems.length, mobileMenuItems.length)) * 100 : 0;
    
    console.log(`  相似度: ${similarity.toFixed(1)}%`);
    
    if (similarity >= 80) {
      console.log('✅ 手機版和桌面版用戶選單功能基本一致');
    } else {
      console.log('⚠️ 手機版和桌面版用戶選單存在較大差異');
    }
    
    // 驗證相似度至少達到 70%
    expect(similarity).toBeGreaterThanOrEqual(70);
  });
});
