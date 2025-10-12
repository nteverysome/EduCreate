import { test, expect } from '@playwright/test';

test.describe('/create 頁面閃爍修復驗證', () => {
  test('驗證 /create 頁面重新整理時不會出現導航閃爍', async ({ page }) => {
    console.log('🔄 開始驗證 /create 頁面閃爍修復...');
    
    // 等待部署完成
    await page.waitForTimeout(30000);
    
    // 測試手機版
    console.log('📱 測試手機版 /create 頁面閃爍修復...');
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 首次載入頁面
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 截圖首次載入狀態
    await page.screenshot({ 
      path: 'test-results/create-page-initial-load.png',
      fullPage: false
    });
    
    // 檢查統一導航是否存在
    const initialNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 首次載入統一導航: ${initialNavigation}`);
    
    // 檢查是否有登入/註冊按鈕（不應該有）
    const loginButtons = await page.locator('text=登入, text=註冊').count();
    console.log(`📱 首次載入登入/註冊按鈕: ${loginButtons}`);
    
    // 重新整理頁面測試閃爍
    console.log('🔄 執行頁面重新整理...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // 立即檢查導航狀態（在完全載入前）
    await page.waitForTimeout(100); // 短暫等待
    
    const earlyNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 重新整理後早期導航: ${earlyNavigation}`);
    
    // 截圖重新整理後的早期狀態
    await page.screenshot({ 
      path: 'test-results/create-page-after-reload-early.png',
      fullPage: false
    });
    
    // 等待完全載入
    await page.waitForLoadState('networkidle');
    
    const finalNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 重新整理後最終導航: ${finalNavigation}`);
    
    // 截圖最終狀態
    await page.screenshot({ 
      path: 'test-results/create-page-after-reload-final.png',
      fullPage: false
    });
    
    // 驗證導航一致性（不應該有閃爍）
    expect(initialNavigation).toBeGreaterThan(0);
    expect(earlyNavigation).toBeGreaterThan(0);
    expect(finalNavigation).toBeGreaterThan(0);
    
    // 驗證導航在重新整理過程中保持一致
    expect(earlyNavigation).toEqual(finalNavigation);
    
    console.log('✅ 閃爍修復驗證完成');
  });

  test('比較修復前後的載入體驗', async ({ page }) => {
    console.log('📊 比較載入體驗...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 測試多次重新整理的一致性
    const navigationCounts: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      console.log(`🔄 第 ${i + 1} 次重新整理測試...`);
      
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // 檢查早期導航狀態
      await page.waitForTimeout(200);
      const navCount = await page.locator('[data-testid="unified-navigation"]').count();
      navigationCounts.push(navCount);
      
      console.log(`📱 第 ${i + 1} 次導航元素: ${navCount}`);
    }
    
    // 驗證所有重新整理都有一致的導航
    const allConsistent = navigationCounts.every(count => count === navigationCounts[0]);
    console.log(`📊 導航一致性: ${allConsistent ? '✅ 一致' : '❌ 不一致'}`);
    console.log(`📊 導航計數: [${navigationCounts.join(', ')}]`);
    
    expect(allConsistent).toBe(true);
    expect(navigationCounts[0]).toBeGreaterThan(0);
    
    console.log('✅ 載入體驗比較完成');
  });

  test('驗證不同載入狀態下的導航顯示', async ({ page }) => {
    console.log('🔍 驗證不同載入狀態...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 測試慢速網路情況
    await page.route('**/*', route => {
      // 延遲所有請求來模擬慢速載入
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // 在載入過程中檢查導航
    const loadingNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 載入中導航: ${loadingNavigation}`);
    
    // 截圖載入狀態
    await page.screenshot({ 
      path: 'test-results/create-page-loading-state.png',
      fullPage: false
    });
    
    // 等待完全載入
    await page.waitForLoadState('networkidle');
    
    const loadedNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 載入完成導航: ${loadedNavigation}`);
    
    // 驗證載入過程中導航始終存在
    expect(loadingNavigation).toBeGreaterThan(0);
    expect(loadedNavigation).toBeGreaterThan(0);
    expect(loadingNavigation).toEqual(loadedNavigation);
    
    console.log('✅ 載入狀態驗證完成');
  });
});
