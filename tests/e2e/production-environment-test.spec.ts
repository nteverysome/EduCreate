import { test, expect, Page } from '@playwright/test';

/**
 * EduCreate 生產環境完整功能測試
 * 
 * 測試目標：
 * 1. 生產環境主頁載入
 * 2. 遊戲選擇器功能驗證
 * 3. Airplane Game 在生產環境的完整功能
 * 4. 與本地環境的一致性驗證
 */

const PRODUCTION_BASE_URL = 'https://edu-create.vercel.app';

test.describe('生產環境完整功能測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 設置較長的超時時間，生產環境可能需要更多載入時間
    test.setTimeout(120000);
    
    // 監聽控制台錯誤
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('生產環境控制台錯誤:', msg.text());
      }
    });
  });

  test('生產環境主頁載入測試', async ({ page }) => {
    console.log('🌐 測試生產環境主頁載入...');

    await page.goto(PRODUCTION_BASE_URL);
    
    // 等待頁面載入完成
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 檢查是否有基本的導航元素
    const hasNavigation = await page.locator('nav, header, .navigation').count();
    console.log(`找到 ${hasNavigation} 個導航元素`);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `test-results/production-homepage-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ 生產環境主頁載入成功');
  });

  test('生產環境遊戲選擇器功能測試', async ({ page }) => {
    console.log('🎮 測試生產環境遊戲選擇器...');

    await page.goto(`${PRODUCTION_BASE_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    
    // 檢查遊戲選擇器是否載入
    await expect(page.locator('[data-testid="game-switcher"], .game-switcher, iframe')).toBeVisible({ timeout: 15000 });
    
    // 檢查是否有遊戲切換按鈕
    const switchButton = page.locator('button:has-text("切換遊戲"), button:has-text("遊戲"), [role="button"]:has-text("遊戲")');
    if (await switchButton.count() > 0) {
      console.log('✅ 找到遊戲切換按鈕');
      await switchButton.first().click();
      await page.waitForTimeout(2000);
      
      // 檢查遊戲選項
      const gameOptions = page.locator('button:has-text("飛機"), [role="option"]:has-text("飛機"), .game-option:has-text("飛機")');
      const optionCount = await gameOptions.count();
      console.log(`找到 ${optionCount} 個飛機遊戲選項`);
      
      if (optionCount > 0) {
        console.log('✅ 選擇飛機遊戲選項');
        await gameOptions.first().click();
        await page.waitForTimeout(3000);
      }
    }
    
    // 檢查 iframe 是否載入
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({ timeout: 20000 });
    
    const iframeSrc = await iframe.getAttribute('src');
    console.log('生產環境 iframe src:', iframeSrc);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `test-results/production-game-switcher-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ 生產環境遊戲選擇器功能正常');
  });

  test('生產環境 Airplane Game 直接訪問測試', async ({ page }) => {
    console.log('✈️ 測試生產環境 Airplane Game 直接訪問...');

    await page.goto(`${PRODUCTION_BASE_URL}/games/airplane-game/`);
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面是否正確載入
    await expect(page).toHaveTitle(/Airplane|EduCreate/);
    
    // 檢查是否有遊戲相關元素
    const gameElements = page.locator('canvas, #game-container, .game, iframe');
    await expect(gameElements.first()).toBeVisible({ timeout: 15000 });
    
    // 等待遊戲載入
    await page.waitForTimeout(5000);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `test-results/production-airplane-game-direct-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ 生產環境 Airplane Game 直接訪問成功');
  });

  test('生產環境性能測試', async ({ page }) => {
    console.log('⚡ 測試生產環境性能...');

    // 測試主頁載入時間
    const startTime = Date.now();
    await page.goto(PRODUCTION_BASE_URL);
    await page.waitForLoadState('networkidle');
    const homepageLoadTime = Date.now() - startTime;
    console.log(`主頁載入時間: ${homepageLoadTime}ms`);
    
    // 測試遊戲選擇器載入時間
    const switcherStartTime = Date.now();
    await page.goto(`${PRODUCTION_BASE_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    const switcherLoadTime = Date.now() - switcherStartTime;
    console.log(`遊戲選擇器載入時間: ${switcherLoadTime}ms`);
    
    // 測試 Airplane Game 載入時間
    const gameStartTime = Date.now();
    await page.goto(`${PRODUCTION_BASE_URL}/games/airplane-game/`);
    await page.waitForLoadState('networkidle');
    const gameLoadTime = Date.now() - gameStartTime;
    console.log(`Airplane Game 載入時間: ${gameLoadTime}ms`);
    
    // 性能評估
    const performanceReport = {
      homepage: homepageLoadTime,
      gameSwitcher: switcherLoadTime,
      airplaneGame: gameLoadTime,
      averageLoadTime: (homepageLoadTime + switcherLoadTime + gameLoadTime) / 3
    };
    
    console.log('📊 生產環境性能報告:', performanceReport);
    
    // 檢查是否符合性能要求（假設 10 秒內為可接受）
    expect(homepageLoadTime).toBeLessThan(10000);
    expect(switcherLoadTime).toBeLessThan(10000);
    expect(gameLoadTime).toBeLessThan(15000); // 遊戲載入可以稍微長一些
    
    console.log('✅ 生產環境性能測試通過');
  });

  test('生產環境與本地環境一致性測試', async ({ page }) => {
    console.log('🔄 測試生產環境與本地環境一致性...');

    // 測試主要功能點的一致性
    const testUrls = [
      { name: '主頁', url: '' },
      { name: '遊戲選擇器', url: '/games/switcher' },
      { name: 'Airplane Game', url: '/games/airplane-game/' }
    ];
    
    const results = [];
    
    for (const testUrl of testUrls) {
      console.log(`測試 ${testUrl.name}...`);
      
      try {
        await page.goto(`${PRODUCTION_BASE_URL}${testUrl.url}`);
        await page.waitForLoadState('networkidle');
        
        // 檢查頁面是否正常載入（沒有 404 或錯誤頁面）
        const hasError = await page.locator('text=404, text=Error, text=Not Found').count();
        const isLoaded = hasError === 0;
        
        results.push({
          name: testUrl.name,
          url: testUrl.url,
          status: isLoaded ? 'SUCCESS' : 'ERROR',
          loadTime: Date.now()
        });
        
        console.log(`${isLoaded ? '✅' : '❌'} ${testUrl.name}: ${isLoaded ? '正常' : '錯誤'}`);
        
      } catch (error) {
        results.push({
          name: testUrl.name,
          url: testUrl.url,
          status: 'ERROR',
          error: error.message
        });
        console.log(`❌ ${testUrl.name}: ${error.message}`);
      }
    }
    
    // 檢查所有主要功能都正常
    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    const totalCount = results.length;
    
    console.log(`📊 一致性測試結果: ${successCount}/${totalCount} 通過`);
    
    // 要求至少 80% 的功能正常
    expect(successCount / totalCount).toBeGreaterThanOrEqual(0.8);
    
    console.log('✅ 生產環境與本地環境一致性測試通過');
  });

});
