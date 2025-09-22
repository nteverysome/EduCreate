const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 手機橫向全螢幕優化測試', () => {
  test('綜合驗證手機橫向全螢幕模式下的所有優化措施', async ({ page }) => {
    console.log('📱 開始手機橫向全螢幕優化綜合測試');
    
    // 監聽所有日誌和性能數據
    const logs = [];
    const performanceData = [];
    
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`📝 ${text}`);
      
      // 捕獲響應時間數據
      if (text.includes('觸控響應時間:')) {
        const match = text.match(/觸控響應時間: ([\d.]+)ms/);
        if (match) {
          performanceData.push(parseFloat(match[1]));
        }
      }
    });
    
    // 設置 iPhone 14 Pro 橫向全螢幕模式
    await page.setViewportSize({ width: 932, height: 430 });
    console.log('📱 設置手機橫向全螢幕視窗: 932x430');
    
    // 導航到遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('⏳ 等待遊戲完全載入...');
    await page.waitForTimeout(8000);
    
    // 點擊 Play 按鈕進入遊戲
    console.log('🎮 尋找並點擊 Play 按鈕...');

    // 獲取 Play 按鈕位置並點擊
    const buttonInfo = await page.evaluate(() => {
      const menuScene = window.game.scene.getScene('menu');
      if (!menuScene || !menuScene.playButtonText) return null;

      return {
        x: menuScene.playButtonText.x,
        y: menuScene.playButtonText.y,
        text: menuScene.playButtonText.text
      };
    });

    if (buttonInfo) {
      console.log(`🎯 Play 按鈕位置: (${buttonInfo.x}, ${buttonInfo.y})`);
      await page.mouse.click(buttonInfo.x, buttonInfo.y);
      console.log('🎮 已點擊 Play 按鈕，等待場景切換...');
      await page.waitForTimeout(5000); // 增加等待時間
    } else {
      console.log('❌ 無法找到 Play 按鈕');
    }

    // 驗證遊戲狀態
    const gameState = await page.evaluate(() => {
      const menuScene = window.game.scene.getScene('menu');
      const titleScene = window.game.scene.getScene('title');

      return {
        menuActive: menuScene ? menuScene.scene.isActive() : false,
        titleActive: titleScene ? titleScene.scene.isActive() : false,
        hasPlayer: !!titleScene?.player,
        playerPosition: titleScene?.player ? { x: titleScene.player.x, y: titleScene.player.y } : null,
        hasCoordinateFix: !!titleScene?.coordinateFix,
        hasPerformanceStats: !!titleScene?.performanceStats,
        debugMode: titleScene?.debugMode
      };
    });

    console.log('🎮 遊戲狀態:', JSON.stringify(gameState, null, 2));

    // 如果還在 MenuScene，嘗試手動切換
    if (!gameState.hasPlayer && gameState.menuActive) {
      console.log('🔧 手動觸發場景切換到 TitleScene...');

      await page.evaluate(() => {
        try {
          const menuScene = window.game.scene.getScene('menu');
          if (menuScene && menuScene.startGameScene) {
            menuScene.startGameScene();
          } else {
            window.game.scene.start('title');
          }
        } catch (error) {
          console.error('手動切換失敗:', error);
        }
      });

      await page.waitForTimeout(3000);

      // 重新檢查狀態
      const finalState = await page.evaluate(() => {
        const titleScene = window.game.scene.getScene('title');
        return {
          titleActive: titleScene ? titleScene.scene.isActive() : false,
          hasPlayer: !!titleScene?.player,
          hasCoordinateFix: !!titleScene?.coordinateFix,
          hasPerformanceStats: !!titleScene?.performanceStats
        };
      });

      console.log('🔧 手動切換後狀態:', JSON.stringify(finalState, null, 2));

      if (!finalState.hasPlayer) {
        console.log('❌ 無法進入 TitleScene，跳過優化測試');
        expect(finalState.hasPlayer).toBe(true);
        return;
      }

      // 更新 gameState
      Object.assign(gameState, finalState);
    }
    
    console.log('🚀 開始綜合優化測試...');
    
    // === 1. 響應延遲優化測試 ===
    console.log('\n📊 === 響應延遲優化測試 ===');
    
    const responseTests = [
      { name: '中央位置', x: 466, y: 215 },
      { name: '上方區域', x: 466, y: 100 },
      { name: '下方區域', x: 466, y: 330 },
      { name: '左側邊緣', x: 100, y: 215 },
      { name: '右側邊緣', x: 832, y: 215 }
    ];
    
    const responseResults = [];
    
    for (const testPoint of responseTests) {
      console.log(`🎯 測試 ${testPoint.name} (${testPoint.x}, ${testPoint.y})`);
      
      const startTime = Date.now();
      await page.mouse.click(testPoint.x, testPoint.y);
      await page.waitForTimeout(100); // 等待響應
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      responseResults.push({
        position: testPoint.name,
        responseTime: responseTime,
        grade: responseTime < 8 ? '優秀' : responseTime < 16 ? '良好' : responseTime < 32 ? '可接受' : '需改善'
      });
      
      console.log(`  ⏱️ 響應時間: ${responseTime}ms (${responseResults[responseResults.length-1].grade})`);
      await page.waitForTimeout(200); // 間隔
    }
    
    // === 2. 快速連續點擊測試 ===
    console.log('\n⚡ === 快速連續點擊測試 ===');
    
    const rapidClickCount = 10;
    const rapidClickStart = Date.now();
    
    for (let i = 0; i < rapidClickCount; i++) {
      await page.mouse.click(466, 215);
      await page.waitForTimeout(50); // 50ms 間隔的快速點擊
    }
    
    const rapidClickEnd = Date.now();
    const avgRapidResponse = (rapidClickEnd - rapidClickStart) / rapidClickCount;
    
    console.log(`⚡ 快速連續點擊 ${rapidClickCount} 次，平均響應: ${avgRapidResponse.toFixed(2)}ms`);
    
    // === 3. 觸控敏感度和座標準確性測試 ===
    console.log('\n🎯 === 觸控敏感度測試 ===');
    
    const coordinateTest = await page.evaluate(() => {
      const titleScene = window.game.scene.getScene('title');
      if (!titleScene?.coordinateFix) return { error: '座標修復工具不存在' };
      
      // 測試座標修復工具
      const testPointer = { x: 466, y: 215, worldX: 466, worldY: 215 };
      const fixedCoords = titleScene.coordinateFix.getOptimalCoordinates(testPointer);
      
      return {
        originalCoords: { x: testPointer.x, y: testPointer.y },
        fixedCoords: fixedCoords,
        coordinateFixWorking: !!fixedCoords
      };
    });
    
    console.log('🔧 座標修復測試:', JSON.stringify(coordinateTest, null, 2));
    
    // === 4. 視覺反饋測試 ===
    console.log('\n🎨 === 視覺反饋測試 ===');
    
    const visualFeedbackTest = await page.evaluate(() => {
      const titleScene = window.game.scene.getScene('title');
      if (!titleScene) return { error: '場景不存在' };
      
      let feedbackResults = {
        touchFeedbackExists: typeof titleScene.showTouchFeedback === 'function',
        playerFeedbackExists: typeof titleScene.showPlayerFeedback === 'function',
        visualEffectsCount: 0
      };
      
      // 觸發視覺反饋測試
      if (feedbackResults.touchFeedbackExists) {
        titleScene.showTouchFeedback(466, 215);
        feedbackResults.touchFeedbackTriggered = true;
      }
      
      if (feedbackResults.playerFeedbackExists) {
        titleScene.showPlayerFeedback('up');
        feedbackResults.playerFeedbackTriggered = true;
      }
      
      // 檢查視覺效果
      feedbackResults.visualEffectsCount = titleScene.children.list.filter(child => 
        child.texture && (child.alpha < 1 || child.scaleX !== 1 || child.scaleY !== 1)
      ).length;
      
      return feedbackResults;
    });
    
    console.log('🎨 視覺反饋測試:', JSON.stringify(visualFeedbackTest, null, 2));
    
    // === 5. 性能監控系統測試 ===
    console.log('\n📈 === 性能監控系統測試 ===');
    
    const performanceStats = await page.evaluate(() => {
      const titleScene = window.game.scene.getScene('title');
      return {
        hasPerformanceStats: !!titleScene?.performanceStats,
        statsData: titleScene?.performanceStats || null,
        debugMode: titleScene?.debugMode
      };
    });
    
    console.log('📈 性能監控狀態:', JSON.stringify(performanceStats, null, 2));
    
    // 等待收集更多性能數據
    await page.waitForTimeout(1000);
    
    // === 綜合評估 ===
    console.log('\n🏆 === 綜合優化效果評估 ===');
    
    const avgResponseTime = responseResults.reduce((sum, r) => sum + r.responseTime, 0) / responseResults.length;
    const excellentCount = responseResults.filter(r => r.grade === '優秀').length;
    const goodCount = responseResults.filter(r => r.grade === '良好').length;
    
    const optimizationScore = {
      responseDelay: {
        average: avgResponseTime.toFixed(2),
        grade: avgResponseTime < 8 ? '優秀' : avgResponseTime < 16 ? '良好' : avgResponseTime < 32 ? '可接受' : '需改善',
        excellentRate: `${(excellentCount / responseResults.length * 100).toFixed(1)}%`
      },
      rapidClick: {
        average: avgRapidResponse.toFixed(2),
        grade: avgRapidResponse < 16 ? '優秀' : avgRapidResponse < 32 ? '良好' : '需改善'
      },
      touchSensitivity: {
        coordinateFixWorking: coordinateTest.coordinateFixWorking,
        grade: coordinateTest.coordinateFixWorking ? '優秀' : '需改善'
      },
      visualFeedback: {
        touchFeedback: visualFeedbackTest.touchFeedbackExists,
        playerFeedback: visualFeedbackTest.playerFeedbackExists,
        effectsActive: visualFeedbackTest.visualEffectsCount > 0,
        grade: (visualFeedbackTest.touchFeedbackExists && visualFeedbackTest.playerFeedbackExists) ? '優秀' : '良好'
      },
      performanceMonitoring: {
        systemActive: performanceStats.hasPerformanceStats,
        debugMode: performanceStats.debugMode,
        grade: performanceStats.hasPerformanceStats ? '優秀' : '需改善'
      }
    };
    
    console.log('\n📊 === 最終優化評估報告 ===');
    console.log(`🚀 響應延遲優化: ${optimizationScore.responseDelay.grade} (平均 ${optimizationScore.responseDelay.average}ms, 優秀率 ${optimizationScore.responseDelay.excellentRate})`);
    console.log(`⚡ 快速點擊處理: ${optimizationScore.rapidClick.grade} (平均 ${optimizationScore.rapidClick.average}ms)`);
    console.log(`🎯 觸控敏感度: ${optimizationScore.touchSensitivity.grade} (座標修復: ${optimizationScore.touchSensitivity.coordinateFixWorking ? '✅' : '❌'})`);
    console.log(`🎨 視覺反饋系統: ${optimizationScore.visualFeedback.grade} (觸控反饋: ${optimizationScore.visualFeedback.touchFeedback ? '✅' : '❌'}, 玩家反饋: ${optimizationScore.visualFeedback.playerFeedback ? '✅' : '❌'})`);
    console.log(`📈 性能監控: ${optimizationScore.performanceMonitoring.grade} (系統啟用: ${optimizationScore.performanceMonitoring.systemActive ? '✅' : '❌'})`);
    
    // 計算總體評分
    const grades = Object.values(optimizationScore).map(item => item.grade);
    const excellentGrades = grades.filter(g => g === '優秀').length;
    const goodGrades = grades.filter(g => g === '良好').length;
    const totalScore = (excellentGrades * 20 + goodGrades * 15) / grades.length * 5;
    
    console.log(`\n🏆 手機橫向全螢幕優化總評: ${totalScore.toFixed(0)}/100`);
    
    if (totalScore >= 90) {
      console.log('🌟 優化效果卓越！手機橫向全螢幕體驗已達到最佳狀態');
    } else if (totalScore >= 75) {
      console.log('✅ 優化效果良好！手機橫向全螢幕體驗顯著改善');
    } else if (totalScore >= 60) {
      console.log('⚠️ 優化效果一般，仍有改善空間');
    } else {
      console.log('❌ 優化效果不佳，需要進一步改善');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10)}_手機橫向全螢幕_優化測試_成功_v1_001.png`,
      fullPage: true 
    });
    
    // 基本驗證
    expect(gameState.hasPlayer).toBe(true);
    expect(avgResponseTime).toBeLessThan(32); // 至少要在可接受範圍內
    expect(optimizationScore.touchSensitivity.coordinateFixWorking).toBe(true);
    
    console.log('✅ 手機橫向全螢幕優化測試完成');
  });
});
