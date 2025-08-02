// 專門監控 DOM 和 Canvas 變化的測試
const { chromium } = require('playwright');

async function testDOMCanvasChanges() {
  console.log('🔍 專門監控 DOM 和 Canvas 變化...');
  console.log('🎯 目標：檢測錯誤碰撞時的容器狀態變化');
  
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
  
  // 監控控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    
    if (message.includes('錯誤碰撞') || message.includes('GAME_SCORE_UPDATE') || 
        message.includes('白色') || message.includes('背景') || message.includes('重載')) {
      console.log(`🔍 關鍵日誌: ${message}`);
    }
  });
  
  try {
    // 1. 訪問遊戲切換器
    console.log('🎮 訪問遊戲切換器...');
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. 點擊切換遊戲並選擇 Vite 版
    const switchButton = page.locator('text=切換遊戲');
    if (await switchButton.count() > 0) {
      await switchButton.click();
      await page.waitForTimeout(1000);
      
      const viteButton = page.locator('button:has-text("Vite")').first();
      if (await viteButton.count() > 0) {
        console.log('🖱️ 點擊 Vite 版遊戲...');
        await viteButton.click();
        await page.waitForTimeout(5000);
        
        const iframe = page.locator('iframe');
        if (await iframe.count() > 0) {
          // 3. 開始遊戲
          await iframe.click();
          await page.waitForTimeout(3000);
          console.log('🎮 遊戲已開始');
          
          // 4. 設置 DOM 變化監控
          await page.evaluate(() => {
            // 監控 iframe 的變化
            const iframe = document.querySelector('iframe');
            if (iframe) {
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.type === 'attributes') {
                    console.log('🔄 iframe 屬性變化:', mutation.attributeName, iframe.getAttribute(mutation.attributeName));
                  }
                });
              });
              
              observer.observe(iframe, {
                attributes: true,
                attributeOldValue: true
              });
              
              // 監控 iframe 的 style 變化
              const styleObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  console.log('🎨 iframe 樣式變化:', iframe.style.cssText);
                });
              });
              
              styleObserver.observe(iframe, {
                attributes: true,
                attributeFilter: ['style']
              });
            }
            
            // 監控容器的變化
            const container = document.querySelector('[style*="width: 1274px"]');
            if (container) {
              const containerObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  console.log('📦 容器變化:', mutation.type, mutation.target);
                });
              });
              
              containerObserver.observe(container, {
                attributes: true,
                childList: true,
                subtree: true
              });
            }
          });
          
          // 5. 專門測試錯誤碰撞並監控變化
          console.log('❌ 開始錯誤碰撞測試，監控 DOM 和 Canvas 變化...');
          
          let errorCollisionCount = 0;
          let domChangeCount = 0;
          
          // 進行移動直到觸發錯誤碰撞
          for (let i = 0; i < 100; i++) {
            // 快速移動增加碰撞機會
            await page.keyboard.press(Math.random() > 0.5 ? 'ArrowUp' : 'ArrowDown');
            await page.waitForTimeout(150);
            
            // 檢查是否有錯誤碰撞
            const recentMessages = consoleMessages.slice(-10);
            const hasErrorCollision = recentMessages.some(msg => 
              msg.includes('錯誤碰撞') && !msg.includes('關鍵日誌')
            );
            
            if (hasErrorCollision) {
              errorCollisionCount++;
              console.log(`❌ 檢測到第 ${errorCollisionCount} 次錯誤碰撞`);
              
              // 錯誤碰撞後立即檢查 DOM 狀態
              const domState = await page.evaluate(() => {
                const iframe = document.querySelector('iframe');
                const container = document.querySelector('[style*="width: 1274px"]');
                
                return {
                  iframeVisible: iframe ? iframe.offsetParent !== null : false,
                  iframeDisplay: iframe ? getComputedStyle(iframe).display : 'none',
                  iframeOpacity: iframe ? getComputedStyle(iframe).opacity : '0',
                  containerVisible: container ? container.offsetParent !== null : false,
                  containerDisplay: container ? getComputedStyle(container).display : 'none',
                  containerOpacity: container ? getComputedStyle(container).opacity : '0',
                  iframeSrc: iframe ? iframe.src : 'none',
                  timestamp: Date.now()
                };
              });
              
              console.log(`🔍 錯誤碰撞後 DOM 狀態:`, domState);
              
              // 檢查是否有 DOM 變化
              const domChangeMessages = recentMessages.filter(msg => 
                msg.includes('iframe 屬性變化') || msg.includes('iframe 樣式變化') || 
                msg.includes('容器變化')
              );
              
              if (domChangeMessages.length > 0) {
                domChangeCount++;
                console.log(`🔄 檢測到 DOM 變化 (第${domChangeCount}次):`, domChangeMessages);
              }
              
              // 錯誤碰撞後截圖
              await page.screenshot({ 
                path: `dom-canvas-error-${errorCollisionCount}.png`,
                fullPage: false 
              });
              
              // 等待一段時間觀察變化
              await page.waitForTimeout(500);
              
              // 再次檢查 DOM 狀態
              const domStateAfter = await page.evaluate(() => {
                const iframe = document.querySelector('iframe');
                const container = document.querySelector('[style*="width: 1274px"]');
                
                return {
                  iframeVisible: iframe ? iframe.offsetParent !== null : false,
                  iframeDisplay: iframe ? getComputedStyle(iframe).display : 'none',
                  iframeOpacity: iframe ? getComputedStyle(iframe).opacity : '0',
                  containerVisible: container ? container.offsetParent !== null : false,
                  containerDisplay: container ? getComputedStyle(container).display : 'none',
                  containerOpacity: container ? getComputedStyle(container).opacity : '0',
                  timestamp: Date.now()
                };
              });
              
              console.log(`🔍 500ms後 DOM 狀態:`, domStateAfter);
              
              // 比較前後狀態
              const hasStateChange = JSON.stringify(domState) !== JSON.stringify(domStateAfter);
              if (hasStateChange) {
                console.log(`⚠️ 檢測到 DOM 狀態變化！`);
              }
            }
            
            // 每20次移動報告進度
            if ((i + 1) % 20 === 0) {
              console.log(`📊 進度: ${i + 1}/100, 錯誤碰撞: ${errorCollisionCount}, DOM變化: ${domChangeCount}`);
            }
            
            // 如果已經有足夠的錯誤碰撞樣本，提前結束
            if (errorCollisionCount >= 5) {
              console.log('✅ 已收集足夠的錯誤碰撞樣本');
              break;
            }
          }
          
          // 6. 最終報告
          console.log('\n📊 DOM 和 Canvas 變化測試結果：');
          console.log(`❌ 錯誤碰撞次數: ${errorCollisionCount}`);
          console.log(`🔄 DOM 變化次數: ${domChangeCount}`);
          console.log(`📈 變化比例: ${errorCollisionCount > 0 ? (domChangeCount / errorCollisionCount * 100).toFixed(1) : 0}%`);
          
          // 分析控制台消息
          const domChangeMessages = consoleMessages.filter(msg => 
            msg.includes('iframe 屬性變化') || msg.includes('iframe 樣式變化') || 
            msg.includes('容器變化')
          );
          
          if (domChangeMessages.length > 0) {
            console.log('\n🔄 檢測到的 DOM 變化:');
            domChangeMessages.forEach(msg => console.log(`  ${msg}`));
          } else {
            console.log('\n✅ 沒有檢測到 DOM 變化');
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

testDOMCanvasChanges();
