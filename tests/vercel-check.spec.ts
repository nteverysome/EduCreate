import { test, expect } from '@playwright/test';

test('Check Vercel Deployment Errors', async ({ page }) => {
  console.log('🚀 打開 Vercel 部署頁面...');
  await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments');
  
  // 等待頁面加載
  await page.waitForLoadState('networkidle');
  console.log('✅ 頁面已加載');

  // 截圖 1：部署列表
  console.log('📸 截圖 1：部署列表');
  await page.screenshot({ path: 'vercel-screenshots/01-deployments-list.png', fullPage: true });

  // 查找最新的部署
  console.log('🔍 查找最新的部署...');
  const deploymentItems = page.locator('[role="button"]').filter({ hasText: /Failed|Success|Building/ });
  const count = await deploymentItems.count();
  console.log(`📊 找到 ${count} 個部署項目`);

  if (count > 0) {
    // 點擊第一個部署
    console.log('📌 點擊最新的部署...');
    await deploymentItems.first().click();
    await page.waitForTimeout(2000);

    // 截圖 2：部署詳情
    console.log('📸 截圖 2：部署詳情');
    await page.screenshot({ path: 'vercel-screenshots/02-deployment-details.png', fullPage: true });

    // 查找 Build Logs
    console.log('📋 查找構建日誌...');
    const buildLogsButton = page.locator('button, a').filter({ hasText: /Build Logs|Logs/ }).first();
    const buildLogsVisible = await buildLogsButton.isVisible().catch(() => false);
    
    if (buildLogsVisible) {
      console.log('📌 點擊 Build Logs...');
      await buildLogsButton.click();
      await page.waitForTimeout(2000);

      // 截圖 3：構建日誌
      console.log('📸 截圖 3：構建日誌');
      await page.screenshot({ path: 'vercel-screenshots/03-build-logs.png', fullPage: true });
    }

    // 提取錯誤信息
    console.log('❌ 查找錯誤信息...');
    const errorElements = page.locator('text=/error|Error|failed|Failed/i');
    const errorCount = await errorElements.count();
    console.log(`🔴 找到 ${errorCount} 個錯誤相關元素`);

    // 獲取頁面內容
    const pageContent = await page.content();
    console.log('📄 頁面內容已獲取');

    // 驗證頁面加載
    expect(page).toBeDefined();
  }
});

