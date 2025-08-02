import { test, expect } from '@playwright/test';

/**
 * 測試更新後的遊戲切換器功能
 */

test.describe('更新後遊戲切換器測試', () => {
  
  test('確認 Vite 版為默認遊戲且排在第一位', async ({ page }) => {
    console.log('🔍 檢查 Vite 版是否為默認遊戲');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓頁面完全載入...');
    await page.waitForTimeout(3000);
    
    // 檢查當前遊戲顯示
    const currentGameText = await page.textContent('[class*="font-semibold text-gray-900"]');
    console.log('🎯 當前遊戲:', currentGameText);
    expect(currentGameText).toContain('飛機遊戲 (Vite版)');
    
    // 點擊切換遊戲按鈕查看順序
    console.log('🖱️ 點擊切換遊戲按鈕');
    await page.click('button:has-text("切換遊戲")');
    
    // 等待下拉選單出現
    await page.waitForTimeout(500);
    
    // 檢查第一個遊戲選項
    const firstGameOption = await page.locator('button[class*="w-full text-left px-3 py-2"]').first();
    const firstGameText = await firstGameOption.textContent();
    console.log('🥇 第一個遊戲選項:', firstGameText);
    expect(firstGameText).toContain('飛機遊戲 (Vite版)');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-switcher-vite-first.png',
      fullPage: true 
    });
    
    console.log('✅ Vite 版確認為默認遊戲且排在第一位');
  });
  
  test('檢查修正後的 iframe 寬度', async ({ page }) => {
    console.log('📏 檢查修正後的 iframe 寬度');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 等待 iframe 載入
    console.log('⏳ 等待 iframe 載入...');
    await page.waitForTimeout(5000);
    
    // 檢查 iframe 尺寸
    const iframe = page.locator('iframe').first();
    const boundingBox = await iframe.boundingBox();
    
    if (boundingBox) {
      console.log(`📐 iframe 寬度: ${boundingBox.width}, 高度: ${boundingBox.height}`);
      
      // 檢查寬度是否接近 1274px (允許 1-2px 誤差)
      expect(boundingBox.width).toBeGreaterThanOrEqual(1272);
      expect(boundingBox.width).toBeLessThanOrEqual(1274);
      expect(boundingBox.height).toBeCloseTo(739, 5);
      
      console.log('✅ iframe 尺寸正確');
    } else {
      console.log('❌ 無法獲取 iframe 尺寸');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-switcher-iframe-fixed.png',
      fullPage: true 
    });
    
    console.log('✅ iframe 寬度檢查完成');
  });
  
  test('測試遊戲順序和切換功能', async ({ page }) => {
    console.log('🔄 測試遊戲順序和切換功能');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 點擊切換遊戲按鈕
    await page.click('button:has-text("切換遊戲")');
    await page.waitForTimeout(500);
    
    // 獲取所有遊戲選項
    const gameOptions = await page.locator('button[class*="w-full text-left px-3 py-2"]').allTextContents();
    console.log('🎮 遊戲選項順序:');
    gameOptions.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.replace(/\s+/g, ' ').trim()}`);
    });
    
    // 驗證順序
    expect(gameOptions[0]).toContain('飛機遊戲 (Vite版)');
    expect(gameOptions[1]).toContain('飛機碰撞遊戲');
    expect(gameOptions[2]).toContain('飛機遊戲 (iframe版)');
    
    // 測試切換到第二個遊戲
    console.log('🔄 測試切換到第二個遊戲');
    await page.click('button:has-text("飛機碰撞遊戲")');
    
    // 等待載入
    await page.waitForTimeout(2000);
    
    // 檢查當前遊戲是否已切換
    const newCurrentGame = await page.textContent('[class*="font-semibold text-gray-900"]');
    console.log('🎯 切換後的當前遊戲:', newCurrentGame);
    expect(newCurrentGame).toContain('飛機碰撞遊戲');
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-switcher-order-test.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲順序和切換功能測試完成');
  });

});
