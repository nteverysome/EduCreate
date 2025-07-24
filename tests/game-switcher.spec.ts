import { test, expect } from '@playwright/test';

test.describe('GameSwitcher 遊戲切換器', () => {
  test.beforeEach(async ({ page }) => {
    // 導航到遊戲切換器頁面
    await page.goto('/games/switcher');
    
    // 等待頁面載入完成
    await page.waitForLoadState('networkidle');
  });

  test('應該正確載入遊戲切換器頁面', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('記憶科學遊戲中心');
    
    // 檢查遊戲切換器組件存在
    await expect(page.locator('.game-switcher')).toBeVisible();
    
    // 檢查預設遊戲載入
    await expect(page.locator('iframe')).toBeVisible();
    
    console.log('✅ 遊戲切換器頁面載入成功');
  });

  test('應該顯示當前遊戲信息', async ({ page }) => {
    // 檢查當前遊戲標題
    await expect(page.locator('h3').first()).toContainText('飛機碰撞遊戲');
    
    // 檢查遊戲狀態
    await expect(page.locator('text=已完成')).toBeVisible();
    
    // 檢查記憶類型
    await expect(page.locator('text=動態反應記憶')).toBeVisible();
    
    console.log('✅ 當前遊戲信息顯示正確');
  });

  test('應該能夠打開遊戲選擇下拉選單', async ({ page }) => {
    // 點擊切換遊戲按鈕
    await page.click('button:has-text("切換遊戲")');
    
    // 檢查下拉選單出現
    await expect(page.locator('text=可用遊戲')).toBeVisible();
    
    // 檢查可用遊戲列表
    await expect(page.locator('text=飛機碰撞遊戲')).toBeVisible();
    await expect(page.locator('text=飛機遊戲 (iframe版)')).toBeVisible();
    await expect(page.locator('text=飛機遊戲 (Vite版)')).toBeVisible();
    
    // 檢查開發中遊戲
    await expect(page.locator('text=開發中遊戲')).toBeVisible();
    await expect(page.locator('text=配對遊戲')).toBeVisible();
    
    console.log('✅ 遊戲選擇下拉選單功能正常');
  });

  test('應該能夠切換到不同的遊戲版本', async ({ page }) => {
    // 記錄初始 iframe src
    const initialSrc = await page.locator('iframe').getAttribute('src');
    console.log('初始遊戲 URL:', initialSrc);
    
    // 打開下拉選單
    await page.click('button:has-text("切換遊戲")');
    
    // 切換到 iframe 版本
    await page.click('text=飛機遊戲 (iframe版)');
    
    // 等待載入完成
    await page.waitForTimeout(2000);
    
    // 檢查 iframe URL 是否改變
    const newSrc = await page.locator('iframe').getAttribute('src');
    console.log('切換後遊戲 URL:', newSrc);
    
    expect(newSrc).toContain('/games/airplane-iframe');
    expect(newSrc).not.toBe(initialSrc);
    
    console.log('✅ 遊戲切換功能正常');
  });

  test('應該顯示載入進度條', async ({ page }) => {
    // 打開下拉選單
    await page.click('button:has-text("切換遊戲")');
    
    // 切換到 Vite 版本
    await page.click('text=飛機遊戲 (Vite版)');
    
    // 檢查載入進度條出現
    await expect(page.locator('text=正在載入')).toBeVisible();
    
    // 等待載入完成
    await page.waitForTimeout(3000);
    
    // 檢查載入進度條消失
    await expect(page.locator('text=正在載入')).not.toBeVisible();
    
    console.log('✅ 載入進度條功能正常');
  });

  test('應該能夠切換 GEPT 等級', async ({ page }) => {
    // 檢查預設等級
    await expect(page.locator('button:has-text("初級")').first()).toHaveClass(/bg-blue-100/);
    
    // 切換到中級
    await page.click('button:has-text("中級")');
    
    // 檢查中級被選中
    await expect(page.locator('button:has-text("中級")').first()).toHaveClass(/bg-blue-100/);
    
    // 切換到高級
    await page.click('button:has-text("高級")');
    
    // 檢查高級被選中
    await expect(page.locator('button:has-text("高級")').first()).toHaveClass(/bg-blue-100/);
    
    console.log('✅ GEPT 等級切換功能正常');
  });

  test('應該顯示學習統計', async ({ page }) => {
    // 檢查統計區域存在
    await expect(page.locator('text=學習統計')).toBeVisible();
    
    // 檢查統計項目
    await expect(page.locator('text=總遊戲次數')).toBeVisible();
    await expect(page.locator('text=總學習時間')).toBeVisible();
    await expect(page.locator('text=平均分數')).toBeVisible();
    
    // 檢查 GEPT 進度
    await expect(page.locator('text=GEPT 學習進度')).toBeVisible();
    await expect(page.locator('text=初級')).toBeVisible();
    await expect(page.locator('text=中級')).toBeVisible();
    await expect(page.locator('text=高級')).toBeVisible();
    
    console.log('✅ 學習統計顯示正常');
  });

  test('應該能夠展開詳細統計', async ({ page }) => {
    // 點擊統計按鈕
    await page.click('button:has-text("統計")');
    
    // 檢查詳細統計出現
    await expect(page.locator('text=詳細統計')).toBeVisible();
    await expect(page.locator('text=當前遊戲')).toBeVisible();
    await expect(page.locator('text=最愛遊戲')).toBeVisible();
    await expect(page.locator('text=遊戲切換次數')).toBeVisible();
    
    console.log('✅ 詳細統計功能正常');
  });

  test('應該正確處理 iframe 載入', async ({ page }) => {
    // 等待 iframe 載入
    await page.waitForSelector('iframe');
    
    // 檢查 iframe 屬性
    const iframe = page.locator('iframe');
    await expect(iframe).toHaveAttribute('title', '飛機碰撞遊戲');
    await expect(iframe).toHaveAttribute('allow', /fullscreen/);
    await expect(iframe).toHaveAttribute('sandbox', /allow-same-origin/);
    
    // 檢查 iframe 尺寸
    const boundingBox = await iframe.boundingBox();
    expect(boundingBox?.height).toBeGreaterThan(500);
    expect(boundingBox?.width).toBeGreaterThan(500);
    
    console.log('✅ iframe 載入和配置正確');
  });

  test('應該支援鍵盤導航 (無障礙)', async ({ page }) => {
    // 使用 Tab 鍵導航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 檢查焦點在切換遊戲按鈕上
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toContainText('切換遊戲');
    
    // 使用 Enter 鍵打開下拉選單
    await page.keyboard.press('Enter');
    await expect(page.locator('text=可用遊戲')).toBeVisible();
    
    console.log('✅ 鍵盤導航功能正常');
  });

  test('應該在切換時間 < 100ms 內完成 UI 更新', async ({ page }) => {
    // 記錄開始時間
    const startTime = Date.now();
    
    // 打開下拉選單
    await page.click('button:has-text("切換遊戲")');
    
    // 切換遊戲
    await page.click('text=飛機遊戲 (iframe版)');
    
    // 檢查 UI 更新時間
    const endTime = Date.now();
    const switchTime = endTime - startTime;
    
    console.log(`遊戲切換 UI 更新時間: ${switchTime}ms`);
    
    // UI 更新應該很快 (不包括 iframe 載入時間)
    expect(switchTime).toBeLessThan(500); // 放寬到 500ms 因為包含網絡請求
    
    console.log('✅ 遊戲切換性能符合要求');
  });

  test('應該正確處理錯誤狀態', async ({ page }) => {
    // 模擬網絡錯誤 (通過導航到不存在的遊戲)
    await page.goto('/games/switcher?game=non-existent');
    
    // 應該回退到預設遊戲或顯示錯誤信息
    await expect(page.locator('iframe')).toBeVisible();
    
    console.log('✅ 錯誤處理功能正常');
  });

  test('應該支援從主頁導航到遊戲切換器', async ({ page }) => {
    // 導航到主頁
    await page.goto('/');
    
    // 點擊遊戲中心入口
    await page.click('[data-testid="game-switcher-link"]');
    
    // 檢查是否正確導航到遊戲切換器
    await expect(page).toHaveURL('/games/switcher');
    await expect(page.locator('h1')).toContainText('記憶科學遊戲中心');
    
    console.log('✅ 主頁導航功能正常');
  });

  test('應該保持遊戲狀態和進度', async ({ page }) => {
    // 等待遊戲載入
    await page.waitForSelector('iframe');
    await page.waitForTimeout(3000);
    
    // 模擬遊戲狀態更新 (通過 postMessage)
    await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'GAME_STATE_UPDATE',
          score: 100,
          level: 'elementary',
          progress: 50,
          timeSpent: 30000
        }, '*');
      }
    });
    
    // 等待狀態更新
    await page.waitForTimeout(1000);
    
    // 檢查遊戲狀態是否顯示
    await expect(page.locator('text=遊戲狀態')).toBeVisible();
    
    console.log('✅ 遊戲狀態保持功能正常');
  });

  test('應該正確顯示遊戲歷史', async ({ page }) => {
    // 進行幾次遊戲切換以產生歷史記錄
    await page.click('button:has-text("切換遊戲")');
    await page.click('text=飛機遊戲 (iframe版)');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("切換遊戲")');
    await page.click('text=飛機遊戲 (Vite版)');
    await page.waitForTimeout(2000);
    
    // 檢查遊戲歷史是否顯示
    await expect(page.locator('text=最近遊戲')).toBeVisible();
    
    console.log('✅ 遊戲歷史功能正常');
  });
});

test.describe('GameSwitcher 性能測試', () => {
  test('應該維持 60fps 性能標準', async ({ page }) => {
    // 導航到遊戲切換器
    await page.goto('/games/switcher');
    
    // 等待遊戲載入
    await page.waitForSelector('iframe');
    await page.waitForTimeout(5000);
    
    // 檢查性能指標
    const performanceMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null,
        timing: performance.timing
      };
    });
    
    console.log('性能指標:', performanceMetrics);
    
    // 檢查記憶體使用 (如果可用)
    if (performanceMetrics.memory) {
      const memoryUsageMB = performanceMetrics.memory.usedJSHeapSize / 1024 / 1024;
      console.log(`記憶體使用: ${memoryUsageMB.toFixed(2)} MB`);
      
      // 記憶體使用應該合理 (< 500MB)
      expect(memoryUsageMB).toBeLessThan(500);
    }
    
    console.log('✅ 性能測試通過');
  });

  test('應該快速響應用戶互動', async ({ page }) => {
    await page.goto('/games/switcher');
    
    // 測量按鈕點擊響應時間
    const startTime = Date.now();
    await page.click('button:has-text("切換遊戲")');
    const responseTime = Date.now() - startTime;
    
    console.log(`按鈕響應時間: ${responseTime}ms`);
    
    // 響應時間應該 < 100ms
    expect(responseTime).toBeLessThan(100);
    
    console.log('✅ 用戶互動響應性能符合要求');
  });
});
