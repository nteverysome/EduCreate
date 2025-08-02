import { test, expect } from '@playwright/test';

test('重複 UI 元素分析測試', async ({ page }) => {
  console.log('🔍 開始分析重複 UI 元素問題');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3002/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：重複 UI 問題
  await page.screenshot({ 
    path: 'test-results/duplicate-ui-analysis-full.png',
    fullPage: true
  });

  // 分析重複的 UI 元素
  console.log('📊 分析重複的 UI 元素...');

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

  // 檢查錯誤提示
  const errorMessages = await page.locator('.error, [class*="error"]').count();
  console.log(`❌ 錯誤提示數量: ${errorMessages}`);

  // 獲取所有按鈕的詳細信息
  const allButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map((button, index) => ({
      index: index + 1,
      text: button.textContent?.trim() || '',
      className: button.className,
      id: button.id || 'no-id',
      disabled: button.disabled,
      visible: button.offsetWidth > 0 && button.offsetHeight > 0
    }));
  });

  console.log('🔍 所有按鈕詳細信息:');
  allButtons.forEach(button => {
    if (button.text.includes('開始遊戲') || button.text.includes('切換遊戲')) {
      console.log(`  ${button.index}. "${button.text}" - ${button.visible ? '可見' : '隱藏'} - ${button.disabled ? '禁用' : '啟用'}`);
    }
  });

  // 檢查頁面結構
  const pageStructure = await page.evaluate(() => {
    const findGameSwitchers = (element: Element, path: string = ''): any[] => {
      const results: any[] = [];
      
      // 檢查當前元素
      if (element.textContent?.includes('切換遊戲') || element.textContent?.includes('開始遊戲')) {
        results.push({
          path: path,
          tagName: element.tagName,
          className: element.className,
          textContent: element.textContent?.substring(0, 50) + '...'
        });
      }
      
      // 遞歸檢查子元素
      Array.from(element.children).forEach((child, index) => {
        results.push(...findGameSwitchers(child, `${path} > ${child.tagName}[${index}]`));
      });
      
      return results;
    };
    
    return findGameSwitchers(document.body, 'BODY');
  });

  console.log('🏗️ 頁面結構中的遊戲相關元素:');
  pageStructure.forEach((item, index) => {
    if (item.textContent.includes('切換遊戲') || item.textContent.includes('開始遊戲')) {
      console.log(`  ${index + 1}. ${item.path}: ${item.textContent}`);
    }
  });

  // 分析問題原因
  const duplicateAnalysis = {
    multipleStartButtons: startGameButtons > 1,
    multipleSwitchButtons: switchGameButtons > 1,
    multipleGameTitles: gameTitles > 1,
    multipleGeptDisplays: geptLevelDisplays > 1,
    multipleGameStatus: gameStatusDisplays > 1,
    hasErrors: errorMessages > 0
  };

  console.log('📊 重複問題分析結果:', JSON.stringify(duplicateAnalysis, null, 2));

  // 推測問題原因
  let problemCause = '';
  if (duplicateAnalysis.multipleStartButtons && duplicateAnalysis.multipleSwitchButtons) {
    problemCause = '頁面層級和組件層級都有遊戲控制元素';
  } else if (duplicateAnalysis.multipleStartButtons) {
    problemCause = '多個開始遊戲按鈕，可能是組件重複渲染';
  } else if (duplicateAnalysis.multipleSwitchButtons) {
    problemCause = '多個切換遊戲按鈕，可能是 GameSwitcher 重複載入';
  }

  console.log(`🔍 推測問題原因: ${problemCause}`);

  // 最終截圖
  await page.screenshot({ 
    path: 'test-results/duplicate-ui-analysis-final.png',
    fullPage: true
  });

  console.log('✅ 重複 UI 元素分析完成');
});
