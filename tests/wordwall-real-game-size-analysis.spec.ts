/**
 * Wordwall 真實遊戲尺寸分析
 * 分析實際 Wordwall 遊戲頁面的容器尺寸，以遊戲為核心的合理排版
 */

import { test, expect } from '@playwright/test';

test.describe('🎮 Wordwall 真實遊戲尺寸分析', () => {
  test('分析 Wordwall 實際遊戲頁面的容器尺寸', async ({ page }) => {
    console.log('🔍 開始分析 Wordwall 真實遊戲頁面尺寸');
    
    // 導航到用戶提供的 Wordwall 遊戲頁面
    const wordwallURL = 'https://wordwall.net/tc/resource/94747789/%e5%81%a5%e5%ba%b7/%e5%9c%8b%e5%b0%8f%e5%8d%97%e4%b8%80%e4%b8%89%e5%b9%b4%e7%b4%9a%e8%8b%b1%e6%96%87%e7%ac%ac2%e8%aa%b2';
    
    try {
      await page.goto(wordwallURL, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('✅ Wordwall 遊戲頁面載入完成');
      
      // 等待頁面完全載入
      await page.waitForTimeout(5000);
      
      // 截圖：完整頁面
      await page.screenshot({ 
        path: 'test-results/wordwall-real-game-full-page.png',
        fullPage: true 
      });
      
      // 分析頁面結構和遊戲容器
      const pageAnalysis = await page.evaluate(() => {
        // 查找可能的遊戲容器
        const gameContainers = [
          document.querySelector('#game-container'),
          document.querySelector('.game-container'),
          document.querySelector('[id*="game"]'),
          document.querySelector('[class*="game"]'),
          document.querySelector('canvas'),
          document.querySelector('iframe'),
          document.querySelector('.activity-container'),
          document.querySelector('[class*="activity"]'),
          document.querySelector('.main-content'),
          document.querySelector('#main'),
          document.querySelector('.content')
        ].filter(el => el !== null);
        
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };
        
        const containers = gameContainers.map((container, index) => {
          if (!container) return null;
          
          const rect = container.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(container);
          
          return {
            index,
            tagName: container.tagName,
            id: container.id || '',
            className: container.className || '',
            dimensions: {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              top: Math.round(rect.top),
              left: Math.round(rect.left)
            },
            cssStyles: {
              width: computedStyle.width,
              height: computedStyle.height,
              maxWidth: computedStyle.maxWidth,
              maxHeight: computedStyle.maxHeight,
              position: computedStyle.position,
              display: computedStyle.display
            },
            visible: rect.width > 0 && rect.height > 0,
            area: rect.width * rect.height
          };
        }).filter(container => container !== null);
        
        // 找到最大的可見容器（可能是主遊戲區域）
        const largestContainer = containers
          .filter(c => c.visible && c.area > 10000) // 過濾掉太小的元素
          .sort((a, b) => b.area - a.area)[0];
        
        return {
          viewport,
          containers,
          largestContainer,
          totalContainers: containers.length
        };
      });
      
      console.log('📊 頁面分析結果:', JSON.stringify(pageAnalysis, null, 2));
      
      // 特別關注最大的容器（可能是遊戲主區域）
      if (pageAnalysis.largestContainer) {
        const mainContainer = pageAnalysis.largestContainer;
        console.log('🎯 主要遊戲容器信息:');
        console.log(`   📐 尺寸: ${mainContainer.dimensions.width} x ${mainContainer.dimensions.height}`);
        console.log(`   📍 位置: top=${mainContainer.dimensions.top}, left=${mainContainer.dimensions.left}`);
        console.log(`   🏷️ 標籤: ${mainContainer.tagName}`);
        console.log(`   🆔 ID: ${mainContainer.id}`);
        console.log(`   📝 Class: ${mainContainer.className}`);
        console.log(`   📏 面積: ${mainContainer.area} 平方像素`);
      }
      
      // 分析頁面佈局結構
      const layoutAnalysis = await page.evaluate(() => {
        const body = document.body;
        const bodyRect = body.getBoundingClientRect();
        
        // 查找主要內容區域
        const mainContentSelectors = [
          'main',
          '.main',
          '.content',
          '.main-content',
          '.game-area',
          '.activity-area',
          '#content',
          '#main-content'
        ];
        
        let mainContent = null;
        for (const selector of mainContentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              mainContent = {
                selector,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                area: rect.width * rect.height
              };
              break;
            }
          }
        }
        
        return {
          bodyDimensions: {
            width: Math.round(bodyRect.width),
            height: Math.round(bodyRect.height)
          },
          mainContent,
          documentDimensions: {
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight
          }
        };
      });
      
      console.log('🏗️ 佈局分析結果:', JSON.stringify(layoutAnalysis, null, 2));
      
      // 截圖：聚焦在主要遊戲區域
      if (pageAnalysis.largestContainer) {
        const container = pageAnalysis.largestContainer;
        await page.screenshot({
          path: 'test-results/wordwall-real-game-main-area.png',
          clip: {
            x: container.dimensions.left,
            y: container.dimensions.top,
            width: container.dimensions.width,
            height: container.dimensions.height
          }
        });
      }
      
      // 生成尺寸建議
      const sizeRecommendation = (() => {
        if (pageAnalysis.largestContainer) {
          const container = pageAnalysis.largestContainer;
          const { width, height } = container.dimensions;
          
          // 建議的遊戲容器尺寸（以遊戲為核心）
          const recommendedWidth = Math.max(width, 1600); // 至少 1600px 寬
          const recommendedHeight = Math.max(height, 900); // 至少 900px 高
          
          return {
            current: { width, height },
            recommended: { 
              width: recommendedWidth, 
              height: recommendedHeight 
            },
            aspectRatio: (recommendedWidth / recommendedHeight).toFixed(2),
            improvement: {
              widthIncrease: recommendedWidth - 1400,
              heightIncrease: recommendedHeight - 750,
              areaIncrease: ((recommendedWidth * recommendedHeight) / (1400 * 750) - 1) * 100
            }
          };
        }
        return null;
      })();
      
      console.log('💡 尺寸建議:', JSON.stringify(sizeRecommendation, null, 2));
      
      // 最終報告
      const finalReport = {
        analysis: {
          wordwallURL,
          viewport: pageAnalysis.viewport,
          mainGameContainer: pageAnalysis.largestContainer,
          layoutInfo: layoutAnalysis
        },
        recommendations: sizeRecommendation,
        summary: {
          currentStandard: '1400x750 (太小)',
          recommendedSize: sizeRecommendation ? 
            `${sizeRecommendation.recommended.width}x${sizeRecommendation.recommended.height}` : 
            '無法確定',
          reasoning: '以遊戲為核心，提供更大的遊戲區域以改善用戶體驗'
        }
      };
      
      console.log('📋 最終分析報告:', JSON.stringify(finalReport, null, 2));
      
      // 驗證分析結果
      expect(pageAnalysis.totalContainers).toBeGreaterThan(0);
      if (pageAnalysis.largestContainer) {
        expect(pageAnalysis.largestContainer.dimensions.width).toBeGreaterThan(0);
        expect(pageAnalysis.largestContainer.dimensions.height).toBeGreaterThan(0);
      }
      
      console.log('🎉 Wordwall 真實遊戲尺寸分析完成');
      
    } catch (error) {
      console.error('❌ 分析過程中出現錯誤:', error);
      
      // 即使出錯也截圖記錄
      await page.screenshot({ 
        path: 'test-results/wordwall-real-game-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });
});
