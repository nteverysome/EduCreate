// MCP整合的遊戲切換器檢查腳本
const { chromium } = require('playwright');
const fs = require('fs');

async function mcpIntegratedCheck() {
  console.log('🔧 使用MCP工具整合檢查遊戲切換器...');
  
  // 1. 檢查服務器狀態
  console.log('🌐 檢查服務器連接...');
  try {
    const response = await fetch('http://localhost:3000');
    console.log(`✅ 服務器狀態: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`❌ 服務器連接失敗: ${error.message}`);
    return;
  }
  
  // 2. 啟動瀏覽器進行實際檢查
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized', '--disable-web-security']
  });
  
  const context = await browser.newContext({
    recordVideo: {
      dir: 'EduCreate-Test-Videos/current/success/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  // 3. 記錄所有控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // 4. 記錄網絡請求
  const networkRequests = [];
  page.on('response', response => {
    networkRequests.push({
      url: response.url(),
      status: response.status(),
      ok: response.ok()
    });
  });
  
  try {
    // 5. 訪問遊戲切換器頁面
    console.log('📱 訪問遊戲切換器頁面...');
    await page.goto('http://localhost:3000/games/switcher', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 6. 等待頁面完全載入
    await page.waitForTimeout(3000);
    
    // 7. 檢查頁面標題
    const title = await page.title();
    console.log(`📄 頁面標題: ${title}`);
    
    // 8. 檢查遊戲切換器組件
    const gameSwitcher = await page.locator('.game-switcher').count();
    console.log(`🎮 遊戲切換器組件數量: ${gameSwitcher}`);
    
    // 9. 截圖記錄當前狀態
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/mcp-switcher-check-1.png',
      fullPage: true 
    });
    console.log('📸 已保存初始狀態截圖');
    
    // 10. 查找並點擊切換遊戲按鈕
    const switchButton = page.locator('text=切換遊戲');
    const buttonExists = await switchButton.count() > 0;
    console.log(`🔘 切換遊戲按鈕存在: ${buttonExists}`);
    
    if (buttonExists) {
      console.log('🖱️ 點擊切換遊戲按鈕...');
      await switchButton.click();
      await page.waitForTimeout(2000);
      
      // 11. 檢查下拉選單
      const dropdown = page.locator('.absolute.right-0.mt-2');
      const dropdownVisible = await dropdown.isVisible();
      console.log(`📋 下拉選單可見: ${dropdownVisible}`);
      
      if (dropdownVisible) {
        // 12. 截圖下拉選單狀態
        await page.screenshot({ 
          path: 'EduCreate-Test-Videos/current/success/mcp-switcher-dropdown.png',
          fullPage: true 
        });
        
        // 13. 獲取遊戲選項
        const gameButtons = await dropdown.locator('button').count();
        console.log(`🎮 遊戲選項按鈕數量: ${gameButtons}`);
        
        // 14. 嘗試切換到飛機遊戲(main版)
        const airplaneMain = dropdown.locator('text=飛機碰撞遊戲');
        if (await airplaneMain.count() > 0) {
          console.log('✈️ 切換到飛機碰撞遊戲...');
          await airplaneMain.click();
          await page.waitForTimeout(5000);
          
          // 15. 檢查遊戲是否載入
          const gameContent = await page.locator('iframe, canvas, .game-content').count();
          console.log(`🎮 遊戲內容載入: ${gameContent > 0 ? '成功' : '失敗'}`);
          
          // 16. 最終截圖
          await page.screenshot({ 
            path: 'EduCreate-Test-Videos/current/success/mcp-switcher-final.png',
            fullPage: true 
          });
        }
      }
    }
    
    // 17. 生成檢查報告
    const report = {
      timestamp: new Date().toISOString(),
      serverStatus: 'running',
      pageTitle: title,
      gameSwitcherExists: gameSwitcher > 0,
      switchButtonExists: buttonExists,
      consoleMessages: consoleMessages,
      networkRequests: networkRequests.filter(req => !req.ok),
      testResult: 'completed'
    };
    
    // 18. 保存報告
    fs.writeFileSync('mcp-switcher-check-report.json', JSON.stringify(report, null, 2));
    console.log('📊 已保存檢查報告: mcp-switcher-check-report.json');
    
    console.log('✅ MCP整合檢查完成！');
    
  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

mcpIntegratedCheck();
