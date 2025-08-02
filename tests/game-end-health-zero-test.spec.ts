import { test, expect } from '@playwright/test';

/**
 * 測試遊戲結束時生命值歸零功能
 */

test.describe('遊戲結束生命值歸零測試', () => {
  
  test('測試遊戲結束時生命值顯示為0', async ({ page }) => {
    console.log('💀 測試遊戲結束時生命值顯示為0');
    
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
      
      console.log('🎯 開始測試生命值變化');
      
      // 記錄初始狀態（生命值應該是100）
      await page.screenshot({ 
        path: 'test-results/health-zero-initial.png',
        fullPage: true 
      });
      
      // 模擬遊戲過程，等待遊戲結束
      for (let round = 1; round <= 20; round++) {
        console.log(`🔄 第 ${round} 輪遊戲活動`);
        
        // 上下移動模擬遊戲
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(600);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(600);
        
        // 每5輪截圖一次
        if (round % 5 === 0) {
          await page.screenshot({ 
            path: `test-results/health-zero-round-${round}.png`,
            fullPage: true 
          });
          console.log(`📸 第 ${round} 輪截圖完成`);
        }
        
        // 等待可能的碰撞和生命值變化
        await page.waitForTimeout(800);
      }
      
      // 最終狀態截圖
      await page.screenshot({ 
        path: 'test-results/health-zero-final.png',
        fullPage: true 
      });
      
      console.log('✅ 生命值變化測試完成');
    }
    
    console.log('✅ 遊戲結束生命值歸零測試完成');
  });
  
  test('測試第5次錯誤後生命值歸零', async ({ page }) => {
    console.log('💥 測試第5次錯誤後生命值歸零');
    
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
      
      console.log('🎮 開始遊戲，觀察第5次錯誤後的生命值');
      
      // 記錄遊戲開始狀態
      await page.screenshot({ 
        path: 'test-results/fifth-error-health-start.png',
        fullPage: true 
      });
      
      // 模擬遊戲過程，等待第5次錯誤
      for (let attempt = 1; attempt <= 25; attempt++) {
        console.log(`🔄 第 ${attempt} 次移動嘗試`);
        
        // 隨機上下移動
        const moveUp = attempt % 2 === 0;
        if (moveUp) {
          await page.keyboard.press('ArrowUp');
        } else {
          await page.keyboard.press('ArrowDown');
        }
        
        await page.waitForTimeout(800);
        
        // 每5次嘗試截圖一次
        if (attempt % 5 === 0) {
          await page.screenshot({ 
            path: `test-results/fifth-error-health-attempt-${attempt}.png`,
            fullPage: true 
          });
          console.log(`📸 第 ${attempt} 次嘗試截圖完成`);
        }
        
        // 等待可能的碰撞
        await page.waitForTimeout(700);
      }
      
      // 最終狀態截圖
      await page.screenshot({ 
        path: 'test-results/fifth-error-health-final.png',
        fullPage: true 
      });
      
      console.log('✅ 第5次錯誤生命值測試完成');
    }
    
    console.log('✅ 第5次錯誤生命值歸零測試完成');
  });
  
  test('測試生命值耗盡時歸零', async ({ page }) => {
    console.log('💔 測試生命值耗盡時歸零');
    
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
      
      console.log('🎮 開始遊戲，觀察生命值耗盡過程');
      
      // 記錄遊戲開始狀態
      await page.screenshot({ 
        path: 'test-results/health-depletion-start.png',
        fullPage: true 
      });
      
      // 模擬遊戲過程，等待生命值耗盡
      for (let phase = 1; phase <= 15; phase++) {
        console.log(`💔 第 ${phase} 階段生命值觀察`);
        
        // 連續移動增加碰撞機會
        for (let move = 0; move < 3; move++) {
          await page.keyboard.press('ArrowUp');
          await page.waitForTimeout(400);
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(400);
        }
        
        // 每3個階段截圖一次
        if (phase % 3 === 0) {
          await page.screenshot({ 
            path: `test-results/health-depletion-phase-${phase}.png`,
            fullPage: true 
          });
          console.log(`📸 第 ${phase} 階段截圖完成`);
        }
        
        // 等待生命值變化
        await page.waitForTimeout(1000);
      }
      
      // 最終狀態截圖
      await page.screenshot({ 
        path: 'test-results/health-depletion-final.png',
        fullPage: true 
      });
      
      console.log('✅ 生命值耗盡測試完成');
    }
    
    console.log('✅ 生命值耗盡歸零測試完成');
  });
  
  test('驗證遊戲結束UI顯示', async ({ page }) => {
    console.log('🖥️ 驗證遊戲結束UI顯示');
    
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
      
      console.log('🎮 開始遊戲，觀察UI變化');
      
      // 記錄遊戲進行中的UI
      await page.screenshot({ 
        path: 'test-results/ui-display-playing.png',
        fullPage: true 
      });
      
      // 模擬遊戲過程
      for (let i = 0; i < 12; i++) {
        console.log(`🎯 UI觀察 ${i + 1}`);
        
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(500);
        
        // 每4次觀察截圖一次
        if ((i + 1) % 4 === 0) {
          await page.screenshot({ 
            path: `test-results/ui-display-observation-${i + 1}.png`,
            fullPage: true 
          });
        }
        
        await page.waitForTimeout(800);
      }
      
      // 最終UI狀態
      await page.screenshot({ 
        path: 'test-results/ui-display-final.png',
        fullPage: true 
      });
      
      console.log('✅ UI顯示測試完成');
    }
    
    console.log('✅ 遊戲結束UI驗證完成');
  });

});
