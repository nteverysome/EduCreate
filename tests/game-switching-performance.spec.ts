/**
 * 25 種遊戲切換性能測試
 * 測試所有遊戲的切換性能，確保 <500ms 切換時間和穩定的記憶體使用
 * 驗證 UnifiedGameManager 的效能和穩定性
 */

import { test, expect } from '@playwright/test';

// 測試配置
const TEST_CONFIG = {
  switchTimeThreshold: 500, // ms
  memoryThreshold: 500, // MB
  maxRetries: 3,
  testTimeout: 60000, // 60秒
  gameLoadTimeout: 10000 // 10秒
};

// 25 種遊戲列表（按分類）
const GAME_CATEGORIES = {
  lightweight: [
    { id: 'quiz', name: '問答遊戲', expectedLoadTime: 500 },
    { id: 'flashcard', name: '閃卡遊戲', expectedLoadTime: 400 },
    { id: 'true-false', name: '是非題', expectedLoadTime: 300 },
    { id: 'type-answer', name: '輸入答案', expectedLoadTime: 350 },
    { id: 'match', name: '配對遊戲', expectedLoadTime: 600 },
    { id: 'simple-match', name: '簡單配對', expectedLoadTime: 450 },
    { id: 'balloon-pop', name: '氣球爆破', expectedLoadTime: 550 },
    { id: 'spin-wheel', name: '轉盤遊戲', expectedLoadTime: 500 }
  ],
  medium: [
    { id: 'crossword', name: '填字遊戲', expectedLoadTime: 800 },
    { id: 'wordsearch', name: '找字遊戲', expectedLoadTime: 700 },
    { id: 'hangman', name: '猜字遊戲', expectedLoadTime: 650 },
    { id: 'anagram', name: '字母重組', expectedLoadTime: 680 },
    { id: 'group-sort', name: '分組排序', expectedLoadTime: 750 },
    { id: 'word-scramble', name: '單字重組', expectedLoadTime: 620 },
    { id: 'gameshow-quiz', name: '遊戲節目問答', expectedLoadTime: 850 },
    { id: 'flip-tiles', name: '翻牌遊戲', expectedLoadTime: 800 },
    { id: 'image-quiz', name: '圖片問答', expectedLoadTime: 900 },
    { id: 'labelled-diagram', name: '標籤圖表', expectedLoadTime: 880 }
  ],
  heavyweight: [
    { id: 'airplane', name: '飛機碰撞遊戲', expectedLoadTime: 1200 },
    { id: 'maze-chase', name: '迷宮追逐', expectedLoadTime: 1000 },
    { id: 'flying-fruit', name: '飛行水果', expectedLoadTime: 900 },
    { id: 'whack-a-mole', name: '打地鼠', expectedLoadTime: 1100 },
    { id: 'memory-card', name: '記憶卡片', expectedLoadTime: 950 },
    { id: 'speaking-cards', name: '語音卡片', expectedLoadTime: 1150 },
    { id: 'complete-sentence', name: '完成句子', expectedLoadTime: 1050 }
  ]
};

// 所有遊戲的平面列表
const ALL_GAMES = [
  ...GAME_CATEGORIES.lightweight,
  ...GAME_CATEGORIES.medium,
  ...GAME_CATEGORIES.heavyweight
];

test.describe('25 種遊戲切換性能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 設置測試超時
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    // 導航到遊戲頁面
    await page.goto('http://localhost:3002/games/airplane');
    await page.waitForLoadState('networkidle');
    
    // 等待 EnhancedGameSwitcher 載入
    await page.waitForSelector('.enhanced-game-switcher', { timeout: 10000 });
    
    console.log('✅ 測試環境準備完成');
  });

  test('單一遊戲切換性能測試', async ({ page }) => {
    console.log('🔄 開始單一遊戲切換測試');
    
    const performanceResults: Array<{
      gameId: string;
      gameName: string;
      category: string;
      switchTime: number;
      loadTime: number;
      memoryUsage: number;
      success: boolean;
      error?: string;
    }> = [];

    // 測試每個遊戲的切換
    for (const category of Object.keys(GAME_CATEGORIES)) {
      const games = GAME_CATEGORIES[category as keyof typeof GAME_CATEGORIES];
      
      console.log(`📂 測試 ${category} 遊戲 (${games.length} 個)`);
      
      for (const game of games) {
        console.log(`🎮 測試遊戲: ${game.name} (${game.id})`);
        
        const startTime = performance.now();
        let success = false;
        let error: string | undefined;
        let memoryUsage = 0;
        
        try {
          // 點擊切換遊戲按鈕
          await page.click('button:has-text("切換遊戲")');
          await page.waitForTimeout(500);
          
          // 查找並點擊目標遊戲
          const gameButton = page.locator(`button:has-text("${game.name}")`);
          if (await gameButton.count() > 0) {
            await gameButton.click();
            
            // 等待遊戲載入完成
            await page.waitForTimeout(Math.min(game.expectedLoadTime + 1000, TEST_CONFIG.gameLoadTimeout));
            
            // 檢查遊戲是否成功載入
            const gameContent = page.locator('.enhanced-game-switcher');
            await expect(gameContent).toBeVisible();
            
            success = true;
          } else {
            error = `找不到遊戲按鈕: ${game.name}`;
          }
          
          // 獲取記憶體使用情況
          memoryUsage = await page.evaluate(() => {
            return (performance as any).memory ? 
              (performance as any).memory.usedJSHeapSize / (1024 * 1024) : 0;
          });
          
        } catch (err) {
          error = err instanceof Error ? err.message : '未知錯誤';
        }
        
        const switchTime = performance.now() - startTime;
        
        performanceResults.push({
          gameId: game.id,
          gameName: game.name,
          category,
          switchTime,
          loadTime: game.expectedLoadTime,
          memoryUsage,
          success,
          error
        });
        
        console.log(`📊 ${game.name}: ${success ? '✅' : '❌'} ${Math.round(switchTime)}ms ${Math.round(memoryUsage)}MB`);
        
        // 短暫等待，避免過快切換
        await page.waitForTimeout(1000);
      }
    }

    // 分析測試結果
    const successfulTests = performanceResults.filter(r => r.success);
    const failedTests = performanceResults.filter(r => !r.success);
    
    console.log('\n📈 測試結果統計:');
    console.log(`✅ 成功: ${successfulTests.length}/${performanceResults.length}`);
    console.log(`❌ 失敗: ${failedTests.length}/${performanceResults.length}`);
    
    if (successfulTests.length > 0) {
      const avgSwitchTime = successfulTests.reduce((sum, r) => sum + r.switchTime, 0) / successfulTests.length;
      const maxSwitchTime = Math.max(...successfulTests.map(r => r.switchTime));
      const avgMemoryUsage = successfulTests.reduce((sum, r) => sum + r.memoryUsage, 0) / successfulTests.length;
      const maxMemoryUsage = Math.max(...successfulTests.map(r => r.memoryUsage));
      
      console.log(`⏱️ 平均切換時間: ${Math.round(avgSwitchTime)}ms`);
      console.log(`⏱️ 最大切換時間: ${Math.round(maxSwitchTime)}ms`);
      console.log(`💾 平均記憶體使用: ${Math.round(avgMemoryUsage)}MB`);
      console.log(`💾 最大記憶體使用: ${Math.round(maxMemoryUsage)}MB`);
      
      // 性能斷言
      expect(avgSwitchTime).toBeLessThan(TEST_CONFIG.switchTimeThreshold);
      expect(maxMemoryUsage).toBeLessThan(TEST_CONFIG.memoryThreshold);
    }
    
    // 失敗的測試詳情
    if (failedTests.length > 0) {
      console.log('\n❌ 失敗的測試:');
      failedTests.forEach(test => {
        console.log(`  - ${test.gameName}: ${test.error}`);
      });
    }
    
    // 截圖保存結果
    await page.screenshot({ 
      path: 'test-results/game-switching-performance-results.png',
      fullPage: true 
    });
  });

  test('連續遊戲切換壓力測試', async ({ page }) => {
    console.log('🔥 開始連續遊戲切換壓力測試');
    
    const stressTestResults: Array<{
      round: number;
      gameId: string;
      switchTime: number;
      memoryUsage: number;
      success: boolean;
    }> = [];
    
    // 選擇測試遊戲（每個類別選一個）
    const testGames = [
      GAME_CATEGORIES.lightweight[0], // quiz
      GAME_CATEGORIES.medium[0],      // crossword
      GAME_CATEGORIES.heavyweight[0]  // airplane
    ];
    
    // 進行 10 輪連續切換測試
    for (let round = 1; round <= 10; round++) {
      console.log(`🔄 第 ${round} 輪測試`);
      
      for (const game of testGames) {
        const startTime = performance.now();
        let success = false;
        let memoryUsage = 0;
        
        try {
          // 切換遊戲
          await page.click('button:has-text("切換遊戲")');
          await page.waitForTimeout(300);
          
          const gameButton = page.locator(`button:has-text("${game.name}")`);
          if (await gameButton.count() > 0) {
            await gameButton.click();
            await page.waitForTimeout(1000);
            success = true;
          }
          
          // 獲取記憶體使用
          memoryUsage = await page.evaluate(() => {
            return (performance as any).memory ? 
              (performance as any).memory.usedJSHeapSize / (1024 * 1024) : 0;
          });
          
        } catch (error) {
          console.warn(`⚠️ 第 ${round} 輪 ${game.name} 切換失敗:`, error);
        }
        
        const switchTime = performance.now() - startTime;
        
        stressTestResults.push({
          round,
          gameId: game.id,
          switchTime,
          memoryUsage,
          success
        });
        
        console.log(`  ${game.name}: ${success ? '✅' : '❌'} ${Math.round(switchTime)}ms ${Math.round(memoryUsage)}MB`);
      }
    }
    
    // 分析壓力測試結果
    const successfulSwitches = stressTestResults.filter(r => r.success);
    const memoryProgression = stressTestResults.map(r => r.memoryUsage);
    
    console.log('\n🔥 壓力測試結果:');
    console.log(`✅ 成功切換: ${successfulSwitches.length}/${stressTestResults.length}`);
    
    if (successfulSwitches.length > 0) {
      const avgSwitchTime = successfulSwitches.reduce((sum, r) => sum + r.switchTime, 0) / successfulSwitches.length;
      const initialMemory = memoryProgression[0] || 0;
      const finalMemory = memoryProgression[memoryProgression.length - 1] || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      console.log(`⏱️ 平均切換時間: ${Math.round(avgSwitchTime)}ms`);
      console.log(`💾 初始記憶體: ${Math.round(initialMemory)}MB`);
      console.log(`💾 最終記憶體: ${Math.round(finalMemory)}MB`);
      console.log(`📈 記憶體增長: ${Math.round(memoryGrowth)}MB`);
      
      // 壓力測試斷言
      expect(avgSwitchTime).toBeLessThan(TEST_CONFIG.switchTimeThreshold * 1.5); // 允許壓力測試時間稍長
      expect(memoryGrowth).toBeLessThan(100); // 記憶體增長不應超過 100MB
      expect(finalMemory).toBeLessThan(TEST_CONFIG.memoryThreshold);
    }
    
    // 截圖保存壓力測試結果
    await page.screenshot({ 
      path: 'test-results/game-switching-stress-test.png',
      fullPage: true 
    });
  });

  test('記憶體洩漏檢測測試', async ({ page }) => {
    console.log('🔍 開始記憶體洩漏檢測測試');
    
    const memorySnapshots: Array<{
      timestamp: number;
      memoryUsage: number;
      gameId: string;
      action: string;
    }> = [];
    
    // 記錄初始記憶體
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? 
        (performance as any).memory.usedJSHeapSize / (1024 * 1024) : 0;
    });
    
    memorySnapshots.push({
      timestamp: Date.now(),
      memoryUsage: initialMemory,
      gameId: 'initial',
      action: 'page_load'
    });
    
    console.log(`📊 初始記憶體: ${Math.round(initialMemory)}MB`);
    
    // 測試遊戲載入和卸載
    const testGame = GAME_CATEGORIES.lightweight[0]; // 使用輕量級遊戲測試
    
    for (let cycle = 1; cycle <= 5; cycle++) {
      console.log(`🔄 記憶體測試週期 ${cycle}`);
      
      // 載入遊戲
      await page.click('button:has-text("切換遊戲")');
      await page.waitForTimeout(300);
      
      const gameButton = page.locator(`button:has-text("${testGame.name}")`);
      if (await gameButton.count() > 0) {
        await gameButton.click();
        await page.waitForTimeout(2000);
        
        const loadMemory = await page.evaluate(() => {
          return (performance as any).memory ? 
            (performance as any).memory.usedJSHeapSize / (1024 * 1024) : 0;
        });
        
        memorySnapshots.push({
          timestamp: Date.now(),
          memoryUsage: loadMemory,
          gameId: testGame.id,
          action: 'game_load'
        });
        
        console.log(`  載入後記憶體: ${Math.round(loadMemory)}MB`);
      }
      
      // 等待一段時間，然後切換到其他遊戲（模擬卸載）
      await page.waitForTimeout(3000);
      
      // 切換到另一個遊戲
      await page.click('button:has-text("切換遊戲")');
      await page.waitForTimeout(300);
      
      const otherGame = GAME_CATEGORIES.lightweight[1];
      const otherGameButton = page.locator(`button:has-text("${otherGame.name}")`);
      if (await otherGameButton.count() > 0) {
        await otherGameButton.click();
        await page.waitForTimeout(2000);
        
        const unloadMemory = await page.evaluate(() => {
          return (performance as any).memory ? 
            (performance as any).memory.usedJSHeapSize / (1024 * 1024) : 0;
        });
        
        memorySnapshots.push({
          timestamp: Date.now(),
          memoryUsage: unloadMemory,
          gameId: otherGame.id,
          action: 'game_switch'
        });
        
        console.log(`  切換後記憶體: ${Math.round(unloadMemory)}MB`);
      }
    }
    
    // 分析記憶體使用趨勢
    const finalMemory = memorySnapshots[memorySnapshots.length - 1].memoryUsage;
    const memoryGrowth = finalMemory - initialMemory;
    const maxMemory = Math.max(...memorySnapshots.map(s => s.memoryUsage));
    
    console.log('\n🔍 記憶體洩漏檢測結果:');
    console.log(`📊 初始記憶體: ${Math.round(initialMemory)}MB`);
    console.log(`📊 最終記憶體: ${Math.round(finalMemory)}MB`);
    console.log(`📊 記憶體增長: ${Math.round(memoryGrowth)}MB`);
    console.log(`📊 峰值記憶體: ${Math.round(maxMemory)}MB`);
    
    // 記憶體洩漏檢測斷言
    expect(memoryGrowth).toBeLessThan(50); // 記憶體增長不應超過 50MB
    expect(maxMemory).toBeLessThan(TEST_CONFIG.memoryThreshold);
    
    // 如果記憶體增長過多，標記為潛在洩漏
    if (memoryGrowth > 30) {
      console.warn(`⚠️ 潛在記憶體洩漏: 增長 ${Math.round(memoryGrowth)}MB`);
    }
    
    // 截圖保存記憶體測試結果
    await page.screenshot({ 
      path: 'test-results/memory-leak-detection.png',
      fullPage: true 
    });
  });

  test.afterEach(async ({ page }) => {
    // 測試完成後的清理
    console.log('🧹 測試清理完成');
  });
});
