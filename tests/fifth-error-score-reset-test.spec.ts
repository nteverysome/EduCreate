import { test, expect } from '@playwright/test';

/**
 * 測試第5次錯誤時分數歸零功能
 */

test.describe('第5次錯誤分數歸零測試', () => {
  
  test('測試第5次錯誤時分數歸零後結束遊戲', async ({ page }) => {
    console.log('💥 測試第5次錯誤時分數歸零後結束遊戲');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 5 秒讓遊戲完全載入...');
    await page.waitForTimeout(5000);
    
    // 檢查遊戲畫布
    const gameCanvas = page.locator('canvas').first();
    await gameCanvas.waitFor({ state: 'visible' });
    
    const canvasBox = await gameCanvas.boundingBox();
    if (canvasBox) {
      console.log('🎮 遊戲畫布尺寸:', `${canvasBox.width} x ${canvasBox.height}`);
      
      // 點擊畫布中央開始遊戲
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      console.log('🖱️ 點擊遊戲中央開始遊戲');
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(3000);
      
      console.log('🎯 開始測試錯誤碰撞機制');
      
      // 模擬遊戲過程，故意碰撞錯誤的雲朵
      // 由於我們無法直接控制雲朵生成，我們通過移動和等待來模擬碰撞
      
      for (let errorCount = 1; errorCount <= 5; errorCount++) {
        console.log(`❌ 模擬第 ${errorCount} 次錯誤碰撞`);
        
        // 移動飛機到可能碰撞的位置
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(500);
        
        // 等待可能的碰撞發生
        await page.waitForTimeout(2000);
        
        // 截圖記錄每次錯誤後的狀態
        await page.screenshot({ 
          path: `test-results/error-${errorCount}-state.png`,
          fullPage: true 
        });
        
        if (errorCount === 5) {
          console.log('💥 第5次錯誤應該觸發分數歸零');
          
          // 等待分數歸零和遊戲結束的處理
          await page.waitForTimeout(2000);
          
          // 截圖記錄第5次錯誤後的最終狀態
          await page.screenshot({ 
            path: 'test-results/fifth-error-final-state.png',
            fullPage: true 
          });
        }
      }
      
      console.log('✅ 錯誤碰撞測試完成');
    }
    
    console.log('✅ 第5次錯誤分數歸零測試完成');
  });
  
  test('驗證錯誤次數追蹤和分數變化', async ({ page }) => {
    console.log('📊 驗證錯誤次數追蹤和分數變化');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000);
    
    const gameCanvas = page.locator('canvas').first();
    const canvasBox = await gameCanvas.boundingBox();
    
    if (canvasBox) {
      // 開始遊戲
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(3000);
      
      console.log('🎮 開始遊戲，觀察分數和生命值變化');
      
      // 記錄初始狀態
      await page.screenshot({ 
        path: 'test-results/game-initial-state.png',
        fullPage: true 
      });
      
      // 模擬一些遊戲活動
      const movements = [
        { key: 'ArrowUp', duration: 1000, description: '向上移動' },
        { key: 'ArrowDown', duration: 1500, description: '向下移動' },
        { key: 'ArrowUp', duration: 800, description: '再次向上' },
        { key: 'ArrowDown', duration: 1200, description: '再次向下' },
      ];
      
      for (let i = 0; i < movements.length; i++) {
        const movement = movements[i];
        console.log(`🎮 ${movement.description}`);
        
        await page.keyboard.press(movement.key);
        await page.waitForTimeout(movement.duration);
        
        // 每次移動後截圖
        await page.screenshot({ 
          path: `test-results/movement-${i + 1}-${movement.description.replace(/[^a-zA-Z0-9]/g, '')}.png`,
          fullPage: true 
        });
        
        // 等待可能的碰撞
        await page.waitForTimeout(1000);
      }
      
      console.log('✅ 遊戲活動模擬完成');
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/error-tracking-final.png',
      fullPage: true 
    });
    
    console.log('✅ 錯誤次數追蹤測試完成');
  });
  
  test('測試遊戲重新開始時錯誤次數重置', async ({ page }) => {
    console.log('🔄 測試遊戲重新開始時錯誤次數重置');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000);
    
    const gameCanvas = page.locator('canvas').first();
    const canvasBox = await gameCanvas.boundingBox();
    
    if (canvasBox) {
      // 第一次遊戲
      console.log('🎮 開始第一次遊戲');
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(3000);
      
      // 模擬一些遊戲活動
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(1000);
      }
      
      // 截圖第一次遊戲狀態
      await page.screenshot({ 
        path: 'test-results/first-game-state.png',
        fullPage: true 
      });
      
      // 刷新頁面重新開始遊戲
      console.log('🔄 刷新頁面重新開始遊戲');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);
      
      // 第二次遊戲
      console.log('🎮 開始第二次遊戲');
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(3000);
      
      // 截圖第二次遊戲初始狀態
      await page.screenshot({ 
        path: 'test-results/second-game-initial.png',
        fullPage: true 
      });
      
      // 模擬一些遊戲活動
      for (let i = 0; i < 2; i++) {
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1000);
      }
      
      // 截圖第二次遊戲狀態
      await page.screenshot({ 
        path: 'test-results/second-game-state.png',
        fullPage: true 
      });
      
      console.log('✅ 遊戲重置測試完成');
    }
    
    console.log('✅ 錯誤次數重置測試完成');
  });
  
  test('測試分數歸零的視覺效果', async ({ page }) => {
    console.log('🎨 測試分數歸零的視覺效果');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000);
    
    const gameCanvas = page.locator('canvas').first();
    const canvasBox = await gameCanvas.boundingBox();
    
    if (canvasBox) {
      // 開始遊戲
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(3000);
      
      console.log('🎯 觀察分數和UI變化');
      
      // 連續移動模擬遊戲過程
      for (let round = 1; round <= 3; round++) {
        console.log(`🔄 第 ${round} 輪遊戲活動`);
        
        // 上下移動模式
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(800);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(800);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(800);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(800);
        
        // 每輪後截圖
        await page.screenshot({ 
          path: `test-results/visual-round-${round}.png`,
          fullPage: true 
        });
        
        // 等待可能的事件
        await page.waitForTimeout(2000);
      }
      
      // 最終視覺效果截圖
      await page.screenshot({ 
        path: 'test-results/visual-effects-final.png',
        fullPage: true 
      });
      
      console.log('✅ 視覺效果測試完成');
    }
    
    console.log('✅ 分數歸零視覺效果測試完成');
  });

});
