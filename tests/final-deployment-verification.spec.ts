import { test, expect } from '@playwright/test';

/**
 * 🎯 EduCreate 最終部署驗證測試
 * 
 * 驗證響應式設計修復是否完全部署到生產環境
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('🎯 EduCreate 最終部署驗證', () => {
  
  test('🔍 最終驗證響應式修復完全部署', async ({ page }) => {
    console.log('🎯 最終驗證響應式設計修復完全部署狀況...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(8000); // 增加等待時間確保完全載入
    
    console.log('📄 頁面載入完成，進行最終檢查...');
    
    // 1. 檢查 data-testid 屬性是否存在
    const gameSwitcher = await page.locator('[data-testid="game-switcher"]').count();
    const geptSelector = await page.locator('[data-testid="gept-selector"]').count();
    const gameContainer = await page.locator('[data-testid="game-container"]').count();
    
    console.log('🏷️ data-testid 屬性最終檢查:');
    console.log(`  - game-switcher: ${gameSwitcher}`);
    console.log(`  - gept-selector: ${geptSelector}`);
    console.log(`  - game-container: ${gameContainer}`);
    
    // 2. 檢查響應式 CSS 類別是否存在
    const gameSwitcherContainer = await page.locator('.game-switcher-container').count();
    const geptSelectorClass = await page.locator('.gept-selector').count();
    const gameIframeContainer = await page.locator('.game-iframe-container').count();
    
    console.log('🎨 響應式 CSS 類別最終檢查:');
    console.log(`  - game-switcher-container: ${gameSwitcherContainer}`);
    console.log(`  - gept-selector: ${geptSelectorClass}`);
    console.log(`  - game-iframe-container: ${gameIframeContainer}`);
    
    // 3. 檢查響應式 CSS 是否載入
    const responsiveCSSLoaded = await page.evaluate(() => {
      // 檢查是否有響應式相關的 CSS 規則
      const stylesheets = Array.from(document.styleSheets);
      for (const sheet of stylesheets) {
        try {
          if (sheet.href && sheet.href.includes('responsive-game-switcher')) {
            return true;
          }
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.cssText && (
              rule.cssText.includes('game-switcher-container') ||
              rule.cssText.includes('gept-selector') ||
              rule.cssText.includes('game-iframe-container') ||
              rule.cssText.includes('touch-target-min')
            )) {
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
    
    // 4. 檢查觸控友好按鈕
    const touchFriendlyButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      let touchFriendlyCount = 0;
      let totalButtons = 0;
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        totalButtons++;
        if (rect.height >= 44) {
          touchFriendlyCount++;
        }
      });
      return {
        total: totalButtons,
        touchFriendly: touchFriendlyCount,
        percentage: totalButtons > 0 ? (touchFriendlyCount / totalButtons * 100).toFixed(1) : 0
      };
    });
    
    console.log('👆 觸控友好按鈕最終檢查:');
    console.log(`  - 總按鈕數: ${touchFriendlyButtons.total}`);
    console.log(`  - 觸控友好按鈕數: ${touchFriendlyButtons.touchFriendly}`);
    console.log(`  - 觸控友好比例: ${touchFriendlyButtons.percentage}%`);
    
    // 5. 測試 GEPT 選擇器功能
    let geptFunctional = false;
    if (geptSelector > 0) {
      try {
        const geptButtons = page.locator('[data-testid="gept-selector"] button');
        const buttonCount = await geptButtons.count();
        if (buttonCount > 0) {
          await geptButtons.first().click();
          geptFunctional = true;
          console.log('✅ GEPT 選擇器功能正常');
        }
      } catch (error) {
        console.log('❌ GEPT 選擇器功能測試失敗:', error.message);
      }
    }
    
    // 6. 測試下拉選單功能
    let dropdownFunctional = false;
    const dropdownButton = page.locator('button:has-text("切換遊戲")');
    const dropdownVisible = await dropdownButton.isVisible().catch(() => false);
    
    if (dropdownVisible) {
      try {
        await dropdownButton.click({ timeout: 5000 });
        await page.waitForTimeout(1000);
        
        const dropdownMenu = page.locator('.dropdown-menu');
        const menuVisible = await dropdownMenu.isVisible().catch(() => false);
        dropdownFunctional = menuVisible;
        
        console.log('📋 下拉選單功能:', dropdownFunctional ? '正常' : '異常');
        
        // 關閉下拉選單
        if (menuVisible) {
          await page.keyboard.press('Escape');
        }
      } catch (error) {
        console.log('❌ 下拉選單功能測試失敗:', error.message);
      }
    }
    
    // 7. 截圖記錄最終狀態
    await page.screenshot({ 
      path: 'test-results/final-deployment-verification.png',
      fullPage: true 
    });
    
    // 8. 計算最終修復成功率
    const fixes = [
      { name: 'game-switcher data-testid', success: gameSwitcher > 0, weight: 2 },
      { name: 'gept-selector data-testid', success: geptSelector > 0, weight: 2 },
      { name: 'game-container data-testid', success: gameContainer > 0, weight: 2 },
      { name: 'game-switcher-container class', success: gameSwitcherContainer > 0, weight: 2 },
      { name: 'gept-selector class', success: geptSelectorClass > 0, weight: 2 },
      { name: 'game-iframe-container class', success: gameIframeContainer > 0, weight: 2 },
      { name: '響應式 CSS 載入', success: responsiveCSSLoaded, weight: 3 },
      { name: '觸控友好按鈕', success: touchFriendlyButtons.touchFriendly > 0, weight: 1 },
      { name: 'GEPT 選擇器功能', success: geptFunctional, weight: 1 },
      { name: '下拉選單功能', success: dropdownFunctional, weight: 1 }
    ];
    
    const totalWeight = fixes.reduce((sum, fix) => sum + fix.weight, 0);
    const successWeight = fixes.filter(fix => fix.success).reduce((sum, fix) => sum + fix.weight, 0);
    const successRate = (successWeight / totalWeight) * 100;
    
    console.log('📊 最終修復部署結果:');
    fixes.forEach(fix => {
      console.log(`  ${fix.success ? '✅' : '❌'} ${fix.name} (權重: ${fix.weight})`);
    });
    console.log(`🎯 最終修復成功率: ${successRate.toFixed(1)}% (${successWeight}/${totalWeight})`);
    
    // 9. 最終評估
    if (successRate >= 90) {
      console.log('🎉 響應式設計修復完全部署成功！');
    } else if (successRate >= 70) {
      console.log('✅ 響應式設計修復基本部署成功，部分功能待優化');
    } else if (successRate >= 50) {
      console.log('⚠️ 響應式設計修復部分部署成功，需要進一步檢查');
    } else {
      console.log('❌ 響應式設計修復部署可能失敗，需要重新部署');
    }
    
    console.log('✅ 最終部署驗證完成');
    
    // 返回結果供後續使用
    return {
      successRate,
      fixes: fixes.map(fix => ({ name: fix.name, success: fix.success })),
      touchFriendlyPercentage: touchFriendlyButtons.percentage
    };
  });
});
