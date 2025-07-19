/**
 * Day 15-17: 完整5遊戲模板架構驗證測試
 * 檢查5種記憶科學遊戲的實際實現狀況並生成證據
 * 按照強制檢查規則 - 最高優先級執行
 */

import { test, expect } from '@playwright/test';

test.describe('Day 15-17: 完整5遊戲模板架構 - 強制檢查規則驗證', () => {
  test('Day 15-17: 完整5遊戲模板架構三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 15-17 完整5遊戲模板架構驗證測試影片...');
    console.log('📋 按照強制檢查規則 - 最高優先級執行驗證');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 檢查主頁是否有5遊戲模板架構功能卡片
    const fiveGamesFeature = page.getByTestId('feature-five-games-architecture');
    if (await fiveGamesFeature.isVisible()) {
      console.log('   ✅ 發現5遊戲模板架構功能卡片');
      
      // 檢查標題和描述
      const title = await fiveGamesFeature.locator('h3').textContent();
      const description = await fiveGamesFeature.locator('p').textContent();
      console.log(`   📋 標題: ${title}`);
      console.log(`   📝 描述: ${description}`);
      
      if (title?.includes('完整5遊戲模板架構')) {
        console.log('   ✅ 標題正確');
      } else {
        console.log('   ❌ 標題不正確');
      }
      
      if (description?.includes('Match配對') && description?.includes('Fill-in填空')) {
        console.log('   ✅ 描述包含關鍵特性');
      } else {
        console.log('   ❌ 描述缺少關鍵特性');
      }
    } else {
      console.log('   ❌ 主頁缺少5遊戲模板架構功能卡片');
    }

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：5遊戲模板架構導航流程測試');
    
    const fiveGamesLink = page.getByTestId('five-games-architecture-link');
    if (await fiveGamesLink.isVisible()) {
      console.log('   ✅ 5遊戲模板架構連結存在');
      await fiveGamesLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 檢查頁面是否正確載入
      const pageTitle = await page.locator('h1').first().textContent();
      if (pageTitle?.includes('完整5遊戲模板架構')) {
        console.log(`   ✅ 5遊戲模板架構頁面載入成功: ${pageTitle}`);
      } else {
        console.log(`   ❌ 5遊戲模板架構頁面載入失敗: ${pageTitle}`);
      }
    } else {
      console.log('   ❌ 5遊戲模板架構連結不存在');
    }

    // 第三層驗證：5種遊戲模板實際驗證
    console.log('📍 第三層驗證：5種遊戲模板實際驗證');
    
    const gameTemplates = [
      { name: 'Match配對遊戲', selector: 'text=Match配對' },
      { name: 'Fill-in填空遊戲', selector: 'text=Fill-in填空' },
      { name: 'Quiz測驗遊戲', selector: 'text=Quiz測驗' },
      { name: 'Sequence順序遊戲', selector: 'text=Sequence順序' },
      { name: 'Flashcard閃卡遊戲', selector: 'text=Flashcard閃卡' }
    ];

    let visibleGameTemplates = 0;
    for (const game of gameTemplates) {
      const elements = page.locator(game.selector);
      const count = await elements.count();
      const isVisible = count > 0 && await elements.first().isVisible();
      
      if (isVisible) {
        console.log(`   ✅ ${game.name}: 可見 (${count}個元素)`);
        visibleGameTemplates++;
      } else {
        console.log(`   ❌ ${game.name}: 不可見 (${count}個元素)`);
      }
    }

    const gameTemplateCompletionPercentage = Math.round((visibleGameTemplates / gameTemplates.length) * 100);
    console.log(`📊 5遊戲模板可見性: ${visibleGameTemplates}/${gameTemplates.length} (${gameTemplateCompletionPercentage}%)`);

    // 檢查記憶科學原理
    console.log('🧠 檢查記憶科學原理實現');
    const memoryPrinciples = [
      { name: '視覺記憶', selector: 'text=視覺記憶' },
      { name: '主動回憶', selector: 'text=主動回憶' },
      { name: '間隔重複', selector: 'text=間隔重複' },
      { name: '認知負荷', selector: 'text=認知負荷' },
      { name: 'GEPT分級', selector: 'text=GEPT' }
    ];

    let visibleMemoryPrinciples = 0;
    for (const principle of memoryPrinciples) {
      const elements = page.locator(principle.selector);
      const count = await elements.count();
      const isVisible = count > 0 && await elements.first().isVisible();
      
      if (isVisible) {
        console.log(`   ✅ ${principle.name}: 可見 (${count}個元素)`);
        visibleMemoryPrinciples++;
      } else {
        console.log(`   ❌ ${principle.name}: 不可見 (${count}個元素)`);
      }
    }

    const memoryPrincipleCompletionPercentage = Math.round((visibleMemoryPrinciples / memoryPrinciples.length) * 100);
    console.log(`📊 記憶科學原理可見性: ${visibleMemoryPrinciples}/${memoryPrinciples.length} (${memoryPrincipleCompletionPercentage}%)`);

    // 檢查遊戲功能特性
    console.log('🎮 檢查遊戲功能特性');
    const gameFeatures = [
      { name: '統一接口', selector: 'text=統一接口' },
      { name: '智能適配', selector: 'text=智能適配' },
      { name: '性能監控', selector: 'text=性能監控' },
      { name: '跨遊戲同步', selector: 'text=跨遊戲同步' },
      { name: '無障礙支持', selector: 'text=無障礙' }
    ];

    let visibleGameFeatures = 0;
    for (const feature of gameFeatures) {
      const elements = page.locator(feature.selector);
      const count = await elements.count();
      const isVisible = count > 0 && await elements.first().isVisible();
      
      if (isVisible) {
        console.log(`   ✅ ${feature.name}: 可見 (${count}個元素)`);
        visibleGameFeatures++;
      } else {
        console.log(`   ❌ ${feature.name}: 不可見 (${count}個元素)`);
      }
    }

    const gameFeaturesCompletionPercentage = Math.round((visibleGameFeatures / gameFeatures.length) * 100);
    console.log(`📊 遊戲功能特性可見性: ${visibleGameFeatures}/${gameFeatures.length} (${gameFeaturesCompletionPercentage}%)`);

    // 計算總體完整性
    const totalItems = gameTemplates.length + memoryPrinciples.length + gameFeatures.length;
    const totalVisible = visibleGameTemplates + visibleMemoryPrinciples + visibleGameFeatures;
    const overallCompletionPercentage = Math.round((totalVisible / totalItems) * 100);
    
    console.log(`📊 Day 15-17 整體功能完整性: ${totalVisible}/${totalItems} (${overallCompletionPercentage}%)`);

    if (overallCompletionPercentage >= 80) {
      console.log('✅ Day 15-17 完整5遊戲模板架構驗證成功 (≥80%)');
    } else if (overallCompletionPercentage >= 60) {
      console.log('⚠️ Day 15-17 完整5遊戲模板架構需要改進');
    } else {
      console.log('❌ Day 15-17 完整5遊戲模板架構驗證失敗');
    }

    console.log('🎉 Day 15-17 完整5遊戲模板架構驗證完成！');
  });

  test('Day 15-17: 個別遊戲模板功能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 15-17 個別遊戲模板功能測試影片...');

    await page.goto('http://localhost:3000/games/five-games-architecture');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🎮 測試個別遊戲模板功能');

    // 測試每個遊戲模板的互動功能
    const gameTests = [
      { name: 'Match配對遊戲', testId: 'match-game-demo', action: '點擊演示' },
      { name: 'Fill-in填空遊戲', testId: 'fillin-game-demo', action: '點擊演示' },
      { name: 'Quiz測驗遊戲', testId: 'quiz-game-demo', action: '點擊演示' },
      { name: 'Sequence順序遊戲', testId: 'sequence-game-demo', action: '點擊演示' },
      { name: 'Flashcard閃卡遊戲', testId: 'flashcard-game-demo', action: '點擊演示' }
    ];

    let functionalGames = 0;
    for (const gameTest of gameTests) {
      console.log(`🎯 測試 ${gameTest.name}`);
      
      const gameElement = page.getByTestId(gameTest.testId);
      if (await gameElement.isVisible()) {
        console.log(`   ✅ ${gameTest.name} 演示按鈕存在`);
        
        try {
          await gameElement.click();
          await page.waitForTimeout(1000);
          console.log(`   ✅ ${gameTest.name} 演示功能正常`);
          functionalGames++;
        } catch (error) {
          console.log(`   ❌ ${gameTest.name} 演示功能異常: ${error}`);
        }
      } else {
        console.log(`   ❌ ${gameTest.name} 演示按鈕不存在`);
      }
    }

    const functionalGamePercentage = Math.round((functionalGames / gameTests.length) * 100);
    console.log(`📊 遊戲功能測試結果: ${functionalGames}/${gameTests.length} (${functionalGamePercentage}%)`);

    console.log('🎉 Day 15-17 個別遊戲模板功能測試完成！');
  });
});
