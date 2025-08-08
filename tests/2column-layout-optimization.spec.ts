import { test, expect } from '@playwright/test';

/**
 * 📐 EduCreate GEPT 選擇器 2 列佈局優化測試
 * 
 * 測試 GEPT 選擇器改為 2 列佈局後的效果
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📐 GEPT 選擇器 2 列佈局優化', () => {
  
  test('🔍 測試 2 列佈局優化效果', async ({ page }) => {
    console.log('🔍 開始測試 GEPT 選擇器 2 列佈局優化效果...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到遊戲切換器頁面
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 本地頁面載入完成，開始 2 列佈局分析...');
    
    // 1. 截圖：2 列佈局優化後的狀態
    await page.screenshot({ 
      path: 'test-results/2column-layout-after-optimization.png',
      fullPage: true 
    });
    console.log('📸 截圖：2 列佈局優化後完整頁面');
    
    // 2. 分析 GEPT 選擇器的新佈局
    const geptLayoutAnalysis = await page.evaluate(() => {
      const geptSelector = document.querySelector('[data-testid="gept-selector"]');
      if (!geptSelector) return null;
      
      const rect = geptSelector.getBoundingClientRect();
      const buttons = geptSelector.querySelectorAll('button');
      const buttonsGrid = geptSelector.querySelector('.gept-buttons');
      
      // 分析按鈕佈局
      const buttonPositions = Array.from(buttons).map((button, index) => {
        const buttonRect = button.getBoundingClientRect();
        return {
          index: index + 1,
          text: button.textContent,
          width: Math.round(buttonRect.width),
          height: Math.round(buttonRect.height),
          top: Math.round(buttonRect.top),
          left: Math.round(buttonRect.left),
          row: Math.floor(index / 2) + 1,
          column: (index % 2) + 1
        };
      });
      
      // 計算佈局效率
      const gridRect = buttonsGrid ? buttonsGrid.getBoundingClientRect() : rect;
      const totalButtonArea = buttonPositions.reduce((sum, btn) => sum + (btn.width * btn.height), 0);
      const gridArea = gridRect.width * gridRect.height;
      const layoutEfficiency = (totalButtonArea / gridArea * 100).toFixed(1);
      
      return {
        containerWidth: Math.round(rect.width),
        containerHeight: Math.round(rect.height),
        containerTop: Math.round(rect.top),
        buttonCount: buttons.length,
        buttonPositions,
        gridWidth: Math.round(gridRect.width),
        gridHeight: Math.round(gridRect.height),
        layoutEfficiency,
        isGridLayout: buttonsGrid ? window.getComputedStyle(buttonsGrid).display === 'grid' : false,
        gridColumns: buttonsGrid ? window.getComputedStyle(buttonsGrid).gridTemplateColumns : 'none'
      };
    });
    
    if (geptLayoutAnalysis) {
      console.log('📊 GEPT 選擇器 2 列佈局分析:');
      console.log(`  - 容器尺寸: ${geptLayoutAnalysis.containerWidth}px × ${geptLayoutAnalysis.containerHeight}px`);
      console.log(`  - 容器位置: (${geptLayoutAnalysis.containerTop}px from top)`);
      console.log(`  - 按鈕數量: ${geptLayoutAnalysis.buttonCount}`);
      console.log(`  - 網格尺寸: ${geptLayoutAnalysis.gridWidth}px × ${geptLayoutAnalysis.gridHeight}px`);
      console.log(`  - 是否為網格佈局: ${geptLayoutAnalysis.isGridLayout ? '是' : '否'}`);
      console.log(`  - 網格列設定: ${geptLayoutAnalysis.gridColumns}`);
      console.log(`  - 佈局效率: ${geptLayoutAnalysis.layoutEfficiency}%`);
      
      console.log('\n📐 按鈕位置分析:');
      geptLayoutAnalysis.buttonPositions.forEach(btn => {
        console.log(`    ${btn.text}: 第${btn.row}行第${btn.column}列 - ${btn.width}px × ${btn.height}px`);
      });
    }
    
    // 3. 測試 2 列佈局的功能完整性
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const geptButtons = geptSelector.locator('button');
    const buttonCount = await geptButtons.count();
    
    console.log('\n🧪 功能完整性測試:');
    
    let functionalityResults = [];
    for (let i = 0; i < buttonCount; i++) {
      try {
        const buttonText = await geptButtons.nth(i).textContent();
        await geptButtons.nth(i).click();
        await page.waitForTimeout(500);
        
        // 檢查按鈕是否正確激活
        const isActive = await geptButtons.nth(i).evaluate(btn => 
          btn.classList.contains('bg-blue-100') || btn.classList.contains('text-blue-800')
        );
        
        functionalityResults.push({
          button: buttonText,
          clickable: true,
          activates: isActive
        });
        
        console.log(`  ✅ ${buttonText}: 可點擊 ${isActive ? '且正確激活' : '但激活狀態異常'}`);
      } catch (error) {
        functionalityResults.push({
          button: `按鈕 ${i + 1}`,
          clickable: false,
          activates: false
        });
        console.log(`  ❌ 按鈕 ${i + 1}: 點擊失敗 - ${error.message}`);
      }
    }
    
    // 4. 檢查觸控友好性
    const touchFriendlyAnalysis = await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-testid="gept-selector"] button');
      const results = [];
      
      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const isTouchFriendly = rect.height >= 44;
        results.push({
          index: index + 1,
          text: button.textContent,
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          touchFriendly: isTouchFriendly
        });
      });
      
      return results;
    });
    
    console.log('\n👆 觸控友好性分析:');
    touchFriendlyAnalysis.forEach(btn => {
      const status = btn.touchFriendly ? '✅' : '❌';
      console.log(`  ${status} ${btn.text}: ${btn.height}px 高度 × ${btn.width}px 寬度`);
    });
    
    const touchFriendlyCount = touchFriendlyAnalysis.filter(btn => btn.touchFriendly).length;
    const touchFriendlyPercentage = (touchFriendlyCount / touchFriendlyAnalysis.length * 100).toFixed(1);
    console.log(`  📊 觸控友好比例: ${touchFriendlyCount}/${touchFriendlyAnalysis.length} (${touchFriendlyPercentage}%)`);
    
    // 5. 與之前的單行佈局對比
    const previousHeight = 44; // 之前單行佈局的高度
    const currentHeight = geptLayoutAnalysis?.containerHeight || 0;
    const spaceSaving = previousHeight - currentHeight;
    const spaceSavingPercentage = previousHeight > 0 ? (spaceSaving / previousHeight * 100).toFixed(1) : '0';
    
    console.log('\n📈 2 列佈局優化效果:');
    console.log(`  - 之前單行高度: ${previousHeight}px`);
    console.log(`  - 現在 2 列高度: ${currentHeight}px`);
    console.log(`  - 節省空間: ${spaceSaving}px`);
    console.log(`  - 節省比例: ${spaceSavingPercentage}%`);
    console.log(`  - 優化效果: ${spaceSaving > 0 ? '成功節省空間' : spaceSaving < 0 ? '高度增加' : '高度不變'}`);
    
    // 6. 視窗內容截圖
    await page.screenshot({ 
      path: 'test-results/2column-layout-viewport.png',
      fullPage: false
    });
    console.log('📸 截圖：2 列佈局視窗內容');
    
    // 7. 整體評估
    const functionalityScore = functionalityResults.filter(r => r.clickable && r.activates).length / functionalityResults.length;
    const touchFriendlyScore = touchFriendlyCount / touchFriendlyAnalysis.length;
    const layoutScore = geptLayoutAnalysis?.isGridLayout ? 1 : 0;
    const spaceEfficiencyScore = spaceSaving > 0 ? 1 : spaceSaving === 0 ? 0.5 : 0;
    
    const overallScore = (functionalityScore + touchFriendlyScore + layoutScore + spaceEfficiencyScore) / 4;
    
    console.log('\n🎯 2 列佈局優化總評:');
    console.log(`  - 功能完整性: ${(functionalityScore * 100).toFixed(1)}%`);
    console.log(`  - 觸控友好性: ${(touchFriendlyScore * 100).toFixed(1)}%`);
    console.log(`  - 佈局實現: ${layoutScore === 1 ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`  - 空間效率: ${spaceEfficiencyScore === 1 ? '✅ 優秀' : spaceEfficiencyScore === 0.5 ? '⚡ 一般' : '❌ 需改進'}`);
    console.log(`  - 總體評分: ${(overallScore * 100).toFixed(1)}%`);
    
    if (overallScore >= 0.9) {
      console.log('🎉 2 列佈局優化完美成功！');
    } else if (overallScore >= 0.7) {
      console.log('✅ 2 列佈局優化表現良好！');
    } else if (overallScore >= 0.5) {
      console.log('⚠️ 2 列佈局優化需要調整');
    } else {
      console.log('❌ 2 列佈局優化需要重新設計');
    }
    
    console.log('\n✅ 2 列佈局優化測試完成');
    
    return {
      geptLayoutAnalysis,
      functionalityResults,
      touchFriendlyAnalysis,
      spaceSaving,
      spaceSavingPercentage,
      overallScore: (overallScore * 100).toFixed(1)
    };
  });
});
