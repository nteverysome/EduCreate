const { chromium } = require('playwright');

async function getSimpleVercelLogs() {
  let browser;
  try {
    console.log('🔍 連接到現有的 Chrome 瀏覽器...');
    
    // 連接到現有的 Chrome 實例
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ 成功連接到瀏覽器');
    
    const contexts = browser.contexts();
    console.log(`📱 找到 ${contexts.length} 個瀏覽器上下文`);
    
    if (contexts.length === 0) {
      console.log('❌ 沒有找到現有的瀏覽器上下文');
      return;
    }
    
    const context = contexts[0];
    const pages = context.pages();
    console.log(`📄 找到 ${pages.length} 個頁面`);
    
    let page;
    if (pages.length === 0) {
      console.log('📄 創建新頁面...');
      page = await context.newPage();
    } else {
      page = pages[0];
      console.log('📄 使用現有頁面');
    }
    
    console.log('📍 當前頁面 URL:', await page.url());
    
    // 直接導航到最新的部署頁面
    const deploymentUrl = 'https://vercel.com/minamisums-projects/edu-create/deployments/dpl_EfKZfaZoqFRPQ2Ay6z3VoGF4tfzg';
    console.log('🌐 導航到最新部署頁面...');
    
    try {
      await page.goto(deploymentUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      console.log('✅ 頁面載入完成');
    } catch (e) {
      console.log('⚠️ 頁面載入超時，繼續嘗試...');
    }
    
    // 等待頁面載入
    await page.waitForTimeout(5000);
    
    console.log('🔍 提取頁面文本內容...');
    
    // 獲取頁面標題
    const title = await page.title();
    console.log('📍 頁面標題:', title);
    
    // 提取所有文本內容
    const pageText = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    console.log('📋 頁面內容分析:');
    console.log('='.repeat(60));
    
    // 分析文本內容，查找錯誤相關信息
    const lines = pageText.split('\n');
    const relevantLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && (
        trimmedLine.toLowerCase().includes('error') ||
        trimmedLine.toLowerCase().includes('failed') ||
        trimmedLine.toLowerCase().includes('build') ||
        trimmedLine.toLowerCase().includes('deploy') ||
        trimmedLine.toLowerCase().includes('limit') ||
        trimmedLine.toLowerCase().includes('size') ||
        trimmedLine.toLowerCase().includes('mb') ||
        trimmedLine.toLowerCase().includes('timeout') ||
        trimmedLine.toLowerCase().includes('memory') ||
        trimmedLine.toLowerCase().includes('npm') ||
        trimmedLine.toLowerCase().includes('node_modules')
      )) {
        if (trimmedLine.length > 10 && trimmedLine.length < 200) {
          relevantLines.push(trimmedLine);
        }
      }
    }
    
    // 去重並顯示
    const uniqueLines = [...new Set(relevantLines)];
    
    if (uniqueLines.length > 0) {
      console.log('🔍 找到相關錯誤信息:');
      uniqueLines.forEach((line, index) => {
        console.log(`${index + 1}. ${line}`);
      });
    } else {
      console.log('⚠️ 沒有找到明顯的錯誤信息');
      console.log('📋 顯示前 20 行內容:');
      lines.slice(0, 20).forEach((line, index) => {
        if (line.trim()) {
          console.log(`${index + 1}. ${line.trim()}`);
        }
      });
    }
    
    // 截圖保存
    console.log('📸 保存當前頁面截圖...');
    await page.screenshot({ 
      path: 'vercel-deployment-page.png', 
      fullPage: true 
    });
    
    console.log('🔚 完成檢查');
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    console.error('❌ 錯誤堆棧:', error.stack);
  } finally {
    // 不要關閉瀏覽器，因為它是用戶的現有瀏覽器
    console.log('✅ 保持瀏覽器開啟');
  }
}

getSimpleVercelLogs();
