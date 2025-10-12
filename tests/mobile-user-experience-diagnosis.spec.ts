import { test, expect } from '@playwright/test';

test.describe('手機用戶體驗診斷', () => {
  
  test('全面診斷手機版用戶選單問題', async ({ page }) => {
    console.log('🔍 開始全面診斷手機版用戶選單問題...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    console.log('📱 設置手機視窗大小: 375x812');
    
    // 清除緩存並訪問網站
    await page.goto('https://edu-create.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 強制刷新頁面
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🔄 已清除緩存並強制刷新頁面');
    
    // 截圖初始狀態
    await page.screenshot({ 
      path: `test-results/diagnosis-initial-state.png`,
      fullPage: true 
    });
    
    // 檢查頁面基本信息
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`📄 頁面標題: ${pageTitle}`);
    console.log(`🔗 頁面URL: ${pageUrl}`);
    
    // 查找手機版導航按鈕
    console.log('\n🔍 查找手機版導航按鈕...');
    
    const mobileMenuSelectors = [
      '[data-testid="mobile-menu-button"]',
      'button:has-text("☰")',
      '.md\\:hidden button',
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]'
    ];
    
    let mobileMenuButton = null;
    let foundSelector = '';
    
    for (const selector of mobileMenuSelectors) {
      const button = page.locator(selector);
      if (await button.isVisible()) {
        mobileMenuButton = button.first();
        foundSelector = selector;
        console.log(`✅ 找到手機版選單按鈕: ${selector}`);
        break;
      }
    }
    
    if (!mobileMenuButton) {
      console.log('❌ 未找到手機版選單按鈕');
      
      // 截圖並列出所有可見的按鈕
      await page.screenshot({ 
        path: `test-results/diagnosis-no-menu-button.png`,
        fullPage: true 
      });
      
      const allButtons = await page.locator('button').allTextContents();
      console.log('所有可見按鈕:', allButtons);
      
      return;
    }
    
    // 點擊打開選單
    await mobileMenuButton.click();
    await page.waitForTimeout(2000);
    
    console.log('🔓 已打開手機版選單');
    
    // 截圖選單打開狀態
    await page.screenshot({ 
      path: `test-results/diagnosis-menu-opened.png`,
      fullPage: true 
    });
    
    // 檢查登入狀態
    console.log('\n🔐 詳細檢查登入狀態...');
    
    // 查找登入相關元素
    const loginButton = page.locator('.md\\:hidden').locator('text=登入');
    const registerButton = page.locator('.md\\:hidden').locator('text=註冊');
    const logoutButton = page.locator('.md\\:hidden').locator('text=登出');
    
    const hasLoginButton = await loginButton.isVisible();
    const hasRegisterButton = await registerButton.isVisible();
    const hasLogoutButton = await logoutButton.isVisible();
    
    console.log(`登入按鈕: ${hasLoginButton ? '✅ 可見' : '❌ 不可見'}`);
    console.log(`註冊按鈕: ${hasRegisterButton ? '✅ 可見' : '❌ 不可見'}`);
    console.log(`登出按鈕: ${hasLogoutButton ? '✅ 可見' : '❌ 不可見'}`);
    
    // 查找用戶信息
    const userInfoSelectors = [
      'text=南志宗',
      'text=專業帳戶',
      'text=演示模式',
      'text=演示帳戶',
      '.md\\:hidden .w-10.h-10', // 用戶頭像
    ];
    
    let userInfoFound = false;
    for (const selector of userInfoSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`✅ 找到用戶信息: ${selector}`);
        userInfoFound = true;
      }
    }
    
    if (!userInfoFound) {
      console.log('❌ 未找到任何用戶信息');
    }
    
    // 檢查用戶管理功能
    console.log('\n⚙️ 檢查用戶管理功能...');
    
    const userManagementFunctions = [
      { name: '編輯個人資訊', icon: '👤' },
      { name: '管理付款', icon: '💳' },
      { name: '語言和位置', icon: '🌐' },
      { name: '社區', icon: '👥' },
      { name: '聯繫方式', icon: '📞' },
      { name: '價格計劃', icon: '💎' }
    ];
    
    let foundUserFunctions = 0;
    const missingFunctions = [];
    
    for (const func of userManagementFunctions) {
      // 嘗試多種方式查找
      const byText = page.locator(`.md\\:hidden`).locator(`text=${func.name}`);
      const byIcon = page.locator(`.md\\:hidden`).locator(`text=${func.icon}`);
      
      const textVisible = await byText.isVisible();
      const iconVisible = await byIcon.isVisible();
      
      if (textVisible || iconVisible) {
        console.log(`✅ 找到用戶功能: ${func.icon} ${func.name}`);
        foundUserFunctions++;
      } else {
        console.log(`❌ 缺少用戶功能: ${func.icon} ${func.name}`);
        missingFunctions.push(func.name);
      }
    }
    
    console.log(`\n📊 用戶管理功能統計:`);
    console.log(`  找到: ${foundUserFunctions}/${userManagementFunctions.length}`);
    console.log(`  成功率: ${((foundUserFunctions / userManagementFunctions.length) * 100).toFixed(1)}%`);
    
    if (missingFunctions.length > 0) {
      console.log(`  缺少功能: ${missingFunctions.join(', ')}`);
    }
    
    // 檢查HTML結構
    console.log('\n🔍 檢查實際HTML結構...');
    
    // 獲取手機版選單的完整HTML
    const mobileMenuHTML = await page.locator('.md\\:hidden').innerHTML();
    
    // 檢查是否包含我們添加的用戶管理功能
    const containsUserManagement = mobileMenuHTML.includes('編輯個人資訊') || 
                                   mobileMenuHTML.includes('管理付款') ||
                                   mobileMenuHTML.includes('語言和位置');
    
    console.log(`HTML包含用戶管理功能: ${containsUserManagement ? '✅ 是' : '❌ 否'}`);
    
    // 檢查條件渲染
    console.log('\n🔍 檢查條件渲染邏輯...');
    
    // 使用JavaScript檢查currentUser狀態
    const currentUserStatus = await page.evaluate(() => {
      // 嘗試從window對象或其他地方獲取用戶狀態
      return {
        hasCurrentUser: typeof window !== 'undefined' && 'currentUser' in window,
        sessionStorage: Object.keys(sessionStorage),
        localStorage: Object.keys(localStorage)
      };
    });
    
    console.log('用戶狀態檢查:', currentUserStatus);
    
    // 統計所有選單項目
    console.log('\n📊 統計所有選單項目...');
    
    const allMenuItems = await page.locator('.md\\:hidden a, .md\\:hidden button').allTextContents();
    const visibleItems = allMenuItems.filter(text => text.trim().length > 0);
    
    console.log(`總選單項目數: ${visibleItems.length}`);
    console.log('所有項目:');
    visibleItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.trim().substring(0, 50)}${item.trim().length > 50 ? '...' : ''}`);
    });
    
    // 檢查是否有重複的創建活動等功能
    const createActivityCount = visibleItems.filter(item => item.includes('創建活動')).length;
    const myActivitiesCount = visibleItems.filter(item => item.includes('我的活動')).length;
    
    console.log(`\n🔍 功能重複檢查:`);
    console.log(`  創建活動出現次數: ${createActivityCount}`);
    console.log(`  我的活動出現次數: ${myActivitiesCount}`);
    
    // 最終診斷結論
    console.log('\n📋 診斷結論:');
    console.log('=============');
    
    if (hasLoginButton && !hasLogoutButton) {
      console.log('🔐 **主要問題: 用戶未登入**');
      console.log('   - 用戶管理功能只在登入狀態下顯示');
      console.log('   - 這是正確的安全設計');
      console.log('   - 解決方案: 用戶需要先登入');
    } else if (hasLogoutButton && foundUserFunctions === 0) {
      console.log('⚠️ **問題: 已登入但用戶功能未顯示**');
      console.log('   - 可能是代碼問題或條件渲染問題');
      console.log('   - 需要檢查代碼實現');
    } else if (foundUserFunctions > 0) {
      console.log('✅ **用戶管理功能正常顯示**');
      console.log('   - 功能已正確實現');
    } else {
      console.log('❓ **需要進一步調查**');
      console.log('   - 登入狀態不明確');
      console.log('   - 可能有其他問題');
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/diagnosis-final-state.png`,
      fullPage: true 
    });
    
    console.log('\n📋 診斷完成');
  });

  test('模擬用戶登入後的體驗', async ({ page }) => {
    console.log('🔍 模擬用戶登入後的體驗...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 嘗試找到並點擊登入按鈕
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(2000);
      
      const loginButton = page.locator('.md\\:hidden').locator('text=登入');
      
      if (await loginButton.isVisible()) {
        console.log('✅ 找到登入按鈕');
        
        // 截圖登入前狀態
        await page.screenshot({ 
          path: `test-results/before-login-attempt.png`,
          fullPage: true 
        });
        
        console.log('💡 用戶需要點擊登入按鈕並完成登入流程');
        console.log('💡 登入後，用戶管理功能將會顯示');
        
      } else {
        console.log('⚠️ 未找到登入按鈕，用戶可能已經登入');
        
        // 檢查用戶管理功能
        const userFunctions = ['編輯個人資訊', '管理付款', '語言和位置'];
        let foundFunctions = 0;
        
        for (const func of userFunctions) {
          const functionItem = page.locator(`.md\\:hidden`).locator(`text=${func}`);
          if (await functionItem.isVisible()) {
            foundFunctions++;
            console.log(`✅ 找到: ${func}`);
          }
        }
        
        if (foundFunctions > 0) {
          console.log('🎉 用戶管理功能已顯示！');
        } else {
          console.log('⚠️ 雖然沒有登入按鈕，但也沒有用戶管理功能');
        }
      }
    }
    
    console.log('\n📋 登入體驗模擬完成');
  });
});
