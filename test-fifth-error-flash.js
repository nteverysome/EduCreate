// 專門測試第5次錯誤的白色閃爍問題
const { chromium } = require('playwright');
const fs = require('fs');

async function testFifthErrorFlash() {
  console.log('💥 專門測試第5次錯誤的白色閃爍問題...');
  
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
  
  // 創建第5次錯誤測試截圖目錄
  const screenshotDir = 'fifth-error-flash-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  // 監控控制台消息，特別關注第5次錯誤
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    // 實時顯示第5次錯誤相關消息
    if (message.includes('第5次錯誤') || message.includes('分數歸零') || 
        message.includes('遊戲結束') || message.includes('漸進式') || 
        message.includes('淡出')) {
      console.log(`🔍 第5次錯誤日誌: ${message}`);
    }
  });
  
  try {
    // 1. 訪問 Vite 版飛機遊戲
    console.log('🎮 訪問 Vite 版飛機遊戲...');
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // 2. 開始遊戲前截圖
    await page.screenshot({ 
      path: `${screenshotDir}/01-before-fifth-error-test.png`,
      fullPage: false 
    });
    console.log('📸 第5次錯誤測試開始前截圖');
    
    // 3. 點擊開始遊戲
    const gameCanvas = page.locator('canvas');
    if (await gameCanvas.count() > 0) {
      await gameCanvas.click();
      console.log('🖱️ 點擊開始遊戲');
      await page.waitForTimeout(3000);
      
      // 4. 遊戲運行中截圖
      await page.screenshot({ 
        path: `${screenshotDir}/02-game-running.png`,
        fullPage: false 
      });
      console.log('📸 遊戲運行中截圖');
      
      // 5. 專門觸發第5次錯誤 - 持續移動直到第5次錯誤
      console.log('💥 開始觸發第5次錯誤...');
      
      let errorCount = 0;
      let fifthErrorTriggered = false;
      let whiteFlashDetected = false;
      
      // 持續移動直到觸發第5次錯誤
      for (let i = 0; i < 100 && !fifthErrorTriggered; i++) {
        // 快速上下移動增加碰撞機會
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(100);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
        
        // 檢查是否有新的錯誤碰撞
        const recentMessages = consoleMessages.slice(-3);
        const hasNewError = recentMessages.some(msg => 
          msg.includes('錯誤碰撞:') && msg.includes('次錯誤')
        );
        
        if (hasNewError) {
          errorCount++;
          console.log(`❌ 檢測到第 ${errorCount} 次錯誤碰撞`);
          
          // 每次錯誤後截圖
          await page.screenshot({ 
            path: `${screenshotDir}/error-${errorCount}-step-${String(i + 3).padStart(3, '0')}.png`,
            fullPage: false 
          });
        }
        
        // 檢查是否觸發第5次錯誤
        const hasFifthError = recentMessages.some(msg => 
          msg.includes('第5次錯誤') || msg.includes('分數歸零')
        );
        
        if (hasFifthError && !fifthErrorTriggered) {
          fifthErrorTriggered = true;
          console.log('💥 第5次錯誤已觸發！開始高頻率監控...');
          
          // 第5次錯誤觸發後，高頻率截圖監控白色閃爍
          for (let j = 0; j < 30; j++) {
            await page.waitForTimeout(100); // 每100ms一張
            
            const screenshotPath = `${screenshotDir}/fifth-error-monitor-${String(j + 1).padStart(3, '0')}.png`;
            await page.screenshot({ 
              path: screenshotPath,
              fullPage: false 
            });
            
            // 檢查白色閃爍
            try {
              const canvasInfo = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  const imageData = ctx.getImageData(0, 0, 400, 400);
                  const data = imageData.data;
                  
                  // 檢查前400x400像素的白色比例
                  let whitePixels = 0;
                  for (let k = 0; k < data.length; k += 4) {
                    const r = data[k];
                    const g = data[k + 1];
                    const b = data[k + 2];
                    if (r > 240 && g > 240 && b > 240) {
                      whitePixels++;
                    }
                  }
                  
                  return {
                    whitePercentage: (whitePixels / (data.length / 4)) * 100
                  };
                }
                return null;
              });
              
              // 如果檢測到大量白色像素，標記為白色閃爍
              if (canvasInfo && canvasInfo.whitePercentage > 60) {
                console.log(`⚪ 第5次錯誤後第${j + 1}張截圖檢測到白色閃爍: ${canvasInfo.whitePercentage.toFixed(1)}% 白色像素`);
                whiteFlashDetected = true;
                
                // 保存特殊標記的截圖
                await page.screenshot({ 
                  path: `${screenshotDir}/FIFTH-ERROR-WHITE-FLASH-${String(j + 1).padStart(3, '0')}.png`,
                  fullPage: true 
                });
              }
              
            } catch (evalError) {
              // 忽略評估錯誤
            }
            
            // 每10張截圖報告進度
            if ((j + 1) % 10 === 0) {
              console.log(`📸 第5次錯誤後已監控 ${j + 1} 張截圖`);
            }
          }
          
          // 等待遊戲完全結束
          await page.waitForTimeout(2000);
          
          // 遊戲結束後最終截圖
          await page.screenshot({ 
            path: `${screenshotDir}/GAME-END-FINAL.png`,
            fullPage: true 
          });
          console.log('📸 遊戲結束最終截圖');
          
          break;
        }
      }
      
      // 6. 生成第5次錯誤測試報告
      const fifthErrorReport = {
        timestamp: new Date().toISOString(),
        testType: 'fifth-error-white-flash-test',
        totalScreenshots: errorCount + 30 + 4,
        gameUrl: 'http://localhost:3001/games/airplane-game/',
        testDuration: '直到第5次錯誤觸發',
        errorCount: errorCount,
        fifthErrorTriggered: fifthErrorTriggered,
        whiteFlashDetected: whiteFlashDetected,
        findings: [
          '專門測試第5次錯誤的白色閃爍問題',
          '高頻率監控第5次錯誤後的視覺效果',
          '檢查分數歸零和遊戲結束的處理',
          '驗證漸進式清理是否有效'
        ],
        screenshotDirectory: screenshotDir,
        fifthErrorMessages: consoleMessages.filter(msg => 
          msg.includes('第5次錯誤') || msg.includes('分數歸零') || 
          msg.includes('遊戲結束') || msg.includes('漸進式')
        )
      };
      
      fs.writeFileSync(`${screenshotDir}/fifth-error-test-report.json`, JSON.stringify(fifthErrorReport, null, 2));
      console.log('📊 第5次錯誤測試報告已生成');
    }
    
    console.log('🎉 第5次錯誤白色閃爍測試完成！');
    console.log(`📁 測試截圖保存在: ${screenshotDir}/`);
    console.log(`💥 第5次錯誤觸發: ${fifthErrorTriggered ? '是' : '否'}`);
    console.log(`⚪ 白色閃爍檢測結果: ${whiteFlashDetected ? '檢測到' : '未檢測到'}`);
    console.log('🔍 請檢查標記為 FIFTH-ERROR-WHITE-FLASH 的截圖');
    
  } catch (error) {
    console.error('❌ 第5次錯誤測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testFifthErrorFlash();
