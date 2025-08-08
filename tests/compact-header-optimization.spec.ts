import { test, expect } from '@playwright/test';

/**
 * 📐 EduCreate 緊湊標頭優化測試
 * 
 * 測試緊湊單行標頭設計的空間節省效果
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📐 緊湊標頭優化測試', () => {
  
  test('🔍 測試緊湊單行標頭空間節省效果', async ({ page }) => {
    console.log('🔍 開始測試緊湊標頭優化效果...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到本地優化版本
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 本地頁面載入完成，開始緊湊標頭分析...');
    
    // 1. 截圖：緊湊標頭優化後的狀態
    await page.screenshot({ 
      path: 'test-results/compact-header-after-optimization.png',
      fullPage: true 
    });
    console.log('📸 截圖：緊湊標頭優化後完整頁面');
    
    // 2. 分析緊湊標頭的尺寸和佈局
    const compactHeaderAnalysis = await page.evaluate(() => {
      const unifiedHeader = document.querySelector('.unified-game-header');
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      const geptSelector = document.querySelector('[data-testid="gept-selector"]');
      
      if (!unifiedHeader) return null;
      
      const headerRect = unifiedHeader.getBoundingClientRect();
      const gameContainerRect = gameContainer ? gameContainer.getBoundingClientRect() : null;
      
      // 檢查是否為單行佈局
      const titleElement = unifiedHeader.querySelector('h1');
      const geptButtons = unifiedHeader.querySelectorAll('.gept-buttons button');
      const controlButtons = unifiedHeader.querySelectorAll('.header-controls button, button');
      
      // 計算所有元素是否在同一水平線上
      const titleTop = titleElement ? titleElement.getBoundingClientRect().top : 0;
      const geptTop = geptButtons.length > 0 ? geptButtons[0].getBoundingClientRect().top : 0;
      const controlTop = controlButtons.length > 0 ? controlButtons[0].getBoundingClientRect().top : 0;
      
      const isSingleRow = Math.abs(titleTop - geptTop) < 10 && Math.abs(geptTop - controlTop) < 10;
      
      return {
        headerHeight: Math.round(headerRect.height),
        headerTop: Math.round(headerRect.top),
        headerWidth: Math.round(headerRect.width),
        gameContainerTop: gameContainerRect ? Math.round(gameContainerRect.top) : null,
        headerToGameDistance: gameContainerRect ? Math.round(gameContainerRect.top - headerRect.bottom) : null,
        isSingleRow,
        titleTop: Math.round(titleTop),
        geptTop: Math.round(geptTop),
        controlTop: Math.round(controlTop),
        elementCount: {
          title: titleElement ? 1 : 0,
          geptButtons: geptButtons.length,
          controlButtons: controlButtons.length
        }
      };
    });
    
    if (compactHeaderAnalysis) {
      console.log('📊 緊湊標頭佈局分析:');
      console.log(`  - 標頭高度: ${compactHeaderAnalysis.headerHeight}px`);
      console.log(`  - 標頭寬度: ${compactHeaderAnalysis.headerWidth}px`);
      console.log(`  - 遊戲容器位置: ${compactHeaderAnalysis.gameContainerTop}px`);
      console.log(`  - 標頭到遊戲距離: ${compactHeaderAnalysis.headerToGameDistance}px`);
      console.log(`  - 是否為單行佈局: ${compactHeaderAnalysis.isSingleRow ? '是' : '否'}`);
      console.log(`  - 標題位置: ${compactHeaderAnalysis.titleTop}px`);
      console.log(`  - GEPT 位置: ${compactHeaderAnalysis.geptTop}px`);
      console.log(`  - 控制按鈕位置: ${compactHeaderAnalysis.controlTop}px`);
      console.log(`  - 元素數量: 標題${compactHeaderAnalysis.elementCount.title}, GEPT${compactHeaderAnalysis.elementCount.geptButtons}, 控制${compactHeaderAnalysis.elementCount.controlButtons}`);
    }
    
    // 3. 與原始標頭對比空間節省
    const originalHeaderHeight = 133; // 原始標頭高度
    const previousMergeHeight = 265; // 之前合併版本的高度
    const currentHeaderHeight = compactHeaderAnalysis?.headerHeight || 0;
    
    const spaceSavingVsOriginal = originalHeaderHeight - currentHeaderHeight;
    const spaceSavingVsPrevious = previousMergeHeight - currentHeaderHeight;
    const spaceSavingPercentageVsOriginal = originalHeaderHeight > 0 ? (spaceSavingVsOriginal / originalHeaderHeight * 100).toFixed(1) : '0';
    const spaceSavingPercentageVsPrevious = previousMergeHeight > 0 ? (spaceSavingVsPrevious / previousMergeHeight * 100).toFixed(1) : '0';
    
    console.log('\n📈 緊湊標頭空間節省效果:');
    console.log(`  - 原始標頭高度: ${originalHeaderHeight}px`);
    console.log(`  - 之前合併高度: ${previousMergeHeight}px`);
    console.log(`  - 緊湊標頭高度: ${currentHeaderHeight}px`);
    console.log(`  - 相對原始節省: ${spaceSavingVsOriginal}px (${spaceSavingPercentageVsOriginal}%)`);
    console.log(`  - 相對之前節省: ${spaceSavingVsPrevious}px (${spaceSavingPercentageVsPrevious}%)`);
    
    let optimizationStatus;
    if (spaceSavingVsOriginal > 20) {
      optimizationStatus = '✅ 相對原始版本顯著節省空間';
    } else if (spaceSavingVsOriginal > 0) {
      optimizationStatus = '⚡ 相對原始版本輕微節省空間';
    } else if (spaceSavingVsOriginal === 0) {
      optimizationStatus = '🔄 與原始版本高度相同';
    } else {
      optimizationStatus = '❌ 相對原始版本高度增加';
    }
    console.log(`  - 優化效果: ${optimizationStatus}`);
    
    // 4. 測試功能完整性
    console.log('\n🧪 緊湊標頭功能完整性測試:');
    
    // 測試 GEPT 選擇器
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const geptButtons = geptSelector.locator('button');
    const buttonCount = await geptButtons.count();
    
    let geptFunctionalityResults = [];
    for (let i = 0; i < buttonCount; i++) {
      try {
        const buttonText = await geptButtons.nth(i).textContent();
        await geptButtons.nth(i).click();
        await page.waitForTimeout(500);
        
        const isActive = await geptButtons.nth(i).evaluate(btn => 
          btn.classList.contains('bg-blue-100') || btn.classList.contains('text-blue-800')
        );
        
        geptFunctionalityResults.push({
          button: buttonText,
          clickable: true,
          activates: isActive
        });
        
        console.log(`  ✅ ${buttonText}: 可點擊 ${isActive ? '且正確激活' : '但激活狀態異常'}`);
      } catch (error) {
        geptFunctionalityResults.push({
          button: `按鈕 ${i + 1}`,
          clickable: false,
          activates: false
        });
        console.log(`  ❌ 按鈕 ${i + 1}: 點擊失敗`);
      }
    }
    
    // 5. 檢查觸控友好性
    const touchFriendlyAnalysis = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.unified-game-header button');
      const results = [];
      
      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const isTouchFriendly = rect.height >= 44;
        results.push({
          index: index + 1,
          text: button.textContent?.trim() || `按鈕 ${index + 1}`,
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          touchFriendly: isTouchFriendly
        });
      });
      
      return results;
    });
    
    console.log('\n👆 緊湊標頭觸控友好性分析:');
    touchFriendlyAnalysis.forEach(btn => {
      const status = btn.touchFriendly ? '✅' : '❌';
      console.log(`  ${status} ${btn.text}: ${btn.height}px 高度 × ${btn.width}px 寬度`);
    });
    
    const touchFriendlyCount = touchFriendlyAnalysis.filter(btn => btn.touchFriendly).length;
    const touchFriendlyPercentage = touchFriendlyAnalysis.length > 0 ? 
      (touchFriendlyCount / touchFriendlyAnalysis.length * 100).toFixed(1) : '0';
    console.log(`  📊 觸控友好比例: ${touchFriendlyCount}/${touchFriendlyAnalysis.length} (${touchFriendlyPercentage}%)`);
    
    // 6. 視窗內容截圖
    await page.screenshot({ 
      path: 'test-results/compact-header-viewport.png',
      fullPage: false
    });
    console.log('📸 截圖：緊湊標頭視窗內容');
    
    // 7. 整體評估
    const functionalityScore = geptFunctionalityResults.filter(r => r.clickable && r.activates).length / 
                              Math.max(geptFunctionalityResults.length, 1);
    const touchFriendlyScore = touchFriendlyCount / Math.max(touchFriendlyAnalysis.length, 1);
    const layoutScore = compactHeaderAnalysis?.isSingleRow ? 1 : 0.5;
    const spaceEfficiencyScore = spaceSavingVsOriginal > 20 ? 1 : spaceSavingVsOriginal > 10 ? 0.8 : 
                                spaceSavingVsOriginal > 0 ? 0.6 : spaceSavingVsOriginal === 0 ? 0.4 : 0;
    
    const overallScore = (functionalityScore + touchFriendlyScore + layoutScore + spaceEfficiencyScore) / 4;
    
    console.log('\n🎯 緊湊標頭優化總評:');
    console.log(`  - GEPT 功能完整性: ${(functionalityScore * 100).toFixed(1)}%`);
    console.log(`  - 觸控友好性: ${(touchFriendlyScore * 100).toFixed(1)}%`);
    console.log(`  - 單行佈局實現: ${layoutScore === 1 ? '✅ 完美' : '⚡ 部分'}`);
    console.log(`  - 空間效率: ${(spaceEfficiencyScore * 100).toFixed(1)}%`);
    console.log(`  - 總體評分: ${(overallScore * 100).toFixed(1)}%`);
    
    if (overallScore >= 0.9) {
      console.log('🎉 緊湊標頭優化完美成功！');
    } else if (overallScore >= 0.7) {
      console.log('✅ 緊湊標頭優化表現良好！');
    } else if (overallScore >= 0.5) {
      console.log('⚡ 緊湊標頭優化需要調整');
    } else {
      console.log('❌ 緊湊標頭優化需要重新設計');
    }
    
    console.log('\n✅ 緊湊標頭優化測試完成');
    
    return {
      compactHeaderAnalysis,
      spaceSavingVsOriginal,
      spaceSavingVsPrevious,
      geptFunctionalityResults,
      touchFriendlyAnalysis,
      overallScore: (overallScore * 100).toFixed(1)
    };
  });
});
