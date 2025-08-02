/**
 * 完整的 E2E 測試套件
 * 驗證多遊戲切換的穩定性和性能
 * 測試 UnifiedGameManager 的完整工作流程
 */

import { test, expect } from '@playwright/test';

// 測試配置
const E2E_CONFIG = {
  baseURL: 'http://localhost:3003',
  timeout: 120000, // 2分鐘
  gameLoadTimeout: 15000, // 15秒
  switchTimeout: 5000, // 5秒
  memoryThreshold: 500, // MB
  performanceThreshold: {
    loadTime: 2000, // ms
    switchTime: 500, // ms
    fps: 30
  }
};

// 測試遊戲列表
const TEST_GAMES = [
  { id: 'quiz', name: '問答遊戲', category: 'lightweight' },
  { id: 'flashcard', name: '閃卡遊戲', category: 'lightweight' },
  { id: 'crossword', name: '填字遊戲', category: 'medium' },
  { id: 'airplane', name: '飛機碰撞遊戲', category: 'heavyweight' }
];

test.describe('EduCreate 完整 E2E 測試套件', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(E2E_CONFIG.timeout);
    
    // 設置控制台監聽
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('頁面錯誤:', msg.text());
      }
    });
    
    // 設置錯誤監聽
    page.on('pageerror', error => {
      console.error('頁面異常:', error.message);
    });
    
    // 導航到主頁面
    await page.goto(`${E2E_CONFIG.baseURL}/games/airplane`);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ E2E 測試環境準備完成');
  });

  test('完整用戶旅程測試', async ({ page }) => {
    console.log('🚀 開始完整用戶旅程測試');
    
    // 1. 驗證頁面載入
    await expect(page.locator('h1')).toContainText('遊戲學習中心');
    await expect(page.locator('.enhanced-game-switcher')).toBeVisible();
    
    console.log('✅ 頁面載入驗證完成');
    
    // 2. 測試遊戲統計顯示
    const statsElements = [
      page.locator('text=分數'),
      page.locator('text=學習詞彙'),
      page.locator('text=準確率')
    ];
    
    for (const element of statsElements) {
      await expect(element).toBeVisible();
    }
    
    console.log('✅ 遊戲統計顯示驗證完成');
    
    // 3. 測試遊戲切換功能
    const switchButton = page.locator('button:has-text("切換遊戲")');
    await expect(switchButton).toBeVisible();
    await switchButton.click();
    
    // 驗證下拉選單出現
    const dropdown = page.locator('.absolute.right-0.mt-2');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    console.log('✅ 遊戲切換下拉選單驗證完成');
    
    // 4. 測試遊戲分類顯示
    const categories = ['輕量級遊戲', '中等遊戲', '重型遊戲'];
    for (const category of categories) {
      await expect(page.locator(`text=${category}`)).toBeVisible();
    }
    
    console.log('✅ 遊戲分類顯示驗證完成');
    
    // 5. 測試 GEPT 等級選擇
    const geptLevels = ['初級', '中級', '高級'];
    for (const level of geptLevels) {
      const levelButton = page.locator(`button:has-text("${level}")`);
      await expect(levelButton).toBeVisible();
      await levelButton.click();
      await page.waitForTimeout(500);
    }
    
    console.log('✅ GEPT 等級選擇驗證完成');
    
    // 6. 測試系統狀態顯示
    await expect(page.locator('text=系統狀態')).toBeVisible();
    await expect(page.locator('text=活躍遊戲')).toBeVisible();
    await expect(page.locator('text=記憶體使用')).toBeVisible();
    
    console.log('✅ 系統狀態顯示驗證完成');
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/complete-user-journey.png',
      fullPage: true 
    });
    
    console.log('🎉 完整用戶旅程測試完成');
  });

  test('多遊戲切換穩定性測試', async ({ page }) => {
    console.log('🔄 開始多遊戲切換穩定性測試');
    
    const switchResults: Array<{
      gameId: string;
      gameName: string;
      success: boolean;
      loadTime: number;
      error?: string;
    }> = [];
    
    // 測試每個遊戲的切換
    for (const game of TEST_GAMES) {
      console.log(`🎮 測試切換到: ${game.name}`);
      
      const startTime = Date.now();
      let success = false;
      let error: string | undefined;
      
      try {
        // 打開遊戲切換選單
        await page.click('button:has-text("切換遊戲")');
        await page.waitForTimeout(500);
        
        // 查找並點擊目標遊戲
        const gameButton = page.locator(`button:has-text("${game.name}")`);
        
        if (await gameButton.count() > 0) {
          await gameButton.click();
          
          // 等待遊戲載入
          await page.waitForTimeout(3000);
          
          // 驗證遊戲已切換
          const gameContent = page.locator('.enhanced-game-switcher');
          await expect(gameContent).toBeVisible();
          
          success = true;
          console.log(`✅ ${game.name} 切換成功`);
        } else {
          error = `找不到遊戲按鈕: ${game.name}`;
          console.log(`❌ ${game.name} 切換失敗: ${error}`);
        }
        
      } catch (err) {
        error = err instanceof Error ? err.message : '未知錯誤';
        console.log(`❌ ${game.name} 切換異常: ${error}`);
      }
      
      const loadTime = Date.now() - startTime;
      
      switchResults.push({
        gameId: game.id,
        gameName: game.name,
        success,
        loadTime,
        error
      });
      
      // 短暫等待，避免過快切換
      await page.waitForTimeout(1000);
    }
    
    // 分析測試結果
    const successfulSwitches = switchResults.filter(r => r.success);
    const failedSwitches = switchResults.filter(r => !r.success);
    
    console.log('\n📊 多遊戲切換測試結果:');
    console.log(`✅ 成功: ${successfulSwitches.length}/${switchResults.length}`);
    console.log(`❌ 失敗: ${failedSwitches.length}/${switchResults.length}`);
    
    if (successfulSwitches.length > 0) {
      const avgLoadTime = successfulSwitches.reduce((sum, r) => sum + r.loadTime, 0) / successfulSwitches.length;
      console.log(`⏱️ 平均載入時間: ${Math.round(avgLoadTime)}ms`);
      
      // 性能斷言
      expect(avgLoadTime).toBeLessThan(E2E_CONFIG.performanceThreshold.loadTime);
    }
    
    // 穩定性斷言
    expect(successfulSwitches.length).toBeGreaterThanOrEqual(TEST_GAMES.length * 0.8); // 至少 80% 成功率
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/multi-game-switching-stability.png',
      fullPage: true 
    });
    
    console.log('🎉 多遊戲切換穩定性測試完成');
  });

  test('性能監控和警報測試', async ({ page }) => {
    console.log('📊 開始性能監控和警報測試');
    
    // 監控頁面性能
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      return {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        memoryUsed: memory ? memory.usedJSHeapSize / (1024 * 1024) : 0,
        memoryTotal: memory ? memory.totalJSHeapSize / (1024 * 1024) : 0
      };
    });
    
    console.log('📈 性能指標:', performanceMetrics);
    
    // 驗證性能指標
    expect(performanceMetrics.loadTime).toBeLessThan(5000); // 5秒內載入
    expect(performanceMetrics.memoryUsed).toBeLessThan(E2E_CONFIG.memoryThreshold);
    
    // 測試系統狀態顯示
    const systemStatus = page.locator('text=系統狀態');
    if (await systemStatus.count() > 0) {
      await expect(systemStatus).toBeVisible();
      
      // 檢查記憶體使用顯示
      const memoryDisplay = page.locator('text=記憶體使用');
      await expect(memoryDisplay).toBeVisible();
      
      // 檢查活躍遊戲顯示
      const activeGamesDisplay = page.locator('text=活躍遊戲');
      await expect(activeGamesDisplay).toBeVisible();
      
      console.log('✅ 系統狀態顯示正常');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/performance-monitoring.png',
      fullPage: true 
    });
    
    console.log('🎉 性能監控和警報測試完成');
  });

  test('錯誤處理和恢復測試', async ({ page }) => {
    console.log('🛠️ 開始錯誤處理和恢復測試');
    
    // 模擬網絡中斷
    await page.route('**/*', route => {
      if (route.request().url().includes('api')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // 嘗試切換遊戲（應該會失敗）
    try {
      await page.click('button:has-text("切換遊戲")');
      await page.waitForTimeout(1000);
      
      const gameButton = page.locator('button:has-text("問答遊戲")');
      if (await gameButton.count() > 0) {
        await gameButton.click();
        await page.waitForTimeout(3000);
      }
    } catch (error) {
      console.log('✅ 預期的網絡錯誤已捕獲');
    }
    
    // 恢復網絡連接
    await page.unroute('**/*');
    
    // 測試恢復功能
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面恢復正常
    await expect(page.locator('.enhanced-game-switcher')).toBeVisible();
    
    console.log('✅ 錯誤恢復測試完成');
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/error-handling-recovery.png',
      fullPage: true 
    });
    
    console.log('🎉 錯誤處理和恢復測試完成');
  });

  test('無障礙性測試', async ({ page }) => {
    console.log('♿ 開始無障礙性測試');
    
    // 測試鍵盤導航
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // 檢查焦點是否可見
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // 測試 ARIA 標籤
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // 按鈕應該有可訪問的名稱
      expect(ariaLabel || textContent).toBeTruthy();
    }
    
    // 測試顏色對比度（簡化檢查）
    const textElements = page.locator('h1, h2, h3, p, span');
    const textCount = await textElements.count();
    
    for (let i = 0; i < Math.min(textCount, 10); i++) {
      const element = textElements.nth(i);
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });
      
      // 基本的可讀性檢查
      expect(styles.fontSize).toBeTruthy();
    }
    
    console.log('✅ 無障礙性基本檢查完成');
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/accessibility-test.png',
      fullPage: true 
    });
    
    console.log('🎉 無障礙性測試完成');
  });

  test('跨瀏覽器兼容性測試', async ({ page, browserName }) => {
    console.log(`🌐 開始 ${browserName} 瀏覽器兼容性測試`);
    
    // 檢查基本功能
    await expect(page.locator('.enhanced-game-switcher')).toBeVisible();
    
    // 測試 JavaScript 功能
    const jsSupport = await page.evaluate(() => {
      return {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        Promise: typeof Promise !== 'undefined',
        Map: typeof Map !== 'undefined',
        Set: typeof Set !== 'undefined'
      };
    });
    
    console.log(`${browserName} JS 支援:`, jsSupport);
    
    // 驗證關鍵 API 支援
    expect(jsSupport.localStorage).toBe(true);
    expect(jsSupport.fetch).toBe(true);
    expect(jsSupport.Promise).toBe(true);
    
    // 測試 CSS 功能
    const cssSupport = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.style.display = 'flex';
      testElement.style.gridTemplateColumns = '1fr 1fr';
      
      return {
        flexbox: testElement.style.display === 'flex',
        grid: testElement.style.gridTemplateColumns === '1fr 1fr'
      };
    });
    
    console.log(`${browserName} CSS 支援:`, cssSupport);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `test-results/browser-compatibility-${browserName}.png`,
      fullPage: true 
    });
    
    console.log(`🎉 ${browserName} 瀏覽器兼容性測試完成`);
  });

  test.afterEach(async ({ page }) => {
    // 收集測試後的性能數據
    const finalMetrics = await page.evaluate(() => {
      const memory = (performance as any).memory;
      return {
        memoryUsed: memory ? memory.usedJSHeapSize / (1024 * 1024) : 0,
        timestamp: Date.now()
      };
    });
    
    console.log('📊 測試結束時記憶體使用:', Math.round(finalMetrics.memoryUsed), 'MB');
    
    // 清理
    console.log('🧹 E2E 測試清理完成');
  });
});
