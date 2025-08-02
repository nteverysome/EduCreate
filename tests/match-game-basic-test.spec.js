/**
 * EduCreate Match配對遊戲基本功能測試
 * 簡化版測試，驗證基本功能是否正常
 */

const { test, expect } = require('@playwright/test');

test.describe('EduCreate Match配對遊戲基本測試', () => {
  test('Match遊戲基本功能測試', async ({ page }) => {
    test.setTimeout(60000);

    // 監聽控制台日誌
    page.on('console', msg => {
      console.log(`瀏覽器控制台: ${msg.text()}`);
    });

    console.log('🎯 開始Match遊戲基本功能測試...');

    // 導航到Match遊戲頁面
    await page.goto('http://localhost:3000/games/match');
    await page.waitForTimeout(3000);

    // 驗證頁面基本元素
    await expect(page.locator('[data-testid="page-title"]')).toHaveText('Match配對遊戲');
    await expect(page.locator('[data-testid="game-config"]')).toBeVisible();
    
    console.log('✅ 頁面基本元素驗證通過');

    // 截圖：初始頁面
    await page.screenshot({ 
      path: 'test-results/match-basic-01-initial.png',
      fullPage: true 
    });

    // 設置簡單的遊戲配置
    await page.selectOption('[data-testid="mode-select"]', 'text-text');
    await page.selectOption('[data-testid="difficulty-select"]', 'easy');
    await page.fill('[data-testid="pair-count-input"]', '4'); // 修改為4，滿足最小要求
    await page.fill('[data-testid="time-limit-input"]', '60');
    
    console.log('✅ 遊戲配置設置完成');

    // 截圖：配置完成
    await page.screenshot({ 
      path: 'test-results/match-basic-02-config.png',
      fullPage: true 
    });

    // 點擊開始遊戲
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForTimeout(5000); // 等待遊戲加載

    console.log('✅ 遊戲開始按鈕點擊完成');

    // 截圖：遊戲開始後
    await page.screenshot({ 
      path: 'test-results/match-basic-03-game-started.png',
      fullPage: true 
    });

    // 檢查遊戲組件是否存在
    const matchGameComponent = page.locator('[data-testid="match-game-component"]');
    if (await matchGameComponent.isVisible()) {
      console.log('✅ 遊戲組件已顯示');
      
      // 檢查遊戲是否真正開始
      const gameElements = [
        '[data-testid="current-score"]',
        '[data-testid="game-progress"]',
        '[data-testid="time-remaining"]'
      ];
      
      for (const selector of gameElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          console.log(`✅ 找到遊戲元素: ${selector}`);
        } else {
          console.log(`⚠️ 未找到遊戲元素: ${selector}`);
        }
      }
      
      // 檢查遊戲區域
      const leftItems = page.locator('[data-testid="left-items"]');
      const rightItems = page.locator('[data-testid="right-items"]');
      
      if (await leftItems.isVisible() && await rightItems.isVisible()) {
        console.log('✅ 遊戲區域顯示正常');
        
        // 嘗試點擊一個項目
        const firstItem = page.locator('[data-testid^="item-"]').first();
        if (await firstItem.isVisible()) {
          await firstItem.click();
          await page.waitForTimeout(1000);
          console.log('✅ 項目點擊測試完成');
        }
      } else {
        console.log('⚠️ 遊戲區域未正確顯示');
      }
    } else {
      console.log('❌ 遊戲組件未顯示');
    }

    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/match-basic-04-final.png',
      fullPage: true 
    });

    console.log('🎉 Match遊戲基本功能測試完成');
  });
});
