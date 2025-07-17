/**
 * 完整5遊戲模板架構測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('完整5遊戲模板架構 - 生成測試影片', () => {
  test('完整5遊戲模板架構三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整5遊戲模板架構測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 驗證完整5遊戲模板架構功能卡片存在
    await expect(page.getByTestId('feature-five-games-architecture')).toBeVisible();
    await expect(page.getByTestId('feature-five-games-architecture').locator('h3:has-text("完整5遊戲模板架構")')).toBeVisible();
    await expect(page.locator('text=Match配對、Fill-in填空、Quiz測驗、Sequence順序、Flashcard閃卡等5種記憶科學遊戲')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('five-games-architecture-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("完整5遊戲模板架構")')).toBeVisible();
    await expect(page.locator('text=Match配對、Fill-in填空、Quiz測驗、Sequence順序、Flashcard閃卡等5種記憶科學遊戲')).toBeVisible();
    
    // 驗證功能展示
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("Match配對")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("Fill-in填空")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("Quiz測驗")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("Sequence順序")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("Flashcard閃卡")').first()).toBeVisible();
    
    // 驗證5遊戲詳細說明
    await expect(page.locator('.bg-blue-50 h2:has-text("5種記憶科學遊戲詳解")')).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Match配對遊戲")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Fill-in填空遊戲")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Quiz測驗遊戲")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Sequence順序遊戲")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Flashcard閃卡遊戲")').first()).toBeVisible();
    
    // 驗證記憶科學整合
    await expect(page.locator('text=記憶科學整合')).toBeVisible();
    await expect(page.locator('text=多元記憶機制')).toBeVisible();
    await expect(page.locator('text=認知負荷優化')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=初級 (Elementary)')).toBeVisible();
    await expect(page.locator('text=中級 (Intermediate)')).toBeVisible();
    await expect(page.locator('text=中高級 (High-Intermediate)')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 FiveGamesArchitecturePanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試標籤切換
    console.log('📑 測試標籤切換功能');
    await expect(page.getByTestId('five-games-architecture-panel')).toBeVisible();
    await expect(page.getByTestId('overview-tab')).toBeVisible();
    await expect(page.getByTestId('games-tab')).toBeVisible();
    await expect(page.getByTestId('config-tab')).toBeVisible();
    await expect(page.getByTestId('analytics-tab')).toBeVisible();
    
    // 測試遊戲總覽標籤
    await page.getByTestId('overview-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('overview-content')).toBeVisible();
    await expect(page.getByTestId('overview-content').locator('h3:has-text("5遊戲模板架構總覽")')).toBeVisible();
    await expect(page.getByTestId('overview-content').locator('text=遊戲類型').first()).toBeVisible();
    await expect(page.getByTestId('overview-content').locator('text=已實現').first()).toBeVisible();
    await expect(page.getByTestId('overview-content').locator('text=總遊玩次數').first()).toBeVisible();
    
    // 測試遊戲選擇標籤
    console.log('🎯 測試遊戲選擇功能');
    await page.getByTestId('games-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('games-content')).toBeVisible();
    await expect(page.getByTestId('games-content').locator('h3:has-text("遊戲選擇")')).toBeVisible();
    
    // 測試遊戲選擇器
    await expect(page.getByTestId('game-match')).toBeVisible();
    await expect(page.getByTestId('game-fillin')).toBeVisible();
    await expect(page.getByTestId('game-quiz')).toBeVisible();
    await expect(page.getByTestId('game-sequence')).toBeVisible();
    await expect(page.getByTestId('game-flashcard')).toBeVisible();
    
    // 選擇一個遊戲
    await page.getByTestId('game-match').click();
    await page.waitForTimeout(1000);
    
    // 測試開始遊戲按鈕
    await expect(page.getByTestId('start-game-button')).toBeVisible();
    await expect(page.getByTestId('start-game-button')).toBeEnabled();
    
    // 測試遊戲配置標籤
    console.log('⚙️ 測試遊戲配置功能');
    await page.getByTestId('config-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('config-content')).toBeVisible();
    await expect(page.getByTestId('config-content').locator('h3:has-text("遊戲配置")')).toBeVisible();
    
    // 測試GEPT等級設置
    await expect(page.getByTestId('gept-level-elementary')).toBeVisible();
    await expect(page.getByTestId('gept-level-intermediate')).toBeVisible();
    await expect(page.getByTestId('gept-level-high-intermediate')).toBeVisible();
    
    // 選擇GEPT等級
    await page.getByTestId('gept-level-intermediate').click();
    await page.waitForTimeout(500);
    
    // 測試難度設置
    await expect(page.getByTestId('difficulty-easy')).toBeVisible();
    await expect(page.getByTestId('difficulty-medium')).toBeVisible();
    await expect(page.getByTestId('difficulty-hard')).toBeVisible();
    
    // 選擇難度
    await page.getByTestId('difficulty-medium').click();
    await page.waitForTimeout(500);
    
    // 測試遊戲選項
    await expect(page.getByTestId('time-limit')).toBeVisible();
    await expect(page.getByTestId('enable-hints')).toBeVisible();
    await expect(page.getByTestId('enable-sound')).toBeVisible();
    await expect(page.getByTestId('enable-animation')).toBeVisible();
    
    // 測試遊戲分析標籤
    console.log('📊 測試遊戲分析功能');
    await page.getByTestId('analytics-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('analytics-content')).toBeVisible();
    await expect(page.getByTestId('analytics-content').locator('h3:has-text("遊戲分析")')).toBeVisible();
    await expect(page.locator('text=整體統計')).toBeVisible();
    await expect(page.locator('text=總遊玩次數').first()).toBeVisible();
    await expect(page.locator('text=平均分數').first()).toBeVisible();
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('five-games-architecture-panel')).toBeVisible();
    
    console.log('🎉 完整5遊戲模板架構三層整合驗證完全成功！');
  });

  test('完整5遊戲模板架構性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整5遊戲模板架構性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3000/games/five-games-architecture');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 完整5遊戲模板架構頁面載入時間: ${pageLoadTime}ms`);

    // 等待 FiveGamesArchitecturePanel 載入
    await page.waitForTimeout(3000);

    // 測量標籤切換時間
    const overviewTabStart = Date.now();
    await page.getByTestId('overview-tab').click();
    await page.waitForTimeout(1000);
    const overviewTabTime = Date.now() - overviewTabStart;
    console.log(`📊 總覽標籤切換時間: ${overviewTabTime}ms`);

    const gamesTabStart = Date.now();
    await page.getByTestId('games-tab').click();
    await page.waitForTimeout(1000);
    const gamesTabTime = Date.now() - gamesTabStart;
    console.log(`📊 遊戲標籤切換時間: ${gamesTabTime}ms`);

    const configTabStart = Date.now();
    await page.getByTestId('config-tab').click();
    await page.waitForTimeout(1000);
    const configTabTime = Date.now() - configTabStart;
    console.log(`📊 配置標籤切換時間: ${configTabTime}ms`);

    const analyticsTabStart = Date.now();
    await page.getByTestId('analytics-tab').click();
    await page.waitForTimeout(1000);
    const analyticsTabTime = Date.now() - analyticsTabStart;
    console.log(`📊 分析標籤切換時間: ${analyticsTabTime}ms`);

    // 測量遊戲選擇時間
    await page.getByTestId('games-tab').click();
    const gameSelectStart = Date.now();
    await page.getByTestId('game-match').click();
    await page.waitForTimeout(1000);
    const gameSelectTime = Date.now() - gameSelectStart;
    console.log(`📊 遊戲選擇時間: ${gameSelectTime}ms`);

    // 測量配置設置時間
    await page.getByTestId('config-tab').click();
    const geptLevelStart = Date.now();
    await page.getByTestId('gept-level-intermediate').click();
    await page.waitForTimeout(500);
    const geptLevelTime = Date.now() - geptLevelStart;
    console.log(`📊 GEPT等級設置時間: ${geptLevelTime}ms`);

    const difficultyStart = Date.now();
    await page.getByTestId('difficulty-medium').click();
    await page.waitForTimeout(500);
    const difficultyTime = Date.now() - difficultyStart;
    console.log(`📊 難度設置時間: ${difficultyTime}ms`);

    const optionsStart = Date.now();
    await page.getByTestId('enable-hints').click();
    await page.waitForTimeout(500);
    const optionsTime = Date.now() - optionsStart;
    console.log(`📊 選項設置時間: ${optionsTime}ms`);

    console.log('🎉 完整5遊戲模板架構性能測試完成！');
  });
});
