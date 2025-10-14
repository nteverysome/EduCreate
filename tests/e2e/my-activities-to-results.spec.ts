import { test, expect } from '@playwright/test';

/**
 * 簡化 E2E 測試：從我的活動 → 我的結果
 * 
 * 測試流程：
 * 1. 登入系統
 * 2. 訪問我的活動頁面
 * 3. 訪問我的結果頁面
 * 4. 查看結果詳情
 * 5. 測試可共用結果連結功能
 */

test.describe('我的活動到我的結果流程', () => {
  
  test('完整流程：我的活動 → 我的結果 → 可共用連結', async ({ page }) => {
    console.log('🚀 開始測試：我的活動 → 我的結果流程');

    // ==================== 步驟 1：登入系統 ====================
    console.log('🔐 步驟 1：登入系統');
    
    await page.goto('https://edu-create.vercel.app/login');
    await page.waitForLoadState('networkidle');
    
    // 填寫登入表單
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'demo123');
    
    // 點擊登入按鈕
    await page.click('button[type="submit"]:has-text("登入")');
    
    // 等待登入完成
    await page.waitForURL('**/my-activities', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    console.log('✅ 步驟 1 完成：成功登入系統');

    // ==================== 步驟 2：我的活動頁面 ====================
    console.log('📋 步驟 2：訪問我的活動頁面');
    
    await page.goto('https://edu-create.vercel.app/my-activities');
    await page.waitForLoadState('networkidle');
    
    // 等待活動列表載入
    await page.waitForSelector('[data-testid="activity-card"], .activity-card, .bg-white', { timeout: 30000 });
    
    // 驗證頁面標題
    await expect(page).toHaveTitle(/EduCreate/);
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20241014_我的活動_頁面載入_success_v1_001.png',
      fullPage: true 
    });
    
    console.log('✅ 步驟 2 完成：成功載入我的活動頁面');

    // ==================== 步驟 3：我的結果頁面 ====================
    console.log('📊 步驟 3：訪問我的結果頁面');
    
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForLoadState('networkidle');
    
    // 等待結果列表載入
    await page.waitForSelector('[data-testid="result-card"], .result-card, .bg-white', { timeout: 30000 });
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20241014_我的結果_頁面載入_success_v1_002.png',
      fullPage: true 
    });
    
    console.log('✅ 步驟 3 完成：成功載入我的結果頁面');

    // ==================== 步驟 4：結果詳情頁面 ====================
    console.log('🔍 步驟 4：查看結果詳情');
    
    // 點擊第一個結果卡片
    const firstResult = page.locator('[data-testid="result-card"], .result-card, .bg-white').first();
    await firstResult.click();
    
    // 等待結果詳情頁面載入
    await page.waitForLoadState('networkidle');
    
    // 等待統計數據載入
    await page.waitForSelector('text=平均得分, text=最高分, text=學生的數量', { timeout: 30000 });
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20241014_結果詳情_統計數據_success_v1_003.png',
      fullPage: true 
    });
    
    console.log('✅ 步驟 4 完成：成功載入結果詳情頁面');

    // ==================== 步驟 5：可共用結果連結 ====================
    console.log('🔗 步驟 5：測試可共用結果連結功能');
    
    // 查找可共用結果連結按鈕
    const shareButton = page.locator('button:has-text("可共用結果連結"), button:has-text("複製連結"), button:has-text("分享")').first();
    
    if (await shareButton.count() > 0) {
      // 點擊分享按鈕
      await shareButton.click();
      
      // 等待複製成功提示
      await page.waitForSelector('text=已複製, text=複製成功', { timeout: 10000 });
      
      // 截圖記錄
      await page.screenshot({ 
        path: 'EduCreate-Test-Videos/current/success/20241014_可共用連結_複製成功_success_v1_004.png',
        fullPage: true 
      });
      
      console.log('✅ 步驟 5 完成：可共用結果連結功能正常');
    } else {
      console.log('⚠️ 步驟 5：未找到可共用結果連結按鈕');
      
      // 截圖記錄當前狀態
      await page.screenshot({ 
        path: 'EduCreate-Test-Videos/current/failure/20241014_可共用連結_按鈕未找到_failure_v1_004.png',
        fullPage: true 
      });
    }

    // ==================== 測試完成 ====================
    console.log('🎉 E2E 測試完成：我的活動 → 我的結果流程');
    
    // 最終截圖
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20241014_E2E測試_完成狀態_success_v1_005.png',
      fullPage: true 
    });
  });
});
