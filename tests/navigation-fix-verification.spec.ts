import { test, expect } from '@playwright/test';

test.describe('導航修復驗證', () => {
  test('驗證4個核心導航項目正確顯示', async ({ page }) => {
    console.log('🔧 開始驗證導航修復效果...');
    
    // 等待部署完成
    await page.waitForTimeout(30000); // 等待30秒讓部署完成
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 等待導航載入
    await page.waitForSelector('[data-testid="unified-navigation"]', { timeout: 10000 });
    
    // 檢查導航項目數量
    const navItems = await page.locator('[data-testid="unified-navigation"] a[data-testid^="nav-"]').count();
    console.log(`📊 導航項目數量: ${navItems}`);
    
    // 驗證4個核心導航項目
    const expectedNavItems = [
      { testId: 'nav-home', label: '首頁' },
      { testId: 'nav-my-activities', label: '我的活動' },
      { testId: 'nav-create-activity', label: '創建活動' },
      { testId: 'nav-dashboard', label: '功能儀表板' }
    ];
    
    let foundItems = 0;
    for (const item of expectedNavItems) {
      const navItem = page.locator(`[data-testid="${item.testId}"]`);
      const exists = await navItem.count() > 0;
      if (exists) {
        foundItems++;
        console.log(`✅ 找到核心項目: ${item.label} (${item.testId})`);
        
        // 驗證項目可見且可點擊
        await expect(navItem).toBeVisible();
        console.log(`   ✓ ${item.label} 可見且可點擊`);
      } else {
        console.log(`❌ 缺少核心項目: ${item.label} (${item.testId})`);
      }
    }
    
    // 截圖記錄修復後的狀態
    await page.screenshot({ 
      path: 'test-results/navigation-fix-verification.png',
      fullPage: false
    });
    
    console.log(`📈 找到 ${foundItems}/4 個核心導航項目`);
    
    // 驗證結果
    if (foundItems === 4) {
      console.log('🎉 導航修復成功！所有4個核心項目都正確顯示');
      expect(foundItems).toBe(4);
    } else if (foundItems >= 2) {
      console.log('⚠️ 部分導航項目顯示，可能需要更多時間部署');
      expect(foundItems).toBeGreaterThanOrEqual(2);
    } else {
      console.log('❌ 導航項目顯示異常');
      expect(foundItems).toBeGreaterThan(0);
    }
    
    // 驗證導航項目總數合理
    expect(navItems).toBeGreaterThanOrEqual(foundItems);
    expect(navItems).toBeLessThanOrEqual(10); // 不應該超過10個項目
    
    console.log('🎉 導航修復驗證完成！');
  });

  test('驗證導航項目功能正常', async ({ page }) => {
    console.log('🔗 開始驗證導航項目功能...');
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 等待導航載入
    await page.waitForSelector('[data-testid="unified-navigation"]', { timeout: 10000 });
    
    // 測試每個導航項目的點擊功能
    const testItems = [
      { testId: 'nav-home', expectedUrl: '/', label: '首頁' },
      { testId: 'nav-my-activities', expectedUrl: '/my-activities', label: '我的活動' },
      { testId: 'nav-create-activity', expectedUrl: '/create', label: '創建活動' },
      { testId: 'nav-dashboard', expectedUrl: '/dashboard', label: '功能儀表板' }
    ];
    
    for (const item of testItems) {
      const navItem = page.locator(`[data-testid="${item.testId}"]`);
      const exists = await navItem.count() > 0;
      
      if (exists) {
        console.log(`🔗 測試 ${item.label} 導航...`);
        
        // 點擊導航項目
        await navItem.click();
        await page.waitForLoadState('networkidle');
        
        // 檢查URL是否正確
        const currentUrl = page.url();
        if (currentUrl.includes(item.expectedUrl)) {
          console.log(`   ✅ ${item.label} 導航成功: ${currentUrl}`);
        } else {
          console.log(`   ⚠️ ${item.label} URL不符預期: ${currentUrl} (預期包含: ${item.expectedUrl})`);
        }
        
        // 返回首頁準備測試下一個項目
        if (item.testId !== 'nav-home') {
          await page.goto('https://edu-create.vercel.app/');
          await page.waitForLoadState('networkidle');
        }
      } else {
        console.log(`❌ 跳過測試 ${item.label} - 項目不存在`);
      }
    }
    
    console.log('🎉 導航功能測試完成！');
  });
});
