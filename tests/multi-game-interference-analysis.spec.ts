import { test, expect } from '@playwright/test';

test('多遊戲組件干擾分析測試', async ({ page }) => {
  console.log('🔍 開始分析多遊戲組件干擾問題');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3002/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 分析當前頁面的資源使用情況
  const initialResourceAnalysis = await page.evaluate(() => {
    const analysis = {
      // DOM 元素統計
      totalElements: document.querySelectorAll('*').length,
      canvasElements: document.querySelectorAll('canvas').length,
      gameContainers: document.querySelectorAll('.game-container').length,
      phaserInstances: document.querySelectorAll('[data-phaser]').length,
      
      // 事件監聽器檢查
      hasKeyboardListeners: !!window.onkeydown || !!window.onkeyup,
      hasMouseListeners: !!window.onmousedown || !!window.onmouseup,
      hasResizeListeners: !!window.onresize,
      
      // 記憶體使用（如果可用）
      memoryInfo: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null,
      
      // 音頻上下文檢查
      audioContexts: (window as any).AudioContext ? 
        'AudioContext available' : 'AudioContext not available',
      
      // 全局變數污染檢查
      globalPhaserExists: typeof (window as any).Phaser !== 'undefined',
      globalGameExists: typeof (window as any).game !== 'undefined',
      
      // CSS 類名統計
      uniqueClassNames: Array.from(new Set(
        Array.from(document.querySelectorAll('*'))
          .map(el => el.className)
          .filter(className => className)
          .join(' ')
          .split(' ')
      )).length
    };
    
    return analysis;
  });

  console.log('📊 初始資源分析:', JSON.stringify(initialResourceAnalysis, null, 2));

  // 模擬多個遊戲組件載入（通過快速切換遊戲）
  console.log('🔄 模擬多遊戲切換以測試干擾...');

  // 點擊切換遊戲按鈕
  const switchButton = page.locator('button:has-text("切換遊戲")');
  if (await switchButton.count() > 0) {
    await switchButton.click();
    await page.waitForTimeout(1000);

    // 檢查下拉選單是否出現
    const dropdown = page.locator('.absolute.right-0.mt-2');
    if (await dropdown.count() > 0) {
      console.log('✅ 遊戲切換下拉選單已打開');
      
      // 獲取可用遊戲列表
      const availableGames = await page.locator('.absolute.right-0.mt-2 button').count();
      console.log(`🎮 可用遊戲數量: ${availableGames}`);
      
      // 快速切換多個遊戲來測試干擾
      for (let i = 0; i < Math.min(availableGames, 3); i++) {
        const gameButton = page.locator('.absolute.right-0.mt-2 button').nth(i);
        const gameText = await gameButton.textContent();
        console.log(`🔄 切換到遊戲: ${gameText}`);
        
        await gameButton.click();
        await page.waitForTimeout(2000);
        
        // 分析切換後的資源狀況
        const postSwitchAnalysis = await page.evaluate(() => {
          return {
            canvasElements: document.querySelectorAll('canvas').length,
            gameContainers: document.querySelectorAll('.game-container').length,
            memoryUsed: (performance as any).memory ? 
              (performance as any).memory.usedJSHeapSize : null,
            activeAnimations: document.getAnimations ? 
              document.getAnimations().length : 'Not supported'
          };
        });
        
        console.log(`📊 遊戲 ${i + 1} 切換後分析:`, JSON.stringify(postSwitchAnalysis, null, 2));
        
        // 重新打開下拉選單（如果需要）
        if (i < Math.min(availableGames, 3) - 1) {
          await switchButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  }

  // 最終資源分析
  const finalResourceAnalysis = await page.evaluate(() => {
    return {
      totalElements: document.querySelectorAll('*').length,
      canvasElements: document.querySelectorAll('canvas').length,
      gameContainers: document.querySelectorAll('.game-container').length,
      memoryInfo: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null,
      activeTimers: 'Cannot detect directly',
      eventListeners: 'Cannot detect directly'
    };
  });

  console.log('📊 最終資源分析:', JSON.stringify(finalResourceAnalysis, null, 2));

  // 干擾問題檢測
  const interferenceAnalysis = {
    memoryLeak: initialResourceAnalysis.memoryInfo && finalResourceAnalysis.memoryInfo ? 
      finalResourceAnalysis.memoryInfo.usedJSHeapSize > initialResourceAnalysis.memoryInfo.usedJSHeapSize * 1.5 : 
      'Cannot detect',
    
    canvasAccumulation: finalResourceAnalysis.canvasElements > initialResourceAnalysis.canvasElements,
    
    elementAccumulation: finalResourceAnalysis.totalElements > initialResourceAnalysis.totalElements * 1.2,
    
    potentialIssues: []
  };

  if (interferenceAnalysis.memoryLeak === true) {
    interferenceAnalysis.potentialIssues.push('記憶體洩漏風險');
  }
  
  if (interferenceAnalysis.canvasAccumulation) {
    interferenceAnalysis.potentialIssues.push('Canvas 元素累積');
  }
  
  if (interferenceAnalysis.elementAccumulation) {
    interferenceAnalysis.potentialIssues.push('DOM 元素累積');
  }

  console.log('⚠️ 干擾問題分析:', JSON.stringify(interferenceAnalysis, null, 2));

  // 性能測試
  const performanceMetrics = await page.evaluate(() => {
    return {
      navigationTiming: performance.getEntriesByType('navigation')[0],
      paintTiming: performance.getEntriesByType('paint'),
      resourceTiming: performance.getEntriesByType('resource').length
    };
  });

  console.log('⚡ 性能指標:', JSON.stringify(performanceMetrics, null, 2));

  // 截圖記錄
  await page.screenshot({ 
    path: 'test-results/multi-game-interference-analysis.png',
    fullPage: true
  });

  console.log('✅ 多遊戲組件干擾分析完成');
});
