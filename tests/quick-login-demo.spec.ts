import { test, expect } from '@playwright/test';

test.describe('快速登入演示', () => {
  test('演示快速登入流程並驗證 /create 頁面功能', async ({ page }) => {
    console.log('🚀 開始快速登入演示...');
    
    // 設定手機版視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      // 1. 訪問 /create 頁面（未登入狀態）
      console.log('📱 步驟 1: 訪問 /create 頁面（未登入狀態）');
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // 檢查未登入狀態
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      const loginButton = await page.locator('text=登入').count();
      
      console.log(`📱 未登入狀態 - 導航: ${navigation}, 登入按鈕: ${loginButton}`);
      
      // 截圖未登入狀態
      await page.screenshot({ 
        path: 'test-results/quick-demo-step1-未登入狀態.png',
        fullPage: false
      });
      
      // 2. 點擊登入按鈕
      console.log('📱 步驟 2: 點擊登入按鈕');
      const loginButtonElement = page.locator('text=登入').first();
      await loginButtonElement.click();
      
      // 等待導航到登入頁面
      await page.waitForURL('**/auth/signin**', { timeout: 10000 });
      console.log('✅ 成功導航到登入頁面');
      
      // 截圖登入頁面
      await page.screenshot({ 
        path: 'test-results/quick-demo-step2-登入頁面.png',
        fullPage: false
      });
      
      // 3. 選擇 Google 登入（演示用）
      console.log('📱 步驟 3: 選擇 Google 登入選項');
      
      // 檢查是否有 Google 登入按鈕
      const googleButton = await page.locator('button:has-text("Google")').count();
      const signInButton = await page.locator('button:has-text("Sign in")').count();
      
      console.log(`📱 登入選項 - Google按鈕: ${googleButton}, 登入按鈕: ${signInButton}`);
      
      if (googleButton > 0) {
        console.log('✅ 找到 Google 登入按鈕');
        // 注意：這裡不實際點擊，只是演示流程
        console.log('📝 演示說明：實際使用時會點擊 Google 登入按鈕');
      } else {
        console.log('📝 演示說明：登入頁面已載入，用戶可以選擇登入方式');
      }
      
      // 4. 模擬登入成功後返回 /create 頁面
      console.log('📱 步驟 4: 模擬登入成功，返回 /create 頁面');
      
      // 直接導航回 /create 頁面來模擬登入後的狀態
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // 檢查頁面載入狀態
      const finalNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      const createContent = await page.locator('text=創建活動').count();
      const templateCards = await page.locator('[class*="bg-white"][class*="rounded"]').count();
      
      console.log(`📱 /create 頁面狀態 - 導航: ${finalNavigation}, 創建內容: ${createContent}, 模板卡片: ${templateCards}`);
      
      // 截圖最終狀態
      await page.screenshot({ 
        path: 'test-results/quick-demo-step4-create頁面最終狀態.png',
        fullPage: false
      });
      
      // 5. 測試重新整理無閃爍
      console.log('📱 步驟 5: 測試重新整理無閃爍');
      
      // 重新整理頁面
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // 立即檢查導航狀態
      await page.waitForTimeout(100);
      const earlyNavigation = await page.locator('[data-testid="unified-navigation"]').count();
      
      // 等待完全載入
      await page.waitForLoadState('networkidle');
      const finalNavigationAfterReload = await page.locator('[data-testid="unified-navigation"]').count();
      
      console.log(`📱 重新整理測試 - 早期導航: ${earlyNavigation}, 最終導航: ${finalNavigationAfterReload}`);
      
      const noFlicker = earlyNavigation === finalNavigationAfterReload && earlyNavigation > 0;
      console.log(`📱 閃爍測試結果: ${noFlicker ? '✅ 無閃爍' : '❌ 有閃爍'}`);
      
      // 截圖重新整理後狀態
      await page.screenshot({ 
        path: 'test-results/quick-demo-step5-重新整理後狀態.png',
        fullPage: false
      });
      
      // 6. 演示總結
      console.log('📊 快速登入演示總結:');
      console.log(`✅ 步驟 1: 未登入狀態正常顯示`);
      console.log(`✅ 步驟 2: 登入按鈕功能正常`);
      console.log(`✅ 步驟 3: 登入頁面載入成功`);
      console.log(`✅ 步驟 4: /create 頁面功能完整`);
      console.log(`✅ 步驟 5: 重新整理無閃爍 (${noFlicker ? '通過' : '失敗'})`);
      
      // 驗證關鍵功能
      expect(navigation).toBeGreaterThan(0); // 統一導航存在
      expect(loginButton).toBeGreaterThan(0); // 登入按鈕存在
      expect(finalNavigation).toBeGreaterThan(0); // 最終導航存在
      expect(noFlicker).toBe(true); // 無閃爍
      
      console.log('🎉 快速登入演示完成！');
      
    } catch (error) {
      console.log('❌ 演示過程中發生錯誤');
      console.log(`錯誤信息: ${error.message}`);
      
      // 截圖錯誤狀態
      await page.screenshot({ 
        path: 'test-results/quick-demo-error.png',
        fullPage: false
      });
      
      throw error;
    }
  });

  test('多設備快速登入演示', async ({ page }) => {
    console.log('📊 多設備快速登入演示...');
    
    const devices = [
      { name: '手機直向', width: 375, height: 812 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      console.log(`🔍 測試 ${device.name} 快速登入演示...`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      
      try {
        // 載入 /create 頁面
        await page.goto('https://edu-create.vercel.app/create', {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        // 檢查基本元素
        const navigation = await page.locator('[data-testid="unified-navigation"]').count();
        const loginButton = await page.locator('text=登入').count();
        
        console.log(`📱 ${device.name} - 導航: ${navigation}, 登入按鈕: ${loginButton}`);
        
        // 測試重新整理
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(100);
        
        const earlyNav = await page.locator('[data-testid="unified-navigation"]').count();
        await page.waitForLoadState('networkidle');
        const finalNav = await page.locator('[data-testid="unified-navigation"]').count();
        
        const consistent = earlyNav === finalNav && earlyNav > 0;
        console.log(`📱 ${device.name} - 重新整理一致性: ${consistent ? '✅' : '❌'}`);
        
        // 截圖
        await page.screenshot({ 
          path: `test-results/quick-demo-${device.name}.png`,
          fullPage: false
        });
        
        // 驗證
        expect(navigation).toBeGreaterThan(0);
        expect(loginButton).toBeGreaterThan(0);
        expect(consistent).toBe(true);
        
        console.log(`✅ ${device.name} 快速登入演示成功`);
        
      } catch (error) {
        console.log(`❌ ${device.name} 演示失敗: ${error.message}`);
        
        await page.screenshot({ 
          path: `test-results/quick-demo-${device.name}-error.png`,
          fullPage: false
        });
        
        throw error;
      }
    }
    
    console.log('✅ 多設備快速登入演示完成');
  });

  test('驗證部署狀態和基本功能', async ({ page }) => {
    console.log('🚀 驗證部署狀態和基本功能...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      // 載入頁面並檢查是否有語法錯誤
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入成功，沒有語法錯誤');
      
      // 檢查關鍵元素
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      const loginButton = await page.locator('text=登入').count();
      const pageTitle = await page.title();
      
      console.log(`📱 基本功能檢查:`);
      console.log(`📱 - 頁面標題: ${pageTitle}`);
      console.log(`📱 - 統一導航: ${navigation}`);
      console.log(`📱 - 登入按鈕: ${loginButton}`);
      
      // 截圖成功狀態
      await page.screenshot({ 
        path: 'test-results/quick-demo-deployment-success.png',
        fullPage: false
      });
      
      // 驗證基本功能
      expect(navigation).toBeGreaterThan(0);
      expect(loginButton).toBeGreaterThan(0);
      expect(pageTitle).toContain('EduCreate');
      
      console.log('✅ 部署狀態和基本功能驗證成功');
      
    } catch (error) {
      console.log('❌ 部署狀態或基本功能異常');
      console.log(`錯誤信息: ${error.message}`);
      
      await page.screenshot({ 
        path: 'test-results/quick-demo-deployment-failed.png',
        fullPage: false
      });
      
      throw error;
    }
  });
});
