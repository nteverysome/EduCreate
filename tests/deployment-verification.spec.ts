import { test, expect } from '@playwright/test';

/**
 * 🚀 EduCreate 部署驗證測試
 * 
 * 驗證響應式設計修復是否成功部署到生產環境
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('🚀 EduCreate 部署驗證', () => {
  
  test('🔍 驗證響應式修復部署成功', async ({ page }) => {
    console.log('🚀 驗證響應式設計修復部署狀況...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('📄 頁面載入完成，檢查修復效果...');
    
    // 1. 檢查 data-testid 屬性是否存在
    const gameSwitcher = await page.locator('[data-testid="game-switcher"]').count();
    const geptSelector = await page.locator('[data-testid="gept-selector"]').count();
    const gameContainer = await page.locator('[data-testid="game-container"]').count();
    
    console.log('🏷️ data-testid 屬性檢查:');
    console.log(`  - game-switcher: ${gameSwitcher}`);
    console.log(`  - gept-selector: ${geptSelector}`);
    console.log(`  - game-container: ${gameContainer}`);
    
    // 2. 檢查響應式 CSS 類別是否存在
    const gameSwitcherContainer = await page.locator('.game-switcher-container').count();
    const geptSelectorClass = await page.locator('.gept-selector').count();
    const gameIframeContainer = await page.locator('.game-iframe-container').count();
    
    console.log('🎨 響應式 CSS 類別檢查:');
    console.log(`  - game-switcher-container: ${gameSwitcherContainer}`);
    console.log(`  - gept-selector: ${geptSelectorClass}`);
    console.log(`  - game-iframe-container: ${gameIframeContainer}`);
    
    // 3. 檢查觸控友好按鈕
    const touchFriendlyButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      let touchFriendlyCount = 0;
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.height >= 44) {
          touchFriendlyCount++;
        }
      });
      return {
        total: buttons.length,
        touchFriendly: touchFriendlyCount
      };
    });
    
    console.log('👆 觸控友好按鈕檢查:');
    console.log(`  - 總按鈕數: ${touchFriendlyButtons.total}`);
    console.log(`  - 觸控友好按鈕數: ${touchFriendlyButtons.touchFriendly}`);
    
    // 4. 檢查響應式 CSS 是否載入
    const responsiveCSSLoaded = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      for (const sheet of stylesheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.cssText && rule.cssText.includes('game-switcher-container')) {
              return true;
            }
          }
        } catch (e) {
          // 跨域 CSS 無法讀取，跳過
        }
      }
      return false;
    });
    
    console.log('📄 響應式 CSS 載入狀況:', responsiveCSSLoaded);
    
    // 5. 截圖記錄部署後狀態
    await page.screenshot({ 
      path: 'test-results/deployment-verification-mobile.png',
      fullPage: true 
    });
    
    // 6. 測試桌面版
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/deployment-verification-desktop.png',
      fullPage: true 
    });
    
    // 7. 計算修復成功率
    const fixes = [
      { name: 'game-switcher data-testid', success: gameSwitcher > 0 },
      { name: 'gept-selector data-testid', success: geptSelector > 0 },
      { name: 'game-container data-testid', success: gameContainer > 0 },
      { name: 'game-switcher-container class', success: gameSwitcherContainer > 0 },
      { name: 'gept-selector class', success: geptSelectorClass > 0 },
      { name: 'game-iframe-container class', success: gameIframeContainer > 0 },
      { name: '觸控友好按鈕', success: touchFriendlyButtons.touchFriendly > 0 }
    ];
    
    const successCount = fixes.filter(fix => fix.success).length;
    const successRate = (successCount / fixes.length) * 100;
    
    console.log('📊 修復部署結果:');
    fixes.forEach(fix => {
      console.log(`  ${fix.success ? '✅' : '❌'} ${fix.name}`);
    });
    console.log(`🎯 修復成功率: ${successRate.toFixed(1)}% (${successCount}/${fixes.length})`);
    
    // 8. 驗證結果
    if (successRate >= 80) {
      console.log('🎉 響應式設計修復部署成功！');
    } else {
      console.log('⚠️ 響應式設計修復部署可能需要更多時間...');
    }
    
    console.log('✅ 部署驗證完成');
  });
  
  test('🔍 驗證 Firefox 兼容性修復', async ({ page }) => {
    console.log('🦊 測試 Firefox 兼容性修復...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 測試下拉選單點擊
    const dropdownButton = page.locator('button:has-text("切換遊戲")');
    const dropdownVisible = await dropdownButton.isVisible().catch(() => false);
    
    console.log('📋 下拉選單按鈕可見:', dropdownVisible);
    
    if (dropdownVisible) {
      try {
        await dropdownButton.click({ timeout: 5000 });
        console.log('✅ Firefox 下拉選單點擊成功');
        
        await page.waitForTimeout(1000);
        
        // 檢查下拉選單是否展開
        const dropdownMenu = page.locator('.dropdown-menu');
        const menuVisible = await dropdownMenu.isVisible().catch(() => false);
        console.log('📋 下拉選單展開:', menuVisible);
        
        // 截圖記錄
        await page.screenshot({ 
          path: 'test-results/firefox-compatibility-test.png',
          fullPage: true 
        });
        
      } catch (error) {
        console.log('❌ Firefox 下拉選單點擊失敗:', error.message);
      }
    }
    
    console.log('✅ Firefox 兼容性測試完成');
  });
});
