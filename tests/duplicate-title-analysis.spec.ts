import { test, expect } from '@playwright/test';

test('重複標題分析測試', async ({ page }) => {
  console.log('🔍 開始分析重複標題問題');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3002/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 截圖：重複標題問題
  await page.screenshot({ 
    path: 'test-results/duplicate-title-analysis-full.png',
    fullPage: true
  });

  // 等待 GameSwitcher 載入
  await page.waitForTimeout(5000);

  // 截圖：等待後的頁面
  await page.screenshot({ 
    path: 'test-results/duplicate-title-after-wait.png',
    fullPage: true
  });

  // 分析重複的標題元素
  console.log('📊 分析重複的標題元素...');

  // 檢查 "Airplane Collision Game" 文字出現次數
  const airplaneGameText = await page.locator('text=Airplane Collision Game').count();
  console.log(`✈️ "Airplane Collision Game" 文字數量: ${airplaneGameText}`);

  // 檢查 "飛機碰撞遊戲" 文字出現次數
  const chineseGameText = await page.locator('text=飛機碰撞遊戲').count();
  console.log(`🎮 "飛機碰撞遊戲" 文字數量: ${chineseGameText}`);

  // 檢查 "飛機遊戲" 相關文字
  const airplaneRelatedText = await page.locator('text*=飛機').count();
  console.log(`🛩️ 包含"飛機"的文字數量: ${airplaneRelatedText}`);

  // 獲取所有標題元素的詳細信息
  const titleElements = await page.evaluate(() => {
    const titles = [];
    
    // 檢查 h1 標題
    const h1Elements = Array.from(document.querySelectorAll('h1'));
    h1Elements.forEach((h1, index) => {
      titles.push({
        type: 'h1',
        index: index + 1,
        text: h1.textContent?.trim() || '',
        className: h1.className
      });
    });
    
    // 檢查 h2 標題
    const h2Elements = Array.from(document.querySelectorAll('h2'));
    h2Elements.forEach((h2, index) => {
      titles.push({
        type: 'h2',
        index: index + 1,
        text: h2.textContent?.trim() || '',
        className: h2.className
      });
    });
    
    // 檢查 h3 標題
    const h3Elements = Array.from(document.querySelectorAll('h3'));
    h3Elements.forEach((h3, index) => {
      titles.push({
        type: 'h3',
        index: index + 1,
        text: h3.textContent?.trim() || '',
        className: h3.className
      });
    });
    
    // 檢查其他可能的遊戲標題
    const gameElements = Array.from(document.querySelectorAll('[class*="font-semibold"], [class*="font-bold"]'));
    gameElements.forEach((element, index) => {
      const text = element.textContent?.trim() || '';
      if (text.includes('飛機') || text.includes('Airplane')) {
        titles.push({
          type: 'other',
          index: index + 1,
          text: text,
          className: element.className,
          tagName: element.tagName
        });
      }
    });
    
    return titles;
  });

  console.log('🏷️ 所有標題元素詳細信息:');
  titleElements.forEach(title => {
    console.log(`  ${title.type.toUpperCase()}[${title.index}]: "${title.text}"`);
  });

  // 檢查頁面結構中的遊戲名稱位置
  const gameNameLocations = await page.evaluate(() => {
    const locations = [];
    
    // 檢查頁面標題區域
    const pageHeader = document.querySelector('.bg-white.shadow-sm.border-b');
    if (pageHeader) {
      const headerText = pageHeader.textContent || '';
      if (headerText.includes('Airplane') || headerText.includes('飛機')) {
        locations.push({
          location: '頁面標題區域',
          text: headerText.substring(0, 100) + '...',
          element: 'header'
        });
      }
    }
    
    // 檢查 GameSwitcher 區域
    const gameSwitcher = document.querySelector('.game-switcher');
    if (gameSwitcher) {
      const switcherText = gameSwitcher.textContent || '';
      if (switcherText.includes('Airplane') || switcherText.includes('飛機')) {
        locations.push({
          location: 'GameSwitcher 區域',
          text: switcherText.substring(0, 100) + '...',
          element: 'game-switcher'
        });
      }
    }
    
    // 檢查遊戲內容區域
    const gameContent = document.querySelector('.airplane-collision-game');
    if (gameContent) {
      const contentText = gameContent.textContent || '';
      if (contentText.includes('Airplane') || contentText.includes('飛機')) {
        locations.push({
          location: '遊戲內容區域',
          text: contentText.substring(0, 100) + '...',
          element: 'game-content'
        });
      }
    }
    
    return locations;
  });

  console.log('📍 遊戲名稱出現位置:');
  gameNameLocations.forEach((location, index) => {
    console.log(`  ${index + 1}. ${location.location}: ${location.text}`);
  });

  // 分析重複問題
  const duplicateAnalysis = {
    hasMultipleAirplaneText: airplaneGameText > 1,
    hasMultipleChineseText: chineseGameText > 1,
    totalAirplaneReferences: airplaneRelatedText,
    titleElementsCount: titleElements.length,
    gameNameLocationsCount: gameNameLocations.length
  };

  console.log('📊 重複標題分析結果:', JSON.stringify(duplicateAnalysis, null, 2));

  // 推測問題原因
  let problemCause = '';
  if (duplicateAnalysis.hasMultipleAirplaneText || duplicateAnalysis.hasMultipleChineseText) {
    problemCause = '頁面標題和 GameSwitcher 都顯示遊戲名稱，造成重複';
  }

  console.log(`🔍 推測問題原因: ${problemCause}`);

  // 最終截圖
  await page.screenshot({ 
    path: 'test-results/duplicate-title-analysis-final.png',
    fullPage: true
  });

  console.log('✅ 重複標題分析完成');
});
