import { test, expect } from '@playwright/test';

/**
 * 📱 EduCreate 手機模式響應式設計展示測試
 * 
 * 展示響應式設計修復在手機模式下的完美效果
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('📱 手機模式響應式設計展示', () => {
  
  test('📱 手機模式完整響應式體驗展示', async ({ page }) => {
    console.log('📱 開始手機模式響應式設計展示...');
    
    // 設置手機視窗大小 (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 頁面載入完成，開始手機模式展示...');
    
    // 1. 截圖：初始手機模式狀態
    await page.screenshot({ 
      path: 'test-results/mobile-demo-01-initial.png',
      fullPage: true 
    });
    console.log('📸 截圖 1：手機模式初始狀態');
    
    // 2. 檢查響應式元素可見性
    const gameSwitcher = page.locator('[data-testid="game-switcher"]');
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const gameContainer = page.locator('[data-testid="game-container"]');
    
    await expect(gameSwitcher).toBeVisible();
    await expect(geptSelector).toBeVisible();
    await expect(gameContainer).toBeVisible();
    
    console.log('✅ 所有響應式元素在手機模式下正確顯示');
    
    // 3. 測試觸控友好按鈕
    const touchFriendlyButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const results = [];
      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const isTouchFriendly = rect.height >= 44;
        results.push({
          index: index + 1,
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          touchFriendly: isTouchFriendly,
          text: button.textContent?.substring(0, 20) || ''
        });
      });
      return results;
    });
    
    console.log('👆 手機模式觸控友好按鈕檢查:');
    touchFriendlyButtons.forEach(btn => {
      const status = btn.touchFriendly ? '✅' : '❌';
      console.log(`  ${status} 按鈕 ${btn.index}: ${btn.height}px 高度 - "${btn.text}"`);
    });
    
    // 4. 測試 GEPT 選擇器在手機模式下的功能
    console.log('🎯 測試 GEPT 選擇器手機操作...');
    
    const geptButtons = geptSelector.locator('button');
    const buttonCount = await geptButtons.count();
    
    if (buttonCount > 0) {
      // 點擊第一個 GEPT 按鈕
      await geptButtons.first().click();
      await page.waitForTimeout(1000);
      
      // 截圖：GEPT 選擇器操作後
      await page.screenshot({ 
        path: 'test-results/mobile-demo-02-gept-selected.png',
        fullPage: true 
      });
      console.log('📸 截圖 2：GEPT 選擇器操作後狀態');
      
      // 點擊另一個 GEPT 按鈕
      if (buttonCount > 1) {
        await geptButtons.nth(1).click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'test-results/mobile-demo-03-gept-changed.png',
          fullPage: true 
        });
        console.log('📸 截圖 3：GEPT 等級切換效果');
      }
    }
    
    // 5. 測試遊戲切換下拉選單
    console.log('🎮 測試遊戲切換下拉選單手機操作...');
    
    const dropdownButton = page.locator('button:has-text("切換遊戲")');
    const dropdownVisible = await dropdownButton.isVisible().catch(() => false);
    
    if (dropdownVisible) {
      // 點擊下拉選單按鈕
      await dropdownButton.click();
      await page.waitForTimeout(1500);
      
      // 截圖：下拉選單展開狀態
      await page.screenshot({ 
        path: 'test-results/mobile-demo-04-dropdown-open.png',
        fullPage: true 
      });
      console.log('📸 截圖 4：手機模式下拉選單展開');
      
      // 檢查下拉選單項目
      const dropdownMenu = page.locator('.dropdown-menu');
      const menuVisible = await dropdownMenu.isVisible().catch(() => false);
      
      if (menuVisible) {
        const menuItems = dropdownMenu.locator('button, a');
        const itemCount = await menuItems.count();
        console.log(`📋 下拉選單包含 ${itemCount} 個選項`);
        
        // 如果有選項，點擊第一個
        if (itemCount > 0) {
          await menuItems.first().click();
          await page.waitForTimeout(2000);
          
          // 截圖：選擇遊戲後
          await page.screenshot({ 
            path: 'test-results/mobile-demo-05-game-selected.png',
            fullPage: true 
          });
          console.log('📸 截圖 5：選擇遊戲後狀態');
        }
      }
    }
    
    // 6. 測試遊戲容器響應式
    console.log('🎮 檢查遊戲容器手機適配...');
    
    const gameContainerInfo = await gameContainer.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        maxWidth: styles.maxWidth,
        margin: styles.margin,
        padding: styles.padding,
        overflow: styles.overflow
      };
    });
    
    console.log('📐 遊戲容器手機適配信息:');
    console.log(`  - 寬度: ${gameContainerInfo.width}px`);
    console.log(`  - 高度: ${gameContainerInfo.height}px`);
    console.log(`  - 最大寬度: ${gameContainerInfo.maxWidth}`);
    console.log(`  - 邊距: ${gameContainerInfo.margin}`);
    console.log(`  - 內邊距: ${gameContainerInfo.padding}`);
    console.log(`  - 溢出處理: ${gameContainerInfo.overflow}`);
    
    // 7. 測試滾動行為
    console.log('📜 測試手機模式滾動行為...');
    
    // 滾動到頁面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // 截圖：滾動到底部
    await page.screenshot({ 
      path: 'test-results/mobile-demo-06-scrolled-bottom.png',
      fullPage: true 
    });
    console.log('📸 截圖 6：滾動到底部狀態');
    
    // 滾動回頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    // 8. 最終手機模式總結
    const finalMobileStatus = {
      viewportWidth: 390,
      viewportHeight: 844,
      touchFriendlyButtons: touchFriendlyButtons.filter(btn => btn.touchFriendly).length,
      totalButtons: touchFriendlyButtons.length,
      geptFunctional: buttonCount > 0,
      dropdownFunctional: dropdownVisible,
      gameContainerResponsive: gameContainerInfo.width <= 390
    };
    
    const touchFriendlyPercentage = (finalMobileStatus.touchFriendlyButtons / finalMobileStatus.totalButtons * 100).toFixed(1);
    
    console.log('📊 手機模式響應式設計總結:');
    console.log(`  📱 視窗大小: ${finalMobileStatus.viewportWidth}x${finalMobileStatus.viewportHeight}`);
    console.log(`  👆 觸控友好按鈕: ${finalMobileStatus.touchFriendlyButtons}/${finalMobileStatus.totalButtons} (${touchFriendlyPercentage}%)`);
    console.log(`  🎯 GEPT 選擇器: ${finalMobileStatus.geptFunctional ? '正常' : '異常'}`);
    console.log(`  📋 下拉選單: ${finalMobileStatus.dropdownFunctional ? '正常' : '異常'}`);
    console.log(`  🎮 遊戲容器適配: ${finalMobileStatus.gameContainerResponsive ? '正常' : '異常'}`);
    
    // 最終截圖：完整手機模式展示
    await page.screenshot({ 
      path: 'test-results/mobile-demo-07-final-state.png',
      fullPage: true 
    });
    console.log('📸 截圖 7：最終手機模式完整展示');
    
    // 9. 成功率計算
    const mobileFeatures = [
      finalMobileStatus.touchFriendlyButtons > 0,
      finalMobileStatus.geptFunctional,
      finalMobileStatus.dropdownFunctional,
      finalMobileStatus.gameContainerResponsive,
      touchFriendlyPercentage === '100.0'
    ];
    
    const successfulFeatures = mobileFeatures.filter(Boolean).length;
    const mobileSuccessRate = (successfulFeatures / mobileFeatures.length * 100).toFixed(1);
    
    console.log(`🎯 手機模式響應式成功率: ${mobileSuccessRate}% (${successfulFeatures}/${mobileFeatures.length})`);
    
    if (mobileSuccessRate === '100.0') {
      console.log('🎉 手機模式響應式設計完美成功！');
    } else if (parseFloat(mobileSuccessRate) >= 80) {
      console.log('✅ 手機模式響應式設計表現優秀！');
    } else {
      console.log('⚠️ 手機模式響應式設計需要優化');
    }
    
    console.log('✅ 手機模式響應式設計展示完成');
    
    // 返回測試結果
    return {
      mobileSuccessRate: parseFloat(mobileSuccessRate),
      touchFriendlyPercentage: parseFloat(touchFriendlyPercentage),
      screenshots: 7,
      features: finalMobileStatus
    };
  });
});
