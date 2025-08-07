import { test, expect } from '@playwright/test';

/**
 * 📱 EduCreate 手機模式佈局優化測試
 * 
 * 測試遊戲容器向上移動優化效果
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('📱 手機模式佈局優化', () => {
  
  test('📸 優化前後對比測試', async ({ page }) => {
    console.log('📱 開始手機模式佈局優化測試...');
    
    // 設置手機視窗大小 (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 頁面載入完成，開始佈局分析...');
    
    // 1. 截圖：優化前的初始狀態
    await page.screenshot({ 
      path: 'test-results/mobile-layout-before-optimization.png',
      fullPage: true 
    });
    console.log('📸 截圖：優化前的手機模式佈局');
    
    // 2. 分析當前佈局間距
    const layoutAnalysis = await page.evaluate(() => {
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
    
    if (layoutAnalysis) {
      console.log('📐 優化前佈局分析:');
      console.log(`  - 頁面標頭高度: ${Math.round(layoutAnalysis.headerHeight)}px`);
      console.log(`  - 標頭到GEPT間距: ${Math.round(layoutAnalysis.headerToGept)}px`);
      console.log(`  - GEPT選擇器高度: ${Math.round(layoutAnalysis.geptHeight)}px`);
      console.log(`  - GEPT到遊戲間距: ${Math.round(layoutAnalysis.geptToGame)}px`);
      console.log(`  - 遊戲容器頂部位置: ${Math.round(layoutAnalysis.gameContainerTop)}px`);
      console.log(`  - 遊戲容器高度: ${Math.round(layoutAnalysis.gameContainerHeight)}px`);
      console.log(`  - 可見遊戲高度: ${Math.round(layoutAnalysis.visibleGameHeight)}px`);
      console.log(`  - 遊戲可見度: ${layoutAnalysis.gameVisibilityPercentage}%`);
    }
    
    // 3. 測試滾動需求
    const scrollAnalysis = await page.evaluate(() => {
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      if (!gameContainer) return null;
      
      const rect = gameContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const gameBottom = rect.bottom;
      
      return {
        needsScrolling: gameBottom > viewportHeight,
        scrollDistance: Math.max(0, gameBottom - viewportHeight),
        gameFullyVisible: rect.top >= 0 && rect.bottom <= viewportHeight
      };
    });
    
    if (scrollAnalysis) {
      console.log('📜 滾動需求分析:');
      console.log(`  - 需要滾動: ${scrollAnalysis.needsScrolling ? '是' : '否'}`);
      console.log(`  - 滾動距離: ${Math.round(scrollAnalysis.scrollDistance)}px`);
      console.log(`  - 遊戲完全可見: ${scrollAnalysis.gameFullyVisible ? '是' : '否'}`);
    }
    
    // 4. 測試遊戲功能正常性
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
    
    // 5. 測試下拉選單功能
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
    
    // 6. 檢查觸控友好按鈕
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
    
    // 7. 最終截圖：包含所有元素的完整視圖
    await page.screenshot({ 
      path: 'test-results/mobile-layout-before-complete.png',
      fullPage: false  // 只截取視窗內容
    });
    console.log('📸 截圖：優化前視窗內容');
    
    // 8. 優化前狀態總結
    const beforeOptimization = {
      layoutAnalysis,
      scrollAnalysis,
      geptFunctional,
      dropdownFunctional,
      touchFriendlyButtons,
      timestamp: Date.now()
    };
    
    console.log('📊 優化前狀態總結:');
    console.log(`  🎮 遊戲可見度: ${layoutAnalysis?.gameVisibilityPercentage}%`);
    console.log(`  📜 需要滾動: ${scrollAnalysis?.needsScrolling ? '是' : '否'}`);
    console.log(`  🎯 GEPT功能: ${geptFunctional ? '正常' : '異常'}`);
    console.log(`  📋 下拉選單: ${dropdownFunctional ? '正常' : '異常'}`);
    console.log(`  👆 觸控友好: ${touchFriendlyButtons.percentage}%`);
    
    console.log('✅ 優化前狀態記錄完成');

    return beforeOptimization;
  });

  test('📸 優化後生產環境效果測試', async ({ page }) => {
    console.log('📱 開始生產環境優化後效果測試...');

    // 設置手機視窗大小 (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');

    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 增加等待時間確保新部署載入

    console.log('📄 生產環境頁面載入完成，開始優化後分析...');

    // 1. 截圖：優化後的生產環境狀態
    await page.screenshot({
      path: 'test-results/mobile-layout-after-optimization-production.png',
      fullPage: true
    });
    console.log('📸 截圖：優化後的生產環境手機模式佈局');

    // 2. 分析優化後的佈局間距
    const afterOptimizationAnalysis = await page.evaluate(() => {
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

    if (afterOptimizationAnalysis) {
      console.log('📐 優化後生產環境佈局分析:');
      console.log(`  - 頁面標頭高度: ${Math.round(afterOptimizationAnalysis.headerHeight)}px`);
      console.log(`  - 標頭到GEPT間距: ${Math.round(afterOptimizationAnalysis.headerToGept)}px`);
      console.log(`  - GEPT選擇器高度: ${Math.round(afterOptimizationAnalysis.geptHeight)}px`);
      console.log(`  - GEPT到遊戲間距: ${Math.round(afterOptimizationAnalysis.geptToGame)}px`);
      console.log(`  - 遊戲容器頂部位置: ${Math.round(afterOptimizationAnalysis.gameContainerTop)}px`);
      console.log(`  - 遊戲容器高度: ${Math.round(afterOptimizationAnalysis.gameContainerHeight)}px`);
      console.log(`  - 可見遊戲高度: ${Math.round(afterOptimizationAnalysis.visibleGameHeight)}px`);
      console.log(`  - 遊戲可見度: ${afterOptimizationAnalysis.gameVisibilityPercentage}%`);
    }

    // 3. 計算優化改進效果
    const beforeGameTop = 351; // 從之前的測試結果
    const afterGameTop = afterOptimizationAnalysis?.gameContainerTop || 0;
    const improvement = beforeGameTop - afterGameTop;

    console.log('📈 生產環境佈局優化改進:');
    console.log(`  - 優化前遊戲容器位置: ${beforeGameTop}px`);
    console.log(`  - 優化後遊戲容器位置: ${Math.round(afterGameTop)}px`);
    console.log(`  - 向上移動距離: ${Math.round(improvement)}px`);
    console.log(`  - 優化效果: ${improvement > 0 ? '成功向上移動' : '需要進一步調整'}`);

    // 4. 測試功能完整性
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

    // 5. 測試下拉選單功能
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

    // 6. 檢查觸控友好按鈕
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

    // 7. 視窗內容截圖
    await page.screenshot({
      path: 'test-results/mobile-layout-after-viewport-production.png',
      fullPage: false  // 只截取視窗內容
    });
    console.log('📸 截圖：優化後生產環境視窗內容');

    // 8. 優化效果總結
    console.log('📊 生產環境優化效果總結:');
    console.log(`  🎮 遊戲可見度: ${afterOptimizationAnalysis?.gameVisibilityPercentage}%`);
    console.log(`  🎯 GEPT功能: ${geptFunctional ? '正常' : '異常'}`);
    console.log(`  📋 下拉選單: ${dropdownFunctional ? '正常' : '異常'}`);
    console.log(`  👆 觸控友好: ${touchFriendlyButtons.percentage}%`);
    console.log(`  📈 向上移動: ${Math.round(improvement)}px`);

    // 9. 成功率計算
    const optimizationFeatures = [
      improvement > 10, // 成功向上移動超過10px
      geptFunctional,
      dropdownFunctional,
      touchFriendlyButtons.percentage === '100.0',
      parseFloat(afterOptimizationAnalysis?.gameVisibilityPercentage || '0') > 160
    ];

    const successfulFeatures = optimizationFeatures.filter(Boolean).length;
    const optimizationSuccessRate = (successfulFeatures / optimizationFeatures.length * 100).toFixed(1);

    console.log(`🎯 生產環境優化成功率: ${optimizationSuccessRate}% (${successfulFeatures}/${optimizationFeatures.length})`);

    if (optimizationSuccessRate === '100.0') {
      console.log('🎉 生產環境手機模式佈局優化完美成功！');
    } else if (parseFloat(optimizationSuccessRate) >= 80) {
      console.log('✅ 生產環境手機模式佈局優化表現優秀！');
    } else {
      console.log('⚠️ 生產環境手機模式佈局優化需要進一步調整');
    }

    console.log('✅ 生產環境優化效果測試完成');

    return {
      afterOptimizationAnalysis,
      improvement: Math.round(improvement),
      geptFunctional,
      dropdownFunctional,
      touchFriendlyButtons,
      optimizationSuccessRate: parseFloat(optimizationSuccessRate),
      timestamp: Date.now()
    };
  });
});
