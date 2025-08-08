import { test, expect } from '@playwright/test';

/**
 * 📐 EduCreate 頁面標頭合併優化最終驗證測試
 * 
 * 驗證修復後的完整功能和最終優化效果
 */

const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('📐 頁面標頭合併優化最終驗證', () => {
  
  test('🎯 最終驗證：完整功能和優化效果', async ({ page }) => {
    console.log('🎯 開始最終驗證測試...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到本地優化版本
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 本地頁面載入完成，開始最終驗證...');
    
    // 1. 截圖：最終優化版本
    await page.screenshot({ 
      path: 'test-results/final-header-optimization-complete.png',
      fullPage: true 
    });
    console.log('📸 截圖：最終優化版本完整頁面');
    
    // 2. 完整的佈局分析
    const finalLayoutAnalysis = await page.evaluate(() => {
      const unifiedHeader = document.querySelector('.unified-game-header');
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      const geptSelector = document.querySelector('[data-testid="gept-selector"]');
      
      if (!unifiedHeader) return null;
      
      const headerRect = unifiedHeader.getBoundingClientRect();
      const gameContainerRect = gameContainer ? gameContainer.getBoundingClientRect() : null;
      
      // 檢查所有關鍵元素
      const titleElement = unifiedHeader.querySelector('h1');
      const gameInfo = unifiedHeader.querySelector('.text-blue-900');
      const geptButtons = unifiedHeader.querySelectorAll('.gept-buttons button');
      const controlButtons = unifiedHeader.querySelectorAll('button');
      
      // 計算佈局效率
      const headerArea = headerRect.width * headerRect.height;
      const contentElements = unifiedHeader.querySelectorAll('h1, button, span').length;
      const layoutDensity = contentElements / (headerArea / 1000); // 每1000px²的元素密度
      
      return {
        headerHeight: Math.round(headerRect.height),
        headerWidth: Math.round(headerRect.width),
        gameContainerTop: gameContainerRect ? Math.round(gameContainerRect.top) : null,
        headerToGameDistance: gameContainerRect ? Math.round(gameContainerRect.top - headerRect.bottom) : null,
        hasTitle: !!titleElement,
        hasGameInfo: !!gameInfo,
        geptButtonCount: geptButtons.length,
        totalButtonCount: controlButtons.length,
        layoutDensity: layoutDensity.toFixed(2),
        contentElements
      };
    });
    
    if (finalLayoutAnalysis) {
      console.log('📊 最終佈局分析:');
      console.log(`  - 標頭高度: ${finalLayoutAnalysis.headerHeight}px`);
      console.log(`  - 標頭寬度: ${finalLayoutAnalysis.headerWidth}px`);
      console.log(`  - 遊戲容器位置: ${finalLayoutAnalysis.gameContainerTop}px`);
      console.log(`  - 標頭到遊戲距離: ${finalLayoutAnalysis.headerToGameDistance}px`);
      console.log(`  - 包含標題: ${finalLayoutAnalysis.hasTitle ? '是' : '否'}`);
      console.log(`  - 包含遊戲資訊: ${finalLayoutAnalysis.hasGameInfo ? '是' : '否'}`);
      console.log(`  - GEPT 按鈕數量: ${finalLayoutAnalysis.geptButtonCount}`);
      console.log(`  - 總按鈕數量: ${finalLayoutAnalysis.totalButtonCount}`);
      console.log(`  - 佈局密度: ${finalLayoutAnalysis.layoutDensity} 元素/1000px²`);
      console.log(`  - 內容元素總數: ${finalLayoutAnalysis.contentElements}`);
    }
    
    // 3. 完整的 GEPT 功能測試（修復後）
    console.log('\n🧪 GEPT 選擇器完整功能測試:');
    
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const geptButtons = geptSelector.locator('button');
    const buttonCount = await geptButtons.count();
    
    let allGeptResults = [];
    for (let i = 0; i < buttonCount; i++) {
      try {
        const buttonText = await geptButtons.nth(i).textContent();
        
        // 點擊前的狀態
        const beforeActive = await geptButtons.nth(i).evaluate(btn => 
          btn.classList.contains('bg-blue-100') || btn.classList.contains('text-blue-800')
        );
        
        // 點擊按鈕
        await geptButtons.nth(i).click();
        await page.waitForTimeout(1000);
        
        // 點擊後的狀態
        const afterActive = await geptButtons.nth(i).evaluate(btn => 
          btn.classList.contains('bg-blue-100') || btn.classList.contains('text-blue-800')
        );
        
        // 檢查其他按鈕是否正確取消激活
        let otherButtonsDeactivated = true;
        for (let j = 0; j < buttonCount; j++) {
          if (j !== i) {
            const otherActive = await geptButtons.nth(j).evaluate(btn => 
              btn.classList.contains('bg-blue-100') || btn.classList.contains('text-blue-800')
            );
            if (otherActive) {
              otherButtonsDeactivated = false;
              break;
            }
          }
        }
        
        allGeptResults.push({
          button: buttonText,
          index: i + 1,
          clickable: true,
          beforeActive,
          afterActive,
          stateChanged: beforeActive !== afterActive,
          otherButtonsDeactivated,
          fullFunctionality: afterActive && otherButtonsDeactivated
        });
        
        const status = afterActive && otherButtonsDeactivated ? '✅' : '⚠️';
        console.log(`  ${status} ${buttonText}: 點擊${afterActive ? '激活' : '未激活'}, 其他按鈕${otherButtonsDeactivated ? '正確取消' : '狀態異常'}`);
        
      } catch (error) {
        allGeptResults.push({
          button: `按鈕 ${i + 1}`,
          index: i + 1,
          clickable: false,
          error: error.message
        });
        console.log(`  ❌ 按鈕 ${i + 1}: 點擊失敗 - ${error.message}`);
      }
    }
    
    // 4. 觸控友好性最終檢查
    const finalTouchAnalysis = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.unified-game-header button');
      const results = [];
      
      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const isTouchFriendly = rect.height >= 44 && rect.width >= 44;
        const isAccessible = rect.height >= 44; // WCAG 2.1 AA 標準
        
        results.push({
          index: index + 1,
          text: button.textContent?.trim() || `按鈕 ${index + 1}`,
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          touchFriendly: isTouchFriendly,
          accessible: isAccessible,
          area: Math.round(rect.width * rect.height)
        });
      });
      
      return results;
    });
    
    console.log('\n👆 最終觸控友好性分析:');
    finalTouchAnalysis.forEach(btn => {
      const touchStatus = btn.touchFriendly ? '✅' : btn.accessible ? '⚡' : '❌';
      const accessStatus = btn.accessible ? 'WCAG合規' : 'WCAG不合規';
      console.log(`  ${touchStatus} ${btn.text}: ${btn.height}px×${btn.width}px (${btn.area}px²) - ${accessStatus}`);
    });
    
    const touchFriendlyCount = finalTouchAnalysis.filter(btn => btn.touchFriendly).length;
    const accessibleCount = finalTouchAnalysis.filter(btn => btn.accessible).length;
    const touchFriendlyPercentage = finalTouchAnalysis.length > 0 ? 
      (touchFriendlyCount / finalTouchAnalysis.length * 100).toFixed(1) : '0';
    const accessiblePercentage = finalTouchAnalysis.length > 0 ? 
      (accessibleCount / finalTouchAnalysis.length * 100).toFixed(1) : '0';
    
    console.log(`  📊 觸控友好比例: ${touchFriendlyCount}/${finalTouchAnalysis.length} (${touchFriendlyPercentage}%)`);
    console.log(`  ♿ WCAG 合規比例: ${accessibleCount}/${finalTouchAnalysis.length} (${accessiblePercentage}%)`);
    
    // 5. 最終優化效果總結
    const originalHeaderHeight = 133;
    const currentHeaderHeight = finalLayoutAnalysis?.headerHeight || 0;
    const finalSpaceSaving = originalHeaderHeight - currentHeaderHeight;
    const finalSavingPercentage = originalHeaderHeight > 0 ? (finalSpaceSaving / originalHeaderHeight * 100).toFixed(1) : '0';
    
    console.log('\n📈 最終優化效果總結:');
    console.log(`  - 原始標頭高度: ${originalHeaderHeight}px`);
    console.log(`  - 最終標頭高度: ${currentHeaderHeight}px`);
    console.log(`  - 最終節省空間: ${finalSpaceSaving}px`);
    console.log(`  - 最終節省比例: ${finalSavingPercentage}%`);
    console.log(`  - 遊戲容器位置: ${finalLayoutAnalysis?.gameContainerTop}px (更接近頂端)`);
    
    // 6. 視窗內容截圖
    await page.screenshot({ 
      path: 'test-results/final-header-optimization-viewport.png',
      fullPage: false
    });
    console.log('📸 截圖：最終優化視窗內容');
    
    // 7. 最終評分計算
    const geptFunctionalityScore = allGeptResults.filter(r => r.fullFunctionality).length / 
                                  Math.max(allGeptResults.length, 1);
    const touchFriendlyScore = touchFriendlyCount / Math.max(finalTouchAnalysis.length, 1);
    const accessibilityScore = accessibleCount / Math.max(finalTouchAnalysis.length, 1);
    const spaceEfficiencyScore = finalSpaceSaving > 20 ? 1 : finalSpaceSaving > 10 ? 0.8 : 
                                finalSpaceSaving > 0 ? 0.6 : 0;
    const layoutIntegrationScore = (finalLayoutAnalysis?.hasTitle ? 0.25 : 0) + 
                                  (finalLayoutAnalysis?.hasGameInfo ? 0.25 : 0) + 
                                  (finalLayoutAnalysis?.geptButtonCount >= 3 ? 0.25 : 0) + 
                                  (finalLayoutAnalysis?.totalButtonCount >= 5 ? 0.25 : 0);
    
    const finalOverallScore = (geptFunctionalityScore + touchFriendlyScore + accessibilityScore + 
                              spaceEfficiencyScore + layoutIntegrationScore) / 5;
    
    console.log('\n🎯 最終優化總評:');
    console.log(`  - GEPT 功能完整性: ${(geptFunctionalityScore * 100).toFixed(1)}%`);
    console.log(`  - 觸控友好性: ${(touchFriendlyScore * 100).toFixed(1)}%`);
    console.log(`  - 無障礙合規性: ${(accessibilityScore * 100).toFixed(1)}%`);
    console.log(`  - 空間效率: ${(spaceEfficiencyScore * 100).toFixed(1)}%`);
    console.log(`  - 佈局整合度: ${(layoutIntegrationScore * 100).toFixed(1)}%`);
    console.log(`  - 🏆 最終總評分: ${(finalOverallScore * 100).toFixed(1)}%`);
    
    if (finalOverallScore >= 0.95) {
      console.log('🎉 頁面標頭合併優化完美成功！準備部署！');
    } else if (finalOverallScore >= 0.85) {
      console.log('✅ 頁面標頭合併優化優秀！可以部署！');
    } else if (finalOverallScore >= 0.75) {
      console.log('⚡ 頁面標頭合併優化良好，建議部署');
    } else {
      console.log('⚠️ 頁面標頭合併優化需要進一步調整');
    }
    
    console.log('\n✅ 最終驗證測試完成');
    
    return {
      finalLayoutAnalysis,
      allGeptResults,
      finalTouchAnalysis,
      finalSpaceSaving,
      finalSavingPercentage,
      finalOverallScore: (finalOverallScore * 100).toFixed(1)
    };
  });
});
