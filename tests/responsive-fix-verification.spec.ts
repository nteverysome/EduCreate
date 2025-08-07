import { test, expect } from '@playwright/test';

/**
 * 🎮 EduCreate 響應式設計修復驗證測試
 * 
 * 驗證響應式修復後的效果
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('🎮 EduCreate 響應式設計修復驗證', () => {
  
  test('📱 手機端響應式修復驗證 (375x667)', async ({ page }) => {
    console.log('🔍 測試手機端響應式修復效果...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 截圖記錄修復前狀態
    await page.screenshot({ 
      path: 'test-results/mobile-responsive-fix-before.png',
      fullPage: true 
    });
    
    // 檢查頁面標題響應式
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible();
    const titleText = await pageTitle.textContent();
    console.log('📱 頁面標題:', titleText);
    
    // 檢查遊戲切換器是否可見
    const gameSwitcher = page.locator('[data-testid="game-switcher"]');
    const gameSwitcherVisible = await gameSwitcher.isVisible().catch(() => false);
    console.log('🎮 遊戲切換器可見:', gameSwitcherVisible);
    
    // 檢查 GEPT 選擇器是否可見
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const geptSelectorVisible = await geptSelector.isVisible().catch(() => false);
    console.log('📚 GEPT選擇器可見:', geptSelectorVisible);
    
    // 檢查遊戲容器是否可見
    const gameContainer = page.locator('[data-testid="game-container"]');
    const gameContainerVisible = await gameContainer.isVisible().catch(() => false);
    console.log('🎯 遊戲容器可見:', gameContainerVisible);
    
    // 測試觸控友好的按鈕
    if (geptSelectorVisible) {
      const geptButtons = geptSelector.locator('button');
      const buttonCount = await geptButtons.count();
      console.log('🔘 GEPT按鈕數量:', buttonCount);
      
      if (buttonCount > 0) {
        // 測試第一個按鈕的尺寸
        const firstButton = geptButtons.first();
        const buttonBox = await firstButton.boundingBox();
        if (buttonBox) {
          console.log('📏 按鈕尺寸:', `${buttonBox.width}x${buttonBox.height}`);
          const isTouchFriendly = buttonBox.height >= 44; // 44px 是觸控友好的最小尺寸
          console.log('👆 觸控友好:', isTouchFriendly);
        }
      }
    }
    
    // 測試下拉選單
    const dropdownButton = page.locator('button:has-text("切換遊戲")');
    const dropdownVisible = await dropdownButton.isVisible().catch(() => false);
    console.log('📋 下拉選單按鈕可見:', dropdownVisible);
    
    if (dropdownVisible) {
      // 點擊下拉選單
      await dropdownButton.click();
      await page.waitForTimeout(1000);
      
      // 截圖下拉選單狀態
      await page.screenshot({ 
        path: 'test-results/mobile-dropdown-open.png',
        fullPage: true 
      });
      
      // 檢查下拉選單是否正確顯示
      const dropdownMenu = page.locator('.dropdown-menu');
      const dropdownMenuVisible = await dropdownMenu.isVisible().catch(() => false);
      console.log('📋 下拉選單展開:', dropdownMenuVisible);
      
      // 關閉下拉選單
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // 檢查頁面滾動
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 667;
    const needsScroll = bodyHeight > viewportHeight;
    console.log('📏 頁面高度:', bodyHeight, '視窗高度:', viewportHeight);
    console.log('📜 需要滾動:', needsScroll);
    
    // 測試滾動行為
    if (needsScroll) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/mobile-scrolled.png',
        fullPage: true 
      });
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/mobile-responsive-fix-after.png',
      fullPage: true 
    });
    
    console.log('✅ 手機端響應式修復驗證完成');
  });
  
  test('📱 平板端響應式修復驗證 (768x1024)', async ({ page }) => {
    console.log('🔍 測試平板端響應式修復效果...');
    
    // 設置平板視窗大小
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/tablet-responsive-fix.png',
      fullPage: true 
    });
    
    // 檢查主要組件
    const gameSwitcher = page.locator('[data-testid="game-switcher"]');
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const gameContainer = page.locator('[data-testid="game-container"]');
    
    const gameSwitcherVisible = await gameSwitcher.isVisible().catch(() => false);
    const geptSelectorVisible = await geptSelector.isVisible().catch(() => false);
    const gameContainerVisible = await gameContainer.isVisible().catch(() => false);
    
    console.log('📊 平板端組件可見性:');
    console.log('  - 遊戲切換器:', gameSwitcherVisible);
    console.log('  - GEPT選擇器:', geptSelectorVisible);
    console.log('  - 遊戲容器:', gameContainerVisible);
    
    console.log('✅ 平板端響應式修復驗證完成');
  });
  
  test('🖥️ 桌面端響應式修復驗證 (1920x1080)', async ({ page }) => {
    console.log('🔍 測試桌面端響應式修復效果...');
    
    // 設置桌面視窗大小
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/desktop-responsive-fix.png',
      fullPage: true 
    });
    
    // 檢查主要組件
    const gameSwitcher = page.locator('[data-testid="game-switcher"]');
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const gameContainer = page.locator('[data-testid="game-container"]');
    
    const gameSwitcherVisible = await gameSwitcher.isVisible().catch(() => false);
    const geptSelectorVisible = await geptSelector.isVisible().catch(() => false);
    const gameContainerVisible = await gameContainer.isVisible().catch(() => false);
    
    console.log('📊 桌面端組件可見性:');
    console.log('  - 遊戲切換器:', gameSwitcherVisible);
    console.log('  - GEPT選擇器:', geptSelectorVisible);
    console.log('  - 遊戲容器:', gameContainerVisible);
    
    // 測試遊戲容器尺寸
    if (gameContainerVisible) {
      const containerBox = await gameContainer.boundingBox();
      if (containerBox) {
        console.log('📏 遊戲容器尺寸:', `${containerBox.width}x${containerBox.height}`);
        const aspectRatio = containerBox.width / containerBox.height;
        console.log('📐 寬高比:', aspectRatio.toFixed(2));
      }
    }
    
    console.log('✅ 桌面端響應式修復驗證完成');
  });
});
