import { test, expect } from '@playwright/test';

/**
 * 📐 EduCreate 頁面標頭合併優化測試
 * 
 * 測試頁面標頭區域合併後的佈局效果和功能完整性
 */

const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('📐 頁面標頭合併優化測試', () => {
  
  test('🔍 測試合併後的標頭佈局效果', async ({ page }) => {
    console.log('🔍 開始測試頁面標頭合併優化效果...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到本地優化版本
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 本地頁面載入完成，開始合併標頭分析...');
    
    // 1. 截圖：合併後的標頭佈局
    await page.screenshot({ 
      path: 'test-results/header-merge-after-optimization.png',
      fullPage: true 
    });
    console.log('📸 截圖：合併後標頭完整頁面');
    
    // 2. 分析合併後的標頭結構
    const headerAnalysis = await page.evaluate(() => {
      const unifiedHeader = document.querySelector('.unified-game-header');
      const gameControlsSection = document.querySelector('.game-controls-section');
      const geptSelector = document.querySelector('[data-testid="gept-selector"]');
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      
      if (!unifiedHeader) return null;
      
      const headerRect = unifiedHeader.getBoundingClientRect();
      const gameContainerRect = gameContainer ? gameContainer.getBoundingClientRect() : null;
      const geptSelectorRect = geptSelector ? geptSelector.getBoundingClientRect() : null;
      
      // 檢查標頭內容結構
      const titleSection = unifiedHeader.querySelector('h1');
      const currentGameInfo = unifiedHeader.querySelector('.text-blue-900');
      const headerControls = unifiedHeader.querySelector('.header-controls');
      
      return {
        headerHeight: Math.round(headerRect.height),
        headerTop: Math.round(headerRect.top),
        headerWidth: Math.round(headerRect.width),
        gameContainerTop: gameContainerRect ? Math.round(gameContainerRect.top) : null,
        geptSelectorInHeader: geptSelectorRect ? Math.round(geptSelectorRect.top) : null,
        hasTitle: !!titleSection,
        hasGameInfo: !!currentGameInfo,
        hasControls: !!headerControls,
        hasGameControlsSection: !!gameControlsSection,
        headerToGameDistance: gameContainerRect ? Math.round(gameContainerRect.top - headerRect.bottom) : null
      };
    });
    
    if (headerAnalysis) {
      console.log('📊 合併標頭佈局分析:');
      console.log(`  - 標頭高度: ${headerAnalysis.headerHeight}px`);
      console.log(`  - 標頭寬度: ${headerAnalysis.headerWidth}px`);
      console.log(`  - 遊戲容器位置: ${headerAnalysis.gameContainerTop}px`);
      console.log(`  - 標頭到遊戲距離: ${headerAnalysis.headerToGameDistance}px`);
      console.log(`  - GEPT 選擇器位置: ${headerAnalysis.geptSelectorInHeader}px`);
      console.log(`  - 包含標題: ${headerAnalysis.hasTitle ? '是' : '否'}`);
      console.log(`  - 包含遊戲資訊: ${headerAnalysis.hasGameInfo ? '是' : '否'}`);
      console.log(`  - 包含控制按鈕: ${headerAnalysis.hasControls ? '是' : '否'}`);
      console.log(`  - 包含遊戲控制區: ${headerAnalysis.hasGameControlsSection ? '是' : '否'}`);
    }
    
    // 3. 測試 GEPT 選擇器功能（在標頭中）
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const geptButtons = geptSelector.locator('button');
    const buttonCount = await geptButtons.count();
    
    console.log('\n🧪 GEPT 選擇器功能測試:');
    
    let geptFunctionalityResults = [];
    for (let i = 0; i < buttonCount; i++) {
      try {
        const buttonText = await geptButtons.nth(i).textContent();
        await geptButtons.nth(i).click();
        await page.waitForTimeout(500);
        
        // 檢查按鈕是否正確激活
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
        console.log(`  ❌ 按鈕 ${i + 1}: 點擊失敗 - ${error.message}`);
      }
    }
    
    // 4. 測試標頭控制按鈕功能
    console.log('\n🎮 標頭控制按鈕測試:');
    
    const statsButton = page.locator('button:has-text("顯示統計"), button:has-text("隱藏統計"), button:has-text("📊")');
    const gameButton = page.locator('button:has-text("出遊戲"), button:has-text("🚀")');
    
    let controlButtonsResults = {
      statsButton: false,
      gameButton: false
    };
    
    try {
      await statsButton.click();
      await page.waitForTimeout(500);
      controlButtonsResults.statsButton = true;
      console.log('  ✅ 統計按鈕: 可點擊');
    } catch (error) {
      console.log('  ❌ 統計按鈕: 點擊失敗');
    }
    
    try {
      const gameButtonVisible = await gameButton.isVisible();
      controlButtonsResults.gameButton = gameButtonVisible;
      console.log(`  ${gameButtonVisible ? '✅' : '❌'} 遊戲按鈕: ${gameButtonVisible ? '可見' : '不可見'}`);
    } catch (error) {
      console.log('  ❌ 遊戲按鈕: 檢查失敗');
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
    
    console.log('\n👆 標頭按鈕觸控友好性分析:');
    touchFriendlyAnalysis.forEach(btn => {
      const status = btn.touchFriendly ? '✅' : '❌';
      console.log(`  ${status} ${btn.text}: ${btn.height}px 高度 × ${btn.width}px 寬度`);
    });
    
    const touchFriendlyCount = touchFriendlyAnalysis.filter(btn => btn.touchFriendly).length;
    const touchFriendlyPercentage = touchFriendlyAnalysis.length > 0 ? 
      (touchFriendlyCount / touchFriendlyAnalysis.length * 100).toFixed(1) : '0';
    console.log(`  📊 觸控友好比例: ${touchFriendlyCount}/${touchFriendlyAnalysis.length} (${touchFriendlyPercentage}%)`);
    
    // 6. 與原始佈局對比空間節省
    const originalHeaderHeight = 133; // 從之前測試得到的原始標頭高度
    const currentHeaderHeight = headerAnalysis?.headerHeight || 0;
    const spaceSaving = originalHeaderHeight - currentHeaderHeight;
    const spaceSavingPercentage = originalHeaderHeight > 0 ? (spaceSaving / originalHeaderHeight * 100).toFixed(1) : '0';
    
    console.log('\n📈 標頭合併優化效果:');
    console.log(`  - 原始標頭高度: ${originalHeaderHeight}px`);
    console.log(`  - 合併標頭高度: ${currentHeaderHeight}px`);
    console.log(`  - 節省空間: ${spaceSaving}px`);
    console.log(`  - 節省比例: ${spaceSavingPercentage}%`);
    console.log(`  - 優化效果: ${spaceSaving > 0 ? '成功節省空間' : spaceSaving < 0 ? '高度增加' : '高度不變'}`);
    
    // 7. 視窗內容截圖
    await page.screenshot({ 
      path: 'test-results/header-merge-viewport.png',
      fullPage: false
    });
    console.log('📸 截圖：合併標頭視窗內容');
    
    // 8. 整體評估
    const functionalityScore = geptFunctionalityResults.filter(r => r.clickable && r.activates).length / 
                              Math.max(geptFunctionalityResults.length, 1);
    const controlsScore = (controlButtonsResults.statsButton ? 0.5 : 0) + (controlButtonsResults.gameButton ? 0.5 : 0);
    const touchFriendlyScore = touchFriendlyCount / Math.max(touchFriendlyAnalysis.length, 1);
    const spaceEfficiencyScore = spaceSaving > 20 ? 1 : spaceSaving > 10 ? 0.8 : spaceSaving > 0 ? 0.6 : 0;
    const structureScore = (headerAnalysis?.hasTitle ? 0.25 : 0) + 
                          (headerAnalysis?.hasGameInfo ? 0.25 : 0) + 
                          (headerAnalysis?.hasControls ? 0.25 : 0) + 
                          (headerAnalysis?.hasGameControlsSection ? 0.25 : 0);
    
    const overallScore = (functionalityScore + controlsScore + touchFriendlyScore + spaceEfficiencyScore + structureScore) / 5;
    
    console.log('\n🎯 頁面標頭合併優化總評:');
    console.log(`  - GEPT 功能完整性: ${(functionalityScore * 100).toFixed(1)}%`);
    console.log(`  - 控制按鈕功能: ${(controlsScore * 100).toFixed(1)}%`);
    console.log(`  - 觸控友好性: ${(touchFriendlyScore * 100).toFixed(1)}%`);
    console.log(`  - 空間效率: ${(spaceEfficiencyScore * 100).toFixed(1)}%`);
    console.log(`  - 結構完整性: ${(structureScore * 100).toFixed(1)}%`);
    console.log(`  - 總體評分: ${(overallScore * 100).toFixed(1)}%`);
    
    if (overallScore >= 0.9) {
      console.log('🎉 頁面標頭合併優化完美成功！');
    } else if (overallScore >= 0.7) {
      console.log('✅ 頁面標頭合併優化表現良好！');
    } else if (overallScore >= 0.5) {
      console.log('⚠️ 頁面標頭合併優化需要調整');
    } else {
      console.log('❌ 頁面標頭合併優化需要重新設計');
    }
    
    console.log('\n✅ 頁面標頭合併優化測試完成');
    
    return {
      headerAnalysis,
      geptFunctionalityResults,
      controlButtonsResults,
      touchFriendlyAnalysis,
      spaceSaving,
      spaceSavingPercentage,
      overallScore: (overallScore * 100).toFixed(1)
    };
  });
});
