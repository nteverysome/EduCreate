// Vercel 部署監控工具 - 連接到現有瀏覽器
const { chromium } = require('playwright');

async function monitorVercelDeployment() {
  console.log('🚀 開始監控 Vercel 部署狀態...');
  console.log('🔗 嘗試連接到您現有的瀏覽器...');

  // 連接到現有的瀏覽器調試端口
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ 成功連接到現有瀏覽器');
  } catch (error) {
    console.log('❌ 無法連接到現有瀏覽器，請確保瀏覽器以調試模式運行');
    console.log('💡 請運行: chrome.exe --remote-debugging-port=9222');
    return;
  }

  try {
    const contexts = browser.contexts();
    const context = contexts[0] || await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });

    // 使用現有頁面或創建新頁面
    const pages = context.pages();
    let page;

    if (pages.length > 0) {
      page = pages[0];
      console.log('✅ 使用現有頁面');
    } else {
      page = await context.newPage();
      console.log('✅ 創建新頁面');
    }
    
    console.log('📍 步驟 1: 訪問 Vercel 部署頁面');
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 等待頁面載入
    await page.waitForTimeout(3000);
    
    console.log('📍 步驟 2: 檢查最新部署狀態');
    
    // 查找最新的部署項目
    const deploymentItems = await page.locator('[data-testid="deployment-item"]').all();
    
    if (deploymentItems.length > 0) {
      const latestDeployment = deploymentItems[0];
      
      // 獲取部署狀態
      const statusElement = await latestDeployment.locator('[data-testid="deployment-status"]').first();
      const branchElement = await latestDeployment.locator('[data-testid="deployment-branch"]').first();
      const timeElement = await latestDeployment.locator('[data-testid="deployment-time"]').first();
      
      if (await statusElement.isVisible()) {
        const status = await statusElement.textContent();
        console.log(`✅ 最新部署狀態: ${status}`);
      }
      
      if (await branchElement.isVisible()) {
        const branch = await branchElement.textContent();
        console.log(`🌿 部署分支: ${branch}`);
        
        if (branch && branch.includes('shimozurdo-default-minimal')) {
          console.log('✅ 正確的分支正在部署！');
        } else {
          console.log('⚠️ 部署的不是 shimozurdo-default-minimal 分支');
        }
      }
      
      if (await timeElement.isVisible()) {
        const time = await timeElement.textContent();
        console.log(`⏰ 部署時間: ${time}`);
      }
    }
    
    console.log('📍 步驟 3: 檢查是否有進行中的部署');
    
    // 查找進行中的部署
    const buildingDeployments = await page.locator('[data-testid="deployment-status"]:has-text("Building")').all();
    const queuedDeployments = await page.locator('[data-testid="deployment-status"]:has-text("Queued")').all();
    
    if (buildingDeployments.length > 0) {
      console.log('🔄 有部署正在構建中...');
    }
    
    if (queuedDeployments.length > 0) {
      console.log('⏳ 有部署在隊列中等待...');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'vercel-deployment-status.png',
      fullPage: true 
    });
    console.log('📸 已保存部署狀態截圖: vercel-deployment-status.png');
    
    console.log('📍 步驟 4: 提供部署指導');
    console.log(`
🎯 **如果需要手動觸發部署**：
1. 在當前頁面點擊 "Deploy" 按鈕
2. 選擇分支: shimozurdo-default-minimal
3. 點擊 "Deploy" 確認

🔍 **監控部署進度**：
- Building: 正在構建
- Ready: 部署成功
- Error: 部署失敗

📱 **測試部署結果**：
- 訪問部署 URL
- 確認 /games/switcher 載入 shimozurdo-game
    `);
    
    // 保持瀏覽器開啟以便用戶操作
    console.log('🖥️ 瀏覽器將保持開啟，您可以手動操作...');
    console.log('按 Ctrl+C 結束監控');
    
    // 等待用戶操作
    await new Promise(() => {}); // 無限等待
    
  } catch (error) {
    console.error('❌ 監控過程中發生錯誤:', error);
  }
}

// 執行監控
monitorVercelDeployment().catch(console.error);
