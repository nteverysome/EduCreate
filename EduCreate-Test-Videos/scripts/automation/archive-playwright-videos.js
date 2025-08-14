#!/usr/bin/env node
/**
 * 將 Playwright 錄影搬運並按規範重新命名到 EduCreate-Test-Videos/current/success/games/
 * 規範：YYYYMMDD_模組_功能_結果_版本_序號.webm
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TEST_RESULTS_DIR = path.join(ROOT, 'test-results');
const DEST_DIR = path.join(ROOT, 'EduCreate-Test-Videos', 'current', 'success', 'games');

function pad(n, w = 3) { return String(n).padStart(w, '0'); }
function yyyymmdd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function walk(dir, matcher) {
  const results = [];
  (function recur(d) {
    const entries = fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : [];
    for (const e of entries) {
      const fp = path.join(d, e.name);
      if (e.isDirectory()) recur(fp);
      else if (matcher(fp)) results.push(fp);
    }
  })(dir);
  return results;
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function main() {
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    console.log(`❌ 找不到目錄: ${TEST_RESULTS_DIR}`);
    process.exit(1);
  }
  ensureDir(DEST_DIR);

  const videos = walk(TEST_RESULTS_DIR, (fp) => /video\.webm$/i.test(fp));
  if (videos.length === 0) {
    console.log('ℹ️ 未發現可搬運的 Playwright 錄影 (video.webm)');
    return;
  }

  const today = yyyymmdd();
  const moduleName = 'games';
  const feature = 'AirplaneLRIV';
  const result = 'success';
  const version = 'v1.0.0';

  let seq = 1;
  const moved = [];

  for (const src of videos) {
    const destName = `${today}_${moduleName}_${feature}_${result}_${version}_${pad(seq)}.webm`;
    const dest = path.join(DEST_DIR, destName);
    fs.copyFileSync(src, dest);
    moved.push({ src, dest });
    seq++;
  }

  console.log('✅ 搬運完成：');
  for (const m of moved) {
    console.log(`  → ${m.dest}`);
  }
  console.log(`📁 目標目錄：${DEST_DIR}`);
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ 搬運失敗：', e); process.exit(1); }
}

