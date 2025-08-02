import { test, expect } from '@playwright/test';

/**
 * 測試觸碰和滑鼠控制功能
 */

test.describe('觸碰和滑鼠控制測試', () => {
  
  test('測試滑鼠點擊控制飛機上下移動', async ({ page }) => {
    console.log('🖱️ 測試滑鼠點擊控制飛機上下移動');
    
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
      
      // 測試點擊上半部分（向上移動）
      const upperY = canvasBox.y + canvasBox.height * 0.25; // 上四分之一位置
      console.log('⬆️ 測試點擊上半部分 - 應該向上移動');
      console.log(`   點擊位置: (${centerX}, ${upperY})`);
      
      // 連續點擊測試
      for (let i = 0; i < 3; i++) {
        await page.mouse.click(centerX, upperY);
        await page.waitForTimeout(500);
        console.log(`   第 ${i + 1} 次點擊上半部分`);
      }
      
      // 截圖記錄向上移動效果
      await page.screenshot({ 
        path: 'test-results/mouse-control-up-movement.png',
        fullPage: true 
      });
      
      // 測試點擊下半部分（向下移動）
      const lowerY = canvasBox.y + canvasBox.height * 0.75; // 下四分之一位置
      console.log('⬇️ 測試點擊下半部分 - 應該向下移動');
      console.log(`   點擊位置: (${centerX}, ${lowerY})`);
      
      // 連續點擊測試
      for (let i = 0; i < 3; i++) {
        await page.mouse.click(centerX, lowerY);
        await page.waitForTimeout(500);
        console.log(`   第 ${i + 1} 次點擊下半部分`);
      }
      
      // 截圖記錄向下移動效果
      await page.screenshot({ 
        path: 'test-results/mouse-control-down-movement.png',
        fullPage: true 
      });
      
      console.log('✅ 滑鼠點擊控制測試完成');
    }
    
    console.log('✅ 滑鼠控制測試完成');
  });
  
  test('測試滑鼠按住控制（持續移動）', async ({ page }) => {
    console.log('🖱️ 測試滑鼠按住控制（持續移動）');
    
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
      
      // 測試按住上半部分
      const upperY = canvasBox.y + canvasBox.height * 0.3;
      console.log('⬆️ 測試按住上半部分 - 持續向上移動');
      
      await page.mouse.move(centerX, upperY);
      await page.mouse.down();
      console.log('   滑鼠按下，開始持續向上移動');
      
      await page.waitForTimeout(2000); // 按住2秒
      
      await page.mouse.up();
      console.log('   滑鼠釋放，停止移動');
      
      // 截圖記錄持續向上移動效果
      await page.screenshot({ 
        path: 'test-results/mouse-hold-up-movement.png',
        fullPage: true 
      });
      
      await page.waitForTimeout(1000);
      
      // 測試按住下半部分
      const lowerY = canvasBox.y + canvasBox.height * 0.7;
      console.log('⬇️ 測試按住下半部分 - 持續向下移動');
      
      await page.mouse.move(centerX, lowerY);
      await page.mouse.down();
      console.log('   滑鼠按下，開始持續向下移動');
      
      await page.waitForTimeout(2000); // 按住2秒
      
      await page.mouse.up();
      console.log('   滑鼠釋放，停止移動');
      
      // 截圖記錄持續向下移動效果
      await page.screenshot({ 
        path: 'test-results/mouse-hold-down-movement.png',
        fullPage: true 
      });
      
      console.log('✅ 滑鼠按住控制測試完成');
    }
    
    console.log('✅ 滑鼠持續控制測試完成');
  });
  
  test('測試觸碰控制（模擬觸碰設備）', async ({ page }) => {
    console.log('📱 測試觸碰控制（模擬觸碰設備）');
    
    // 模擬觸碰設備
    await page.emulate({
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
      viewport: { width: 1024, height: 768 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000);
    
    const gameCanvas = page.locator('canvas').first();
    const canvasBox = await gameCanvas.boundingBox();
    
    if (canvasBox) {
      // 開始遊戲
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      console.log('👆 觸碰開始遊戲');
      await page.touchscreen.tap(centerX, centerY);
      await page.waitForTimeout(3000);
      
      // 測試觸碰上半部分
      const upperY = canvasBox.y + canvasBox.height * 0.25;
      console.log('⬆️ 測試觸碰上半部分 - 應該向上移動');
      
      for (let i = 0; i < 3; i++) {
        await page.touchscreen.tap(centerX, upperY);
        await page.waitForTimeout(500);
        console.log(`   第 ${i + 1} 次觸碰上半部分`);
      }
      
      // 截圖記錄觸碰向上移動效果
      await page.screenshot({ 
        path: 'test-results/touch-control-up-movement.png',
        fullPage: true 
      });
      
      // 測試觸碰下半部分
      const lowerY = canvasBox.y + canvasBox.height * 0.75;
      console.log('⬇️ 測試觸碰下半部分 - 應該向下移動');
      
      for (let i = 0; i < 3; i++) {
        await page.touchscreen.tap(centerX, lowerY);
        await page.waitForTimeout(500);
        console.log(`   第 ${i + 1} 次觸碰下半部分`);
      }
      
      // 截圖記錄觸碰向下移動效果
      await page.screenshot({ 
        path: 'test-results/touch-control-down-movement.png',
        fullPage: true 
      });
      
      console.log('✅ 觸碰控制測試完成');
    }
    
    console.log('✅ 觸碰設備控制測試完成');
  });
  
  test('測試混合控制（鍵盤 + 滑鼠 + 觸碰）', async ({ page }) => {
    console.log('🎮 測試混合控制（鍵盤 + 滑鼠 + 觸碰）');
    
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
      
      console.log('🔄 測試混合控制模式');
      
      // 1. 鍵盤控制
      console.log('⌨️ 測試鍵盤控制');
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      
      // 2. 滑鼠控制
      console.log('🖱️ 測試滑鼠控制');
      const upperY = canvasBox.y + canvasBox.height * 0.3;
      await page.mouse.click(centerX, upperY);
      await page.waitForTimeout(500);
      
      const lowerY = canvasBox.y + canvasBox.height * 0.7;
      await page.mouse.click(centerX, lowerY);
      await page.waitForTimeout(500);
      
      // 3. WASD 控制
      console.log('🔤 測試 WASD 控制');
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(500);
      await page.keyboard.press('KeyS');
      await page.waitForTimeout(500);
      
      // 4. 混合同時控制
      console.log('🎯 測試同時使用多種控制');
      await page.keyboard.down('ArrowUp');
      await page.mouse.click(centerX, upperY);
      await page.waitForTimeout(1000);
      await page.keyboard.up('ArrowUp');
      
      // 最終截圖
      await page.screenshot({ 
        path: 'test-results/mixed-control-final.png',
        fullPage: true 
      });
      
      console.log('✅ 混合控制測試完成');
    }
    
    console.log('✅ 所有控制方式測試完成');
  });

});
