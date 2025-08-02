// 專門測試白色閃爍問題
const { chromium } = require('playwright');
const fs = require('fs');

async function testWhiteFlashIssue() {
  console.log('⚪ 專門測試白色閃爍問題...');
  
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
  
  // 創建白色閃爍測試截圖目錄
  const screenshotDir = 'white-flash-test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  // 監控控制台消息，特別是碰撞和遊戲結束相關
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    // 實時顯示重要消息
    if (message.includes('碰撞') || message.includes('結束') || message.includes('clear') || message.includes('destroy')) {
      console.log(`🔍 重要日誌: ${message}`);
    }
  });
  
  try {
    // 1. 訪問遊戲
    console.log('🎮 訪問Vite版飛機遊戲...');
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // 2. 開始遊戲前截圖
    await page.screenshot({ 
      path: `${screenshotDir}/01-before-start.png`,
      fullPage: false 
    });
    console.log('📸 遊戲開始前截圖');
    
    // 3. 點擊開始遊戲
    const gameCanvas = page.locator('canvas');
    if (await gameCanvas.count() > 0) {
      await gameCanvas.click();
      console.log('🖱️ 點擊開始遊戲');
      await page.waitForTimeout(2000);
      
      // 4. 遊戲運行中截圖
      await page.screenshot({ 
        path: `${screenshotDir}/02-game-running.png`,
        fullPage: false 
      });
      console.log('📸 遊戲運行中截圖');
      
      // 5. 高頻率截圖捕捉白色閃爍 - 每100ms一張
      console.log('📸 開始高頻率截圖捕捉白色閃爍...');
      
      let whiteFlashDetected = false;
      let screenshotCount = 0;
      
      for (let i = 0; i < 100; i++) { // 10秒，每100ms一張
        await page.waitForTimeout(100);
        screenshotCount++;
        
        const screenshotPath = `${screenshotDir}/frame-${String(i + 3).padStart(4, '0')}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: false 
        });
        
        // 每20張報告進度
        if ((i + 1) % 20 === 0) {
          console.log(`📸 已截圖 ${i + 3} 張 (${((i + 1) / 100 * 100).toFixed(0)}%)`);
        }
        
        // 檢查是否有白色閃爍相關的控制台消息
        try {
          // 檢查Canvas背景色
          const canvasInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
              const ctx = canvas.getContext('2d');
              const imageData = ctx.getImageData(0, 0, 100, 100);
              const data = imageData.data;
              
              // 檢查前100x100像素是否大部分是白色
              let whitePixels = 0;
              for (let j = 0; j < data.length; j += 4) {
                const r = data[j];
                const g = data[j + 1];
                const b = data[j + 2];
                if (r > 240 && g > 240 && b > 240) {
                  whitePixels++;
                }
              }
              
              return {
                totalPixels: data.length / 4,
                whitePixels: whitePixels,
                whitePercentage: (whitePixels / (data.length / 4)) * 100,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
              };
            }
            return null;
          });
          
          // 如果檢測到大量白色像素，標記為可能的白色閃爍
          if (canvasInfo && canvasInfo.whitePercentage > 80) {
            console.log(`⚪ 第${i + 3}張截圖檢測到可能的白色閃爍: ${canvasInfo.whitePercentage.toFixed(1)}% 白色像素`);
            whiteFlashDetected = true;
            
            // 保存特殊標記的截圖
            await page.screenshot({ 
              path: `${screenshotDir}/WHITE-FLASH-${String(i + 3).padStart(4, '0')}.png`,
              fullPage: true 
            });
          }
          
        } catch (evalError) {
          // 忽略評估錯誤
        }
      }
      
      // 6. 最終截圖
      await page.screenshot({ 
        path: `${screenshotDir}/99-final-state.png`,
        fullPage: true 
      });
      console.log('📸 最終狀態截圖');
      
      // 7. 生成白色閃爍測試報告
      const whiteFlashReport = {
        timestamp: new Date().toISOString(),
        testType: 'white-flash-detection',
        totalScreenshots: screenshotCount + 3,
        gameUrl: 'http://localhost:3001/games/airplane-game/',
        testDuration: '10 seconds',
        screenshotInterval: '100ms',
        whiteFlashDetected: whiteFlashDetected,
        suspectedCause: [
          'this.clouds.clear(true, true) 在 endGame() 方法中',
          '碰撞處理時的場景重置',
          'Canvas清空和重繪問題',
          '遊戲結束時的場景清理'
        ],
        analysisPoints: [
          '檢查 endGame() 方法的場景清理邏輯',
          '檢查碰撞處理時是否有場景重置',
          '檢查 clouds.clear() 是否導致Canvas閃爍',
          '檢查背景重繪邏輯'
        ],
        screenshotDirectory: screenshotDir,
        consoleMessages: consoleMessages
      };
      
      fs.writeFileSync(`${screenshotDir}/white-flash-report.json`, JSON.stringify(whiteFlashReport, null, 2));
      console.log('📊 白色閃爍測試報告已生成');
    }
    
    console.log('🎉 白色閃爍測試完成！');
    console.log(`📁 測試截圖保存在: ${screenshotDir}/`);
    console.log(`⚪ 白色閃爍檢測結果: ${whiteFlashDetected ? '檢測到' : '未檢測到'}`);
    console.log('🔍 請檢查標記為 WHITE-FLASH 的截圖');
    
  } catch (error) {
    console.error('❌ 白色閃爍測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testWhiteFlashIssue();
