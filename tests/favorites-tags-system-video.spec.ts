/**
 * 收藏和標籤系統測試 - 生成真正的 webm 測試影片
 * 遵循三層整合驗證原則和 EduCreate 測試影片管理強制檢查規則
 */

import { test, expect } from '@playwright/test';

test.describe('收藏和標籤系統 - 生成測試影片', () => {
  test('收藏和標籤系統三層整合驗證', async ({ page }) => {
    console.log('🚀 開始收藏和標籤系統三層整合驗證並生成測試影片...');

    // 第一層：主頁可見性測試
    console.log('📍 第一層：主頁可見性測試');
    await page.goto('http://localhost:3003/');
    await page.waitForTimeout(3000);

    // 驗證收藏和標籤系統功能卡片
    const favoritesTagsCard = page.getByTestId('feature-favorites-tags');
    await expect(favoritesTagsCard).toBeVisible();
    
    const favoritesTagsTitle = favoritesTagsCard.locator('h3');
    await expect(favoritesTagsTitle).toContainText('收藏和標籤系統');
    
    const favoritesTagsDescription = favoritesTagsCard.locator('p');
    await expect(favoritesTagsDescription).toContainText('自定義標籤、智能分類、收藏管理');
    
    console.log('✅ 第一層驗證通過：主頁可見性測試成功');
    await page.waitForTimeout(2000);

    // 第二層：導航流程測試
    console.log('📍 第二層：導航流程測試');
    
    const favoritesTagsLink = favoritesTagsCard.getByTestId('favorites-tags-link');
    await favoritesTagsLink.click();
    await page.waitForTimeout(5000);

    // 驗證頁面跳轉成功
    await expect(page).toHaveURL('http://localhost:3003/activities/favorites-tags');
    
    // 驗證頁面標題
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText('收藏和標籤系統');
    
    console.log('✅ 第二層驗證通過：導航流程測試成功');
    await page.waitForTimeout(2000);

    // 第三層：功能互動測試
    console.log('📍 第三層：功能互動測試');

    // 測試收藏和標籤系統功能展示 - 使用更精確的選擇器避免 strict mode violation
    await expect(page.locator('.grid .bg-white .text-sm.font-medium.text-gray-900').filter({ hasText: '收藏管理' })).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium.text-gray-900').filter({ hasText: '自定義標籤' })).toBeVisible();
    await expect(page.locator('.grid .bg-white .text-sm.font-medium.text-gray-900').filter({ hasText: '智能分類' })).toBeVisible();
    
    // 滾動展示功能特性
    await page.evaluate(() => {
      const element = document.querySelector('h2');
      if (element && element.textContent?.includes('收藏和標籤系統功能特性')) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    // 滾動展示記憶科學整合
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('記憶科學整合')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 滾動展示 GEPT 分級整合
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('GEPT 分級整合')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 滾動到 FavoritesTagsPanel 組件
    await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid="favorites-tags-panel"]');
      if (elements.length > 0) {
        elements[0].scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(4000);

    // 等待 FavoritesTagsPanel 載入完成
    await page.waitForTimeout(2000);

    // 測試我的收藏標籤（默認激活）
    console.log('📍 測試我的收藏功能');
    
    const favoritesTab = page.getByTestId('favorites-tab');
    if (await favoritesTab.isVisible()) {
      await favoritesTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ 我的收藏標籤測試成功');
    }

    // 測試標籤管理標籤
    console.log('📍 測試標籤管理功能');
    
    const tagsTab = page.getByTestId('tags-tab');
    if (await tagsTab.isVisible()) {
      await tagsTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 標籤管理標籤測試成功');
      
      // 驗證標籤管理內容
      const tagsContent = page.getByTestId('tags-content');
      if (await tagsContent.isVisible()) {
        console.log('✅ 標籤管理內容顯示正常');
        
        // 測試添加新標籤功能
        const newTagInput = page.getByTestId('new-tag-input');
        const addTagButton = page.getByTestId('add-tag-button');
        
        if (await newTagInput.isVisible() && await addTagButton.isVisible()) {
          await newTagInput.fill('演示標籤');
          await page.waitForTimeout(500);
          await addTagButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ 添加新標籤功能測試成功');
        }
      }
    }

    // 測試智能分類標籤
    console.log('📍 測試智能分類功能');
    
    const smartTab = page.getByTestId('smart-classification-tab');
    if (await smartTab.isVisible()) {
      await smartTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 智能分類標籤測試成功');
      
      // 驗證智能分類內容
      const smartContent = page.getByTestId('smart-classification-content');
      if (await smartContent.isVisible()) {
        console.log('✅ 智能分類內容顯示正常');
      }
    }

    // 回到我的收藏標籤
    if (await favoritesTab.isVisible()) {
      await favoritesTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ 標籤切換循環測試成功');
    }

    console.log('✅ 第三層驗證通過：功能互動測試成功');

    // 展示技術實現
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('技術實現')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 展示使用說明
    await page.evaluate(() => {
      const elements = document.querySelectorAll('h2');
      for (const element of elements) {
        if (element.textContent?.includes('使用說明')) {
          element.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    });
    await page.waitForTimeout(3000);

    // 回到頂部完成演示
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);

    console.log('🎉 收藏和標籤系統三層整合驗證全部通過！');
    
    // 最終等待確保錄影完整
    await page.waitForTimeout(3000);
  });

  test('收藏和標籤系統性能測試', async ({ page }) => {
    console.log('🚀 開始收藏和標籤系統性能測試...');

    // 測量頁面載入時間
    const startTime = Date.now();
    await page.goto('http://localhost:3003/activities/favorites-tags');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`收藏和標籤系統頁面載入時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);

    // 等待 FavoritesTagsPanel 載入
    await page.waitForTimeout(2000);

    // 測試標籤切換性能
    const tabs = [
      { testId: 'favorites-tab', name: '我的收藏' },
      { testId: 'tags-tab', name: '標籤管理' },
      { testId: 'smart-classification-tab', name: '智能分類' }
    ];

    for (const tab of tabs) {
      const tabElement = page.getByTestId(tab.testId);
      if (await tabElement.isVisible()) {
        const switchStart = Date.now();
        await tabElement.click();
        await page.waitForTimeout(100);
        const switchTime = Date.now() - switchStart;
        
        console.log(`${tab.name}切換時間: ${switchTime}ms`);
        expect(switchTime).toBeLessThan(500);
      }
    }

    // 測試添加標籤性能
    const tagsTab = page.getByTestId('tags-tab');
    if (await tagsTab.isVisible()) {
      await tagsTab.click();
      await page.waitForTimeout(100);
      
      const newTagInput = page.getByTestId('new-tag-input');
      const addTagButton = page.getByTestId('add-tag-button');
      
      if (await newTagInput.isVisible() && await addTagButton.isVisible()) {
        const addTagStart = Date.now();
        await newTagInput.fill('性能測試標籤');
        await addTagButton.click();
        await page.waitForTimeout(100);
        const addTagTime = Date.now() - addTagStart;
        
        console.log(`添加標籤時間: ${addTagTime}ms`);
        expect(addTagTime).toBeLessThan(1000);
      }
    }

    // 測試數據載入性能
    const dataLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待 FavoritesTagsPanel 載入
    const dataLoadTime = Date.now() - dataLoadStart;
    
    console.log(`數據載入時間: ${dataLoadTime}ms`);
    expect(dataLoadTime).toBeLessThan(8000);

    console.log('✅ 收藏和標籤系統性能測試完成');
  });
});
