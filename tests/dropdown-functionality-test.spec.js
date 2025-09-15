const { test, expect } = require('@playwright/test');

test.describe('Dropdown Functionality Test', () => {
  test('Verify dropdown opens and shows game options', async ({ page }) => {
    console.log('🎯 開始下拉功能測試...');

    // 監聽 console 錯誤
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      console.log(`🖥️ Console ${msg.type()}: ${msg.text()}`);
    });

    // 監聽頁面錯誤
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.log(`❌ 頁面錯誤: ${error.message}`);
    });

    // 導航到頁面
    await page.goto('http://localhost:3000/games/switcher');
    console.log('✅ 頁面已載入');
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 截圖初始狀態
    await page.screenshot({ path: 'test-results/dropdown-test-initial.png', fullPage: true });
    console.log('📸 初始狀態截圖已保存');
    
    // 檢查初始狀態 - 下拉清單應該是隱藏的
    const initialDropdownCount = await page.locator('[data-testid="game-dropdown"], .dropdown-menu').count();
    console.log(`📋 初始下拉清單數量: ${initialDropdownCount}`);
    
    // 檢查切換按鈕是否存在
    const switchButton = page.locator('button:has-text("切換遊戲")');
    const buttonExists = await switchButton.count() > 0;
    console.log(`🔘 切換遊戲按鈕存在: ${buttonExists}`);
    
    if (!buttonExists) {
      console.log('❌ 找不到切換遊戲按鈕，測試終止');
      return;
    }
    
    // 檢查按鈕的可見性和可點擊性
    const isVisible = await switchButton.isVisible();
    const isEnabled = await switchButton.isEnabled();
    console.log(`🔘 按鈕可見: ${isVisible}, 可點擊: ${isEnabled}`);
    
    // 獲取按鈕的詳細信息
    const buttonText = await switchButton.textContent();
    const buttonClass = await switchButton.getAttribute('class');
    console.log(`🔘 按鈕文字: "${buttonText}"`);
    console.log(`🔘 按鈕 class: "${buttonClass}"`);
    
    // 點擊按鈕
    console.log('🖱️ 準備點擊切換遊戲按鈕...');
    await switchButton.click();
    console.log('✅ 已點擊切換遊戲按鈕');
    
    // 等待一下讓 React 狀態更新
    await page.waitForTimeout(1000);
    
    // 截圖點擊後狀態
    await page.screenshot({ path: 'test-results/dropdown-test-after-click.png', fullPage: true });
    console.log('📸 點擊後截圖已保存');
    
    // 檢查下拉清單是否出現
    const afterClickDropdownCount = await page.locator('[data-testid="game-dropdown"], .dropdown-menu').count();
    console.log(`📋 點擊後下拉清單數量: ${afterClickDropdownCount}`);
    
    // 檢查各種可能的下拉選擇器
    const dropdownSelectors = [
      '[data-testid="game-dropdown"]',
      '.dropdown-menu',
      '[class*="dropdown"]',
      '.game-option',
      '.dropdown-item'
    ];
    
    for (const selector of dropdownSelectors) {
      const count = await page.locator(selector).count();
      const visibleCount = await page.locator(selector).locator('visible=true').count();
      console.log(`📋 選擇器 "${selector}": ${count} 個元素, ${visibleCount} 個可見`);
    }
    
    // 檢查是否有任何遊戲選項出現
    const gameOptions = [
      'shimozurdo',
      '飛機遊戲',
      'airplane',
      'game',
      '遊戲'
    ];
    
    console.log('🎮 檢查遊戲選項:');
    for (const option of gameOptions) {
      const count = await page.locator(`text=${option}`).count();
      const visibleCount = await page.locator(`text=${option}`).locator('visible=true').count();
      console.log(`  "${option}": ${count} 個元素, ${visibleCount} 個可見`);
    }
    
    // 檢查頁面 HTML 變化
    const bodyHTML = await page.locator('body').innerHTML();
    const hasDropdownHTML = bodyHTML.includes('dropdown') || bodyHTML.includes('game-option');
    console.log(`📄 頁面 HTML 包含下拉相關內容: ${hasDropdownHTML}`);
    
    // 嘗試再次點擊看是否有反應
    console.log('🖱️ 嘗試再次點擊按鈕...');
    await switchButton.click();
    await page.waitForTimeout(1000);
    
    const secondClickDropdownCount = await page.locator('[data-testid="game-dropdown"], .dropdown-menu').count();
    console.log(`📋 第二次點擊後下拉清單數量: ${secondClickDropdownCount}`);
    
    // 截圖第二次點擊後狀態
    await page.screenshot({ path: 'test-results/dropdown-test-second-click.png', fullPage: true });
    console.log('📸 第二次點擊後截圖已保存');
    
    // 檢查 React 狀態是否有變化
    try {
      const reactState = await page.evaluate(() => {
        // 嘗試找到 React 組件的狀態
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent && button.textContent.includes('切換遊戲')) {
            return {
              buttonFound: true,
              buttonText: button.textContent,
              buttonClass: button.className,
              parentHTML: button.parentElement ? button.parentElement.innerHTML.substring(0, 500) : 'no parent'
            };
          }
        }
        return { buttonFound: false };
      });
      
      console.log('⚛️ React 狀態檢查:', JSON.stringify(reactState, null, 2));
    } catch (error) {
      console.log(`❌ React 狀態檢查失敗: ${error.message}`);
    }
    
    // 輸出錯誤信息
    if (pageErrors.length > 0) {
      console.log('\n🚨 頁面錯誤:');
      pageErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // 最終結論
    const finalDropdownVisible = afterClickDropdownCount > 0 || secondClickDropdownCount > 0;
    console.log(`\n🏁 測試結論:`);
    console.log(`  按鈕存在: ${buttonExists}`);
    console.log(`  按鈕可點擊: ${isEnabled}`);
    console.log(`  下拉清單展開: ${finalDropdownVisible}`);
    console.log(`  頁面錯誤數量: ${pageErrors.length}`);
    
    if (!finalDropdownVisible) {
      console.log('❌ 下拉功能確實沒有正常工作');
    } else {
      console.log('✅ 下拉功能正常工作');
    }
    
    console.log('🏁 下拉功能測試完成');
  });
});
