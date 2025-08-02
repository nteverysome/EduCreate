/**
 * EduCreate AutoSaveManager 修復後的錄影驗證測試
 * 完整演示自動保存系統的功能
 */

const { test, expect } = require('@playwright/test');

test.describe('EduCreate AutoSaveManager 修復後錄影驗證', () => {
  test('完整自動保存系統演示', async ({ page }) => {
    console.log('🎬 開始錄製 EduCreate AutoSaveManager 演示...');

    // 第1步：導航到主頁
    console.log('📍 Step 1: 導航到主頁');
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/EduCreate/);
    await page.waitForTimeout(2000);

    // 截圖：主頁
    await page.screenshot({ 
      path: 'test-results/fixed-01-homepage.png',
      fullPage: true 
    });

    // 第2步：點擊功能儀表板
    console.log('📍 Step 2: 點擊功能儀表板');
    await page.click('text=功能儀表板');
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(2000);

    // 截圖：儀表板
    await page.screenshot({ 
      path: 'test-results/fixed-02-dashboard.png',
      fullPage: true 
    });

    // 第3步：找到自動保存系統功能卡片 - 使用精確選擇器
    console.log('📍 Step 3: 尋找自動保存系統功能卡片');
    
    // 使用 data-testid 或更精確的選擇器
    const autoSaveSection = page.locator('h2:has-text("內容創建")').locator('..');
    const autoSaveCard = autoSaveSection.locator('h3:has-text("自動保存系統")');
    await expect(autoSaveCard).toBeVisible();
    
    await autoSaveCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 第4步：點擊自動保存系統的立即使用按鈕
    console.log('📍 Step 4: 點擊自動保存系統');
    
    // 使用 data-testid 來精確定位按鈕
    const useButton = page.getByTestId('feature-link-auto-save');
    await useButton.click();
    
    await page.waitForURL('**/content/autosave', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // 截圖：自動保存系統頁面
    await page.screenshot({ 
      path: 'test-results/fixed-03-autosave-system.png',
      fullPage: true 
    });

    // 第5步：驗證自動保存功能元素
    console.log('📍 Step 5: 驗證自動保存功能元素');
    
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();
    await expect(page.locator('h2:has-text("自動保存設定")')).toBeVisible();
    await expect(page.locator('h3:has-text("保存間隔")')).toBeVisible();
    await expect(page.locator('h3:has-text("保存統計")')).toBeVisible();
    await expect(page.locator('h2:has-text("自動保存會話")')).toBeVisible();
    await expect(page.locator('h2:has-text("自動保存技術特色")')).toBeVisible();

    // 第6步：測試保存間隔設定
    console.log('📍 Step 6: 測試保存間隔設定');
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    // 驗證默認值
    await expect(intervalSelect).toHaveValue('2');
    
    // 測試選項切換
    await intervalSelect.selectOption('1');
    await page.waitForTimeout(1000);
    await intervalSelect.selectOption('2'); // 回到默認值
    await page.waitForTimeout(1000);

    // 第7步：測試會話恢復功能
    console.log('📍 Step 7: 測試會話恢復功能');
    const restoreButtons = page.locator('button:has-text("恢復")');
    const buttonCount = await restoreButtons.count();
    
    if (buttonCount > 0) {
      await restoreButtons.first().click();
      await page.waitForTimeout(2000);
    }

    // 第8步：滾動查看所有功能
    console.log('📍 Step 8: 滾動查看所有功能');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // 第9步：返回儀表板
    console.log('📍 Step 9: 返回儀表板');
    await page.click('text=返回功能儀表板');
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(2000);

    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/fixed-04-final-dashboard.png',
      fullPage: true 
    });

    console.log('✅ AutoSaveManager 錄影驗證完成！');
    console.log('📁 生成的文件：');
    console.log('   - test-results/fixed-01-homepage.png');
    console.log('   - test-results/fixed-02-dashboard.png');
    console.log('   - test-results/fixed-03-autosave-system.png');
    console.log('   - test-results/fixed-04-final-dashboard.png');
  });

  test('自動保存性能測試', async ({ page }) => {
    console.log('🚀 開始自動保存性能測試...');

    await page.goto('http://localhost:3000/content/autosave');
    
    // 測量頁面載入時間
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);

    // 檢查關鍵元素是否存在
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();
    
    // 檢查保存間隔選擇器的值
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    await expect(intervalSelect).toHaveValue('2');
    
    await expect(page.locator('text=總保存次數')).toBeVisible();

    console.log('✅ 自動保存性能測試通過！');
  });
});
