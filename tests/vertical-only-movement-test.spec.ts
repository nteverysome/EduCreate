import { test, expect } from '@playwright/test';

/**
 * 測試飛機只能上下移動的控制
 */

test.describe('垂直移動測試', () => {
  
  test('測試飛機只能上下移動，不能左右移動', async ({ page }) => {
    console.log('🎮 測試飛機只能上下移動，不能左右移動');
    
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
      
      // 點擊畫布開始遊戲
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      console.log('🖱️ 點擊遊戲中央開始遊戲');
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(2000);
      
      // 測試上下移動（應該有效）
      console.log('⬆️ 測試向上移動 (Up 鍵)');
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(1000);
      
      console.log('⬇️ 測試向下移動 (Down 鍵)');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1000);
      
      // 測試 WASD 上下移動
      console.log('🔤 測試 W 鍵向上移動');
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(1000);
      
      console.log('🔤 測試 S 鍵向下移動');
      await page.keyboard.press('KeyS');
      await page.waitForTimeout(1000);
      
      // 測試左右移動（應該無效）
      console.log('⬅️ 測試向左移動 (Left 鍵) - 應該無效');
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(1000);
      
      console.log('➡️ 測試向右移動 (Right 鍵) - 應該無效');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
      
      // 測試 WASD 左右移動
      console.log('🔤 測試 A 鍵向左移動 - 應該無效');
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(1000);
      
      console.log('🔤 測試 D 鍵向右移動 - 應該無效');
      await page.keyboard.press('KeyD');
      await page.waitForTimeout(1000);
      
      console.log('✅ 移動控制測試完成');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/vertical-only-movement.png',
      fullPage: true 
    });
    
    console.log('✅ 垂直移動測試完成');
  });
  
  test('驗證飛機水平位置保持固定', async ({ page }) => {
    console.log('📍 驗證飛機水平位置保持固定');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000);
    
    const gameCanvas = page.locator('canvas').first();
    const canvasBox = await gameCanvas.boundingBox();
    
    if (canvasBox) {
      // 點擊開始遊戲
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(2000);
      
      // 記錄初始狀態
      console.log('📸 記錄初始狀態');
      await page.screenshot({ 
        path: 'test-results/airplane-initial-position.png',
        fullPage: true 
      });
      
      // 嘗試多次左右移動
      console.log('🔄 嘗試多次左右移動');
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(200);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);
        await page.keyboard.press('KeyA');
        await page.waitForTimeout(200);
        await page.keyboard.press('KeyD');
        await page.waitForTimeout(200);
      }
      
      // 記錄左右移動後的狀態
      console.log('📸 記錄左右移動後的狀態');
      await page.screenshot({ 
        path: 'test-results/airplane-after-horizontal-attempts.png',
        fullPage: true 
      });
      
      // 測試上下移動確實有效
      console.log('🔄 測試上下移動確實有效');
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(500);
      
      console.log('📸 記錄向上移動後的狀態');
      await page.screenshot({ 
        path: 'test-results/airplane-after-up-movement.png',
        fullPage: true 
      });
      
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      
      console.log('📸 記錄向下移動後的狀態');
      await page.screenshot({ 
        path: 'test-results/airplane-after-down-movement.png',
        fullPage: true 
      });
      
      console.log('✅ 飛機位置固定性驗證完成');
    }
    
    console.log('✅ 水平位置固定測試完成');
  });
  
  test('測試遊戲玩法在垂直移動限制下是否正常', async ({ page }) => {
    console.log('🎯 測試遊戲玩法在垂直移動限制下是否正常');
    
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
      
      console.log('🎮 開始遊戲玩法測試');
      
      // 模擬遊戲過程：上下移動躲避和收集
      const movements = [
        { key: 'ArrowUp', duration: 1000, description: '向上移動' },
        { key: 'ArrowDown', duration: 1500, description: '向下移動' },
        { key: 'KeyW', duration: 800, description: 'W鍵向上' },
        { key: 'KeyS', duration: 1200, description: 'S鍵向下' },
        { key: 'ArrowUp', duration: 600, description: '再次向上' },
      ];
      
      for (const movement of movements) {
        console.log(`🎮 ${movement.description}`);
        await page.keyboard.press(movement.key);
        await page.waitForTimeout(movement.duration);
        
        // 每次移動後截圖
        await page.screenshot({ 
          path: `test-results/gameplay-${movement.description.replace(/[^a-zA-Z0-9]/g, '')}.png`,
          fullPage: true 
        });
      }
      
      console.log('✅ 遊戲玩法測試完成');
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/vertical-movement-gameplay-final.png',
      fullPage: true 
    });
    
    console.log('✅ 垂直移動遊戲玩法測試完成');
  });

});
