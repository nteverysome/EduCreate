import { test, expect } from '@playwright/test';

/**
 * 📱 EduCreate 手機版遊戲容器可見性分析
 * 
 * 分析當前遊戲容器位置和可見性，為優化提供數據基礎
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📱 手機版遊戲容器可見性分析', () => {
  
  test('📊 分析當前遊戲容器位置和可見性', async ({ page }) => {
    console.log('📊 開始分析手機版遊戲容器可見性...');
    
    // 測試多種手機視窗大小
    const mobileViewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12 Pro', width: 390, height: 844 },
      { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
      { name: 'Pixel 5', width: 393, height: 851 }
    ];
    
    let analysisResults = [];
    
    for (const viewport of mobileViewports) {
      console.log(`\n📱 分析 ${viewport.name} (${viewport.width}×${viewport.height}):`);
      
      // 設置視窗大小
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // 導航到頁面
      await page.goto(`${LOCAL_URL}/games/switcher`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 分析佈局元素位置
      const layoutAnalysis = await page.evaluate(() => {
        const unifiedHeader = document.querySelector('.unified-game-header');
        const gameContainer = document.querySelector('[data-testid="game-container"]');
        const gameInfo = document.querySelector('.text-blue-900');
        const moreOptionsBtn = document.querySelector('button[title="更多選項"]');
        
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const headerRect = unifiedHeader ? unifiedHeader.getBoundingClientRect() : null;
        const gameContainerRect = gameContainer ? gameContainer.getBoundingClientRect() : null;
        const gameInfoRect = gameInfo ? gameInfo.getBoundingClientRect() : null;
        
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
          gameInfo: gameInfoRect ? {
            top: Math.round(gameInfoRect.top),
            height: Math.round(gameInfoRect.height)
          } : null,
          scrollNeeded: gameContainerRect ? Math.max(0, gameContainerRect.top - 50) : 0,
          hasMoreOptionsBtn: !!moreOptionsBtn
        };
      });
      
      console.log(`  - 視窗尺寸: ${layoutAnalysis.viewport.width}×${layoutAnalysis.viewport.height}`);
      console.log(`  - 標頭高度: ${layoutAnalysis.header?.height || 'N/A'}px`);
      console.log(`  - 遊戲容器位置: ${layoutAnalysis.gameContainer?.top || 'N/A'}px`);
      console.log(`  - 遊戲容器可見度: ${layoutAnalysis.gameContainer?.visibilityPercentage || 'N/A'}%`);
      console.log(`  - 需要滾動距離: ${layoutAnalysis.scrollNeeded}px`);
      console.log(`  - 遊戲資訊位置: ${layoutAnalysis.gameInfo?.top || 'N/A'}px`);
      console.log(`  - 更多選項按鈕: ${layoutAnalysis.hasMoreOptionsBtn ? '存在' : '不存在'}`);
      
      // 截圖當前狀態
      await page.screenshot({ 
        path: `test-results/mobile-visibility-${viewport.name.replace(/\s+/g, '-').toLowerCase()}-before.png`,
        fullPage: false 
      });
      
      analysisResults.push({
        viewport: viewport.name,
        ...layoutAnalysis
      });
    }
    
    // 計算平均值和問題嚴重程度
    const avgGameContainerTop = analysisResults.reduce((sum, r) => sum + (r.gameContainer?.top || 0), 0) / analysisResults.length;
    const avgVisibility = analysisResults.reduce((sum, r) => sum + (r.gameContainer?.visibilityPercentage || 0), 0) / analysisResults.length;
    const avgScrollNeeded = analysisResults.reduce((sum, r) => sum + r.scrollNeeded, 0) / analysisResults.length;
    
    console.log('\n📊 整體分析結果:');
    console.log(`  - 平均遊戲容器位置: ${Math.round(avgGameContainerTop)}px`);
    console.log(`  - 平均遊戲容器可見度: ${Math.round(avgVisibility)}%`);
    console.log(`  - 平均需要滾動距離: ${Math.round(avgScrollNeeded)}px`);
    
    // 問題嚴重程度評估
    let severityLevel;
    if (avgVisibility < 50) {
      severityLevel = '🔴 嚴重 - 遊戲內容大部分不可見';
    } else if (avgVisibility < 70) {
      severityLevel = '🟡 中等 - 遊戲內容部分不可見';
    } else if (avgVisibility < 90) {
      severityLevel = '🟢 輕微 - 遊戲內容基本可見';
    } else {
      severityLevel = '✅ 良好 - 遊戲內容完全可見';
    }
    
    console.log(`  - 問題嚴重程度: ${severityLevel}`);
    
    // 優化建議
    const targetGameContainerTop = 180; // 目標位置
    const heightReduction = avgGameContainerTop - targetGameContainerTop;
    
    console.log('\n🎯 優化建議:');
    console.log(`  - 目標遊戲容器位置: ${targetGameContainerTop}px`);
    console.log(`  - 需要減少標頭高度: ${Math.round(heightReduction)}px`);
    console.log(`  - 預期可見度提升: ${Math.round((targetGameContainerTop / avgGameContainerTop) * avgVisibility)}%`);
    
    // 檢查桌面模式兼容性
    console.log('\n🖥️ 桌面模式兼容性檢查:');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);
    
    const desktopAnalysis = await page.evaluate(() => {
      const unifiedHeader = document.querySelector('.unified-game-header');
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      const desktopGeptSelector = document.querySelector('.gept-selector.hidden.md\\:flex');
      const mobileElements = document.querySelector('.md\\:hidden');
      
      return {
        headerHeight: unifiedHeader ? Math.round(unifiedHeader.getBoundingClientRect().height) : null,
        gameContainerTop: gameContainer ? Math.round(gameContainer.getBoundingClientRect().top) : null,
        desktopGeptVisible: desktopGeptSelector ? window.getComputedStyle(desktopGeptSelector).display !== 'none' : false,
        mobileElementsHidden: mobileElements ? window.getComputedStyle(mobileElements).display === 'none' : true
      };
    });
    
    console.log(`  - 桌面版標頭高度: ${desktopAnalysis.headerHeight}px`);
    console.log(`  - 桌面版遊戲容器位置: ${desktopAnalysis.gameContainerTop}px`);
    console.log(`  - 桌面版 GEPT 選擇器: ${desktopAnalysis.desktopGeptVisible ? '正常顯示' : '異常隱藏'}`);
    console.log(`  - 手機版元素隱藏: ${desktopAnalysis.mobileElementsHidden ? '正常' : '異常顯示'}`);
    
    await page.screenshot({ 
      path: 'test-results/desktop-compatibility-check.png',
      fullPage: false 
    });
    
    console.log('\n✅ 手機版遊戲容器可見性分析完成');
    
    return {
      analysisResults,
      averages: {
        gameContainerTop: Math.round(avgGameContainerTop),
        visibility: Math.round(avgVisibility),
        scrollNeeded: Math.round(avgScrollNeeded)
      },
      severityLevel,
      optimizationTarget: {
        targetPosition: targetGameContainerTop,
        heightReduction: Math.round(heightReduction),
        expectedVisibilityImprovement: Math.round((targetGameContainerTop / avgGameContainerTop) * avgVisibility)
      },
      desktopCompatibility: desktopAnalysis
    };
  });
});
