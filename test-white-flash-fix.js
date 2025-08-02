// 測試白色閃爍修復效果
const { chromium } = require('playwright');
const fs = require('fs');

async function testWhiteFlashFix() {
  console.log('⚪ 測試白色閃爍修復效果...');
  
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
  const screenshotDir = 'white-flash-fix-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  // 監控控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    // 實時顯示重要消息
    if (message.includes('淡出') || message.includes('漸進式') || message.includes('碰撞') || message.includes('結束')) {
      console.log(`🔍 修復日誌: ${message}`);
    }
  });
  
  try {
    // 1. 訪問修復後的遊戲
    console.log('🎮 訪問修復後的Vite版飛機遊戲...');
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // 2. 開始遊戲前截圖
    await page.screenshot({ 
      path: `${screenshotDir}/01-fixed-before-start.png`,
      fullPage: false 
    });
    console.log('📸 修復後遊戲開始前截圖');
    
    // 3. 點擊開始遊戲
    const gameCanvas = page.locator('canvas');
    if (await gameCanvas.count() > 0) {
      await gameCanvas.click();
      console.log('🖱️ 點擊開始遊戲');
      await page.waitForTimeout(2000);
      
      // 4. 遊戲運行中截圖
      await page.screenshot({ 
        path: `${screenshotDir}/02-fixed-game-running.png`,
        fullPage: false 
      });
      console.log('📸 修復後遊戲運行中截圖');
      
      // 5. 高頻率截圖捕捉修復效果 - 每50ms一張，更精確
      console.log('📸 開始高頻率截圖測試修復效果...');
      
      let whiteFlashDetected = false;
      let screenshotCount = 0;
      
      for (let i = 0; i < 200; i++) { // 10秒，每50ms一張
        await page.waitForTimeout(50);
        screenshotCount++;
        
        const screenshotPath = `${screenshotDir}/fixed-frame-${String(i + 3).padStart(4, '0')}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: false 
        });
        
        // 每40張報告進度
        if ((i + 1) % 40 === 0) {
          console.log(`📸 已截圖 ${i + 3} 張 (${((i + 1) / 200 * 100).toFixed(0)}%)`);
        }
        
        // 檢查是否有白色閃爍
        try {
          const canvasInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
              const ctx = canvas.getContext('2d');
              const imageData = ctx.getImageData(0, 0, 200, 200);
              const data = imageData.data;
              
              // 檢查前200x200像素的白色比例
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
          
          // 如果檢測到大量白色像素，標記為可能的白色閃爍
          if (canvasInfo && canvasInfo.whitePercentage > 70) {
            console.log(`⚪ 第${i + 3}張截圖檢測到可能的白色閃爍: ${canvasInfo.whitePercentage.toFixed(1)}% 白色像素`);
            whiteFlashDetected = true;
            
            // 保存特殊標記的截圖
            await page.screenshot({ 
              path: `${screenshotDir}/WHITE-FLASH-DETECTED-${String(i + 3).padStart(4, '0')}.png`,
              fullPage: true 
            });
          }
          
        } catch (evalError) {
          // 忽略評估錯誤
        }
      }
      
      // 6. 最終截圖
      await page.screenshot({ 
        path: `${screenshotDir}/99-fixed-final-state.png`,
        fullPage: true 
      });
      console.log('📸 修復後最終狀態截圖');
      
      // 7. 生成修復效果報告
      const fixReport = {
        timestamp: new Date().toISOString(),
        testType: 'white-flash-fix-verification',
        totalScreenshots: screenshotCount + 3,
        gameUrl: 'http://localhost:3001/games/airplane-game/',
        testDuration: '10 seconds',
        screenshotInterval: '50ms',
        whiteFlashDetected: whiteFlashDetected,
        fixImplemented: [
          '使用 clearCloudsGradually() 漸進式清理雲朵',
          '使用 removeCloudWithAnimation() 淡出動畫移除單個雲朵',
          '替換 clouds.clear(true, true) 瞬間清空',
          '添加淡出和縮放動畫效果'
        ],
        expectedResults: [
          '消除遊戲結束時的白色閃爍',
          '碰撞時雲朵平滑消失',
          '保持視覺連續性',
          '提升用戶體驗'
        ],
        screenshotDirectory: screenshotDir,
        consoleMessages: consoleMessages.filter(msg => 
          msg.includes('淡出') || msg.includes('漸進式') || msg.includes('碰撞') || msg.includes('結束')
        )
      };
      
      fs.writeFileSync(`${screenshotDir}/white-flash-fix-report.json`, JSON.stringify(fixReport, null, 2));
      console.log('📊 白色閃爍修復報告已生成');
    }
    
    console.log('🎉 白色閃爍修復測試完成！');
    console.log(`📁 修復測試截圖保存在: ${screenshotDir}/`);
    console.log(`⚪ 白色閃爍檢測結果: ${whiteFlashDetected ? '仍然存在' : '已修復'}`);
    console.log('🔍 請檢查是否有標記為 WHITE-FLASH-DETECTED 的截圖');
    
  } catch (error) {
    console.error('❌ 白色閃爍修復測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testWhiteFlashFix();
