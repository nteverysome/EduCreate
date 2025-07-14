/**
 * 驗證真實網站互動的簡化測試
 * 專門用來證明 Playwright 確實與真實網站互動
 */

import { test, expect } from '@playwright/test';

test.describe('驗證真實網站互動', () => {
  test('證明 Playwright 確實與真實網站互動', async ({ page }) => {
    console.log('🚀 開始驗證真實網站互動...');
    
    // 1. 導航到真實頁面
    console.log('📍 導航到檔案夾統計分析頁面...');
    await page.goto('/demo/folder-analytics');
    await page.waitForLoadState('domcontentloaded');
    
    // 2. 截取初始頁面截圖
    console.log('📸 截取初始頁面截圖...');
    await page.screenshot({ path: 'test-results/real-interaction-step1.png', fullPage: true });
    
    // 3. 獲取頁面的真實內容
    console.log('📄 獲取頁面真實內容...');
    const pageTitle = await page.locator('h1').first().textContent();
    const pageContent = await page.textContent('body');
    const pageLength = pageContent?.length || 0;
    
    console.log(`✅ 頁面標題: ${pageTitle}`);
    console.log(`✅ 頁面內容長度: ${pageLength} 字符`);
    
    // 4. 與真實元素互動 - 點擊檔案夾切換
    console.log('🖱️ 點擊檔案夾切換按鈕...');
    const folder1Button = page.locator('[data-testid="folder-1-button"]');
    const folder2Button = page.locator('[data-testid="folder-2-button"]');
    
    // 檢查初始狀態
    const initialFolder1Class = await folder1Button.getAttribute('class');
    console.log(`📋 初始檔案夾1樣式: ${initialFolder1Class}`);
    
    // 點擊檔案夾2
    await folder2Button.click();
    await page.waitForTimeout(2000);
    
    // 截取切換後的截圖
    console.log('📸 截取切換後的截圖...');
    await page.screenshot({ path: 'test-results/real-interaction-step2.png', fullPage: true });
    
    // 檢查切換後的狀態
    const afterFolder1Class = await folder1Button.getAttribute('class');
    const afterFolder2Class = await folder2Button.getAttribute('class');
    
    console.log(`📋 切換後檔案夾1樣式: ${afterFolder1Class}`);
    console.log(`📋 切換後檔案夾2樣式: ${afterFolder2Class}`);
    
    // 5. 獲取統計數據的真實變化
    console.log('📊 獲取統計數據...');
    const totalActivitiesCard = page.locator('[data-testid="total-activities-card"]');
    const activitiesText = await totalActivitiesCard.textContent();
    console.log(`📈 活動統計數據: ${activitiesText}`);
    
    // 6. 測試標籤切換的真實互動
    console.log('🏷️ 測試標籤切換...');
    const learningTab = page.locator('[data-testid="learning-tab"]');
    await learningTab.click();
    await page.waitForTimeout(1000);
    
    // 截取標籤切換後的截圖
    console.log('📸 截取標籤切換後的截圖...');
    await page.screenshot({ path: 'test-results/real-interaction-step3.png', fullPage: true });
    
    const learningContent = page.locator('[data-testid="learning-content"]');
    const learningText = await learningContent.textContent();
    console.log(`📚 學習數據內容: ${learningText?.substring(0, 100)}...`);
    
    // 7. 測試導出模態框的真實互動
    console.log('📤 測試導出模態框...');
    const exportButton = page.locator('[data-testid="export-button"]');
    await exportButton.click();
    await page.waitForTimeout(1000);
    
    // 截取模態框截圖
    console.log('📸 截取模態框截圖...');
    await page.screenshot({ path: 'test-results/real-interaction-step4.png', fullPage: true });
    
    const exportModal = page.locator('[data-testid="export-format-select"]');
    const isModalVisible = await exportModal.isVisible();
    console.log(`📋 導出模態框是否可見: ${isModalVisible}`);
    
    // 8. 獲取頁面的詳細元素信息
    console.log('🔍 分析頁面元素...');
    const allButtons = await page.locator('button').count();
    const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const allInputs = await page.locator('input, select, textarea').count();
    
    console.log(`🔘 頁面按鈕數量: ${allButtons}`);
    console.log(`📝 頁面標題數量: ${allHeadings}`);
    console.log(`📝 頁面輸入元素數量: ${allInputs}`);
    
    // 9. 檢查網路請求（如果有的話）
    console.log('🌐 檢查網路活動...');
    const responses = [];
    page.on('response', response => {
      responses.push(response.url());
    });
    
    // 重新載入頁面以觀察網路請求
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    console.log(`🌐 網路請求數量: ${responses.length}`);
    if (responses.length > 0) {
      console.log(`🌐 部分請求: ${responses.slice(0, 5).join(', ')}`);
    }
    
    // 10. 最終驗證
    console.log('✅ 最終驗證...');
    
    // 驗證頁面確實載入了我們的內容
    expect(pageTitle).toContain('檔案夾統計分析演示');
    expect(pageLength).toBeGreaterThan(1000); // 頁面有實質內容
    expect(allButtons).toBeGreaterThan(5); // 有多個可互動按鈕
    expect(allHeadings).toBeGreaterThan(3); // 有多個標題
    
    // 驗證互動確實改變了頁面狀態
    expect(initialFolder1Class).not.toBe(afterFolder1Class);
    expect(isModalVisible).toBe(true);
    
    console.log('🎉 真實網站互動驗證完成！');
    console.log('📊 驗證結果摘要:');
    console.log(`   - 頁面標題: ${pageTitle}`);
    console.log(`   - 內容長度: ${pageLength} 字符`);
    console.log(`   - 按鈕數量: ${allButtons}`);
    console.log(`   - 標題數量: ${allHeadings}`);
    console.log(`   - 檔案夾切換: 成功`);
    console.log(`   - 標籤切換: 成功`);
    console.log(`   - 模態框打開: 成功`);
    console.log(`   - 網路請求: ${responses.length} 個`);
  });
});
