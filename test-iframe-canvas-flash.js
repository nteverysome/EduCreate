// 專門測試 iframe 內 Canvas 的白色閃爍問題
const { chromium } = require('playwright');
const fs = require('fs');

async function testIframeCanvasFlash() {
  console.log('🖼️ 專門測試 iframe 內 Canvas 的白色閃爍問題...');
  
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
  
  // 創建 iframe Canvas 測試截圖目錄
  const screenshotDir = 'iframe-canvas-flash-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  try {
    // 1. 訪問遊戲切換器
    console.log('🎮 訪問遊戲切換器...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. 點擊切換遊戲
    const switchButton = page.locator('text=切換遊戲');
    if (await switchButton.count() > 0) {
      await switchButton.click();
      await page.waitForTimeout(1000);
      
      // 3. 點擊 Vite 版遊戲
      const viteButton = page.locator('button:has-text("Vite")').first();
      if (await viteButton.count() > 0) {
        console.log('🖱️ 點擊 Vite 版遊戲...');
        await viteButton.click();
        await page.waitForTimeout(5000);
        
        // 4. 獲取 iframe 並切換到其內容
        const iframe = page.locator('iframe').first();
        const iframeCount = await iframe.count();
        console.log(`🔍 iframe 數量: ${iframeCount}`);
        
        if (iframeCount > 0) {
          // 5. 獲取 iframe 的 frame 對象
          const frame = await iframe.contentFrame();
          if (frame) {
            console.log('✅ 成功獲取 iframe 內容框架');
            
            // 6. 在 iframe 內點擊開始遊戲
            await frame.click('canvas');
            await page.waitForTimeout(3000);
            console.log('🖱️ 在 iframe 內點擊開始遊戲');
            
            // 7. 監控 iframe 內的控制台消息
            const iframeMessages = [];
            frame.on('console', msg => {
              const message = `iframe: ${msg.type()}: ${msg.text()}`;
              iframeMessages.push(message);
              
              if (message.includes('碰撞') || message.includes('錯誤') || message.includes('正確')) {
                console.log(`🔍 iframe 內碰撞: ${message}`);
              }
            });
            
            // 8. 專門測試 iframe 內的錯誤碰撞
            console.log('❌ 開始在 iframe 內測試錯誤碰撞...');
            
            let collisionCount = 0;
            let whiteFlashDetected = false;
            
            // 在 iframe 內進行移動
            for (let i = 0; i < 100; i++) {
              // 在 iframe 內按鍵
              await frame.keyboard.press(Math.random() > 0.5 ? 'ArrowUp' : 'ArrowDown');
              await page.waitForTimeout(200);
              
              // 每10次移動檢查一次
              if (i % 10 === 0) {
                // 截圖整個頁面（包含 iframe）
                await page.screenshot({ 
                  path: `${screenshotDir}/iframe-test-${String(i + 1).padStart(3, '0')}.png`,
                  fullPage: false 
                });
                
                // 檢查 iframe 內的 Canvas 是否有白色閃爍
                try {
                  const canvasInfo = await frame.evaluate(() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                      const data = imageData.data;
                      
                      // 檢查整個 Canvas 的白色比例
                      let whitePixels = 0;
                      let totalPixels = 0;
                      
                      for (let j = 0; j < data.length; j += 4) {
                        const r = data[j];
                        const g = data[j + 1];
                        const b = data[j + 2];
                        const a = data[j + 3];
                        
                        if (a > 0) { // 只計算不透明的像素
                          totalPixels++;
                          if (r > 240 && g > 240 && b > 240) {
                            whitePixels++;
                          }
                        }
                      }
                      
                      return {
                        canvasWidth: canvas.width,
                        canvasHeight: canvas.height,
                        totalPixels: totalPixels,
                        whitePixels: whitePixels,
                        whitePercentage: totalPixels > 0 ? (whitePixels / totalPixels) * 100 : 0
                      };
                    }
                    return null;
                  });
                  
                  if (canvasInfo) {
                    console.log(`📊 Canvas 狀態: ${canvasInfo.canvasWidth}x${canvasInfo.canvasHeight}, 白色像素: ${canvasInfo.whitePercentage.toFixed(1)}%`);
                    
                    // 如果檢測到大量白色像素，標記為白色閃爍
                    if (canvasInfo.whitePercentage > 30) {
                      console.log(`⚪ 檢測到 iframe Canvas 白色閃爍: ${canvasInfo.whitePercentage.toFixed(1)}% 白色像素`);
                      whiteFlashDetected = true;
                      
                      // 保存特殊標記的截圖
                      await page.screenshot({ 
                        path: `${screenshotDir}/IFRAME-CANVAS-WHITE-FLASH-${String(i + 1).padStart(3, '0')}.png`,
                        fullPage: true 
                      });
                    }
                  }
                  
                } catch (evalError) {
                  console.log(`⚠️ Canvas 檢查錯誤: ${evalError.message}`);
                }
              }
              
              // 檢查是否有碰撞消息
              const recentMessages = iframeMessages.slice(-3);
              const hasCollision = recentMessages.some(msg => 
                msg.includes('碰撞') && (msg.includes('正確') || msg.includes('錯誤'))
              );
              
              if (hasCollision) {
                collisionCount++;
                console.log(`🎯 檢測到第 ${collisionCount} 次碰撞`);
                
                // 碰撞後立即截圖
                await page.screenshot({ 
                  path: `${screenshotDir}/collision-${collisionCount}-immediate.png`,
                  fullPage: false 
                });
                
                // 碰撞後連續截圖檢查閃爍
                for (let k = 0; k < 5; k++) {
                  await page.waitForTimeout(100);
                  await page.screenshot({ 
                    path: `${screenshotDir}/collision-${collisionCount}-after-${k + 1}.png`,
                    fullPage: false 
                  });
                }
              }
              
              // 如果已經有足夠的碰撞樣本，提前結束
              if (collisionCount >= 5) {
                console.log('✅ 已收集足夠的碰撞樣本');
                break;
              }
            }
            
            // 9. 最終截圖
            await page.screenshot({ 
              path: `${screenshotDir}/99-iframe-canvas-final.png`,
              fullPage: true 
            });
            console.log('📸 iframe Canvas 測試最終截圖');
            
            // 10. 生成 iframe Canvas 測試報告
            const iframeCanvasReport = {
              timestamp: new Date().toISOString(),
              testType: 'iframe-canvas-white-flash-test',
              gameUrl: 'http://localhost:3000/games/switcher (Vite iframe)',
              collisionCount: collisionCount,
              whiteFlashDetected: whiteFlashDetected,
              findings: [
                '專門測試 iframe 內 Canvas 的白色閃爍',
                '直接檢查 iframe 內的 Canvas 像素數據',
                '監控碰撞前後的 Canvas 狀態變化',
                '捕捉人眼可能看到但自動化測試難以檢測的閃爍'
              ],
              screenshotDirectory: screenshotDir,
              iframeMessages: iframeMessages.filter(msg => 
                msg.includes('碰撞') || msg.includes('錯誤') || msg.includes('正確')
              )
            };
            
            fs.writeFileSync(`${screenshotDir}/iframe-canvas-test-report.json`, JSON.stringify(iframeCanvasReport, null, 2));
            console.log('📊 iframe Canvas 測試報告已生成');
            
            console.log('\n🎯 iframe Canvas 測試結果：');
            console.log(`🎮 碰撞次數: ${collisionCount}`);
            console.log(`⚪ 白色閃爍檢測: ${whiteFlashDetected ? '檢測到' : '未檢測到'}`);
          } else {
            console.log('❌ 無法獲取 iframe 內容框架');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ iframe Canvas 測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testIframeCanvasFlash();
