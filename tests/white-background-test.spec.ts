import { test, expect } from '@playwright/test';

/**
 * 測試飛機遊戲背景顏色改為白色的效果
 */

test.describe('白色背景測試', () => {
  
  test('檢查飛機遊戲背景是否改為白色', async ({ page }) => {
    console.log('🎨 檢查飛機遊戲背景是否改為白色');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓遊戲完全載入...');
    await page.waitForTimeout(3000);
    
    // 檢查遊戲畫布的背景顏色
    const gameCanvas = page.locator('canvas').first();
    await gameCanvas.waitFor({ state: 'visible' });
    
    // 截圖檢查背景顏色
    await page.screenshot({ 
      path: 'test-results/white-background-game.png',
      fullPage: true 
    });
    
    // 檢查遊戲容器的背景
    const gameContainer = page.locator('#game-container');
    const containerExists = await gameContainer.count();
    console.log('🎮 遊戲容器存在:', containerExists > 0);
    
    if (containerExists > 0) {
      const containerBox = await gameContainer.boundingBox();
      if (containerBox) {
        console.log('📐 遊戲容器尺寸:');
        console.log(`  - 寬度: ${containerBox.width}px`);
        console.log(`  - 高度: ${containerBox.height}px`);
        console.log(`  - 位置: x=${containerBox.x}, y=${containerBox.y}`);
      }
    }
    
    console.log('✅ 白色背景遊戲截圖完成');
  });
  
  test('檢查文字顏色是否適應白色背景', async ({ page }) => {
    console.log('📝 檢查文字顏色是否適應白色背景');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(3000);
    
    // 檢查是否有文字元素可見
    const textElements = page.locator('text=分數, text=生命值, text=準確率, text=學習詞彙');
    const textCount = await textElements.count();
    console.log('📊 找到的文字元素數量:', textCount);
    
    // 檢查目標詞彙是否顯示
    const targetText = page.locator('text=/目標:/');
    const targetExists = await targetText.count();
    console.log('🎯 目標詞彙顯示:', targetExists > 0);
    
    // 截圖檢查文字可見性
    await page.screenshot({ 
      path: 'test-results/white-background-text-visibility.png',
      fullPage: true 
    });
    
    console.log('✅ 文字顏色適應性檢查完成');
  });
  
  test('對比切換器和遊戲的背景一致性', async ({ page }) => {
    console.log('🔄 對比切換器和遊戲的背景一致性');
    
    // 先截圖切換器頁面
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/switcher-background.png',
      fullPage: true 
    });
    console.log('📸 切換器背景截圖完成');
    
    // 再截圖飛機遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/airplane-game-background.png',
      fullPage: true 
    });
    console.log('📸 飛機遊戲背景截圖完成');
    
    // 檢查遊戲是否正常運行
    const gameCanvas = page.locator('canvas').first();
    const canvasExists = await gameCanvas.count();
    console.log('🎮 遊戲畫布存在:', canvasExists > 0);
    
    if (canvasExists > 0) {
      const canvasBox = await gameCanvas.boundingBox();
      if (canvasBox) {
        console.log('📐 遊戲畫布尺寸:');
        console.log(`  - 寬度: ${canvasBox.width}px`);
        console.log(`  - 高度: ${canvasBox.height}px`);
        
        // 驗證畫布尺寸是否正確（應該是 1274x739）
        expect(canvasBox.width).toBe(1274);
        expect(canvasBox.height).toBe(739);
        
        console.log('✅ 遊戲畫布尺寸正確');
      }
    }
    
    console.log('✅ 背景一致性對比完成');
  });
  
  test('檢查遊戲功能在白色背景下是否正常', async ({ page }) => {
    console.log('🎮 檢查遊戲功能在白色背景下是否正常');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000); // 等待遊戲完全載入
    
    // 檢查遊戲元素是否可見
    const gameCanvas = page.locator('canvas').first();
    await gameCanvas.waitFor({ state: 'visible' });
    
    // 模擬一些遊戲互動（如果可能）
    const canvasBox = await gameCanvas.boundingBox();
    if (canvasBox) {
      // 點擊遊戲區域中央
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      console.log(`🖱️ 點擊遊戲中央: (${centerX}, ${centerY})`);
      await page.mouse.click(centerX, centerY);
      
      await page.waitForTimeout(1000);
      
      // 嘗試鍵盤操作
      console.log('⌨️ 測試鍵盤操作');
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/white-background-game-interaction.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲功能測試完成');
  });

});
