const fs = require('fs');
const path = require('path');

console.log('🔧 開始修復 Fate 遊戲 WebAssembly 路徑問題...');

// 讀取主要的 JavaScript 文件
const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
let jsContent = fs.readFileSync(jsFilePath, 'utf8');

console.log('📁 原始文件大小:', jsContent.length, '字符');

// 修復所有可能的 WebAssembly 路徑引用
const fixes = [
  // WebAssembly 文件路徑
  {
    pattern: /["']\.\/assets\/ammo\/ammo\.wasm\.js["']/g,
    replacement: '"/games/fate-game/dist/assets/ammo/ammo.wasm.js"',
    description: 'WebAssembly JS 載入器'
  },
  {
    pattern: /["']assets\/ammo\/ammo\.wasm\.js["']/g,
    replacement: '"/games/fate-game/dist/assets/ammo/ammo.wasm.js"',
    description: 'WebAssembly JS 載入器 (相對路徑)'
  },
  {
    pattern: /["']\.\/assets\/ammo\/ammo\.wasm\.wasm["']/g,
    replacement: '"/games/fate-game/dist/assets/ammo/ammo.wasm.wasm"',
    description: 'WebAssembly 二進制文件'
  },
  {
    pattern: /["']assets\/ammo\/ammo\.wasm\.wasm["']/g,
    replacement: '"/games/fate-game/dist/assets/ammo/ammo.wasm.wasm"',
    description: 'WebAssembly 二進制文件 (相對路徑)'
  },
  {
    pattern: /["']\.\/assets\/ammo\/ammo\.js["']/g,
    replacement: '"/games/fate-game/dist/assets/ammo/ammo.js"',
    description: 'Ammo.js 主文件'
  },
  {
    pattern: /["']assets\/ammo\/ammo\.js["']/g,
    replacement: '"/games/fate-game/dist/assets/ammo/ammo.js"',
    description: 'Ammo.js 主文件 (相對路徑)'
  }
];

let totalFixes = 0;

fixes.forEach(fix => {
  const matches = jsContent.match(fix.pattern);
  if (matches) {
    console.log(`🔧 修復 ${fix.description}: ${matches.length} 個匹配`);
    jsContent = jsContent.replace(fix.pattern, fix.replacement);
    totalFixes += matches.length;
  }
});

// 寫回文件
fs.writeFileSync(jsFilePath, jsContent);

console.log(`✅ 完成！總共修復了 ${totalFixes} 個路徑引用`);
console.log('📁 修復後文件大小:', jsContent.length, '字符');

// 驗證修復結果
console.log('\n🔍 驗證修復結果:');
const verifyPatterns = [
  '/games/fate-game/dist/assets/ammo/ammo.wasm.js',
  '/games/fate-game/dist/assets/ammo/ammo.wasm.wasm',
  '/games/fate-game/dist/assets/ammo/ammo.js'
];

verifyPatterns.forEach(pattern => {
  const count = (jsContent.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(`   ${pattern}: ${count} 個引用`);
});

console.log('\n🎮 Fate 遊戲 WebAssembly 路徑修復完成！');
