/**
 * Day 8-10: 虛擬化列表調試測試
 * 專門調試虛擬化功能不可見的問題
 */

import { test, expect } from '@playwright/test';

test.describe('Day 8-10: 虛擬化列表調試', () => {
  test('虛擬化列表深度調試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 8-10 虛擬化列表調試測試影片...');

    await page.goto('http://localhost:3000/my-activities');
    await page.waitForLoadState('networkidle');
    
    // 等待更長時間讓組件完全載入
    console.log('⏳ 等待組件完全載入...');
    await page.waitForTimeout(5000);

    // 檢查 MyActivities 組件是否載入
    console.log('📋 檢查 MyActivities 組件載入狀況');
    const myActivitiesContainer = page.getByTestId('my-activities-container');
    if (await myActivitiesContainer.isVisible()) {
      console.log('   ✅ MyActivities 容器存在');
    } else {
      console.log('   ❌ MyActivities 容器不存在');
    }

    // 檢查 Suspense 載入狀態
    const loadingIndicator = page.locator('text=載入活動管理系統...');
    if (await loadingIndicator.isVisible()) {
      console.log('   ⏳ 組件正在載入中...');
      await page.waitForTimeout(3000);
    }

    // 檢查活動數據是否載入
    console.log('📊 檢查活動數據載入狀況');
    const activitiesDisplay = page.getByTestId('activities-display');
    if (await activitiesDisplay.isVisible()) {
      console.log('   ✅ 活動顯示區域存在');
    } else {
      console.log('   ❌ 活動顯示區域不存在');
    }

    // 檢查虛擬化指示器
    console.log('🔍 檢查虛擬化指示器');
    const virtualizedIndicator = page.getByTestId('virtualized-indicator');
    if (await virtualizedIndicator.isVisible()) {
      console.log('   ✅ 虛擬化指示器可見');
      const text = await virtualizedIndicator.textContent();
      console.log(`   📝 指示器文字: ${text}`);
    } else {
      console.log('   ❌ 虛擬化指示器不可見');
    }

    // 檢查虛擬化列表組件
    console.log('📋 檢查虛擬化列表組件');
    const virtualizedList = page.getByTestId('virtualized-activity-list');
    if (await virtualizedList.isVisible()) {
      console.log('   ✅ 虛擬化列表組件可見');
    } else {
      console.log('   ❌ 虛擬化列表組件不可見');
    }

    // 檢查所有可能的虛擬化相關元素
    console.log('🔎 檢查所有虛擬化相關元素');
    const allVirtualElements = page.locator('[class*="virtual"], [data-testid*="virtual"], [class*="Virtual"]');
    const virtualCount = await allVirtualElements.count();
    console.log(`   📊 發現 ${virtualCount} 個虛擬化相關元素`);

    for (let i = 0; i < Math.min(virtualCount, 5); i++) {
      const element = allVirtualElements.nth(i);
      const className = await element.getAttribute('class');
      const testId = await element.getAttribute('data-testid');
      const isVisible = await element.isVisible();
      console.log(`   ${i + 1}. class="${className}" testid="${testId}" visible=${isVisible}`);
    }

    // 檢查活動項目數量
    console.log('📝 檢查活動項目數量');
    const activityItems = page.locator('[data-testid*="activity-"], .activity-item, .activity');
    const itemCount = await activityItems.count();
    console.log(`   📊 發現 ${itemCount} 個活動項目`);

    // 檢查活動總數顯示
    const activityCountText = page.locator('text=/活動 \\(\\d+/');
    if (await activityCountText.isVisible()) {
      const countText = await activityCountText.textContent();
      console.log(`   📊 活動總數顯示: ${countText}`);
    }

    // 檢查視圖模式
    console.log('🔄 檢查當前視圖模式');
    const activeViewButton = page.locator('[class*="bg-blue-600"]').filter({ hasText: /網格|列表|時間軸|看板/ }).first();
    if (await activeViewButton.isVisible()) {
      const viewMode = await activeViewButton.textContent();
      console.log(`   📊 當前視圖模式: ${viewMode}`);
      
      // 如果不是網格或列表模式，切換到網格模式
      if (!viewMode?.includes('網格') && !viewMode?.includes('列表')) {
        console.log('   🔄 切換到網格模式以啟用虛擬化');
        const gridButton = page.getByTestId('view-grid');
        if (await gridButton.isVisible()) {
          await gridButton.click();
          await page.waitForTimeout(2000);
          console.log('   ✅ 已切換到網格模式');
          
          // 重新檢查虛擬化
          const virtualizedListAfter = page.getByTestId('virtualized-activity-list');
          if (await virtualizedListAfter.isVisible()) {
            console.log('   ✅ 切換後虛擬化列表可見');
          } else {
            console.log('   ❌ 切換後虛擬化列表仍不可見');
          }
        }
      }
    }

    // 檢查控制台錯誤
    console.log('🐛 檢查控制台錯誤');
    const logs = await page.evaluate(() => {
      return window.console.error.toString();
    });
    console.log(`   📝 控制台狀態: ${logs.length > 0 ? '有錯誤' : '無錯誤'}`);

    // 最終狀態檢查
    console.log('🎯 最終虛擬化狀態檢查');
    const finalVirtualizedList = page.getByTestId('virtualized-activity-list');
    const finalVirtualizedIndicator = page.getByTestId('virtualized-indicator');
    
    const listVisible = await finalVirtualizedList.isVisible();
    const indicatorVisible = await finalVirtualizedIndicator.isVisible();
    
    console.log(`   📋 虛擬化列表: ${listVisible ? '✅ 可見' : '❌ 不可見'}`);
    console.log(`   🏷️ 虛擬化指示器: ${indicatorVisible ? '✅ 可見' : '❌ 不可見'}`);
    
    if (listVisible || indicatorVisible) {
      console.log('🎉 虛擬化功能檢測成功！');
    } else {
      console.log('❌ 虛擬化功能檢測失敗');
    }

    console.log('🎉 Day 8-10 虛擬化列表調試完成！');
  });

  test('性能優化效果測試', async ({ page }) => {
    // 開始錄影
    await page.video();
    
    console.log('🎬 開始錄製 Day 8-10 性能優化效果測試影片...');

    // 測試多次載入以獲得平均性能
    const loadTimes = [];
    
    for (let i = 0; i < 3; i++) {
      console.log(`⚡ 第 ${i + 1} 次性能測試`);
      
      const startTime = Date.now();
      await page.goto('http://localhost:3000/my-activities');
      await page.waitForLoadState('networkidle');
      
      // 等待 Suspense 載入完成
      await page.waitForTimeout(1000);
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      loadTimes.push(loadTime);
      
      console.log(`   📊 載入時間: ${loadTime}ms`);
      
      // 清除緩存以獲得真實的載入時間
      if (i < 2) {
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
      }
    }
    
    const averageLoadTime = Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length);
    const minLoadTime = Math.min(...loadTimes);
    const maxLoadTime = Math.max(...loadTimes);
    
    console.log('📊 性能測試結果:');
    console.log(`   平均載入時間: ${averageLoadTime}ms`);
    console.log(`   最快載入時間: ${minLoadTime}ms`);
    console.log(`   最慢載入時間: ${maxLoadTime}ms`);
    
    if (averageLoadTime < 500) {
      console.log('✅ 性能優化成功 (平均 <500ms)');
    } else if (averageLoadTime < 800) {
      console.log('⚠️ 性能有所改善，但仍需優化');
    } else {
      console.log('❌ 性能優化效果有限');
    }

    console.log('🎉 Day 8-10 性能優化效果測試完成！');
  });
});
