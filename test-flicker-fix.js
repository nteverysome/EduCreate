// 測試閃爍修復效果
const { chromium } = require('playwright');
const fs = require('fs');

async function testFlickerFix() {
  console.log('🔧 測試閃爍修復效果...');
  
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
  
  // 創建修復測試截圖目錄
  const screenshotDir = 'flicker-fix-test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  try {
    // 1. 訪問修復後的遊戲
    console.log('🎮 訪問修復後的Vite版飛機遊戲...');
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // 2. 遊戲開始前截圖
    await page.screenshot({ 
      path: `${screenshotDir}/01-fixed-game-start.png`,
      fullPage: false 
    });
    console.log('📸 修復後遊戲開始截圖');
    
    // 3. 點擊開始遊戲
    const gameCanvas = page.locator('canvas');
    if (await gameCanvas.count() > 0) {
      await gameCanvas.click();
      console.log('🖱️ 點擊開始遊戲');
      await page.waitForTimeout(2000);
      
      // 4. 連續截圖測試修復效果 - 較短時間但更頻繁
      console.log('📸 開始修復效果測試截圖...');
      
      for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(300); // 每300ms一張，更頻繁
        
        await page.screenshot({ 
          path: `${screenshotDir}/fixed-frame-${String(i + 2).padStart(3, '0')}.png`,
          fullPage: false 
        });
        
        // 每10張報告進度
        if ((i + 1) % 10 === 0) {
          console.log(`📸 修復測試已截圖 ${i + 2} 張`);
        }
        
        // 檢查控制台日誌以確認修復效果
        try {
          const consoleLogs = await page.evaluate(() => {
            // 檢查是否有新的震動日誌
            return window.console.logs || [];
          });
          
          // 如果有震動日誌，記錄下來
          if (consoleLogs.length > 0) {
            console.log(`🔍 第${i + 2}張截圖時的控制台活動`);
          }
          
        } catch (evalError) {
          // 忽略評估錯誤
        }
      }
      
      // 5. 最終狀態截圖
      await page.screenshot({ 
        path: `${screenshotDir}/99-fixed-final-state.png`,
        fullPage: true 
      });
      console.log('📸 修復後最終狀態截圖');
      
      // 6. 檢查控制台消息
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      });
      
      // 等待一段時間收集控制台消息
      await page.waitForTimeout(3000);
      
      // 7. 生成修復測試報告
      const fixTestReport = {
        timestamp: new Date().toISOString(),
        testType: 'flicker-fix-verification',
        totalScreenshots: 32,
        gameUrl: 'http://localhost:3001/games/airplane-game/',
        testDuration: '15 seconds',
        screenshotInterval: '300ms',
        modifications: [
          '震動強度從 5/10 降低到 1/3',
          '震動時間從 200/400ms 降低到 100/200ms',
          '正確碰撞不再觸發震動效果',
          '錯誤碰撞只觸發輕微震動'
        ],
        expectedResults: [
          '消除劇烈閃爍現象',
          '保持適度視覺反饋',
          '提升遊戲體驗流暢度',
          '減少視覺疲勞'
        ],
        screenshotDirectory: screenshotDir,
        consoleMessages: consoleMessages
      };
      
      fs.writeFileSync(`${screenshotDir}/fix-test-report.json`, JSON.stringify(fixTestReport, null, 2));
      console.log('📊 修復測試報告已生成');
    }
    
    console.log('🎉 閃爍修復測試完成！');
    console.log(`📁 修復測試截圖保存在: ${screenshotDir}/`);
    console.log('🔍 請比較修復前後的截圖，確認閃爍問題是否解決');
    
  } catch (error) {
    console.error('❌ 修復測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testFlickerFix();
