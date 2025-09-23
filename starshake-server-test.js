// 專門測試 Starshake 遊戲的簡單服務器
const http = require('http');
const fs = require('fs');
const path = require('path');

// 創建簡單的 HTTP 服務器來測試 Starshake 遊戲
const server = http.createServer((req, res) => {
  console.log(`📥 請求: ${req.method} ${req.url}`);
  
  let filePath = '';
  
  if (req.url === '/') {
    // 返回簡單的主頁
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Starshake 測試服務器</title></head>
      <body>
        <h1>Starshake 遊戲測試服務器</h1>
        <p>服務器正常運行！</p>
        <a href="/games/starshake-game/dist/">🌟 測試 Starshake 遊戲</a>
      </body>
      </html>
    `);
    return;
  }
  
  if (req.url.startsWith('/games/starshake-game/')) {
    // 處理 Starshake 遊戲文件
    const relativePath = req.url.replace('/games/starshake-game/', '');
    filePath = path.join(__dirname, 'public', 'games', 'starshake-game', relativePath);
    
    // 如果請求的是目錄，返回 index.html
    if (req.url.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    }
  } else {
    // 其他靜態文件
    filePath = path.join(__dirname, 'public', req.url);
  }
  
  console.log(`📁 文件路徑: ${filePath}`);
  
  // 檢查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }
  
  // 讀取文件
  try {
    const content = fs.readFileSync(filePath);
    
    // 設置正確的 Content-Type
    let contentType = 'text/plain';
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.html':
        contentType = 'text/html';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.webm':
        contentType = 'video/webm';
        break;
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(content);
    
    console.log(`✅ 文件已發送: ${path.basename(filePath)} (${contentType})`);
    
  } catch (error) {
    console.log(`❌ 讀取文件錯誤: ${error.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`🚀 Starshake 測試服務器啟動在 http://localhost:${PORT}`);
  console.log(`🌟 測試 Starshake 遊戲: http://localhost:${PORT}/games/starshake-game/dist/`);
  
  // 檢查 Starshake 文件是否存在
  const starshakeDir = path.join(__dirname, 'public', 'games', 'starshake-game', 'dist');
  if (fs.existsSync(starshakeDir)) {
    console.log('✅ Starshake 遊戲目錄存在');
    
    const indexFile = path.join(starshakeDir, 'index.html');
    if (fs.existsSync(indexFile)) {
      console.log('✅ Starshake index.html 存在');
    } else {
      console.log('❌ Starshake index.html 不存在');
    }
    
    const assetsDir = path.join(starshakeDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const assets = fs.readdirSync(assetsDir);
      console.log(`✅ Starshake assets 目錄存在，包含 ${assets.length} 個文件`);
      console.log('📁 Assets:', assets.slice(0, 5).join(', ') + (assets.length > 5 ? '...' : ''));
    } else {
      console.log('❌ Starshake assets 目錄不存在');
    }
  } else {
    console.log('❌ Starshake 遊戲目錄不存在');
  }
});

server.on('error', (error) => {
  console.error('❌ 服務器錯誤:', error);
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉服務器...');
  server.close(() => {
    console.log('✅ 服務器已關閉');
    process.exit(0);
  });
});
