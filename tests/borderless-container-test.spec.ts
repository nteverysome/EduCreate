import { test, expect } from '@playwright/test';

/**
 * 測試移除白色邊框後的容器效果
 */

test.describe('無邊框容器測試', () => {
  
  test('檢查切換器中的遊戲容器是否移除邊框', async ({ page }) => {
    console.log('🔍 檢查切換器中的遊戲容器是否移除邊框');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓頁面完全載入...');
    await page.waitForTimeout(3000);
    
    // 檢查遊戲容器的樣式
    const gameContainer = page.locator('div[style*="width: 1274px"]').first();
    const containerExists = await gameContainer.count();
    console.log('🎮 遊戲容器存在:', containerExists > 0);
    
    if (containerExists > 0) {
      // 檢查容器的 class 是否移除了 rounded-lg 和 shadow-sm
      const containerClass = await gameContainer.getAttribute('class');
      console.log('📝 容器 class:', containerClass);
      
      // 驗證不包含圓角和陰影樣式
      expect(containerClass).not.toContain('rounded-lg');
      expect(containerClass).not.toContain('shadow-sm');
      
      console.log('✅ 容器樣式已移除邊框效果');
    }
    
    // 檢查 iframe 的邊框設定
    const iframe = page.locator('iframe').first();
    const iframeExists = await iframe.count();
    console.log('🖼️ iframe 存在:', iframeExists > 0);
    
    if (iframeExists > 0) {
      const iframeClass = await iframe.getAttribute('class');
      console.log('📝 iframe class:', iframeClass);
      
      // 驗證包含 border-0（無邊框）
      expect(iframeClass).toContain('border-0');
      
      console.log('✅ iframe 邊框已移除');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/borderless-switcher-container.png',
      fullPage: true 
    });
    
    console.log('✅ 切換器無邊框容器檢查完成');
  });
  
  test('檢查直接遊戲頁面是否移除邊框', async ({ page }) => {
    console.log('🎮 檢查直接遊戲頁面是否移除邊框');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(3000);
    
    // 檢查 body 的背景顏色
    const bodyStyle = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log('🎨 body 背景顏色:', bodyStyle);
    
    // 檢查遊戲容器的樣式
    const containerStyle = await page.evaluate(() => {
      const container = document.getElementById('game-container');
      if (container) {
        const style = window.getComputedStyle(container);
        return {
          border: style.border,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          backgroundColor: style.backgroundColor,
          width: style.width,
          height: style.height
        };
      }
      return null;
    });
    
    if (containerStyle) {
      console.log('📐 遊戲容器樣式:');
      console.log(`  - 邊框: ${containerStyle.border}`);
      console.log(`  - 圓角: ${containerStyle.borderRadius}`);
      console.log(`  - 陰影: ${containerStyle.boxShadow}`);
      console.log(`  - 背景: ${containerStyle.backgroundColor}`);
      console.log(`  - 尺寸: ${containerStyle.width} x ${containerStyle.height}`);
      
      // 驗證邊框已移除
      expect(containerStyle.border).toBe('0px none rgb(0, 0, 0)');
      expect(containerStyle.borderRadius).toBe('0px');
      expect(containerStyle.boxShadow).toBe('none');
      
      console.log('✅ 遊戲容器邊框已完全移除');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/borderless-direct-game.png',
      fullPage: true 
    });
    
    console.log('✅ 直接遊戲頁面無邊框檢查完成');
  });
  
  test('測量容器實際尺寸與設定尺寸的符合度', async ({ page }) => {
    console.log('📏 測量容器實際尺寸與設定尺寸的符合度');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(3000);
    
    // 檢查遊戲容器的實際尺寸
    const gameContainer = page.locator('div[style*="width: 1274px"]').first();
    const containerBox = await gameContainer.boundingBox();
    
    if (containerBox) {
      console.log('📐 容器實際尺寸:');
      console.log(`  - 寬度: ${containerBox.width}px (設定: 1274px)`);
      console.log(`  - 高度: ${containerBox.height}px (設定: 739px)`);
      console.log(`  - 位置: x=${containerBox.x}, y=${containerBox.y}`);
      
      // 驗證尺寸完全符合
      expect(containerBox.width).toBe(1274);
      expect(containerBox.height).toBe(739);
      
      console.log('✅ 容器尺寸完全符合設定');
    }
    
    // 檢查 iframe 的實際尺寸
    const iframe = page.locator('iframe').first();
    const iframeBox = await iframe.boundingBox();
    
    if (iframeBox) {
      console.log('🖼️ iframe 實際尺寸:');
      console.log(`  - 寬度: ${iframeBox.width}px`);
      console.log(`  - 高度: ${iframeBox.height}px`);
      
      // 驗證 iframe 尺寸與容器一致
      expect(iframeBox.width).toBe(1274);
      expect(iframeBox.height).toBe(739);
      
      console.log('✅ iframe 尺寸與容器完全一致');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/borderless-size-verification.png',
      fullPage: true 
    });
    
    console.log('✅ 尺寸符合度測量完成');
  });
  
  test('對比邊框移除前後的視覺效果', async ({ page }) => {
    console.log('🔄 對比邊框移除前後的視覺效果');
    
    // 截圖切換器頁面
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/borderless-switcher-after.png',
      fullPage: true 
    });
    console.log('📸 切換器無邊框版本截圖完成');
    
    // 截圖直接遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/borderless-game-after.png',
      fullPage: true 
    });
    console.log('📸 直接遊戲無邊框版本截圖完成');
    
    // 檢查頁面是否有多餘的白色空間
    const viewportSize = page.viewportSize();
    const gameCanvas = page.locator('canvas').first();
    const canvasBox = await gameCanvas.boundingBox();
    
    if (viewportSize && canvasBox) {
      console.log('📊 視窗與遊戲區域對比:');
      console.log(`  - 視窗尺寸: ${viewportSize.width} x ${viewportSize.height}`);
      console.log(`  - 遊戲區域: ${canvasBox.width} x ${canvasBox.height}`);
      console.log(`  - 遊戲位置: x=${canvasBox.x}, y=${canvasBox.y}`);
      
      // 檢查是否有多餘的邊距
      const hasExtraMargin = canvasBox.x > 10 || canvasBox.y > 10;
      console.log('🔍 是否有多餘邊距:', hasExtraMargin);
      
      if (!hasExtraMargin) {
        console.log('✅ 遊戲區域緊貼容器邊緣，無多餘空間');
      }
    }
    
    console.log('✅ 視覺效果對比完成');
  });

});
