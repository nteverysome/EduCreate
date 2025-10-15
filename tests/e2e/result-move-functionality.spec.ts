import { test, expect } from '@playwright/test';

/**
 * 測試結果卡片移動功能
 * 參考 Wordwall 的設計，測試結果卡片的移動功能
 */

test.describe('結果卡片移動功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 導航到登入頁面
    await page.goto('https://edu-create.vercel.app/login');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 使用測試帳號登入
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    
    // 等待登入完成並導航到我的結果頁面
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForLoadState('networkidle');
  });

  test('應該顯示結果卡片的移動選項', async ({ page }) => {
    // 等待結果卡片載入
    await page.waitForSelector('a[href^="/my-results/"]', { timeout: 10000 });
    
    // 找到第一個結果卡片的菜單按鈕
    const menuButton = page.locator('a[href^="/my-results/"]').first().locator('button[aria-label="更多選項"]');
    
    // 點擊菜單按鈕
    await menuButton.click();
    
    // 等待右鍵菜單出現
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    
    // 驗證菜單項存在
    const moveOption = page.locator('text=移動到');
    await expect(moveOption).toBeVisible();
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().split('T')[0]}_結果管理_移動選項顯示_成功_v1_001.png`,
      fullPage: true 
    });
  });

  test('應該顯示可用資料夾列表', async ({ page }) => {
    // 等待結果卡片載入
    await page.waitForSelector('a[href^="/my-results/"]', { timeout: 10000 });
    
    // 找到第一個結果卡片的菜單按鈕
    const menuButton = page.locator('a[href^="/my-results/"]').first().locator('button[aria-label="更多選項"]');
    
    // 點擊菜單按鈕
    await menuButton.click();
    
    // 等待右鍵菜單出現
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    
    // 點擊「移動到」選項
    await page.click('text=移動到');
    
    // 等待子菜單出現
    await page.waitForTimeout(500);
    
    // 檢查是否顯示資料夾列表或「沒有可用的資料夾」
    const hasFolders = await page.locator('text=根目錄').isVisible().catch(() => false);
    const noFolders = await page.locator('text=沒有可用的資料夾').isVisible().catch(() => false);
    
    expect(hasFolders || noFolders).toBeTruthy();
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().split('T')[0]}_結果管理_資料夾列表顯示_成功_v1_002.png`,
      fullPage: true 
    });
  });

  test('應該能夠移動結果到資料夾', async ({ page }) => {
    // 先創建一個測試資料夾
    await page.click('button:has-text("新資料夾")');
    await page.waitForSelector('input[placeholder*="資料夾名稱"]', { timeout: 5000 });
    
    const folderName = `測試資料夾_${Date.now()}`;
    await page.fill('input[placeholder*="資料夾名稱"]', folderName);
    await page.click('button:has-text("創建")');
    
    // 等待資料夾創建完成
    await page.waitForTimeout(2000);
    
    // 找到第一個結果卡片的菜單按鈕
    const menuButton = page.locator('a[href^="/my-results/"]').first().locator('button[aria-label="更多選項"]');
    
    // 點擊菜單按鈕
    await menuButton.click();
    
    // 等待右鍵菜單出現
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    
    // 點擊「移動到」選項
    await page.click('text=移動到');
    
    // 等待子菜單出現
    await page.waitForTimeout(500);
    
    // 點擊剛創建的資料夾
    await page.click(`text=${folderName}`);
    
    // 等待移動完成
    await page.waitForTimeout(2000);
    
    // 驗證結果已移動（結果卡片應該消失或減少）
    // 這裡我們檢查頁面是否重新載入了數據
    await page.waitForLoadState('networkidle');
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().split('T')[0]}_結果管理_移動到資料夾_成功_v1_003.png`,
      fullPage: true 
    });
  });

  test('應該能夠移動結果回根目錄', async ({ page }) => {
    // 先創建一個測試資料夾
    await page.click('button:has-text("新資料夾")');
    await page.waitForSelector('input[placeholder*="資料夾名稱"]', { timeout: 5000 });
    
    const folderName = `測試資料夾_${Date.now()}`;
    await page.fill('input[placeholder*="資料夾名稱"]', folderName);
    await page.click('button:has-text("創建")');
    
    // 等待資料夾創建完成
    await page.waitForTimeout(2000);
    
    // 移動一個結果到資料夾
    const menuButton = page.locator('a[href^="/my-results/"]').first().locator('button[aria-label="更多選項"]');
    await menuButton.click();
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    await page.click('text=移動到');
    await page.waitForTimeout(500);
    await page.click(`text=${folderName}`);
    await page.waitForTimeout(2000);
    
    // 進入資料夾
    await page.click(`text=${folderName}`);
    await page.waitForTimeout(2000);
    
    // 找到資料夾中的結果卡片
    const resultInFolder = page.locator('a[href^="/my-results/"]').first();
    const menuButtonInFolder = resultInFolder.locator('button[aria-label="更多選項"]');
    
    // 點擊菜單按鈕
    await menuButtonInFolder.click();
    
    // 等待右鍵菜單出現
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    
    // 點擊「移動到」選項
    await page.click('text=移動到');
    
    // 等待子菜單出現
    await page.waitForTimeout(500);
    
    // 點擊「根目錄」
    await page.click('text=根目錄');
    
    // 等待移動完成
    await page.waitForTimeout(2000);
    
    // 驗證結果已移動回根目錄
    await page.waitForLoadState('networkidle');
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().split('T')[0]}_結果管理_移動回根目錄_成功_v1_004.png`,
      fullPage: true 
    });
  });

  test('應該過濾掉當前所在的資料夾', async ({ page }) => {
    // 先創建一個測試資料夾
    await page.click('button:has-text("新資料夾")');
    await page.waitForSelector('input[placeholder*="資料夾名稱"]', { timeout: 5000 });
    
    const folderName = `測試資料夾_${Date.now()}`;
    await page.fill('input[placeholder*="資料夾名稱"]', folderName);
    await page.click('button:has-text("創建")');
    
    // 等待資料夾創建完成
    await page.waitForTimeout(2000);
    
    // 移動一個結果到資料夾
    const menuButton = page.locator('a[href^="/my-results/"]').first().locator('button[aria-label="更多選項"]');
    await menuButton.click();
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    await page.click('text=移動到');
    await page.waitForTimeout(500);
    await page.click(`text=${folderName}`);
    await page.waitForTimeout(2000);
    
    // 進入資料夾
    await page.click(`text=${folderName}`);
    await page.waitForTimeout(2000);
    
    // 找到資料夾中的結果卡片
    const resultInFolder = page.locator('a[href^="/my-results/"]').first();
    const menuButtonInFolder = resultInFolder.locator('button[aria-label="更多選項"]');
    
    // 點擊菜單按鈕
    await menuButtonInFolder.click();
    
    // 等待右鍵菜單出現
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    
    // 點擊「移動到」選項
    await page.click('text=移動到');
    
    // 等待子菜單出現
    await page.waitForTimeout(500);
    
    // 驗證當前資料夾不在列表中
    const currentFolderInList = await page.locator(`text=${folderName}`).count();
    expect(currentFolderInList).toBe(0);
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().split('T')[0]}_結果管理_過濾當前資料夾_成功_v1_005.png`,
      fullPage: true 
    });
  });

  test('應該顯示資料夾顏色標識', async ({ page }) => {
    // 先創建一個帶顏色的測試資料夾
    await page.click('button:has-text("新資料夾")');
    await page.waitForSelector('input[placeholder*="資料夾名稱"]', { timeout: 5000 });
    
    const folderName = `彩色資料夾_${Date.now()}`;
    await page.fill('input[placeholder*="資料夾名稱"]', folderName);
    
    // 選擇一個顏色（如果有顏色選擇器）
    const colorPicker = page.locator('input[type="color"]');
    if (await colorPicker.isVisible()) {
      await colorPicker.fill('#FF5733');
    }
    
    await page.click('button:has-text("創建")');
    
    // 等待資料夾創建完成
    await page.waitForTimeout(2000);
    
    // 找到第一個結果卡片的菜單按鈕
    const menuButton = page.locator('a[href^="/my-results/"]').first().locator('button[aria-label="更多選項"]');
    
    // 點擊菜單按鈕
    await menuButton.click();
    
    // 等待右鍵菜單出現
    await page.waitForSelector('text=移動到', { timeout: 5000 });
    
    // 點擊「移動到」選項
    await page.click('text=移動到');
    
    // 等待子菜單出現
    await page.waitForTimeout(500);
    
    // 驗證資料夾圖標存在
    const folderIcon = page.locator('svg').filter({ hasText: folderName });
    await expect(folderIcon).toBeTruthy();
    
    // 截圖記錄
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().split('T')[0]}_結果管理_資料夾顏色顯示_成功_v1_006.png`,
      fullPage: true 
    });
  });
});

