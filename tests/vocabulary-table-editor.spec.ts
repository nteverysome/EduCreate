/**
 * 詞彙表格編輯器 E2E 測試
 * 測試完整的詞彙輸入流程和遊戲系統整合
 */

import { test, expect } from '@playwright/test';

test.describe('詞彙表格編輯器', () => {
  test.beforeEach(async ({ page }) => {
    // 導航到 universal-game 頁面
    await page.goto('/universal-game');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 確保詞彙表格輸入標籤是活動的
    await page.click('[data-testid="tab-vocabulary-table"]');
    await page.waitForTimeout(1000);
  });

  test('應該顯示詞彙表格輸入界面', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('統一內容編輯器');
    
    // 檢查詞彙表格輸入標籤
    const vocabularyTab = page.locator('[data-testid="tab-vocabulary-table"]');
    await expect(vocabularyTab).toBeVisible();
    await expect(vocabularyTab).toContainText('詞彙表格輸入');
    
    // 檢查活動標題輸入框
    const titleInput = page.locator('input[placeholder="輸入活動標題..."]');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue('無標題43');
    
    // 檢查操作按鈕
    await expect(page.locator('button:has-text("新增項目")')).toBeVisible();
    await expect(page.locator('button:has-text("交換列")')).toBeVisible();
    await expect(page.locator('button:has-text("完成")')).toBeVisible();
    
    // 檢查表格標題
    await expect(page.locator('text=詞彙字')).toBeVisible();
    await expect(page.locator('text=答案')).toBeVisible();
    await expect(page.locator('text=圖片')).toBeVisible();
    
    // 檢查預設的5個輸入行
    const englishInputs = page.locator('input[placeholder="輸入英文單字..."]');
    const chineseInputs = page.locator('input[placeholder="輸入中文翻譯..."]');
    
    await expect(englishInputs).toHaveCount(5);
    await expect(chineseInputs).toHaveCount(5);
  });

  test('應該能夠輸入詞彙對', async ({ page }) => {
    // 修改活動標題
    const titleInput = page.locator('input[placeholder="輸入活動標題..."]');
    await titleInput.fill('測試詞彙活動');
    
    // 輸入第一個詞彙對
    const firstEnglishInput = page.locator('input[placeholder="輸入英文單字..."]').first();
    const firstChineseInput = page.locator('input[placeholder="輸入中文翻譯..."]').first();
    
    await firstEnglishInput.fill('apple');
    await firstChineseInput.fill('蘋果');
    
    // 輸入第二個詞彙對
    const secondEnglishInput = page.locator('input[placeholder="輸入英文單字..."]').nth(1);
    const secondChineseInput = page.locator('input[placeholder="輸入中文翻譯..."]').nth(1);
    
    await secondEnglishInput.fill('banana');
    await secondChineseInput.fill('香蕉');
    
    // 檢查統計信息更新
    await expect(page.locator('text=已輸入')).toContainText('2');
    
    // 驗證輸入的值
    await expect(firstEnglishInput).toHaveValue('apple');
    await expect(firstChineseInput).toHaveValue('蘋果');
    await expect(secondEnglishInput).toHaveValue('banana');
    await expect(secondChineseInput).toHaveValue('香蕉');
  });

  test('應該能夠新增和刪除項目', async ({ page }) => {
    // 檢查初始項目數量
    let englishInputs = page.locator('input[placeholder="輸入英文單字..."]');
    await expect(englishInputs).toHaveCount(5);
    
    // 新增項目
    await page.click('button:has-text("新增項目")');
    await page.waitForTimeout(500);
    
    // 檢查項目數量增加
    englishInputs = page.locator('input[placeholder="輸入英文單字..."]');
    await expect(englishInputs).toHaveCount(6);
    
    // 刪除最後一個項目
    const deleteButtons = page.locator('button[title="刪除項目"]');
    await deleteButtons.last().click();
    await page.waitForTimeout(500);
    
    // 檢查項目數量減少
    englishInputs = page.locator('input[placeholder="輸入英文單字..."]');
    await expect(englishInputs).toHaveCount(5);
  });

  test('應該能夠交換列', async ({ page }) => {
    // 輸入測試數據
    const firstEnglishInput = page.locator('input[placeholder="輸入英文單字..."]').first();
    const firstChineseInput = page.locator('input[placeholder="輸入中文翻譯..."]').first();
    
    await firstEnglishInput.fill('cat');
    await firstChineseInput.fill('貓');
    
    // 交換列
    await page.click('button:has-text("交換列")');
    await page.waitForTimeout(500);
    
    // 檢查數據是否交換
    await expect(firstEnglishInput).toHaveValue('貓');
    await expect(firstChineseInput).toHaveValue('cat');
  });

  test('應該能夠完成詞彙輸入並整合到遊戲系統', async ({ page }) => {
    // 設置控制台監聽
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });

    // 設置對話框處理
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // 修改活動標題
    await page.fill('input[placeholder="輸入活動標題..."]', 'Playwright 測試活動');
    
    // 輸入測試詞彙
    const testVocabulary = [
      { english: 'dog', chinese: '狗' },
      { english: 'cat', chinese: '貓' },
      { english: 'bird', chinese: '鳥' }
    ];

    for (let i = 0; i < testVocabulary.length; i++) {
      const englishInput = page.locator('input[placeholder="輸入英文單字..."]').nth(i);
      const chineseInput = page.locator('input[placeholder="輸入中文翻譯..."]').nth(i);
      
      await englishInput.fill(testVocabulary[i].english);
      await chineseInput.fill(testVocabulary[i].chinese);
    }

    // 檢查統計信息
    await expect(page.locator('text=已輸入')).toContainText('3');

    // 點擊完成按鈕
    await page.click('button:has-text("完成")');
    
    // 等待處理完成
    await page.waitForTimeout(2000);

    // 檢查是否顯示成功消息
    expect(alertMessage).toContain('詞彙輸入完成');
    expect(alertMessage).toContain('Playwright 測試活動');
    expect(alertMessage).toContain('3 個');

    // 檢查控制台輸出
    const relevantLogs = consoleMessages.filter(msg => 
      msg.includes('詞彙活動創建成功') || 
      msg.includes('遊戲詞彙數據') ||
      msg.includes('遊戲數據準備完成')
    );
    
    expect(relevantLogs.length).toBeGreaterThan(0);
  });

  test('應該正確映射詞彙到遊戲物件', async ({ page }) => {
    // 設置控制台監聽來捕獲遊戲數據
    const gameDataLogs: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('遊戲數據準備完成')) {
        try {
          // 嘗試解析控制台中的遊戲數據
          const logText = msg.text();
          if (logText.includes('mapping')) {
            gameDataLogs.push(logText);
          }
        } catch (error) {
          console.log('解析遊戲數據失敗:', error);
        }
      }
    });

    // 設置對話框處理
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // 輸入測試數據
    await page.fill('input[placeholder="輸入活動標題..."]', '遊戲映射測試');
    
    // 輸入詞彙對，明確測試映射關係
    await page.fill('input[placeholder="輸入英文單字..."]', 'hello');  // 這個會顯示在雲朵上
    await page.fill('input[placeholder="輸入中文翻譯..."]', '你好');    // 這個會顯示在提示區

    // 完成輸入
    await page.click('button:has-text("完成")');
    await page.waitForTimeout(2000);

    // 檢查是否有遊戲數據映射的日誌
    expect(gameDataLogs.length).toBeGreaterThan(0);
    
    // 驗證映射關係的說明
    const mappingLog = gameDataLogs.find(log => 
      log.includes('詞彙字') && log.includes('雲朵') && log.includes('提示區域')
    );
    expect(mappingLog).toBeTruthy();
  });

  test('應該處理空輸入的情況', async ({ page }) => {
    // 設置對話框處理
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // 不輸入任何詞彙，直接點擊完成
    await page.click('button:has-text("完成")');
    await page.waitForTimeout(1000);

    // 檢查是否顯示錯誤消息
    expect(alertMessage).toContain('請至少輸入一個詞彙對');
  });

  test('應該保存數據到本地存儲', async ({ page }) => {
    // 輸入測試數據
    await page.fill('input[placeholder="輸入活動標題..."]', '本地存儲測試');
    await page.fill('input[placeholder="輸入英文單字..."]', 'test');
    await page.fill('input[placeholder="輸入中文翻譯..."]', '測試');

    // 設置對話框處理
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // 完成輸入
    await page.click('button:has-text("完成")');
    await page.waitForTimeout(2000);

    // 檢查本地存儲
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('vocabulary_integration_data');
    });

    expect(localStorageData).toBeTruthy();
    
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      expect(parsedData.vocabulary).toBeTruthy();
      expect(parsedData.activities).toBeTruthy();
      expect(parsedData.vocabulary.length).toBeGreaterThan(0);
      expect(parsedData.activities.length).toBeGreaterThan(0);
    }
  });
});
