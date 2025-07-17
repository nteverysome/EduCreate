/**
 * 完整遊戲切換系統測試
 * 生成測試影片並驗證三層整合
 */

import { test, expect } from '@playwright/test';

test.describe('完整遊戲切換系統 - 生成測試影片', () => {
  test('完整遊戲切換系統三層整合驗證', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整遊戲切換系統測試影片...');

    // 第一層驗證：主頁可見性測試
    console.log('📍 第一層驗證：主頁可見性測試');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 驗證完整遊戲切換系統功能卡片存在
    await expect(page.getByTestId('feature-game-switcher')).toBeVisible();
    await expect(page.getByTestId('feature-game-switcher').locator('h3:has-text("完整遊戲切換系統")')).toBeVisible();
    await expect(page.locator('text=無縫遊戲切換、智能內容適配、狀態保持恢復、50種切換模式等完整功能')).toBeVisible();
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');

    // 第二層驗證：導航流程測試
    console.log('📍 第二層驗證：導航流程測試');
    await page.getByTestId('game-switcher-link').click();
    await page.waitForLoadState('networkidle');
    
    // 驗證頁面載入完成
    await expect(page.locator('h1:has-text("完整遊戲切換系統")')).toBeVisible();
    await expect(page.locator('text=無縫遊戲切換、智能內容適配、狀態保持恢復、50種切換模式等完整功能')).toBeVisible();
    
    // 驗證功能展示
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("無縫切換")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("智能適配")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("狀態保持")').first()).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium:has-text("高性能")').first()).toBeVisible();
    
    // 驗證50種切換模式詳解
    await expect(page.locator('.bg-blue-50 h2:has-text("50種切換模式詳解")')).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Match → Fill-in")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Fill-in → Quiz")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Quiz → Sequence")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Sequence → Flashcard")').first()).toBeVisible();
    await expect(page.locator('.bg-blue-50 .grid .bg-white .font-medium:has-text("Flashcard → Match")').first()).toBeVisible();
    
    // 驗證記憶科學整合
    await expect(page.locator('text=記憶科學整合')).toBeVisible();
    await expect(page.locator('text=切換策略優化')).toBeVisible();
    await expect(page.locator('text=學習效果最大化')).toBeVisible();
    
    // 驗證GEPT分級整合
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    await expect(page.locator('text=初級切換策略')).toBeVisible();
    await expect(page.locator('text=中級切換策略')).toBeVisible();
    await expect(page.locator('text=中高級切換策略')).toBeVisible();
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');

    // 等待 GameSwitcherPanel 載入
    await page.waitForTimeout(3000);
    
    // 第三層驗證：功能互動測試
    console.log('📍 第三層驗證：功能互動測試');
    
    // 測試標籤切換
    console.log('📑 測試標籤切換功能');
    await expect(page.getByTestId('game-switcher-panel')).toBeVisible();
    await expect(page.getByTestId('switcher-tab')).toBeVisible();
    await expect(page.getByTestId('modes-tab')).toBeVisible();
    await expect(page.getByTestId('batch-tab')).toBeVisible();
    await expect(page.getByTestId('analytics-tab')).toBeVisible();
    
    // 測試遊戲切換標籤
    await page.getByTestId('switcher-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('switcher-content')).toBeVisible();
    await expect(page.getByTestId('switcher-content').locator('h3:has-text("遊戲切換")')).toBeVisible();
    
    // 測試源遊戲選擇
    console.log('🎯 測試源遊戲選擇功能');
    await expect(page.getByTestId('source-game-match')).toBeVisible();
    await expect(page.getByTestId('source-game-fillin')).toBeVisible();
    await expect(page.getByTestId('source-game-quiz')).toBeVisible();
    await expect(page.getByTestId('source-game-sequence')).toBeVisible();
    await expect(page.getByTestId('source-game-flashcard')).toBeVisible();
    
    // 選擇源遊戲
    await page.getByTestId('source-game-match').click();
    await page.waitForTimeout(500);
    
    // 測試目標遊戲選擇
    console.log('🎯 測試目標遊戲選擇功能');
    await expect(page.getByTestId('target-game-match')).toBeVisible();
    await expect(page.getByTestId('target-game-fillin')).toBeVisible();
    await expect(page.getByTestId('target-game-quiz')).toBeVisible();
    await expect(page.getByTestId('target-game-sequence')).toBeVisible();
    await expect(page.getByTestId('target-game-flashcard')).toBeVisible();
    
    // 選擇目標遊戲
    await page.getByTestId('target-game-fillin').click();
    await page.waitForTimeout(500);
    
    // 測試切換配置
    console.log('⚙️ 測試切換配置功能');
    await expect(page.getByTestId('preserve-progress')).toBeVisible();
    await expect(page.getByTestId('enable-preview')).toBeVisible();
    await expect(page.getByTestId('auto-optimize')).toBeVisible();
    await expect(page.getByTestId('gept-level-select')).toBeVisible();
    
    // 測試GEPT等級選擇
    await page.getByTestId('gept-level-select').selectOption('intermediate');
    await page.waitForTimeout(500);
    
    // 測試切換按鈕
    console.log('⚡ 測試切換按鈕功能');
    await expect(page.getByTestId('switch-game-button')).toBeVisible();
    await expect(page.getByTestId('switch-game-button')).toBeEnabled();
    
    // 執行切換
    await page.getByTestId('switch-game-button').click();
    await page.waitForTimeout(3000); // 等待切換完成
    
    // 測試切換模式標籤
    console.log('🎯 測試切換模式功能');
    await page.getByTestId('modes-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('modes-content')).toBeVisible();
    await expect(page.getByTestId('modes-content').locator('h3:has-text("50種切換模式")')).toBeVisible();
    await expect(page.locator('text=🌟 推薦模式')).toBeVisible();
    
    // 測試批量轉換標籤
    console.log('📦 測試批量轉換功能');
    await page.getByTestId('batch-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('batch-content')).toBeVisible();
    await expect(page.getByTestId('batch-content').locator('h3:has-text("批量轉換")')).toBeVisible();
    
    // 測試切換分析標籤
    console.log('📊 測試切換分析功能');
    await page.getByTestId('analytics-tab').click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('analytics-content')).toBeVisible();
    await expect(page.getByTestId('analytics-content').locator('h3:has-text("切換分析")')).toBeVisible();
    await expect(page.locator('text=整體統計')).toBeVisible();
    await expect(page.locator('text=總切換次數').first()).toBeVisible();
    await expect(page.locator('text=平均切換時間').first()).toBeVisible();
    
    console.log('✅ 第三層驗證通過：功能互動測試成功');
    
    // 最終驗證
    console.log('🎯 最終驗證：系統整體功能');
    await expect(page.getByTestId('game-switcher-panel')).toBeVisible();
    
    console.log('🎉 完整遊戲切換系統三層整合驗證完全成功！');
  });

  test('完整遊戲切換系統性能測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製完整遊戲切換系統性能測試影片...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3000/games/game-switcher');
    await page.waitForLoadState('networkidle');
    const pageLoadTime = Date.now() - startTime;
    console.log(`📊 完整遊戲切換系統頁面載入時間: ${pageLoadTime}ms`);

    // 等待 GameSwitcherPanel 載入
    await page.waitForTimeout(3000);

    // 測量標籤切換時間
    const switcherTabStart = Date.now();
    await page.getByTestId('switcher-tab').click();
    await page.waitForTimeout(1000);
    const switcherTabTime = Date.now() - switcherTabStart;
    console.log(`📊 切換標籤切換時間: ${switcherTabTime}ms`);

    const modesTabStart = Date.now();
    await page.getByTestId('modes-tab').click();
    await page.waitForTimeout(1000);
    const modesTabTime = Date.now() - modesTabStart;
    console.log(`📊 模式標籤切換時間: ${modesTabTime}ms`);

    const batchTabStart = Date.now();
    await page.getByTestId('batch-tab').click();
    await page.waitForTimeout(1000);
    const batchTabTime = Date.now() - batchTabStart;
    console.log(`📊 批量標籤切換時間: ${batchTabTime}ms`);

    const analyticsTabStart = Date.now();
    await page.getByTestId('analytics-tab').click();
    await page.waitForTimeout(1000);
    const analyticsTabTime = Date.now() - analyticsTabStart;
    console.log(`📊 分析標籤切換時間: ${analyticsTabTime}ms`);

    // 測量遊戲選擇時間
    await page.getByTestId('switcher-tab').click();
    const sourceGameStart = Date.now();
    await page.getByTestId('source-game-match').click();
    await page.waitForTimeout(500);
    const sourceGameTime = Date.now() - sourceGameStart;
    console.log(`📊 源遊戲選擇時間: ${sourceGameTime}ms`);

    const targetGameStart = Date.now();
    await page.getByTestId('target-game-fillin').click();
    await page.waitForTimeout(500);
    const targetGameTime = Date.now() - targetGameStart;
    console.log(`📊 目標遊戲選擇時間: ${targetGameTime}ms`);

    // 測量配置設置時間
    const configStart = Date.now();
    await page.getByTestId('gept-level-select').selectOption('intermediate');
    await page.waitForTimeout(500);
    const configTime = Date.now() - configStart;
    console.log(`📊 配置設置時間: ${configTime}ms`);

    // 測量切換執行時間
    const switchStart = Date.now();
    await page.getByTestId('switch-game-button').click();
    await page.waitForTimeout(3000);
    const switchTime = Date.now() - switchStart;
    console.log(`📊 遊戲切換執行時間: ${switchTime}ms`);

    console.log('🎉 完整遊戲切換系統性能測試完成！');
  });
});
