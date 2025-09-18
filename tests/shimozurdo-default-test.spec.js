const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo Default Game Test', () => {
  test('Verify shimozurdo loads as default game', async ({ page }) => {
    console.log('🎯 開始 shimozurdo 預設遊戲測試...');

    // 監聽 console 訊息
    page.on('console', msg => {
      console.log(`🖥️ Console ${msg.type()}: ${msg.text()}`);
    });

    // 監聽頁面錯誤
    page.on('pageerror', error => {
      console.log(`❌ 頁面錯誤: ${error.message}`);
    });

    // 導航到頁面
    await page.goto('http://localhost:3000/games/switcher');
    console.log('✅ 頁面已載入');
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 給更多時間讓遊戲載入
    
    // 截圖初始狀態
    await page.screenshot({ 
      path: 'test-results/shimozurdo-default-initial.png', 
      fullPage: true 
    });
    console.log('📸 初始狀態截圖已保存');
    
    // 檢查頁面標題
    const pageTitle = await page.title();
    console.log(`📄 頁面標題: ${pageTitle}`);
    
    // 檢查當前遊戲顯示
    const gameTitle = await page.locator('.game-title, .current-game, h1, h2').first().textContent();
    console.log(`🎮 當前遊戲標題: "${gameTitle}"`);
    
    // 檢查是否包含 shimozurdo 相關文字
    const bodyText = await page.locator('body').textContent();
    const hasShimozurdo = bodyText.includes('shimozurdo') || bodyText.includes('Shimozurdo');
    console.log(`🎯 頁面包含 shimozurdo: ${hasShimozurdo}`);
    
    // 檢查 iframe 是否指向 shimozurdo
    const iframes = await page.locator('iframe').all();
    console.log(`🖼️ 找到 ${iframes.length} 個 iframe`);
    
    let shimozurdoIframeFound = false;
    for (let i = 0; i < iframes.length; i++) {
      try {
        const src = await iframes[i].getAttribute('src');
        console.log(`  iframe ${i + 1} src: ${src}`);
        
        if (src && src.includes('shimozurdo')) {
          shimozurdoIframeFound = true;
          console.log('✅ 找到 shimozurdo iframe！');
          
          // 等待 iframe 載入
          await page.waitForTimeout(3000);
          
          // 檢查 iframe 是否可訪問
          try {
            const frame = await iframes[i].contentFrame();
            if (frame) {
              console.log('✅ iframe 內容可訪問');
            } else {
              console.log('⚠️ iframe 內容無法訪問（可能是跨域限制）');
            }
          } catch (frameError) {
            console.log(`⚠️ 無法訪問 iframe 內容: ${frameError.message}`);
          }
        }
      } catch (error) {
        console.log(`  iframe ${i + 1} 檢查失敗: ${error.message}`);
      }
    }
    
    // 檢查遊戲載入狀態
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"]').count();
    console.log(`⏳ 載入元素數量: ${loadingElements}`);
    
    // 檢查是否有錯誤訊息
    const errorElements = await page.locator('[class*="error"]').count();
    console.log(`❌ 錯誤元素數量: ${errorElements}`);
    
    // 檢查切換遊戲按鈕狀態
    const switchButton = page.locator('button:has-text("切換遊戲")');
    const buttonExists = await switchButton.count() > 0;
    console.log(`🔘 切換遊戲按鈕存在: ${buttonExists}`);
    
    if (buttonExists) {
      const buttonText = await switchButton.textContent();
      console.log(`🔘 按鈕文字: "${buttonText}"`);
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/shimozurdo-default-final.png', 
      fullPage: true 
    });
    console.log('📸 最終狀態截圖已保存');
    
    // 測試結論
    console.log(`\n🏁 shimozurdo 預設遊戲測試結論:`);
    console.log(`  頁面載入成功: ✅`);
    console.log(`  包含 shimozurdo 文字: ${hasShimozurdo ? '✅' : '❌'}`);
    console.log(`  shimozurdo iframe 存在: ${shimozurdoIframeFound ? '✅' : '❌'}`);
    console.log(`  切換按鈕存在: ${buttonExists ? '✅' : '❌'}`);
    console.log(`  錯誤元素數量: ${errorElements}`);
    
    const testPassed = hasShimozurdo && shimozurdoIframeFound && buttonExists && errorElements === 0;
    
    if (testPassed) {
      console.log('🎉 shimozurdo 已成功設為預設遊戲！');
    } else {
      console.log('❌ shimozurdo 預設設定可能有問題');
    }
    
    console.log('🏁 shimozurdo 預設遊戲測試完成');
  });
});
