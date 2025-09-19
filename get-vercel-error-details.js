// 獲取 Vercel 部署錯誤詳情
const { chromium } = require('playwright');

async function getVercelErrorDetails() {
  console.log('🔍 開始獲取 Vercel 部署錯誤詳情...');
  
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ 成功連接到現有瀏覽器');
  } catch (error) {
    console.log('❌ 無法連接到現有瀏覽器，啟動新實例...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--remote-debugging-port=9222', '--no-sandbox']
    });
  }
  
  try {
    const contexts = browser.contexts();
    const context = contexts[0] || await browser.newContext();
    const pages = context.pages();
    const page = pages[0] || await context.newPage();
    
    console.log('📍 步驟 1: 確保在 Vercel 部署頁面');
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('📍 步驟 2: 查找失敗的 shimozurdo-default-minimal 部署');
    
    // 查找包含 shimozurdo-default-minimal 和 Error 的部署項目
    const errorDeployments = await page.locator('[data-testid*="deployment"]:has-text("shimozurdo-default-minimal"):has-text("Error")').all();
    
    if (errorDeployments.length === 0) {
      console.log('⚠️ 未找到失敗的 shimozurdo-default-minimal 部署');
      
      // 嘗試查找任何 Error 狀態的部署
      const anyErrorDeployments = await page.locator('[data-testid*="deployment"]:has-text("Error")').all();
      console.log(`🔍 找到 ${anyErrorDeployments.length} 個失敗的部署`);
      
      if (anyErrorDeployments.length > 0) {
        console.log('📍 點擊最新的失敗部署...');
        await anyErrorDeployments[0].click();
      } else {
        return;
      }
    } else {
      console.log('✅ 找到失敗的 shimozurdo-default-minimal 部署');
      console.log('📍 點擊進入部署詳情...');
      await errorDeployments[0].click();
    }
    
    // 等待部署詳情頁面載入
    await page.waitForTimeout(5000);
    
    console.log('📍 步驟 3: 查找錯誤信息');
    
    // 查找各種可能的錯誤信息元素
    const errorSelectors = [
      '.error-message',
      '[data-testid*="error"]',
      '.build-error',
      '.deployment-error',
      'pre:has-text("Error")',
      'code:has-text("Error")',
      '.log-line:has-text("Error")',
      '[class*="error"]'
    ];
    
    let errorFound = false;
    
    for (const selector of errorSelectors) {
      try {
        const errorElements = await page.locator(selector).all();
        if (errorElements.length > 0) {
          console.log(`\n🔍 找到錯誤信息 (${selector}):`);
          
          for (let i = 0; i < Math.min(3, errorElements.length); i++) {
            const errorText = await errorElements[i].textContent();
            if (errorText && errorText.trim()) {
              console.log(`❌ 錯誤 ${i + 1}: ${errorText.trim()}`);
              errorFound = true;
            }
          }
        }
      } catch (error) {
        // 繼續嘗試下一個選擇器
      }
    }
    
    // 查找構建日誌
    console.log('\n📍 步驟 4: 查找構建日誌');
    
    const logSelectors = [
      '.build-log',
      '.deployment-log',
      'pre',
      'code',
      '.log-container',
      '[data-testid*="log"]'
    ];
    
    for (const selector of logSelectors) {
      try {
        const logElements = await page.locator(selector).all();
        if (logElements.length > 0) {
          console.log(`\n📋 找到日誌信息 (${selector}):`);
          
          for (let i = 0; i < Math.min(2, logElements.length); i++) {
            const logText = await logElements[i].textContent();
            if (logText && logText.trim() && logText.length > 50) {
              // 只顯示包含錯誤關鍵字的日誌行
              const lines = logText.split('\n');
              const errorLines = lines.filter(line => 
                line.toLowerCase().includes('error') || 
                line.toLowerCase().includes('failed') ||
                line.toLowerCase().includes('cannot') ||
                line.toLowerCase().includes('module not found')
              );
              
              if (errorLines.length > 0) {
                console.log(`📝 相關日誌片段:`);
                errorLines.slice(0, 5).forEach(line => {
                  console.log(`   ${line.trim()}`);
                });
                errorFound = true;
              }
            }
          }
        }
      } catch (error) {
        // 繼續嘗試下一個選擇器
      }
    }
    
    if (!errorFound) {
      console.log('\n⚠️ 未找到具體錯誤信息，獲取頁面內容進行分析...');
      
      const pageText = await page.textContent('body');
      const lines = pageText.split('\n');
      
      // 查找包含錯誤關鍵字的行
      const errorKeywords = ['error', 'failed', 'cannot', 'module not found', 'build failed'];
      const relevantLines = lines.filter(line => 
        errorKeywords.some(keyword => line.toLowerCase().includes(keyword))
      );
      
      if (relevantLines.length > 0) {
        console.log('🔍 頁面中的相關錯誤信息:');
        relevantLines.slice(0, 10).forEach(line => {
          if (line.trim()) {
            console.log(`   ${line.trim()}`);
          }
        });
      }
    }
    
    // 截圖保存
    await page.screenshot({ 
      path: 'vercel-error-details.png',
      fullPage: true 
    });
    console.log('\n📸 已保存錯誤詳情截圖: vercel-error-details.png');
    
    console.log('\n🎯 建議的下一步:');
    console.log('1. 查看截圖了解具體錯誤');
    console.log('2. 如果是依賴問題，可能需要進一步優化');
    console.log('3. 如果是構建配置問題，需要調整 next.config.js');
    console.log('4. 考慮回到更穩定的配置');
    
  } catch (error) {
    console.error('❌ 獲取錯誤詳情時發生問題:', error);
  }
}

// 執行獲取錯誤詳情
getVercelErrorDetails().catch(console.error);
