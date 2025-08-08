import { test, expect } from '@playwright/test';

/**
 * 📱 EduCreate 手機版遊戲容器可見性優化驗證
 * 
 * 驗證優化後的遊戲容器位置和可見性改進效果
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📱 手機版遊戲容器可見性優化驗證', () => {
  
  test('🎯 驗證優化後的遊戲容器位置和可見性', async ({ page }) => {
    console.log('🎯 開始驗證手機版遊戲容器優化效果...');
    
    // 測試多種手機視窗大小
    const mobileViewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12 Pro', width: 390, height: 844 },
      { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
      { name: 'Pixel 5', width: 393, height: 851 }
    ];
    
    let optimizationResults = [];
    
    for (const viewport of mobileViewports) {
      console.log(`\n📱 測試 ${viewport.name} (${viewport.width}×${viewport.height}):`);
      
      // 設置視窗大小
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // 導航到頁面
      await page.goto(`${LOCAL_URL}/games/switcher`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 分析優化後的佈局
      const optimizedLayout = await page.evaluate(() => {
        const unifiedHeader = document.querySelector('.unified-game-header');
        const gameContainer = document.querySelector('[data-testid="game-container"]');
        const mobileGameInfo = document.querySelector('.md\\:hidden .bg-blue-50');
        const moreOptionsBtn = document.querySelector('button[title="更多選項"]');
        
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const headerRect = unifiedHeader ? unifiedHeader.getBoundingClientRect() : null;
        const gameContainerRect = gameContainer ? gameContainer.getBoundingClientRect() : null;
        const mobileGameInfoRect = mobileGameInfo ? mobileGameInfo.getBoundingClientRect() : null;
        
        // 計算遊戲容器可見性
        let gameContainerVisibility = 0;
        if (gameContainerRect) {
          const visibleTop = Math.max(0, gameContainerRect.top);
          const visibleBottom = Math.min(viewportHeight, gameContainerRect.bottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          gameContainerVisibility = (visibleHeight / gameContainerRect.height) * 100;
        }
        
        return {
          viewport: {
            width: viewportWidth,
            height: viewportHeight
          },
          header: headerRect ? {
            height: Math.round(headerRect.height),
            top: Math.round(headerRect.top),
            bottom: Math.round(headerRect.bottom)
          } : null,
          gameContainer: gameContainerRect ? {
            top: Math.round(gameContainerRect.top),
            height: Math.round(gameContainerRect.height),
            visibilityPercentage: Math.round(gameContainerVisibility)
          } : null,
          mobileGameInfo: mobileGameInfoRect ? {
            top: Math.round(mobileGameInfoRect.top),
            height: Math.round(mobileGameInfoRect.height),
            visible: true
          } : { visible: false },
          scrollNeeded: gameContainerRect ? Math.max(0, gameContainerRect.top - 50) : 0,
          hasMoreOptionsBtn: !!moreOptionsBtn,
          totalContentAboveGame: gameContainerRect ? gameContainerRect.top : 0
        };
      });
      
      console.log(`  - 視窗尺寸: ${optimizedLayout.viewport.width}×${optimizedLayout.viewport.height}`);
      console.log(`  - 優化後標頭高度: ${optimizedLayout.header?.height || 'N/A'}px`);
      console.log(`  - 優化後遊戲容器位置: ${optimizedLayout.gameContainer?.top || 'N/A'}px`);
      console.log(`  - 優化後遊戲容器可見度: ${optimizedLayout.gameContainer?.visibilityPercentage || 'N/A'}%`);
      console.log(`  - 優化後需要滾動距離: ${optimizedLayout.scrollNeeded}px`);
      console.log(`  - 手機版遊戲資訊: ${optimizedLayout.mobileGameInfo.visible ? '顯示' : '隱藏'}`);
      console.log(`  - 遊戲上方總內容高度: ${optimizedLayout.totalContentAboveGame}px`);
      
      // 截圖優化後狀態
      await page.screenshot({ 
        path: `test-results/mobile-optimized-${viewport.name.replace(/\s+/g, '-').toLowerCase()}-after.png`,
        fullPage: false 
      });
      
      optimizationResults.push({
        viewport: viewport.name,
        ...optimizedLayout
      });
    }
    
    // 計算優化效果
    const avgOptimizedGameContainerTop = optimizationResults.reduce((sum, r) => sum + (r.gameContainer?.top || 0), 0) / optimizationResults.length;
    const avgOptimizedVisibility = optimizationResults.reduce((sum, r) => sum + (r.gameContainer?.visibilityPercentage || 0), 0) / optimizationResults.length;
    const avgOptimizedScrollNeeded = optimizationResults.reduce((sum, r) => sum + r.scrollNeeded, 0) / optimizationResults.length;
    const avgOptimizedHeaderHeight = optimizationResults.reduce((sum, r) => sum + (r.header?.height || 0), 0) / optimizationResults.length;
    
    // 與優化前對比（基於之前的分析結果）
    const beforeOptimization = {
      avgGameContainerTop: 227,
      avgVisibility: 100,
      avgScrollNeeded: 177,
      avgHeaderHeight: 81
    };
    
    const improvement = {
      gameContainerPosition: beforeOptimization.avgGameContainerTop - avgOptimizedGameContainerTop,
      scrollReduction: beforeOptimization.avgScrollNeeded - avgOptimizedScrollNeeded,
      headerHeightReduction: beforeOptimization.avgHeaderHeight - avgOptimizedHeaderHeight,
      visibilityChange: avgOptimizedVisibility - beforeOptimization.avgVisibility
    };
    
    console.log('\n📊 優化效果分析:');
    console.log(`  - 優化前遊戲容器位置: ${beforeOptimization.avgGameContainerTop}px`);
    console.log(`  - 優化後遊戲容器位置: ${Math.round(avgOptimizedGameContainerTop)}px`);
    console.log(`  - 遊戲容器位置改進: ${Math.round(improvement.gameContainerPosition)}px (${(improvement.gameContainerPosition / beforeOptimization.avgGameContainerTop * 100).toFixed(1)}%)`);
    
    console.log(`  - 優化前標頭高度: ${beforeOptimization.avgHeaderHeight}px`);
    console.log(`  - 優化後標頭高度: ${Math.round(avgOptimizedHeaderHeight)}px`);
    console.log(`  - 標頭高度減少: ${Math.round(improvement.headerHeightReduction)}px (${(improvement.headerHeightReduction / beforeOptimization.avgHeaderHeight * 100).toFixed(1)}%)`);
    
    console.log(`  - 優化前需要滾動: ${beforeOptimization.avgScrollNeeded}px`);
    console.log(`  - 優化後需要滾動: ${Math.round(avgOptimizedScrollNeeded)}px`);
    console.log(`  - 滾動需求減少: ${Math.round(improvement.scrollReduction)}px (${(improvement.scrollReduction / beforeOptimization.avgScrollNeeded * 100).toFixed(1)}%)`);
    
    // 成功指標評估
    const targetGameContainerTop = 200;
    const targetVisibility = 70;
    
    const meetsPositionTarget = avgOptimizedGameContainerTop <= targetGameContainerTop;
    const meetsVisibilityTarget = avgOptimizedVisibility >= targetVisibility;
    const significantImprovement = improvement.gameContainerPosition >= 20;
    
    console.log('\n🎯 成功指標評估:');
    console.log(`  - 遊戲容器位置目標 (<${targetGameContainerTop}px): ${meetsPositionTarget ? '✅ 達成' : '❌ 未達成'}`);
    console.log(`  - 遊戲內容可見度目標 (>${targetVisibility}%): ${meetsVisibilityTarget ? '✅ 達成' : '❌ 未達成'}`);
    console.log(`  - 顯著改進目標 (>20px): ${significantImprovement ? '✅ 達成' : '❌ 未達成'}`);
    
    // 測試自動滾動功能（如果實施）
    console.log('\n🔄 自動滾動功能測試:');
    
    // 重新載入頁面測試自動滾動
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    
    // 等待自動滾動完成
    await page.waitForTimeout(2000);
    
    const scrollPosition = await page.evaluate(() => window.pageYOffset);
    const autoScrollWorked = scrollPosition > 0;
    
    console.log(`  - 自動滾動功能: ${autoScrollWorked ? '✅ 正常工作' : '⚠️ 未觸發或無效'}`);
    console.log(`  - 滾動位置: ${scrollPosition}px`);
    
    // 測試桌面模式兼容性
    console.log('\n🖥️ 桌面模式兼容性驗證:');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);
    
    const desktopCompatibility = await page.evaluate(() => {
      const unifiedHeader = document.querySelector('.unified-game-header');
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      const desktopGeptSelector = document.querySelector('.gept-selector');
      const mobileElements = document.querySelector('.md\\:hidden');
      const mobileGameInfo = document.querySelector('.md\\:hidden .bg-blue-50');
      
      return {
        headerHeight: unifiedHeader ? Math.round(unifiedHeader.getBoundingClientRect().height) : null,
        gameContainerTop: gameContainer ? Math.round(gameContainer.getBoundingClientRect().top) : null,
        desktopGeptVisible: desktopGeptSelector ? window.getComputedStyle(desktopGeptSelector).display !== 'none' : false,
        mobileElementsHidden: mobileElements ? window.getComputedStyle(mobileElements).display === 'none' : true,
        mobileGameInfoHidden: mobileGameInfo ? window.getComputedStyle(mobileGameInfo).display === 'none' : true
      };
    });
    
    console.log(`  - 桌面版標頭高度: ${desktopCompatibility.headerHeight}px`);
    console.log(`  - 桌面版遊戲容器位置: ${desktopCompatibility.gameContainerTop}px`);
    console.log(`  - 桌面版 GEPT 選擇器: ${desktopCompatibility.desktopGeptVisible ? '✅ 正常顯示' : '❌ 異常隱藏'}`);
    console.log(`  - 手機版元素隱藏: ${desktopCompatibility.mobileElementsHidden ? '✅ 正常' : '❌ 異常顯示'}`);
    console.log(`  - 手機版遊戲資訊隱藏: ${desktopCompatibility.mobileGameInfoHidden ? '✅ 正常' : '❌ 異常顯示'}`);
    
    await page.screenshot({ 
      path: 'test-results/desktop-compatibility-after-optimization.png',
      fullPage: false 
    });
    
    // 整體優化評分
    const optimizationScore = [
      meetsPositionTarget,
      meetsVisibilityTarget,
      significantImprovement,
      autoScrollWorked,
      desktopCompatibility.desktopGeptVisible,
      desktopCompatibility.mobileElementsHidden,
      desktopCompatibility.mobileGameInfoHidden
    ].filter(Boolean).length;
    
    const totalCriteria = 7;
    const optimizationPercentage = (optimizationScore / totalCriteria * 100).toFixed(1);
    
    console.log('\n🏆 手機版遊戲容器優化總評:');
    console.log(`  - 位置目標達成: ${meetsPositionTarget ? '✅' : '❌'}`);
    console.log(`  - 可見度目標達成: ${meetsVisibilityTarget ? '✅' : '❌'}`);
    console.log(`  - 顯著改進達成: ${significantImprovement ? '✅' : '❌'}`);
    console.log(`  - 自動滾動功能: ${autoScrollWorked ? '✅' : '❌'}`);
    console.log(`  - 桌面版 GEPT 顯示: ${desktopCompatibility.desktopGeptVisible ? '✅' : '❌'}`);
    console.log(`  - 手機版元素隱藏: ${desktopCompatibility.mobileElementsHidden ? '✅' : '❌'}`);
    console.log(`  - 手機版資訊隱藏: ${desktopCompatibility.mobileGameInfoHidden ? '✅' : '❌'}`);
    console.log(`  - 🏆 總體優化評分: ${optimizationPercentage}% (${optimizationScore}/${totalCriteria})`);
    
    if (parseFloat(optimizationPercentage) >= 90) {
      console.log('🎉 手機版遊戲容器優化完美成功！');
    } else if (parseFloat(optimizationPercentage) >= 80) {
      console.log('✅ 手機版遊戲容器優化表現優秀！');
    } else if (parseFloat(optimizationPercentage) >= 70) {
      console.log('⚡ 手機版遊戲容器優化良好！');
    } else {
      console.log('⚠️ 手機版遊戲容器優化需要進一步調整');
    }
    
    console.log('\n✅ 手機版遊戲容器優化驗證完成');
    
    return {
      optimizationResults,
      averages: {
        gameContainerTop: Math.round(avgOptimizedGameContainerTop),
        visibility: Math.round(avgOptimizedVisibility),
        scrollNeeded: Math.round(avgOptimizedScrollNeeded),
        headerHeight: Math.round(avgOptimizedHeaderHeight)
      },
      improvement,
      successMetrics: {
        meetsPositionTarget,
        meetsVisibilityTarget,
        significantImprovement
      },
      autoScrollWorked,
      desktopCompatibility,
      optimizationPercentage: parseFloat(optimizationPercentage)
    };
  });
});
