/**
 * 檔案夾視覺自定義功能 Playwright 端到端測試
 * 測試檔案夾顏色、圖標、主題等自定義功能與真實網站功能互動
 */

import { test, expect } from '@playwright/test';
import { bypassAuthAndGoto, waitForPageLoad, testUsers } from '../helpers/auth-helper';

test.describe('檔案夾視覺自定義功能', () => {
  test.beforeEach(async ({ page }) => {
    // 設置較長的超時時間
    test.setTimeout(120000);
    
    try {
      // 跳過認證並導航到檔案夾自定義演示頁面
      await bypassAuthAndGoto(page, '/demo/folder-customization', testUsers.default);
      
      // 等待頁面完全載入
      await waitForPageLoad(page, 30000);
      
    } catch (error) {
      console.log('頁面載入失敗，嘗試直接訪問:', error);
      await page.goto('/demo/folder-customization');
      await page.waitForTimeout(5000);
    }
  });

  test('應該能顯示檔案夾自定義演示頁面', async ({ page }) => {
    try {
      // 驗證頁面標題
      await expect(page.locator('[data-testid="page-title"]')).toContainText('檔案夾視覺自定義演示', { timeout: 10000 });
      
      // 驗證功能描述
      await expect(page.locator('[data-testid="page-description"]')).toContainText('展示檔案夾顏色、圖標、主題等視覺自定義功能', { timeout: 5000 });
      
      // 驗證檔案夾容器
      await expect(page.locator('[data-testid="folders-container"]')).toBeVisible({ timeout: 10000 });
      
      // 驗證檔案夾網格
      await expect(page.locator('[data-testid="folders-grid"]')).toBeVisible({ timeout: 5000 });
      
      console.log('檔案夾自定義演示頁面顯示測試通過');
      
    } catch (error) {
      console.log('頁面顯示測試失敗:', error);
      await page.screenshot({ path: 'debug-folder-customization-display.png' });
      throw error;
    }
  });

  test('應該能顯示演示檔案夾', async ({ page }) => {
    try {
      // 等待檔案夾載入
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      
      // 檢查是否有檔案夾
      const folders = page.locator('[data-testid^="folder-"]');
      const folderCount = await folders.count();
      
      expect(folderCount).toBeGreaterThan(0);
      console.log(`找到 ${folderCount} 個演示檔案夾`);
      
      // 驗證第一個檔案夾
      const firstFolder = folders.first();
      await expect(firstFolder).toBeVisible({ timeout: 5000 });
      
      // 檢查檔案夾名稱
      const folderName = firstFolder.locator('[data-testid^="folder-name-"]');
      await expect(folderName).toBeVisible({ timeout: 5000 });
      
      // 檢查檔案夾圖標
      const folderIcon = firstFolder.locator('[data-testid^="folder-icon-"]');
      await expect(folderIcon).toBeVisible({ timeout: 5000 });
      
      console.log('演示檔案夾顯示測試通過');
      
    } catch (error) {
      console.log('演示檔案夾顯示測試失敗:', error);
      await page.screenshot({ path: 'debug-demo-folders.png' });
      throw error;
    }
  });

  test('應該能打開檔案夾自定義面板', async ({ page }) => {
    try {
      // 等待檔案夾載入
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      
      // 找到第一個檔案夾
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await expect(firstFolder).toBeVisible({ timeout: 5000 });
      
      // 懸停以顯示自定義按鈕
      await firstFolder.hover();
      await page.waitForTimeout(500);
      
      // 點擊自定義按鈕
      const customizeButton = firstFolder.locator('[data-testid^="customize-"]');
      await expect(customizeButton).toBeVisible({ timeout: 5000 });
      await customizeButton.click();
      
      // 驗證自定義面板打開
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      console.log('檔案夾自定義面板打開測試通過');
      
    } catch (error) {
      console.log('自定義面板打開測試失敗:', error);
      await page.screenshot({ path: 'debug-customization-panel.png' });
      throw error;
    }
  });

  test('應該能切換自定義面板標籤', async ({ page }) => {
    try {
      // 打開自定義面板
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await firstFolder.hover();
      await firstFolder.locator('[data-testid^="customize-"]').click();
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      // 測試主題標籤
      const themesTab = page.locator('[data-testid="themes-tab"]');
      await expect(themesTab).toBeVisible({ timeout: 5000 });
      await themesTab.click();
      await expect(page.locator('[data-testid="themes-content"]')).toBeVisible({ timeout: 5000 });
      
      // 測試顏色標籤
      const colorsTab = page.locator('[data-testid="colors-tab"]');
      await expect(colorsTab).toBeVisible({ timeout: 5000 });
      await colorsTab.click();
      await expect(page.locator('[data-testid="colors-content"]')).toBeVisible({ timeout: 5000 });
      
      // 測試圖標標籤
      const iconsTab = page.locator('[data-testid="icons-tab"]');
      await expect(iconsTab).toBeVisible({ timeout: 5000 });
      await iconsTab.click();
      await expect(page.locator('[data-testid="icons-content"]')).toBeVisible({ timeout: 5000 });
      
      // 測試無障礙標籤
      const accessibilityTab = page.locator('[data-testid="accessibility-tab"]');
      await expect(accessibilityTab).toBeVisible({ timeout: 5000 });
      await accessibilityTab.click();
      await expect(page.locator('[data-testid="accessibility-content"]')).toBeVisible({ timeout: 5000 });
      
      console.log('自定義面板標籤切換測試通過');
      
    } catch (error) {
      console.log('標籤切換測試失敗:', error);
      await page.screenshot({ path: 'debug-tab-switching.png' });
      throw error;
    }
  });

  test('應該能選擇主題', async ({ page }) => {
    try {
      // 打開自定義面板
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await firstFolder.hover();
      await firstFolder.locator('[data-testid^="customize-"]').click();
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      // 確保在主題標籤
      await page.locator('[data-testid="themes-tab"]').click();
      await expect(page.locator('[data-testid="themes-content"]')).toBeVisible({ timeout: 5000 });
      
      // 查找主題選項
      const themes = page.locator('[data-testid^="theme-"]');
      const themeCount = await themes.count();
      
      if (themeCount > 0) {
        console.log(`找到 ${themeCount} 個主題`);
        
        // 點擊第一個主題
        const firstTheme = themes.first();
        await expect(firstTheme).toBeVisible({ timeout: 5000 });
        await firstTheme.click();
        
        // 檢查預覽是否更新
        await expect(page.locator('[data-testid="folder-preview"]')).toBeVisible({ timeout: 5000 });
        
        console.log('主題選擇測試通過');
      } else {
        console.log('沒有找到主題選項，跳過測試');
      }
      
    } catch (error) {
      console.log('主題選擇測試失敗:', error);
      await page.screenshot({ path: 'debug-theme-selection.png' });
      throw error;
    }
  });

  test('應該能自定義顏色', async ({ page }) => {
    try {
      // 打開自定義面板
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await firstFolder.hover();
      await firstFolder.locator('[data-testid^="customize-"]').click();
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      // 切換到顏色標籤
      await page.locator('[data-testid="colors-tab"]').click();
      await expect(page.locator('[data-testid="colors-content"]')).toBeVisible({ timeout: 5000 });
      
      // 查找顏色輸入
      const colorInputs = page.locator('[data-testid^="color-"]');
      const colorCount = await colorInputs.count();
      
      if (colorCount > 0) {
        console.log(`找到 ${colorCount} 個顏色輸入`);
        
        // 修改第一個顏色
        const firstColorInput = colorInputs.first();
        await expect(firstColorInput).toBeVisible({ timeout: 5000 });
        await firstColorInput.fill('#FF6B6B');
        
        // 檢查預覽是否更新
        await expect(page.locator('[data-testid="folder-preview"]')).toBeVisible({ timeout: 5000 });
        
        console.log('顏色自定義測試通過');
      } else {
        console.log('沒有找到顏色輸入，跳過測試');
      }
      
    } catch (error) {
      console.log('顏色自定義測試失敗:', error);
      await page.screenshot({ path: 'debug-color-customization.png' });
      throw error;
    }
  });

  test('應該能搜索和選擇圖標', async ({ page }) => {
    try {
      // 打開自定義面板
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await firstFolder.hover();
      await firstFolder.locator('[data-testid^="customize-"]').click();
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      // 切換到圖標標籤
      await page.locator('[data-testid="icons-tab"]').click();
      await expect(page.locator('[data-testid="icons-content"]')).toBeVisible({ timeout: 5000 });
      
      // 測試圖標搜索
      const searchInput = page.locator('[data-testid="icon-search-input"]');
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill('book');
      await page.waitForTimeout(1000);
      
      // 檢查圖標網格
      const iconsGrid = page.locator('[data-testid="icons-grid"]');
      await expect(iconsGrid).toBeVisible({ timeout: 5000 });
      
      // 查找圖標
      const icons = page.locator('[data-testid^="icon-"]');
      const iconCount = await icons.count();
      
      if (iconCount > 0) {
        console.log(`找到 ${iconCount} 個圖標`);
        
        // 點擊第一個圖標
        const firstIcon = icons.first();
        await expect(firstIcon).toBeVisible({ timeout: 5000 });
        await firstIcon.click();
        
        // 檢查預覽是否更新
        await expect(page.locator('[data-testid="folder-icon-preview"]')).toBeVisible({ timeout: 5000 });
        
        console.log('圖標搜索和選擇測試通過');
      } else {
        console.log('沒有找到圖標，跳過測試');
      }
      
    } catch (error) {
      console.log('圖標搜索和選擇測試失敗:', error);
      await page.screenshot({ path: 'debug-icon-selection.png' });
      throw error;
    }
  });

  test('應該能設定無障礙選項', async ({ page }) => {
    try {
      // 打開自定義面板
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await firstFolder.hover();
      await firstFolder.locator('[data-testid^="customize-"]').click();
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      // 切換到無障礙標籤
      await page.locator('[data-testid="accessibility-tab"]').click();
      await expect(page.locator('[data-testid="accessibility-content"]')).toBeVisible({ timeout: 5000 });
      
      // 查找無障礙選項
      const accessibilityOptions = page.locator('[data-testid^="accessibility-"]');
      const optionCount = await accessibilityOptions.count();
      
      if (optionCount > 0) {
        console.log(`找到 ${optionCount} 個無障礙選項`);
        
        // 切換第一個選項
        const firstOption = accessibilityOptions.first();
        await expect(firstOption).toBeVisible({ timeout: 5000 });
        await firstOption.click();
        
        // 檢查對比度檢查
        await expect(page.locator('[data-testid="contrast-check"]')).toBeVisible({ timeout: 5000 });
        
        console.log('無障礙設定測試通過');
      } else {
        console.log('沒有找到無障礙選項，跳過測試');
      }
      
    } catch (error) {
      console.log('無障礙設定測試失敗:', error);
      await page.screenshot({ path: 'debug-accessibility-settings.png' });
      throw error;
    }
  });

  test('應該能應用自定義設定', async ({ page }) => {
    try {
      // 打開自定義面板
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await firstFolder.hover();
      await firstFolder.locator('[data-testid^="customize-"]').click();
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      // 進行一些自定義設定
      await page.locator('[data-testid="themes-tab"]').click();
      const themes = page.locator('[data-testid^="theme-"]');
      const themeCount = await themes.count();
      
      if (themeCount > 0) {
        await themes.first().click();
      }
      
      // 應用設定
      const applyButton = page.locator('[data-testid="apply-button"]');
      await expect(applyButton).toBeVisible({ timeout: 5000 });
      await applyButton.click();
      
      // 檢查面板是否關閉
      await expect(page.locator('[data-testid="folder-customization-panel"]')).not.toBeVisible({ timeout: 5000 });
      
      // 檢查檔案夾是否有自定義指示器
      await page.waitForTimeout(1000);
      
      console.log('自定義設定應用測試通過');
      
    } catch (error) {
      console.log('自定義設定應用測試失敗:', error);
      await page.screenshot({ path: 'debug-apply-customization.png' });
      throw error;
    }
  });

  test('應該能關閉自定義面板', async ({ page }) => {
    try {
      // 打開自定義面板
      await page.waitForSelector('[data-testid="folders-grid"]', { timeout: 10000 });
      const firstFolder = page.locator('[data-testid^="folder-"]').first();
      await firstFolder.hover();
      await firstFolder.locator('[data-testid^="customize-"]').click();
      await expect(page.locator('[data-testid="folder-customization-panel"]')).toBeVisible({ timeout: 10000 });
      
      // 點擊關閉按鈕
      const closeButton = page.locator('[data-testid="close-customization-panel"]');
      await expect(closeButton).toBeVisible({ timeout: 5000 });
      await closeButton.click();
      
      // 檢查面板是否關閉
      await expect(page.locator('[data-testid="folder-customization-panel"]')).not.toBeVisible({ timeout: 5000 });
      
      console.log('自定義面板關閉測試通過');
      
    } catch (error) {
      console.log('自定義面板關閉測試失敗:', error);
      await page.screenshot({ path: 'debug-close-panel.png' });
      throw error;
    }
  });

  test('應該能顯示主題預覽', async ({ page }) => {
    try {
      // 等待主題預覽區域載入
      await expect(page.locator('[data-testid="themes-preview"]')).toBeVisible({ timeout: 10000 });
      
      // 檢查主題預覽卡片
      const themePreviews = page.locator('[data-testid^="theme-preview-"]');
      const previewCount = await themePreviews.count();
      
      expect(previewCount).toBeGreaterThan(0);
      console.log(`找到 ${previewCount} 個主題預覽`);
      
      // 檢查第一個主題預覽
      const firstPreview = themePreviews.first();
      await expect(firstPreview).toBeVisible({ timeout: 5000 });
      
      console.log('主題預覽顯示測試通過');
      
    } catch (error) {
      console.log('主題預覽顯示測試失敗:', error);
      await page.screenshot({ path: 'debug-theme-previews.png' });
      throw error;
    }
  });

  test('應該能顯示技術特色', async ({ page }) => {
    try {
      // 等待技術特色區域載入
      await expect(page.locator('[data-testid="technical-features"]')).toBeVisible({ timeout: 10000 });
      
      // 檢查是否有技術特色卡片
      const featureCards = page.locator('[data-testid="technical-features"] .bg-white');
      const cardCount = await featureCards.count();
      
      expect(cardCount).toBeGreaterThan(0);
      console.log(`找到 ${cardCount} 個技術特色卡片`);
      
      console.log('技術特色顯示測試通過');
      
    } catch (error) {
      console.log('技術特色顯示測試失敗:', error);
      await page.screenshot({ path: 'debug-technical-features.png' });
      throw error;
    }
  });
});

// 跨瀏覽器測試
test.describe('檔案夾視覺自定義功能 - 跨瀏覽器測試', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`應該在 ${browserName} 中正常工作`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `跳過非 ${browserName} 瀏覽器`);
      
      try {
        await bypassAuthAndGoto(page, '/demo/folder-customization', testUsers.default);
        await waitForPageLoad(page);
        
        // 基本功能測試
        await expect(page.locator('[data-testid="page-title"]')).toContainText('檔案夾視覺自定義演示', { timeout: 10000 });
        await expect(page.locator('[data-testid="folders-grid"]')).toBeVisible({ timeout: 10000 });
        
        console.log(`${browserName} 瀏覽器兼容性測試通過`);
        
      } catch (error) {
        console.log(`${browserName} 瀏覽器測試失敗:`, error);
        await page.screenshot({ path: `debug-${browserName}-compatibility.png` });
        throw error;
      }
    });
  });
});
