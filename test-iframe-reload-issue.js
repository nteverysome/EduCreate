// 測試 iframe 重載導致的白色閃爍問題
const { chromium } = require('playwright');
const fs = require('fs');

async function testIframeReloadIssue() {
  console.log('🔄 測試 iframe 重載導致的白色閃爍問題...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    recordVideo: {
      dir: 'EduCreate-Test-Videos/current/success/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  // 創建 iframe 重載測試截圖目錄
  const screenshotDir = 'iframe-reload-test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  // 監控所有網絡請求
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: Date.now()
    });
  });
  
  // 監控 iframe 載入事件
  const iframeEvents = [];
  page.on('frameattached', frame => {
    iframeEvents.push({
      type: 'frameattached',
      url: frame.url(),
      timestamp: Date.now()
    });
    console.log(`🔗 iframe 附加: ${frame.url()}`);
  });
  
  page.on('framedetached', frame => {
    iframeEvents.push({
      type: 'framedetached',
      url: frame.url(),
      timestamp: Date.now()
    });
    console.log(`🔌 iframe 分離: ${frame.url()}`);
  });
  
  page.on('framenavigated', frame => {
    iframeEvents.push({
      type: 'framenavigated',
      url: frame.url(),
      timestamp: Date.now()
    });
    console.log(`🧭 iframe 導航: ${frame.url()}`);
  });
  
  // 監控控制台消息，特別是 postMessage 相關
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    // 實時顯示重要消息
    if (message.includes('GAME_COMPLETE') || message.includes('postMessage') || 
        message.includes('iframe') || message.includes('reload') || 
        message.includes('遊戲結束') || message.includes('重載')) {
      console.log(`🔍 重要日誌: ${message}`);
    }
  });
  
  try {
    // 1. 訪問遊戲切換器（包含 iframe）
    console.log('🎮 訪問遊戲切換器頁面...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. 開始前截圖
    await page.screenshot({ 
      path: `${screenshotDir}/01-switcher-loaded.png`,
      fullPage: false 
    });
    console.log('📸 遊戲切換器載入完成截圖');
    
    // 3. 點擊切換到 Vite 版遊戲
    const switchButton = page.locator('text=切換遊戲');
    if (await switchButton.count() > 0) {
      await switchButton.click();
      await page.waitForTimeout(1000);
      
      const viteOption = page.locator('button:has-text("Vite")').first();
      if (await viteOption.count() > 0) {
        console.log('🖱️ 點擊 Vite 版遊戲選項...');
        await viteOption.click();
        await page.waitForTimeout(5000); // 等待 iframe 載入
        
        // 4. iframe 載入後截圖
        await page.screenshot({ 
          path: `${screenshotDir}/02-vite-game-loaded.png`,
          fullPage: false 
        });
        console.log('📸 Vite 遊戲載入完成截圖');
        
        // 5. 檢查 iframe 是否存在
        const iframe = page.locator('iframe');
        const iframeCount = await iframe.count();
        console.log(`🔍 iframe 數量: ${iframeCount}`);
        
        if (iframeCount > 0) {
          // 6. 等待遊戲開始並進行遊戲
          console.log('🎮 開始遊戲互動...');
          
          // 點擊 iframe 內的遊戲開始
          await iframe.click();
          await page.waitForTimeout(2000);
          
          // 7. 高頻率截圖監控 iframe 重載
          console.log('📸 開始高頻率監控 iframe 重載...');
          
          let iframeReloadDetected = false;
          let screenshotCount = 0;
          
          for (let i = 0; i < 150; i++) { // 15秒，每100ms一張
            await page.waitForTimeout(100);
            screenshotCount++;
            
            const screenshotPath = `${screenshotDir}/monitor-${String(i + 3).padStart(4, '0')}.png`;
            await page.screenshot({ 
              path: screenshotPath,
              fullPage: false 
            });
            
            // 每30張報告進度
            if ((i + 1) % 30 === 0) {
              console.log(`📸 已監控 ${i + 3} 張 (${((i + 1) / 150 * 100).toFixed(0)}%)`);
            }
            
            // 檢查 iframe 是否重載
            try {
              const currentIframeCount = await iframe.count();
              const iframeSrc = await iframe.getAttribute('src');
              
              // 檢查是否有新的 iframe 事件
              const recentEvents = iframeEvents.filter(event => 
                Date.now() - event.timestamp < 1000
              );
              
              if (recentEvents.length > 0) {
                console.log(`🔄 檢測到 iframe 事件: ${recentEvents.map(e => e.type).join(', ')}`);
                iframeReloadDetected = true;
                
                // 保存特殊標記的截圖
                await page.screenshot({ 
                  path: `${screenshotDir}/IFRAME-RELOAD-${String(i + 3).padStart(4, '0')}.png`,
                  fullPage: true 
                });
              }
              
            } catch (evalError) {
              console.log(`⚠️ iframe 檢查錯誤: ${evalError.message}`);
            }
          }
          
          // 8. 最終截圖
          await page.screenshot({ 
            path: `${screenshotDir}/99-final-state.png`,
            fullPage: true 
          });
          console.log('📸 最終狀態截圖');
          
          // 9. 生成 iframe 重載測試報告
          const reloadReport = {
            timestamp: new Date().toISOString(),
            testType: 'iframe-reload-detection',
            totalScreenshots: screenshotCount + 3,
            gameUrl: 'http://localhost:3000/games/switcher',
            testDuration: '15 seconds',
            screenshotInterval: '100ms',
            iframeReloadDetected: iframeReloadDetected,
            suspectedCause: [
              'GAME_COMPLETE 消息觸發 iframe 重載',
              '父頁面收到遊戲結束消息後重新載入遊戲',
              'iframe src 屬性被重新設置',
              '遊戲切換器的自動重載機制'
            ],
            analysisPoints: [
              '檢查 GameIframe 組件的 GAME_COMPLETE 處理',
              '檢查是否有自動重載邏輯',
              '檢查 iframe src 變化',
              '檢查 postMessage 處理邏輯'
            ],
            iframeEvents: iframeEvents,
            networkRequests: networkRequests.filter(req => 
              req.url.includes('localhost:3001') || req.url.includes('airplane-game')
            ),
            screenshotDirectory: screenshotDir,
            consoleMessages: consoleMessages.filter(msg => 
              msg.includes('GAME_COMPLETE') || msg.includes('iframe') || 
              msg.includes('reload') || msg.includes('postMessage')
            )
          };
          
          fs.writeFileSync(`${screenshotDir}/iframe-reload-report.json`, JSON.stringify(reloadReport, null, 2));
          console.log('📊 iframe 重載測試報告已生成');
        }
      }
    }
    
    console.log('🎉 iframe 重載測試完成！');
    console.log(`📁 測試截圖保存在: ${screenshotDir}/`);
    console.log(`🔄 iframe 重載檢測結果: ${iframeReloadDetected ? '檢測到重載' : '未檢測到重載'}`);
    console.log('🔍 請檢查標記為 IFRAME-RELOAD 的截圖');
    
  } catch (error) {
    console.error('❌ iframe 重載測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testIframeReloadIssue();
