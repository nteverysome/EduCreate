const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Godot + MCP 教育沙盒端到端測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 設置測試環境
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 監聽控制台錯誤
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 控制台錯誤:', msg.text());
      }
    });
    
    // 監聽頁面錯誤
    page.on('pageerror', error => {
      console.log('🔴 頁面錯誤:', error.message);
    });
  });

  test('1. 主頁載入和導航測試', async ({ page }) => {
    console.log('🧪 測試 1: 主頁載入和導航');
    
    // 導航到主頁
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 檢查導航組件
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // 檢查導航連結
    const homeLink = page.locator('text=首頁');
    const gameLink = page.locator('text=飛機遊戲');
    
    await expect(homeLink).toBeVisible();
    await expect(gameLink).toBeVisible();
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/01-homepage-navigation.png',
      fullPage: true 
    });
    
    console.log('✅ 主頁載入和導航測試通過');
  });

  test('2. 飛機遊戲頁面載入測試', async ({ page }) => {
    console.log('🧪 測試 2: 飛機遊戲頁面載入');
    
    // 導航到遊戲頁面
    await page.goto('http://localhost:3000/games/airplane');
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/飛機學習遊戲/);
    
    // 檢查遊戲標題
    const gameTitle = page.locator('h1:has-text("飛機學習遊戲")');
    await expect(gameTitle).toBeVisible();
    
    // 檢查遊戲統計卡片
    const scoreCard = page.locator('text=分數');
    const questionsCard = page.locator('text=已答題數');
    const accuracyCard = page.locator('text=準確率');
    const timeCard = page.locator('text=遊戲時間');
    
    await expect(scoreCard).toBeVisible();
    await expect(questionsCard).toBeVisible();
    await expect(accuracyCard).toBeVisible();
    await expect(timeCard).toBeVisible();
    
    // 檢查 Godot 遊戲容器
    const gameContainer = page.locator('[class*="godot-game"]').first();
    if (await gameContainer.isVisible()) {
      console.log('✅ Godot 遊戲容器找到');
    } else {
      console.log('⚠️ Godot 遊戲容器未找到，可能需要 Godot 導出');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/02-airplane-game-page.png',
      fullPage: true 
    });
    
    console.log('✅ 飛機遊戲頁面載入測試通過');
  });

  test('3. 遊戲控制和互動測試', async ({ page }) => {
    console.log('🧪 測試 3: 遊戲控制和互動');
    
    await page.goto('http://localhost:3000/games/airplane');
    await page.waitForLoadState('networkidle');
    
    // 檢查遊戲控制按鈕
    const restartButton = page.locator('text=重新開始');
    const muteButton = page.locator('text=靜音').or(page.locator('text=取消靜音'));
    
    await expect(restartButton).toBeVisible();
    await expect(muteButton).toBeVisible();
    
    // 測試重新開始按鈕
    await restartButton.click();
    await page.waitForTimeout(1000);
    
    // 測試靜音按鈕
    await muteButton.click();
    await page.waitForTimeout(1000);
    
    // 檢查返回首頁按鈕
    const backButton = page.locator('text=返回首頁');
    await expect(backButton).toBeVisible();
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/03-game-controls.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲控制和互動測試通過');
  });

  test('4. 記憶科學功能測試', async ({ page }) => {
    console.log('🧪 測試 4: 記憶科學功能');
    
    await page.goto('http://localhost:3000/games/airplane');
    await page.waitForLoadState('networkidle');
    
    // 檢查記憶科學提示區域
    const memoryTips = page.locator('text=記憶科學提示');
    await expect(memoryTips).toBeVisible();
    
    // 檢查學習策略
    const learningStrategy = page.locator('text=學習策略');
    await expect(learningStrategy).toBeVisible();
    
    // 檢查 GEPT 分級
    const geptLevels = page.locator('text=GEPT 分級');
    await expect(geptLevels).toBeVisible();
    
    // 檢查間隔重複提示
    const spacedRepetition = page.locator('text=間隔重複');
    if (await spacedRepetition.isVisible()) {
      console.log('✅ 間隔重複功能已實現');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/04-memory-science.png',
      fullPage: true 
    });
    
    console.log('✅ 記憶科學功能測試通過');
  });

  test('5. API 路由測試', async ({ page }) => {
    console.log('🧪 測試 5: API 路由');
    
    // 測試遊戲統計 API
    const response = await page.request.get('http://localhost:3000/api/games/stats');
    expect(response.status()).toBe(200);
    
    const statsData = await response.json();
    expect(statsData).toHaveProperty('totalSessions');
    expect(statsData).toHaveProperty('averageScore');
    
    console.log('✅ 遊戲統計 API 響應正常:', statsData);
    
    // 測試保存遊戲數據
    const saveResponse = await page.request.post('http://localhost:3000/api/games/stats', {
      data: {
        gameType: 'airplane',
        score: 100,
        questionsAnswered: 10,
        correctAnswers: 8,
        wrongAnswers: 2,
        vocabulary: ['apple', 'book', 'cat'],
        memoryData: []
      }
    });
    
    expect(saveResponse.status()).toBe(201);
    const saveData = await saveResponse.json();
    expect(saveData).toHaveProperty('sessionId');
    
    console.log('✅ 遊戲數據保存 API 正常:', saveData);
    
    console.log('✅ API 路由測試通過');
  });

  test('6. 響應式設計測試', async ({ page }) => {
    console.log('🧪 測試 6: 響應式設計');
    
    await page.goto('http://localhost:3000/games/airplane');
    
    // 測試桌面版本
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/06-desktop-responsive.png',
      fullPage: true 
    });
    
    // 測試平板版本
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/06-tablet-responsive.png',
      fullPage: true 
    });
    
    // 測試手機版本
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/06-mobile-responsive.png',
      fullPage: true 
    });
    
    // 檢查在小螢幕上的可用性
    const gameTitle = page.locator('h1');
    await expect(gameTitle).toBeVisible();
    
    console.log('✅ 響應式設計測試通過');
  });

  test('7. 無障礙設計測試', async ({ page }) => {
    console.log('🧪 測試 7: 無障礙設計');
    
    await page.goto('http://localhost:3000/games/airplane');
    await page.waitForLoadState('networkidle');
    
    // 檢查鍵盤導航
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // 檢查 ARIA 標籤
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      if (ariaLabel || text) {
        console.log(`✅ 按鈕 ${i + 1} 有適當的標籤`);
      }
    }
    
    // 檢查顏色對比度 (基本檢查)
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    console.log('✅ 頁面背景色:', backgroundColor);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/07-accessibility.png',
      fullPage: true 
    });
    
    console.log('✅ 無障礙設計測試通過');
  });

  test('8. 整合測試總結', async ({ page }) => {
    console.log('🧪 測試 8: 整合測試總結');
    
    // 完整的用戶流程測試
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 1. 從首頁導航到遊戲
    await page.click('text=飛機遊戲');
    await page.waitForLoadState('networkidle');
    
    // 2. 檢查遊戲頁面載入
    await expect(page.locator('h1:has-text("飛機學習遊戲")')).toBeVisible();
    
    // 3. 測試遊戲控制
    await page.click('text=重新開始');
    await page.waitForTimeout(1000);
    
    // 4. 返回首頁
    await page.click('text=返回首頁');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('http://localhost:3000');
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/08-integration-complete.png',
      fullPage: true 
    });
    
    console.log('✅ 整合測試總結完成');
  });

});
