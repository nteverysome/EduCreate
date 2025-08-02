import { test, expect } from '@playwright/test';

test('遊戲容器尺寸分析與裁切問題檢測', async ({ page }) => {
  console.log('🔍 開始分析遊戲容器尺寸與裁切問題');

  // 導航到飛機遊戲頁面
  await page.goto('http://localhost:3000/games/airplane');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  console.log('✅ 飛機遊戲頁面載入完成');

  // 1. 截圖：當前狀態
  await page.screenshot({ 
    path: 'test-results/game-container-current-size.png',
    fullPage: true
  });

  // 2. 測量當前遊戲容器尺寸
  const currentContainerInfo = await page.evaluate(() => {
    const gameContainer = document.querySelector('.bg-gray-50.rounded-lg.overflow-hidden');
    const iframe = document.querySelector('iframe');
    
    if (gameContainer && iframe) {
      const containerRect = gameContainer.getBoundingClientRect();
      const iframeRect = iframe.getBoundingClientRect();
      
      return {
        container: {
          width: containerRect.width,
          height: containerRect.height,
          visible: containerRect.width > 0 && containerRect.height > 0
        },
        iframe: {
          width: iframeRect.width,
          height: iframeRect.height,
          visible: iframeRect.width > 0 && iframeRect.height > 0
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }
    return null;
  });

  console.log('📏 當前容器尺寸:', JSON.stringify(currentContainerInfo, null, 2));

  // 3. 檢查是否有裁切問題
  const hasClipping = currentContainerInfo && (
    currentContainerInfo.iframe.width > currentContainerInfo.container.width ||
    currentContainerInfo.iframe.height > currentContainerInfo.container.height
  );

  console.log(`🔍 裁切問題檢測: ${hasClipping ? '❌ 發現裁切' : '✅ 無裁切'}`);

  // 4. 測試不同的容器尺寸
  const testSizes = [
    { name: '當前尺寸', width: 'auto', height: 'auto' },
    { name: '放大10%', width: '110%', height: '110%' },
    { name: '放大20%', width: '120%', height: '120%' },
    { name: '放大30%', width: '130%', height: '130%' },
    { name: '固定1400px', width: '1400px', height: '750px' },
    { name: '固定1500px', width: '1500px', height: '800px' }
  ];

  for (const size of testSizes) {
    console.log(`📐 測試尺寸: ${size.name}`);
    
    // 調整容器尺寸
    await page.evaluate((sizeConfig) => {
      const gameContainer = document.querySelector('.bg-gray-50.rounded-lg.overflow-hidden') as HTMLElement;
      if (gameContainer) {
        if (sizeConfig.width !== 'auto') {
          gameContainer.style.width = sizeConfig.width;
        }
        if (sizeConfig.height !== 'auto') {
          gameContainer.style.height = sizeConfig.height;
        }
        gameContainer.style.overflow = 'visible'; // 暫時移除 overflow hidden 來檢查裁切
      }
    }, size);

    await page.waitForTimeout(1000);

    // 截圖
    const filename = `game-container-size-${size.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    await page.screenshot({ 
      path: `test-results/${filename}`,
      fullPage: true
    });

    // 測量調整後的尺寸
    const adjustedInfo = await page.evaluate(() => {
      const gameContainer = document.querySelector('.bg-gray-50.rounded-lg.overflow-hidden');
      const iframe = document.querySelector('iframe');
      
      if (gameContainer && iframe) {
        const containerRect = gameContainer.getBoundingClientRect();
        const iframeRect = iframe.getBoundingClientRect();
        
        return {
          container: {
            width: Math.round(containerRect.width),
            height: Math.round(containerRect.height)
          },
          iframe: {
            width: Math.round(iframeRect.width),
            height: Math.round(iframeRect.height)
          },
          clipping: {
            horizontal: iframeRect.width > containerRect.width,
            vertical: iframeRect.height > containerRect.height,
            overflowX: Math.max(0, iframeRect.width - containerRect.width),
            overflowY: Math.max(0, iframeRect.height - containerRect.height)
          }
        };
      }
      return null;
    });

    console.log(`📊 ${size.name} 結果:`, JSON.stringify(adjustedInfo, null, 2));
  }

  // 5. 恢復原始狀態
  await page.evaluate(() => {
    const gameContainer = document.querySelector('.bg-gray-50.rounded-lg.overflow-hidden') as HTMLElement;
    if (gameContainer) {
      gameContainer.style.width = '';
      gameContainer.style.height = '';
      gameContainer.style.overflow = 'hidden';
    }
  });

  // 6. 最終建議截圖
  await page.screenshot({ 
    path: 'test-results/game-container-final-comparison.png',
    fullPage: true
  });

  console.log('✅ 遊戲容器尺寸分析完成');
});
