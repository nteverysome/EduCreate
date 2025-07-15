/**
 * EduCreate AutoSaveManager 錄影驗證測試
 * 完整演示自動保存系統的功能
 */

const { test, expect } = require('@playwright/test');

test.describe('EduCreate AutoSaveManager 錄影驗證', () => {
  test('完整自動保存系統演示', async ({ page }) => {
    console.log('🎬 開始錄製 EduCreate AutoSaveManager 演示...');

    // 第1步：導航到主頁
    console.log('📍 Step 1: 導航到主頁');
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/EduCreate/);
    await page.waitForTimeout(2000); // 等待頁面完全載入

    // 截圖：主頁
    await page.screenshot({
      path: 'test-results/01-homepage.png',
      fullPage: true
    });

    // 第2步：點擊功能儀表板
    console.log('📍 Step 2: 點擊功能儀表板');
    await page.click('text=功能儀表板');
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(2000);

    // 截圖：儀表板
    await page.screenshot({
      path: 'test-results/02-dashboard.png',
      fullPage: true
    });

    // 第3步：找到自動保存系統功能卡片
    console.log('📍 Step 3: 尋找自動保存系統功能卡片');
    // 使用更精確的選擇器，選擇內容創建區域的自動保存系統標題
    const autoSaveCard = page.locator('h3:has-text("自動保存系統")');
    await expect(autoSaveCard).toBeVisible();

    // 高亮顯示自動保存卡片
    await autoSaveCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 第4步：點擊自動保存系統的立即使用按鈕
    console.log('📍 Step 4: 點擊自動保存系統');
    // 找到自動保存系統卡片中的立即使用按鈕
    const autoSaveUseButton = page.locator('h3:has-text("自動保存系統")').locator('..').locator('..').locator('a:has-text("立即使用")');
    await autoSaveUseButton.click();
    await page.waitForURL('**/content/autosave', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // 截圖：自動保存系統頁面
    await page.screenshot({ 
      path: 'test-results/03-autosave-system.png',
      fullPage: true 
    });

    // 第5步：驗證自動保存功能元素
    console.log('📍 Step 5: 驗證自動保存功能元素');

    // 檢查標題
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    // 檢查設定區域
    await expect(page.locator('h2:has-text("自動保存設定")')).toBeVisible();
    await expect(page.locator('h3:has-text("保存間隔")')).toBeVisible();
    await expect(page.locator('h3:has-text("保存統計")')).toBeVisible();

    // 檢查會話區域
    await expect(page.locator('h2:has-text("自動保存會話")')).toBeVisible();

    // 檢查技術特色
    await expect(page.locator('h2:has-text("自動保存技術特色")')).toBeVisible();
    await expect(page.locator('h3:has-text("智能保存")')).toBeVisible();
    await expect(page.locator('h3:has-text("衝突解決")')).toBeVisible();
    await expect(page.locator('h3:has-text("離線支援")')).toBeVisible();

    // 第6步：測試保存間隔設定
    console.log('📍 Step 6: 測試保存間隔設定');
    const intervalSelect = page.locator('select, combobox').first();
    await intervalSelect.selectOption('1 秒');
    await page.waitForTimeout(1000);
    await intervalSelect.selectOption('2 秒'); // 回到默認值
    await page.waitForTimeout(1000);

    // 驗證選擇的值
    await expect(intervalSelect).toHaveValue('2');

    // 第7步：測試會話恢復功能
    console.log('📍 Step 7: 測試會話恢復功能');
    const restoreButtons = page.locator('button:has-text("恢復")');
    const buttonCount = await restoreButtons.count();
    
    if (buttonCount > 0) {
      // 點擊第一個恢復按鈕
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
      path: 'test-results/04-final-dashboard.png',
      fullPage: true
    });

    console.log('✅ AutoSaveManager 錄影驗證完成！');
    console.log('📁 生成的文件：');
    console.log('   - test-results/01-homepage.png');
    console.log('   - test-results/02-dashboard.png');
    console.log('   - test-results/03-autosave-system.png');
    console.log('   - test-results/04-final-dashboard.png');
    console.log('   - test-results/autosave-demo-trace.zip');
  });

  test('自動保存性能測試', async ({ page }) => {
    console.log('🚀 開始自動保存性能測試...');

    await page.goto('http://localhost:3000/content/autosave');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // 應該在3秒內載入

    // 檢查關鍵元素是否存在
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    // 檢查保存間隔選擇器的值，而不是選項的可見性
    const intervalSelect = page.locator('select, combobox').first();
    await expect(intervalSelect).toHaveValue('2'); // 默認2秒間隔

    await expect(page.locator('text=總保存次數')).toBeVisible();

    console.log('✅ 自動保存性能測試通過！');
  });
});
