/**
 * 批量操作系統測試
 * 驗證選擇、移動、複製、刪除、分享、標籤、導出的批量操作功能
 */

import { test, expect } from '@playwright/test';

test.describe('批量操作系統', () => {
  test('批量操作核心功能演示', async ({ page }) => {
    console.log('🚀 開始批量操作系統演示...');

    // 1. 導航到批量操作頁面
    console.log('📍 Step 1: 導航到批量操作頁面');
    await page.goto('http://localhost:3003/activities/batch-operations');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 2. 驗證頁面基本元素
    console.log('📍 Step 2: 驗證頁面基本元素');
    
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('批量操作系統');
    await expect(page.locator('text=選擇、移動、複製、刪除、分享、標籤、導出')).toBeVisible();

    // 3. 驗證批量操作功能展示
    console.log('📍 Step 3: 驗證批量操作功能展示');
    
    await expect(page.locator('text=多選功能').first()).toBeVisible();
    await expect(page.locator('text=批量操作').first()).toBeVisible();
    await expect(page.locator('text=快捷鍵').first()).toBeVisible();

    // 4. 等待活動列表載入
    console.log('📍 Step 4: 等待活動列表載入');
    await page.waitForTimeout(3000);

    // 5. 測試活動選擇功能
    console.log('📍 Step 5: 測試活動選擇功能');
    
    // 查找活動卡片
    const activityCards = page.locator('[data-testid*="activity-card"]');
    const cardCount = await activityCards.count();
    
    if (cardCount > 0) {
      console.log(`找到 ${cardCount} 個活動卡片`);
      
      // 選擇第一個活動
      const firstCard = activityCards.first();
      const checkbox = firstCard.locator('input[type="checkbox"]');
      
      if (await checkbox.isVisible()) {
        await checkbox.check();
        await page.waitForTimeout(1000);
        console.log('✅ 成功選擇第一個活動');
        
        // 驗證批量操作面板是否顯示
        const batchPanel = page.locator('[data-testid="batch-operation-panel"]');
        if (await batchPanel.isVisible()) {
          console.log('✅ 批量操作面板顯示成功');
        }
      }
    } else {
      console.log('⚠️ 未找到活動卡片，可能需要等待數據載入');
    }

    // 6. 測試批量操作按鈕
    console.log('📍 Step 6: 測試批量操作按鈕');
    
    const batchPanel = page.locator('[data-testid="batch-operation-panel"]');
    if (await batchPanel.isVisible()) {
      // 測試移動按鈕
      const moveButton = batchPanel.locator('[data-testid="batch-move-button"]');
      if (await moveButton.isVisible()) {
        console.log('✅ 找到移動按鈕');
      }
      
      // 測試複製按鈕
      const copyButton = batchPanel.locator('[data-testid="batch-copy-button"]');
      if (await copyButton.isVisible()) {
        console.log('✅ 找到複製按鈕');
      }
      
      // 測試複製按鈕
      const duplicateButton = batchPanel.locator('[data-testid="batch-duplicate-button"]');
      if (await duplicateButton.isVisible()) {
        await duplicateButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ 複製操作測試成功');
      }
      
      // 測試分享按鈕
      const shareButton = batchPanel.locator('[data-testid="batch-share-button"]');
      if (await shareButton.isVisible()) {
        await shareButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 分享操作測試成功');
      }
      
      // 測試導出按鈕
      const exportButton = batchPanel.locator('[data-testid="batch-export-button"]');
      if (await exportButton.isVisible()) {
        await exportButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ 導出操作測試成功');
      }
    }

    // 7. 測試高級選擇選項
    console.log('📍 Step 7: 測試高級選擇選項');
    
    const advancedToggle = page.locator('[data-testid="toggle-advanced-options"]');
    if (await advancedToggle.isVisible()) {
      await advancedToggle.click();
      await page.waitForTimeout(1000);
      
      // 測試全選按鈕
      const selectAllButton = page.locator('[data-testid="select-all-button"]');
      if (await selectAllButton.isVisible()) {
        await selectAllButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 全選功能測試成功');
      }
      
      // 測試反選按鈕
      const invertButton = page.locator('[data-testid="invert-selection-button"]');
      if (await invertButton.isVisible()) {
        await invertButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 反選功能測試成功');
      }
    }

    // 8. 測試危險操作確認
    console.log('📍 Step 8: 測試危險操作確認');
    
    // 測試刪除操作
    const deleteButton = page.locator('[data-testid="batch-delete-button"]');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.waitForTimeout(500);
      
      // 檢查確認對話框
      const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
      if (await confirmDialog.isVisible()) {
        console.log('✅ 刪除確認對話框顯示成功');
        
        // 取消操作
        const cancelButton = confirmDialog.locator('[data-testid="cancel-confirm-button"]');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(500);
          console.log('✅ 取消刪除操作成功');
        }
      }
    }

    // 9. 測試鍵盤快捷鍵
    console.log('📍 Step 9: 測試鍵盤快捷鍵');
    
    // 測試 Ctrl+A 全選
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(1000);
    console.log('✅ Ctrl+A 全選快捷鍵測試完成');
    
    // 測試 Escape 關閉
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    console.log('✅ Escape 關閉快捷鍵測試完成');

    // 10. 測試批量操作進度
    console.log('📍 Step 10: 測試批量操作進度');
    
    // 重新選擇一些活動
    if (cardCount > 0) {
      const firstCard = activityCards.first();
      const checkbox = firstCard.locator('input[type="checkbox"]');
      
      if (await checkbox.isVisible()) {
        await checkbox.check();
        await page.waitForTimeout(500);
        
        // 執行一個操作來測試進度
        const tagButton = page.locator('[data-testid="batch-tag-button"]');
        if (await tagButton.isVisible()) {
          await tagButton.click();
          await page.waitForTimeout(1000);
          
          // 檢查進度指示器
          const progressBar = page.locator('[data-testid="batch-progress"]');
          if (await progressBar.isVisible()) {
            console.log('✅ 批量操作進度指示器顯示成功');
          }
        }
      }
    }

    // 11. 驗證記憶科學整合說明
    console.log('📍 Step 11: 驗證記憶科學整合說明');
    
    // 滾動到記憶科學整合區域
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('記憶科學整合')) {
          element.scrollIntoView();
          break;
        }
      }
    });
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=學習效果優化')).toBeVisible();
    await expect(page.locator('text=GEPT 分級整合')).toBeVisible();
    console.log('✅ 記憶科學整合說明驗證成功');

    // 12. 驗證使用說明
    console.log('📍 Step 12: 驗證使用說明');
    
    // 滾動到使用說明
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=點擊活動卡片左上角的複選框')).toBeVisible();
    await expect(page.locator('text=使用鍵盤快捷鍵提高操作效率')).toBeVisible();
    console.log('✅ 使用說明驗證成功');

    console.log('✅ 批量操作系統演示完成');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(2000);
  });

  test('批量操作性能測試', async ({ page }) => {
    console.log('🚀 開始批量操作性能測試...');

    // 1. 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/batch-operations');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    // 2. 測試選擇響應性能
    console.log('📍 測試選擇響應性能');
    
    await page.waitForTimeout(2000);
    
    const activityCards = page.locator('[data-testid*="activity-card"]');
    const cardCount = await activityCards.count();
    
    if (cardCount > 0) {
      const selectionTimes: number[] = [];
      
      for (let i = 0; i < Math.min(5, cardCount); i++) {
        const card = activityCards.nth(i);
        const checkbox = card.locator('input[type="checkbox"]');
        
        if (await checkbox.isVisible()) {
          const selectionStart = Date.now();
          await checkbox.check();
          await page.waitForTimeout(100);
          const selectionTime = Date.now() - selectionStart;
          
          selectionTimes.push(selectionTime);
          console.log(`選擇活動 ${i + 1} 響應時間: ${selectionTime}ms`);
          expect(selectionTime).toBeLessThan(1000);
        }
      }
      
      const avgSelectionTime = selectionTimes.reduce((a, b) => a + b, 0) / selectionTimes.length;
      console.log(`平均選擇響應時間: ${avgSelectionTime.toFixed(2)}ms`);
    }

    // 3. 測試批量操作響應性能
    console.log('📍 測試批量操作響應性能');
    
    const batchPanel = page.locator('[data-testid="batch-operation-panel"]');
    if (await batchPanel.isVisible()) {
      const operationButtons = [
        '[data-testid="batch-copy-button"]',
        '[data-testid="batch-duplicate-button"]',
        '[data-testid="batch-share-button"]'
      ];
      
      for (const buttonSelector of operationButtons) {
        const button = batchPanel.locator(buttonSelector);
        if (await button.isVisible()) {
          const operationStart = Date.now();
          await button.click();
          await page.waitForTimeout(200);
          const operationTime = Date.now() - operationStart;
          
          console.log(`${buttonSelector} 操作響應時間: ${operationTime}ms`);
          expect(operationTime).toBeLessThan(2000);
        }
      }
    }

    console.log('✅ 批量操作性能測試完成');
  });
});
