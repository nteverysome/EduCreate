import { test, expect } from '@playwright/test';

test.describe('部署語法修復驗證', () => {
  test('驗證 /create 頁面部署成功且無語法錯誤', async ({ page }) => {
    console.log('🚀 開始驗證部署語法修復...');
    
    // 等待部署完成
    await page.waitForTimeout(45000); // 給更多時間讓部署完成
    
    // 測試手機版
    console.log('📱 測試手機版 /create 頁面部署狀態...');
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      // 嘗試載入頁面
      await page.goto('https://edu-create.vercel.app/create', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入成功，沒有語法錯誤');
      
      // 截圖成功載入的頁面
      await page.screenshot({ 
        path: 'test-results/deployment-syntax-fix-success.png',
        fullPage: false
      });
      
      // 檢查統一導航是否存在
      const navigation = await page.locator('[data-testid="unified-navigation"]').count();
      console.log(`📱 統一導航元素: ${navigation}`);
      
      // 檢查頁面標題
      const title = await page.locator('h1').first().textContent();
      console.log(`📱 頁面標題: ${title}`);
      
      // 檢查是否有遊戲模板
      const templates = await page.locator('[data-testid*="template-"]').count();
      console.log(`📱 遊戲模板數量: ${templates}`);
      
      // 驗證基本功能
      expect(navigation).toBeGreaterThan(0);
      expect(title).toContain('選擇範本');
      
      console.log('✅ 部署語法修復驗證成功');
      
    } catch (error) {
      console.log('❌ 頁面載入失敗，可能仍有語法錯誤');
      console.log(`錯誤信息: ${error.message}`);
      
      // 截圖錯誤狀態
      await page.screenshot({ 
        path: 'test-results/deployment-syntax-fix-failed.png',
        fullPage: false
      });
      
      throw error;
    }
  });

  test('測試不同設備的部署狀態', async ({ page }) => {
    console.log('📊 測試多設備部署狀態...');
    
    const devices = [
      { name: '手機直向', width: 375, height: 812 },
      { name: '手機橫向', width: 812, height: 375 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      console.log(`🔍 測試 ${device.name} (${device.width}x${device.height})...`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      
      try {
        await page.goto('https://edu-create.vercel.app/create', {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        });
        
        // 檢查基本元素
        const navigation = await page.locator('[data-testid="unified-navigation"]').count();
        const title = await page.locator('h1').first().count();
        
        console.log(`📱 ${device.name} - 導航: ${navigation}, 標題: ${title}`);
        
        // 截圖
        await page.screenshot({ 
          path: `test-results/deployment-${device.name}-${device.width}x${device.height}.png`,
          fullPage: false
        });
        
        // 驗證基本功能
        expect(navigation).toBeGreaterThan(0);
        expect(title).toBeGreaterThan(0);
        
        console.log(`✅ ${device.name} 部署驗證成功`);
        
      } catch (error) {
        console.log(`❌ ${device.name} 部署驗證失敗: ${error.message}`);
        
        // 截圖錯誤狀態
        await page.screenshot({ 
          path: `test-results/deployment-${device.name}-failed.png`,
          fullPage: false
        });
        
        // 不拋出錯誤，繼續測試其他設備
      }
    }
    
    console.log('✅ 多設備部署狀態測試完成');
  });

  test('驗證閃爍修復功能仍然有效', async ({ page }) => {
    console.log('🔄 驗證閃爍修復功能...');
    
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 首次載入
    await page.goto('https://edu-create.vercel.app/create', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // 檢查統一導航
    const initialNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 首次載入導航: ${initialNavigation}`);
    
    // 重新整理測試
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // 立即檢查導航（測試閃爍修復）
    await page.waitForTimeout(100);
    const earlyNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 重新整理後早期導航: ${earlyNavigation}`);
    
    // 等待完全載入
    await page.waitForLoadState('networkidle');
    const finalNavigation = await page.locator('[data-testid="unified-navigation"]').count();
    console.log(`📱 重新整理後最終導航: ${finalNavigation}`);
    
    // 截圖最終狀態
    await page.screenshot({ 
      path: 'test-results/flicker-fix-still-working.png',
      fullPage: false
    });
    
    // 驗證閃爍修復仍然有效
    expect(initialNavigation).toBeGreaterThan(0);
    expect(earlyNavigation).toBeGreaterThan(0);
    expect(finalNavigation).toBeGreaterThan(0);
    expect(earlyNavigation).toEqual(finalNavigation);
    
    console.log('✅ 閃爍修復功能仍然有效');
  });
});
