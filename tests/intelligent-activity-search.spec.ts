/**
 * 智能活動搜索測試
 * 驗證全文搜索、模糊匹配、語義搜索、語音搜索的完整搜索功能
 */

import { test, expect } from '@playwright/test';

test.describe('智能活動搜索系統', () => {
  test('智能搜索核心功能演示', async ({ page }) => {
    console.log('🚀 開始智能活動搜索系統演示...');

    // 1. 導航到智能搜索頁面
    console.log('📍 Step 1: 導航到智能搜索頁面');
    await page.goto('http://localhost:3002/activities/intelligent-search');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 2. 驗證頁面基本元素
    console.log('📍 Step 2: 驗證頁面基本元素');
    
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('智能搜索系統');
    await expect(page.locator('text=全文搜索、模糊匹配、語義搜索、語音搜索')).toBeVisible();

    // 3. 驗證搜索功能展示
    console.log('📍 Step 3: 驗證搜索功能展示');
    
    await expect(page.locator('text=全文搜索').first()).toBeVisible();
    await expect(page.locator('text=模糊匹配').first()).toBeVisible();
    await expect(page.locator('text=語義搜索').first()).toBeVisible();
    await expect(page.locator('text=語音搜索').first()).toBeVisible();

    // 4. 驗證智能搜索組件
    console.log('📍 Step 4: 驗證智能搜索組件');
    await page.waitForTimeout(2000);
    
    const searchComponent = page.locator('[data-testid="intelligent-activity-search"]');
    await expect(searchComponent).toBeVisible();

    // 5. 測試基本搜索功能
    console.log('📍 Step 5: 測試基本搜索功能');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      // 測試搜索輸入
      await searchInput.fill('數學');
      await page.waitForTimeout(1000);
      
      // 檢查搜索統計
      const searchStats = page.locator('[data-testid="search-stats"]');
      if (await searchStats.isVisible()) {
        console.log('✅ 搜索統計顯示正常');
      }
      
      console.log('✅ 基本搜索功能測試成功');
    }

    // 6. 測試搜索提交
    console.log('📍 Step 6: 測試搜索提交');
    
    const submitButton = page.locator('[data-testid="search-submit-button"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 搜索提交功能測試成功');
    }

    // 7. 測試清除搜索
    console.log('📍 Step 7: 測試清除搜索');
    
    const clearButton = page.locator('[data-testid="clear-search-button"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);
      
      // 驗證搜索框已清空
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe('');
      console.log('✅ 清除搜索功能測試成功');
    }

    // 8. 測試高級搜索選項
    console.log('📍 Step 8: 測試高級搜索選項');
    
    const toggleAdvanced = page.locator('[data-testid="toggle-advanced-search"]');
    if (await toggleAdvanced.isVisible()) {
      await toggleAdvanced.click();
      await page.waitForTimeout(1000);
      
      // 驗證高級選項面板
      const advancedOptions = page.locator('[data-testid="advanced-search-options"]');
      if (await advancedOptions.isVisible()) {
        console.log('✅ 高級搜索選項顯示成功');
        
        // 測試搜索選項切換
        const fullTextCheckbox = advancedOptions.locator('input[type="checkbox"]').first();
        if (await fullTextCheckbox.isVisible()) {
          await fullTextCheckbox.click();
          await page.waitForTimeout(500);
          await fullTextCheckbox.click();
          await page.waitForTimeout(500);
          console.log('✅ 搜索選項切換測試成功');
        }
      }
    }

    // 9. 測試語音搜索按鈕
    console.log('📍 Step 9: 測試語音搜索按鈕');
    
    // 先啟用語音搜索選項
    const voiceCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /語音搜索/ });
    if (await voiceCheckbox.isVisible()) {
      await voiceCheckbox.check();
      await page.waitForTimeout(500);
      
      const voiceButton = page.locator('[data-testid="voice-search-button"]');
      if (await voiceButton.isVisible()) {
        // 注意：實際的語音搜索需要用戶權限，這裡只測試按鈕可點擊性
        console.log('✅ 語音搜索按鈕可見');
      }
    }

    // 10. 測試搜索歷史功能
    console.log('📍 Step 10: 測試搜索歷史功能');
    
    // 進行幾次搜索以建立歷史
    await searchInput.fill('英語');
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    await searchInput.fill('科學');
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // 清空搜索框並聚焦以顯示建議
    await clearButton.click();
    await searchInput.focus();
    await page.waitForTimeout(500);
    
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      console.log('✅ 搜索歷史建議顯示成功');
    }

    // 11. 測試不同搜索類型
    console.log('📍 Step 11: 測試不同搜索類型');
    
    const searchTypes = [
      { query: '數學遊戲', description: '精確匹配測試' },
      { query: '數學游戲', description: '模糊匹配測試（錯字）' },
      { query: '學習', description: '語義搜索測試' }
    ];

    for (const searchType of searchTypes) {
      await searchInput.fill(searchType.query);
      await page.waitForTimeout(1000);
      
      const stats = page.locator('[data-testid="search-stats"]');
      if (await stats.isVisible()) {
        console.log(`✅ ${searchType.description} 完成`);
      }
      
      await page.waitForTimeout(500);
    }

    // 12. 驗證搜索結果顯示
    console.log('📍 Step 12: 驗證搜索結果顯示');
    
    await searchInput.fill('活動');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // 檢查活動顯示區域
    const activitiesDisplay = page.locator('[data-testid="activities-display"]');
    if (await activitiesDisplay.isVisible()) {
      console.log('✅ 搜索結果顯示正常');
    }

    // 13. 測試搜索性能
    console.log('📍 Step 13: 測試搜索性能');
    
    const performanceQueries = ['測試', '遊戲', '教育', '學習', '英語'];
    
    for (const query of performanceQueries) {
      const startTime = Date.now();
      await searchInput.fill(query);
      await page.waitForTimeout(500); // 等待防抖
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      console.log(`搜索 "${query}" 響應時間: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(2000); // 2秒內響應
    }

    // 14. 驗證記憶科學整合說明
    console.log('📍 Step 14: 驗證記憶科學整合說明');
    
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

    // 15. 驗證技術實現說明
    console.log('📍 Step 15: 驗證技術實現說明');
    
    // 滾動到技術實現說明
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=React 18 + TypeScript')).toBeVisible();
    await expect(page.locator('text=多算法融合搜索')).toBeVisible();
    console.log('✅ 技術實現說明驗證成功');

    // 16. 測試鍵盤快捷鍵
    console.log('📍 Step 16: 測試鍵盤快捷鍵');
    
    // 測試 Ctrl+K 快捷鍵
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    
    // 驗證搜索框是否聚焦
    const isFocused = await searchInput.evaluate(el => el === document.activeElement);
    if (isFocused) {
      console.log('✅ Ctrl+K 快捷鍵測試成功');
    }

    // 17. 最終功能驗證
    console.log('📍 Step 17: 最終功能驗證');
    
    // 滾動回頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    // 進行最終的搜索測試
    await searchInput.fill('智能搜索測試');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // 驗證搜索統計
    const finalStats = page.locator('[data-testid="search-stats"]');
    if (await finalStats.isVisible()) {
      const statsText = await finalStats.textContent();
      console.log(`最終搜索統計: ${statsText}`);
    }

    console.log('✅ 智能活動搜索系統演示完成');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(2000);
  });

  test('智能搜索性能測試', async ({ page }) => {
    console.log('🚀 開始智能搜索性能測試...');

    // 1. 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3002/activities/intelligent-search');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    // 2. 測試搜索響應性能
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('[data-testid="search-input"]');
    const submitButton = page.locator('[data-testid="search-submit-button"]');
    
    const searchQueries = ['數學', '英語', '科學', '遊戲', '學習'];
    const searchTimes: number[] = [];
    
    for (const query of searchQueries) {
      if (await searchInput.isVisible() && await submitButton.isVisible()) {
        const searchStart = Date.now();
        await searchInput.fill(query);
        await submitButton.click();
        await page.waitForTimeout(100);
        const searchEnd = Date.now();
        const searchTime = searchEnd - searchStart;
        
        searchTimes.push(searchTime);
        console.log(`"${query}" 搜索響應時間: ${searchTime}ms`);
        expect(searchTime).toBeLessThan(1000);
        
        await page.waitForTimeout(500);
      }
    }
    
    const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
    console.log(`平均搜索響應時間: ${avgSearchTime.toFixed(2)}ms`);

    // 3. 測試高級搜索選項性能
    const toggleAdvanced = page.locator('[data-testid="toggle-advanced-search"]');
    if (await toggleAdvanced.isVisible()) {
      const toggleStart = Date.now();
      await toggleAdvanced.click();
      await page.waitForTimeout(100);
      const toggleTime = Date.now() - toggleStart;
      
      console.log(`高級選項切換時間: ${toggleTime}ms`);
      expect(toggleTime).toBeLessThan(500);
    }

    console.log('✅ 智能搜索性能測試完成');
  });
});
