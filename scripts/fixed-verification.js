const { chromium } = require('playwright');
const fs = require('fs');

async function fixedVerification() {
  console.log('🔧 修復後驗證開始...');
  
  const results = {
    timestamp: new Date().toISOString(),
    verification_type: 'FIXED_VERIFICATION',
    tests: {},
    overall_success: false
  };
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 測試 1: 主頁載入
    console.log('🧪 測試 1: 主頁載入...');
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    const homeTitle = await page.title();
    results.tests.homepage = { success: true, title: homeTitle };
    await page.screenshot({ path: 'test-results/fixed-01-homepage.png' });
    console.log(`✅ 主頁載入成功: ${homeTitle}`);
    
    // 測試 2: 飛機遊戲頁面載入（修復後）
    console.log('🧪 測試 2: 飛機遊戲頁面載入（修復後）...');
    await page.goto('http://localhost:3001/games/airplane', { waitUntil: 'domcontentloaded' });
    
    // 等待頁面穩定
    await page.waitForTimeout(2000);
    
    const gameTitle = await page.title();
    const titleElement = await page.locator('h1').first().textContent();
    
    results.tests.airplane_page = { 
      success: true, 
      title: gameTitle,
      page_title: titleElement
    };
    
    await page.screenshot({ path: 'test-results/fixed-02-airplane-page.png' });
    console.log(`✅ 飛機遊戲頁面載入成功: ${gameTitle}`);
    console.log(`✅ 頁面標題: ${titleElement}`);
    
    // 測試 3: 遊戲功能測試
    console.log('🧪 測試 3: 遊戲功能測試...');
    
    // 檢查是否有開始遊戲按鈕
    const startButton = page.locator('button:has-text("開始遊戲")');
    const startButtonVisible = await startButton.isVisible();
    
    if (startButtonVisible) {
      console.log('✅ 找到開始遊戲按鈕');
      
      // 點擊開始遊戲
      await startButton.click();
      await page.waitForTimeout(1000);
      
      // 檢查遊戲是否開始
      const questionArea = page.locator('div:has-text("找到對應的英文單字")').first();
      const gameStarted = await questionArea.isVisible();
      
      results.tests.game_functionality = {
        success: gameStarted,
        start_button_visible: startButtonVisible,
        game_started: gameStarted
      };
      
      if (gameStarted) {
        console.log('✅ 遊戲成功開始');
        
        // 檢查選項按鈕
        const optionButtons = page.locator('button').filter({ hasText: /^[a-zA-Z]+$/ });
        const buttonCount = await optionButtons.count();
        
        console.log(`✅ 找到 ${buttonCount} 個選項按鈕`);
        
        // 嘗試點擊一個選項
        if (buttonCount > 0) {
          await optionButtons.first().click();
          await page.waitForTimeout(1000);
          
          // 檢查是否有反饋
          const feedback = page.locator('div').filter({ hasText: /✅|❌/ });
          const feedbackVisible = await feedback.isVisible();
          
          console.log(`✅ 反饋顯示: ${feedbackVisible}`);
          
          results.tests.game_interaction = {
            success: feedbackVisible,
            option_buttons: buttonCount,
            feedback_shown: feedbackVisible
          };
        }
      }
    } else {
      console.log('❌ 未找到開始遊戲按鈕');
      results.tests.game_functionality = {
        success: false,
        start_button_visible: false,
        error: '未找到開始遊戲按鈕'
      };
    }
    
    await page.screenshot({ path: 'test-results/fixed-03-game-functionality.png' });
    
    // 測試 4: 統計功能
    console.log('🧪 測試 4: 統計功能...');
    const statsCards = await page.locator('div:has-text("分數")').count();
    const accuracyCard = await page.locator('div:has-text("準確率")').count();
    
    results.tests.statistics = {
      success: statsCards > 0 && accuracyCard > 0,
      stats_cards: statsCards,
      accuracy_card: accuracyCard
    };
    
    console.log(`✅ 統計卡片: ${statsCards}, 準確率卡片: ${accuracyCard}`);
    
    // 測試 5: 導航測試
    console.log('🧪 測試 5: 導航測試...');
    await page.click('text=返回首頁');
    await page.waitForTimeout(1000);
    
    const finalUrl = page.url();
    const backToHome = finalUrl === 'http://localhost:3001/';
    
    results.tests.navigation = {
      success: backToHome,
      final_url: finalUrl
    };
    
    console.log(`✅ 導航測試: ${backToHome ? '成功' : '失敗'} (${finalUrl})`);
    
    await page.screenshot({ path: 'test-results/fixed-04-navigation.png' });
    
    // 檢查整體成功
    const allTestsSuccess = Object.values(results.tests).every(test => test.success);
    results.overall_success = allTestsSuccess;
    
    console.log(`\n🎉 修復後驗證結果: ${allTestsSuccess ? '完全成功' : '部分成功'}`);
    
  } catch (error) {
    console.log(`❌ 驗證失敗: ${error.message}`);
    results.error = error.message;
    await page.screenshot({ path: 'test-results/fixed-error.png' });
  }
  
  await browser.close();
  
  // 保存報告
  fs.writeFileSync('test-results/fixed-verification-report.json', JSON.stringify(results, null, 2));
  
  console.log('\n📊 修復後驗證總結:');
  console.log('=' * 40);
  Object.entries(results.tests).forEach(([testName, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${testName}: ${result.success ? '通過' : '失敗'}`);
  });
  
  if (results.overall_success) {
    console.log('\n🏆 所有測試通過！遊戲完全可用！');
  } else {
    console.log('\n⚠️ 部分測試通過，需要進一步改進');
  }
  
  return results;
}

fixedVerification().catch(console.error);
