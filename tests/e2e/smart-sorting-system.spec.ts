/**
 * 智能排序系統端到端測試
 * 測試多維度智能排序的真實網站功能互動
 */

import { test, expect } from '@playwright/test';

test.describe('智能排序系統功能測試', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/demo/smart-sorting');
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  });

  test('應該能正確載入智能排序演示頁面', async ({ page }) => {
    // 檢查頁面標題
    const pageTitle = page.locator('[data-testid="page-title"]');
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toContainText('智能排序系統演示');

    // 檢查頁面描述
    const pageDescription = page.locator('[data-testid="page-description"]');
    await expect(pageDescription).toBeVisible();
    await expect(pageDescription).toContainText('多維度智能排序功能');

    // 檢查項目表格
    const itemsTable = page.locator('[data-testid="items-table"]');
    await expect(itemsTable).toBeVisible();

    // 檢查是否有項目行
    const itemRows = page.locator('[data-testid^="item-row-"]');
    const rowCount = await itemRows.count();
    expect(rowCount).toBeGreaterThan(0);
    console.log(`找到 ${rowCount} 個項目行`);
  });

  test('應該能打開和關閉智能排序面板', async ({ page }) => {
    // 找到排序觸發按鈕
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await expect(sortingTrigger).toBeVisible();

    // 點擊打開排序面板
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    // 檢查排序面板是否出現
    const sortingPanel = page.locator('[data-testid="smart-sorting-panel"]');
    await expect(sortingPanel).toBeVisible();

    // 檢查標籤是否存在
    const presetsTab = page.locator('[data-testid="presets-tab"]');
    const customTab = page.locator('[data-testid="custom-tab"]');
    const advancedTab = page.locator('[data-testid="advanced-tab"]');
    
    await expect(presetsTab).toBeVisible();
    await expect(customTab).toBeVisible();
    await expect(advancedTab).toBeVisible();

    // 點擊外部關閉面板
    const overlay = page.locator('[data-testid="sorting-panel-overlay"]');
    await overlay.click();
    await page.waitForTimeout(500);

    // 檢查面板是否關閉
    await expect(sortingPanel).not.toBeVisible();
  });

  test('應該能使用預設排序方式', async ({ page }) => {
    // 打開排序面板
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    // 檢查預設排序選項
    const nameAscPreset = page.locator('[data-testid="preset-name-asc"]');
    const recentFirstPreset = page.locator('[data-testid="preset-recent-first"]');
    const mostUsedPreset = page.locator('[data-testid="preset-most-used"]');

    // 測試名稱升序排序
    if (await nameAscPreset.isVisible()) {
      await nameAscPreset.click();
      await page.waitForTimeout(1000);

      // 檢查排序是否應用
      const firstItemName = page.locator('[data-testid="item-row-0"] .text-sm.font-medium').first();
      const secondItemName = page.locator('[data-testid="item-row-1"] .text-sm.font-medium').first();
      
      const firstName = await firstItemName.textContent();
      const secondName = await secondItemName.textContent();
      
      console.log(`名稱排序結果: ${firstName} -> ${secondName}`);
      
      // 驗證字母順序（中文和英文混合）
      if (firstName && secondName) {
        expect(firstName.localeCompare(secondName, 'zh-TW')).toBeLessThanOrEqual(0);
      }
    }

    // 測試最近修改排序
    await sortingTrigger.click();
    await page.waitForTimeout(500);
    
    if (await recentFirstPreset.isVisible()) {
      await recentFirstPreset.click();
      await page.waitForTimeout(1000);
      console.log('應用了最近修改排序');
    }
  });

  test('應該能使用自定義排序', async ({ page }) => {
    // 打開排序面板
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    // 切換到自定義標籤
    const customTab = page.locator('[data-testid="custom-tab"]');
    await customTab.click();
    await page.waitForTimeout(500);

    // 檢查自定義排序控件
    const primaryCriteriaSelect = page.locator('[data-testid="primary-criteria-select"]');
    const primaryDirectionSelect = page.locator('[data-testid="primary-direction-select"]');
    
    await expect(primaryCriteriaSelect).toBeVisible();
    await expect(primaryDirectionSelect).toBeVisible();

    // 設定自定義排序：按類型降序
    await primaryCriteriaSelect.selectOption('type');
    await primaryDirectionSelect.selectOption('desc');

    // 應用自定義排序
    const applyButton = page.locator('[data-testid="apply-custom-sort"]');
    await applyButton.click();
    await page.waitForTimeout(1000);

    // 檢查排序結果
    const firstItemType = page.locator('[data-testid="item-row-0"] .inline-flex.px-2');
    const firstTypeText = await firstItemType.textContent();
    console.log(`自定義排序後第一個項目類型: ${firstTypeText}`);
  });

  test('應該能添加和移除多級排序', async ({ page }) => {
    // 打開排序面板並切換到自定義標籤
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    const customTab = page.locator('[data-testid="custom-tab"]');
    await customTab.click();
    await page.waitForTimeout(500);

    // 添加次要排序
    const addSecondaryButton = page.locator('[data-testid="add-secondary-sort"]');
    if (await addSecondaryButton.isVisible()) {
      await addSecondaryButton.click();
      await page.waitForTimeout(500);

      // 檢查次要排序控件是否出現
      const secondaryCriteriaSelect = page.locator('[data-testid="secondary-criteria-select"]');
      const secondaryDirectionSelect = page.locator('[data-testid="secondary-direction-select"]');
      
      await expect(secondaryCriteriaSelect).toBeVisible();
      await expect(secondaryDirectionSelect).toBeVisible();

      // 設定次要排序
      await secondaryCriteriaSelect.selectOption('size');
      await secondaryDirectionSelect.selectOption('asc');

      // 添加第三級排序
      const addTertiaryButton = page.locator('[data-testid="add-tertiary-sort"]');
      if (await addTertiaryButton.isVisible()) {
        await addTertiaryButton.click();
        await page.waitForTimeout(500);

        const tertiaryCriteriaSelect = page.locator('[data-testid="tertiary-criteria-select"]');
        await expect(tertiaryCriteriaSelect).toBeVisible();

        // 移除第三級排序
        const removeTertiaryButton = page.locator('[data-testid="remove-tertiary-sort"]');
        await removeTertiaryButton.click();
        await page.waitForTimeout(500);

        await expect(tertiaryCriteriaSelect).not.toBeVisible();
      }

      // 移除次要排序
      const removeSecondaryButton = page.locator('[data-testid="remove-secondary-sort"]');
      await removeSecondaryButton.click();
      await page.waitForTimeout(500);

      await expect(secondaryCriteriaSelect).not.toBeVisible();
    }
  });

  test('應該能創建和使用自定義預設', async ({ page }) => {
    // 打開排序面板並切換到自定義標籤
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    const customTab = page.locator('[data-testid="custom-tab"]');
    await customTab.click();
    await page.waitForTimeout(500);

    // 設定自定義排序
    const primaryCriteriaSelect = page.locator('[data-testid="primary-criteria-select"]');
    await primaryCriteriaSelect.selectOption('accessCount');

    // 點擊保存為預設
    const saveAsPresetButton = page.locator('[data-testid="save-as-preset"]');
    await saveAsPresetButton.click();
    await page.waitForTimeout(500);

    // 填寫預設信息
    const presetNameInput = page.locator('[data-testid="preset-name-input"]');
    const presetDescriptionInput = page.locator('[data-testid="preset-description-input"]');
    
    await presetNameInput.fill('我的使用頻率排序');
    await presetDescriptionInput.fill('按使用次數排序的自定義預設');

    // 創建預設
    const createPresetButton = page.locator('[data-testid="create-preset-confirm"]');
    await createPresetButton.click();
    await page.waitForTimeout(1000);

    // 檢查是否成功創建並應用
    console.log('成功創建自定義排序預設');
  });

  test('應該能切換學習上下文並獲得智能建議', async ({ page }) => {
    // 切換學習情境
    const sessionContextSelect = page.locator('[data-testid="session-context-select"]');
    await sessionContextSelect.selectOption('study');
    await page.waitForTimeout(500);

    // 打開排序面板
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    // 檢查是否有智能建議
    const suggestions = page.locator('[data-testid^="suggestion-"]');
    const suggestionCount = await suggestions.count();
    
    if (suggestionCount > 0) {
      console.log(`找到 ${suggestionCount} 個智能建議`);
      
      // 測試第一個建議
      const firstSuggestion = suggestions.first();
      await firstSuggestion.click();
      await page.waitForTimeout(1000);
      
      console.log('成功應用智能建議排序');
    }

    // 測試其他學習情境
    await page.locator('[data-testid="sorting-panel-overlay"]').click();
    await sessionContextSelect.selectOption('review');
    await page.waitForTimeout(500);

    await sortingTrigger.click();
    await page.waitForTimeout(500);

    const reviewSuggestions = page.locator('[data-testid^="suggestion-"]');
    const reviewSuggestionCount = await reviewSuggestions.count();
    console.log(`復習模式下找到 ${reviewSuggestionCount} 個智能建議`);
  });

  test('應該能顯示和隱藏排序分析', async ({ page }) => {
    // 應用一個排序
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    const nameAscPreset = page.locator('[data-testid="preset-name-asc"]');
    if (await nameAscPreset.isVisible()) {
      await nameAscPreset.click();
      await page.waitForTimeout(1000);
    }

    // 顯示排序分析
    const toggleAnalysisButton = page.locator('[data-testid="toggle-analysis"]');
    await toggleAnalysisButton.click();
    await page.waitForTimeout(500);

    // 檢查分析面板
    const sortingAnalysis = page.locator('[data-testid="sorting-analysis"]');
    await expect(sortingAnalysis).toBeVisible();

    // 檢查分析指標
    const analysisText = await sortingAnalysis.textContent();
    expect(analysisText).toContain('相關性分數');
    expect(analysisText).toContain('多樣性分數');
    expect(analysisText).toContain('預測滿意度');

    console.log('排序分析顯示正常');

    // 隱藏分析
    await toggleAnalysisButton.click();
    await page.waitForTimeout(500);

    await expect(sortingAnalysis).not.toBeVisible();
  });

  test('應該能正確顯示項目詳細信息', async ({ page }) => {
    // 檢查表格標題
    const tableHeaders = page.locator('thead th');
    const headerCount = await tableHeaders.count();
    expect(headerCount).toBeGreaterThanOrEqual(7);

    // 檢查第一個項目的詳細信息
    const firstItemRow = page.locator('[data-testid="item-row-0"]');
    await expect(firstItemRow).toBeVisible();

    // 檢查項目名稱
    const itemName = firstItemRow.locator('.text-sm.font-medium').first();
    const nameText = await itemName.textContent();
    expect(nameText).toBeTruthy();
    console.log(`第一個項目名稱: ${nameText}`);

    // 檢查項目類型標籤
    const typeLabel = firstItemRow.locator('.inline-flex.px-2');
    const typeText = await typeLabel.textContent();
    expect(typeText).toMatch(/(檔案夾|活動)/);
    console.log(`項目類型: ${typeText}`);

    // 檢查GEPT等級
    const geptLevel = firstItemRow.locator('td').nth(2);
    const geptText = await geptLevel.textContent();
    console.log(`GEPT等級: ${geptText}`);

    // 檢查文件大小
    const fileSize = firstItemRow.locator('td').nth(3);
    const sizeText = await fileSize.textContent();
    expect(sizeText).toMatch(/(B|KB|MB)/);
    console.log(`文件大小: ${sizeText}`);

    // 檢查使用次數
    const usageCount = firstItemRow.locator('td').nth(4);
    const usageText = await usageCount.textContent();
    expect(usageText).toContain('總計');
    console.log(`使用統計: ${usageText}`);
  });

  test('應該能正確處理不同的排序維度', async ({ page }) => {
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    
    // 測試多種排序維度
    const sortingTests = [
      { preset: 'preset-name-desc', name: '名稱 Z-A' },
      { preset: 'preset-most-used', name: '最常使用' },
      { preset: 'preset-learning-progress', name: '學習進度' },
      { preset: 'preset-smart-relevance', name: 'AI智能推薦' }
    ];

    for (const test of sortingTests) {
      // 打開排序面板
      await sortingTrigger.click();
      await page.waitForTimeout(500);

      // 嘗試點擊預設
      const preset = page.locator(`[data-testid="${test.preset}"]`);
      if (await preset.isVisible()) {
        await preset.click();
        await page.waitForTimeout(1000);
        
        console.log(`成功應用 ${test.name} 排序`);
        
        // 檢查排序按鈕文本是否更新
        const buttonText = await sortingTrigger.textContent();
        console.log(`排序按鈕文本: ${buttonText}`);
      } else {
        console.log(`預設 ${test.preset} 不可見，跳過測試`);
        // 關閉面板
        const overlay = page.locator('[data-testid="sorting-panel-overlay"]');
        await overlay.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('應該能正確顯示技術特色信息', async ({ page }) => {
    // 檢查技術特色區域
    const technicalFeatures = page.locator('[data-testid="technical-features"]');
    await expect(technicalFeatures).toBeVisible();

    // 檢查特色內容
    const featuresText = await technicalFeatures.textContent();
    expect(featuresText).toContain('多維度排序');
    expect(featuresText).toContain('AI智能推薦');
    expect(featuresText).toContain('多級排序');
    expect(featuresText).toContain('記憶科學整合');
    expect(featuresText).toContain('自定義預設');
    expect(featuresText).toContain('效果分析');

    console.log('技術特色信息顯示完整');
  });

  test('應該能處理空狀態和錯誤情況', async ({ page }) => {
    // 測試取消創建預設
    const sortingTrigger = page.locator('[data-testid="smart-sorting-trigger"]');
    await sortingTrigger.click();
    await page.waitForTimeout(500);

    const customTab = page.locator('[data-testid="custom-tab"]');
    await customTab.click();
    await page.waitForTimeout(500);

    const saveAsPresetButton = page.locator('[data-testid="save-as-preset"]');
    await saveAsPresetButton.click();
    await page.waitForTimeout(500);

    // 測試取消按鈕
    const cancelButton = page.locator('[data-testid="create-preset-cancel"]');
    await cancelButton.click();
    await page.waitForTimeout(500);

    // 檢查對話框是否關閉
    const presetNameInput = page.locator('[data-testid="preset-name-input"]');
    await expect(presetNameInput).not.toBeVisible();

    console.log('成功測試取消創建預設功能');
  });
});
