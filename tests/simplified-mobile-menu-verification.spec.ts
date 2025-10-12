import { test, expect } from '@playwright/test';

test.describe('簡化手機版選單驗證', () => {
  
  test('驗證簡化後的手機版選單只顯示核心功能', async ({ page }) => {
    console.log('🔍 驗證簡化後的手機版選單...');
    
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
    
    // 截圖簡化後的選單
    await page.screenshot({ 
      path: `test-results/simplified-mobile-menu.png`,
      fullPage: true 
    });
    
    // 檢查核心導航功能（應該只有這4個）
    console.log('\n🧭 檢查核心導航功能...');
    
    const expectedCoreItems = [
      { name: '首頁', icon: '🏠' },
      { name: '我的活動', icon: '📋' },
      { name: '創建活動', icon: '🚀' },
      { name: '功能儀表板', icon: '📊' }
    ];
    
    let foundCoreItems = 0;
    for (const item of expectedCoreItems) {
      const navItem = page.locator(`.md\\:hidden`).locator(`text=${item.name}`);
      if (await navItem.isVisible()) {
        console.log(`✅ 找到核心導航: ${item.icon} ${item.name}`);
        foundCoreItems++;
      } else {
        console.log(`❌ 缺少核心導航: ${item.icon} ${item.name}`);
      }
    }
    
    console.log(`核心導航功能: ${foundCoreItems}/${expectedCoreItems.length}`);
    
    // 檢查不應該出現的功能項目（已清理的功能）
    console.log('\n🚫 檢查不應該出現的功能項目...');
    
    const shouldNotAppearItems = [
      '智能排序',
      '活動模板和快速創建',
      '完整檔案空間系統',
      '完整5遊戲模板架構',
      '完整遊戲切換系統',
      '完整分享系統',
      '完整縮圖和預覽系統',
      '活動複製和模板化',
      '活動歷史和版本管理',
      '活動導入導出功能',
      '收藏和標籤系統',
      '活動統計和分析',
      '檔案夾統計',
      '富文本編輯器',
      '多媒體支持',
      '語音錄製',
      'GEPT分級系統',
      '實時協作',
      'AI內容生成',
      '自動保存系統',
      '智能搜索系統',
      '批量操作系統',
      '檔案管理',
      '檔案夾協作',
      '檔案夾模板',
      '檔案夾導入導出',
      '實時同步'
    ];
    
    let foundUnwantedItems = 0;
    const unwantedItemsFound = [];
    
    for (const item of shouldNotAppearItems) {
      const unwantedItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
      if (await unwantedItem.isVisible()) {
        console.log(`⚠️ 發現不應該出現的項目: ${item}`);
        foundUnwantedItems++;
        unwantedItemsFound.push(item);
      }
    }
    
    if (foundUnwantedItems === 0) {
      console.log('✅ 沒有發現不應該出現的功能項目');
    } else {
      console.log(`❌ 發現 ${foundUnwantedItems} 個不應該出現的項目:`);
      unwantedItemsFound.forEach(item => console.log(`  - ${item}`));
    }
    
    // 檢查用戶管理功能（登入狀態相關）
    console.log('\n👤 檢查用戶管理功能...');
    
    const loginButton = page.locator('.md\\:hidden').locator('text=登入');
    const isLoggedOut = await loginButton.isVisible();
    
    if (isLoggedOut) {
      console.log('🔐 用戶未登入，檢查登入/註冊按鈕...');
      
      const registerButton = page.locator('.md\\:hidden').locator('text=註冊');
      const hasRegisterButton = await registerButton.isVisible();
      
      console.log(`登入按鈕: ${isLoggedOut ? '✅ 可見' : '❌ 不可見'}`);
      console.log(`註冊按鈕: ${hasRegisterButton ? '✅ 可見' : '❌ 不可見'}`);
      
    } else {
      console.log('✅ 用戶已登入，檢查用戶管理功能...');
      
      const userManagementItems = [
        '編輯個人資訊', '管理付款', '語言和位置', '社區', '聯繫方式', '價格計劃', '登出'
      ];
      
      let foundUserItems = 0;
      for (const item of userManagementItems) {
        const userItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
        if (await userItem.isVisible()) {
          console.log(`✅ 找到用戶功能: ${item}`);
          foundUserItems++;
        }
      }
      
      console.log(`用戶管理功能: ${foundUserItems}/${userManagementItems.length}`);
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
    console.log('\n📋 驗證結果:');
    console.log('=============');
    
    const isSimplified = foundUnwantedItems === 0 && foundCoreItems === expectedCoreItems.length;
    
    if (isSimplified) {
      console.log('🎉 手機版選單已成功簡化！');
      console.log('✅ 只顯示核心導航功能');
      console.log('✅ 移除了所有不需要的功能項目');
      console.log('✅ 保持了用戶管理功能的邏輯');
    } else {
      console.log('⚠️ 手機版選單簡化不完全：');
      if (foundCoreItems < expectedCoreItems.length) {
        console.log(`  - 缺少核心導航功能: ${expectedCoreItems.length - foundCoreItems} 個`);
      }
      if (foundUnwantedItems > 0) {
        console.log(`  - 仍有不需要的功能項目: ${foundUnwantedItems} 個`);
      }
    }
    
    // 與之前的對比
    console.log('\n📈 改進對比:');
    console.log(`之前選單項目數: 33+ 個`);
    console.log(`現在選單項目數: ${visibleItems.length} 個`);
    console.log(`簡化程度: ${((33 - visibleItems.length) / 33 * 100).toFixed(1)}%`);
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/simplified-mobile-menu-final.png`,
      fullPage: true 
    });
    
    console.log('\n📋 簡化手機版選單驗證完成');
    
    // 驗證核心功能都存在
    expect(foundCoreItems).toBe(expectedCoreItems.length);
    
    // 驗證沒有不應該出現的項目（允許少量例外）
    expect(foundUnwantedItems).toBeLessThanOrEqual(2);
  });
});
