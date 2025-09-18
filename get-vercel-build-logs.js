const { chromium } = require('playwright');

async function getVercelBuildLogs() {
  try {
    console.log('🔍 連接到現有的 Chrome 瀏覽器...');
    
    // 連接到現有的 Chrome 實例
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    
    if (contexts.length === 0) {
      console.log('❌ 沒有找到現有的瀏覽器上下文');
      return;
    }
    
    const context = contexts[0];
    const pages = context.pages();
    
    if (pages.length === 0) {
      console.log('❌ 沒有找到現有的頁面');
      return;
    }
    
    // 使用第一個頁面
    const page = pages[0];
    
    console.log('📍 當前頁面 URL:', await page.url());
    
    // 導航到最新失敗的部署頁面
    const deploymentUrl = 'https://vercel.com/minamisums-projects/edu-create/deployments';
    console.log('🌐 導航到部署列表頁面...');
    await page.goto(deploymentUrl, { waitUntil: 'networkidle' });
    
    // 等待頁面載入
    await page.waitForTimeout(5000);
    
    console.log('🔍 尋找最新的失敗部署...');
    
    // 點擊第一個（最新的）部署
    try {
      // 嘗試多種選擇器來找到部署項目
      const deploymentSelectors = [
        'tr:first-child td a',
        '[data-testid="deployment-item"]:first-child',
        '.deployment-item:first-child',
        'a[href*="/deployments/"]',
        'tr:first-child a'
      ];
      
      let clicked = false;
      for (const selector of deploymentSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            console.log(`📋 點擊部署項目 (${selector})...`);
            await element.click();
            clicked = true;
            break;
          }
        } catch (e) {
          console.log(`⚠️ 選擇器 ${selector} 失敗`);
        }
      }
      
      if (!clicked) {
        console.log('⚠️ 無法找到部署項目，嘗試手動導航...');
        // 直接導航到最新的部署 ID
        await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments/dpl_EfKZfaZoqFRPQ2Ay6z3VoGF4tfzg');
      }
      
      await page.waitForTimeout(3000);
      
    } catch (e) {
      console.log('⚠️ 點擊部署失敗:', e.message);
    }
    
    console.log('🔍 尋找構建日誌和錯誤信息...');
    
    // 嘗試點擊 "Build Logs" 或 "Function Logs" 標籤
    try {
      const logTabs = [
        'button:has-text("Build")',
        'button:has-text("Function")',
        'button:has-text("Logs")',
        '[data-testid*="log"]',
        'a:has-text("Build")',
        'a:has-text("Function")'
      ];
      
      for (const tabSelector of logTabs) {
        try {
          const tab = await page.$(tabSelector);
          if (tab) {
            console.log(`📋 點擊日誌標籤 (${tabSelector})...`);
            await tab.click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // 繼續嘗試下一個
        }
      }
    } catch (e) {
      console.log('⚠️ 點擊日誌標籤失敗');
    }
    
    // 查找所有可能包含錯誤信息的文本
    console.log('📋 提取頁面中的錯誤和構建信息...');
    
    const relevantText = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const relevantTexts = [];
      
      for (const element of allElements) {
        const text = element.textContent || '';
        
        // 查找包含關鍵詞的文本
        if (text && (
          text.includes('Error') || 
          text.includes('Failed') || 
          text.includes('error') ||
          text.includes('Build') ||
          text.includes('Deploy') ||
          text.includes('MB') ||
          text.includes('limit') ||
          text.includes('size') ||
          text.includes('timeout') ||
          text.includes('memory') ||
          text.includes('npm') ||
          text.includes('node_modules') ||
          text.includes('package.json')
        )) {
          // 過濾掉太短或重複的文本
          const cleanText = text.trim();
          if (cleanText.length > 15 && cleanText.length < 500) {
            if (!relevantTexts.some(existing => existing.includes(cleanText) || cleanText.includes(existing))) {
              relevantTexts.push(cleanText);
            }
          }
        }
      }
      
      return relevantTexts;
    });
    
    console.log('📋 找到的相關錯誤和構建信息:');
    console.log('='.repeat(60));
    
    relevantText.forEach((text, index) => {
      console.log(`${index + 1}. ${text}`);
      console.log('-'.repeat(40));
    });
    
    // 截圖保存
    console.log('📸 保存當前頁面截圖...');
    await page.screenshot({ path: 'vercel-deployment-logs.png', fullPage: true });
    
    console.log('🔚 完成日誌檢查');
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  }
}

getVercelBuildLogs();
