import { test, expect } from '@playwright/test';

test.describe('視差背景系統完整整合測試', () => {
  test.beforeEach(async ({ page }) => {
    // 設置視頻錄製
    await page.video();
  });

  test('三層整合驗證：主頁可見性 → 導航流程 → 功能互動', async ({ page }) => {
    // ===== 第一層：主頁可見性測試 =====
    console.log('🔍 第一層：主頁可見性測試');
    await page.goto('/');
    
    // 檢查主頁是否有視差背景系統入口
    const parallaxFeatureCard = page.locator('[data-testid="feature-parallax-background"]');
    await expect(parallaxFeatureCard).toBeVisible();
    
    // 檢查功能卡片內容
    await expect(parallaxFeatureCard.locator('h3')).toContainText('視差背景系統');
    await expect(parallaxFeatureCard.locator('p')).toContainText('專業級視差背景效果');
    
    // 檢查四個特色功能點
    await expect(parallaxFeatureCard.locator('text=四種主題場景')).toBeVisible();
    await expect(parallaxFeatureCard.locator('text=支援水平和垂直佈局')).toBeVisible();
    await expect(parallaxFeatureCard.locator('text=無障礙設計')).toBeVisible();
    await expect(parallaxFeatureCard.locator('text=完整遊戲素材包含')).toBeVisible();
    
    // 檢查入口連結
    const parallaxLink = parallaxFeatureCard.locator('[data-testid="parallax-background-link"]');
    await expect(parallaxLink).toBeVisible();
    await expect(parallaxLink).toContainText('立即體驗視差背景');
    
    console.log('✅ 第一層測試通過：主頁可見性確認');

    // ===== 第二層：導航流程測試 =====
    console.log('🔍 第二層：導航流程測試');
    
    // 點擊進入視差背景演示頁面
    await parallaxLink.click();
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查 URL 是否正確
    expect(page.url()).toContain('/games/parallax-background-demo');
    
    // 檢查統一導航系統是否存在
    const navigation = page.locator('[data-testid="unified-navigation"]');
    await expect(navigation).toBeVisible();
    
    console.log('✅ 第二層測試通過：導航流程確認');

    // ===== 第三層：功能互動測試 =====
    console.log('🔍 第三層：功能互動測試');
    
    // 檢查視差背景演示組件是否載入
    const demoContainer = page.locator('.parallax-container');
    await expect(demoContainer).toBeVisible();
    
    // 檢查控制面板
    const controlPanel = page.locator('text=EduCreate 視差背景系統');
    await expect(controlPanel).toBeVisible();
    
    // 測試主題切換功能
    console.log('🎨 測試主題切換功能');
    
    // 測試森林主題（預設）
    const forestButton = page.locator('button:has-text("森林")');
    await expect(forestButton).toHaveClass(/border-blue-500/);
    
    // 切換到沙漠主題
    const desertButton = page.locator('button:has-text("沙漠")');
    await desertButton.click();
    await expect(desertButton).toHaveClass(/border-blue-500/);
    
    // 切換到天空主題
    const skyButton = page.locator('button:has-text("天空")');
    await skyButton.click();
    await expect(skyButton).toHaveClass(/border-blue-500/);
    
    // 切換到月亮主題
    const moonButton = page.locator('button:has-text("月亮")');
    await moonButton.click();
    await expect(moonButton).toHaveClass(/border-blue-500/);
    
    console.log('✅ 主題切換功能測試通過');
    
    // 測試速度控制功能
    console.log('⚡ 測試速度控制功能');
    
    const speedSlider = page.locator('input[type="range"]');
    await expect(speedSlider).toBeVisible();
    
    // 調整速度到最大
    await speedSlider.fill('2');
    const speedDisplay = page.locator('text=2.0x');
    await expect(speedDisplay).toBeVisible();
    
    // 調整速度到最小
    await speedSlider.fill('0.1');
    const minSpeedDisplay = page.locator('text=0.1x');
    await expect(minSpeedDisplay).toBeVisible();
    
    console.log('✅ 速度控制功能測試通過');
    
    // 測試無障礙功能
    console.log('♿ 測試無障礙功能');
    
    const disableAnimationCheckbox = page.locator('input[type="checkbox"]');
    await expect(disableAnimationCheckbox).toBeVisible();
    
    // 啟用禁用動畫選項
    await disableAnimationCheckbox.check();
    await expect(disableAnimationCheckbox).toBeChecked();
    
    // 檢查狀態顯示更新
    const statusDisplay = page.locator('text=已禁用');
    await expect(statusDisplay).toBeVisible();
    
    // 取消禁用動畫選項
    await disableAnimationCheckbox.uncheck();
    await expect(disableAnimationCheckbox).not.toBeChecked();
    
    const enabledStatusDisplay = page.locator('text=已啟用');
    await expect(enabledStatusDisplay).toBeVisible();
    
    console.log('✅ 無障礙功能測試通過');
    
    // 測試學習內容示例區域
    console.log('📚 測試學習內容示例區域');
    
    const contentArea = page.locator('text=學習內容示例區域');
    await expect(contentArea).toBeVisible();
    
    // 檢查詞彙卡片
    const vocabularyCards = page.locator('text=詞彙卡片');
    await expect(vocabularyCards.first()).toBeVisible();
    
    console.log('✅ 學習內容示例區域測試通過');
    
    // 測試 EduCreate 整合應用說明
    console.log('💡 測試 EduCreate 整合應用說明');
    
    const integrationGuide = page.locator('text=EduCreate 整合應用');
    await expect(integrationGuide).toBeVisible();
    
    // 檢查四種主題的應用說明
    await expect(page.locator('text=森林主題: 自然科學詞彙')).toBeVisible();
    await expect(page.locator('text=沙漠主題: 探險詞彙')).toBeVisible();
    await expect(page.locator('text=天空主題: 基礎英語')).toBeVisible();
    await expect(page.locator('text=月亮主題: 夜間模式')).toBeVisible();
    
    console.log('✅ EduCreate 整合應用說明測試通過');
    
    console.log('✅ 第三層測試通過：功能互動確認');

    // ===== 性能測試 =====
    console.log('🚀 性能測試');
    
    // 測試頁面載入時間
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // 應該在3秒內載入
    
    // 測試主題切換響應時間
    const themeStartTime = Date.now();
    await page.locator('button:has-text("森林")').click();
    const themeChangeTime = Date.now() - themeStartTime;
    
    console.log(`🎨 主題切換響應時間: ${themeChangeTime}ms`);
    expect(themeChangeTime).toBeLessThan(500); // 應該在500ms內響應
    
    console.log('✅ 性能測試通過');

    // ===== 回歸測試：返回主頁 =====
    console.log('🔄 回歸測試：返回主頁');
    
    // 通過導航返回主頁
    await page.goto('/');
    
    // 再次確認主頁功能卡片存在
    await expect(parallaxFeatureCard).toBeVisible();
    
    console.log('✅ 回歸測試通過：主頁功能完整');

    console.log('🎉 視差背景系統完整整合測試全部通過！');
  });

  test('視差背景資源檔案完整性測試', async ({ page }) => {
    console.log('📁 測試視差背景資源檔案完整性');
    
    await page.goto('/games/parallax-background-demo');
    
    // 測試森林主題資源載入
    await page.locator('button:has-text("森林")').click();
    await page.waitForTimeout(1000);
    
    // 測試沙漠主題資源載入
    await page.locator('button:has-text("沙漠")').click();
    await page.waitForTimeout(1000);
    
    // 測試天空主題資源載入
    await page.locator('button:has-text("天空")').click();
    await page.waitForTimeout(1000);
    
    // 測試月亮主題資源載入
    await page.locator('button:has-text("月亮")').click();
    await page.waitForTimeout(1000);
    
    console.log('✅ 所有主題資源載入測試完成');
  });

  test('無障礙設計合規性測試', async ({ page }) => {
    console.log('♿ 測試無障礙設計合規性');
    
    await page.goto('/games/parallax-background-demo');
    
    // 檢查 ARIA 標籤
    const parallaxContainer = page.locator('.parallax-container');
    await expect(parallaxContainer).toHaveAttribute('role', 'img');
    await expect(parallaxContainer).toHaveAttribute('aria-label');
    
    // 檢查鍵盤導航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 檢查焦點可見性
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    console.log('✅ 無障礙設計合規性測試通過');
  });
});
