#!/usr/bin/env node
/**
 * 薄封裝：代理調用 process-test-videos.js --mode archive
 * 保持向後相容，未來可以移除。
 */
const { spawnSync } = require('child_process');
const path = require('path');

function main() {
  const script = path.join('EduCreate-Test-Videos', 'scripts', 'automation', 'process-test-videos.js');
  const args = [script, '--mode', 'archive', '--cleanup'];
  // 傳遞現有環境變數（MODULE/FEATURE/VERSION）以確保命名一致
  const res = spawnSync('node', args, { stdio: 'inherit', env: process.env });
  if (res.status !== 0) {
    console.error('❌ archive-playwright-videos 代理失敗');
    process.exit(res.status || 1);
  }
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ 代理執行失敗：', e); process.exit(1); }
}
