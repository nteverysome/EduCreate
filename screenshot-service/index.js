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
    const { url, width = 400, height = 300, waitTime = 2000 } = req.body;
    
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
    
    // 啟動瀏覽器
    const startTime = Date.now();
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
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
    
    // 等待遊戲載入
    await page.waitForTimeout(parseInt(waitTime));
    
    // 截圖
    const screenshotStart = Date.now();
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });
    
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

