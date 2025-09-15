const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo Simple Click Test', () => {
  test('Simple shimozurdo selection test', async ({ page }) => {
    console.log('🎯 開始簡單 shimozurdo 選擇測試...');

    // 導航到頁面
    await page.goto('http://localhost:3000/games/switcher');
    console.log('✅ 頁面已載入');
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 截圖初始狀態
    await page.screenshot({ path: 'test-results/shimozurdo-simple-initial.png', fullPage: true });
    console.log('📸 初始狀態截圖已保存');
    
    // 點擊切換遊戲按鈕
    const switchButton = page.locator('button:has-text("切換遊戲")');
    await switchButton.click();
    console.log('✅ 點擊切換遊戲按鈕');
    
    // 等待下拉清單出現
    await page.waitForTimeout(1000);
    
    // 截圖下拉清單狀態
    await page.screenshot({ path: 'test-results/shimozurdo-simple-dropdown.png', fullPage: true });
    console.log('📸 下拉清單截圖已保存');
    
    // 尋找所有包含 shimozurdo 的元素
    const shimozurdoElements = await page.locator('text=shimozurdo').all();
    console.log(`🔍 找到 ${shimozurdoElements.length} 個 shimozurdo 元素`);
    
    for (let i = 0; i < shimozurdoElements.length; i++) {
      const text = await shimozurdoElements[i].textContent();
      const isVisible = await shimozurdoElements[i].isVisible();
      console.log(`  元素 ${i + 1}: "${text}" (可見: ${isVisible})`);
    }
    
    // 嘗試不同的選擇器來點擊 shimozurdo
    const selectors = [
      'text=shimozurdo',
      'button:has-text("shimozurdo")',
      '[class*="dropdown"]:has-text("shimozurdo")',
      '.dropdown-item:has-text("shimozurdo")'
    ];
    
    let clickSuccess = false;
    
    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        const count = await element.count();
        
        if (count > 0) {
          console.log(`🎯 嘗試選擇器: ${selector}`);
          const isVisible = await element.isVisible();
          console.log(`  可見性: ${isVisible}`);
          
          if (isVisible) {
            // 嘗試點擊
            await element.click({ timeout: 5000 });
            console.log(`✅ 成功點擊 shimozurdo (選擇器: ${selector})`);
            clickSuccess = true;
            break;
          }
        }
      } catch (error) {
        console.log(`❌ 選擇器 ${selector} 失敗: ${error.message}`);
      }
    }
    
    if (!clickSuccess) {
      console.log('⚠️ 所有選擇器都失敗，嘗試 JavaScript 點擊');
      
      // 使用 JavaScript 直接點擊
      try {
        await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          for (const element of elements) {
            if (element.textContent && element.textContent.includes('shimozurdo')) {
              console.log('找到 shimozurdo 元素:', element);
              if (element.click) {
                element.click();
                console.log('JavaScript 點擊成功');
                return true;
              }
            }
          }
          return false;
        });
        console.log('✅ JavaScript 點擊嘗試完成');
      } catch (jsError) {
        console.log(`❌ JavaScript 點擊失敗: ${jsError.message}`);
      }
    }
    
    // 等待遊戲切換
    await page.waitForTimeout(3000);
    
    // 截圖最終狀態
    await page.screenshot({ path: 'test-results/shimozurdo-simple-final.png', fullPage: true });
    console.log('📸 最終狀態截圖已保存');
    
    // 檢查是否成功切換到 shimozurdo
    const currentGameText = await page.locator('body').textContent();
    const hasShimozurdoGame = currentGameText.includes('shimozurdo') || currentGameText.includes('Shimozurdo');
    console.log(`🎮 是否切換到 shimozurdo: ${hasShimozurdoGame}`);
    
    // 檢查 iframe 是否載入了 shimozurdo 遊戲
    const iframes = await page.locator('iframe').all();
    console.log(`🖼️ 找到 ${iframes.length} 個 iframe`);
    
    for (let i = 0; i < iframes.length; i++) {
      try {
        const src = await iframes[i].getAttribute('src');
        console.log(`  iframe ${i + 1} src: ${src}`);
        
        if (src && src.includes('shimozurdo')) {
          console.log('✅ 找到 shimozurdo iframe！');
          
          // 等待 iframe 載入
          await page.waitForTimeout(2000);
          
          // 檢查 iframe 內容
          try {
            const frame = await iframes[i].contentFrame();
            if (frame) {
              const frameTitle = await frame.title();
              console.log(`  iframe 標題: ${frameTitle}`);
            }
          } catch (frameError) {
            console.log(`  無法訪問 iframe 內容: ${frameError.message}`);
          }
        }
      } catch (error) {
        console.log(`  iframe ${i + 1} 檢查失敗: ${error.message}`);
      }
    }
    
    console.log('🏁 簡單 shimozurdo 選擇測試完成');
  });
});
