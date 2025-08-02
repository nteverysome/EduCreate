// 連續截圖分析碰撞閃爍問題
const { chromium } = require('playwright');
const fs = require('fs');

async function testCollisionFlicker() {
  console.log('📸 開始連續截圖分析碰撞閃爍問題...');
  
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
  
  // 創建截圖目錄
  const screenshotDir = 'collision-analysis-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  try {
    // 1. 訪問Vite版飛機遊戲
    console.log('🎮 訪問Vite版飛機遊戲...');
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 等待遊戲完全載入
    
    console.log('📸 開始連續截圖...');
    
    // 2. 遊戲開始前截圖
    await page.screenshot({ 
      path: `${screenshotDir}/01-game-start.png`,
      fullPage: false 
    });
    console.log('✅ 截圖 1: 遊戲開始');
    
    // 3. 等待遊戲載入並開始
    await page.waitForTimeout(3000);
    
    // 4. 連續截圖捕捉碰撞過程
    console.log('🎯 開始捕捉碰撞過程...');
    
    // 模擬遊戲互動 - 點擊遊戲區域開始
    const gameCanvas = page.locator('canvas');
    if (await gameCanvas.count() > 0) {
      await gameCanvas.click();
      console.log('🖱️ 點擊遊戲開始');
      
      // 連續截圖 - 每500ms一張，持續30秒
      for (let i = 0; i < 60; i++) {
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `${screenshotDir}/frame-${String(i + 2).padStart(3, '0')}.png`,
          fullPage: false 
        });
        
        // 每10張截圖報告一次進度
        if ((i + 1) % 10 === 0) {
          console.log(`📸 已截圖 ${i + 2} 張`);
        }
        
        // 檢查是否有閃爍跡象
        try {
          // 檢查控制台錯誤
          const logs = await page.evaluate(() => {
            return window.console.logs || [];
          });
          
          // 檢查遊戲狀態
          const gameState = await page.evaluate(() => {
            return {
              hasCanvas: !!document.querySelector('canvas'),
              canvasVisible: document.querySelector('canvas')?.style.display !== 'none',
              bodyClass: document.body.className,
              gameErrors: window.gameErrors || []
            };
          });
          
          // 如果檢測到異常，記錄詳細信息
          if (!gameState.hasCanvas || !gameState.canvasVisible) {
            console.log(`⚠️ 第${i + 2}張截圖檢測到異常:`, gameState);
            
            // 額外截圖記錄異常狀態
            await page.screenshot({ 
              path: `${screenshotDir}/ANOMALY-frame-${String(i + 2).padStart(3, '0')}.png`,
              fullPage: true 
            });
          }
          
        } catch (evalError) {
          console.log(`⚠️ 第${i + 2}張截圖評估時出錯:`, evalError.message);
        }
      }
    }
    
    // 5. 最終截圖
    await page.screenshot({ 
      path: `${screenshotDir}/99-final-state.png`,
      fullPage: true 
    });
    console.log('✅ 最終截圖完成');
    
    // 6. 生成分析報告
    const analysisReport = {
      timestamp: new Date().toISOString(),
      totalScreenshots: 62,
      gameUrl: 'http://localhost:3001/games/airplane-game/',
      testDuration: '30 seconds',
      screenshotInterval: '500ms',
      purpose: '分析碰撞雲朵時的遊戲閃爍問題',
      screenshotDirectory: screenshotDir
    };
    
    fs.writeFileSync(`${screenshotDir}/analysis-report.json`, JSON.stringify(analysisReport, null, 2));
    console.log('📊 已生成分析報告');
    
    console.log('🎉 碰撞閃爍分析完成！');
    console.log(`📁 截圖保存在: ${screenshotDir}/`);
    console.log('📋 請檢查截圖序列，特別注意標記為 ANOMALY 的異常截圖');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testCollisionFlicker();
