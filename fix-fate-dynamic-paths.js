const fs = require('fs');

console.log('🔧 修復 Fate 遊戲動態資源路徑...');

// 讀取主要的 JavaScript 文件
const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
let jsContent = fs.readFileSync(jsFilePath, 'utf8');

console.log('📁 原始文件大小:', jsContent.length, '字符');

// 直接搜索並修復字符串拼接模式
const concatenationPatterns = [
  // thunder 音效
  {
    search: /["']\.\/assets\/sounds\/thunder["']\+/g,
    replace: '"/games/fate-game/dist/assets/sounds/thunder"+',
    description: 'Thunder 字符串拼接'
  },
  {
    search: /["']assets\/sounds\/thunder["']\+/g,
    replace: '"/games/fate-game/dist/assets/sounds/thunder"+',
    description: 'Thunder 字符串拼接 (無前綴)'
  },
  // passby 音效
  {
    search: /["']\.\/assets\/sounds\/passby["']\+/g,
    replace: '"/games/fate-game/dist/assets/sounds/passby"+',
    description: 'Passby 字符串拼接'
  },
  {
    search: /["']assets\/sounds\/passby["']\+/g,
    replace: '"/games/fate-game/dist/assets/sounds/passby"+',
    description: 'Passby 字符串拼接 (無前綴)'
  },
  // hit 音效
  {
    search: /["']assets\/sounds\/hit["']\+/g,
    replace: '"/games/fate-game/dist/assets/sounds/hit"+',
    description: 'Hit 字符串拼接'
  },
  // video 文件
  {
    search: /["']\.\/assets\/videos\/video["']\+/g,
    replace: '"/games/fate-game/dist/assets/videos/video"+',
    description: 'Video 字符串拼接'
  },
  {
    search: /["']assets\/videos\/video["']\+/g,
    replace: '"/games/fate-game/dist/assets/videos/video"+',
    description: 'Video 字符串拼接 (無前綴)'
  }
];

let totalFixes = 0;

// 應用字符串拼接模式修復
concatenationPatterns.forEach(pattern => {
  const matches = jsContent.match(pattern.search);
  if (matches) {
    console.log(`🔧 修復 ${pattern.description}: ${matches.length} 個匹配`);
    jsContent = jsContent.replace(pattern.search, pattern.replace);
    totalFixes += matches.length;
  }
});

// 寫回文件
fs.writeFileSync(jsFilePath, jsContent);

console.log(`✅ 完成！總共修復了 ${totalFixes} 個動態資源路徑`);
console.log('📁 修復後文件大小:', jsContent.length, '字符');
console.log('🎮 Fate 遊戲動態資源路徑修復完成！');
