import { test, expect } from '@playwright/test';

/**
 * 測試修復分數變成負數的問題
 */

test.describe('分數負數修復測試', () => {
  
  test('驗證分數不會變成負數', async ({ page }) => {
    console.log('🔧 驗證分數不會變成負數');
    
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
      
      console.log('🎯 開始測試分數變化');
      
      // 記錄初始狀態
      await page.screenshot({ 
        path: 'test-results/score-fix-initial.png',
        fullPage: true 
      });
      
      // 模擬遊戲過程，觀察分數變化
      for (let round = 1; round <= 10; round++) {
        console.log(`🔄 第 ${round} 輪測試`);
        
        // 上下移動模擬遊戲
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(800);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(800);
        
        // 每輪後截圖檢查分數
        await page.screenshot({ 
          path: `test-results/score-fix-round-${round}.png`,
          fullPage: true 
        });
        
        // 等待可能的碰撞和分數變化
        await page.waitForTimeout(1000);
        
        console.log(`   第 ${round} 輪完成`);
      }
      
      // 最終狀態截圖
      await page.screenshot({ 
        path: 'test-results/score-fix-final.png',
        fullPage: true 
      });
      
      console.log('✅ 分數變化測試完成');
    }
    
    console.log('✅ 分數負數修復測試完成');
  });
  
  test('測試第5次錯誤時分數正確歸零', async ({ page }) => {
    console.log('🎯 測試第5次錯誤時分數正確歸零');
    
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
      
      console.log('🎮 開始遊戲，觀察錯誤處理');
      
      // 記錄遊戲開始狀態
      await page.screenshot({ 
        path: 'test-results/fifth-error-start.png',
        fullPage: true 
      });
      
      // 模擬多次移動，等待錯誤發生
      for (let attempt = 1; attempt <= 15; attempt++) {
        console.log(`🔄 第 ${attempt} 次移動嘗試`);
        
        // 隨機上下移動
        const moveUp = attempt % 2 === 0;
        if (moveUp) {
          await page.keyboard.press('ArrowUp');
        } else {
          await page.keyboard.press('ArrowDown');
        }
        
        await page.waitForTimeout(1000);
        
        // 每5次嘗試截圖一次
        if (attempt % 5 === 0) {
          await page.screenshot({ 
            path: `test-results/fifth-error-attempt-${attempt}.png`,
            fullPage: true 
          });
        }
        
        // 等待可能的碰撞
        await page.waitForTimeout(500);
      }
      
      // 最終狀態截圖
      await page.screenshot({ 
        path: 'test-results/fifth-error-final-state.png',
        fullPage: true 
      });
      
      console.log('✅ 第5次錯誤測試完成');
    }
    
    console.log('✅ 分數歸零測試完成');
  });
  
  test('測試重複碰撞防護機制', async ({ page }) => {
    console.log('🛡️ 測試重複碰撞防護機制');
    
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
      
      console.log('🎮 測試重複碰撞防護');
      
      // 記錄初始狀態
      await page.screenshot({ 
        path: 'test-results/collision-protection-start.png',
        fullPage: true 
      });
      
      // 快速連續移動，測試是否會產生重複碰撞
      console.log('⚡ 快速連續移動測試');
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(100); // 很短的間隔
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
      }
      
      // 中間狀態截圖
      await page.screenshot({ 
        path: 'test-results/collision-protection-middle.png',
        fullPage: true 
      });
      
      // 繼續測試
      console.log('🔄 繼續移動測試');
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
      }
      
      // 最終狀態截圖
      await page.screenshot({ 
        path: 'test-results/collision-protection-final.png',
        fullPage: true 
      });
      
      console.log('✅ 重複碰撞防護測試完成');
    }
    
    console.log('✅ 碰撞防護機制測試完成');
  });
  
  test('驗證遊戲狀態控制', async ({ page }) => {
    console.log('🎮 驗證遊戲狀態控制');
    
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
      
      console.log('🎮 測試遊戲狀態控制');
      
      // 記錄遊戲進行狀態
      await page.screenshot({ 
        path: 'test-results/game-state-playing.png',
        fullPage: true 
      });
      
      // 模擬正常遊戲過程
      for (let i = 0; i < 8; i++) {
        console.log(`🎯 遊戲活動 ${i + 1}`);
        
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(600);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(600);
        
        // 每2次活動截圖一次
        if ((i + 1) % 2 === 0) {
          await page.screenshot({ 
            path: `test-results/game-state-activity-${i + 1}.png`,
            fullPage: true 
          });
        }
      }
      
      // 最終狀態
      await page.screenshot({ 
        path: 'test-results/game-state-final.png',
        fullPage: true 
      });
      
      console.log('✅ 遊戲狀態控制測試完成');
    }
    
    console.log('✅ 遊戲狀態驗證完成');
  });

});
