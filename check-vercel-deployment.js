// 使用 Playwright 檢查 Vercel 部署狀態
const { chromium } = require('playwright');

async function checkVercelDeployment() {
  console.log('🚀 開始檢查 Vercel 部署狀態...');
  
  let browser;
  try {
    // 嘗試連接到現有瀏覽器
    console.log('🔗 嘗試連接到現有瀏覽器...');
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ 成功連接到現有瀏覽器');
  } catch (error) {
    console.log('❌ 無法連接到現有瀏覽器');
    console.log('💡 正在啟動新的瀏覽器實例...');
    
    browser = await chromium.launch({ 
      headless: false,
      args: [
        '--remote-debugging-port=9222',
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ]
    });
  }
  
  try {
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
        console.log('✅ 在現有上下文中創建新頁面');
      }
    } else {
      context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
      page = await context.newPage();
      console.log('✅ 創建新的上下文和頁面');
    }
    
    // 監聽控制台輸出
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`瀏覽器錯誤: ${msg.text()}`);
      }
    });
    
    console.log('📍 步驟 1: 導航到 Vercel 部署頁面');
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(5000);
    
    console.log('📍 步驟 2: 檢查頁面是否需要登入');
    
    // 檢查是否在登入頁面
    const loginButton = page.locator('button:has-text("Continue with")').first();
    const signInButton = page.locator('button:has-text("Sign In")').first();
    
    if (await loginButton.isVisible() || await signInButton.isVisible()) {
      console.log('⚠️ 需要登入 Vercel');
      console.log('💡 請在瀏覽器中手動登入，然後重新運行此腳本');
      
      // 截圖
      await page.screenshot({ 
        path: 'vercel-login-required.png',
        fullPage: true 
      });
      console.log('📸 已保存登入頁面截圖: vercel-login-required.png');
      return;
    }
    
    console.log('📍 步驟 3: 分析部署列表');
    
    // 等待部署列表載入
    await page.waitForTimeout(3000);
    
    // 查找部署項目的多種可能選擇器
    const deploymentSelectors = [
      '[data-testid*="deployment"]',
      '.deployment-item',
      '[class*="deployment"]',
      'tr[data-testid]',
      'div[role="row"]'
    ];
    
    let deployments = [];
    
    for (const selector of deploymentSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          deployments = elements;
          console.log(`✅ 找到 ${elements.length} 個部署項目 (使用選擇器: ${selector})`);
          break;
        }
      } catch (error) {
        // 繼續嘗試下一個選擇器
      }
    }
    
    if (deployments.length === 0) {
      console.log('⚠️ 未找到部署項目，嘗試通用方法...');
      
      // 截圖以便調試
      await page.screenshot({ 
        path: 'vercel-page-debug.png',
        fullPage: true 
      });
      console.log('📸 已保存調試截圖: vercel-page-debug.png');
      
      // 獲取頁面文本內容進行分析
      const pageText = await page.textContent('body');
      
      if (pageText.includes('shimozurdo-default-minimal')) {
        console.log('✅ 頁面包含 shimozurdo-default-minimal 分支信息');
      }
      
      if (pageText.includes('Building') || pageText.includes('Ready') || pageText.includes('Error')) {
        console.log('✅ 頁面包含部署狀態信息');
      }
      
      // 查找包含狀態關鍵字的元素
      const statusKeywords = ['Building', 'Ready', 'Error', 'Queued', 'Canceled'];
      
      for (const keyword of statusKeywords) {
        const statusElements = await page.locator(`text=${keyword}`).all();
        if (statusElements.length > 0) {
          console.log(`🔍 找到狀態: ${keyword} (${statusElements.length} 個)`);
        }
      }
      
      return;
    }
    
    console.log('📍 步驟 4: 分析最新部署');
    
    // 分析前 3 個最新部署
    const maxDeployments = Math.min(3, deployments.length);
    
    for (let i = 0; i < maxDeployments; i++) {
      const deployment = deployments[i];
      console.log(`\n🔍 分析部署 #${i + 1}:`);
      
      try {
        const deploymentText = await deployment.textContent();
        console.log(`📄 部署內容: ${deploymentText?.substring(0, 200)}...`);
        
        // 查找分支信息
        if (deploymentText?.includes('shimozurdo-default-minimal')) {
          console.log('✅ 這是 shimozurdo-default-minimal 分支的部署！');
        }
        
        // 查找狀態信息
        const statusKeywords = ['Building', 'Ready', 'Error', 'Queued', 'Canceled'];
        for (const status of statusKeywords) {
          if (deploymentText?.includes(status)) {
            console.log(`📊 部署狀態: ${status}`);
            break;
          }
        }
        
      } catch (error) {
        console.log(`❌ 無法分析部署 #${i + 1}: ${error.message}`);
      }
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'vercel-deployment-final.png',
      fullPage: true 
    });
    console.log('📸 已保存最終截圖: vercel-deployment-final.png');
    
    console.log('\n🎉 部署狀態檢查完成！');
    console.log('📋 請查看控制台輸出和截圖了解詳細狀態');
    
  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error);
    
    // 錯誤截圖
    try {
      await page.screenshot({ 
        path: 'vercel-error.png',
        fullPage: true 
      });
      console.log('📸 已保存錯誤截圖: vercel-error.png');
    } catch (screenshotError) {
      console.log('無法保存錯誤截圖');
    }
  } finally {
    // 不關閉瀏覽器，讓用戶可以繼續操作
    console.log('🖥️ 瀏覽器保持開啟，您可以繼續手動操作');
  }
}

// 執行檢查
checkVercelDeployment().catch(console.error);
