// 在端口 3001 啟動開發服務器
const { spawn } = require('child_process');

console.log('Starting Next.js on port 3001...');

const server = spawn('npx', ['next', 'dev', '-p', '3001'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' }
});

server.on('error', (error) => {
  console.error('Server error:', error.message);
});

server.on('close', (code) => {
  console.log(`Server closed with code: ${code}`);
});

console.log('Server starting... Check http://localhost:3001');
