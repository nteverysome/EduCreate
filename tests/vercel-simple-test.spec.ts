import { test, expect } from '@playwright/test';

test.describe('EduCreate Vercel 簡化驗證測試', () => {
  const VERCEL_URL = 'https://edu-create.vercel.app';
  
  test('Vercel 部署基本驗證', async ({ page }) => {
    console.log('🔍 開始 Vercel 部署基本驗證...');
    
    // 導航到 Vercel 部署頁面
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // 截圖：部署首頁
    await page.screenshot({ 
      path: 'test-results/vercel-basic-test.png',
      fullPage: true 
    });
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/EduCreate/);
    console.log('✅ 頁面標題正確');
    
    // 檢查主要內容是否存在
    const mainContent = page.locator('text=EduCreate');
    await expect(mainContent).toBeVisible();
    console.log('✅ 主要內容可見');
    
    // 檢查是否有導航元素
    const navigation = page.locator('text=首頁');
    if (await navigation.isVisible()) {
      console.log('✅ 導航元素存在');
    } else {
      console.log('⚠️ 導航元素不可見');
    }
    
    // 檢查核心功能卡片
    const gameFeature = page.locator('text=遊戲');
    if (await gameFeature.isVisible()) {
      console.log('✅ 遊戲功能可見');
    } else {
      console.log('⚠️ 遊戲功能不可見');
    }
    
    // 測試頁面載入性能
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    
    // 檢查是否符合基本性能要求
    if (loadTime < 5000) {
      console.log('✅ 頁面載入性能可接受 (<5s)');
    } else {
      console.log('⚠️ 頁面載入時間較長');
    }
    
    console.log('✅ Vercel 部署基本驗證完成');
  });

  test('響應式設計基本測試', async ({ page }) => {
    console.log('🔍 開始響應式設計基本測試...');
    
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // 測試不同視窗大小
    const viewports = [
      { width: 375, height: 667, name: '手機' },
      { width: 768, height: 1024, name: '平板' },
      { width: 1440, height: 900, name: '桌面' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `test-results/vercel-${viewport.name}-${viewport.width}x${viewport.height}.png` 
      });
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) 截圖完成`);
    }
    
    console.log('✅ 響應式設計基本測試完成');
  });
});
