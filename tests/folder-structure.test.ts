/**
 * 嵌套檔案夾結構測試
 * 測試無限層級檔案夾的創建、移動、拖拽重組等功能
 */

import { test, expect } from '@playwright/test';

test.describe('嵌套檔案夾結構', () => {
  test.beforeEach(async ({ page }) => {
    // 登入並導航到檔案管理頁面
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    await page.goto('/files');
  });

  test('應該能創建嵌套檔案夾結構', async ({ page }) => {
    // 創建根檔案夾
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '學科分類');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 等待檔案夾創建完成
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '學科分類' })).toBeVisible();
    
    // 選擇根檔案夾並創建子檔案夾
    await page.click('[data-testid="folder-item"]', { hasText: '學科分類' });
    await page.click('[data-testid="create-subfolder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '英語');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 驗證子檔案夾創建成功
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '英語' })).toBeVisible();
    
    // 創建更深層的檔案夾
    await page.click('[data-testid="folder-item"]', { hasText: '英語' });
    await page.click('[data-testid="create-subfolder-button"]');
    await page.fill('[data-testid="folder-name-input"]', 'GEPT初級');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 驗證深層檔案夾創建成功
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: 'GEPT初級' })).toBeVisible();
  });

  test('應該能展開和收起檔案夾樹', async ({ page }) => {
    // 創建嵌套結構
    await createNestedFolders(page);
    
    // 檢查展開按鈕
    const expandButton = page.locator('[data-testid="expand-button"]').first();
    await expect(expandButton).toBeVisible();
    
    // 點擊展開
    await expandButton.click();
    
    // 驗證子檔案夾顯示
    await expect(page.locator('[data-testid="subfolder-container"]')).toBeVisible();
    
    // 點擊收起
    await expandButton.click();
    
    // 驗證子檔案夾隱藏
    await expect(page.locator('[data-testid="subfolder-container"]')).not.toBeVisible();
  });

  test('應該能拖拽重組檔案夾', async ({ page }) => {
    // 創建多個檔案夾
    await createMultipleFolders(page);
    
    // 獲取源檔案夾和目標檔案夾
    const sourceFolder = page.locator('[data-testid="folder-item"]').filter({ hasText: '數學' });
    const targetFolder = page.locator('[data-testid="folder-item"]').filter({ hasText: '學科分類' });
    
    // 執行拖拽操作
    await sourceFolder.dragTo(targetFolder);
    
    // 等待拖拽完成
    await page.waitForTimeout(1000);
    
    // 驗證檔案夾已移動到目標位置
    await targetFolder.click(); // 展開目標檔案夾
    await expect(page.locator('[data-testid="subfolder-container"]').locator('text=數學')).toBeVisible();
  });

  test('應該限制檔案夾嵌套深度', async ({ page }) => {
    // 創建最大深度的檔案夾結構
    let currentFolderName = '根檔案夾';
    
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="create-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', `層級${i + 1}`);
      await page.click('[data-testid="confirm-create-button"]');
      
      if (i < 9) {
        await page.click('[data-testid="folder-item"]', { hasText: `層級${i + 1}` });
      }
    }
    
    // 嘗試創建第11層檔案夾
    await page.click('[data-testid="folder-item"]', { hasText: '層級10' });
    await page.click('[data-testid="create-subfolder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '層級11');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 驗證錯誤訊息
    await expect(page.locator('[data-testid="error-message"]')).toContainText('檔案夾嵌套深度不能超過');
  });

  test('應該防止檔案夾名稱重複', async ({ page }) => {
    // 創建第一個檔案夾
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '重複名稱');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 嘗試創建同名檔案夾
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '重複名稱');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 驗證錯誤訊息
    await expect(page.locator('[data-testid="error-message"]')).toContainText('同一位置已存在相同名稱的文件夾');
  });

  test('應該能批量操作檔案夾', async ({ page }) => {
    // 創建多個檔案夾
    await createMultipleFolders(page);
    
    // 選擇多個檔案夾
    await page.click('[data-testid="folder-checkbox"]', { hasText: '數學' });
    await page.click('[data-testid="folder-checkbox"]', { hasText: '科學' });
    
    // 點擊批量操作按鈕
    await page.click('[data-testid="bulk-operations-button"]');
    
    // 選擇移動操作
    await page.click('[data-testid="bulk-move-button"]');
    
    // 選擇目標檔案夾
    await page.click('[data-testid="target-folder"]', { hasText: '學科分類' });
    await page.click('[data-testid="confirm-move-button"]');
    
    // 驗證檔案夾已移動
    await page.click('[data-testid="folder-item"]', { hasText: '學科分類' });
    await expect(page.locator('[data-testid="subfolder-container"]').locator('text=數學')).toBeVisible();
    await expect(page.locator('[data-testid="subfolder-container"]').locator('text=科學')).toBeVisible();
  });

  test('應該顯示檔案夾統計信息', async ({ page }) => {
    // 創建嵌套結構並添加活動
    await createNestedFolders(page);
    
    // 在檔案夾中創建活動
    await page.click('[data-testid="folder-item"]', { hasText: 'GEPT初級' });
    await page.click('[data-testid="create-activity-button"]');
    await page.fill('[data-testid="activity-title"]', '測試活動');
    await page.click('[data-testid="save-activity-button"]');
    
    // 檢查統計信息
    const folderStats = page.locator('[data-testid="folder-stats"]');
    await expect(folderStats).toContainText('1 活動');
    
    // 檢查父檔案夾的總計統計
    await page.click('[data-testid="folder-item"]', { hasText: '英語' });
    const parentStats = page.locator('[data-testid="folder-stats"]');
    await expect(parentStats).toContainText('總計: 1 活動');
  });

  test('應該支持檔案夾搜索', async ({ page }) => {
    // 創建多個檔案夾
    await createMultipleFolders(page);
    
    // 使用搜索功能
    await page.fill('[data-testid="folder-search-input"]', '數學');
    
    // 驗證搜索結果
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '數學' })).toBeVisible();
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '英語' })).not.toBeVisible();
    
    // 清除搜索
    await page.fill('[data-testid="folder-search-input"]', '');
    
    // 驗證所有檔案夾重新顯示
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '數學' })).toBeVisible();
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '英語' })).toBeVisible();
  });
});

// 輔助函數
async function createNestedFolders(page: any) {
  // 創建根檔案夾
  await page.click('[data-testid="create-folder-button"]');
  await page.fill('[data-testid="folder-name-input"]', '學科分類');
  await page.click('[data-testid="confirm-create-button"]');
  
  // 創建子檔案夾
  await page.click('[data-testid="folder-item"]', { hasText: '學科分類' });
  await page.click('[data-testid="create-subfolder-button"]');
  await page.fill('[data-testid="folder-name-input"]', '英語');
  await page.click('[data-testid="confirm-create-button"]');
  
  // 創建孫檔案夾
  await page.click('[data-testid="folder-item"]', { hasText: '英語' });
  await page.click('[data-testid="create-subfolder-button"]');
  await page.fill('[data-testid="folder-name-input"]', 'GEPT初級');
  await page.click('[data-testid="confirm-create-button"]');
}

async function createMultipleFolders(page: any) {
  const folders = ['學科分類', '數學', '科學', '歷史', '地理'];
  
  for (const folderName of folders) {
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', folderName);
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500); // 等待創建完成
  }
}
