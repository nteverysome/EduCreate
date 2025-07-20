import { test, expect } from '@playwright/test';

// 直接測試，不使用 global-setup
test.describe('視差背景系統直接測試', () => {
  test.beforeEach(async ({ page }) => {
    // 設置基本超時
    page.setDefaultTimeout(30000);
  });

  test('主頁視差背景入口測試', async ({ page }) => {
    console.log('🔍 測試主頁視差背景入口');
    
    try {
      await page.goto('http://localhost:3000/');
      
      // 檢查視差背景功能卡片
      const parallaxCard = page.locator('[data-testid="feature-parallax-background"]');
      await expect(parallaxCard).toBeVisible({ timeout: 15000 });
      
      // 檢查標題
      await expect(parallaxCard.locator('h3')).toContainText('視差背景系統');
      
      // 檢查描述
      await expect(parallaxCard.locator('p')).toContainText('專業級視差背景效果');
      
      // 檢查連結
      const link = parallaxCard.locator('[data-testid="parallax-background-link"]');
      await expect(link).toBeVisible();
      await expect(link).toContainText('立即體驗視差背景');
      
      console.log('✅ 主頁入口測試通過');
      
    } catch (error) {
      console.error('❌ 主頁測試失敗:', error);
      throw error;
    }
  });

  test('視差背景演示頁面測試', async ({ page }) => {
    console.log('🔍 測試視差背景演示頁面');
    
    try {
      await page.goto('http://localhost:3000/games/parallax-background-demo');
      
      // 檢查頁面標題
      const title = page.locator('text=EduCreate 視差背景系統');
      await expect(title).toBeVisible({ timeout: 5000 });
      
      // 檢查主題選擇區域
      const themeSection = page.locator('text=選擇主題');
      await expect(themeSection).toBeVisible();
      
      // 檢查四個主題按鈕
      await expect(page.locator('button:has-text("森林")')).toBeVisible();
      await expect(page.locator('button:has-text("沙漠")')).toBeVisible();
      await expect(page.locator('button:has-text("天空")')).toBeVisible();
      await expect(page.locator('button:has-text("月亮")')).toBeVisible();
      
      // 檢查速度控制
      const speedSection = page.locator('text=視差速度');
      await expect(speedSection).toBeVisible();
      
      const speedSlider = page.locator('input[type="range"]');
      await expect(speedSlider).toBeVisible();
      
      // 檢查無障礙選項
      const accessibilitySection = page.locator('text=無障礙設計');
      await expect(accessibilitySection).toBeVisible();
      
      const disableCheckbox = page.locator('input[type="checkbox"]');
      await expect(disableCheckbox).toBeVisible();
      
      console.log('✅ 視差背景演示頁面測試通過');
      
    } catch (error) {
      console.error('❌ 演示頁面測試失敗:', error);
      throw error;
    }
  });

  test('主題切換功能測試', async ({ page }) => {
    console.log('🔍 測試主題切換功能');
    
    try {
      await page.goto('http://localhost:3000/games/parallax-background-demo');
      
      // 等待頁面載入
      await page.waitForSelector('text=EduCreate 視差背景系統', { timeout: 5000 });
      
      // 測試森林主題（預設選中）
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
      
      // 檢查當前設定顯示
      const currentTheme = page.locator('[data-testid="current-theme"]');
      await expect(currentTheme).toContainText('月亮');
      
      console.log('✅ 主題切換功能測試通過');
      
    } catch (error) {
      console.error('❌ 主題切換測試失敗:', error);
      throw error;
    }
  });

  test('速度控制功能測試', async ({ page }) => {
    console.log('🔍 測試速度控制功能');
    
    try {
      await page.goto('http://localhost:3000/games/parallax-background-demo');
      
      // 等待頁面載入
      await page.waitForSelector('text=EduCreate 視差背景系統', { timeout: 5000 });
      
      // 測試速度滑桿
      const speedSlider = page.locator('input[type="range"]');
      await expect(speedSlider).toBeVisible();
      
      // 調整到最大速度
      await speedSlider.fill('2');
      const maxSpeedDisplay = page.locator('text=2.0x');
      await expect(maxSpeedDisplay).toBeVisible();
      
      // 調整到最小速度
      await speedSlider.fill('0.1');
      const minSpeedDisplay = page.locator('text=0.1x');
      await expect(minSpeedDisplay).toBeVisible();
      
      // 調整到中等速度
      await speedSlider.fill('1');
      const normalSpeedDisplay = page.locator('text=1.0x');
      await expect(normalSpeedDisplay).toBeVisible();
      
      console.log('✅ 速度控制功能測試通過');
      
    } catch (error) {
      console.error('❌ 速度控制測試失敗:', error);
      throw error;
    }
  });

  test('無障礙功能測試', async ({ page }) => {
    console.log('🔍 測試無障礙功能');
    
    try {
      await page.goto('http://localhost:3000/games/parallax-background-demo');
      
      // 等待頁面載入
      await page.waitForSelector('text=EduCreate 視差背景系統', { timeout: 5000 });
      
      // 測試禁用動畫選項
      const disableCheckbox = page.locator('input[type="checkbox"]');
      await expect(disableCheckbox).toBeVisible();
      
      // 啟用禁用動畫
      await disableCheckbox.check();
      await expect(disableCheckbox).toBeChecked();
      
      // 檢查狀態顯示更新
      const disabledStatus = page.locator('text=動畫:').locator('..').locator('span.font-medium');
      await expect(disabledStatus).toContainText('已禁用');
      
      // 取消禁用動畫
      await disableCheckbox.uncheck();
      await expect(disableCheckbox).not.toBeChecked();
      
      // 檢查狀態顯示更新
      await expect(disabledStatus).toContainText('已啟用');
      
      console.log('✅ 無障礙功能測試通過');
      
    } catch (error) {
      console.error('❌ 無障礙功能測試失敗:', error);
      throw error;
    }
  });

  test('EduCreate 整合應用說明測試', async ({ page }) => {
    console.log('🔍 測試 EduCreate 整合應用說明');
    
    try {
      await page.goto('http://localhost:3000/games/parallax-background-demo');
      
      // 等待頁面載入
      await page.waitForSelector('text=EduCreate 視差背景系統', { timeout: 5000 });
      
      // 檢查整合應用說明區域
      const integrationGuide = page.locator('text=EduCreate 整合應用');
      await expect(integrationGuide).toBeVisible();
      
      // 檢查四種主題的應用說明
      await expect(page.locator('text=森林主題: 自然科學詞彙')).toBeVisible();
      await expect(page.locator('text=沙漠主題: 探險詞彙')).toBeVisible();
      await expect(page.locator('text=天空主題: 基礎英語')).toBeVisible();
      await expect(page.locator('text=月亮主題: 夜間模式')).toBeVisible();
      
      console.log('✅ EduCreate 整合應用說明測試通過');
      
    } catch (error) {
      console.error('❌ 整合應用說明測試失敗:', error);
      throw error;
    }
  });

  test('學習內容示例區域測試', async ({ page }) => {
    console.log('🔍 測試學習內容示例區域');
    
    try {
      await page.goto('http://localhost:3000/games/parallax-background-demo');
      
      // 等待頁面載入
      await page.waitForSelector('text=EduCreate 視差背景系統', { timeout: 5000 });
      
      // 檢查學習內容示例區域
      const contentArea = page.locator('text=學習內容示例區域');
      await expect(contentArea).toBeVisible();
      
      // 檢查詞彙卡片
      const vocabularyCards = page.locator('text=詞彙卡片');
      await expect(vocabularyCards.first()).toBeVisible();
      
      // 檢查至少有6個卡片
      const cardCount = await vocabularyCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(6);
      
      console.log('✅ 學習內容示例區域測試通過');
      
    } catch (error) {
      console.error('❌ 學習內容示例區域測試失敗:', error);
      throw error;
    }
  });
});
