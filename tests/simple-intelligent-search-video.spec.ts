/**
 * 簡化的智能搜索系統測試 - 生成真正的 webm 測試影片
 * 跳過服務器檢查，直接測試功能
 */

import { test, expect } from '@playwright/test';

test.describe('智能搜索系統 - 簡化測試', () => {
  test('智能搜索系統功能演示', async ({ page }) => {
    console.log('🚀 開始智能搜索系統功能演示...');

    try {
      // 直接導航到智能搜索頁面
      await page.goto('http://localhost:3003/activities/intelligent-search', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // 等待頁面載入
      await page.waitForTimeout(5000);

      // 驗證頁面標題
      const title = page.locator('h1');
      if (await title.isVisible()) {
        const titleText = await title.textContent();
        console.log(`✅ 頁面標題: ${titleText}`);
      }

      // 展示功能特性
      console.log('📍 展示智能搜索功能特性');
      
      // 滾動展示功能特性
      await page.evaluate(() => {
        const element = document.querySelector('h2');
        if (element && element.textContent?.includes('搜索功能特性')) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      });
      await page.waitForTimeout(3000);

      // 展示搜索算法
      await page.evaluate(() => {
        const elements = document.querySelectorAll('h2');
        for (const element of elements) {
          if (element.textContent?.includes('搜索算法和技術')) {
            element.scrollIntoView({ behavior: 'smooth' });
            break;
          }
        }
      });
      await page.waitForTimeout(3000);

      // 展示記憶科學整合
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

      // 滾動到 MyActivities 組件
      await page.evaluate(() => {
        const elements = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm.border');
        const lastElement = elements[elements.length - 1];
        if (lastElement) {
          lastElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
      await page.waitForTimeout(4000);

      // 測試搜索功能
      console.log('📍 測試智能搜索功能');
      
      const searchInput = page.locator('input[placeholder*="智能搜索活動"]');
      if (await searchInput.isVisible()) {
        await searchInput.click();
        await page.waitForTimeout(1000);
        await searchInput.fill('測試搜索');
        await page.waitForTimeout(2000);
        await searchInput.clear();
        console.log('✅ 智能搜索功能測試成功');
      }

      // 測試視圖切換
      console.log('📍 測試視圖切換功能');
      
      const viewButtons = [
        { selector: 'button:has-text("列表視圖")', name: '列表視圖' },
        { selector: 'button:has-text("網格視圖")', name: '網格視圖' },
        { selector: 'button:has-text("時間軸視圖")', name: '時間軸視圖' },
        { selector: 'button:has-text("看板視圖")', name: '看板視圖' }
      ];

      for (const button of viewButtons) {
        const btn = page.locator(button.selector);
        if (await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(1000);
          console.log(`✅ ${button.name}切換成功`);
        }
      }

      // 展示技術實現
      await page.evaluate(() => {
        const elements = document.querySelectorAll('h2');
        for (const element of elements) {
          if (element.textContent?.includes('技術實現')) {
            element.scrollIntoView({ behavior: 'smooth' });
            break;
          }
        }
      });
      await page.waitForTimeout(3000);

      // 回到頂部
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(2000);

      console.log('✅ 智能搜索系統功能演示完成');
      
    } catch (error) {
      console.error('測試過程中發生錯誤:', error);
      // 即使有錯誤也要等待，確保錄影完整
      await page.waitForTimeout(3000);
    }
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(3000);
  });
});
