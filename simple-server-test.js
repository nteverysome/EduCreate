// 簡單的測試服務器
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <html>
      <head><title>EduCreate 測試服務器</title></head>
      <body>
        <h1>🎉 服務器運行正常！</h1>
        <p>時間: ${new Date().toLocaleString()}</p>
        <p>如果您看到這個頁面，說明 Node.js 和端口 3000 都工作正常。</p>
        <p><a href="/test">測試連結</a></p>
      </body>
    </html>
  `);
});

const PORT = 3000;

server.listen(PORT, (err) => {
  if (err) {
    console.error('❌ 服務器啟動失敗:', err);
    process.exit(1);
  }
  console.log(`✅ 測試服務器運行在 http://localhost:${PORT}`);
  console.log('請在瀏覽器中訪問上述地址');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被佔用`);
  } else {
    console.error('❌ 服務器錯誤:', err);
  }
  process.exit(1);
});
