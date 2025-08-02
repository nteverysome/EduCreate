import { test, expect } from '@playwright/test';

/**
 * 測試佈局調整效果：飛機遊戲標題移到右邊，遊戲容器進一步提高
 */

test.describe('佈局調整測試', () => {
  
  test('檢查標題佈局調整效果', async ({ page }) => {
    console.log('🔍 檢查標題佈局調整效果');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓頁面完全載入...');
    await page.waitForTimeout(3000);
    
    // 檢查主標題位置（左側）
    const mainTitle = page.locator('h1:has-text("記憶科學遊戲中心")');
    const mainTitleBox = await mainTitle.boundingBox();
    
    // 檢查飛機遊戲標籤位置（右側）
    const gameLabel = page.locator('.bg-blue-50:has-text("飛機遊戲")');
    const gameLabelBox = await gameLabel.boundingBox();
    
    if (mainTitleBox && gameLabelBox) {
      console.log('📏 標題佈局測量:');
      console.log(`  - 主標題位置: x=${mainTitleBox.x}, y=${mainTitleBox.y}`);
      console.log(`  - 遊戲標籤位置: x=${gameLabelBox.x}, y=${gameLabelBox.y}`);
      console.log(`  - 水平間距: ${gameLabelBox.x - (mainTitleBox.x + mainTitleBox.width)}px`);
      
      // 驗證遊戲標籤在主標題右側
      expect(gameLabelBox.x).toBeGreaterThan(mainTitleBox.x + mainTitleBox.width);
      
      // 驗證兩者在相似的垂直位置（允許一些差異）
      expect(Math.abs(gameLabelBox.y - mainTitleBox.y)).toBeLessThan(20);
      
      console.log('✅ 標題佈局正確：主標題在左，遊戲標籤在右');
    } else {
      console.log('❌ 無法獲取標題位置');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/layout-adjustment-header.png',
      fullPage: true 
    });
    
    console.log('✅ 標題佈局調整檢查完成');
  });
  
  test('檢查遊戲容器位置進一步提升', async ({ page }) => {
    console.log('📐 檢查遊戲容器位置進一步提升');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(3000);
    
    // 檢查遊戲 iframe 容器位置
    const gameContainer = page.locator('iframe').first();
    const containerBox = await gameContainer.boundingBox();
    
    if (containerBox) {
      console.log('🎮 遊戲容器位置:');
      console.log(`  - 頂部位置: ${containerBox.y}px`);
      console.log(`  - 左側位置: ${containerBox.x}px`);
      console.log(`  - 寬度: ${containerBox.width}px`);
      console.log(`  - 高度: ${containerBox.height}px`);
      
      // 檢查容器位置是否比之前更高（應該小於 200px）
      expect(containerBox.y).toBeLessThan(200);
      
      // 檢查容器是否在視窗上半部分
      const viewportSize = page.viewportSize();
      if (viewportSize) {
        const isInUpperHalf = containerBox.y < viewportSize.height * 0.4;
        console.log('📍 遊戲容器是否在視窗上半部分:', isInUpperHalf);
        expect(isInUpperHalf).toBe(true);
      }
      
      console.log('✅ 遊戲容器位置進一步提升成功');
    } else {
      console.log('❌ 無法獲取遊戲容器位置');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/layout-adjustment-container.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲容器位置檢查完成');
  });
  
  test('測量整體佈局緊湊度', async ({ page }) => {
    console.log('📏 測量整體佈局緊湊度');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(3000);
    
    // 測量各個組件之間的間距
    const header = page.locator('.bg-white.shadow-sm.border-b').first();
    const controller = page.locator('.game-switcher').first();
    const gameContainer = page.locator('iframe').first();
    
    const headerBox = await header.boundingBox();
    const controllerBox = await controller.boundingBox();
    const gameBox = await gameContainer.boundingBox();
    
    if (headerBox && controllerBox && gameBox) {
      const headerToController = controllerBox.y - (headerBox.y + headerBox.height);
      const controllerToGame = gameBox.y - (controllerBox.y + controllerBox.height);
      
      console.log('📏 組件間距測量（調整後）:');
      console.log(`  - 標題欄到控制器: ${headerToController}px`);
      console.log(`  - 控制器到遊戲: ${controllerToGame}px`);
      console.log(`  - 總高度到遊戲頂部: ${gameBox.y}px`);
      
      // 驗證間距更加緊湊（比之前更小）
      expect(headerToController).toBeLessThan(20);
      expect(controllerToGame).toBeLessThan(20);
      
      // 驗證遊戲容器在更高位置（小於 180px）
      expect(gameBox.y).toBeLessThan(180);
      
      console.log('✅ 佈局更加緊湊，遊戲容器位置更高');
    }
    
    // 檢查右側按鈕區域佈局
    const statsButton = page.locator('button:has-text("顯示統計")');
    const launchButton = page.locator('button:has-text("🚀 出遊戲")');
    const geptLabel = page.locator('.bg-green-100:has-text("初級")');
    
    const statsBox = await statsButton.boundingBox();
    const launchBox = await launchButton.boundingBox();
    const geptBox = await geptLabel.boundingBox();
    
    if (statsBox && launchBox && geptBox) {
      console.log('🔘 右側按鈕區域佈局:');
      console.log(`  - GEPT 標籤位置: x=${geptBox.x}`);
      console.log(`  - 統計按鈕位置: x=${statsBox.x}`);
      console.log(`  - 出遊戲按鈕位置: x=${launchBox.x}`);
      
      // 驗證按鈕順序正確
      expect(geptBox.x).toBeLessThan(statsBox.x);
      expect(statsBox.x).toBeLessThan(launchBox.x);
      
      console.log('✅ 右側按鈕區域佈局正確');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/layout-adjustment-compact.png',
      fullPage: true 
    });
    
    console.log('✅ 整體佈局緊湊度測量完成');
  });

});
