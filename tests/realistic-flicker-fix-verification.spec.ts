import { test, expect } from '@playwright/test';

test.describe('實際閃爍修復驗證（未登入用戶）', () => {
  test('驗證未登入用戶的 /create 頁面重新整理無閃爍', async ({ page }) => {
    console.log('🔄 開始實際閃爍修復驗證（未登入狀態）...');
    
    // 等待部署完成
    await page.waitForTimeout(60000);
    
    // 測試手機版
    console.log('📱 測試手機版未登入用戶閃爍修復...');
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 首次載入頁面
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 檢查首次載入狀態
    const initialNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    const initialLoginPrompt = await page.locator('text=請先登入').count();
    const initialLoginButton = await page.locator('text=登入').count();
    
    console.log(`📱 首次載入 - 統一導航: ${initialNavigation}, 登入提示: ${initialLoginPrompt}, 登入按鈕: ${initialLoginButton}`);
    
    // 截圖首次載入狀態
    await page.screenshot({ 
      path: 'test-results/realistic-flicker-fix-initial.png',
      fullPage: false
    });
    
    // 執行多次重新整理測試
    const reloadResults = [];
    
    for (let i = 1; i <= 3; i++) {
      console.log(`🔄 第 ${i} 次重新整理測試...`);
      
      // 重新整理頁面
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // 立即檢查導航狀態（在完全載入前）
      await page.waitForTimeout(100); // 短暫等待
      
      const earlyNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      const earlyLoginPrompt = await page.locator('text=請先登入').count();
      
      // 等待完全載入
      await page.waitForLoadState('networkidle');
      
      const finalNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      const finalLoginPrompt = await page.locator('text=請先登入').count();
      
      const result = {
        round: i,
        earlyNavigation,
        earlyLoginPrompt,
        finalNavigation,
        finalLoginPrompt,
        navigationConsistent: earlyNavigation === finalNavigation,
        promptConsistent: earlyLoginPrompt === finalLoginPrompt
      };
      
      reloadResults.push(result);
      
      console.log(`📱 第 ${i} 次 - 早期導航: ${earlyNavigation}, 早期提示: ${earlyLoginPrompt}, 最終導航: ${finalNavigation}, 最終提示: ${finalLoginPrompt}`);
      console.log(`📱 第 ${i} 次 - 導航一致: ${result.navigationConsistent ? '✅' : '❌'}, 提示一致: ${result.promptConsistent ? '✅' : '❌'}`);
      
      // 截圖每次重新整理的結果
      await page.screenshot({ 
        path: `test-results/realistic-flicker-fix-reload-${i}.png`,
        fullPage: false
      });
    }
    
    // 分析結果
    const allNavigationConsistent = reloadResults.every(r => r.navigationConsistent);
    const allPromptConsistent = reloadResults.every(r => r.promptConsistent);
    const allHaveNavigation = reloadResults.every(r => r.earlyNavigation > 0 && r.finalNavigation > 0);
    const allHavePrompt = reloadResults.every(r => r.earlyLoginPrompt > 0 && r.finalLoginPrompt > 0);
    
    console.log(`📊 測試結果分析:`);
    console.log(`📊 導航一致性: ${allNavigationConsistent ? '✅' : '❌'}`);
    console.log(`📊 提示一致性: ${allPromptConsistent ? '✅' : '❌'}`);
    console.log(`📊 始終有導航: ${allHaveNavigation ? '✅' : '❌'}`);
    console.log(`📊 始終有登入提示: ${allHavePrompt ? '✅' : '❌'}`);
    
    // 驗證修復效果
    expect(initialNavigation).toBeGreaterThan(0);
    expect(allNavigationConsistent).toBe(true);
    expect(allPromptConsistent).toBe(true);
    expect(allHaveNavigation).toBe(true);
    
    console.log('✅ 實際閃爍修復驗證完全成功');
  });

  test('測試不同設備的未登入用戶閃爍修復', async ({ page }) => {
    console.log('📊 測試多設備未登入用戶閃爍修復...');
    
    const devices = [
      { name: '手機直向', width: 375, height: 812 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      console.log(`🔍 測試 ${device.name} 未登入用戶閃爍修復...`);
      
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
      const earlyPrompt = await page.locator('text=請先登入').count();
      
      // 等待完全載入
      await page.waitForLoadState('networkidle');
      const finalNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      const finalPrompt = await page.locator('text=請先登入').count();
      
      console.log(`📱 ${device.name} - 早期導航: ${earlyNavigation}, 早期提示: ${earlyPrompt}, 最終導航: ${finalNavigation}, 最終提示: ${finalPrompt}`);
      
      // 截圖
      await page.screenshot({ 
        path: `test-results/realistic-flicker-fix-${device.name}.png`,
        fullPage: false
      });
      
      // 驗證
      expect(earlyNavigation).toBeGreaterThan(0);
      expect(finalNavigation).toBeGreaterThan(0);
      expect(earlyNavigation).toEqual(finalNavigation);
      
      console.log(`✅ ${device.name} 未登入用戶閃爍修復驗證成功`);
    }
    
    console.log('✅ 多設備未登入用戶閃爍修復測試完成');
  });

  test('驗證部署成功且頁面功能正常', async ({ page }) => {
    console.log('🚀 驗證部署成功且頁面功能正常...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      // 載入頁面
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入成功，沒有語法錯誤');
      
      // 檢查基本元素
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      const loginPrompt = await page.locator('text=請先登入').count();
      const loginButton = await page.locator('text=登入').count();
      
      console.log(`📱 基本元素檢查 - 導航: ${navigation}, 登入提示: ${loginPrompt}, 登入按鈕: ${loginButton}`);
      
      // 截圖成功狀態
      await page.screenshot({ 
        path: 'test-results/realistic-deployment-success.png',
        fullPage: false
      });
      
      // 驗證基本功能
      expect(navigation).toBeGreaterThan(0);
      expect(loginPrompt).toBeGreaterThan(0);
      expect(loginButton).toBeGreaterThan(0);
      
      console.log('✅ 部署成功且頁面功能正常');
      
    } catch (error) {
      console.log('❌ 部署失敗或頁面功能異常');
      console.log(`錯誤信息: ${error.message}`);
      
      // 截圖錯誤狀態
      await page.screenshot({ 
        path: 'test-results/realistic-deployment-failed.png',
        fullPage: false
      });
      
      throw error;
    }
  });
});
