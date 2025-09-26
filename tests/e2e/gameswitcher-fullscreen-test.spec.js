const { test, expect } = require('@playwright/test');

test.describe('GameSwitcher StarShake 全螢幕功能測試', () => {
  test('StarShake 遊戲全螢幕按鈕功能驗證', async ({ page }) => {
    console.log('🎯 開始測試 GameSwitcher 中的 StarShake 全螢幕功能');

    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 667 });

    try {
      // 1. 直接訪問 StarShake 遊戲頁面
      console.log('📱 直接訪問 StarShake 遊戲...');
      await page.goto('http://localhost:3000/games/starshake-game/dist/index.html', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 2. 等待遊戲載入
      console.log('⏳ 等待 StarShake 遊戲載入...');
      await page.waitForTimeout(8000);

      // 3. 等待遊戲完全載入（直接在頁面中，不是 iframe）
      console.log('⏳ 等待遊戲內容載入...');
      await page.waitForTimeout(5000);

      // 4. 尋找全螢幕按鈕（直接在頁面中）
      console.log('🔍 尋找遊戲內全螢幕按鈕...');

      const fullscreenSelectors = [
        'button:has-text("⛶")',
        '.fullscreen-btn',
        '[title*="全螢幕"]',
        '[onclick*="fullscreen"]',
        'button[class*="fullscreen"]',
        'canvas + div button', // 可能在 canvas 旁邊
        'div[style*="position"] button' // 可能在定位的 div 中
      ];

      let fullscreenBtn = null;
      for (const selector of fullscreenSelectors) {
        try {
          fullscreenBtn = await page.locator(selector).first();
          if (await fullscreenBtn.isVisible({ timeout: 3000 })) {
            console.log(`✅ 找到全螢幕按鈕: ${selector}`);
            break;
          }
        } catch (e) {
          console.log(`❌ 全螢幕按鈕選擇器無效: ${selector}`);
        }
      }

      if (!fullscreenBtn || !(await fullscreenBtn.isVisible())) {
        console.log('⚠️ 未找到全螢幕按鈕，截圖調試');
        await page.screenshot({
          path: 'test-results/starshake-game-debug.png',
          fullPage: true
        });

        // 嘗試查看頁面內容
        const pageContent = await page.content();
        console.log('頁面內容片段:', pageContent.substring(0, 2000));

        throw new Error('找不到遊戲內全螢幕按鈕');
      }

      // 5. 測試全螢幕功能
      console.log('🎮 測試全螢幕進入功能...');

      // 監聽 console 消息
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push(msg.text());
        console.log('Console:', msg.text());
      });

      // 點擊全螢幕按鈕
      await fullscreenBtn.click();
      
      // 等待全螢幕處理
      await page.waitForTimeout(2000);

      // 10. 驗證全螢幕狀態
      console.log('✅ 驗證全螢幕狀態...');
      
      // 檢查是否有相關的 console 消息
      const hasFullscreenMessages = consoleMessages.some(msg => 
        msg.includes('全螢幕') || 
        msg.includes('DUAL_FULLSCREEN') ||
        msg.includes('CSS_FULLSCREEN')
      );

      if (hasFullscreenMessages) {
        console.log('✅ 檢測到全螢幕相關消息');
      } else {
        console.log('⚠️ 未檢測到全螢幕相關消息');
      }

      // 11. 測試退出全螢幕
      console.log('🔄 測試全螢幕退出功能...');
      await page.waitForTimeout(1000);
      await fullscreenBtn.click();
      await page.waitForTimeout(2000);

      // 12. 檢查是否有無限循環
      console.log('🔍 檢查是否存在無限循環...');
      
      const rapidMessages = consoleMessages.filter(msg => 
        msg.includes('全螢幕') || msg.includes('FULLSCREEN')
      );

      if (rapidMessages.length > 10) {
        console.log('⚠️ 檢測到可能的無限循環:', rapidMessages.length, '條消息');
        console.log('最近的消息:', rapidMessages.slice(-5));
      } else {
        console.log('✅ 未檢測到無限循環問題');
      }

      // 13. 最終截圖
      await page.screenshot({ 
        path: 'test-results/gameswitcher-fullscreen-final.png',
        fullPage: true 
      });

      console.log('🎉 GameSwitcher StarShake 全螢幕測試完成');

    } catch (error) {
      console.error('❌ 測試失敗:', error.message);
      
      // 錯誤截圖
      await page.screenshot({ 
        path: 'test-results/gameswitcher-fullscreen-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });
});
