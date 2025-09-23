// 直接打開遊戲切換器頁面
const { chromium } = require('playwright');

async function openGameSwitcher() {
  console.log('🎯 正在打開遊戲切換器...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // 監聽控制台訊息
  page.on('console', msg => {
    console.log(`🔍 控制台 [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('🔴 頁面錯誤:', error.message);
  });
  
  try {
    console.log('🌐 正在訪問: http://localhost:3000/games/switcher');
    
    // 嘗試訪問本地遊戲切換器
    const response = await page.goto('http://localhost:3000/games/switcher', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    if (response && response.ok()) {
      console.log('✅ 遊戲切換器載入成功！');
      
      // 等待頁面完全載入
      await page.waitForTimeout(5000);
      
      // 檢查頁面內容
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          hasGameSwitcher: document.querySelector('[class*="game"]') !== null,
          gameElements: Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent || '';
            return text.includes('遊戲') || 
                   text.includes('Game') || 
                   text.includes('Starshake') ||
                   text.includes('starshake') ||
                   text.includes('🌟') ||
                   text.includes('太空');
          }).length
        };
      });
      
      console.log('📄 頁面資訊:');
      console.log('  標題:', pageInfo.title);
      console.log('  URL:', pageInfo.url);
      console.log('  遊戲元素:', pageInfo.gameElements, '個');
      
      // 尋找 Starshake 遊戲
      const starshakeElements = await page.$$eval('*', elements => 
        elements.filter(el => {
          const text = el.textContent || '';
          return text.includes('Starshake') || 
                 text.includes('starshake') || 
                 text.includes('太空冒險') ||
                 text.includes('🌟');
        }).map(el => ({
          tag: el.tagName,
          text: el.textContent.trim().substring(0, 100),
          clickable: el.tagName === 'BUTTON' || 
                    el.tagName === 'A' || 
                    el.onclick !== null ||
                    el.getAttribute('role') === 'button'
        }))
      );
      
      console.log('🌟 Starshake 遊戲元素:');
      if (starshakeElements.length > 0) {
        starshakeElements.forEach((element, index) => {
          console.log(`  ${index + 1}. [${element.tag}] ${element.text}`);
          if (element.clickable) console.log('     ↳ 可點擊');
        });
        
        console.log('✅ 找到 Starshake 遊戲！');
        
        // 嘗試點擊第一個 Starshake 元素
        try {
          console.log('🖱️ 嘗試點擊 Starshake 遊戲...');
          await page.click('text=Starshake');
          
          // 等待遊戲載入
          console.log('⏳ 等待遊戲載入...');
          await page.waitForTimeout(8000);
          
          // 檢查遊戲是否載入
          const gameLoaded = await page.evaluate(() => {
            return {
              hasIframe: document.querySelector('iframe') !== null,
              hasCanvas: document.querySelector('canvas') !== null,
              currentUrl: window.location.href,
              gameContainer: document.querySelector('#game-container') !== null
            };
          });
          
          console.log('🎮 遊戲載入狀態:', gameLoaded);
          
          if (gameLoaded.hasIframe || gameLoaded.hasCanvas) {
            console.log('🎉 Starshake 遊戲成功載入！');
          } else {
            console.log('⚠️ 遊戲可能還在載入中...');
          }
          
        } catch (clickError) {
          console.log('❌ 點擊失敗:', clickError.message);
        }
        
      } else {
        console.log('❌ 未找到 Starshake 遊戲元素');
        
        // 列出所有可能的遊戲選項
        const allGameElements = await page.$$eval('*', elements => 
          elements.filter(el => {
            const text = el.textContent || '';
            return (text.includes('遊戲') || text.includes('Game')) && 
                   text.length < 100;
          }).map(el => el.textContent.trim()).slice(0, 10)
        );
        
        console.log('🎮 找到的其他遊戲元素:', allGameElements);
      }
      
      // 截圖
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/success/game-switcher-opened-${timestamp}.png`,
        fullPage: true 
      });
      
      console.log('📸 遊戲切換器截圖已保存');
      
      // 保持瀏覽器開啟讓用戶查看
      console.log('🌐 瀏覽器已開啟，您可以手動操作...');
      console.log('⏳ 等待 60 秒後自動關閉，或按 Ctrl+C 立即關閉');
      
      await page.waitForTimeout(60000);
      
    } else {
      console.log('❌ 遊戲切換器載入失敗，狀態碼:', response ? response.status() : 'No response');
      
      // 嘗試訪問主頁
      console.log('🏠 嘗試訪問主頁...');
      try {
        const homeResponse = await page.goto('http://localhost:3000', {
          waitUntil: 'networkidle',
          timeout: 15000
        });
        
        if (homeResponse && homeResponse.ok()) {
          console.log('✅ 主頁可以訪問！');
          
          // 截圖主頁
          await page.screenshot({ 
            path: `EduCreate-Test-Videos/current/success/homepage-accessible.png`,
            fullPage: true 
          });
          
          console.log('📸 主頁截圖已保存');
        } else {
          console.log('❌ 主頁也無法訪問');
        }
      } catch (homeError) {
        console.log('❌ 主頁訪問錯誤:', homeError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 訪問錯誤:', error.message);
    
    // 如果本地失敗，嘗試生產環境
    console.log('🌐 嘗試訪問生產環境...');
    try {
      const prodResponse = await page.goto('https://edu-create.vercel.app/games/switcher', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      if (prodResponse && prodResponse.ok()) {
        console.log('✅ 生產環境遊戲切換器可以訪問！');
        
        await page.waitForTimeout(5000);
        
        // 截圖生產環境
        await page.screenshot({ 
          path: `EduCreate-Test-Videos/current/success/production-game-switcher.png`,
          fullPage: true 
        });
        
        console.log('📸 生產環境截圖已保存');
        console.log('⏳ 等待 60 秒後自動關閉...');
        await page.waitForTimeout(60000);
      }
    } catch (prodError) {
      console.log('❌ 生產環境也無法訪問:', prodError.message);
    }
  } finally {
    await browser.close();
    console.log('✅ 瀏覽器已關閉');
  }
}

openGameSwitcher();
