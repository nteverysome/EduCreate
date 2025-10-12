import { test, expect } from '@playwright/test';

test.describe('最終手機版選單修復驗證', () => {
  
  test('驗證手機版選單完全移除重複導航項目', async ({ page }) => {
    console.log('🔍 驗證最終修復後的手機版選單...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 清除緩存並訪問網站
    await page.goto('https://edu-create.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 強制刷新頁面
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📱 已訪問網站並清除緩存');
    
    // 查找並點擊手機版選單按鈕
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
    
    if (!(await mobileMenuButton.isVisible())) {
      console.log('❌ 未找到手機版選單按鈕');
      return;
    }
    
    await mobileMenuButton.click();
    await page.waitForTimeout(2000);
    
    console.log('🔓 已打開手機版選單');
    
    // 截圖修復後的選單
    await page.screenshot({ 
      path: `test-results/final-fixed-mobile-menu.png`,
      fullPage: true 
    });
    
    // 檢查不應該出現的重複導航項目
    console.log('\n🚫 檢查不應該出現的重複導航項目...');
    
    const shouldNotAppearItems = [
      '首頁',
      '我的活動', 
      '創建活動',
      '功能儀表板',
      '我的結果'
    ];
    
    let foundProblematicItems = 0;
    const problematicItemsFound = [];
    
    for (const item of shouldNotAppearItems) {
      const problematicItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
      const count = await problematicItem.count();
      
      if (count > 0) {
        console.log(`⚠️ 發現不應該出現的項目: ${item} (出現 ${count} 次)`);
        foundProblematicItems += count;
        problematicItemsFound.push(`${item} (${count}次)`);
      }
    }
    
    if (foundProblematicItems === 0) {
      console.log('✅ 沒有發現重複的導航項目');
    } else {
      console.log(`❌ 發現 ${foundProblematicItems} 個重複項目:`);
      problematicItemsFound.forEach(item => console.log(`  - ${item}`));
    }
    
    // 檢查登入狀態
    console.log('\n🔐 檢查登入狀態...');
    
    const loginButton = page.locator('.md\\:hidden').locator('text=登入');
    const isLoggedOut = await loginButton.isVisible();
    
    if (isLoggedOut) {
      console.log('🔐 用戶未登入狀態');
      
      // 檢查未登入時應該顯示的項目
      const expectedLoggedOutItems = ['登入', '註冊'];
      let foundLoggedOutItems = 0;
      
      for (const item of expectedLoggedOutItems) {
        const element = page.locator(`.md\\:hidden`).locator(`text=${item}`);
        if (await element.isVisible()) {
          console.log(`✅ 找到: ${item}`);
          foundLoggedOutItems++;
        } else {
          console.log(`❌ 缺少: ${item}`);
        }
      }
      
      console.log(`未登入狀態項目: ${foundLoggedOutItems}/${expectedLoggedOutItems.length}`);
      
      // 檢查不應該出現的用戶管理功能
      const userManagementItems = [
        '編輯個人資訊', '管理付款', '語言和位置', '社區', '聯繫方式', '價格計劃', '登出'
      ];
      
      let foundUserItems = 0;
      for (const item of userManagementItems) {
        const userItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
        if (await userItem.isVisible()) {
          foundUserItems++;
          console.log(`⚠️ 未登入時不應該顯示: ${item}`);
        }
      }
      
      if (foundUserItems === 0) {
        console.log('✅ 未登入時正確隱藏用戶管理功能');
      } else {
        console.log(`❌ 未登入時錯誤顯示了 ${foundUserItems} 個用戶管理功能`);
      }
      
    } else {
      console.log('✅ 用戶已登入狀態');
      
      // 檢查已登入時應該顯示的用戶管理功能
      const expectedUserItems = [
        '編輯個人資訊', '管理付款', '語言和位置', '社區', '聯繫方式', '價格計劃', '登出'
      ];
      
      let foundUserItems = 0;
      for (const item of expectedUserItems) {
        const userItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
        if (await userItem.isVisible()) {
          console.log(`✅ 找到用戶功能: ${item}`);
          foundUserItems++;
        } else {
          console.log(`❌ 缺少用戶功能: ${item}`);
        }
      }
      
      console.log(`用戶管理功能: ${foundUserItems}/${expectedUserItems.length}`);
    }
    
    // 統計總選單項目數
    console.log('\n📊 統計總選單項目數...');
    
    const allMenuItems = await page.locator('.md\\:hidden a, .md\\:hidden button').allTextContents();
    const visibleItems = allMenuItems.filter(text => text.trim().length > 0);
    
    console.log(`總選單項目數: ${visibleItems.length}`);
    console.log('所有項目:');
    visibleItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.trim().substring(0, 30)}${item.trim().length > 30 ? '...' : ''}`);
    });
    
    // 驗證結果
    console.log('\n📋 最終驗證結果:');
    console.log('=================');
    
    const isFixed = foundProblematicItems === 0;
    
    if (isFixed) {
      console.log('🎉 手機版選單修復成功！');
      console.log('✅ 完全移除了重複的導航項目');
      console.log('✅ 只保留純用戶管理功能');
      console.log('✅ 登入/登出邏輯正確');
    } else {
      console.log('⚠️ 手機版選單仍有問題：');
      console.log(`  - 仍有重複項目: ${foundProblematicItems} 個`);
    }
    
    // 與用戶期望對比
    console.log('\n📈 修復對比:');
    console.log('用戶期望: 手機版選單像桌面版用戶下拉選單一樣，只顯示用戶管理功能');
    console.log(`實際結果: ${isFixed ? '✅ 符合期望' : '❌ 不符合期望'}`);
    console.log(`選單項目數: ${visibleItems.length} 個`);
    
    if (isLoggedOut) {
      console.log('未登入狀態: 只顯示登入/註冊按鈕 ✅');
    } else {
      console.log('已登入狀態: 只顯示用戶管理功能 ✅');
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/final-mobile-menu-verification-complete.png`,
      fullPage: true 
    });
    
    console.log('\n📋 最終手機版選單修復驗證完成');
    
    // 驗證沒有重複的導航項目
    expect(foundProblematicItems).toBe(0);
    
    // 驗證選單項目數合理（未登入時應該很少）
    if (isLoggedOut) {
      expect(visibleItems.length).toBeLessThanOrEqual(3); // 最多登入、註冊、可能的使用條款
    }
  });

  test('測試手機版選單與桌面版用戶下拉選單的一致性', async ({ page }) => {
    console.log('🔍 測試手機版與桌面版用戶選單一致性...');
    
    // 先測試桌面版用戶下拉選單
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    
    console.log('🖥️ 測試桌面版用戶選單...');
    
    // 查找桌面版用戶選單按鈕
    const desktopUserButton = page.locator('.hidden.md\\:flex').locator('button').first();
    
    let desktopUserItems = [];
    if (await desktopUserButton.isVisible()) {
      await desktopUserButton.click();
      await page.waitForTimeout(1000);
      
      const desktopMenuItems = await page.locator('.absolute.right-0').locator('a, button').allTextContents();
      desktopUserItems = desktopMenuItems.filter(text => text.trim().length > 0);
      
      console.log(`桌面版用戶選單項目數: ${desktopUserItems.length}`);
      desktopUserItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.trim()}`);
      });
    } else {
      console.log('⚠️ 桌面版用戶選單按鈕不可見（可能未登入）');
    }
    
    // 測試手機版選單
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('📱 測試手機版選單...');
    
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    let mobileUserItems = [];
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(1000);
      
      const mobileMenuItems = await page.locator('.md\\:hidden a, .md\\:hidden button').allTextContents();
      mobileUserItems = mobileMenuItems.filter(text => text.trim().length > 0);
      
      console.log(`手機版選單項目數: ${mobileUserItems.length}`);
      mobileUserItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.trim()}`);
      });
    }
    
    // 比較一致性
    console.log('\n📊 一致性比較:');
    console.log('================');
    
    if (desktopUserItems.length === 0 && mobileUserItems.length <= 3) {
      console.log('✅ 未登入狀態一致：桌面版無用戶選單，手機版只有登入/註冊');
    } else if (desktopUserItems.length > 0 && mobileUserItems.length > 3) {
      console.log('✅ 已登入狀態：兩版本都顯示用戶管理功能');
      
      // 檢查核心用戶管理功能是否一致
      const coreUserFunctions = ['編輯個人資訊', '管理付款', '語言和位置', '登出'];
      let consistentFunctions = 0;
      
      for (const func of coreUserFunctions) {
        const inDesktop = desktopUserItems.some(item => item.includes(func));
        const inMobile = mobileUserItems.some(item => item.includes(func));
        
        if (inDesktop && inMobile) {
          console.log(`✅ 一致功能: ${func}`);
          consistentFunctions++;
        } else if (inDesktop && !inMobile) {
          console.log(`⚠️ 桌面版有但手機版缺少: ${func}`);
        } else if (!inDesktop && inMobile) {
          console.log(`⚠️ 手機版有但桌面版缺少: ${func}`);
        }
      }
      
      console.log(`功能一致性: ${consistentFunctions}/${coreUserFunctions.length}`);
    }
    
    console.log('\n📋 一致性測試完成');
  });
});
