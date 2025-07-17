/**
 * 生成批量操作系統真正的測試影片
 */

import { test, expect } from '@playwright/test';

test.describe('生成批量操作系統測試影片', () => {
  test('批量操作系統功能演示', async ({ page }) => {
    console.log('🎬 開始生成批量操作系統測試影片...');

    // 1. 導航到批量操作頁面
    await page.goto('http://localhost:3003/activities/batch-operations');
    
    // 等待頁面完全載入
    await page.waitForTimeout(3000);

    // 2. 驗證頁面標題
    const title = page.locator('h1');
    await expect(title).toContainText('批量操作系統');
    console.log('✅ 頁面標題驗證成功');

    // 3. 滾動展示功能特性
    await page.evaluate(() => {
      const element = document.querySelector('h2');
      if (element && element.textContent?.includes('批量操作功能特性')) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(2000);

    // 4. 展示操作流程
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('操作流程')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(2000);

    // 5. 展示記憶科學整合
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('記憶科學整合')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(2000);

    // 6. 滾動到 MyActivities 組件
    await page.evaluate(() => {
      const elements = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm.border');
      const lastElement = elements[elements.length - 1];
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    // 7. 測試搜索功能
    const searchInput = page.locator('input[placeholder*="搜索活動"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('測試搜索');
      await page.waitForTimeout(1000);
      await searchInput.clear();
      console.log('✅ 搜索功能測試完成');
    }

    // 8. 測試視圖切換
    const gridViewButton = page.locator('button:has-text("網格視圖")');
    if (await gridViewButton.isVisible()) {
      await gridViewButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 視圖切換測試完成');
    }

    // 9. 回到頂部
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    console.log('✅ 批量操作系統測試影片生成完成');
  });
});
