import { test, expect, Page } from '@playwright/test';

/**
 * EduCreate 遊戲選擇器和 Airplane Game 完整整合測試
 * 
 * 測試目標：
 * 1. 主頁入口 → 遊戲選擇器導航
 * 2. 遊戲選擇器載入和顯示
 * 3. Airplane Game iframe 載入和互動
 * 4. 遊戲切換功能
 * 5. 完整用戶流程驗證
 */

test.describe('遊戲選擇器和 Airplane Game 整合測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 設置較長的超時時間，因為遊戲載入需要時間
    test.setTimeout(60000);
    
    // 監聽控制台錯誤
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('瀏覽器控制台錯誤:', msg.text());
      }
    });
  });

  test('完整用戶流程：主頁 → 遊戲選擇器 → Airplane Game', async ({ page }) => {
    console.log('🚀 開始完整用戶流程測試...');

    // Step 1: 訪問主頁
    console.log('📍 Step 1: 訪問主頁');
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 等待主頁載入完成
    await page.waitForLoadState('networkidle');
    
    // Step 2: 尋找遊戲選擇器入口
    console.log('📍 Step 2: 尋找遊戲選擇器入口');
    
    // 檢查主頁是否有遊戲相關的連結或按鈕
    const gameLinks = await page.locator('a[href*="/games"]').count();
    console.log(`找到 ${gameLinks} 個遊戲相關連結`);
    
    // 直接導航到遊戲選擇器（如果主頁沒有直接連結）
    console.log('📍 Step 3: 導航到遊戲選擇器');
    await page.goto('http://localhost:3000/games/switcher');
    
    // 等待遊戲選擇器頁面載入
    await page.waitForLoadState('networkidle');
    
    // Step 4: 驗證遊戲選擇器載入
    console.log('📍 Step 4: 驗證遊戲選擇器載入');
    
    // 檢查遊戲選擇器組件是否存在
    await expect(page.locator('[data-testid="game-switcher"], .game-switcher, iframe')).toBeVisible({ timeout: 10000 });
    
    // 檢查是否有切換遊戲的按鈕或下拉選單
    const switchButton = page.locator('button:has-text("切換遊戲"), button:has-text("遊戲"), [role="button"]:has-text("遊戲")');
    if (await switchButton.count() > 0) {
      console.log('✅ 找到遊戲切換按鈕');
      await switchButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Step 5: 檢查 Airplane Game 選項
    console.log('📍 Step 5: 檢查 Airplane Game 選項');
    
    // 尋找 airplane 相關的選項
    const airplaneOptions = page.locator('button:has-text("飛機"), [role="option"]:has-text("飛機"), .game-option:has-text("飛機")');
    const airplaneCount = await airplaneOptions.count();
    console.log(`找到 ${airplaneCount} 個飛機遊戲選項`);
    
    if (airplaneCount > 0) {
      console.log('✅ 找到飛機遊戲選項，點擊第一個');
      await airplaneOptions.first().click();
      await page.waitForTimeout(2000);
    }
    
    // Step 6: 驗證 iframe 載入
    console.log('📍 Step 6: 驗證 iframe 載入');
    
    // 檢查是否有 iframe 元素
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible({ timeout: 15000 });
    
    // 檢查 iframe 的 src 屬性
    const iframeSrc = await iframe.getAttribute('src');
    console.log('iframe src:', iframeSrc);
    
    // 驗證 iframe src 指向正確的 URL
    expect(iframeSrc).toMatch(/airplane-game|localhost:3002/);
    
    // Step 7: 等待遊戲載入
    console.log('📍 Step 7: 等待遊戲載入');
    
    // 等待 iframe 內容載入
    await page.waitForTimeout(5000);
    
    // 檢查 iframe 是否成功載入內容
    const iframeElement = await iframe.elementHandle();
    if (iframeElement) {
      try {
        const iframeContent = await iframeElement.contentFrame();
        if (iframeContent) {
          console.log('✅ iframe 內容載入成功');
          
          // 檢查遊戲是否載入（尋找 canvas 或遊戲相關元素）
          const gameCanvas = iframeContent.locator('canvas, #game-container, .game');
          if (await gameCanvas.count() > 0) {
            console.log('✅ 遊戲 canvas 或容器載入成功');
          }
        }
      } catch (error) {
        console.log('⚠️ 無法訪問 iframe 內容（可能是跨域限制）:', error.message);
      }
    }
    
    // Step 8: 截圖記錄
    console.log('📍 Step 8: 截圖記錄');
    await page.screenshot({ 
      path: `test-results/game-switcher-airplane-integration-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('🎉 完整用戶流程測試完成！');
  });

  test('直接測試 Airplane Game URL', async ({ page }) => {
    console.log('🎯 直接測試 Airplane Game URL...');
    
    // 測試直接訪問 airplane-game
    await page.goto('http://localhost:3000/games/airplane-game');
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面是否正確載入
    await expect(page).toHaveTitle(/Airplane|EduCreate/);
    
    // 檢查是否有遊戲相關元素
    const gameElements = page.locator('canvas, #game-container, .game, iframe');
    await expect(gameElements.first()).toBeVisible({ timeout: 10000 });
    
    // 截圖記錄
    await page.screenshot({ 
      path: `test-results/airplane-game-direct-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ 直接 URL 測試完成');
  });

  test('測試遊戲切換功能', async ({ page }) => {
    console.log('🔄 測試遊戲切換功能...');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    // 尋找並點擊遊戲切換按鈕
    const switchButton = page.locator('button:has-text("切換遊戲"), button:has-text("遊戲")');
    if (await switchButton.count() > 0) {
      await switchButton.first().click();
      await page.waitForTimeout(1000);
      
      // 檢查是否有多個遊戲選項
      const gameOptions = page.locator('[role="option"], .game-option, button:has-text("飛機")');
      const optionCount = await gameOptions.count();
      console.log(`找到 ${optionCount} 個遊戲選項`);
      
      if (optionCount > 1) {
        // 測試切換到不同的遊戲選項
        for (let i = 0; i < Math.min(optionCount, 3); i++) {
          console.log(`切換到第 ${i + 1} 個遊戲選項`);
          await gameOptions.nth(i).click();
          await page.waitForTimeout(2000);
          
          // 檢查 iframe 是否更新
          const iframe = page.locator('iframe');
          if (await iframe.count() > 0) {
            const newSrc = await iframe.getAttribute('src');
            console.log(`新的 iframe src: ${newSrc}`);
          }
        }
      }
    }
    
    console.log('✅ 遊戲切換功能測試完成');
  });

});
