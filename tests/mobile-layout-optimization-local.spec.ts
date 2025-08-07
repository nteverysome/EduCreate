import { test, expect } from '@playwright/test';

/**
 * 📱 EduCreate 本地手機模式佈局優化測試
 * 
 * 測試本地環境中的佈局優化效果
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📱 本地手機模式佈局優化', () => {
  
  test('📸 本地優化效果測試', async ({ page }) => {
    console.log('📱 開始本地手機模式佈局優化測試...');
    
    // 設置手機視窗大小 (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到遊戲切換器頁面
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 本地頁面載入完成，開始佈局分析...');
    
    // 1. 截圖：優化後的本地狀態
    await page.screenshot({ 
      path: 'test-results/mobile-layout-after-optimization-local.png',
      fullPage: true 
    });
    console.log('📸 截圖：優化後的本地手機模式佈局');
    
    // 2. 分析優化後的佈局間距
    const optimizedLayoutAnalysis = await page.evaluate(() => {
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      const geptSelector = document.querySelector('[data-testid="gept-selector"]');
      const pageHeader = document.querySelector('.page-header');
      
      if (!gameContainer || !geptSelector || !pageHeader) {
        return null;
      }
      
      const gameContainerRect = gameContainer.getBoundingClientRect();
      const geptSelectorRect = geptSelector.getBoundingClientRect();
      const pageHeaderRect = pageHeader.getBoundingClientRect();
      
      // 計算各元素間的間距
      const headerToGept = geptSelectorRect.top - pageHeaderRect.bottom;
      const geptToGame = gameContainerRect.top - geptSelectorRect.bottom;
      const gameContainerTop = gameContainerRect.top;
      const gameContainerHeight = gameContainerRect.height;
      const visibleGameHeight = Math.max(0, 844 - gameContainerRect.top); // 可見的遊戲高度
      
      return {
        headerHeight: pageHeaderRect.height,
        headerToGept: headerToGept,
        geptHeight: geptSelectorRect.height,
        geptToGame: geptToGame,
        gameContainerTop: gameContainerTop,
        gameContainerHeight: gameContainerHeight,
        visibleGameHeight: visibleGameHeight,
        gameVisibilityPercentage: (visibleGameHeight / gameContainerHeight * 100).toFixed(1)
      };
    });
    
    if (optimizedLayoutAnalysis) {
      console.log('📐 優化後佈局分析:');
      console.log(`  - 頁面標頭高度: ${Math.round(optimizedLayoutAnalysis.headerHeight)}px`);
      console.log(`  - 標頭到GEPT間距: ${Math.round(optimizedLayoutAnalysis.headerToGept)}px`);
      console.log(`  - GEPT選擇器高度: ${Math.round(optimizedLayoutAnalysis.geptHeight)}px`);
      console.log(`  - GEPT到遊戲間距: ${Math.round(optimizedLayoutAnalysis.geptToGame)}px`);
      console.log(`  - 遊戲容器頂部位置: ${Math.round(optimizedLayoutAnalysis.gameContainerTop)}px`);
      console.log(`  - 遊戲容器高度: ${Math.round(optimizedLayoutAnalysis.gameContainerHeight)}px`);
      console.log(`  - 可見遊戲高度: ${Math.round(optimizedLayoutAnalysis.visibleGameHeight)}px`);
      console.log(`  - 遊戲可見度: ${optimizedLayoutAnalysis.gameVisibilityPercentage}%`);
    }
    
    // 3. 測試功能完整性
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const geptButtons = geptSelector.locator('button');
    const buttonCount = await geptButtons.count();
    
    let geptFunctional = false;
    if (buttonCount > 0) {
      try {
        await geptButtons.first().click();
        await page.waitForTimeout(1000);
        geptFunctional = true;
        console.log('✅ GEPT 選擇器功能正常');
      } catch (error) {
        console.log('❌ GEPT 選擇器功能異常:', error.message);
      }
    }
    
    // 4. 測試下拉選單功能
    const dropdownButton = page.locator('button:has-text("切換遊戲")');
    const dropdownVisible = await dropdownButton.isVisible().catch(() => false);
    
    let dropdownFunctional = false;
    if (dropdownVisible) {
      try {
        await dropdownButton.click();
        await page.waitForTimeout(1000);
        
        const dropdownMenu = page.locator('.dropdown-menu');
        const menuVisible = await dropdownMenu.isVisible().catch(() => false);
        dropdownFunctional = menuVisible;
        
        console.log(`📋 下拉選單功能: ${dropdownFunctional ? '正常' : '異常'}`);
        
        // 關閉下拉選單
        if (menuVisible) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      } catch (error) {
        console.log('❌ 下拉選單功能異常:', error.message);
      }
    }
    
    // 5. 檢查觸控友好按鈕
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
    
    console.log('👆 觸控友好按鈕檢查:');
    console.log(`  - 總按鈕數: ${touchFriendlyButtons.total}`);
    console.log(`  - 觸控友好按鈕數: ${touchFriendlyButtons.touchFriendly}`);
    console.log(`  - 觸控友好比例: ${touchFriendlyButtons.percentage}%`);
    
    // 6. 視窗內容截圖
    await page.screenshot({ 
      path: 'test-results/mobile-layout-after-viewport-local.png',
      fullPage: false  // 只截取視窗內容
    });
    console.log('📸 截圖：優化後本地視窗內容');
    
    // 7. 優化效果總結
    console.log('📊 本地優化效果總結:');
    console.log(`  🎮 遊戲可見度: ${optimizedLayoutAnalysis?.gameVisibilityPercentage}%`);
    console.log(`  🎯 GEPT功能: ${geptFunctional ? '正常' : '異常'}`);
    console.log(`  📋 下拉選單: ${dropdownFunctional ? '正常' : '異常'}`);
    console.log(`  👆 觸控友好: ${touchFriendlyButtons.percentage}%`);
    
    // 8. 計算優化改進
    const beforeGameTop = 351; // 從之前的測試結果
    const afterGameTop = optimizedLayoutAnalysis?.gameContainerTop || 0;
    const improvement = beforeGameTop - afterGameTop;
    
    console.log('📈 佈局優化改進:');
    console.log(`  - 優化前遊戲容器位置: ${beforeGameTop}px`);
    console.log(`  - 優化後遊戲容器位置: ${Math.round(afterGameTop)}px`);
    console.log(`  - 向上移動距離: ${Math.round(improvement)}px`);
    console.log(`  - 優化效果: ${improvement > 0 ? '成功向上移動' : '需要進一步調整'}`);
    
    console.log('✅ 本地優化效果測試完成');
    
    return {
      optimizedLayoutAnalysis,
      geptFunctional,
      dropdownFunctional,
      touchFriendlyButtons,
      improvement: Math.round(improvement),
      timestamp: Date.now()
    };
  });
});
