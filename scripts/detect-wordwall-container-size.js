/**
 * Wordwall 容器尺寸檢測腳本
 * 在瀏覽器開發者工具的 Console 中運行此腳本
 * 
 * 使用方法:
 * 1. 打開 https://wordwall.net/tc/resource/94747789/...
 * 2. 按 F12 打開開發者工具
 * 3. 切換到 Console 標籤
 * 4. 複製並貼上此腳本內容
 * 5. 按 Enter 執行
 */

console.log('🔍 開始檢測 Wordwall 遊戲容器尺寸...');

// 檢測函數
function detectWordwallContainerSize() {
  const results = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    containers: [],
    gameElements: []
  };

  console.log('📄 當前頁面:', results.url);
  console.log('🖥️ 視窗尺寸:', results.viewport);

  // 1. 檢測 Canvas 元素
  const canvases = document.querySelectorAll('canvas');
  console.log(`🎨 找到 ${canvases.length} 個 Canvas 元素`);
  
  canvases.forEach((canvas, index) => {
    const rect = canvas.getBoundingClientRect();
    const style = window.getComputedStyle(canvas);
    
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
      styles: {
        position: style.position,
        zIndex: style.zIndex,
        display: style.display
      }
    };
    
    results.gameElements.push(canvasInfo);
    console.log(`📐 Canvas[${index}]:`, canvasInfo.dimensions);
  });

  // 2. 檢測 iframe 元素
  const iframes = document.querySelectorAll('iframe');
  console.log(`🖼️ 找到 ${iframes.length} 個 iframe 元素`);
  
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
      }
    };
    
    results.gameElements.push(iframeInfo);
    console.log(`📐 iframe[${index}]:`, iframeInfo.dimensions);
  });

  // 3. 檢測可能的遊戲容器 div
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
    if (elements.length > 0) {
      console.log(`🎮 找到 ${elements.length} 個 "${selector}" 元素`);
      
      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        
        // 只記錄較大的元素
        if (rect.width > 200 && rect.height > 150) {
          const elementInfo = {
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
            }
          };
          
          results.containers.push(elementInfo);
          console.log(`📐 ${selector}[${index}]:`, elementInfo.dimensions);
        }
      });
    }
  });

  // 4. 檢測主要內容區域
  const mainContent = document.querySelector('main') || 
                     document.querySelector('[role="main"]') ||
                     document.querySelector('.main-content') ||
                     document.querySelector('#main');
  
  if (mainContent) {
    const rect = mainContent.getBoundingClientRect();
    console.log('📄 主要內容區域尺寸:', {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    });
  }

  // 5. 分析結果
  console.log('\n📊 檢測結果摘要:');
  console.log('==================');
  
  if (results.gameElements.length > 0) {
    console.log('🎮 遊戲元素:');
    results.gameElements.forEach(element => {
      console.log(`  ${element.type}: ${element.dimensions.width}x${element.dimensions.height}`);
    });
  }
  
  if (results.containers.length > 0) {
    console.log('📦 容器元素:');
    results.containers.forEach(container => {
      console.log(`  ${container.selector}: ${container.dimensions.width}x${container.dimensions.height}`);
    });
  }

  // 6. 推薦的容器尺寸
  const allElements = [...results.gameElements, ...results.containers];
  if (allElements.length > 0) {
    // 找到最大的元素作為主要遊戲容器
    const largestElement = allElements.reduce((largest, current) => {
      const currentArea = current.dimensions.width * current.dimensions.height;
      const largestArea = largest.dimensions.width * largest.dimensions.height;
      return currentArea > largestArea ? current : largest;
    });
    
    console.log('\n🎯 推薦的遊戲容器尺寸:');
    console.log(`   寬度: ${largestElement.dimensions.width}px`);
    console.log(`   高度: ${largestElement.dimensions.height}px`);
    console.log(`   比例: ${(largestElement.dimensions.width / largestElement.dimensions.height).toFixed(2)}:1`);
    
    // 檢查是否接近常見比例
    const ratio = largestElement.dimensions.width / largestElement.dimensions.height;
    if (Math.abs(ratio - 16/9) < 0.1) {
      console.log('   📺 接近 16:9 比例');
    } else if (Math.abs(ratio - 4/3) < 0.1) {
      console.log('   📺 接近 4:3 比例');
    } else if (Math.abs(ratio - 3/2) < 0.1) {
      console.log('   📺 接近 3:2 比例');
    }
  }

  // 7. 返回完整結果
  console.log('\n📋 完整檢測數據:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

// 執行檢測
const detectionResults = detectWordwallContainerSize();

// 提供複製結果的便利函數
window.copyWordwallResults = function() {
  const resultsText = JSON.stringify(detectionResults, null, 2);
  navigator.clipboard.writeText(resultsText).then(() => {
    console.log('✅ 檢測結果已複製到剪貼板');
  }).catch(err => {
    console.error('❌ 複製失敗:', err);
    console.log('📋 請手動複製以下結果:');
    console.log(resultsText);
  });
};

console.log('\n💡 提示: 執行 copyWordwallResults() 可將結果複製到剪貼板');
