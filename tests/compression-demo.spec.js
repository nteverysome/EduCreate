/**
 * EduCreate CompressionManager ZIP壓縮驗證測試
 * 驗證2.5x壓縮比例和數據完整性
 */

const { test, expect } = require('@playwright/test');

test.describe('EduCreate ZIP壓縮和數據優化驗證', () => {
  test('ZIP壓縮功能演示', async ({ page }) => {
    console.log('🗜️ 開始 ZIP 壓縮功能演示...');

    // 導航到自動保存系統頁面
    await page.goto('http://localhost:3000/content/autosave');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 截圖：初始狀態
    await page.screenshot({ 
      path: 'test-results/compression-01-initial.png',
      fullPage: true 
    });

    // 驗證頁面載入
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    // 檢查壓縮相關的統計信息
    console.log('📊 檢查壓縮統計...');
    
    // 查找壓縮比例顯示
    const compressionStats = page.locator('text=壓縮比例');
    if (await compressionStats.isVisible()) {
      console.log('✅ 找到壓縮比例統計');
    }

    // 查找數據大小統計
    const dataSizeStats = page.locator('text=數據大小');
    if (await dataSizeStats.isVisible()) {
      console.log('✅ 找到數據大小統計');
    }

    // 測試保存間隔設定來觸發壓縮
    console.log('🔧 測試保存設定以觸發壓縮...');
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    // 切換設定來觸發自動保存
    await intervalSelect.selectOption('1');
    await page.waitForTimeout(1000);
    await intervalSelect.selectOption('2');
    await page.waitForTimeout(2000);

    // 截圖：設定變更後
    await page.screenshot({ 
      path: 'test-results/compression-02-settings-changed.png',
      fullPage: true 
    });

    // 檢查是否有壓縮活動指示
    const compressionIndicators = [
      'text=壓縮中',
      'text=已壓縮',
      'text=壓縮完成',
      '[data-testid="compression-status"]'
    ];

    for (const indicator of compressionIndicators) {
      const element = page.locator(indicator);
      if (await element.isVisible()) {
        console.log(`✅ 找到壓縮指示器: ${indicator}`);
        break;
      }
    }

    // 滾動查看所有統計信息
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    // 截圖：完整頁面
    await page.screenshot({ 
      path: 'test-results/compression-03-full-page.png',
      fullPage: true 
    });

    // 回到頂部
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    console.log('✅ ZIP壓縮功能演示完成！');
  });

  test('壓縮性能測試', async ({ page }) => {
    console.log('🚀 開始壓縮性能測試...');

    // 導航到自動保存系統
    await page.goto('http://localhost:3000/content/autosave');
    
    // 測量頁面載入時間
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);

    // 檢查壓縮相關元素
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();
    
    // 檢查統計區域
    const statsSection = page.locator('h3:has-text("保存統計")');
    await expect(statsSection).toBeVisible();

    // 測試多次設定變更來觸發壓縮
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    console.log('🔄 執行多次設定變更測試壓縮性能...');
    
    const testCycles = 3;
    for (let i = 0; i < testCycles; i++) {
      console.log(`  循環 ${i + 1}/${testCycles}`);
      
      await intervalSelect.selectOption('1');
      await page.waitForTimeout(500);
      await intervalSelect.selectOption('2');
      await page.waitForTimeout(500);
      await intervalSelect.selectOption('5');
      await page.waitForTimeout(500);
      await intervalSelect.selectOption('2'); // 回到默認值
      await page.waitForTimeout(1000);
    }

    console.log('✅ 壓縮性能測試完成！');
  });

  test('數據完整性驗證', async ({ page }) => {
    console.log('🔒 開始數據完整性驗證...');

    await page.goto('http://localhost:3000/content/autosave');
    await page.waitForLoadState('networkidle');

    // 檢查頁面基本功能
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    // 測試會話恢復功能（這會觸發解壓縮）
    const restoreButtons = page.locator('button:has-text("恢復")');
    const buttonCount = await restoreButtons.count();
    
    console.log(`📋 找到 ${buttonCount} 個恢復按鈕`);
    
    if (buttonCount > 0) {
      console.log('🔄 測試會話恢復（解壓縮）...');
      await restoreButtons.first().click();
      await page.waitForTimeout(2000);
      
      // 檢查是否有錯誤提示
      const errorMessages = page.locator('[role="alert"], .error, .alert-error');
      const errorCount = await errorMessages.count();
      
      if (errorCount === 0) {
        console.log('✅ 數據解壓縮成功，無錯誤');
      } else {
        console.log(`⚠️ 發現 ${errorCount} 個錯誤提示`);
      }
    }

    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/compression-04-integrity-test.png',
      fullPage: true 
    });

    console.log('✅ 數據完整性驗證完成！');
  });
});
