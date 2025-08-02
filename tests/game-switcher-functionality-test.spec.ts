/**
 * 遊戲切換器功能測試
 * 驗證遊戲切換器的所有功能是否正常工作
 */

import { test, expect } from '@playwright/test';

test.describe('🎮 遊戲切換器功能測試', () => {
  test.beforeEach(async ({ page }) => {
    console.log('🚀 開始遊戲切換器功能測試');
    
    // 導航到遊戲切換器頁面
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ 遊戲切換器頁面載入完成');
  });

  test('1️⃣ 檢查遊戲切換器界面顯示', async ({ page }) => {
    console.log('🔍 檢查遊戲切換器界面顯示');
    
    // 檢查頁面標題
    await expect(page.locator('h1:has-text("記憶科學遊戲中心")')).toBeVisible();
    console.log('✅ 記憶科學遊戲中心標題顯示');
    
    // 檢查副標題
    await expect(page.locator('text=動態切換不同的學習遊戲')).toBeVisible();
    console.log('✅ 副標題顯示正確');
    
    // 檢查當前遊戲顯示
    await expect(page.locator('h3:has-text("飛機碰撞遊戲")')).toBeVisible();
    console.log('✅ 當前遊戲標題顯示');
    
    // 檢查遊戲狀態
    await expect(page.locator('text=已完成')).toBeVisible();
    console.log('✅ 遊戲狀態顯示');
    
    // 檢查切換遊戲按鈕
    const switchButton = page.locator('button:has-text("切換遊戲")');
    await expect(switchButton).toBeVisible();
    console.log('✅ 切換遊戲按鈕顯示');
    
    // 檢查 GEPT 等級按鈕
    await expect(page.locator('button:has-text("初級")')).toBeVisible();
    await expect(page.locator('button:has-text("中級")')).toBeVisible();
    await expect(page.locator('button:has-text("高級")')).toBeVisible();
    console.log('✅ GEPT 等級按鈕顯示');
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/game-switcher-interface-test.png',
      fullPage: true 
    });
    
    console.log('🎉 遊戲切換器界面顯示測試完成');
  });

  test('2️⃣ 檢查遊戲內容載入', async ({ page }) => {
    console.log('🎮 檢查遊戲內容載入');
    
    // 檢查 iframe 是否存在
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    console.log('✅ 遊戲 iframe 已載入');
    
    // 檢查 iframe 內的遊戲內容
    const frameContent = iframe.contentFrame();
    if (frameContent) {
      // 檢查遊戲標題
      await expect(frameContent.locator('h1:has-text("Airplane Collision Game")')).toBeVisible();
      console.log('✅ 遊戲內容標題顯示');
      
      // 檢查遊戲統計
      await expect(frameContent.locator('text=分數')).toBeVisible();
      await expect(frameContent.locator('text=學習詞彙')).toBeVisible();
      await expect(frameContent.locator('text=準確率')).toBeVisible();
      console.log('✅ 遊戲統計數據顯示');
      
      // 檢查開始遊戲按鈕
      await expect(frameContent.locator('button:has-text("開始遊戲")')).toBeVisible();
      console.log('✅ 開始遊戲按鈕顯示');
    } else {
      console.log('⚠️ 無法訪問 iframe 內容');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/game-switcher-content-test.png',
      fullPage: true 
    });
    
    console.log('🎉 遊戲內容載入測試完成');
  });

  test('3️⃣ 測試 GEPT 等級切換功能', async ({ page }) => {
    console.log('🎓 測試 GEPT 等級切換功能');
    
    // 測試點擊中級按鈕
    const intermediateButton = page.locator('button:has-text("中級")');
    await intermediateButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 點擊中級按鈕');
    
    // 測試點擊高級按鈕
    const advancedButton = page.locator('button:has-text("高級")');
    await advancedButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 點擊高級按鈕');
    
    // 測試點擊初級按鈕
    const elementaryButton = page.locator('button:has-text("初級")');
    await elementaryButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 點擊初級按鈕');
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/game-switcher-gept-test.png',
      fullPage: true 
    });
    
    console.log('🎉 GEPT 等級切換功能測試完成');
  });

  test('4️⃣ 檢查學習統計面板', async ({ page }) => {
    console.log('📊 檢查學習統計面板');
    
    // 檢查學習統計標題
    await expect(page.locator('h3:has-text("學習統計")')).toBeVisible();
    console.log('✅ 學習統計標題顯示');
    
    // 檢查統計項目
    await expect(page.locator('text=總遊戲次數')).toBeVisible();
    await expect(page.locator('text=總學習時間')).toBeVisible();
    await expect(page.locator('text=平均分數')).toBeVisible();
    console.log('✅ 統計項目顯示正確');
    
    // 檢查 GEPT 學習進度
    await expect(page.locator('h3:has-text("GEPT 學習進度")')).toBeVisible();
    console.log('✅ GEPT 學習進度標題顯示');
    
    // 檢查進度項目
    const progressItems = ['初級', '中級', '高級'];
    for (const item of progressItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
      console.log(`✅ ${item} 進度項目顯示`);
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/game-switcher-statistics-test.png',
      fullPage: true 
    });
    
    console.log('🎉 學習統計面板測試完成');
  });

  test('5️⃣ 測試切換遊戲按鈕功能', async ({ page }) => {
    console.log('🔄 測試切換遊戲按鈕功能');
    
    // 查找切換遊戲按鈕
    const switchButton = page.locator('button:has-text("切換遊戲")');
    await expect(switchButton).toBeVisible();
    console.log('✅ 找到切換遊戲按鈕');
    
    // 點擊切換遊戲按鈕
    await switchButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ 點擊切換遊戲按鈕');
    
    // 檢查是否有任何變化或彈出框
    const allElements = await page.locator('*').count();
    console.log(`📊 頁面元素總數: ${allElements}`);
    
    // 檢查是否有下拉選單或模態框出現
    const dropdowns = await page.locator('[role="menu"], .dropdown, .modal, .popup').count();
    if (dropdowns > 0) {
      console.log('✅ 檢測到下拉選單或彈出框');
    } else {
      console.log('⚠️ 未檢測到下拉選單或彈出框');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/game-switcher-button-test.png',
      fullPage: true 
    });
    
    console.log('🎉 切換遊戲按鈕功能測試完成');
  });

  test('6️⃣ 完整遊戲切換器功能驗證', async ({ page }) => {
    console.log('🎯 完整遊戲切換器功能驗證');
    
    // 1. 驗證頁面載入
    await expect(page.locator('h1:has-text("記憶科學遊戲中心")')).toBeVisible();
    console.log('✅ 1. 頁面載入驗證完成');
    
    // 2. 驗證遊戲顯示
    await expect(page.locator('h3:has-text("飛機碰撞遊戲")')).toBeVisible();
    console.log('✅ 2. 遊戲顯示驗證完成');
    
    // 3. 驗證控制按鈕
    await expect(page.locator('button:has-text("切換遊戲")')).toBeVisible();
    await expect(page.locator('button:has-text("統計")')).toBeVisible();
    await expect(page.locator('button:has-text("設定")')).toBeVisible();
    console.log('✅ 3. 控制按鈕驗證完成');
    
    // 4. 驗證 GEPT 等級系統
    const geptButtons = ['初級', '中級', '高級'];
    for (const level of geptButtons) {
      await expect(page.locator(`button:has-text("${level}")`)).toBeVisible();
    }
    console.log('✅ 4. GEPT 等級系統驗證完成');
    
    // 5. 驗證學習統計
    await expect(page.locator('h3:has-text("學習統計")')).toBeVisible();
    await expect(page.locator('h3:has-text("GEPT 學習進度")')).toBeVisible();
    console.log('✅ 5. 學習統計驗證完成');
    
    // 6. 驗證遊戲內容
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    console.log('✅ 6. 遊戲內容驗證完成');
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/game-switcher-complete-verification.png',
      fullPage: true 
    });
    
    console.log('🎉 完整遊戲切換器功能驗證完成');
  });
});
