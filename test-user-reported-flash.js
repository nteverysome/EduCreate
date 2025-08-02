// 測試用戶報告的白色閃爍問題：正確碰撞不會，錯誤碰撞會
const { chromium } = require('playwright');
const fs = require('fs');

async function testUserReportedFlash() {
  console.log('🔍 測試用戶報告的白色閃爍問題...');
  console.log('📝 用戶反饋：碰到正確的不會，碰到錯誤的還是一樣');
  
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
  
  // 創建用戶報告測試截圖目錄
  const screenshotDir = 'user-reported-flash-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  // 監控控制台消息，區分正確和錯誤碰撞
  const consoleMessages = [];
  const correctCollisions = [];
  const incorrectCollisions = [];
  
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    // 分類碰撞類型
    if (message.includes('✅ 正確碰撞')) {
      correctCollisions.push(message);
      console.log(`✅ 正確碰撞記錄: ${message}`);
    } else if (message.includes('❌ 錯誤碰撞')) {
      incorrectCollisions.push(message);
      console.log(`❌ 錯誤碰撞記錄: ${message}`);
    }
  });
  
  try {
    // 1. 訪問遊戲切換器中的 Vite 版遊戲
    console.log('🎮 訪問遊戲切換器中的 Vite 版遊戲...');
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
        
        // 4. 檢查 iframe 是否載入
        const iframe = page.locator('iframe');
        const iframeCount = await iframe.count();
        console.log(`🔍 iframe 數量: ${iframeCount}`);
        
        if (iframeCount > 0) {
          // 5. 點擊 iframe 開始遊戲
          await iframe.click();
          await page.waitForTimeout(3000);
          
          // 6. 開始遊戲前截圖
          await page.screenshot({ 
            path: `${screenshotDir}/01-game-started.png`,
            fullPage: false 
          });
          console.log('📸 遊戲開始截圖');
          
          // 7. 專門測試用戶報告的問題
          console.log('🎯 開始專門測試用戶報告的問題...');
          console.log('📝 預期：正確碰撞不會閃爍，錯誤碰撞會閃爍');
          
          let correctCount = 0;
          let incorrectCount = 0;
          let whiteFlashOnCorrect = false;
          let whiteFlashOnIncorrect = false;
          
          // 進行長時間測試，捕捉正確和錯誤碰撞
          for (let i = 0; i < 200; i++) {
            // 隨機移動增加碰撞機會
            const moveDirection = Math.random() > 0.5 ? 'ArrowUp' : 'ArrowDown';
            await page.keyboard.press(moveDirection);
            await page.waitForTimeout(150);
            
            // 檢查最近的碰撞
            const recentMessages = consoleMessages.slice(-5);
            const hasCorrectCollision = recentMessages.some(msg => 
              msg.includes('✅ 正確碰撞') && !msg.includes('記錄')
            );
            const hasIncorrectCollision = recentMessages.some(msg => 
              msg.includes('❌ 錯誤碰撞') && !msg.includes('記錄')
            );
            
            // 如果有碰撞，立即檢查白色閃爍
            if (hasCorrectCollision || hasIncorrectCollision) {
              const collisionType = hasCorrectCollision ? 'correct' : 'incorrect';
              
              if (hasCorrectCollision) correctCount++;
              if (hasIncorrectCollision) incorrectCount++;
              
              console.log(`🎯 檢測到${collisionType === 'correct' ? '正確' : '錯誤'}碰撞，立即檢查白色閃爍...`);
              
              // 碰撞後立即高頻率截圖檢查白色閃爍
              for (let j = 0; j < 10; j++) {
                await page.waitForTimeout(50); // 每50ms一張
                
                const screenshotPath = `${screenshotDir}/${collisionType}-collision-${correctCount + incorrectCount}-frame-${j + 1}.png`;
                await page.screenshot({ 
                  path: screenshotPath,
                  fullPage: false 
                });
                
                // 檢查白色閃爍
                try {
                  const canvasInfo = await page.evaluate(() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe && iframe.contentDocument) {
                      const canvas = iframe.contentDocument.querySelector('canvas');
                      if (canvas) {
                        const ctx = canvas.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, 500, 500);
                        const data = imageData.data;
                        
                        // 檢查前500x500像素的白色比例
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
                    }
                    return null;
                  });
                  
                  // 如果檢測到大量白色像素，標記為白色閃爍
                  if (canvasInfo && canvasInfo.whitePercentage > 50) {
                    console.log(`⚪ ${collisionType === 'correct' ? '正確' : '錯誤'}碰撞後第${j + 1}張截圖檢測到白色閃爍: ${canvasInfo.whitePercentage.toFixed(1)}% 白色像素`);
                    
                    if (collisionType === 'correct') {
                      whiteFlashOnCorrect = true;
                    } else {
                      whiteFlashOnIncorrect = true;
                    }
                    
                    // 保存特殊標記的截圖
                    await page.screenshot({ 
                      path: `${screenshotDir}/WHITE-FLASH-${collisionType.toUpperCase()}-${correctCount + incorrectCount}-${j + 1}.png`,
                      fullPage: true 
                    });
                  }
                  
                } catch (evalError) {
                  // 忽略評估錯誤
                }
              }
            }
            
            // 每50次移動報告進度
            if ((i + 1) % 50 === 0) {
              console.log(`📊 進度: ${i + 1}/200, 正確碰撞: ${correctCount}, 錯誤碰撞: ${incorrectCount}`);
            }
            
            // 如果已經有足夠的碰撞樣本，可以提前結束
            if (correctCount >= 5 && incorrectCount >= 5) {
              console.log('✅ 已收集足夠的碰撞樣本，提前結束測試');
              break;
            }
          }
          
          // 8. 最終截圖
          await page.screenshot({ 
            path: `${screenshotDir}/99-final-state.png`,
            fullPage: true 
          });
          console.log('📸 最終狀態截圖');
          
          // 9. 生成用戶報告驗證報告
          const userReportVerification = {
            timestamp: new Date().toISOString(),
            testType: 'user-reported-flash-verification',
            userFeedback: '碰到正確的不會，碰到錯誤的還是一樣',
            testResults: {
              correctCollisions: correctCount,
              incorrectCollisions: incorrectCount,
              whiteFlashOnCorrect: whiteFlashOnCorrect,
              whiteFlashOnIncorrect: whiteFlashOnIncorrect
            },
            verification: {
              userReportAccurate: whiteFlashOnCorrect === false && whiteFlashOnIncorrect === true,
              correctCollisionsBehavior: whiteFlashOnCorrect ? '有白色閃爍' : '無白色閃爍',
              incorrectCollisionsBehavior: whiteFlashOnIncorrect ? '有白色閃爍' : '無白色閃爍'
            },
            screenshotDirectory: screenshotDir,
            correctCollisionMessages: correctCollisions,
            incorrectCollisionMessages: incorrectCollisions
          };
          
          fs.writeFileSync(`${screenshotDir}/user-report-verification.json`, JSON.stringify(userReportVerification, null, 2));
          console.log('📊 用戶報告驗證報告已生成');
          
          // 10. 輸出結果
          console.log('\n🎯 用戶報告驗證結果：');
          console.log(`✅ 正確碰撞次數: ${correctCount}`);
          console.log(`❌ 錯誤碰撞次數: ${incorrectCount}`);
          console.log(`⚪ 正確碰撞白色閃爍: ${whiteFlashOnCorrect ? '檢測到' : '未檢測到'}`);
          console.log(`⚪ 錯誤碰撞白色閃爍: ${whiteFlashOnIncorrect ? '檢測到' : '未檢測到'}`);
          console.log(`📝 用戶報告準確性: ${userReportVerification.verification.userReportAccurate ? '準確' : '不準確'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 用戶報告測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testUserReportedFlash();
