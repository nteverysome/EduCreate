import { test, expect } from '@playwright/test';

/**
 * 🎮 EduCreate 遊戲切換器響應式設計分析測試
 * 
 * 測試目標：
 * 1. 分析不同設備尺寸下的顯示狀況
 * 2. 識別響應式設計問題
 * 3. 記錄測試結果供後續優化使用
 */

// 測試設備配置
const devices = [
  { name: 'Desktop', width: 1920, height: 1080, description: '桌面大螢幕' },
  { name: 'Laptop', width: 1366, height: 768, description: '筆記本螢幕' },
  { name: 'Tablet', width: 768, height: 1024, description: '平板直向' },
  { name: 'TabletLandscape', width: 1024, height: 768, description: '平板橫向' },
  { name: 'MobileSmall', width: 375, height: 667, description: '小手機 (iPhone SE)' },
  { name: 'MobileLarge', width: 414, height: 896, description: '大手機 (iPhone 11)' },
  { name: 'MobileAndroid', width: 360, height: 640, description: 'Android 手機' }
];

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('🎮 EduCreate 遊戲切換器響應式設計分析', () => {
  
  devices.forEach(device => {
    test(`📱 ${device.name} (${device.width}x${device.height}) - ${device.description}`, async ({ page }) => {
      console.log(`🔍 測試設備: ${device.name} - ${device.description}`);
      
      // 設置視窗大小
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // 導航到遊戲切換器頁面
      await page.goto(`${PRODUCTION_URL}/games/switcher`);
      
      // 等待頁面載入
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 初始截圖
      await page.screenshot({ 
        path: `test-results/responsive-${device.name}-initial.png`,
        fullPage: true 
      });
      
      // 分析頁面元素
      console.log(`📊 分析 ${device.name} 設備上的頁面元素...`);
      
      // 檢查主要組件是否可見
      const gameContainer = page.locator('[data-testid="game-container"]');
      const gameSwitcher = page.locator('[data-testid="game-switcher"]');
      const geptSelector = page.locator('[data-testid="gept-selector"]');
      
      // 記錄元素狀態
      const gameContainerVisible = await gameContainer.isVisible().catch(() => false);
      const gameSwitcherVisible = await gameSwitcher.isVisible().catch(() => false);
      const geptSelectorVisible = await geptSelector.isVisible().catch(() => false);
      
      console.log(`  - 遊戲容器可見: ${gameContainerVisible}`);
      console.log(`  - 遊戲切換器可見: ${gameSwitcherVisible}`);
      console.log(`  - GEPT選擇器可見: ${geptSelectorVisible}`);
      
      // 檢查遊戲切換器下拉選單
      if (gameSwitcherVisible) {
        try {
          // 嘗試點擊遊戲切換器
          await gameSwitcher.click({ timeout: 5000 });
          await page.waitForTimeout(1000);
          
          // 截圖下拉選單狀態
          await page.screenshot({ 
            path: `test-results/responsive-${device.name}-dropdown.png`,
            fullPage: true 
          });
          
          // 檢查下拉選項
          const dropdownOptions = page.locator('select option, .dropdown-option, [role="option"]');
          const optionCount = await dropdownOptions.count();
          console.log(`  - 下拉選項數量: ${optionCount}`);
          
        } catch (error) {
          console.log(`  - 下拉選單互動失敗: ${error}`);
        }
      }
      
      // 檢查 GEPT 等級選擇器
      if (geptSelectorVisible) {
        try {
          await geptSelector.click({ timeout: 5000 });
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: `test-results/responsive-${device.name}-gept.png`,
            fullPage: true 
          });
          
        } catch (error) {
          console.log(`  - GEPT選擇器互動失敗: ${error}`);
        }
      }
      
      // 測量關鍵元素尺寸
      if (gameContainerVisible) {
        const containerBox = await gameContainer.boundingBox();
        if (containerBox) {
          console.log(`  - 遊戲容器尺寸: ${containerBox.width}x${containerBox.height}`);
          console.log(`  - 遊戲容器位置: (${containerBox.x}, ${containerBox.y})`);
          
          // 檢查是否超出視窗
          const isOverflowing = containerBox.width > device.width || containerBox.height > device.height;
          console.log(`  - 容器溢出視窗: ${isOverflowing}`);
        }
      }
      
      // 檢查滾動行為
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = device.height;
      const needsScroll = bodyHeight > viewportHeight;
      console.log(`  - 頁面高度: ${bodyHeight}px, 視窗高度: ${viewportHeight}px`);
      console.log(`  - 需要滾動: ${needsScroll}`);
      
      // 如果需要滾動，測試滾動行為
      if (needsScroll) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `test-results/responsive-${device.name}-scrolled.png`,
          fullPage: true 
        });
      }
      
      // 最終截圖
      await page.screenshot({ 
        path: `test-results/responsive-${device.name}-final.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${device.name} 設備分析完成`);
    });
  });
  
  // 跨設備對比測試
  test('📊 跨設備響應式對比分析', async ({ page }) => {
    console.log('🔍 執行跨設備對比分析...');
    
    const comparisonResults = [];
    
    for (const device of devices) {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto(`${PRODUCTION_URL}/games/switcher`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 收集關鍵指標
      const metrics = await page.evaluate(() => {
        const gameContainer = document.querySelector('[data-testid="game-container"], .game-container, #game-container');
        const gameSwitcher = document.querySelector('[data-testid="game-switcher"], .game-switcher');
        
        return {
          gameContainerVisible: gameContainer ? true : false,
          gameContainerSize: gameContainer ? {
            width: gameContainer.getBoundingClientRect().width,
            height: gameContainer.getBoundingClientRect().height
          } : null,
          gameSwitcherVisible: gameSwitcher ? true : false,
          bodyHeight: document.body.scrollHeight,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };
      });
      
      comparisonResults.push({
        device: device.name,
        dimensions: `${device.width}x${device.height}`,
        ...metrics
      });
    }
    
    // 輸出對比結果
    console.log('📊 跨設備對比結果:');
    console.table(comparisonResults);
    
    // 生成對比報告
    const reportPath = 'test-results/responsive-comparison-report.json';
    await page.evaluate((results) => {
      // 這裡我們將結果保存到頁面中，稍後可以提取
      window.responsiveComparisonResults = results;
    }, comparisonResults);
    
    console.log(`📄 對比報告已準備，結果包含 ${comparisonResults.length} 個設備的數據`);
  });
});
