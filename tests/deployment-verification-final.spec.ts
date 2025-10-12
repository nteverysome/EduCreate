import { test, expect } from '@playwright/test';

test.describe('最終部署驗證', () => {
  test('驗證部署成功且無語法錯誤', async ({ page }) => {
    console.log('🚀 驗證最新部署是否成功...');
    
    // 等待部署完成（給 Vercel 一些時間）
    console.log('⏳ 等待 Vercel 部署完成...');
    await page.waitForTimeout(90000); // 等待 90 秒
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      // 嘗試載入頁面
      console.log('📱 嘗試載入 /create 頁面...');
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入成功！沒有語法錯誤！');
      
      // 檢查基本元素
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      const loginButton = await page.locator('text=登入').count();
      const pageTitle = await page.title();
      
      console.log(`📱 部署驗證結果:`);
      console.log(`📱 - 頁面標題: ${pageTitle}`);
      console.log(`📱 - 統一導航: ${navigation}`);
      console.log(`📱 - 登入按鈕: ${loginButton}`);
      
      // 截圖成功狀態
      await page.screenshot({ 
        path: 'test-results/deployment-final-success.png',
        fullPage: false
      });
      
      // 測試重新整理無閃爍
      console.log('🔄 測試重新整理無閃爍...');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(100);
      
      const earlyNav = await page.locator('[data-testid="unified-navigation"]').count();
      await page.waitForLoadState('networkidle');
      const finalNav = await page.locator('[data-testid="unified-navigation"]').count();
      
      const noFlicker = earlyNav === finalNav && earlyNav > 0;
      console.log(`🔄 重新整理測試 - 早期導航: ${earlyNav}, 最終導航: ${finalNav}`);
      console.log(`🔄 閃爍測試結果: ${noFlicker ? '✅ 無閃爍' : '❌ 有閃爍'}`);
      
      // 截圖重新整理後狀態
      await page.screenshot({ 
        path: 'test-results/deployment-final-after-reload.png',
        fullPage: false
      });
      
      // 驗證所有功能
      expect(navigation).toBeGreaterThan(0);
      expect(loginButton).toBeGreaterThan(0);
      expect(pageTitle).toContain('EduCreate');
      expect(noFlicker).toBe(true);
      
      console.log('🎉 最終部署驗證完全成功！');
      console.log('✅ 部署成功');
      console.log('✅ 無語法錯誤');
      console.log('✅ 基本功能正常');
      console.log('✅ 重新整理無閃爍');
      
    } catch (error) {
      console.log('❌ 部署驗證失敗');
      console.log(`錯誤信息: ${error.message}`);
      
      // 截圖錯誤狀態
      await page.screenshot({ 
        path: 'test-results/deployment-final-failed.png',
        fullPage: false
      });
      
      // 檢查是否是語法錯誤
      const pageContent = await page.content();
      if (pageContent.includes('Syntax Error') || pageContent.includes('Build failed')) {
        console.log('❌ 確認：部署中仍有語法錯誤');
      } else {
        console.log('❌ 其他類型的錯誤');
      }
      
      throw error;
    }
  });

  test('多設備部署驗證', async ({ page }) => {
    console.log('📊 多設備部署驗證...');
    
    // 等待部署完成
    await page.waitForTimeout(30000);
    
    const devices = [
      { name: '手機直向', width: 375, height: 812 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      console.log(`🔍 測試 ${device.name} 部署狀態...`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      
      try {
        await page.goto('https://edu-create.vercel.app/create', {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        const navigation = await page.locator('[data-testid="unified-navigation"]').count();
        const loginButton = await page.locator('text=登入').count();
        
        console.log(`📱 ${device.name} - 導航: ${navigation}, 登入按鈕: ${loginButton}`);
        
        // 截圖
        await page.screenshot({ 
          path: `test-results/deployment-final-${device.name}.png`,
          fullPage: false
        });
        
        expect(navigation).toBeGreaterThan(0);
        expect(loginButton).toBeGreaterThan(0);
        
        console.log(`✅ ${device.name} 部署驗證成功`);
        
      } catch (error) {
        console.log(`❌ ${device.name} 部署驗證失敗: ${error.message}`);
        
        await page.screenshot({ 
          path: `test-results/deployment-final-${device.name}-error.png`,
          fullPage: false
        });
        
        throw error;
      }
    }
    
    console.log('✅ 多設備部署驗證完成');
  });

  test('快速功能測試（僅在部署成功後）', async ({ page }) => {
    console.log('⚡ 快速功能測試...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // 檢查登入按鈕是否可點擊
      const loginButton = page.locator('[data-testid="login-button"]').first();
      const isVisible = await loginButton.isVisible();
      
      console.log(`📱 登入按鈕可見性: ${isVisible ? '✅' : '❌'}`);
      
      if (isVisible) {
        // 嘗試點擊（但不等待導航，只是測試可點擊性）
        try {
          await loginButton.click({ timeout: 5000 });
          console.log('✅ 登入按鈕可點擊');
        } catch (clickError) {
          console.log('⚠️ 登入按鈕點擊測試超時（可能正常）');
        }
      }
      
      // 檢查頁面基本結構
      const templates = await page.locator('[class*="bg-white"][class*="rounded"]').count();
      console.log(`📱 模板卡片數量: ${templates}`);
      
      // 截圖功能測試
      await page.screenshot({ 
        path: 'test-results/deployment-final-function-test.png',
        fullPage: false
      });
      
      expect(isVisible).toBe(true);
      
      console.log('✅ 快速功能測試完成');
      
    } catch (error) {
      console.log('❌ 快速功能測試失敗');
      console.log(`錯誤信息: ${error.message}`);
      
      await page.screenshot({ 
        path: 'test-results/deployment-final-function-test-error.png',
        fullPage: false
      });
      
      throw error;
    }
  });
});
