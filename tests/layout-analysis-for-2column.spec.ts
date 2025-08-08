import { test, expect } from '@playwright/test';

/**
 * 📐 EduCreate 頁面佈局分析 - 識別 2 列佈局優化機會
 * 
 * 分析頁面中可以優化為 2 列佈局的組件
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('📐 頁面佈局分析 - 2 列佈局優化', () => {
  
  test('🔍 識別可優化為 2 列佈局的組件', async ({ page }) => {
    console.log('🔍 開始頁面佈局分析，識別 2 列佈局優化機會...');
    
    // 設置手機視窗大小進行分析
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 頁面載入完成，開始佈局分析...');
    
    // 1. 截圖：當前完整頁面佈局
    await page.screenshot({ 
      path: 'test-results/layout-analysis-current-full.png',
      fullPage: true 
    });
    console.log('📸 截圖：當前完整頁面佈局');
    
    // 2. 分析所有主要組件的尺寸和佈局
    const layoutAnalysis = await page.evaluate(() => {
      const components = [];
      
      // 分析 GEPT 選擇器
      const geptSelector = document.querySelector('[data-testid="gept-selector"]');
      if (geptSelector) {
        const rect = geptSelector.getBoundingClientRect();
        const buttons = geptSelector.querySelectorAll('button');
        components.push({
          name: 'GEPT 選擇器',
          element: 'gept-selector',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          buttonCount: buttons.length,
          currentLayout: 'horizontal-flex',
          optimizationPotential: 'high',
          reason: 'GEPT 按鈕目前水平排列，可改為 2 列佈局節省垂直空間'
        });
      }
      
      // 分析遊戲切換器下拉選單區域
      const gameSwitcher = document.querySelector('[data-testid="game-switcher"]');
      if (gameSwitcher) {
        const rect = gameSwitcher.getBoundingClientRect();
        const dropdownArea = gameSwitcher.querySelector('.dropdown-area, .game-selection-area');
        components.push({
          name: '遊戲切換器控制區',
          element: 'game-switcher-controls',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          currentLayout: 'vertical-stack',
          optimizationPotential: 'medium',
          reason: '遊戲選擇和控制按鈕可能可以並排排列'
        });
      }
      
      // 分析遊戲容器
      const gameContainer = document.querySelector('[data-testid="game-container"]');
      if (gameContainer) {
        const rect = gameContainer.getBoundingClientRect();
        components.push({
          name: '遊戲容器',
          element: 'game-container',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          currentLayout: 'single-column',
          optimizationPotential: 'low',
          reason: '遊戲容器需要保持單一佈局以確保遊戲顯示效果'
        });
      }
      
      // 分析頁面標頭
      const pageHeader = document.querySelector('.page-header, header');
      if (pageHeader) {
        const rect = pageHeader.getBoundingClientRect();
        components.push({
          name: '頁面標頭',
          element: 'page-header',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          currentLayout: 'horizontal-flex',
          optimizationPotential: 'low',
          reason: '標頭通常需要保持水平佈局以確保導航清晰'
        });
      }
      
      // 分析所有按鈕組
      const buttonGroups = document.querySelectorAll('.button-group, .action-buttons');
      buttonGroups.forEach((group, index) => {
        const rect = group.getBoundingClientRect();
        const buttons = group.querySelectorAll('button');
        if (buttons.length > 2) {
          components.push({
            name: `按鈕組 ${index + 1}`,
            element: `button-group-${index + 1}`,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            buttonCount: buttons.length,
            currentLayout: 'horizontal-flex',
            optimizationPotential: 'high',
            reason: `包含 ${buttons.length} 個按鈕，可改為 2 列佈局`
          });
        }
      });
      
      return components;
    });
    
    console.log('📊 頁面佈局組件分析結果:');
    layoutAnalysis.forEach((component, index) => {
      console.log(`\n${index + 1}. ${component.name}:`);
      console.log(`   - 尺寸: ${component.width}px × ${component.height}px`);
      console.log(`   - 位置: (${component.left}, ${component.top})`);
      console.log(`   - 當前佈局: ${component.currentLayout}`);
      console.log(`   - 優化潛力: ${component.optimizationPotential}`);
      console.log(`   - 優化原因: ${component.reason}`);
      if (component.buttonCount) {
        console.log(`   - 按鈕數量: ${component.buttonCount}`);
      }
    });
    
    // 3. 識別最佳 2 列佈局候選組件
    const highPotentialComponents = layoutAnalysis.filter(c => c.optimizationPotential === 'high');
    const mediumPotentialComponents = layoutAnalysis.filter(c => c.optimizationPotential === 'medium');
    
    console.log('\n🎯 2 列佈局優化建議:');
    
    if (highPotentialComponents.length > 0) {
      console.log('\n🔥 高優先級優化組件:');
      highPotentialComponents.forEach((component, index) => {
        console.log(`   ${index + 1}. ${component.name}`);
        console.log(`      - 當前高度: ${component.height}px`);
        console.log(`      - 預估節省空間: ${Math.round(component.height * 0.4)}px`);
        console.log(`      - 建議: ${component.reason}`);
      });
    }
    
    if (mediumPotentialComponents.length > 0) {
      console.log('\n⚡ 中優先級優化組件:');
      mediumPotentialComponents.forEach((component, index) => {
        console.log(`   ${index + 1}. ${component.name}`);
        console.log(`      - 當前高度: ${component.height}px`);
        console.log(`      - 預估節省空間: ${Math.round(component.height * 0.2)}px`);
        console.log(`      - 建議: ${component.reason}`);
      });
    }
    
    // 4. 計算總體優化潛力
    const totalCurrentHeight = layoutAnalysis.reduce((sum, c) => sum + c.height, 0);
    const potentialSavings = highPotentialComponents.reduce((sum, c) => sum + Math.round(c.height * 0.4), 0) +
                           mediumPotentialComponents.reduce((sum, c) => sum + Math.round(c.height * 0.2), 0);
    
    console.log('\n📈 總體優化潛力:');
    console.log(`   - 當前總高度: ${totalCurrentHeight}px`);
    console.log(`   - 預估節省空間: ${potentialSavings}px`);
    console.log(`   - 優化比例: ${(potentialSavings / totalCurrentHeight * 100).toFixed(1)}%`);
    
    // 5. 具體實施建議
    console.log('\n🛠️ 具體實施建議:');
    
    const geptComponent = layoutAnalysis.find(c => c.element === 'gept-selector');
    if (geptComponent && geptComponent.buttonCount >= 3) {
      console.log('\n🎯 GEPT 選擇器 2 列佈局優化:');
      console.log(`   - 當前: ${geptComponent.buttonCount} 個按鈕水平排列`);
      console.log(`   - 建議: 改為 2 列 × ${Math.ceil(geptComponent.buttonCount / 2)} 行佈局`);
      console.log(`   - CSS 修改: display: grid; grid-template-columns: 1fr 1fr; gap: 8px;`);
      console.log(`   - 預估節省: ${Math.round(geptComponent.height * 0.4)}px 垂直空間`);
    }
    
    const buttonGroupComponents = layoutAnalysis.filter(c => c.name.includes('按鈕組'));
    if (buttonGroupComponents.length > 0) {
      console.log('\n🔘 按鈕組 2 列佈局優化:');
      buttonGroupComponents.forEach(component => {
        console.log(`   - ${component.name}: ${component.buttonCount} 個按鈕`);
        console.log(`     建議: 2 列 × ${Math.ceil(component.buttonCount / 2)} 行`);
        console.log(`     節省: ${Math.round(component.height * 0.4)}px`);
      });
    }
    
    // 6. 視窗內容截圖
    await page.screenshot({ 
      path: 'test-results/layout-analysis-viewport.png',
      fullPage: false
    });
    console.log('📸 截圖：當前視窗佈局');
    
    console.log('\n✅ 頁面佈局分析完成');
    
    return {
      components: layoutAnalysis,
      highPotentialComponents,
      mediumPotentialComponents,
      totalCurrentHeight,
      potentialSavings,
      optimizationPercentage: (potentialSavings / totalCurrentHeight * 100).toFixed(1)
    };
  });
});
