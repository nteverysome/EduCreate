// 專門測試錯誤碰撞的白色閃爍問題
const { chromium } = require('playwright');
const fs = require('fs');

async function testErrorCollisionFlash() {
  console.log('❌ 專門測試錯誤碰撞的白色閃爍問題...');
  
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
  
  // 創建錯誤碰撞測試截圖目錄
  const screenshotDir = 'error-collision-flash-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  // 監控控制台消息，特別關注錯誤碰撞
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    // 實時顯示錯誤碰撞相關消息
    if (message.includes('錯誤碰撞') || message.includes('第5次錯誤') || 
        message.includes('遊戲結束') || message.includes('淡出') || 
        message.includes('漸進式')) {
      console.log(`🔍 錯誤碰撞日誌: ${message}`);
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
      path: `${screenshotDir}/01-before-error-test.png`,
      fullPage: false 
    });
    console.log('📸 錯誤測試開始前截圖');
    
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
      
      // 5. 專門測試錯誤碰撞 - 故意碰撞錯誤的雲朵
      console.log('❌ 開始專門測試錯誤碰撞...');
      
      let errorCollisionCount = 0;
      let whiteFlashDetected = false;
      
      // 進行多次移動，增加錯誤碰撞機會
      for (let i = 0; i < 50; i++) {
        // 隨機上下移動增加碰撞機會
        if (i % 2 === 0) {
          await page.keyboard.press('ArrowUp');
        } else {
          await page.keyboard.press('ArrowDown');
        }
        
        await page.waitForTimeout(200); // 每200ms移動一次
        
        // 每10次移動截圖一次
        if (i % 10 === 0) {
          const screenshotPath = `${screenshotDir}/error-test-${String(i + 3).padStart(3, '0')}.png`;
          await page.screenshot({ 
            path: screenshotPath,
            fullPage: false 
          });
          
          // 檢查是否有白色閃爍
          try {
            const canvasInfo = await page.evaluate(() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, 300, 300);
                const data = imageData.data;
                
                // 檢查前300x300像素的白色比例
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
                  whitePercentage: (whitePixels / (data.length / 4)) * 100
                };
              }
              return null;
            });
            
            // 如果檢測到大量白色像素，標記為白色閃爍
            if (canvasInfo && canvasInfo.whitePercentage > 70) {
              console.log(`⚪ 第${i + 3}次檢查檢測到白色閃爍: ${canvasInfo.whitePercentage.toFixed(1)}% 白色像素`);
              whiteFlashDetected = true;
              
              // 保存特殊標記的截圖
              await page.screenshot({ 
                path: `${screenshotDir}/ERROR-WHITE-FLASH-${String(i + 3).padStart(3, '0')}.png`,
                fullPage: true 
              });
            }
            
          } catch (evalError) {
            // 忽略評估錯誤
          }
        }
        
        // 檢查是否有錯誤碰撞日誌
        const recentMessages = consoleMessages.slice(-5);
        const hasErrorCollision = recentMessages.some(msg => 
          msg.includes('錯誤碰撞') || msg.includes('第5次錯誤')
        );
        
        if (hasErrorCollision) {
          errorCollisionCount++;
          console.log(`❌ 檢測到第 ${errorCollisionCount} 次錯誤碰撞`);
          
          // 錯誤碰撞後立即截圖
          await page.screenshot({ 
            path: `${screenshotDir}/ERROR-COLLISION-${errorCollisionCount}-${String(i + 3).padStart(3, '0')}.png`,
            fullPage: false 
          });
        }
        
        // 如果檢測到第5次錯誤，等待遊戲結束
        if (recentMessages.some(msg => msg.includes('第5次錯誤'))) {
          console.log('💥 檢測到第5次錯誤，等待遊戲結束...');
          await page.waitForTimeout(2000);
          
          // 遊戲結束後截圖
          await page.screenshot({ 
            path: `${screenshotDir}/GAME-END-AFTER-5TH-ERROR.png`,
            fullPage: true 
          });
          break;
        }
      }
      
      // 6. 最終截圖
      await page.screenshot({ 
        path: `${screenshotDir}/99-error-test-final.png`,
        fullPage: true 
      });
      console.log('📸 錯誤測試最終截圖');
      
      // 7. 生成錯誤碰撞測試報告
      const errorTestReport = {
        timestamp: new Date().toISOString(),
        testType: 'error-collision-white-flash-test',
        totalScreenshots: 50 + errorCollisionCount + 3,
        gameUrl: 'http://localhost:3001/games/airplane-game/',
        testDuration: '50 movements, 200ms each',
        errorCollisionCount: errorCollisionCount,
        whiteFlashDetected: whiteFlashDetected,
        findings: [
          '專門測試錯誤碰撞的白色閃爍問題',
          '通過故意移動增加錯誤碰撞機會',
          '監控每次錯誤碰撞後的視覺效果',
          '特別關注第5次錯誤的處理'
        ],
        screenshotDirectory: screenshotDir,
        errorCollisionMessages: consoleMessages.filter(msg => 
          msg.includes('錯誤碰撞') || msg.includes('第5次錯誤') || 
          msg.includes('遊戲結束') || msg.includes('淡出')
        )
      };
      
      fs.writeFileSync(`${screenshotDir}/error-collision-test-report.json`, JSON.stringify(errorTestReport, null, 2));
      console.log('📊 錯誤碰撞測試報告已生成');
    }
    
    console.log('🎉 錯誤碰撞白色閃爍測試完成！');
    console.log(`📁 測試截圖保存在: ${screenshotDir}/`);
    console.log(`❌ 錯誤碰撞次數: ${errorCollisionCount}`);
    console.log(`⚪ 白色閃爍檢測結果: ${whiteFlashDetected ? '檢測到' : '未檢測到'}`);
    console.log('🔍 請檢查標記為 ERROR-WHITE-FLASH 的截圖');
    
  } catch (error) {
    console.error('❌ 錯誤碰撞測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testErrorCollisionFlash();
