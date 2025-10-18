const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'screenshot-service',
    version: '1.0.0'
  });
});

// 截圖端點
app.post('/screenshot', async (req, res) => {
  let browser = null;

  try {
    const { url, width = 400, height = 300, waitTime = 2000, selector = null } = req.body;

    // 驗證輸入
    if (!url) {
      return res.status(400).json({
        error: '缺少必要參數',
        message: 'url 參數是必需的'
      });
    }

    console.log(`[${new Date().toISOString()}] 截圖請求: ${url}`);
    console.log(`  尺寸: ${width}x${height}`);
    console.log(`  等待時間: ${waitTime}ms`);
    console.log(`  選擇器: ${selector || '無（全頁面截圖）'}`);

    // 啟動瀏覽器（優化配置以提升速度）
    const startTime = Date.now();
    browser = await puppeteer.launch({
      headless: 'new',  // 使用新的 headless 模式（更快）
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-first-run',  // 跳過首次運行設置
        '--no-zygote',  // 減少進程開銷
        '--single-process',  // 單進程模式（更快啟動）
        '--disable-extensions',  // 禁用擴展
        '--disable-background-networking',  // 禁用背景網絡
        '--disable-default-apps',  // 禁用默認應用
        '--disable-sync',  // 禁用同步
        '--metrics-recording-only',  // 僅記錄指標
        '--mute-audio',  // 靜音
        '--no-default-browser-check',  // 跳過默認瀏覽器檢查
        '--autoplay-policy=user-gesture-required',  // 自動播放策略
        '--disable-background-timer-throttling',  // 禁用背景計時器節流
        '--disable-backgrounding-occluded-windows',  // 禁用背景窗口
        '--disable-breakpad',  // 禁用崩潰報告
        '--disable-component-extensions-with-background-pages',  // 禁用背景頁面擴展
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',  // 禁用翻譯和其他功能
        '--disable-ipc-flooding-protection',  // 禁用 IPC 洪水保護
        '--disable-renderer-backgrounding',  // 禁用渲染器背景
        '--enable-features=NetworkService,NetworkServiceInProcess',  // 啟用網絡服務
        '--force-color-profile=srgb',  // 強制顏色配置
        '--hide-scrollbars',  // 隱藏滾動條
        '--disable-blink-features=AutomationControlled'  // 禁用自動化控制標記
      ]
    });

    const launchTime = Date.now() - startTime;
    console.log(`  瀏覽器啟動時間: ${launchTime}ms`);

    const page = await browser.newPage();

    // 設置視窗大小
    await page.setViewport({
      width: parseInt(width),
      height: parseInt(height),
      deviceScaleFactor: 1
    });

    // 訪問頁面
    const navigationStart = Date.now();
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const navigationTime = Date.now() - navigationStart;
    console.log(`  頁面載入時間: ${navigationTime}ms`);

    // ===== 智能等待機制（替代固定等待時間）=====
    console.log(`  開始智能等待遊戲載入...`);
    const smartWaitStart = Date.now();

    if (selector) {
      // 如果有選擇器，等待該元素出現並穩定
      console.log(`  等待元素: ${selector}`);
      await page.waitForSelector(selector, { timeout: 15000 });

      // 等待元素完全載入（檢查是否有 loaded 類或屬性）
      try {
        await page.waitForFunction(
          (sel) => {
            const element = document.querySelector(sel);
            if (!element) return false;

            // 檢查 iframe 是否完全載入
            if (element.tagName === 'IFRAME') {
              try {
                // 檢查 iframe 的 contentWindow 是否可訪問
                return element.contentWindow &&
                       element.contentWindow.document &&
                       element.contentWindow.document.readyState === 'complete';
              } catch (e) {
                // 跨域 iframe，檢查 load 事件
                return element.complete || element.readyState === 'complete';
              }
            }

            // 檢查元素是否有 loaded 類或完成狀態
            return element.classList.contains('loaded') ||
                   element.classList.contains('ready') ||
                   element.getAttribute('data-loaded') === 'true' ||
                   element.complete === true;
          },
          { timeout: 5000 },
          selector
        );
        console.log(`  元素已完全載入`);
      } catch (e) {
        // 如果智能等待失敗，回退到短暫的固定等待
        console.log(`  智能等待超時，使用回退等待 (2秒)`);
        await page.waitForTimeout(2000);
      }
    } else {
      // 沒有選擇器，等待頁面完全載入
      try {
        await page.waitForFunction(
          () => {
            // 檢查頁面是否有遊戲容器並已載入
            const gameContainer = document.querySelector('#game-container, .game-container, canvas, iframe');
            if (!gameContainer) return false;

            // 檢查是否有 Phaser 遊戲實例
            if (window.game && window.game.scene) {
              return window.game.scene.isActive();
            }

            // 檢查 canvas 是否已渲染
            if (gameContainer.tagName === 'CANVAS') {
              const ctx = gameContainer.getContext('2d');
              return ctx && gameContainer.width > 0 && gameContainer.height > 0;
            }

            return true;
          },
          { timeout: 5000 }
        );
        console.log(`  頁面遊戲已完全載入`);
      } catch (e) {
        // 如果智能等待失敗，回退到短暫的固定等待
        console.log(`  智能等待超時，使用回退等待 (2秒)`);
        await page.waitForTimeout(2000);
      }
    }

    const smartWaitTime = Date.now() - smartWaitStart;
    console.log(`  智能等待時間: ${smartWaitTime}ms（節省了 ${parseInt(waitTime) - smartWaitTime}ms）`);

    // 截圖
    const screenshotStart = Date.now();
    let screenshot;

    if (selector) {
      // 截取特定元素
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`找不到元素: ${selector}`);
      }

      console.log(`  截取元素: ${selector}`);
      screenshot = await element.screenshot({
        type: 'png'
      });
    } else {
      // 截取整個頁面
      console.log(`  截取整個頁面`);
      screenshot = await page.screenshot({
        type: 'png',
        fullPage: false
      });
    }

    const screenshotTime = Date.now() - screenshotStart;
    const totalTime = Date.now() - startTime;

    console.log(`  截圖時間: ${screenshotTime}ms`);
    console.log(`  總時間: ${totalTime}ms`);
    console.log(`  截圖大小: ${screenshot.length} bytes`);
    console.log(`[${new Date().toISOString()}] 截圖成功`);

    await browser.close();
    browser = null;

    // 返回截圖
    res.set('Content-Type', 'image/png');
    res.set('X-Screenshot-Time', totalTime.toString());
    res.set('X-Screenshot-Size', screenshot.length.toString());
    res.send(screenshot);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] 截圖失敗:`, error);

    // 確保瀏覽器關閉
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('關閉瀏覽器失敗:', closeError);
      }
    }

    res.status(500).json({
      error: '截圖失敗',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 批量截圖端點（可選）
app.post('/screenshot/batch', async (req, res) => {
  try {
    const { urls, width = 400, height = 300, waitTime = 2000 } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        error: '缺少必要參數',
        message: 'urls 參數必須是非空數組'
      });
    }
    
    if (urls.length > 10) {
      return res.status(400).json({
        error: '請求過大',
        message: '批量截圖最多支援 10 個 URL'
      });
    }
    
    console.log(`[${new Date().toISOString()}] 批量截圖請求: ${urls.length} 個 URL`);
    
    const results = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`  處理 ${i + 1}/${urls.length}: ${url}`);
      
      try {
        // 調用單個截圖邏輯
        const response = await fetch(`http://localhost:${PORT}/screenshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, width, height, waitTime })
        });
        
        if (response.ok) {
          const screenshot = await response.arrayBuffer();
          results.push({
            url,
            success: true,
            size: screenshot.byteLength,
            data: Buffer.from(screenshot).toString('base64')
          });
        } else {
          const error = await response.json();
          results.push({
            url,
            success: false,
            error: error.message
          });
        }
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log(`[${new Date().toISOString()}] 批量截圖完成`);
    
    res.json({
      success: true,
      total: urls.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 批量截圖失敗:`, error);
    res.status(500).json({
      error: '批量截圖失敗',
      message: error.message
    });
  }
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('未處理的錯誤:', err);
  res.status(500).json({
    error: '服務器錯誤',
    message: err.message
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: '端點不存在',
    message: `${req.method} ${req.path} 不存在`,
    availableEndpoints: [
      'GET /health',
      'POST /screenshot',
      'POST /screenshot/batch'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`截圖服務運行在端口 ${PORT}`);
  console.log(`時間: ${new Date().toISOString()}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
  console.log(`可用端點:`);
  console.log(`  GET  /health - 健康檢查`);
  console.log(`  POST /screenshot - 單個截圖`);
  console.log(`  POST /screenshot/batch - 批量截圖`);
  console.log(`========================================`);
});

