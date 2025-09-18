const { chromium } = require('playwright');

async function getVercelMainPage() {
  let browser;
  try {
    console.log('🔍 連接到現有的 Chrome 瀏覽器...');
    
    // 連接到現有的 Chrome 實例
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ 成功連接到瀏覽器');
    
    const contexts = browser.contexts();
    if (contexts.length === 0) {
      console.log('❌ 沒有找到現有的瀏覽器上下文');
      return;
    }
    
    const context = contexts[0];
    const pages = context.pages();
    
    let page;
    if (pages.length === 0) {
      page = await context.newPage();
    } else {
      page = pages[0];
    }
    
    // 導航到主要的 Vercel 項目頁面
    const mainUrl = 'https://vercel.com/minamisums-projects/edu-create';
    console.log('🌐 導航到主項目頁面...');
    
    await page.goto(mainUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    console.log('📍 頁面標題:', await page.title());
    console.log('📍 當前 URL:', page.url());
    
    // 查找部署相關的信息
    console.log('🔍 查找部署狀態信息...');
    
    // 嘗試點擊 "Deployments" 標籤或連結
    try {
      const deploymentLink = await page.$('a[href*="deployments"], button:has-text("Deployments"), [data-testid*="deployment"]');
      if (deploymentLink) {
        console.log('📋 點擊部署標籤...');
        await deploymentLink.click();
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('⚠️ 無法點擊部署標籤');
    }
    
    // 提取頁面中所有相關的錯誤和狀態信息
    const statusInfo = await page.evaluate(() => {
      const allText = document.body.innerText;
      const lines = allText.split('\n');
      const relevantLines = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && (
          trimmed.toLowerCase().includes('error') ||
          trimmed.toLowerCase().includes('failed') ||
          trimmed.toLowerCase().includes('success') ||
          trimmed.toLowerCase().includes('building') ||
          trimmed.toLowerCase().includes('deployed') ||
          trimmed.toLowerCase().includes('deployment') ||
          trimmed.toLowerCase().includes('build') ||
          trimmed.toLowerCase().includes('status') ||
          trimmed.includes('●') ||
          trimmed.includes('✓') ||
          trimmed.includes('✗') ||
          trimmed.includes('MB') ||
          trimmed.includes('ago') ||
          trimmed.includes('seconds') ||
          trimmed.includes('minutes')
        )) {
          if (trimmed.length > 5 && trimmed.length < 150) {
            relevantLines.push(trimmed);
          }
        }
      }
      
      return relevantLines;
    });
    
    console.log('📋 找到的部署狀態信息:');
    console.log('='.repeat(60));
    
    if (statusInfo.length > 0) {
      // 去重並顯示
      const uniqueInfo = [...new Set(statusInfo)];
      uniqueInfo.forEach((info, index) => {
        console.log(`${index + 1}. ${info}`);
      });
    } else {
      console.log('⚠️ 沒有找到部署狀態信息');
    }
    
    // 嘗試獲取最新部署的詳細信息
    console.log('🔍 查找最新部署連結...');
    
    const deploymentLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/deployments/"]'));
      return links.map(link => ({
        href: link.href,
        text: link.textContent?.trim() || ''
      })).slice(0, 5); // 只取前 5 個
    });
    
    if (deploymentLinks.length > 0) {
      console.log('📋 找到的部署連結:');
      deploymentLinks.forEach((link, index) => {
        console.log(`${index + 1}. ${link.href} - ${link.text}`);
      });
      
      // 嘗試點擊第一個部署連結
      if (deploymentLinks[0]) {
        console.log('🔗 導航到最新部署...');
        await page.goto(deploymentLinks[0].href);
        await page.waitForTimeout(5000);
        
        // 獲取部署詳細頁面的錯誤信息
        const deploymentDetails = await page.evaluate(() => {
          return document.body.innerText;
        });
        
        console.log('📋 部署詳細信息:');
        console.log('='.repeat(60));
        
        const detailLines = deploymentDetails.split('\n');
        const errorLines = detailLines.filter(line => {
          const trimmed = line.trim();
          return trimmed && (
            trimmed.toLowerCase().includes('error') ||
            trimmed.toLowerCase().includes('failed') ||
            trimmed.toLowerCase().includes('build') ||
            trimmed.toLowerCase().includes('timeout') ||
            trimmed.toLowerCase().includes('limit') ||
            trimmed.toLowerCase().includes('size') ||
            trimmed.toLowerCase().includes('mb')
          );
        });
        
        if (errorLines.length > 0) {
          errorLines.slice(0, 10).forEach((line, index) => {
            console.log(`${index + 1}. ${line.trim()}`);
          });
        } else {
          console.log('⚠️ 在部署詳細頁面沒有找到明顯的錯誤信息');
        }
      }
    }
    
    // 截圖保存
    console.log('📸 保存當前頁面截圖...');
    await page.screenshot({ 
      path: 'vercel-main-page.png', 
      fullPage: true 
    });
    
    console.log('🔚 完成檢查');
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  }
}

getVercelMainPage();
