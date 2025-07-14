/**
 * 檔案夾權限系統 Playwright 測試
 * 驗證四級權限控制和權限繼承機制
 */

import { test, expect } from '@playwright/test';

test.describe('檔案夾權限系統', () => {
  test.beforeEach(async ({ page }) => {
    // 登入管理員帳號
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('應該能設置檔案夾查看權限', async ({ page }) => {
    // 導航到檔案管理頁面
    await page.goto('/files');
    
    // 創建測試檔案夾
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '權限測試檔案夾');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 等待檔案夾創建完成
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '權限測試檔案夾' })).toBeVisible();
    
    // 右鍵點擊檔案夾，選擇權限管理
    await page.click('[data-testid="folder-item"]', { hasText: '權限測試檔案夾', button: 'right' });
    await page.click('[data-testid="manage-permissions"]');
    
    // 驗證權限管理對話框打開
    await expect(page.locator('[data-testid="permission-manager"]')).toBeVisible();
    
    // 添加用戶權限
    await page.click('[data-testid="add-user-permission"]');
    await page.selectOption('[data-testid="user-select"]', 'user@example.com');
    await page.selectOption('[data-testid="permission-level-select"]', 'view');
    await page.click('[data-testid="grant-permission-button"]');
    
    // 驗證權限已添加
    await expect(page.locator('[data-testid="permission-item"]').filter({ hasText: 'user@example.com' })).toBeVisible();
    await expect(page.locator('[data-testid="permission-level"]').filter({ hasText: '查看' })).toBeVisible();
  });

  test('應該能設置檔案夾編輯權限', async ({ page }) => {
    // 創建檔案夾並設置編輯權限
    await createFolderWithPermission(page, '編輯權限測試', 'user@example.com', 'edit');
    
    // 驗證編輯權限設置成功
    await expect(page.locator('[data-testid="permission-level"]').filter({ hasText: '編輯' })).toBeVisible();
    
    // 驗證編輯權限包含的具體權限
    await page.click('[data-testid="permission-details"]');
    await expect(page.locator('[data-testid="can-read"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-write"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-create-subfolder"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-delete"]')).not.toBeChecked();
  });

  test('應該能設置檔案夾分享權限', async ({ page }) => {
    // 創建檔案夾並設置分享權限
    await createFolderWithPermission(page, '分享權限測試', 'user@example.com', 'share');
    
    // 驗證分享權限設置成功
    await expect(page.locator('[data-testid="permission-level"]').filter({ hasText: '分享' })).toBeVisible();
    
    // 驗證分享權限包含的具體權限
    await page.click('[data-testid="permission-details"]');
    await expect(page.locator('[data-testid="can-read"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-write"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-share"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-move"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-manage-permissions"]')).not.toBeChecked();
  });

  test('應該能設置檔案夾管理權限', async ({ page }) => {
    // 創建檔案夾並設置管理權限
    await createFolderWithPermission(page, '管理權限測試', 'user@example.com', 'manage');
    
    // 驗證管理權限設置成功
    await expect(page.locator('[data-testid="permission-level"]').filter({ hasText: '管理' })).toBeVisible();
    
    // 驗證管理權限包含所有權限
    await page.click('[data-testid="permission-details"]');
    await expect(page.locator('[data-testid="can-read"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-write"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-delete"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-share"]')).toBeChecked();
    await expect(page.locator('[data-testid="can-manage-permissions"]')).toBeChecked();
  });

  test('應該能撤銷檔案夾權限', async ({ page }) => {
    // 創建檔案夾並設置權限
    await createFolderWithPermission(page, '撤銷權限測試', 'user@example.com', 'edit');
    
    // 撤銷權限
    await page.click('[data-testid="revoke-permission"]');
    await page.click('[data-testid="confirm-revoke"]');
    
    // 驗證權限已撤銷
    await expect(page.locator('[data-testid="permission-item"]').filter({ hasText: 'user@example.com' })).not.toBeVisible();
  });

  test('應該支持權限繼承', async ({ page }) => {
    // 創建父檔案夾
    await page.goto('/files');
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '父檔案夾');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 設置父檔案夾權限
    await page.click('[data-testid="folder-item"]', { hasText: '父檔案夾', button: 'right' });
    await page.click('[data-testid="manage-permissions"]');
    await page.click('[data-testid="add-user-permission"]');
    await page.selectOption('[data-testid="user-select"]', 'user@example.com');
    await page.selectOption('[data-testid="permission-level-select"]', 'edit');
    await page.click('[data-testid="grant-permission-button"]');
    await page.click('[data-testid="close-permission-manager"]');
    
    // 在父檔案夾中創建子檔案夾
    await page.click('[data-testid="folder-item"]', { hasText: '父檔案夾' });
    await page.click('[data-testid="create-subfolder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '子檔案夾');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 檢查子檔案夾權限
    await page.click('[data-testid="folder-item"]', { hasText: '子檔案夾', button: 'right' });
    await page.click('[data-testid="manage-permissions"]');
    
    // 驗證權限繼承
    await expect(page.locator('[data-testid="inherited-permission"]').filter({ hasText: 'user@example.com' })).toBeVisible();
    await expect(page.locator('[data-testid="inherited-from"]').filter({ hasText: '父檔案夾' })).toBeVisible();
  });

  test('應該能設置權限過期時間', async ({ page }) => {
    // 創建檔案夾
    await page.goto('/files');
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '過期權限測試');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 設置帶過期時間的權限
    await page.click('[data-testid="folder-item"]', { hasText: '過期權限測試', button: 'right' });
    await page.click('[data-testid="manage-permissions"]');
    await page.click('[data-testid="add-user-permission"]');
    await page.selectOption('[data-testid="user-select"]', 'user@example.com');
    await page.selectOption('[data-testid="permission-level-select"]', 'view');
    
    // 設置過期時間為明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().slice(0, 16);
    await page.fill('[data-testid="expires-at"]', tomorrowString);
    
    await page.click('[data-testid="grant-permission-button"]');
    
    // 驗證過期時間設置成功
    await expect(page.locator('[data-testid="permission-expires"]')).toContainText('過期時間');
  });

  test('應該能批量設置權限', async ({ page }) => {
    // 創建多個檔案夾
    await page.goto('/files');
    const folderNames = ['批量測試1', '批量測試2', '批量測試3'];
    
    for (const name of folderNames) {
      await page.click('[data-testid="create-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', name);
      await page.click('[data-testid="confirm-create-button"]');
      await page.waitForTimeout(500);
    }
    
    // 選擇多個檔案夾
    for (const name of folderNames) {
      await page.click(`[data-testid="folder-checkbox"][data-folder-name="${name}"]`);
    }
    
    // 批量設置權限
    await page.click('[data-testid="bulk-permissions-button"]');
    await page.selectOption('[data-testid="bulk-user-select"]', 'user@example.com');
    await page.selectOption('[data-testid="bulk-permission-level"]', 'edit');
    await page.click('[data-testid="apply-bulk-permissions"]');
    
    // 驗證批量權限設置成功
    await expect(page.locator('[data-testid="bulk-success-message"]')).toContainText('批量權限設置成功');
  });

  test('應該防止無權限用戶訪問檔案夾', async ({ page }) => {
    // 創建檔案夾（管理員）
    await page.goto('/files');
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name-input"]', '私人檔案夾');
    await page.click('[data-testid="confirm-create-button"]');
    
    // 登出管理員
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout"]');
    
    // 登入普通用戶
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'user123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // 嘗試訪問檔案管理頁面
    await page.goto('/files');
    
    // 驗證無法看到私人檔案夾
    await expect(page.locator('[data-testid="folder-item"]').filter({ hasText: '私人檔案夾' })).not.toBeVisible();
  });
});

// 輔助函數
async function createFolderWithPermission(
  page: any, 
  folderName: string, 
  userEmail: string, 
  permissionLevel: string
) {
  await page.goto('/files');
  await page.click('[data-testid="create-folder-button"]');
  await page.fill('[data-testid="folder-name-input"]', folderName);
  await page.click('[data-testid="confirm-create-button"]');
  
  await page.click('[data-testid="folder-item"]', { hasText: folderName, button: 'right' });
  await page.click('[data-testid="manage-permissions"]');
  await page.click('[data-testid="add-user-permission"]');
  await page.selectOption('[data-testid="user-select"]', userEmail);
  await page.selectOption('[data-testid="permission-level-select"]', permissionLevel);
  await page.click('[data-testid="grant-permission-button"]');
}
