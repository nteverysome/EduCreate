/**
 * 檔案夾統計分析系統端到端測試
 * 測試檔案夾統計分析的真實網站功能互動
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾統計分析系統功能測試', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/demo/folder-analytics');
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  });

  test('應該能正確載入檔案夾統計分析演示頁面', async ({ page }) => {
    // 檢查頁面標題
    const pageTitle = page.locator('[data-testid="page-title"]');
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toContainText('檔案夾統計分析演示');

    // 檢查頁面描述
    const pageDescription = page.locator('[data-testid="page-description"]');
    await expect(pageDescription).toBeVisible();
    await expect(pageDescription).toContainText('檔案夾統計分析功能');

    // 檢查檔案夾選擇按鈕
    const folder1Button = page.locator('[data-testid="folder-1-button"]');
    const folder2Button = page.locator('[data-testid="folder-2-button"]');
    
    await expect(folder1Button).toBeVisible();
    await expect(folder2Button).toBeVisible();
    
    console.log('檔案夾統計分析頁面載入成功');
  });

  test('應該能正確顯示統計分析面板', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 檢查統計分析面板
    const analyticsPanel = page.locator('[data-testid="folder-analytics-panel"]');
    await expect(analyticsPanel).toBeVisible();

    // 檢查分析標題
    const analyticsTitle = page.locator('[data-testid="analytics-title"]');
    await expect(analyticsTitle).toBeVisible();
    await expect(analyticsTitle).toContainText('統計分析');

    // 檢查分析描述
    const analyticsDescription = page.locator('[data-testid="analytics-description"]');
    await expect(analyticsDescription).toBeVisible();

    console.log('統計分析面板顯示正常');
  });

  test('應該能切換不同的檔案夾並更新統計數據', async ({ page }) => {
    // 等待初始載入
    await page.waitForTimeout(3000);

    // 檢查初始選中的檔案夾（folder-1）
    const folder1Button = page.locator('[data-testid="folder-1-button"]');
    await expect(folder1Button).toHaveClass(/bg-blue-100/);

    // 檢查初始統計數據
    const totalActivitiesCard = page.locator('[data-testid="total-activities-card"]');
    await expect(totalActivitiesCard).toBeVisible();
    
    const initialActivitiesText = await totalActivitiesCard.textContent();
    console.log(`初級檔案夾活動數: ${initialActivitiesText}`);

    // 切換到檔案夾2
    const folder2Button = page.locator('[data-testid="folder-2-button"]');
    await folder2Button.click();
    await page.waitForTimeout(2000);

    // 檢查檔案夾2是否被選中
    await expect(folder2Button).toHaveClass(/bg-green-100/);
    await expect(folder1Button).not.toHaveClass(/bg-blue-100/);

    // 檢查統計數據是否更新
    const updatedActivitiesText = await totalActivitiesCard.textContent();
    console.log(`中級檔案夾活動數: ${updatedActivitiesText}`);

    // 驗證數據確實發生了變化
    expect(updatedActivitiesText).not.toBe(initialActivitiesText);
    
    console.log('檔案夾切換和數據更新功能正常');
  });

  test('應該能正確顯示基本統計卡片', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 檢查四個基本統計卡片
    const totalActivitiesCard = page.locator('[data-testid="total-activities-card"]');
    const totalSizeCard = page.locator('[data-testid="total-size-card"]');
    const averageScoreCard = page.locator('[data-testid="average-score-card"]');
    const healthScoreCard = page.locator('[data-testid="health-score-card"]');

    // 驗證卡片可見性
    await expect(totalActivitiesCard).toBeVisible();
    await expect(totalSizeCard).toBeVisible();
    await expect(averageScoreCard).toBeVisible();
    await expect(healthScoreCard).toBeVisible();

    // 檢查卡片內容
    const activitiesText = await totalActivitiesCard.textContent();
    const sizeText = await totalSizeCard.textContent();
    const scoreText = await averageScoreCard.textContent();
    const healthText = await healthScoreCard.textContent();

    expect(activitiesText).toContain('總活動數');
    expect(sizeText).toContain('總大小');
    expect(scoreText).toContain('平均分數');
    expect(healthText).toContain('健康度');

    console.log(`統計卡片數據: 活動數=${activitiesText}, 大小=${sizeText}, 分數=${scoreText}, 健康度=${healthText}`);
  });

  test('應該能正確顯示 GEPT 等級分布', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 檢查 GEPT 分布區域
    const geptDistribution = page.locator('[data-testid="gept-distribution"]');
    await expect(geptDistribution).toBeVisible();

    // 檢查分布標題
    const distributionText = await geptDistribution.textContent();
    expect(distributionText).toContain('GEPT 等級分布');
    expect(distributionText).toContain('初級');
    expect(distributionText).toContain('中級');
    expect(distributionText).toContain('中高級');
    expect(distributionText).toContain('未指定');

    console.log('GEPT 等級分布顯示正常');
  });

  test('應該能正確顯示健康度指標', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 檢查健康度指標區域
    const healthMetrics = page.locator('[data-testid="health-metrics"]');
    await expect(healthMetrics).toBeVisible();

    // 檢查健康度指標內容
    const metricsText = await healthMetrics.textContent();
    expect(metricsText).toContain('健康度指標');
    expect(metricsText).toContain('活動新鮮度');
    expect(metricsText).toContain('學習參與度');
    expect(metricsText).toContain('協作健康度');
    expect(metricsText).toContain('內容品質');

    // 檢查進度條
    const progressBars = healthMetrics.locator('.bg-gray-200.rounded-full.h-2');
    const progressBarCount = await progressBars.count();
    expect(progressBarCount).toBeGreaterThanOrEqual(4);

    console.log('健康度指標顯示正常');
  });

  test('應該能切換不同的分析標籤', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 檢查所有標籤
    const overviewTab = page.locator('[data-testid="overview-tab"]');
    const learningTab = page.locator('[data-testid="learning-tab"]');
    const usageTab = page.locator('[data-testid="usage-tab"]');
    const collaborationTab = page.locator('[data-testid="collaboration-tab"]');
    const trendsTab = page.locator('[data-testid="trends-tab"]');

    // 驗證標籤可見性
    await expect(overviewTab).toBeVisible();
    await expect(learningTab).toBeVisible();
    await expect(usageTab).toBeVisible();
    await expect(collaborationTab).toBeVisible();
    await expect(trendsTab).toBeVisible();

    // 測試學習數據標籤
    await learningTab.click();
    await page.waitForTimeout(1000);

    const learningContent = page.locator('[data-testid="learning-content"]');
    await expect(learningContent).toBeVisible();

    const learningText = await learningContent.textContent();
    expect(learningText).toContain('完成率');
    expect(learningText).toContain('記憶保持率');
    expect(learningText).toContain('總學習時間');

    console.log('學習數據標籤切換成功');

    // 測試使用統計標籤
    await usageTab.click();
    await page.waitForTimeout(1000);

    const usageContent = page.locator('[data-testid="usage-content"]');
    await expect(usageContent).toBeVisible();

    const usageText = await usageContent.textContent();
    expect(usageText).toContain('總瀏覽量');
    expect(usageText).toContain('總編輯次數');
    expect(usageText).toContain('分享次數');

    console.log('使用統計標籤切換成功');

    // 測試協作分析標籤
    await collaborationTab.click();
    await page.waitForTimeout(1000);

    const collaborationContent = page.locator('[data-testid="collaboration-content"]');
    await expect(collaborationContent).toBeVisible();

    const collaborationText = await collaborationContent.textContent();
    expect(collaborationText).toContain('協作者數量');
    expect(collaborationText).toContain('共享活動');
    expect(collaborationText).toContain('公開活動');

    console.log('協作分析標籤切換成功');

    // 測試趨勢分析標籤
    await trendsTab.click();
    await page.waitForTimeout(1000);

    const trendsContent = page.locator('[data-testid="trends-content"]');
    await expect(trendsContent).toBeVisible();

    const trendsText = await trendsContent.textContent();
    expect(trendsText).toContain('趨勢分析圖表');

    console.log('趨勢分析標籤切換成功');

    // 回到總覽標籤
    await overviewTab.click();
    await page.waitForTimeout(1000);

    const overviewContent = page.locator('[data-testid="overview-content"]');
    await expect(overviewContent).toBeVisible();

    console.log('標籤切換功能完全正常');
  });

  test('應該能打開和關閉數據導出模態框', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 點擊導出按鈕
    const exportButton = page.locator('[data-testid="export-button"]');
    await expect(exportButton).toBeVisible();
    await exportButton.click();
    await page.waitForTimeout(500);

    // 檢查導出格式選擇
    const exportFormatSelect = page.locator('[data-testid="export-format-select"]');
    await expect(exportFormatSelect).toBeVisible();

    // 測試格式選擇
    await exportFormatSelect.selectOption('csv');
    const selectedValue = await exportFormatSelect.inputValue();
    expect(selectedValue).toBe('csv');

    // 測試取消按鈕
    const exportCancel = page.locator('[data-testid="export-cancel"]');
    await exportCancel.click();
    await page.waitForTimeout(500);

    // 檢查模態框是否關閉
    await expect(exportFormatSelect).not.toBeVisible();

    console.log('數據導出模態框功能正常');
  });

  test('應該能測試導出確認功能', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 打開導出模態框
    const exportButton = page.locator('[data-testid="export-button"]');
    await exportButton.click();
    await page.waitForTimeout(500);

    // 選擇導出格式
    const exportFormatSelect = page.locator('[data-testid="export-format-select"]');
    await exportFormatSelect.selectOption('json');

    // 點擊確認導出
    const exportConfirm = page.locator('[data-testid="export-confirm"]');
    await exportConfirm.click();
    await page.waitForTimeout(500);

    // 檢查模態框是否關閉
    await expect(exportFormatSelect).not.toBeVisible();

    console.log('導出確認功能正常');
  });

  test('應該能正確顯示技術特色信息', async ({ page }) => {
    // 檢查技術特色區域
    const technicalFeatures = page.locator('[data-testid="technical-features"]');
    await expect(technicalFeatures).toBeVisible();

    // 檢查特色內容
    const featuresText = await technicalFeatures.textContent();
    expect(featuresText).toContain('多維度統計');
    expect(featuresText).toContain('學習效果分析');
    expect(featuresText).toContain('GEPT 分級統計');
    expect(featuresText).toContain('健康度評估');
    expect(featuresText).toContain('協作分析');
    expect(featuresText).toContain('數據導出');

    console.log('技術特色信息顯示完整');
  });

  test('應該能處理載入狀態', async ({ page }) => {
    // 重新載入頁面以觀察載入狀態
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // 檢查是否有載入動畫或載入狀態
    const loadingElements = page.locator('.animate-pulse');
    
    // 在短時間內可能會看到載入狀態
    await page.waitForTimeout(1000);

    // 最終應該顯示完整的統計面板
    const analyticsPanel = page.locator('[data-testid="folder-analytics-panel"]');
    await expect(analyticsPanel).toBeVisible({ timeout: 10000 });

    console.log('載入狀態處理正常');
  });

  test('應該能測試響應式設計', async ({ page }) => {
    // 測試不同視窗大小
    const viewports = [
      { width: 1200, height: 800, name: '桌面' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手機' }
    ];

    for (const viewport of viewports) {
      console.log(`測試 ${viewport.name} 視圖 (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      // 檢查主要元素是否仍然可見
      const pageTitle = page.locator('[data-testid="page-title"]');
      await expect(pageTitle).toBeVisible();

      const analyticsPanel = page.locator('[data-testid="folder-analytics-panel"]');
      await expect(analyticsPanel).toBeVisible();

      console.log(`${viewport.name} 視圖測試通過`);
    }
  });

  test('應該能檢查數據的真實性和一致性', async ({ page }) => {
    // 等待統計面板載入
    await page.waitForTimeout(3000);

    // 檢查初級檔案夾的數據
    const folder1Button = page.locator('[data-testid="folder-1-button"]');
    await folder1Button.click();
    await page.waitForTimeout(2000);

    const totalActivitiesCard = page.locator('[data-testid="total-activities-card"]');
    const folder1ActivitiesText = await totalActivitiesCard.textContent();
    
    // 切換到中級檔案夾
    const folder2Button = page.locator('[data-testid="folder-2-button"]');
    await folder2Button.click();
    await page.waitForTimeout(2000);

    const folder2ActivitiesText = await totalActivitiesCard.textContent();

    // 驗證兩個檔案夾的數據不同
    expect(folder1ActivitiesText).not.toBe(folder2ActivitiesText);

    console.log(`檔案夾數據一致性檢查: 初級=${folder1ActivitiesText}, 中級=${folder2ActivitiesText}`);

    // 檢查健康度數據的合理性
    const healthScoreCard = page.locator('[data-testid="health-score-card"]');
    const healthText = await healthScoreCard.textContent();
    
    // 提取數字部分
    const healthScore = parseFloat(healthText?.match(/[\d.]+/)?.[0] || '0');
    expect(healthScore).toBeGreaterThanOrEqual(0);
    expect(healthScore).toBeLessThanOrEqual(100);

    console.log(`健康度分數合理性檢查: ${healthScore} (0-100範圍內)`);
  });
});
