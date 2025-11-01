const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const screenshotDir = './vercel-screenshots';

  // 創建截圖目錄
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('🚀 打開 Vercel 部署頁面...');
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments', {
      waitUntil: 'networkidle'
    });

    console.log('⏳ 等待頁面加載...');
    await page.waitForTimeout(3000);

    // 截圖 1：部署列表
    console.log('📸 截圖 1：部署列表');
    await page.screenshot({ path: path.join(screenshotDir, '01-deployments-list.png'), fullPage: true });

    // 查找最新的部署
    console.log('🔍 查找最新的部署...');
    const deploymentItems = await page.locator('[role="button"]').filter({ hasText: /Failed|Success|Building/ }).all();
    console.log(`📊 找到 ${deploymentItems.length} 個部署項目`);

    if (deploymentItems.length > 0) {
      console.log('📌 點擊最新的部署...');
      await deploymentItems[0].click();
      await page.waitForTimeout(3000);

      // 截圖 2：部署詳情
      console.log('📸 截圖 2：部署詳情');
      await page.screenshot({ path: path.join(screenshotDir, '02-deployment-details.png'), fullPage: true });

      // 查找並點擊 Build Logs
      console.log('📋 查找構建日誌...');
      const buildLogsLink = await page.locator('a, button').filter({ hasText: /Build Logs|Logs/ }).first();
      if (buildLogsLink) {
        console.log('📌 點擊 Build Logs...');
        await buildLogsLink.click();
        await page.waitForTimeout(3000);

        // 截圖 3：構建日誌
        console.log('📸 截圖 3：構建日誌');
        await page.screenshot({ path: path.join(screenshotDir, '03-build-logs.png'), fullPage: true });
      }

      // 獲取頁面文本內容
      console.log('📄 提取頁面文本...');
      const pageText = await page.textContent('body');
      fs.writeFileSync(path.join(screenshotDir, 'page-content.txt'), pageText);

      // 查找錯誤信息
      console.log('❌ 查找錯誤信息...');
      const errorElements = await page.locator('text=/error|Error|failed|Failed|ERR/i').all();
      console.log(`🔴 找到 ${errorElements.length} 個錯誤相關元素`);

      if (errorElements.length > 0) {
        const errorTexts = [];
        for (let i = 0; i < Math.min(errorElements.length, 10); i++) {
          const text = await errorElements[i].textContent();
          if (text && text.trim()) {
            errorTexts.push(text.trim());
          }
        }
        fs.writeFileSync(path.join(screenshotDir, 'errors.txt'), errorTexts.join('\n\n'));
        console.log('✅ 錯誤信息已保存');
      }

      // 查找部署狀態
      console.log('📊 查找部署狀態...');
      const statusText = await page.textContent('[data-testid="deployment-status"], .status, [class*="status"]');
      if (statusText) {
        console.log(`  狀態：${statusText}`);
      }
    }

    console.log('\n✅ 檢查完成！');
    console.log(`📁 截圖已保存到：${screenshotDir}`);
    console.log('  - 01-deployments-list.png');
    console.log('  - 02-deployment-details.png');
    console.log('  - 03-build-logs.png');
    console.log('  - page-content.txt');
    console.log('  - errors.txt');

  } catch (error) {
    console.error('❌ 發生錯誤：', error.message);
    await page.screenshot({ path: path.join(screenshotDir, 'error-screenshot.png'), fullPage: true });
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();

