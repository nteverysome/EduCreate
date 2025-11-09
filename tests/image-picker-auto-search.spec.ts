import { test, expect } from '@playwright/test';

test.describe('圖片模態框自動搜尋功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登入並導航到詞彙編輯頁面
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("登入")');
    await page.waitForNavigation();
  });

  test('英文單字自動搜尋', async ({ page }) => {
    // 導航到詞彙編輯頁面
    await page.goto('/create/vocabulary');
    
    // 輸入英文單字
    const englishInput = page.locator('input[placeholder="輸入關鍵字..."]').first();
    await englishInput.fill('apple');
    
    // 點擊圖片圖標
    const imageButton = page.locator('button:has-text("📷")').first();
    await imageButton.click();
    
    // 等待模態框打開
    await page.waitForSelector('text=選擇圖片');
    
    // 驗證搜尋框自動填充
    const searchInput = page.locator('input[placeholder="搜索圖片..."]');
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('apple');
    
    // 驗證圖片結果已加載
    await page.waitForSelector('img[alt*="apple"]', { timeout: 5000 });
    const images = await page.locator('img[alt*="apple"]').count();
    expect(images).toBeGreaterThan(0);
  });

  test('中文單字自動搜尋', async ({ page }) => {
    // 導航到詞彙編輯頁面
    await page.goto('/create/vocabulary');
    
    // 輸入中文單字
    const chineseInput = page.locator('input[placeholder="輸入匹配物件..."]').first();
    await chineseInput.fill('蘋果');
    
    // 點擊中文圖片圖標
    const chineseImageButton = page.locator('button:has-text("📷")').nth(1);
    await chineseImageButton.click();
    
    // 等待模態框打開
    await page.waitForSelector('text=選擇圖片');
    
    // 驗證搜尋框自動填充
    const searchInput = page.locator('input[placeholder="搜索圖片..."]');
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('蘋果');
    
    // 驗證圖片結果已加載
    await page.waitForSelector('img', { timeout: 5000 });
    const images = await page.locator('img').count();
    expect(images).toBeGreaterThan(0);
  });

  test('空搜尋詞使用默認值', async ({ page }) => {
    // 導航到詞彙編輯頁面
    await page.goto('/create/vocabulary');
    
    // 不輸入任何文字，直接點擊圖片圖標
    const imageButton = page.locator('button:has-text("📷")').first();
    await imageButton.click();
    
    // 等待模態框打開
    await page.waitForSelector('text=選擇圖片');
    
    // 驗證搜尋框使用默認值 "education"
    const searchInput = page.locator('input[placeholder="搜索圖片..."]');
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('education');
  });

  test('更新搜尋詞後重新搜尋', async ({ page }) => {
    // 導航到詞彙編輯頁面
    await page.goto('/create/vocabulary');
    
    // 輸入英文單字
    const englishInput = page.locator('input[placeholder="輸入關鍵字..."]').first();
    await englishInput.fill('cat');
    
    // 點擊圖片圖標
    const imageButton = page.locator('button:has-text("📷")').first();
    await imageButton.click();
    
    // 等待模態框打開
    await page.waitForSelector('text=選擇圖片');
    
    // 驗證初始搜尋詞
    let searchInput = page.locator('input[placeholder="搜索圖片..."]');
    let searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('cat');
    
    // 關閉模態框
    await page.click('button:has-text("✕")');
    
    // 更新英文單字
    await englishInput.fill('dog');
    
    // 再次點擊圖片圖標
    await imageButton.click();
    
    // 等待模態框打開
    await page.waitForSelector('text=選擇圖片');
    
    // 驗證搜尋詞已更新
    searchInput = page.locator('input[placeholder="搜索圖片..."]');
    searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('dog');
  });
});

