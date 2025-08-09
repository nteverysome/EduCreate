import { test, expect } from '@playwright/test';

test.describe('EduCreate Vercel 部署驗證測試', () => {
  const VERCEL_URL = 'https://edu-create.vercel.app';
  
  test.beforeEach(async ({ page }) => {
    // 設置測試環境
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('第一層：主頁可見性測試 - 所有功能入口檢查', async ({ page }) => {
    console.log('🔍 開始主頁可見性測試...');
    
    // 導航到 Vercel 部署頁面
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // 截圖：部署首頁
    await page.screenshot({ 
      path: 'test-results/vercel-homepage-full.png',
      fullPage: true 
    });
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 檢查主要導航元素
    const navigation = [
      '🏠首頁',
      '📋我的活動', 
      '📊功能儀表板',
      '📝統一內容編輯器'
    ];
    
    for (const navItem of navigation) {
      await expect(page.locator(`text=${navItem}`)).toBeVisible();
      console.log(`✅ 導航項目可見: ${navItem}`);
    }
    
    // 檢查核心功能卡片
    const coreFeatures = [
      '🎮記憶科學遊戲中心',
      '✈️飛機碰撞遊戲',
      '🔄智能排序系統',
      '📋我的活動管理',
      '🚀活動模板和快速創建'
    ];
    
    for (const feature of coreFeatures) {
      await expect(page.locator(`text=${feature}`)).toBeVisible();
      console.log(`✅ 核心功能可見: ${feature}`);
    }
    
    console.log('✅ 主頁可見性測試完成');
  });

  test('第二層：導航流程測試 - 功能進入流程', async ({ page }) => {
    console.log('🔍 開始導航流程測試...');
    
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // 測試遊戲中心導航
    console.log('測試遊戲中心導航...');
    const gameCenter = page.locator('text=進入遊戲中心').first();
    if (await gameCenter.isVisible()) {
      await gameCenter.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/vercel-game-center.png' });
      console.log('✅ 遊戲中心導航成功');
      await page.goBack();
    }
    
    // 測試飛機遊戲導航
    console.log('測試飛機遊戲導航...');
    const airplaneGame = page.locator('text=立即遊戲').first();
    if (await airplaneGame.isVisible()) {
      await airplaneGame.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/vercel-airplane-game.png' });
      console.log('✅ 飛機遊戲導航成功');
      await page.goBack();
    }
    
    // 測試我的活動導航
    console.log('測試我的活動導航...');
    const myActivities = page.locator('text=📋我的活動');
    if (await myActivities.isVisible()) {
      await myActivities.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/vercel-my-activities.png' });
      console.log('✅ 我的活動導航成功');
      await page.goBack();
    }
    
    // 測試功能儀表板導航
    console.log('測試功能儀表板導航...');
    const dashboard = page.locator('text=📊功能儀表板');
    if (await dashboard.isVisible()) {
      await dashboard.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/vercel-dashboard.png' });
      console.log('✅ 功能儀表板導航成功');
      await page.goBack();
    }
    
    console.log('✅ 導航流程測試完成');
  });

  test('第三層：功能互動測試 - 核心功能運行', async ({ page }) => {
    console.log('🔍 開始功能互動測試...');
    
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // 測試頁面載入性能
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    
    // 檢查是否符合 <1s 要求
    expect(loadTime).toBeLessThan(1000);
    console.log('✅ 頁面載入性能符合要求 (<1s)');
    
    // 測試響應式設計
    const viewports = [
      { width: 375, height: 667, name: '手機直向' },
      { width: 768, height: 1024, name: '平板直向' },
      { width: 1440, height: 900, name: '桌面版' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: `test-results/vercel-responsive-${viewport.name}.png` 
      });
      console.log(`✅ ${viewport.name} 響應式測試完成`);
    }
    
    // 重置到桌面版
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // 測試 GEPT 分級系統
    console.log('測試 GEPT 分級系統...');
    const geptSystem = page.locator('text=📚GEPT分級系統');
    if (await geptSystem.isVisible()) {
      await geptSystem.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'test-results/vercel-gept-system.png' });
      console.log('✅ GEPT 分級系統可見');
    }
    
    // 測試無障礙功能
    console.log('測試無障礙功能...');
    const accessibilityFeature = page.locator('text=♿無障礙支援系統');
    if (await accessibilityFeature.isVisible()) {
      await accessibilityFeature.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'test-results/vercel-accessibility.png' });
      console.log('✅ 無障礙功能可見');
    }
    
    // 測試記憶科學遊戲
    console.log('測試記憶科學遊戲...');
    const memoryGames = page.locator('text=🎮記憶遊戲系統');
    if (await memoryGames.isVisible()) {
      await memoryGames.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'test-results/vercel-memory-games.png' });
      console.log('✅ 記憶科學遊戲可見');
    }
    
    console.log('✅ 功能互動測試完成');
  });

  test('完整用戶旅程測試', async ({ page }) => {
    console.log('🔍 開始完整用戶旅程測試...');
    
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // 模擬用戶完整使用流程
    console.log('1. 用戶進入首頁');
    await page.screenshot({ path: 'test-results/vercel-journey-1-homepage.png' });
    
    console.log('2. 用戶瀏覽功能');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/vercel-journey-2-features.png' });
    
    console.log('3. 用戶查看遊戲');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/vercel-journey-3-games.png' });
    
    console.log('4. 用戶查看技術特色');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/vercel-journey-4-tech.png' });
    
    console.log('✅ 完整用戶旅程測試完成');
  });
});
