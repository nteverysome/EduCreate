import { test, expect } from '@playwright/test';

/**
 * 測試統一標題欄整合效果
 */

test.describe('統一標題欄測試', () => {
  
  test('檢查整合後的標題欄佈局', async ({ page }) => {
    console.log('🔍 檢查整合後的標題欄佈局');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓頁面完全載入...');
    await page.waitForTimeout(3000);
    
    // 檢查主標題
    const mainTitle = await page.textContent('h1');
    console.log('📝 主標題:', mainTitle);
    expect(mainTitle).toContain('記憶科學遊戲中心');
    
    // 檢查副標題
    const subtitle = await page.textContent('p:has-text("25 種記憶科學遊戲")');
    console.log('📝 副標題:', subtitle);
    expect(subtitle).toContain('25 種記憶科學遊戲，基於主動回憶和間隔重複原理');
    
    // 檢查當前遊戲標籤
    const currentGameLabel = await page.locator('.bg-blue-50').textContent();
    console.log('🎮 當前遊戲標籤:', currentGameLabel);
    expect(currentGameLabel).toContain('飛機遊戲 (Vite版)');
    expect(currentGameLabel).toContain('當前遊戲');
    
    // 檢查 GEPT 等級顯示
    const geptLevel = await page.locator('.bg-green-100').textContent();
    console.log('📚 GEPT 等級:', geptLevel);
    expect(geptLevel).toContain('初級');
    
    // 檢查出遊戲按鈕
    const launchButton = await page.locator('button:has-text("🚀 出遊戲")').count();
    console.log('🚀 出遊戲按鈕數量:', launchButton);
    expect(launchButton).toBe(1);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/unified-header-test.png',
      fullPage: true 
    });
    
    console.log('✅ 統一標題欄佈局檢查完成');
  });
  
  test('檢查標題欄功能按鈕', async ({ page }) => {
    console.log('🔘 檢查標題欄功能按鈕');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 檢查顯示統計按鈕
    const statsButton = await page.locator('button:has-text("顯示統計")').count();
    console.log('📊 顯示統計按鈕數量:', statsButton);
    expect(statsButton).toBe(1);
    
    // 點擊顯示統計按鈕
    console.log('🖱️ 點擊顯示統計按鈕');
    await page.click('button:has-text("顯示統計")');
    await page.waitForTimeout(1000);
    
    // 檢查統計面板是否出現
    const statsPanel = await page.locator('.bg-gray-50').count();
    console.log('📈 統計面板數量:', statsPanel);
    
    // 檢查按鈕文字是否變為隱藏統計
    const hideStatsButton = await page.locator('button:has-text("隱藏統計")').count();
    console.log('📊 隱藏統計按鈕數量:', hideStatsButton);
    expect(hideStatsButton).toBe(1);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/unified-header-stats.png',
      fullPage: true 
    });
    
    console.log('✅ 標題欄功能按鈕檢查完成');
  });
  
  test('檢查遊戲控制器整合', async ({ page }) => {
    console.log('🎮 檢查遊戲控制器整合');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 檢查遊戲控制器是否存在
    const gameController = await page.locator('.game-switcher').count();
    console.log('🎮 遊戲控制器數量:', gameController);
    expect(gameController).toBe(1);
    
    // 檢查載入時間顯示
    const loadTimeDisplay = await page.locator('text=載入: ~').count();
    console.log('⏱️ 載入時間顯示數量:', loadTimeDisplay);
    expect(loadTimeDisplay).toBeGreaterThan(0);
    
    // 檢查切換遊戲按鈕
    const switchButton = await page.locator('button:has-text("切換遊戲")').count();
    console.log('🔄 切換遊戲按鈕數量:', switchButton);
    expect(switchButton).toBe(1);
    
    // 點擊切換遊戲按鈕
    console.log('🖱️ 點擊切換遊戲按鈕');
    await page.click('button:has-text("切換遊戲")');
    await page.waitForTimeout(500);
    
    // 檢查下拉選單
    const dropdown = await page.locator('.absolute.right-0.mt-2').count();
    console.log('📋 下拉選單數量:', dropdown);
    expect(dropdown).toBe(1);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/unified-header-controller.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲控制器整合檢查完成');
  });

});
