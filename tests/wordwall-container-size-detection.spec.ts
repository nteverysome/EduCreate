import { test, expect } from '@playwright/test';

/**
 * Wordwall 遊戲容器尺寸檢測測試
 * 直接檢測 Wordwall.net 上的遊戲容器實際尺寸
 */

test.describe('Wordwall 容器尺寸檢測', () => {
  
  test('檢測 Wordwall 飛機遊戲的實際容器尺寸', async ({ page }) => {
    console.log('🔍 開始檢測 Wordwall 遊戲容器尺寸...');
    
    // 設置較大的視窗以確保完整顯示
    await page.setViewportSize({ width: 1400, height: 1000 });
    
    try {
      // 導航到 Wordwall 遊戲頁面
      await page.goto('https://wordwall.net/tc/resource/94747789/%e5%81%a5%e5%ba%b7/%e5%9c%8b%e5%b0%8f%e5%8d%97%e4%b8%80%e4%b8%89%e5%b9%b4%e7%b4%9a%e8%8b%b1%e6%96%87%e7%ac%ac2%e8%aa%b2', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log('✅ 頁面載入完成');
      
      // 等待遊戲載入
      await page.waitForTimeout(3000);
      
      // 截圖整個頁面
      await page.screenshot({ 
        path: 'test-results/wordwall-full-page.png',
        fullPage: true 
      });
      
      // 尋找可能的遊戲容器元素
      const gameSelectors = [
        'canvas',
        '[id*="game"]',
        '[class*="game"]',
        '[id*="phaser"]',
        '[class*="phaser"]',
        'iframe',
        '[class*="activity"]',
        '[id*="activity"]'
      ];
      
      console.log('🔍 搜尋遊戲容器元素...');
      
      for (const selector of gameSelectors) {
        try {
          const elements = await page.locator(selector).all();
          
          if (elements.length > 0) {
            console.log(`📦 找到 ${elements.length} 個 "${selector}" 元素`);
            
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i];
              const isVisible = await element.isVisible();
              
              if (isVisible) {
                const boundingBox = await element.boundingBox();
                
                if (boundingBox && boundingBox.width > 100 && boundingBox.height > 100) {
                  console.log(`📐 元素 ${selector}[${i}] 尺寸:`, {
                    width: Math.round(boundingBox.width),
                    height: Math.round(boundingBox.height),
                    x: Math.round(boundingBox.x),
                    y: Math.round(boundingBox.y)
                  });
                  
                  // 截圖這個元素
                  await element.screenshot({ 
                    path: `test-results/wordwall-element-${selector.replace(/[^a-zA-Z0-9]/g, '_')}-${i}.png` 
                  });
                }
              }
            }
          }
        } catch (error) {
          // 忽略找不到元素的錯誤
        }
      }
      
      // 檢查頁面的整體佈局
      const bodySize = await page.evaluate(() => {
        const body = document.body;
        return {
          scrollWidth: body.scrollWidth,
          scrollHeight: body.scrollHeight,
          clientWidth: body.clientWidth,
          clientHeight: body.clientHeight
        };
      });
      
      console.log('📄 頁面整體尺寸:', bodySize);
      
      // 檢查是否有特定的遊戲容器
      const gameContainerInfo = await page.evaluate(() => {
        // 尋找可能的遊戲容器
        const containers = [];
        
        // 檢查所有 div 元素
        const divs = document.querySelectorAll('div');
        divs.forEach((div, index) => {
          const rect = div.getBoundingClientRect();
          const style = window.getComputedStyle(div);
          
          // 如果是較大的容器且可能是遊戲區域
          if (rect.width > 300 && rect.height > 200 && 
              style.position !== 'static' || 
              div.id.includes('game') || 
              div.className.includes('game') ||
              div.className.includes('activity')) {
            
            containers.push({
              tagName: div.tagName,
              id: div.id,
              className: div.className,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              position: style.position,
              zIndex: style.zIndex
            });
          }
        });
        
        return containers;
      });
      
      console.log('🎮 找到的可能遊戲容器:', gameContainerInfo);
      
      // 如果找到容器，記錄最可能的遊戲容器尺寸
      if (gameContainerInfo.length > 0) {
        const likelyGameContainer = gameContainerInfo.find(container => 
          container.id.includes('game') || 
          container.className.includes('game') ||
          container.className.includes('activity')
        ) || gameContainerInfo[0];
        
        console.log('🎯 最可能的遊戲容器:', likelyGameContainer);
        
        // 記錄到文件
        await page.evaluate((containerInfo) => {
          console.log('Wordwall 遊戲容器尺寸檢測結果:', containerInfo);
        }, likelyGameContainer);
      }
      
    } catch (error) {
      console.error('❌ 檢測過程中發生錯誤:', error);
      
      // 即使出錯也截圖
      await page.screenshot({ 
        path: 'test-results/wordwall-error-screenshot.png',
        fullPage: true 
      });
    }
    
    console.log('✅ Wordwall 容器尺寸檢測完成');
  });
  
  test('比較不同視窗大小下的容器尺寸', async ({ page }) => {
    console.log('📱 測試響應式容器尺寸...');
    
    const viewportSizes = [
      { name: '桌面', width: 1920, height: 1080 },
      { name: '筆電', width: 1366, height: 768 },
      { name: '平板', width: 1024, height: 768 },
      { name: '手機', width: 375, height: 667 }
    ];
    
    for (const viewport of viewportSizes) {
      console.log(`📐 測試 ${viewport.name} 尺寸: ${viewport.width}x${viewport.height}`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      try {
        await page.goto('https://wordwall.net/tc/resource/94747789/%e5%81%a5%e5%ba%b7/%e5%9c%8b%e5%b0%8f%e5%8d%97%e4%b8%80%e4%b8%89%e5%b9%b4%e7%b4%9a%e8%8b%b1%e6%96%87%e7%ac%ac2%e8%aa%b2', {
          waitUntil: 'networkidle',
          timeout: 20000
        });
        
        await page.waitForTimeout(2000);
        
        // 截圖
        await page.screenshot({ 
          path: `test-results/wordwall-${viewport.name}-${viewport.width}x${viewport.height}.png`,
          fullPage: true 
        });
        
        // 檢測容器尺寸
        const containerSize = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            return {
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            };
          }
          return null;
        });
        
        if (containerSize) {
          console.log(`📊 ${viewport.name} 容器尺寸:`, containerSize);
        }
        
      } catch (error) {
        console.log(`⚠️ ${viewport.name} 測試失敗:`, error.message);
      }
    }
    
    console.log('✅ 響應式測試完成');
  });

});
