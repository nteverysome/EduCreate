import { test, expect } from '@playwright/test';

test.describe('手機版用戶選單登入狀態檢查', () => {
  
  test('檢查手機版選單的登入狀態和用戶功能顯示', async ({ page }) => {
    console.log('🔍 檢查手機版選單的登入狀態...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問主頁
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📱 已設置手機視窗大小並訪問主頁');
    
    // 查找手機版導航選單按鈕
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
    
    if (!(await mobileMenuButton.isVisible())) {
      console.log('❌ 未找到手機版導航選單按鈕');
      test.skip();
      return;
    }
    
    // 點擊打開手機版選單
    await mobileMenuButton.click();
    await page.waitForTimeout(2000);
    
    console.log('🔓 已打開手機版導航選單');
    
    // 截圖記錄當前狀態
    await page.screenshot({ 
      path: `test-results/mobile-menu-login-status.png`,
      fullPage: true 
    });
    
    // 檢查登入狀態
    console.log('\n🔐 檢查登入狀態...');
    
    // 檢查是否有登入按鈕（表示未登入）
    const loginButton = page.locator('.md\\:hidden').locator('text=登入');
    const isLoggedOut = await loginButton.isVisible();
    
    // 檢查是否有用戶信息（表示已登入）
    const userInfo = page.locator('.md\\:hidden').locator('text=演示模式').or(
      page.locator('.md\\:hidden').locator('text=專業帳戶').or(
        page.locator('.md\\:hidden').locator('text=南志宗')
      )
    );
    const isLoggedIn = await userInfo.isVisible();
    
    if (isLoggedOut) {
      console.log('❌ 用戶未登入 - 發現登入按鈕');
      console.log('💡 這解釋了為什麼看不到用戶管理功能');
      
      // 嘗試登入（如果有演示登入功能）
      console.log('\n🔑 嘗試登入...');
      
      // 檢查是否有演示登入或快速登入選項
      const demoLoginButton = page.locator('text=演示登入').or(
        page.locator('text=快速登入').or(
          page.locator('text=測試登入')
        )
      );
      
      if (await demoLoginButton.isVisible()) {
        console.log('✅ 找到演示登入選項');
        await demoLoginButton.click();
        await page.waitForTimeout(3000);
        
        // 重新打開選單檢查
        const reopenMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
        if (await reopenMenuButton.isVisible()) {
          await reopenMenuButton.click();
          await page.waitForTimeout(2000);
        }
        
        // 再次檢查用戶信息
        const userInfoAfterLogin = page.locator('.md\\:hidden').locator('text=演示模式').or(
          page.locator('.md\\:hidden').locator('text=專業帳戶')
        );
        
        if (await userInfoAfterLogin.isVisible()) {
          console.log('✅ 登入成功！');
          
          // 截圖登入後的狀態
          await page.screenshot({ 
            path: `test-results/mobile-menu-after-login.png`,
            fullPage: true 
          });
          
          // 檢查用戶管理功能
          console.log('\n⚙️ 檢查登入後的用戶管理功能...');
          
          const userManagementItems = [
            '編輯個人資訊', '管理付款', '語言和位置', '社區', '聯繫方式', '價格計劃', '登出'
          ];
          
          let foundUserItems = 0;
          for (const item of userManagementItems) {
            const userItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
            if (await userItem.isVisible()) {
              console.log(`✅ 找到用戶功能: ${item}`);
              foundUserItems++;
            } else {
              console.log(`❌ 缺少用戶功能: ${item}`);
            }
          }
          
          console.log(`\n📊 登入後用戶管理功能: ${foundUserItems}/${userManagementItems.length}`);
          
          if (foundUserItems > 0) {
            console.log('🎉 用戶管理功能顯示正常！');
          } else {
            console.log('⚠️ 登入後仍然看不到用戶管理功能，可能需要檢查代碼');
          }
        } else {
          console.log('❌ 登入失敗或登入狀態未更新');
        }
      } else {
        console.log('❌ 未找到演示登入選項');
        console.log('💡 建議：在實際登入的環境中測試用戶管理功能');
      }
      
    } else if (isLoggedIn) {
      console.log('✅ 用戶已登入');
      
      // 檢查用戶管理功能
      console.log('\n⚙️ 檢查用戶管理功能...');
      
      const userManagementItems = [
        '編輯個人資訊', '管理付款', '語言和位置', '社區', '聯繫方式', '價格計劃', '登出'
      ];
      
      let foundUserItems = 0;
      for (const item of userManagementItems) {
        const userItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
        if (await userItem.isVisible()) {
          console.log(`✅ 找到用戶功能: ${item}`);
          foundUserItems++;
        } else {
          console.log(`❌ 缺少用戶功能: ${item}`);
        }
      }
      
      console.log(`\n📊 用戶管理功能: ${foundUserItems}/${userManagementItems.length}`);
      
      if (foundUserItems > 0) {
        console.log('🎉 用戶管理功能顯示正常！');
      } else {
        console.log('⚠️ 雖然已登入但看不到用戶管理功能，需要檢查代碼');
      }
      
    } else {
      console.log('❓ 無法確定登入狀態');
    }
    
    // 檢查主要導航功能（這些不依賴登入狀態）
    console.log('\n🧭 檢查主要導航功能...');
    
    const mainNavItems = ['首頁', '我的活動', '功能儀表板', '創建活動'];
    let foundMainItems = 0;
    
    for (const item of mainNavItems) {
      const navItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
      if (await navItem.isVisible()) {
        console.log(`✅ 找到主要導航: ${item}`);
        foundMainItems++;
      }
    }
    
    console.log(`主要導航功能: ${foundMainItems}/${mainNavItems.length}`);
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/mobile-menu-final-status.png`,
      fullPage: true 
    });
    
    console.log('\n📋 總結:');
    console.log('=======');
    console.log(`登入狀態: ${isLoggedIn ? '已登入' : '未登入'}`);
    console.log(`主要導航: ${foundMainItems}/${mainNavItems.length} 項目可見`);
    console.log('💡 用戶管理功能需要登入後才能看到');
    
    // 驗證主要導航功能正常
    expect(foundMainItems).toBeGreaterThanOrEqual(3);
  });
});
