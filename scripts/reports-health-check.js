#!/usr/bin/env node
/*
  Reports HTTP Health Check
  - Verifies Next dev server serves /_reports endpoints correctly
  - Steps:
    1) GET /_reports → 200 + contains title
    2) Find a valid daily report → /_reports/daily/<date>/index.html → 200
    3) Find a latest video link and fetch it → 200 (if exists)
  - Usage:
    node scripts/reports-health-check.js [--base http://localhost:3000] [--strict]
*/
const http = require('http');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const o = { base: 'http://localhost:3000', strict: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base' && args[i + 1]) { o.base = args[++i]; }
    else if (args[i] === '--strict') { o.strict = true; }
  }
  return o;
}

(async () => {
  const { base, strict } = parseArgs();
  const ok = (msg) => console.log('✅', msg);
  const warn = (msg) => console.warn('⚠️', msg);
  const fail = (msg) => { console.error('❌', msg); process.exit(1); };

  // 1) Home
  const homeUrl = `${base}/_reports`;
  let home;
  try {
    home = await get(homeUrl);
  } catch (e) {
    const m = `無法連線到 ${homeUrl}，請先啟動開發伺服器：npm run dev`;
    if (strict) fail(m); else { warn(m); process.exit(0); }
  }
  if (home.status !== 200) {
    const m = `/_reports 狀態碼 ${home.status}，期望 200`;
    if (strict) fail(m); else { warn(m); process.exit(0); }
  }
  if (!/EduCreate Reports Home/i.test(home.body)) {
    const m = '首頁內容無法識別（缺少標題）';
    if (strict) fail(m); else { warn(m); }
  } else ok('/_reports 首頁 OK');

  // 2) Daily report
  // 先嘗試今天日期，若不存在，再列出 /_reports/daily 目錄找最近
  const today = new Date().toISOString().slice(0, 10);
  let dailyUrl = `${base}/_reports/daily/${today}/index.html`;
  let daily = await get(dailyUrl).catch(() => ({ status: 0 }));
  if (daily.status !== 200) {
    const dailyList = await get(`${base}/_reports/daily`).catch(() => ({ status: 0 }));
    if (dailyList.status === 200) {
      try {
        const list = JSON.parse(dailyList.body);
        const dirs = (list.items || []).filter(i => i.type === 'dir').map(i => i.name).filter(n => /\d{4}-\d{2}-\d{2}/.test(n)).sort().reverse();
        if (dirs.length) {
          dailyUrl = `${base}/_reports/daily/${dirs[0]}/index.html`;
          daily = await get(dailyUrl);
        }
      } catch {}
    }
  }
  if (daily.status === 200) ok(`日報 OK: ${dailyUrl}`); else warn('找不到可用的日報 index.html');

  // 3) Latest video link
  // 從首頁擷取第一個 /_reports/current/…webm 連結
  const m = home.body.match(/href=['\"](\/[_a-zA-Z0-9\-\/\.]*current\/[A-Za-z0-9_\-\/\.%]+\.webm)['\"]/);
  if (m) {
    const videoUrl = `${base}${m[1]}`;
    const v = await get(videoUrl).catch(() => ({ status: 0 }));
    if (v.status === 200) ok(`影片 OK: ${videoUrl}`); else warn(`影片無法存取: ${videoUrl} (status ${v.status})`);
  } else {
    warn('首頁未找到影片連結（可能今日尚無影片）');
  }

  console.log('🏁 Reports HTTP Health Check 完成');
  process.exit(0);
})().catch((e) => {
  console.error('❌ Health Check 失敗:', e.message);
  process.exit(1);
});

