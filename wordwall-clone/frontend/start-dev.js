const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Wordwall Clone Frontend...');

const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

vite.on('error', (error) => {
  console.error('❌ Failed to start frontend:', error);
});

vite.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down frontend...');
  vite.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down frontend...');
  vite.kill('SIGTERM');
  process.exit(0);
});
