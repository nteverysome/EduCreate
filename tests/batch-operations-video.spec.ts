/**
 * 批量操作系統測試 - 生成測試影片
 * 專門用於生成測試影片並使用 EduCreate 測試影片管理系統
 */

import { test, expect } from '@playwright/test';

test.describe('批量操作系統 - 測試影片生成', () => {
  test('批量操作系統功能演示 - 生成測試影片', async ({ page }) => {
    console.log('🚀 開始批量操作系統功能演示並生成測試影片...');

    // 1. 導航到批量操作頁面
    console.log('📍 Step 1: 導航到批量操作頁面');
    await page.goto('http://localhost:3003/activities/batch-operations');
    
    // 等待頁面載入
    await page.waitForTimeout(5000);

    // 2. 驗證頁面載入成功
    console.log('📍 Step 2: 驗證頁面載入成功');
    
    // 檢查頁面標題
    const title = page.locator('h1');
    if (await title.isVisible()) {
      const titleText = await title.textContent();
      console.log(`✅ 頁面標題: ${titleText}`);
    }

    // 3. 展示批量操作功能特性
    console.log('📍 Step 3: 展示批量操作功能特性');
    
    // 滾動展示功能特性
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('批量操作功能特性')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 4. 展示操作流程說明
    console.log('📍 Step 4: 展示操作流程說明');
    
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('操作流程')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 5. 展示安全和性能說明
    console.log('📍 Step 5: 展示安全和性能說明');
    
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('安全和性能')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 6. 展示記憶科學整合
    console.log('📍 Step 6: 展示記憶科學整合');
    
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('記憶科學整合')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 7. 滾動到 MyActivities 組件
    console.log('📍 Step 7: 展示 MyActivities 組件');
    
    await page.evaluate(() => {
      const elements = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm.border');
      const lastElement = elements[elements.length - 1];
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(4000);

    // 8. 測試活動選擇功能（如果有活動卡片）
    console.log('📍 Step 8: 測試活動選擇功能');
    
    const activityCards = page.locator('[data-testid*="activity-card"]');
    const cardCount = await activityCards.count();
    
    if (cardCount > 0) {
      console.log(`找到 ${cardCount} 個活動卡片`);
      
      // 嘗試選擇第一個活動
      const firstCard = activityCards.first();
      const checkbox = firstCard.locator('input[type="checkbox"]');
      
      if (await checkbox.isVisible()) {
        await checkbox.check();
        await page.waitForTimeout(2000);
        console.log('✅ 成功選擇活動');
        
        // 檢查批量操作面板
        const batchPanel = page.locator('[data-testid="batch-operation-panel"]');
        if (await batchPanel.isVisible()) {
          console.log('✅ 批量操作面板顯示成功');
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('⚠️ 未找到活動卡片，展示空狀態');
      await page.waitForTimeout(2000);
    }

    // 9. 展示使用說明
    console.log('📍 Step 9: 展示使用說明');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    // 10. 回到頂部完成演示
    console.log('📍 Step 10: 回到頂部完成演示');
    
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    console.log('✅ 批量操作系統功能演示完成');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(3000);
  });
});
