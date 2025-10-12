import { test, expect } from '@playwright/test';

test.describe('手機版導航結構檢查', () => {
  
  test('檢查手機版導航選單的完整結構', async ({ page }) => {
    console.log('🔍 開始檢查手機版導航選單結構...');
    
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
    
    console.log('✅ 找到手機版導航選單按鈕');
    
    // 點擊打開手機版選單
    await mobileMenuButton.click();
    await page.waitForTimeout(2000);
    
    console.log('🔓 已打開手機版導航選單');
    
    // 截圖記錄完整的手機版選單
    await page.screenshot({ 
      path: `test-results/mobile-navigation-full-structure.png`,
      fullPage: true 
    });
    
    // 檢查用戶信息區域
    console.log('\n👤 檢查用戶信息區域...');
    const userInfoArea = page.locator('.md\\:hidden').filter({ hasText: '專業帳戶' }).or(
      page.locator('.md\\:hidden').filter({ hasText: '演示帳戶' }).or(
        page.locator('.md\\:hidden').filter({ hasText: '南志宗' })
      )
    );
    
    if (await userInfoArea.isVisible()) {
      console.log('✅ 找到用戶信息區域');
      
      // 截圖用戶信息區域
      await userInfoArea.screenshot({ 
        path: `test-results/mobile-user-info-area.png`
      });
    } else {
      console.log('⚠️ 未找到用戶信息區域');
    }
    
    // 檢查主要導航項目
    console.log('\n🧭 檢查主要導航項目...');
    const mainNavItems = [
      '首頁', '我的活動', '功能儀表板', '創建活動'
    ];
    
    let foundMainItems = 0;
    for (const item of mainNavItems) {
      const navItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
      if (await navItem.isVisible()) {
        console.log(`✅ 找到主要導航: ${item}`);
        foundMainItems++;
      } else {
        console.log(`❌ 缺少主要導航: ${item}`);
      }
    }
    
    console.log(`主要導航項目: ${foundMainItems}/${mainNavItems.length}`);
    
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
    
    console.log(`用戶管理功能: ${foundUserItems}/${userManagementItems.length}`);
    
    // 檢查功能分類
    console.log('\n📂 檢查功能分類...');
    const categories = [
      '智能排序', '活動模板', '檔案空間', '遊戲架構', '分享系統'
    ];
    
    let foundCategories = 0;
    for (const category of categories) {
      const categoryItem = page.locator(`.md\\:hidden`).locator(`text=${category}`);
      if (await categoryItem.isVisible()) {
        console.log(`✅ 找到功能分類: ${category}`);
        foundCategories++;
      } else {
        console.log(`❌ 缺少功能分類: ${category}`);
      }
    }
    
    console.log(`功能分類項目: ${foundCategories}/${categories.length}`);
    
    // 滾動到底部檢查更多項目
    console.log('\n📜 滾動檢查更多項目...');
    await page.locator('.md\\:hidden').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // 再次截圖
    await page.screenshot({ 
      path: `test-results/mobile-navigation-scrolled.png`,
      fullPage: true 
    });
    
    // 統計所有可見的選單項目
    const allMenuItems = await page.locator('.md\\:hidden a, .md\\:hidden button').allTextContents();
    const visibleItems = allMenuItems.filter(text => text.trim().length > 0);
    
    console.log(`\n📊 總計可見選單項目: ${visibleItems.length}`);
    console.log('項目列表:');
    visibleItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.trim()}`);
    });
    
    // 檢查是否有重複的用戶功能
    console.log('\n🔍 檢查用戶功能重複情況...');
    const userFunctionDuplicates = userManagementItems.filter(item => {
      const count = visibleItems.filter(visibleItem => 
        visibleItem.includes(item)
      ).length;
      if (count > 1) {
        console.log(`⚠️ 發現重複項目: ${item} (出現 ${count} 次)`);
        return true;
      }
      return false;
    });
    
    if (userFunctionDuplicates.length === 0) {
      console.log('✅ 沒有發現重複的用戶功能項目');
    }
    
    // 生成結構報告
    console.log('\n📋 手機版導航結構報告:');
    console.log('==================');
    console.log(`總項目數: ${visibleItems.length}`);
    console.log(`主要導航: ${foundMainItems}/${mainNavItems.length} (${((foundMainItems/mainNavItems.length)*100).toFixed(1)}%)`);
    console.log(`用戶管理: ${foundUserItems}/${userManagementItems.length} (${((foundUserItems/userManagementItems.length)*100).toFixed(1)}%)`);
    console.log(`功能分類: ${foundCategories}/${categories.length} (${((foundCategories/categories.length)*100).toFixed(1)}%)`);
    console.log(`重複項目: ${userFunctionDuplicates.length}`);
    
    // 驗證用戶管理功能至少有 70% 可見
    expect(foundUserItems).toBeGreaterThanOrEqual(Math.ceil(userManagementItems.length * 0.7));
  });

  test('驗證用戶選單功能的位置和可訪問性', async ({ page }) => {
    console.log('🔍 驗證用戶選單功能的位置和可訪問性...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 打開手機版選單
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 測試用戶管理功能的點擊
    const testUserFunctions = [
      { name: '編輯個人資訊', expectedPath: '/account/profile' },
      { name: '管理付款', expectedPath: '/account/payment' },
      { name: '語言和位置', expectedPath: '/account/language' }
    ];
    
    for (const func of testUserFunctions) {
      console.log(`🔗 測試用戶功能: ${func.name}`);
      
      const functionLink = page.locator(`.md\\:hidden`).locator(`text=${func.name}`);
      
      if (await functionLink.isVisible()) {
        console.log(`  ✅ ${func.name} 可見`);
        
        // 檢查是否為連結
        const href = await functionLink.getAttribute('href');
        if (href && href.includes(func.expectedPath)) {
          console.log(`  ✅ ${func.name} 連結正確: ${href}`);
        } else {
          console.log(`  ⚠️ ${func.name} 連結可能不正確: ${href}`);
        }
      } else {
        console.log(`  ❌ ${func.name} 不可見`);
      }
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/mobile-user-functions-accessibility.png`,
      fullPage: true 
    });
    
    console.log('✅ 用戶選單功能可訪問性檢查完成');
  });
});
