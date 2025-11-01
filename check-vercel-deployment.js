const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    console.log('🚀 打開 Vercel 部署頁面...');
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments', {
      waitUntil: 'networkidle'
    });

    console.log('⏳ 等待頁面加載...');
    await page.waitForTimeout(3000);

    // 查找最近的部署
    console.log('🔍 查找最近的部署...');
    const deployments = await page.locator('[data-testid="deployment-item"]').all();
    console.log(`📊 找到 ${deployments.length} 個部署`);

    if (deployments.length > 0) {
      console.log('📌 點擊最新的部署...');
      await deployments[0].click();
      await page.waitForTimeout(2000);

      // 查找構建日誌
      console.log('📋 查找構建日誌...');
      const buildLogsButton = await page.locator('text=Build Logs').first();
      if (buildLogsButton) {
        await buildLogsButton.click();
        await page.waitForTimeout(2000);
      }

      // 獲取錯誤信息
      console.log('❌ 查找錯誤信息...');
      const errorText = await page.locator('text=/Error|error|failed|Failed/').allTextContents();
      
      if (errorText.length > 0) {
        console.log('\n🔴 找到錯誤信息：');
        errorText.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      } else {
        console.log('✅ 沒有找到明顯的錯誤信息');
      }

      // 獲取頁面內容
      console.log('\n📄 獲取頁面內容...');
      const pageContent = await page.content();
      
      // 查找特定的錯誤模式
      const errorPatterns = [
        /Error: (.*?)(?=<|$)/gi,
        /failed: (.*?)(?=<|$)/gi,
        /Build failed: (.*?)(?=<|$)/gi
      ];

      errorPatterns.forEach(pattern => {
        const matches = pageContent.match(pattern);
        if (matches) {
          console.log(`\n🔍 匹配到錯誤模式：`);
          matches.forEach(match => {
            console.log(`  - ${match}`);
          });
        }
      });

      // 獲取部署狀態
      console.log('\n📊 部署狀態：');
      const statusText = await page.locator('[data-testid="deployment-status"]').textContent();
      console.log(`  狀態：${statusText}`);

      // 獲取部署時間
      const timeText = await page.locator('[data-testid="deployment-time"]').textContent();
      console.log(`  時間：${timeText}`);
    }

    console.log('\n✅ 檢查完成！');
    console.log('📌 請查看瀏覽器窗口中的詳細信息');

  } catch (error) {
    console.error('❌ 發生錯誤：', error.message);
  } finally {
    // 保持瀏覽器打開以便查看
    console.log('\n⏳ 瀏覽器將保持打開 30 秒...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();

