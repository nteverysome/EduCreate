import { test, expect } from '@playwright/test';

/**
 * 測試遊戲容器位置優化效果
 */

test.describe('遊戲容器位置測試', () => {
  
  test('檢查遊戲容器是否在可見區域內', async ({ page }) => {
    console.log('🔍 檢查遊戲容器是否在可見區域內');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓頁面完全載入...');
    await page.waitForTimeout(3000);
    
    // 獲取視窗高度
    const viewportSize = page.viewportSize();
    console.log('📐 視窗尺寸:', viewportSize);
    
    // 檢查遊戲 iframe 容器位置
    const gameContainer = page.locator('iframe').first();
    const containerBox = await gameContainer.boundingBox();
    
    if (containerBox) {
      console.log('🎮 遊戲容器位置:');
      console.log(`  - 頂部位置: ${containerBox.y}px`);
      console.log(`  - 左側位置: ${containerBox.x}px`);
      console.log(`  - 寬度: ${containerBox.width}px`);
      console.log(`  - 高度: ${containerBox.height}px`);
      
      // 檢查遊戲容器是否在視窗內可見
      const isVisible = containerBox.y >= 0 && containerBox.y < (viewportSize?.height || 1080);
      console.log('👁️ 遊戲容器是否在視窗內可見:', isVisible);
      
      // 檢查遊戲容器頂部是否在合理位置（不超過視窗高度的 50%）
      const isInGoodPosition = containerBox.y < (viewportSize?.height || 1080) * 0.5;
      console.log('📍 遊戲容器是否在良好位置:', isInGoodPosition);
      
      expect(isVisible).toBe(true);
      expect(isInGoodPosition).toBe(true);
    } else {
      console.log('❌ 無法獲取遊戲容器位置');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-container-position.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲容器位置檢查完成');
  });
  
  test('檢查頁面載入時的滾動位置', async ({ page }) => {
    console.log('📜 檢查頁面載入時的滾動位置');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 等待頁面完全載入
    await page.waitForTimeout(3000);
    
    // 檢查當前滾動位置
    const scrollY = await page.evaluate(() => window.scrollY);
    console.log('📜 當前滾動位置:', scrollY);
    
    // 檢查遊戲容器是否在初始視窗內
    const gameContainer = page.locator('iframe').first();
    const isInViewport = await gameContainer.isInViewport();
    console.log('👁️ 遊戲容器是否在視窗內:', isInViewport);
    
    // 檢查標題欄高度
    const header = page.locator('.bg-white.shadow-sm.border-b').first();
    const headerBox = await header.boundingBox();
    if (headerBox) {
      console.log('📏 標題欄高度:', headerBox.height);
    }
    
    // 檢查控制器高度
    const controller = page.locator('.game-switcher').first();
    const controllerBox = await controller.boundingBox();
    if (controllerBox) {
      console.log('🎮 控制器高度:', controllerBox.height);
      console.log('🎮 控制器頂部位置:', controllerBox.y);
    }
    
    // 驗證用戶無需滾動即可看到遊戲
    expect(isInViewport).toBe(true);
    expect(scrollY).toBe(0); // 頁面載入時應該在頂部
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-container-scroll.png',
      fullPage: false // 只截取視窗內容
    });
    
    console.log('✅ 滾動位置檢查完成');
  });
  
  test('測試緊湊佈局效果', async ({ page }) => {
    console.log('📐 測試緊湊佈局效果');
    
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
      
      console.log('📏 組件間距測量:');
      console.log(`  - 標題欄到控制器: ${headerToController}px`);
      console.log(`  - 控制器到遊戲: ${controllerToGame}px`);
      console.log(`  - 總高度到遊戲頂部: ${gameBox.y}px`);
      
      // 驗證間距是否緊湊（不超過 50px）
      expect(headerToController).toBeLessThan(50);
      expect(controllerToGame).toBeLessThan(30);
      
      // 驗證遊戲容器在合理位置（不超過 300px）
      expect(gameBox.y).toBeLessThan(300);
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-container-compact.png',
      fullPage: true 
    });
    
    console.log('✅ 緊湊佈局測試完成');
  });

});
