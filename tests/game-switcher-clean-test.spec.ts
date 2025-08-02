import { test, expect } from '@playwright/test';

test('GameSwitcher 清理測試 - 只顯示已完成遊戲', async ({ page }) => {
  console.log('🔍 開始測試 GameSwitcher 清理後的狀態');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3000/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：清理後的 GameSwitcher
  await page.screenshot({ 
    path: 'test-results/game-switcher-clean-full.png',
    fullPage: true
  });

  // 等待 GameSwitcher 載入
  await page.waitForTimeout(5000);

  // 檢查是否有 GameSwitcher 按鈕
  const gameSwitcherButton = await page.locator('button:has-text("切換遊戲")').count();
  console.log(`🎮 GameSwitcher 按鈕數量: ${gameSwitcherButton}`);

  if (gameSwitcherButton > 0) {
    // 點擊 GameSwitcher 按鈕打開下拉選單
    await page.locator('button:has-text("切換遊戲")').first().click();
    await page.waitForTimeout(1000);

    // 截圖：打開的下拉選單
    await page.screenshot({ 
      path: 'test-results/game-switcher-dropdown-clean.png',
      fullPage: true
    });

    // 檢查下拉選單中的遊戲選項
    const gameOptions = await page.locator('[role="button"]:has-text("飛機")').count();
    console.log(`🎯 飛機遊戲選項數量: ${gameOptions}`);

    // 檢查是否還有開發中遊戲的文字
    const developmentText = await page.locator('text=開發中').count();
    console.log(`🚧 "開發中" 文字數量: ${developmentText}`);

    // 檢查是否有配對遊戲、問答遊戲等開發中的遊戲
    const matchingGame = await page.locator('text=配對遊戲').count();
    const quizGame = await page.locator('text=問答遊戲').count();
    const sequenceGame = await page.locator('text=序列遊戲').count();
    const flashcardGame = await page.locator('text=閃卡遊戲').count();

    console.log(`🃏 配對遊戲顯示數量: ${matchingGame}`);
    console.log(`❓ 問答遊戲顯示數量: ${quizGame}`);
    console.log(`🔢 序列遊戲顯示數量: ${sequenceGame}`);
    console.log(`📚 閃卡遊戲顯示數量: ${flashcardGame}`);

    // 檢查可用的遊戲選項
    const availableGamesList = await page.evaluate(() => {
      const gameButtons = Array.from(document.querySelectorAll('button[class*="w-full text-left"]'));
      return gameButtons.map(button => {
        const nameElement = button.querySelector('.font-medium');
        return nameElement ? nameElement.textContent : '';
      }).filter(name => name);
    });

    console.log('📋 可用遊戲列表:', availableGamesList);

    // 驗證清理結果
    const cleanResults = {
      hasGameSwitcher: gameSwitcherButton > 0,
      noDevelopmentText: developmentText === 0,
      noMatchingGame: matchingGame === 0,
      noQuizGame: quizGame === 0,
      noSequenceGame: sequenceGame === 0,
      noFlashcardGame: flashcardGame === 0,
      onlyAirplaneGames: availableGamesList.every(name => name.includes('飛機'))
    };

    console.log('📊 清理結果驗證:', JSON.stringify(cleanResults, null, 2));

    const allClean = cleanResults.hasGameSwitcher &&
                     cleanResults.noDevelopmentText &&
                     cleanResults.noMatchingGame &&
                     cleanResults.noQuizGame &&
                     cleanResults.noSequenceGame &&
                     cleanResults.noFlashcardGame;

    console.log(`✅ GameSwitcher 清理測試: ${allClean ? '成功' : '失敗'}`);

    // 關閉下拉選單
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } else {
    console.log('⚠️ 未找到 GameSwitcher 按鈕');
  }

  // 最終截圖
  await page.screenshot({ 
    path: 'test-results/game-switcher-clean-final.png',
    fullPage: true
  });

  console.log('✅ GameSwitcher 清理測試完成');
});
