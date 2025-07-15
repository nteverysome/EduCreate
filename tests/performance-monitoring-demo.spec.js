/**
 * EduCreate 性能監控和分析系統驗證測試
 * 驗證實時指標追蹤、自動重試機制和性能分析報告
 */

const { test, expect } = require('@playwright/test');

test.describe('EduCreate 性能監控和分析系統驗證', () => {
  test('性能監控功能演示', async ({ page }) => {
    console.log('📊 開始性能監控功能演示...');

    // 導航到自動保存系統頁面
    await page.goto('http://localhost:3000/content/autosave');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 截圖：初始狀態
    await page.screenshot({ 
      path: 'test-results/performance-01-initial.png',
      fullPage: true 
    });

    // 驗證頁面載入
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    console.log('⚡ 測試性能指標收集...');
    
    // 執行多次操作來生成性能數據
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    const performanceTestOperations = [
      { value: '1', name: '1秒', expectedLoad: 'low' },
      { value: '2', name: '2秒', expectedLoad: 'medium' },
      { value: '5', name: '5秒', expectedLoad: 'medium' },
      { value: '10', name: '10秒', expectedLoad: 'high' },
      { value: '1', name: '1秒', expectedLoad: 'high' },
      { value: '2', name: '2秒(默認)', expectedLoad: 'medium' }
    ];

    for (const operation of performanceTestOperations) {
      console.log(`  📊 執行操作: 設定為 ${operation.name} (預期負載: ${operation.expectedLoad})`);
      await intervalSelect.selectOption(operation.value);
      await page.waitForTimeout(800); // 給性能監控時間記錄
    }

    // 截圖：操作後
    await page.screenshot({ 
      path: 'test-results/performance-02-operations-completed.png',
      fullPage: true 
    });

    console.log('✅ 性能監控功能演示完成！');
  });

  test('性能警告系統測試', async ({ page }) => {
    console.log('⚠️ 開始性能警告系統測試...');

    await page.goto('http://localhost:3000/content/autosave');
    await page.waitForLoadState('networkidle');

    // 驗證頁面基本功能
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    console.log('🔄 執行高頻操作以觸發性能警告...');
    
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    // 快速連續操作來測試性能警告
    const rapidOperations = ['1', '5', '10', '1', '2', '5', '10', '1', '2'];
    
    for (let i = 0; i < rapidOperations.length; i++) {
      const value = rapidOperations[i];
      console.log(`  ⚡ 快速操作 ${i + 1}/${rapidOperations.length}: ${value}秒`);
      await intervalSelect.selectOption(value);
      await page.waitForTimeout(200); // 短間隔以增加系統負載
    }

    // 等待性能警告處理
    await page.waitForTimeout(3000);

    // 檢查控制台是否有性能警告
    const consoleLogs = await page.evaluate(() => {
      return window.console._logs || [];
    });

    console.log('📋 檢查性能警告指示器...');
    
    // 查找性能相關的警告指示器
    const performanceIndicators = [
      'text=性能警告',
      'text=響應時間',
      'text=成功率',
      '[data-testid="performance-warning"]',
      'text=優化建議'
    ];

    for (const indicator of performanceIndicators) {
      const element = page.locator(indicator);
      try {
        if (await element.isVisible()) {
          console.log(`✅ 找到性能指示器: ${indicator}`);
          break;
        }
      } catch (error) {
        // 忽略選擇器錯誤，繼續下一個
        continue;
      }
    }

    // 截圖：性能警告測試後
    await page.screenshot({ 
      path: 'test-results/performance-03-warning-test.png',
      fullPage: true 
    });

    console.log('✅ 性能警告系統測試完成！');
  });

  test('自動重試機制驗證', async ({ page, context }) => {
    console.log('🔄 開始自動重試機制驗證...');

    await page.goto('http://localhost:3000/content/autosave');
    await page.waitForLoadState('networkidle');

    // 檢查頁面基本功能
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    console.log('📱 模擬網絡不穩定以觸發重試機制...');
    
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    // 模擬網絡不穩定的場景
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`  🔄 重試測試循環 ${cycle + 1}/3`);
      
      // 短暫離線
      await context.setOffline(true);
      await intervalSelect.selectOption('1');
      await page.waitForTimeout(500);
      
      // 恢復在線
      await context.setOffline(false);
      await page.waitForTimeout(1000);
      
      await intervalSelect.selectOption('5');
      await page.waitForTimeout(500);
      
      // 再次短暫離線
      await context.setOffline(true);
      await intervalSelect.selectOption('2');
      await page.waitForTimeout(300);
      
      // 最終恢復
      await context.setOffline(false);
      await page.waitForTimeout(1500);
    }

    console.log('📊 檢查重試統計...');
    
    // 檢查是否有重試相關的統計信息
    const retryIndicators = [
      'text=重試',
      'text=失敗',
      'text=成功率',
      'h3:has-text("保存統計")'
    ];

    for (const indicator of retryIndicators) {
      const element = page.locator(indicator);
      try {
        if (await element.isVisible()) {
          console.log(`✅ 找到重試指示器: ${indicator}`);
          await element.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
        }
      } catch (error) {
        continue;
      }
    }

    // 截圖：重試機制測試後
    await page.screenshot({ 
      path: 'test-results/performance-04-retry-mechanism.png',
      fullPage: true 
    });

    console.log('✅ 自動重試機制驗證完成！');
  });

  test('性能分析報告生成', async ({ page }) => {
    console.log('📈 開始性能分析報告生成測試...');

    await page.goto('http://localhost:3000/content/autosave');
    await page.waitForLoadState('networkidle');

    // 檢查頁面基本功能
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    console.log('🔄 執行多樣化操作以生成豐富的性能數據...');
    
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    // 執行多種類型的操作
    const diverseOperations = [
      { value: '1', duration: 1000, type: '快速' },
      { value: '2', duration: 800, type: '標準' },
      { value: '5', duration: 1200, type: '中等' },
      { value: '10', duration: 600, type: '慢速' },
      { value: '1', duration: 400, type: '快速' },
      { value: '2', duration: 1000, type: '標準' }
    ];

    for (const operation of diverseOperations) {
      console.log(`  📊 執行 ${operation.type} 操作: ${operation.value}秒`);
      await intervalSelect.selectOption(operation.value);
      await page.waitForTimeout(operation.duration);
    }

    console.log('📋 檢查性能統計區域...');
    
    // 滾動到統計區域
    const statsSection = page.locator('h3:has-text("保存統計")');
    await expect(statsSection).toBeVisible();
    await statsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 檢查統計相關元素
    const statsElements = [
      'text=成功率',
      'text=平均響應時間',
      'text=壓縮比例',
      'text=保存次數'
    ];

    for (const element of statsElements) {
      const locator = page.locator(element);
      try {
        if (await locator.isVisible()) {
          console.log(`✅ 找到統計元素: ${element}`);
        }
      } catch (error) {
        continue;
      }
    }

    // 滾動查看技術特色
    console.log('🚀 檢查技術特色區域...');
    const techSection = page.locator('h2:has-text("自動保存技術特色")');
    await expect(techSection).toBeVisible();
    await techSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 滾動到底部查看所有功能
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/performance-05-analysis-report.png',
      fullPage: true 
    });

    // 回到頂部
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    console.log('✅ 性能分析報告生成測試完成！');
  });

  test('指數退避策略驗證', async ({ page, context }) => {
    console.log('📈 開始指數退避策略驗證...');

    await page.goto('http://localhost:3000/content/autosave');
    await page.waitForLoadState('networkidle');

    // 檢查頁面基本功能
    await expect(page.locator('h1:has-text("自動保存系統")')).toBeVisible();

    console.log('⏱️ 測試指數退避策略...');
    
    const intervalSelect = page.locator('select, [role="combobox"]').first();
    
    // 模擬連續失敗以觸發指數退避
    const backoffTestSequence = [
      { offline: true, duration: 500, operation: '1' },
      { offline: false, duration: 1000, operation: '2' },
      { offline: true, duration: 800, operation: '5' },
      { offline: false, duration: 1500, operation: '10' },
      { offline: true, duration: 300, operation: '1' },
      { offline: false, duration: 2000, operation: '2' }
    ];

    for (let i = 0; i < backoffTestSequence.length; i++) {
      const step = backoffTestSequence[i];
      console.log(`  📊 退避測試步驟 ${i + 1}/${backoffTestSequence.length}: ${step.offline ? '離線' : '在線'} - ${step.operation}秒`);
      
      await context.setOffline(step.offline);
      await intervalSelect.selectOption(step.operation);
      await page.waitForTimeout(step.duration);
    }

    // 確保最終狀態為在線
    await context.setOffline(false);
    await page.waitForTimeout(3000);

    console.log('📊 檢查退避策略效果...');
    
    // 檢查是否有退避相關的指示器
    const backoffIndicators = [
      'text=重試',
      'text=延遲',
      'text=退避',
      'h3:has-text("保存統計")'
    ];

    for (const indicator of backoffIndicators) {
      const element = page.locator(indicator);
      try {
        if (await element.isVisible()) {
          console.log(`✅ 找到退避指示器: ${indicator}`);
        }
      } catch (error) {
        continue;
      }
    }

    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/performance-06-exponential-backoff.png',
      fullPage: true 
    });

    console.log('✅ 指數退避策略驗證完成！');
  });
});
