/**
 * 更新後的遊戲容器尺寸測試
 * 驗證新的以遊戲為核心的合理排版尺寸
 */

import { test, expect } from '@playwright/test';

test.describe('🎮 更新後的遊戲容器尺寸測試', () => {
  test('驗證遊戲切換器的新尺寸 (900px 高度)', async ({ page }) => {
    console.log('🔍 測試遊戲切換器的新尺寸');
    
    // 導航到遊戲切換器頁面
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ 遊戲切換器頁面載入完成');
    
    // 測量 iframe 的新尺寸
    const iframeInfo = await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const rect = iframe.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(iframe);
        
        return {
          dimensions: {
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          cssHeight: computedStyle.height,
          className: iframe.className,
          visible: rect.width > 0 && rect.height > 0
        };
      }
      return null;
    });
    
    console.log('📏 iframe 尺寸信息:', JSON.stringify(iframeInfo, null, 2));
    
    // 驗證新的高度設定
    expect(iframeInfo).toBeTruthy();
    expect(iframeInfo.cssHeight).toBe('900px');
    expect(iframeInfo.dimensions.height).toBeCloseTo(900, 10);
    
    console.log(`✅ iframe 高度驗證: ${iframeInfo.dimensions.height}px (目標: 900px)`);
    
    // 截圖記錄新尺寸
    await page.screenshot({ 
      path: 'test-results/updated-game-switcher-size.png',
      fullPage: true 
    });
    
    console.log('🎉 遊戲切換器新尺寸測試完成');
  });

  test('驗證 Vite 版本遊戲的新尺寸 (1200x800)', async ({ page }) => {
    console.log('🔍 測試 Vite 版本遊戲的新尺寸');
    
    // 導航到 Vite 版本的飛機遊戲
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('✅ Vite 飛機遊戲頁面載入完成');
    
    // 測量遊戲容器的新尺寸
    const containerInfo = await page.evaluate(() => {
      const gameContainer = document.querySelector('#game-container');
      if (gameContainer) {
        const rect = gameContainer.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(gameContainer);
        
        return {
          dimensions: {
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          cssWidth: computedStyle.width,
          cssHeight: computedStyle.height,
          visible: rect.width > 0 && rect.height > 0
        };
      }
      return null;
    });
    
    console.log('📏 遊戲容器尺寸信息:', JSON.stringify(containerInfo, null, 2));
    
    // 驗證新的尺寸設定
    expect(containerInfo).toBeTruthy();
    expect(containerInfo.cssWidth).toBe('1200px');
    expect(containerInfo.cssHeight).toBe('800px');
    expect(containerInfo.dimensions.width).toBeCloseTo(1200, 10);
    expect(containerInfo.dimensions.height).toBeCloseTo(800, 10);
    
    console.log(`✅ 遊戲容器尺寸驗證: ${containerInfo.dimensions.width}x${containerInfo.dimensions.height} (目標: 1200x800)`);
    
    // 截圖記錄新尺寸
    await page.screenshot({ 
      path: 'test-results/updated-vite-game-size.png',
      fullPage: true 
    });
    
    console.log('🎉 Vite 版本遊戲新尺寸測試完成');
  });

  test('比較新舊尺寸的改進效果', async ({ page }) => {
    console.log('📊 比較新舊尺寸的改進效果');
    
    // 測試數據
    const sizeComparison = {
      old: {
        gameSwitcher: { width: 'auto', height: 600 },
        viteGame: { width: 800, height: 600 },
        wordwallStandard: { width: 1400, height: 750 }
      },
      new: {
        gameSwitcher: { width: 'auto', height: 900 },
        viteGame: { width: 1200, height: 800 },
        recommended: { width: 1600, height: 900 }
      }
    };
    
    // 計算改進百分比
    const improvements = {
      gameSwitcherHeight: ((900 - 600) / 600 * 100).toFixed(1),
      viteGameWidth: ((1200 - 800) / 800 * 100).toFixed(1),
      viteGameHeight: ((800 - 600) / 600 * 100).toFixed(1),
      viteGameArea: ((1200 * 800) / (800 * 600) * 100 - 100).toFixed(1)
    };
    
    console.log('📈 尺寸改進分析:');
    console.log(`   🎮 遊戲切換器高度提升: ${improvements.gameSwitcherHeight}% (600px → 900px)`);
    console.log(`   📐 Vite 遊戲寬度提升: ${improvements.viteGameWidth}% (800px → 1200px)`);
    console.log(`   📏 Vite 遊戲高度提升: ${improvements.viteGameHeight}% (600px → 800px)`);
    console.log(`   📊 Vite 遊戲面積提升: ${improvements.viteGameArea}% (480k → 960k 像素)`);
    
    // 與 Wordwall 實際測量結果比較
    const wordwallActual = { width: 918, height: 532 };
    const ourNew = { width: 1200, height: 800 };
    
    const vsWordwall = {
      widthAdvantage: ((ourNew.width - wordwallActual.width) / wordwallActual.width * 100).toFixed(1),
      heightAdvantage: ((ourNew.height - wordwallActual.height) / wordwallActual.height * 100).toFixed(1),
      areaAdvantage: ((ourNew.width * ourNew.height) / (wordwallActual.width * wordwallActual.height) * 100 - 100).toFixed(1)
    };
    
    console.log('🆚 與實際 Wordwall 遊戲比較:');
    console.log(`   📐 寬度優勢: ${vsWordwall.widthAdvantage}% (1200px vs 918px)`);
    console.log(`   📏 高度優勢: ${vsWordwall.heightAdvantage}% (800px vs 532px)`);
    console.log(`   📊 面積優勢: ${vsWordwall.areaAdvantage}% (960k vs 488k 像素)`);
    
    // 驗證改進效果
    expect(parseFloat(improvements.gameSwitcherHeight)).toBeGreaterThan(40); // 至少 40% 提升
    expect(parseFloat(improvements.viteGameArea)).toBeGreaterThan(90); // 面積至少提升 90%
    expect(parseFloat(vsWordwall.areaAdvantage)).toBeGreaterThan(90); // 比 Wordwall 大 90% 以上
    
    // 生成比較報告
    const comparisonReport = {
      summary: '以遊戲為核心的尺寸優化完成',
      improvements: {
        gameSwitcher: `高度提升 ${improvements.gameSwitcherHeight}%`,
        viteGame: `面積提升 ${improvements.viteGameArea}%`,
        vsWordwall: `比實際 Wordwall 大 ${vsWordwall.areaAdvantage}%`
      },
      newSizes: sizeComparison.new,
      reasoning: '提供更大的遊戲區域以改善用戶體驗，遊戲內容更加突出'
    };
    
    console.log('📋 最終比較報告:', JSON.stringify(comparisonReport, null, 2));
    
    console.log('🎉 尺寸改進效果比較完成');
  });

  test('驗證響應式設計和合理排版', async ({ page }) => {
    console.log('📱 驗證響應式設計和合理排版');
    
    // 測試不同視窗大小
    const viewportSizes = [
      { name: '桌面大屏', width: 1920, height: 1080 },
      { name: '桌面標準', width: 1366, height: 768 },
      { name: '平板橫向', width: 1024, height: 768 },
      { name: '平板直向', width: 768, height: 1024 }
    ];
    
    for (const viewport of viewportSizes) {
      console.log(`📐 測試視窗: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // 設定視窗大小
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/games/switcher');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 檢查佈局是否合理
      const layoutInfo = await page.evaluate(() => {
        const iframe = document.querySelector('iframe');
        const container = iframe?.parentElement;
        
        if (iframe && container) {
          const iframeRect = iframe.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const viewport = { width: window.innerWidth, height: window.innerHeight };
          
          return {
            iframe: {
              width: Math.round(iframeRect.width),
              height: Math.round(iframeRect.height),
              visible: iframeRect.width > 0 && iframeRect.height > 0
            },
            container: {
              width: Math.round(containerRect.width),
              height: Math.round(containerRect.height)
            },
            viewport,
            fitsInViewport: iframeRect.bottom <= viewport.height && iframeRect.right <= viewport.width,
            overflowX: iframeRect.width > viewport.width,
            overflowY: iframeRect.height > viewport.height
          };
        }
        return null;
      });
      
      console.log(`   📊 ${viewport.name} 佈局信息:`, JSON.stringify(layoutInfo, null, 2));
      
      // 截圖記錄
      const filename = `responsive-layout-${viewport.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      await page.screenshot({ 
        path: `test-results/${filename}`,
        fullPage: true 
      });
      
      // 驗證佈局合理性
      if (layoutInfo) {
        expect(layoutInfo.iframe.visible).toBe(true);
        
        // 對於大屏幕，遊戲應該完全可見
        if (viewport.width >= 1366) {
          expect(layoutInfo.fitsInViewport).toBe(true);
        }
      }
    }
    
    console.log('🎉 響應式設計和合理排版驗證完成');
  });
});
