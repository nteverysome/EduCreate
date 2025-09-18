const { chromium } = require('playwright');

async function getVercelError() {
  console.log('🚀 連接到現有瀏覽器...');

  try {
    // 嘗試連接到現有的 Chrome/Edge 瀏覽器實例
    // 您需要先啟動瀏覽器並開啟遠程調試端口
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ 成功連接到現有瀏覽器');

    const contexts = browser.contexts();
    let context;
    let page;

    if (contexts.length > 0) {
      context = contexts[0];
      const pages = context.pages();
      if (pages.length > 0) {
        page = pages[0];
        console.log('✅ 使用現有頁面');
      } else {
        page = await context.newPage();
        console.log('✅ 創建新頁面');
      }
    } else {
      context = await browser.newContext();
      page = await context.newPage();
      console.log('✅ 創建新上下文和頁面');
    }
  
  try {
    console.log('📱 導航到 Vercel 項目頁面...');
    await page.goto('https://vercel.com/minamisums-projects/edu-create');

    // 等待頁面載入
    await page.waitForTimeout(5000);

    // 獲取當前頁面信息
    const title = await page.title();
    const url = page.url();
    console.log('📍 當前頁面:', title);
    console.log('🔗 當前 URL:', url);

    // 檢查是否需要登入
    const loginButton = await page.locator('text=Sign In, text=Login, text=Log in').first();
    if (await loginButton.isVisible()) {
      console.log('⚠️  需要登入，請在瀏覽器中完成登入後按 Enter 繼續...');
      // 等待用戶登入
      await page.waitForTimeout(30000);
    }

    console.log('🔍 尋找最新的部署...');

    // 嘗試多種選擇器來尋找部署項目
    const deploymentSelectors = [
      '[data-testid="deployment-item"]',
      '.deployment-item',
      '[data-testid="deployment"]',
      '.deployment',
      'tr[data-testid*="deployment"]',
      'div[data-testid*="deployment"]',
      '.table-row',
      'tr'
    ];

    let latestDeployment = null;
    for (const selector of deploymentSelectors) {
      console.log(`🔍 嘗試選擇器: ${selector}`);
      const elements = await page.locator(selector).all();
      console.log(`   找到 ${elements.length} 個元素`);

      if (elements.length > 0) {
        latestDeployment = elements[0];
        console.log(`✅ 使用選擇器: ${selector}`);
        break;
      }
    }

    if (latestDeployment && await latestDeployment.isVisible()) {
      console.log('✅ 找到最新部署，點擊查看詳情...');
      await latestDeployment.click();
      
      // 等待部署詳情頁面載入
      await page.waitForTimeout(2000);
      
      console.log('📋 獲取部署狀態和錯誤信息...');
      
      // 獲取部署狀態
      const status = await page.locator('[data-testid="deployment-status"]').textContent().catch(() => '未找到狀態');
      console.log('📊 部署狀態:', status);
      
      // 尋找錯誤信息
      const errorElements = await page.locator('.error, [data-testid="error"], .text-red-500, .text-danger').all();
      
      if (errorElements.length > 0) {
        console.log('❌ 找到錯誤信息:');
        for (let i = 0; i < errorElements.length; i++) {
          const errorText = await errorElements[i].textContent();
          if (errorText && errorText.trim()) {
            console.log(`   ${i + 1}. ${errorText.trim()}`);
          }
        }
      }
      
      // 尋找構建日誌
      console.log('📝 尋找構建日誌...');
      const buildLogButton = await page.locator('text=Build Logs, text=Logs, text=View Function Logs').first();
      
      if (await buildLogButton.isVisible()) {
        console.log('📖 點擊查看構建日誌...');
        await buildLogButton.click();
        await page.waitForTimeout(2000);
        
        // 獲取日誌內容
        const logContent = await page.locator('pre, .log-content, [data-testid="log-content"]').textContent().catch(() => '無法獲取日誌');
        
        if (logContent && logContent.includes('Error')) {
          console.log('🔍 構建日誌中的錯誤:');
          const errorLines = logContent.split('\n').filter(line => 
            line.toLowerCase().includes('error') || 
            line.toLowerCase().includes('failed') ||
            line.toLowerCase().includes('250mb') ||
            line.toLowerCase().includes('function size')
          );
          
          errorLines.forEach((line, index) => {
            console.log(`   ${index + 1}. ${line.trim()}`);
          });
        }
      }
      
      // 截圖保存
      console.log('📸 保存截圖...');
      await page.screenshot({ path: 'vercel-error-screenshot.png', fullPage: true });
      
    } else {
      console.log('❌ 未找到部署項目');

      // 嘗試獲取頁面內容以便調試
      console.log('🔍 頁面內容調試信息:');

      // 檢查是否有錯誤消息
      const errorMessages = await page.locator('text=/error|failed|Error|Failed/i').all();
      if (errorMessages.length > 0) {
        console.log('🚨 頁面上發現的錯誤消息:');
        for (let i = 0; i < Math.min(errorMessages.length, 5); i++) {
          const text = await errorMessages[i].textContent();
          if (text && text.trim()) {
            console.log(`   ${i + 1}. ${text.trim()}`);
          }
        }
      }

      // 獲取頁面上的主要文本內容
      const bodyText = await page.locator('body').textContent();
      if (bodyText && bodyText.includes('250MB')) {
        console.log('🎯 發現 250MB 相關內容:');
        const lines = bodyText.split('\n').filter(line =>
          line.toLowerCase().includes('250mb') ||
          line.toLowerCase().includes('function size') ||
          line.toLowerCase().includes('serverless')
        );
        lines.forEach((line, index) => {
          console.log(`   ${index + 1}. ${line.trim()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 獲取錯誤信息時出現問題:', error.message);
    
    // 嘗試獲取頁面標題和 URL 以確認我們在正確的頁面
    const title = await page.title();
    const url = page.url();
    console.log('📍 當前頁面:', title, url);
    
    // 截圖以便調試
    await page.screenshot({ path: 'vercel-debug-screenshot.png', fullPage: true });
  }
  
  console.log('🔚 斷開瀏覽器連接（不關閉瀏覽器）...');
  await browser.close();

  } catch (connectionError) {
    console.log('❌ 無法連接到現有瀏覽器:', connectionError.message);
    console.log('');
    console.log('📋 請按照以下步驟操作：');
    console.log('1. 關閉所有 Chrome/Edge 瀏覽器窗口');
    console.log('2. 使用以下命令重新啟動瀏覽器：');
    console.log('   Chrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\\temp\\chrome-debug"');
    console.log('   或 Edge: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\\temp\\edge-debug"');
    console.log('3. 在瀏覽器中登入 Vercel 並打開項目頁面');
    console.log('4. 重新運行此腳本');
    console.log('');
    console.log('或者，您可以直接告訴我 Vercel 頁面上顯示的錯誤信息。');
  }
}

// 執行函數
getVercelError().catch(console.error);
