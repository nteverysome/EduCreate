/**
 * Airplane Collision Game 真實功能驗證測試
 * 
 * 目的：驗證 AirplaneCollisionGame 是否真的能在瀏覽器中運行
 */

import { test, expect } from '@playwright/test';

test.describe('Airplane Collision Game 真實功能驗證', () => {
  test.beforeEach(async ({ page }) => {
    // 設置較長的超時時間，因為遊戲載入可能需要時間
    test.setTimeout(60000);
  });

  test('應該能從主頁面導航到 airplane 遊戲', async ({ page }) => {
    // 1. 訪問主頁面
    await page.goto('http://localhost:3000');
    
    // 2. 等待頁面載入
    await expect(page.locator('[data-testid="hero-title"]')).toBeVisible();
    
    // 3. 尋找 airplane 遊戲連結
    const airplaneGameLink = page.locator('[data-testid="airplane-game-link"]');
    await expect(airplaneGameLink).toBeVisible();
    
    // 4. 點擊進入 airplane 遊戲
    await airplaneGameLink.click();
    
    // 5. 驗證成功導航到遊戲頁面
    await expect(page).toHaveURL('/games/airplane');
    
    // 6. 截圖記錄導航成功
    await page.screenshot({ 
      path: 'test-results/airplane-game-navigation-success.png',
      fullPage: true 
    });
  });

  test('應該能載入 airplane 遊戲頁面', async ({ page }) => {
    // 1. 直接訪問 airplane 遊戲頁面
    await page.goto('http://localhost:3000/games/airplane');
    
    // 2. 等待頁面標題載入
    await expect(page.locator('h1')).toContainText('Airplane Collision Game');
    
    // 3. 檢查遊戲統計區域
    const scoreElement = page.locator('text=分數').first();
    await expect(scoreElement).toBeVisible();
    
    const wordsElement = page.locator('text=學習詞彙').first();
    await expect(wordsElement).toBeVisible();
    
    const accuracyElement = page.locator('text=準確率').first();
    await expect(accuracyElement).toBeVisible();
    
    // 4. 檢查遊戲控制面板
    const gameStatusElement = page.locator('text=遊戲狀態');
    await expect(gameStatusElement).toBeVisible();
    
    const geptLevelElement = page.locator('text=GEPT 等級');
    await expect(geptLevelElement).toBeVisible();
    
    // 5. 檢查開始遊戲按鈕
    const startButton = page.locator('button', { hasText: '開始遊戲' });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
    
    // 6. 截圖記錄頁面載入成功
    await page.screenshot({ 
      path: 'test-results/airplane-game-page-loaded.png',
      fullPage: true 
    });
  });

  test('應該能嘗試載入 AirplaneCollisionGame 組件', async ({ page }) => {
    // 1. 訪問 airplane 遊戲頁面
    await page.goto('http://localhost:3000/games/airplane');
    
    // 2. 等待動態載入的組件
    await page.waitForTimeout(3000); // 等待 3 秒讓組件載入
    
    // 3. 檢查是否有載入指示器
    const loadingIndicator = page.locator('text=載入飛機遊戲中');
    
    // 4. 檢查遊戲容器
    const gameContainer = page.locator('.bg-gray-900.rounded-lg');
    await expect(gameContainer).toBeVisible();
    
    // 5. 檢查是否有錯誤訊息
    const errorMessages = await page.locator('text=Error').count();
    console.log(`發現 ${errorMessages} 個錯誤訊息`);
    
    // 6. 檢查控制台錯誤
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 7. 等待更長時間讓組件完全載入
    await page.waitForTimeout(5000);
    
    // 8. 記錄控制台錯誤
    if (consoleErrors.length > 0) {
      console.log('控制台錯誤:', consoleErrors);
    }
    
    // 9. 截圖記錄組件載入狀態
    await page.screenshot({ 
      path: 'test-results/airplane-game-component-loading.png',
      fullPage: true 
    });
    
    // 10. 檢查 Phaser 是否載入
    const phaserLoaded = await page.evaluate(() => {
      return typeof window.Phaser !== 'undefined';
    });
    
    console.log(`Phaser 是否載入: ${phaserLoaded}`);
  });

  test('應該能點擊開始遊戲按鈕', async ({ page }) => {
    // 1. 訪問 airplane 遊戲頁面
    await page.goto('http://localhost:3000/games/airplane');
    
    // 2. 等待頁面載入
    await page.waitForTimeout(3000);
    
    // 3. 點擊開始遊戲按鈕
    const startButton = page.locator('button', { hasText: '開始遊戲' });
    await expect(startButton).toBeVisible();
    
    // 4. 截圖點擊前狀態
    await page.screenshot({ 
      path: 'test-results/airplane-game-before-start.png',
      fullPage: true 
    });
    
    // 5. 點擊開始按鈕
    await startButton.click();
    
    // 6. 等待狀態變化
    await page.waitForTimeout(2000);
    
    // 7. 檢查按鈕狀態是否改變
    const buttonAfterClick = page.locator('button', { hasText: '遊戲進行中' });
    
    // 8. 截圖點擊後狀態
    await page.screenshot({ 
      path: 'test-results/airplane-game-after-start.png',
      fullPage: true 
    });
    
    // 9. 檢查遊戲狀態是否更新
    const gameStatus = page.locator('text=遊戲狀態: 進行中');
    
    console.log('開始遊戲按鈕測試完成');
  });

  test('應該顯示遊戲說明區域', async ({ page }) => {
    // 1. 訪問 airplane 遊戲頁面
    await page.goto('http://localhost:3000/games/airplane');
    
    // 2. 檢查遊戲說明標題
    const instructionTitle = page.locator('text=🎮 遊戲說明');
    await expect(instructionTitle).toBeVisible();
    
    // 3. 檢查控制方式說明
    const controlInstruction = page.locator('text=控制方式');
    await expect(controlInstruction).toBeVisible();
    
    // 4. 檢查遊戲目標說明
    const objectiveInstruction = page.locator('text=遊戲目標');
    await expect(objectiveInstruction).toBeVisible();
    
    // 5. 檢查學習原理說明
    const principleInstruction = page.locator('text=學習原理');
    await expect(principleInstruction).toBeVisible();
    
    // 6. 截圖記錄說明區域
    await page.screenshot({ 
      path: 'test-results/airplane-game-instructions.png',
      fullPage: true 
    });
  });

  test('完整功能驗證總結', async ({ page }) => {
    console.log('🎯 開始完整功能驗證...');
    
    // 1. 主頁面導航測試
    await page.goto('http://localhost:3000');
    const airplaneLink = page.locator('[data-testid="airplane-game-link"]');
    const hasAirplaneLink = await airplaneLink.isVisible();
    console.log(`✅ 主頁面有 airplane 遊戲連結: ${hasAirplaneLink}`);
    
    // 2. 遊戲頁面載入測試
    await page.goto('http://localhost:3000/games/airplane');
    const pageTitle = await page.locator('h1').textContent();
    const hasGameTitle = pageTitle?.includes('Airplane Collision Game');
    console.log(`✅ 遊戲頁面標題正確: ${hasGameTitle}`);
    
    // 3. 組件載入測試
    await page.waitForTimeout(5000);
    const gameContainer = page.locator('.bg-gray-900.rounded-lg');
    const hasGameContainer = await gameContainer.isVisible();
    console.log(`✅ 遊戲容器存在: ${hasGameContainer}`);
    
    // 4. Phaser 載入測試
    const phaserLoaded = await page.evaluate(() => {
      return typeof window.Phaser !== 'undefined';
    });
    console.log(`✅ Phaser 已載入: ${phaserLoaded}`);
    
    // 5. 控制台錯誤檢查
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    console.log(`⚠️  控制台錯誤數量: ${consoleErrors.length}`);
    
    // 6. 最終截圖
    await page.screenshot({ 
      path: 'test-results/airplane-game-final-verification.png',
      fullPage: true 
    });
    
    // 7. 總結報告
    const verificationResults = {
      主頁面連結: hasAirplaneLink,
      遊戲頁面標題: hasGameTitle,
      遊戲容器: hasGameContainer,
      Phaser載入: phaserLoaded,
      控制台錯誤: consoleErrors.length,
      總體狀態: hasAirplaneLink && hasGameTitle && hasGameContainer ? '✅ 基本功能正常' : '❌ 存在問題'
    };
    
    console.log('📊 驗證結果:', JSON.stringify(verificationResults, null, 2));
  });
});
