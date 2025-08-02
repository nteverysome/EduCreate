import { test, expect } from '@playwright/test';

test('修正後頁面截圖分析', async ({ page }) => {
  console.log('📸 開始截圖分析修正後的頁面');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3002/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：修正後的完整頁面
  await page.screenshot({ 
    path: 'test-results/fixed-ui-full-page.png',
    fullPage: true
  });

  // 等待 GameSwitcher 載入
  await page.waitForTimeout(5000);

  // 截圖：等待後的頁面
  await page.screenshot({ 
    path: 'test-results/fixed-ui-after-wait.png',
    fullPage: true
  });

  // 分析修正後的 UI 元素
  console.log('🔍 分析修正後的 UI 元素...');

  // 檢查 "開始遊戲" 按鈕數量
  const startGameButtons = await page.locator('button:has-text("開始遊戲")').count();
  console.log(`🎮 "開始遊戲" 按鈕數量: ${startGameButtons}`);

  // 檢查 "切換遊戲" 按鈕數量
  const switchGameButtons = await page.locator('button:has-text("切換遊戲")').count();
  console.log(`🔄 "切換遊戲" 按鈕數量: ${switchGameButtons}`);

  // 檢查 "飛機碰撞遊戲" 標題數量
  const gameTitles = await page.locator('text=飛機碰撞遊戲').count();
  console.log(`📝 "飛機碰撞遊戲" 標題數量: ${gameTitles}`);

  // 檢查 GEPT 等級顯示數量
  const geptLevelDisplays = await page.locator('text=GEPT 等級:').count();
  console.log(`📚 "GEPT 等級:" 顯示數量: ${geptLevelDisplays}`);

  // 檢查遊戲狀態顯示數量
  const gameStatusDisplays = await page.locator('text=遊戲狀態:').count();
  console.log(`📊 "遊戲狀態:" 顯示數量: ${gameStatusDisplays}`);

  // 檢查是否有 GameSwitcher
  const gameSwitcherExists = await page.locator('[data-testid*="game-switcher"], .game-switcher').count();
  console.log(`🎛️ GameSwitcher 組件數量: ${gameSwitcherExists}`);

  // 檢查頁面內容
  const pageContent = await page.content();
  const hasGameSwitcherInHTML = pageContent.includes('GameSwitcher') || pageContent.includes('切換遊戲');
  console.log(`📄 HTML 中包含 GameSwitcher: ${hasGameSwitcherInHTML}`);

  // 檢查載入狀態
  const loadingText = await page.locator('text=載入完整版 Airplane 遊戲中...').count();
  console.log(`⏳ 載入文字數量: ${loadingText}`);

  // 檢查錯誤提示
  const errorMessages = await page.locator('.error, [class*="error"]').count();
  console.log(`❌ 錯誤提示數量: ${errorMessages}`);

  // 獲取頁面的主要區塊結構
  const pageStructure = await page.evaluate(() => {
    const mainContainer = document.querySelector('.bg-white.rounded-xl.shadow-lg');
    if (mainContainer) {
      const children = Array.from(mainContainer.children);
      return children.map((child, index) => ({
        index: index + 1,
        className: child.className,
        textContent: child.textContent?.substring(0, 100) + '...',
        hasButtons: child.querySelectorAll('button').length,
        buttonTexts: Array.from(child.querySelectorAll('button')).map(btn => btn.textContent?.trim())
      }));
    }
    return [];
  });

  console.log('🏗️ 主要容器結構:');
  pageStructure.forEach(block => {
    console.log(`  區塊 ${block.index}: ${block.hasButtons} 個按鈕 - ${block.buttonTexts.join(', ')}`);
  });

  // 修正效果分析
  const fixedAnalysis = {
    singleStartButton: startGameButtons <= 1,
    singleSwitchButton: switchGameButtons <= 1,
    noGameStatusDuplication: gameStatusDisplays <= 1,
    noGeptLevelDuplication: geptLevelDisplays <= 1,
    hasGameSwitcher: hasGameSwitcherInHTML,
    noErrors: errorMessages === 0,
    isLoading: loadingText > 0
  };

  console.log('📊 修正效果分析:', JSON.stringify(fixedAnalysis, null, 2));

  // 判斷修正是否成功
  const isFixed = fixedAnalysis.singleStartButton && 
                  fixedAnalysis.singleSwitchButton && 
                  fixedAnalysis.noGameStatusDuplication;

  console.log(`✅ 重複 UI 問題修正狀態: ${isFixed ? '成功' : '仍有問題'}`);

  // 如果有 GameSwitcher，嘗試點擊查看
  if (switchGameButtons > 0) {
    try {
      console.log('🖱️ 嘗試點擊 GameSwitcher');
      await page.locator('button:has-text("切換遊戲")').first().click();
      await page.waitForTimeout(1000);
      
      // 截圖：點擊後的下拉選單
      await page.screenshot({ 
        path: 'test-results/fixed-ui-dropdown.png',
        fullPage: true
      });
      
      console.log('✅ GameSwitcher 點擊成功');
      
      // 關閉下拉選單
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
    } catch (error) {
      console.log('⚠️ GameSwitcher 點擊失敗:', error);
    }
  }

  // 最終截圖
  await page.screenshot({ 
    path: 'test-results/fixed-ui-final-analysis.png',
    fullPage: true
  });

  console.log('📸 修正後頁面截圖分析完成');
});
