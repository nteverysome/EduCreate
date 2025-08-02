import { test, expect } from '@playwright/test';

/**
 * 使用 MCP Playwright 工具檢測 Wordwall 遊戲容器尺寸
 */

test.describe('MCP Wordwall 容器尺寸檢測', () => {
  
  test('使用 MCP 檢測 Wordwall 飛機遊戲容器尺寸', async ({ page }) => {
    console.log('🔍 使用 MCP Playwright 開始檢測 Wordwall 容器尺寸...');
    
    // 設置較大的視窗
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    try {
      // 導航到 Wordwall 遊戲頁面
      console.log('🌐 正在導航到 Wordwall 頁面...');
      await page.goto('https://wordwall.net/tc/resource/94747789/%E5%81%A5%E5%BA%B7/%E5%9C%8B%E5%B0%8F%E5%8D%97%E4%B8%80%E4%B8%89%E5%B9%B4%E7%B4%9A%E8%8B%B1%E6%96%87%E7%AC%AC2%E8%AA%B2', {
        waitUntil: 'networkidle',
        timeout: 60000
      });
      
      console.log('✅ 頁面載入完成，等待遊戲初始化...');
      
      // 等待遊戲載入
      await page.waitForTimeout(5000);
      
      // 截圖整個頁面
      await page.screenshot({ 
        path: 'test-results/wordwall-mcp-full-page.png',
        fullPage: true 
      });
      console.log('📸 已截圖整個頁面');
      
      // 檢測遊戲容器尺寸
      const containerInfo = await page.evaluate(() => {
        const results = {
          timestamp: new Date().toISOString(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          gameElements: [],
          containers: [],
          recommendation: null
        };

        // 1. 檢測 Canvas 元素
        const canvases = document.querySelectorAll('canvas');
        console.log(`找到 ${canvases.length} 個 Canvas 元素`);
        
        canvases.forEach((canvas, index) => {
          const rect = canvas.getBoundingClientRect();
          const canvasInfo = {
            type: 'canvas',
            index: index,
            dimensions: {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              x: Math.round(rect.x),
              y: Math.round(rect.y)
            },
            attributes: {
              width: canvas.width,
              height: canvas.height,
              id: canvas.id,
              className: canvas.className
            },
            ratio: (rect.width / rect.height).toFixed(2)
          };
          
          results.gameElements.push(canvasInfo);
        });

        // 2. 檢測 iframe 元素
        const iframes = document.querySelectorAll('iframe');
        console.log(`找到 ${iframes.length} 個 iframe 元素`);
        
        iframes.forEach((iframe, index) => {
          const rect = iframe.getBoundingClientRect();
          const iframeInfo = {
            type: 'iframe',
            index: index,
            dimensions: {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              x: Math.round(rect.x),
              y: Math.round(rect.y)
            },
            attributes: {
              src: iframe.src,
              id: iframe.id,
              className: iframe.className
            },
            ratio: (rect.width / rect.height).toFixed(2)
          };
          
          results.gameElements.push(iframeInfo);
        });

        // 3. 檢測可能的遊戲容器
        const gameSelectors = [
          '[id*="game"]',
          '[class*="game"]',
          '[id*="activity"]',
          '[class*="activity"]',
          '[id*="phaser"]',
          '[class*="phaser"]'
        ];

        gameSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            
            if (rect.width > 300 && rect.height > 200) {
              const containerInfo = {
                type: 'container',
                selector: selector,
                index: index,
                dimensions: {
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                  x: Math.round(rect.x),
                  y: Math.round(rect.y)
                },
                attributes: {
                  id: element.id,
                  className: element.className,
                  tagName: element.tagName
                },
                ratio: (rect.width / rect.height).toFixed(2)
              };
              
              results.containers.push(containerInfo);
            }
          });
        });

        // 4. 檢測所有大型元素
        const allElements = document.querySelectorAll('*');
        const largeElements = [];
        
        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 500 && rect.height > 400) {
            largeElements.push({
              tag: el.tagName,
              id: el.id,
              className: el.className,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              ratio: (rect.width / rect.height).toFixed(2)
            });
          }
        });

        // 5. 生成推薦尺寸
        const allGameElements = [...results.gameElements, ...results.containers];
        if (allGameElements.length > 0) {
          // 找到最大的元素作為主要遊戲容器
          const largestElement = allGameElements.reduce((largest, current) => {
            const currentArea = current.dimensions.width * current.dimensions.height;
            const largestArea = largest.dimensions.width * largest.dimensions.height;
            return currentArea > largestArea ? current : largest;
          });
          
          results.recommendation = {
            width: largestElement.dimensions.width,
            height: largestElement.dimensions.height,
            ratio: largestElement.ratio,
            source: `${largestElement.type} element`
          };
        }

        return {
          ...results,
          largeElements: largeElements
        };
      });
      
      console.log('📊 MCP 檢測結果:');
      console.log('==================');
      console.log(`🖥️ 視窗尺寸: ${containerInfo.viewport.width}x${containerInfo.viewport.height}`);
      
      if (containerInfo.gameElements.length > 0) {
        console.log('🎮 遊戲元素:');
        containerInfo.gameElements.forEach(element => {
          console.log(`  ${element.type}: ${element.dimensions.width}x${element.dimensions.height} (比例 ${element.ratio}:1)`);
        });
      }
      
      if (containerInfo.containers.length > 0) {
        console.log('📦 容器元素:');
        containerInfo.containers.forEach(container => {
          console.log(`  ${container.selector}: ${container.dimensions.width}x${container.dimensions.height} (比例 ${container.ratio}:1)`);
        });
      }
      
      if (containerInfo.largeElements.length > 0) {
        console.log('📏 大型元素:');
        containerInfo.largeElements.forEach(element => {
          console.log(`  ${element.tag}: ${element.width}x${element.height} (比例 ${element.ratio}:1)`);
        });
      }
      
      if (containerInfo.recommendation) {
        console.log('🎯 推薦的遊戲容器尺寸:');
        console.log(`   寬度: ${containerInfo.recommendation.width}px`);
        console.log(`   高度: ${containerInfo.recommendation.height}px`);
        console.log(`   比例: ${containerInfo.recommendation.ratio}:1`);
        console.log(`   來源: ${containerInfo.recommendation.source}`);
        
        // 檢查比例類型
        const ratio = parseFloat(containerInfo.recommendation.ratio);
        if (Math.abs(ratio - 16/9) < 0.1) {
          console.log('   📺 接近 16:9 比例 (寬螢幕)');
        } else if (Math.abs(ratio - 4/3) < 0.1) {
          console.log('   📺 接近 4:3 比例 (標準)');
        } else if (Math.abs(ratio - 3/2) < 0.1) {
          console.log('   📺 接近 3:2 比例');
        } else if (Math.abs(ratio - 1) < 0.1) {
          console.log('   📺 接近 1:1 比例 (正方形)');
        }
      }
      
      // 保存檢測結果到文件
      await page.evaluate((data) => {
        console.log('💾 完整檢測數據:', JSON.stringify(data, null, 2));
      }, containerInfo);
      
      // 如果找到遊戲元素，截圖該元素
      if (containerInfo.gameElements.length > 0) {
        const firstGameElement = containerInfo.gameElements[0];
        console.log(`📸 截圖遊戲元素: ${firstGameElement.type}`);
        
        // 嘗試截圖遊戲元素
        try {
          if (firstGameElement.type === 'canvas') {
            const canvas = page.locator('canvas').first();
            await canvas.screenshot({ 
              path: 'test-results/wordwall-mcp-game-element.png' 
            });
          }
        } catch (error) {
          console.log('⚠️ 截圖遊戲元素失敗:', error.message);
        }
      }
      
      // 驗證檢測結果
      expect(containerInfo.gameElements.length + containerInfo.containers.length).toBeGreaterThan(0);
      
      console.log('✅ MCP Wordwall 容器尺寸檢測完成');
      
      return containerInfo;
      
    } catch (error) {
      console.error('❌ MCP 檢測過程中發生錯誤:', error);
      
      // 截圖錯誤狀態
      await page.screenshot({ 
        path: 'test-results/wordwall-mcp-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });

});
