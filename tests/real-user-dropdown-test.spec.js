const { test, expect } = require('@playwright/test');

test.describe('Real User Dropdown Test', () => {
  test('Test dropdown exactly as user would experience', async ({ page }) => {
    console.log('🎯 開始真實用戶下拉測試...');

    // 設置視窗大小為常見桌面尺寸
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 監聽所有事件
    const events = [];
    page.on('console', msg => {
      events.push(`Console ${msg.type()}: ${msg.text()}`);
      console.log(`🖥️ ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      events.push(`Page Error: ${error.message}`);
      console.log(`❌ 頁面錯誤: ${error.message}`);
    });

    // 導航到頁面
    await page.goto('http://localhost:3000/games/switcher');
    console.log('✅ 頁面已載入');
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 給更多時間
    
    // 截圖初始狀態
    await page.screenshot({ 
      path: 'test-results/real-user-initial.png', 
      fullPage: true 
    });
    console.log('📸 初始狀態截圖已保存');
    
    // 檢查頁面是否正常載入
    const pageTitle = await page.title();
    console.log(`📄 頁面標題: ${pageTitle}`);
    
    // 檢查是否有 React 錯誤
    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('Application error') || bodyText.includes('Something went wrong')) {
      console.log('❌ 檢測到 React 錯誤');
      return;
    }
    
    // 尋找切換遊戲按鈕 - 使用多種方法
    console.log('🔍 尋找切換遊戲按鈕...');
    
    const buttonSelectors = [
      'button:has-text("切換遊戲")',
      'button[class*="bg-blue-600"]:has-text("切換遊戲")',
      '[role="button"]:has-text("切換遊戲")',
      'text=切換遊戲'
    ];
    
    let switchButton = null;
    let workingSelector = null;
    
    for (const selector of buttonSelectors) {
      try {
        const element = page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.isVisible();
          console.log(`🔍 選擇器 "${selector}": ${count} 個, 可見: ${isVisible}`);
          if (isVisible) {
            switchButton = element;
            workingSelector = selector;
            break;
          }
        }
      } catch (error) {
        console.log(`❌ 選擇器 "${selector}" 失敗: ${error.message}`);
      }
    }
    
    if (!switchButton) {
      console.log('❌ 找不到切換遊戲按鈕');
      
      // 列出所有按鈕
      const allButtons = await page.locator('button').all();
      console.log(`🔍 頁面上所有按鈕 (${allButtons.length} 個):`);
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        try {
          const text = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          console.log(`  按鈕 ${i + 1}: "${text}" (可見: ${isVisible})`);
        } catch (e) {
          console.log(`  按鈕 ${i + 1}: 無法讀取`);
        }
      }
      return;
    }
    
    console.log(`✅ 找到切換遊戲按鈕，使用選擇器: ${workingSelector}`);
    
    // 檢查按鈕狀態
    const buttonText = await switchButton.textContent();
    const isEnabled = await switchButton.isEnabled();
    const boundingBox = await switchButton.boundingBox();
    
    console.log(`🔘 按鈕文字: "${buttonText}"`);
    console.log(`🔘 按鈕可點擊: ${isEnabled}`);
    console.log(`🔘 按鈕位置: ${JSON.stringify(boundingBox)}`);
    
    // 檢查初始下拉狀態
    const initialDropdowns = await page.locator('.dropdown-menu, [data-testid="game-dropdown"]').count();
    console.log(`📋 初始下拉清單數量: ${initialDropdowns}`);
    
    // 模擬真實用戶點擊 - 移動到按鈕中心再點擊
    console.log('🖱️ 模擬真實用戶點擊...');
    if (boundingBox) {
      const centerX = boundingBox.x + boundingBox.width / 2;
      const centerY = boundingBox.y + boundingBox.height / 2;
      
      // 先移動鼠標到按鈕上
      await page.mouse.move(centerX, centerY);
      await page.waitForTimeout(500);
      
      // 點擊
      await page.mouse.click(centerX, centerY);
      console.log(`✅ 點擊位置: (${centerX}, ${centerY})`);
    } else {
      // 備用方法
      await switchButton.click();
      console.log('✅ 使用備用點擊方法');
    }
    
    // 等待 React 狀態更新
    await page.waitForTimeout(2000);
    
    // 截圖點擊後狀態
    await page.screenshot({ 
      path: 'test-results/real-user-after-click.png', 
      fullPage: true 
    });
    console.log('📸 點擊後截圖已保存');
    
    // 檢查下拉清單是否出現
    const afterClickDropdowns = await page.locator('.dropdown-menu, [data-testid="game-dropdown"]').count();
    console.log(`📋 點擊後下拉清單數量: ${afterClickDropdowns}`);
    
    // 檢查可見的下拉清單
    const visibleDropdowns = await page.locator('.dropdown-menu:visible, [data-testid="game-dropdown"]:visible').count();
    console.log(`📋 可見的下拉清單數量: ${visibleDropdowns}`);
    
    // 如果沒有下拉清單，檢查可能的原因
    if (afterClickDropdowns === 0) {
      console.log('❌ 沒有找到下拉清單，檢查可能原因...');
      
      // 檢查是否有 JavaScript 錯誤
      console.log(`🚨 事件記錄 (${events.length} 個):`);
      events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event}`);
      });
      
      // 檢查 React 組件狀態
      try {
        const componentState = await page.evaluate(() => {
          // 檢查是否有 React DevTools
          const hasReactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
          
          // 檢查按鈕的 onClick 事件
          const buttons = document.querySelectorAll('button');
          let switchGameButton = null;
          for (const btn of buttons) {
            if (btn.textContent && btn.textContent.includes('切換遊戲')) {
              switchGameButton = btn;
              break;
            }
          }
          
          return {
            hasReactDevTools: !!hasReactDevTools,
            buttonFound: !!switchGameButton,
            buttonHasOnClick: switchGameButton ? !!switchGameButton.onclick : false,
            buttonEventListeners: switchGameButton ? getEventListeners ? getEventListeners(switchGameButton) : 'getEventListeners not available' : null
          };
        });
        
        console.log('⚛️ React 組件狀態:', JSON.stringify(componentState, null, 2));
      } catch (error) {
        console.log(`❌ 無法檢查 React 狀態: ${error.message}`);
      }
    } else {
      console.log('✅ 找到下拉清單！');
      
      // 檢查下拉清單內容
      const dropdownItems = await page.locator('.dropdown-item, .game-option').count();
      console.log(`📋 下拉選項數量: ${dropdownItems}`);
      
      // 檢查是否有 shimozurdo
      const shimozurdoCount = await page.locator('text=shimozurdo').count();
      console.log(`🎯 shimozurdo 選項數量: ${shimozurdoCount}`);
      
      if (shimozurdoCount > 0) {
        console.log('✅ 找到 shimozurdo 選項！');
      } else {
        console.log('❌ 沒有找到 shimozurdo 選項');
      }
    }
    
    // 最終結論
    const dropdownWorking = afterClickDropdowns > 0;
    console.log(`\n🏁 真實用戶測試結論:`);
    console.log(`  按鈕找到: ${!!switchButton}`);
    console.log(`  按鈕可點擊: ${isEnabled}`);
    console.log(`  下拉清單展開: ${dropdownWorking}`);
    console.log(`  事件錯誤數量: ${events.filter(e => e.includes('Error')).length}`);
    
    if (!dropdownWorking) {
      console.log('❌ 下拉功能確實失敗 - 與用戶體驗一致');
    } else {
      console.log('✅ 下拉功能正常 - 可能是環境差異');
    }
    
    console.log('🏁 真實用戶下拉測試完成');
  });
});
