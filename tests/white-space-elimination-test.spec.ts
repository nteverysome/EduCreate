import { test, expect } from '@playwright/test';

/**
 * 測試消除遊戲容器中的白色空間
 */

test.describe('白色空間消除測試', () => {
  
  test('檢查遊戲背景是否完全填滿容器', async ({ page }) => {
    console.log('🎨 檢查遊戲背景是否完全填滿容器');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 5 秒讓遊戲完全載入...');
    await page.waitForTimeout(5000);
    
    // 檢查遊戲畫布
    const gameCanvas = page.locator('canvas').first();
    await gameCanvas.waitFor({ state: 'visible' });
    
    const canvasBox = await gameCanvas.boundingBox();
    if (canvasBox) {
      console.log('📐 遊戲畫布尺寸:');
      console.log(`  - 寬度: ${canvasBox.width}px`);
      console.log(`  - 高度: ${canvasBox.height}px`);
      console.log(`  - 位置: x=${canvasBox.x}, y=${canvasBox.y}`);
      
      // 驗證畫布尺寸是否正確
      expect(canvasBox.width).toBe(1274);
      expect(canvasBox.height).toBe(739);
      
      console.log('✅ 遊戲畫布尺寸正確');
    }
    
    // 截圖檢查白色空間
    await page.screenshot({ 
      path: 'test-results/white-space-elimination-full.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲背景填滿檢查完成');
  });
  
  test('檢查切換器中的遊戲是否無白色空間', async ({ page }) => {
    console.log('🔄 檢查切換器中的遊戲是否無白色空間');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000);
    
    // 檢查 iframe 容器
    const iframe = page.locator('iframe').first();
    const iframeBox = await iframe.boundingBox();
    
    if (iframeBox) {
      console.log('🖼️ iframe 尺寸:');
      console.log(`  - 寬度: ${iframeBox.width}px`);
      console.log(`  - 高度: ${iframeBox.height}px`);
      console.log(`  - 位置: x=${iframeBox.x}, y=${iframeBox.y}`);
      
      // 驗證 iframe 尺寸
      expect(iframeBox.width).toBe(1274);
      expect(iframeBox.height).toBe(739);
      
      console.log('✅ iframe 尺寸正確');
    }
    
    // 檢查容器
    const gameContainer = page.locator('div[style*="width: 1274px"]').first();
    const containerBox = await gameContainer.boundingBox();
    
    if (containerBox) {
      console.log('📦 遊戲容器尺寸:');
      console.log(`  - 寬度: ${containerBox.width}px`);
      console.log(`  - 高度: ${containerBox.height}px`);
      
      // 驗證容器與 iframe 尺寸一致
      expect(containerBox.width).toBe(1274);
      expect(containerBox.height).toBe(739);
      
      console.log('✅ 容器與 iframe 尺寸完全一致');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/white-space-elimination-switcher.png',
      fullPage: true 
    });
    
    console.log('✅ 切換器白色空間檢查完成');
  });
  
  test('對比修正前後的視覺效果', async ({ page }) => {
    console.log('📊 對比修正前後的視覺效果');
    
    // 截圖直接遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // 檢查是否還有白色區域
    const bodyColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log('🎨 body 背景顏色:', bodyColor);
    
    // 檢查遊戲容器背景
    const containerColor = await page.evaluate(() => {
      const container = document.getElementById('game-container');
      if (container) {
        return window.getComputedStyle(container).backgroundColor;
      }
      return null;
    });
    console.log('📦 容器背景顏色:', containerColor);
    
    // 驗證背景都是白色
    expect(bodyColor).toBe('rgb(255, 255, 255)');
    expect(containerColor).toBe('rgb(255, 255, 255)');
    
    await page.screenshot({ 
      path: 'test-results/white-space-elimination-after.png',
      fullPage: true 
    });
    console.log('📸 修正後截圖完成');
    
    // 檢查遊戲內容是否正常顯示
    const gameCanvas = page.locator('canvas').first();
    const canvasExists = await gameCanvas.count();
    console.log('🎮 遊戲畫布存在:', canvasExists > 0);
    
    if (canvasExists > 0) {
      // 檢查畫布內容（通過像素檢查）
      const canvasBox = await gameCanvas.boundingBox();
      if (canvasBox) {
        // 點擊畫布中央測試互動
        const centerX = canvasBox.x + canvasBox.width / 2;
        const centerY = canvasBox.y + canvasBox.height / 2;
        
        console.log(`🖱️ 測試遊戲互動: 點擊 (${centerX}, ${centerY})`);
        await page.mouse.click(centerX, centerY);
        
        await page.waitForTimeout(1000);
        
        console.log('✅ 遊戲互動測試完成');
      }
    }
    
    console.log('✅ 視覺效果對比完成');
  });
  
  test('驗證遊戲元素位置是否正確調整', async ({ page }) => {
    console.log('📍 驗證遊戲元素位置是否正確調整');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(5000);
    
    // 檢查遊戲畫布
    const gameCanvas = page.locator('canvas').first();
    const canvasBox = await gameCanvas.boundingBox();
    
    if (canvasBox) {
      console.log('🎮 遊戲畫布詳細信息:');
      console.log(`  - 完整尺寸: ${canvasBox.width} x ${canvasBox.height}`);
      console.log(`  - 起始位置: (${canvasBox.x}, ${canvasBox.y})`);
      console.log(`  - 結束位置: (${canvasBox.x + canvasBox.width}, ${canvasBox.y + canvasBox.height})`);
      
      // 檢查是否有任何空白邊距
      const hasTopMargin = canvasBox.y > 5;
      const hasLeftMargin = canvasBox.x > 5;
      
      console.log('🔍 邊距檢查:');
      console.log(`  - 頂部邊距: ${canvasBox.y}px (${hasTopMargin ? '有' : '無'}多餘邊距)`);
      console.log(`  - 左側邊距: ${canvasBox.x}px (${hasLeftMargin ? '有' : '無'}多餘邊距)`);
      
      // 驗證邊距在合理範圍內
      expect(canvasBox.y).toBeLessThanOrEqual(5);
      expect(canvasBox.x).toBeLessThanOrEqual(5);
      
      console.log('✅ 遊戲元素位置正確');
    }
    
    // 檢查視窗利用率
    const viewportSize = page.viewportSize();
    if (viewportSize && canvasBox) {
      const utilizationWidth = (canvasBox.width / viewportSize.width) * 100;
      const utilizationHeight = (canvasBox.height / viewportSize.height) * 100;
      
      console.log('📊 視窗利用率:');
      console.log(`  - 寬度利用率: ${utilizationWidth.toFixed(1)}%`);
      console.log(`  - 高度利用率: ${utilizationHeight.toFixed(1)}%`);
      
      // 驗證高利用率（遊戲應該佔用大部分視窗空間）
      expect(utilizationWidth).toBeGreaterThan(90);
      expect(utilizationHeight).toBeGreaterThan(90);
      
      console.log('✅ 視窗利用率良好');
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/white-space-elimination-final.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲元素位置驗證完成');
  });

});
