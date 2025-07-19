/**
 * Day 8-10: 控制台錯誤調試測試
 * 檢查 MyActivities 頁面的 JavaScript 錯誤
 */

import { test, expect } from '@playwright/test';

test.describe('Day 8-10: 控制台錯誤調試', () => {
  test('檢查控制台錯誤', async ({ page }) => {
    // 收集控制台消息
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });

    console.log('🎬 開始檢查 MyActivities 頁面的控制台錯誤...');

    await page.goto('http://localhost:3000/my-activities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('📊 控制台消息總數:', consoleMessages.length);
    console.log('❌ 錯誤消息總數:', errors.length);

    if (errors.length > 0) {
      console.log('🐛 發現的錯誤:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ 沒有發現錯誤');
    }

    // 顯示一些有用的控制台消息
    console.log('📝 最近的控制台消息:');
    consoleMessages.slice(-10).forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg}`);
    });

    console.log('🎉 控制台錯誤檢查完成！');
  });
});
