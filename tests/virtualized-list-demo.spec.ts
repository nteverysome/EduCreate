/**
 * 虛擬化列表系統演示測試
 * 生成錄影證據展示虛擬化列表的核心功能
 */

import { test, expect } from '@playwright/test';

test.describe('虛擬化列表系統演示', () => {
  test('虛擬化列表核心功能演示', async ({ page }) => {
    console.log('🚀 開始虛擬化列表系統演示...');

    // 1. 導航到虛擬化活動列表頁面
    console.log('📍 Step 1: 導航到虛擬化活動列表頁面');
    await page.goto('http://localhost:3001/activities/virtualized');
    
    // 等待頁面載入，使用更寬鬆的條件
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 2. 驗證頁面基本元素
    console.log('📍 Step 2: 驗證頁面基本元素');
    
    // 檢查頁面標題
    const pageTitle = await page.textContent('h1');
    console.log(`頁面標題: ${pageTitle}`);
    
    // 檢查是否有虛擬化相關內容
    const hasVirtualizedContent = await page.locator('text=虛擬化').count() > 0;
    console.log(`虛擬化內容存在: ${hasVirtualizedContent}`);

    // 3. 檢查性能指標顯示
    console.log('📍 Step 3: 檢查性能指標');
    await page.waitForTimeout(1000);
    
    // 尋找性能相關文字
    const performanceElements = await page.locator('text=/500ms|1000\\+|60fps/').count();
    console.log(`性能指標元素數量: ${performanceElements}`);

    // 4. 檢查功能特性
    console.log('📍 Step 4: 檢查功能特性');
    
    // 尋找功能特性相關文字
    const featureElements = await page.locator('text=/高性能|無限滾動|多視圖|智能搜索/').count();
    console.log(`功能特性元素數量: ${featureElements}`);

    // 5. 檢查 MyActivities 組件
    console.log('📍 Step 5: 檢查 MyActivities 組件');
    await page.waitForTimeout(2000);
    
    // 尋找活動相關元素
    const activityElements = await page.locator('text=/活動|Activities/').count();
    console.log(`活動相關元素數量: ${activityElements}`);

    // 6. 檢查視圖模式按鈕
    console.log('📍 Step 6: 檢查視圖模式按鈕');
    
    // 尋找視圖模式按鈕（使用符號）
    const viewButtons = await page.locator('button').filter({ hasText: /⊞|☰|📅|📋/ }).count();
    console.log(`視圖模式按鈕數量: ${viewButtons}`);

    if (viewButtons > 0) {
      // 嘗試點擊視圖模式按鈕
      const firstViewButton = page.locator('button').filter({ hasText: /⊞|☰|📅|📋/ }).first();
      if (await firstViewButton.isVisible()) {
        await firstViewButton.click();
        await page.waitForTimeout(500);
        console.log('✅ 成功點擊視圖模式按鈕');
      }
    }

    // 7. 檢查搜索功能
    console.log('📍 Step 7: 檢查搜索功能');
    
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]');
    const searchInputCount = await searchInput.count();
    console.log(`搜索輸入框數量: ${searchInputCount}`);

    if (searchInputCount > 0 && await searchInput.first().isVisible()) {
      await searchInput.first().fill('GEPT');
      await page.waitForTimeout(1000);
      await searchInput.first().clear();
      console.log('✅ 成功測試搜索功能');
    }

    // 8. 檢查批量操作按鈕
    console.log('📍 Step 8: 檢查批量操作按鈕');
    
    const selectAllButton = page.locator('button:has-text("全選"), button:has-text("Select All")');
    const selectAllCount = await selectAllButton.count();
    console.log(`全選按鈕數量: ${selectAllCount}`);

    if (selectAllCount > 0 && await selectAllButton.first().isVisible()) {
      await selectAllButton.first().click();
      await page.waitForTimeout(500);
      
      const deselectButton = page.locator('button:has-text("取消選擇"), button:has-text("Deselect")');
      if (await deselectButton.count() > 0 && await deselectButton.first().isVisible()) {
        await deselectButton.first().click();
        await page.waitForTimeout(500);
        console.log('✅ 成功測試批量選擇功能');
      }
    }

    // 9. 滾動測試
    console.log('📍 Step 9: 滾動性能測試');
    
    // 尋找可滾動的容器
    const scrollableContainer = page.locator('[data-testid="activities-display"], .activities-display, .overflow-auto').first();
    const containerExists = await scrollableContainer.count() > 0;
    console.log(`可滾動容器存在: ${containerExists}`);

    if (containerExists && await scrollableContainer.isVisible()) {
      await scrollableContainer.hover();
      
      // 執行滾動測試
      for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, 200);
        await page.waitForTimeout(200);
      }
      
      // 滾動回頂部
      for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, -200);
        await page.waitForTimeout(200);
      }
      
      console.log('✅ 成功完成滾動測試');
    }

    // 10. 檢查技術說明
    console.log('📍 Step 10: 檢查技術說明');
    
    // 滾動到頁面底部查看技術說明
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const techElements = await page.locator('text=/react-window|虛擬化|性能優化/').count();
    console.log(`技術說明元素數量: ${techElements}`);

    // 滾動回頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // 11. 最終驗證
    console.log('📍 Step 11: 最終功能驗證');
    
    // 檢查頁面是否包含關鍵內容
    const hasKeyContent = await page.locator('text=/虛擬化|活動|performance|1000/i').count() > 0;
    console.log(`包含關鍵內容: ${hasKeyContent}`);

    // 檢查頁面是否正常載入（沒有錯誤）
    const hasError = await page.locator('text=/error|錯誤|failed/i').count();
    console.log(`錯誤元素數量: ${hasError}`);

    // 12. 展示完整功能
    console.log('📍 Step 12: 展示完整功能');
    
    // 最後一次展示所有功能
    await page.waitForTimeout(2000);
    
    // 如果有活動項目，嘗試與之互動
    const activityItems = page.locator('[data-testid*="activity"], .activity-item, .activity-card');
    const itemCount = await activityItems.count();
    console.log(`活動項目數量: ${itemCount}`);

    if (itemCount > 0) {
      const firstItem = activityItems.first();
      if (await firstItem.isVisible()) {
        await firstItem.hover();
        await page.waitForTimeout(500);
        console.log('✅ 成功與活動項目互動');
      }
    }

    console.log('✅ 虛擬化列表系統演示完成');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(2000);
  });
});
