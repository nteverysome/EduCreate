// 專門測試容器消失問題
const { chromium } = require('playwright');

async function testContainerDisappear() {
  console.log('🔍 專門測試容器消失問題...');
  console.log('📝 用戶反饋：碰到錯誤的詞彙時，整個遊戲容器消失，顯示網頁背景色，然後再重新出現');
  
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
  
  // 監控所有網絡請求，看是否有重載
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString()
    });
  });
  
  // 監控頁面重載
  page.on('load', () => {
    console.log('🔄 頁面重載檢測到');
  });
  
  // 監控 iframe 變化
  let iframeCount = 0;
  const checkIframeChanges = async () => {
    const currentIframeCount = await page.locator('iframe').count();
    if (currentIframeCount !== iframeCount) {
      console.log(`🖼️ iframe 數量變化: ${iframeCount} → ${currentIframeCount}`);
      iframeCount = currentIframeCount;
    }
  };
  
  // 監控控制台消息，特別關注錯誤碰撞
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    // 顯示錯誤碰撞和消息相關日誌
    if (message.includes('錯誤碰撞') || message.includes('GAME_SCORE_UPDATE') || 
        message.includes('GAME_COMPLETE') || message.includes('消失') || 
        message.includes('重載') || message.includes('iframe')) {
      console.log(`🔍 關鍵日誌: ${message}`);
    }
  });
  
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
        
        // 4. 檢查初始 iframe 狀態
        await checkIframeChanges();
        
        const iframe = page.locator('iframe');
        if (await iframe.count() > 0) {
          // 5. 點擊開始遊戲
          await iframe.click();
          await page.waitForTimeout(3000);
          console.log('🎮 遊戲已開始');
          
          // 6. 專門測試錯誤碰撞
          console.log('❌ 開始專門測試錯誤碰撞，監控容器狀態...');
          
          let errorCollisionCount = 0;
          let containerDisappearCount = 0;
          
          // 進行多次移動，故意觸發錯誤碰撞
          for (let i = 0; i < 50; i++) {
            // 隨機移動增加碰撞機會
            const moveDirection = Math.random() > 0.5 ? 'ArrowUp' : 'ArrowDown';
            await page.keyboard.press(moveDirection);
            await page.waitForTimeout(200);
            
            // 檢查 iframe 狀態變化
            await checkIframeChanges();
            
            // 檢查是否有錯誤碰撞
            const recentMessages = consoleMessages.slice(-5);
            const hasErrorCollision = recentMessages.some(msg => 
              msg.includes('錯誤碰撞')
            );
            
            if (hasErrorCollision) {
              errorCollisionCount++;
              console.log(`❌ 檢測到第 ${errorCollisionCount} 次錯誤碰撞`);
              
              // 錯誤碰撞後立即檢查容器狀態
              try {
                const iframeVisible = await iframe.isVisible();
                const iframeCount = await iframe.count();
                
                console.log(`🔍 錯誤碰撞後容器狀態: 可見=${iframeVisible}, 數量=${iframeCount}`);
                
                if (!iframeVisible || iframeCount === 0) {
                  containerDisappearCount++;
                  console.log(`⚠️ 檢測到容器消失！第 ${containerDisappearCount} 次`);
                  
                  // 等待容器重新出現
                  let reappearTime = 0;
                  while (reappearTime < 5000) {
                    await page.waitForTimeout(100);
                    reappearTime += 100;
                    
                    const currentVisible = await iframe.isVisible();
                    const currentCount = await iframe.count();
                    
                    if (currentVisible && currentCount > 0) {
                      console.log(`✅ 容器重新出現，消失時間: ${reappearTime}ms`);
                      break;
                    }
                  }
                  
                  if (reappearTime >= 5000) {
                    console.log('❌ 容器未在5秒內重新出現');
                  }
                }
                
              } catch (error) {
                console.log(`⚠️ 檢查容器狀態時出錯: ${error.message}`);
              }
              
              // 錯誤碰撞後截圖
              await page.screenshot({ 
                path: `container-error-collision-${errorCollisionCount}.png`,
                fullPage: false 
              });
            }
            
            // 每10次移動報告進度
            if ((i + 1) % 10 === 0) {
              console.log(`📊 進度: ${i + 1}/50, 錯誤碰撞: ${errorCollisionCount}, 容器消失: ${containerDisappearCount}`);
            }
            
            // 如果已經有足夠的錯誤碰撞樣本，提前結束
            if (errorCollisionCount >= 10) {
              console.log('✅ 已收集足夠的錯誤碰撞樣本');
              break;
            }
          }
          
          // 7. 最終截圖和報告
          await page.screenshot({ 
            path: 'container-disappear-final.png',
            fullPage: true 
          });
          
          console.log('\n📊 容器消失測試結果：');
          console.log(`❌ 錯誤碰撞次數: ${errorCollisionCount}`);
          console.log(`⚠️ 容器消失次數: ${containerDisappearCount}`);
          console.log(`📈 消失比例: ${errorCollisionCount > 0 ? (containerDisappearCount / errorCollisionCount * 100).toFixed(1) : 0}%`);
          console.log(`🌐 網絡請求數量: ${networkRequests.length}`);
          
          // 檢查是否有重載相關的網絡請求
          const reloadRequests = networkRequests.filter(req => 
            req.url.includes('airplane-game') || req.url.includes('iframe')
          );
          
          if (reloadRequests.length > 1) {
            console.log('🔄 檢測到可能的重載請求:');
            reloadRequests.forEach(req => {
              console.log(`  ${req.timestamp}: ${req.method} ${req.url}`);
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

testContainerDisappear();
