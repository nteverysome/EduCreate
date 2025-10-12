import { test, expect } from '@playwright/test';

test.describe('最終閃爍修復驗證', () => {
  test('驗證 /create 頁面重新整理完全無閃爍', async ({ page }) => {
    console.log('🔄 開始最終閃爍修復驗證...');
    
    // 等待部署完成
    await page.waitForTimeout(60000); // 給足夠時間讓部署完成
    
    // 測試手機版
    console.log('📱 測試手機版最終閃爍修復...');
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 首次載入頁面
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 檢查首次載入狀態
    const initialNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    const initialLoginButtons = await page.locator('text=登入, text=註冊').count();
    
    console.log(`📱 首次載入 - 統一導航: ${initialNavigation}, 登入按鈕: ${initialLoginButtons}`);
    
    // 截圖首次載入狀態
    await page.screenshot({ 
      path: 'test-results/final-flicker-fix-initial.png',
      fullPage: false
    });
    
    // 執行多次重新整理測試
    const reloadResults = [];
    
    for (let i = 1; i <= 5; i++) {
      console.log(`🔄 第 ${i} 次重新整理測試...`);
      
      // 重新整理頁面
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // 立即檢查導航狀態（在完全載入前）
      await page.waitForTimeout(50); // 極短等待
      
      const earlyNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      const earlyLoginButtons = await page.locator('text=登入, text=註冊').count();
      
      // 等待完全載入
      await page.waitForLoadState('networkidle');
      
      const finalNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      const finalLoginButtons = await page.locator('text=登入, text=註冊').count();
      
      const result = {
        round: i,
        earlyNavigation,
        earlyLoginButtons,
        finalNavigation,
        finalLoginButtons,
        consistent: earlyNavigation === finalNavigation && earlyLoginButtons === finalLoginButtons
      };
      
      reloadResults.push(result);
      
      console.log(`📱 第 ${i} 次 - 早期導航: ${earlyNavigation}, 早期登入: ${earlyLoginButtons}, 最終導航: ${finalNavigation}, 最終登入: ${finalLoginButtons}, 一致性: ${result.consistent ? '✅' : '❌'}`);
      
      // 截圖每次重新整理的結果
      await page.screenshot({ 
        path: `test-results/final-flicker-fix-reload-${i}.png`,
        fullPage: false
      });
    }
    
    // 分析結果
    const allConsistent = reloadResults.every(r => r.consistent);
    const allHaveNavigation = reloadResults.every(r => r.earlyNavigation > 0 && r.finalNavigation > 0);
    const noLoginButtons = reloadResults.every(r => r.earlyLoginButtons === 0 && r.finalLoginButtons === 0);
    
    console.log(`📊 測試結果分析:`);
    console.log(`📊 所有重新整理一致性: ${allConsistent ? '✅' : '❌'}`);
    console.log(`📊 始終有導航: ${allHaveNavigation ? '✅' : '❌'}`);
    console.log(`📊 無登入按鈕閃爍: ${noLoginButtons ? '✅' : '❌'}`);
    
    // 驗證修復效果
    expect(initialNavigation).toBeGreaterThan(0);
    expect(initialLoginButtons).toBe(0);
    expect(allConsistent).toBe(true);
    expect(allHaveNavigation).toBe(true);
    expect(noLoginButtons).toBe(true);
    
    console.log('✅ 最終閃爍修復驗證完全成功');
  });

  test('測試不同設備的閃爍修復效果', async ({ page }) => {
    console.log('📊 測試多設備閃爍修復效果...');
    
    const devices = [
      { name: '手機直向', width: 375, height: 812 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      console.log(`🔍 測試 ${device.name} 閃爍修復...`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // 載入頁面
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // 重新整理測試
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // 立即檢查
      await page.waitForTimeout(100);
      const earlyNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      
      // 等待完全載入
      await page.waitForLoadState('networkidle');
      const finalNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      
      console.log(`📱 ${device.name} - 早期導航: ${earlyNavigation}, 最終導航: ${finalNavigation}`);
      
      // 截圖
      await page.screenshot({ 
        path: `test-results/final-flicker-fix-${device.name}.png`,
        fullPage: false
      });
      
      // 驗證
      expect(earlyNavigation).toBeGreaterThan(0);
      expect(finalNavigation).toBeGreaterThan(0);
      expect(earlyNavigation).toEqual(finalNavigation);
      
      console.log(`✅ ${device.name} 閃爍修復驗證成功`);
    }
    
    console.log('✅ 多設備閃爍修復測試完成');
  });

  test('壓力測試：快速連續重新整理', async ({ page }) => {
    console.log('⚡ 開始快速重新整理壓力測試...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 載入頁面
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 快速連續重新整理測試
    const rapidResults = [];
    
    for (let i = 1; i <= 10; i++) {
      console.log(`⚡ 快速重新整理 ${i}/10...`);
      
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // 極短等待後檢查
      await page.waitForTimeout(25);
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      
      rapidResults.push(navigation);
      console.log(`⚡ 第 ${i} 次快速重新整理 - 導航: ${navigation}`);
    }
    
    // 分析快速重新整理結果
    const allHaveNavigation = rapidResults.every(nav => nav > 0);
    const consistentNavigation = rapidResults.every(nav => nav === rapidResults[0]);
    
    console.log(`⚡ 快速重新整理結果: [${rapidResults.join(', ')}]`);
    console.log(`⚡ 始終有導航: ${allHaveNavigation ? '✅' : '❌'}`);
    console.log(`⚡ 導航一致性: ${consistentNavigation ? '✅' : '❌'}`);
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/final-flicker-fix-stress-test.png',
      fullPage: false
    });
    
    // 驗證壓力測試結果
    expect(allHaveNavigation).toBe(true);
    expect(consistentNavigation).toBe(true);
    
    console.log('✅ 快速重新整理壓力測試通過');
  });
});
