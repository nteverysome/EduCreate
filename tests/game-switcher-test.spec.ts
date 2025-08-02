import { test, expect } from '@playwright/test';

/**
 * 測試遊戲切換器功能
 */

test.describe('遊戲切換器測試', () => {
  
  test('檢查遊戲切換器頁面載入', async ({ page }) => {
    console.log('🔍 檢查遊戲切換器頁面載入');
    
    // 監聽控制台日誌
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      // 檢查遊戲切換相關日誌
      if (text.includes('遊戲切換') || text.includes('GameSwitcher') || text.includes('🎮')) {
        console.log('🎮 遊戲切換日誌:', text);
      }
    });
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓頁面完全載入...');
    await page.waitForTimeout(3000);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-switcher-test.png',
      fullPage: true 
    });
    
    // 檢查頁面標題
    const title = await page.textContent('h1');
    console.log('📝 頁面標題:', title);
    expect(title).toContain('記憶科學遊戲中心');
    
    // 檢查是否有遊戲切換器組件
    const gameSwitcher = await page.locator('.game-switcher').count();
    console.log('🎮 遊戲切換器組件數量:', gameSwitcher);
    expect(gameSwitcher).toBeGreaterThan(0);
    
    // 檢查當前遊戲顯示
    const currentGame = await page.textContent('[class*="font-semibold text-gray-900"]');
    console.log('🎯 當前遊戲:', currentGame);
    
    // 檢查切換遊戲按鈕
    const switchButton = await page.locator('button:has-text("切換遊戲")').count();
    console.log('🔄 切換遊戲按鈕數量:', switchButton);
    expect(switchButton).toBeGreaterThan(0);
    
    console.log('✅ 遊戲切換器頁面載入測試完成');
  });
  
  test('測試遊戲切換功能', async ({ page }) => {
    console.log('🔄 測試遊戲切換功能');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 點擊切換遊戲按鈕
    console.log('🖱️ 點擊切換遊戲按鈕');
    await page.click('button:has-text("切換遊戲")');
    
    // 等待下拉選單出現
    await page.waitForTimeout(500);
    
    // 檢查下拉選單是否出現
    const dropdown = await page.locator('[class*="absolute right-0 mt-2"]').count();
    console.log('📋 下拉選單數量:', dropdown);
    
    if (dropdown > 0) {
      // 檢查可用遊戲
      const availableGames = await page.locator('button:has-text("飛機")').count();
      console.log('✈️ 可用飛機遊戲數量:', availableGames);
      
      // 嘗試點擊不同的遊戲選項
      if (availableGames > 1) {
        console.log('🎮 嘗試切換到不同的飛機遊戲版本');
        await page.click('button:has-text("飛機遊戲 (Vite版)")');
        
        // 等待載入
        await page.waitForTimeout(2000);
        
        // 檢查是否有載入進度
        const loadingProgress = await page.locator('[class*="bg-blue-600 h-2 rounded-full"]').count();
        console.log('⏳ 載入進度條數量:', loadingProgress);
      }
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-switcher-function.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲切換功能測試完成');
  });
  
  test('檢查 iframe 遊戲載入', async ({ page }) => {
    console.log('🖼️ 檢查 iframe 遊戲載入');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 等待 iframe 載入
    console.log('⏳ 等待 iframe 載入...');
    await page.waitForTimeout(5000);
    
    // 檢查 iframe 是否存在
    const iframes = await page.locator('iframe').count();
    console.log('🖼️ iframe 數量:', iframes);
    expect(iframes).toBeGreaterThan(0);
    
    // 檢查 iframe 尺寸
    if (iframes > 0) {
      const iframe = page.locator('iframe').first();
      const boundingBox = await iframe.boundingBox();
      console.log('📏 iframe 尺寸:', boundingBox);
      
      // 檢查是否是 Wordwall 尺寸 (1274x739)
      if (boundingBox) {
        console.log(`📐 iframe 寬度: ${boundingBox.width}, 高度: ${boundingBox.height}`);
        expect(boundingBox.width).toBeCloseTo(1274, 10);
        expect(boundingBox.height).toBeCloseTo(739, 10);
      }
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/game-switcher-iframe.png',
      fullPage: true 
    });
    
    console.log('✅ iframe 遊戲載入測試完成');
  });

});
