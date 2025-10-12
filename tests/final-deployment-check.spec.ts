import { test, expect } from '@playwright/test';

test.describe('最終部署檢查 - 基於 7031336 版本', () => {
  test('驗證恢復到 7031336 版本後部署成功', async ({ page }) => {
    console.log('🚀 驗證恢復到 7031336 版本後的部署狀態...');
    
    // 等待部署完成（給 Vercel 充足時間）
    console.log('⏳ 等待 Vercel 部署完成（120秒）...');
    await page.waitForTimeout(120000); // 等待 2 分鐘
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      // 嘗試載入頁面
      console.log('📱 嘗試載入 /create 頁面...');
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入成功！部署修復成功！');
      
      // 檢查基本元素
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      const pageTitle = await page.title();
      
      console.log(`📱 部署檢查結果:`);
      console.log(`📱 - 頁面標題: ${pageTitle}`);
      console.log(`📱 - 統一導航: ${navigation}`);
      
      // 等待頁面完全載入
      await page.waitForTimeout(5000);
      
      // 檢查是否有登入提示或遊戲模板
      const loginPrompt = await page.locator('text=需要登入').count();
      const loginButton = await page.locator('text=登入').count();
      const templates = await page.locator('[class*="bg-white"][class*="rounded"]').count();
      
      console.log(`📱 - 登入提示: ${loginPrompt}`);
      console.log(`📱 - 登入按鈕: ${loginButton}`);
      console.log(`📱 - 模板卡片: ${templates}`);
      
      // 截圖成功狀態
      await page.screenshot({ 
        path: 'test-results/final-deployment-success.png',
        fullPage: true
      });
      
      // 驗證基本功能
      expect(navigation).toBeGreaterThan(0);
      expect(pageTitle).toContain('EduCreate');
      
      // 驗證頁面內容（登入提示或模板）
      const hasContent = loginPrompt > 0 || templates > 0;
      expect(hasContent).toBe(true);
      
      console.log('🎉 7031336 版本部署驗證完全成功！');
      console.log('✅ 部署成功');
      console.log('✅ 無語法錯誤');
      console.log('✅ 統一導航正常');
      console.log('✅ 頁面內容正確顯示');
      
    } catch (error) {
      console.log('❌ 部署驗證失敗');
      console.log(`錯誤信息: ${error.message}`);
      
      // 截圖錯誤狀態
      await page.screenshot({ 
        path: 'test-results/final-deployment-failed.png',
        fullPage: true
      });
      
      // 檢查是否是語法錯誤
      const pageContent = await page.content();
      if (pageContent.includes('Syntax Error') || pageContent.includes('Build failed')) {
        console.log('❌ 確認：部署中仍有語法錯誤');
        console.log('❌ 需要進一步分析問題');
      } else {
        console.log('❌ 其他類型的錯誤');
      }
      
      throw error;
    }
  });

  test('測試重新整理無閃爍（僅在部署成功後）', async ({ page }) => {
    console.log('🔄 測試重新整理無閃爍...');
    
    // 等待部署完成
    await page.waitForTimeout(60000);
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // 等待頁面穩定
      await page.waitForTimeout(3000);
      
      // 重新整理測試
      console.log('🔄 執行重新整理測試...');
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // 立即檢查導航狀態
      await page.waitForTimeout(100);
      const earlyNav = await page.locator('[data-testid="unified-navigation"]').count();
      
      // 等待完全載入
      await page.waitForLoadState('networkidle');
      const finalNav = await page.locator('[data-testid="unified-navigation"]').count();
      
      const noFlicker = earlyNav === finalNav && earlyNav > 0;
      console.log(`🔄 重新整理測試 - 早期導航: ${earlyNav}, 最終導航: ${finalNav}`);
      console.log(`🔄 閃爍測試結果: ${noFlicker ? '✅ 無閃爍' : '❌ 有閃爍'}`);
      
      // 截圖重新整理後狀態
      await page.screenshot({ 
        path: 'test-results/final-deployment-reload-test.png',
        fullPage: false
      });
      
      expect(earlyNav).toBeGreaterThan(0);
      expect(finalNav).toBeGreaterThan(0);
      expect(noFlicker).toBe(true);
      
      console.log('✅ 重新整理無閃爍測試通過');
      
    } catch (error) {
      console.log('❌ 重新整理測試失敗');
      console.log(`錯誤信息: ${error.message}`);
      
      await page.screenshot({ 
        path: 'test-results/final-deployment-reload-test-error.png',
        fullPage: false
      });
      
      throw error;
    }
  });

  test('快速功能驗證', async ({ page }) => {
    console.log('⚡ 快速功能驗證...');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    try {
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // 等待頁面完全載入
      await page.waitForTimeout(5000);
      
      // 檢查頁面基本結構
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      const mainContent = await page.locator('div.min-h-screen').count();
      
      console.log(`📱 基本結構檢查:`);
      console.log(`📱 - 統一導航: ${navigation}`);
      console.log(`📱 - 主要內容區域: ${mainContent}`);
      
      // 檢查是否有搜索框（如果用戶已登入）
      const searchBox = await page.locator('input[placeholder*="輸入名稱"]').count();
      const sortSelect = await page.locator('select').count();
      
      console.log(`📱 - 搜索框: ${searchBox}`);
      console.log(`📱 - 排序選擇器: ${sortSelect}`);
      
      // 截圖功能驗證
      await page.screenshot({ 
        path: 'test-results/final-deployment-function-check.png',
        fullPage: true
      });
      
      expect(navigation).toBeGreaterThan(0);
      expect(mainContent).toBeGreaterThan(0);
      
      console.log('✅ 快速功能驗證完成');
      
    } catch (error) {
      console.log('❌ 快速功能驗證失敗');
      console.log(`錯誤信息: ${error.message}`);
      
      await page.screenshot({ 
        path: 'test-results/final-deployment-function-check-error.png',
        fullPage: true
      });
      
      throw error;
    }
  });
});
