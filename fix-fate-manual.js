const fs = require('fs');

console.log('🔧 手動修復 Fate 遊戲剩餘路徑...');

// 讀取主要的 JavaScript 文件
const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
let jsContent = fs.readFileSync(jsFilePath, 'utf8');

console.log('📁 原始文件大小:', jsContent.length, '字符');

let totalFixes = 0;

// 手動修復具體的路徑模式
const manualFixes = [
  // Thunder 音效 - 模板字符串格式
  {
    search: '`./assets/sounds/thunder${e}.mp3`',
    replace: '`/games/fate-game/dist/assets/sounds/thunder${e}.mp3`',
    description: 'Thunder 模板字符串'
  },
  // Passby 音效 - 模板字符串格式
  {
    search: '`./assets/sounds/passby${e}.mp3`',
    replace: '`/games/fate-game/dist/assets/sounds/passby${e}.mp3`',
    description: 'Passby 模板字符串'
  },
  // Hit 音效 - 模板字符串格式
  {
    search: '`assets/sounds/hit${e+1}.mp3`',
    replace: '`/games/fate-game/dist/assets/sounds/hit${e+1}.mp3`',
    description: 'Hit 模板字符串'
  },
  // Video 文件 - 模板字符串格式
  {
    search: '`./assets/videos/video${e}.mp4`',
    replace: '`/games/fate-game/dist/assets/videos/video${e}.mp4`',
    description: 'Video 模板字符串'
  }
];

// 應用手動修復
manualFixes.forEach(fix => {
  if (jsContent.includes(fix.search)) {
    console.log(`🔧 修復 ${fix.description}`);
    jsContent = jsContent.replace(fix.search, fix.replace);
    totalFixes++;
  }
});

// 如果沒有找到模板字符串格式，嘗試字符串拼接格式
if (totalFixes === 0) {
  console.log('🔍 未找到模板字符串格式，嘗試字符串拼接格式...');
  
  const concatenationFixes = [
    {
      search: '"./assets/sounds/thunder"+e+".mp3"',
      replace: '"/games/fate-game/dist/assets/sounds/thunder"+e+".mp3"',
      description: 'Thunder 字符串拼接'
    },
    {
      search: '"./assets/sounds/passby"+e+".mp3"',
      replace: '"/games/fate-game/dist/assets/sounds/passby"+e+".mp3"',
      description: 'Passby 字符串拼接'
    },
    {
      search: '"assets/sounds/hit"+(e+1)+".mp3"',
      replace: '"/games/fate-game/dist/assets/sounds/hit"+(e+1)+".mp3"',
      description: 'Hit 字符串拼接'
    },
    {
      search: '"./assets/videos/video"+e+".mp4"',
      replace: '"/games/fate-game/dist/assets/videos/video"+e+".mp4"',
      description: 'Video 字符串拼接'
    }
  ];
  
  concatenationFixes.forEach(fix => {
    if (jsContent.includes(fix.search)) {
      console.log(`🔧 修復 ${fix.description}`);
      jsContent = jsContent.replace(fix.search, fix.replace);
      totalFixes++;
    }
  });
}

// 寫回文件
fs.writeFileSync(jsFilePath, jsContent);

console.log(`✅ 完成！總共修復了 ${totalFixes} 個路徑`);
console.log('📁 修復後文件大小:', jsContent.length, '字符');

// 驗證修復結果
console.log('\n🔍 驗證修復結果:');
const verifyPatterns = [
  '/games/fate-game/dist/assets/sounds/thunder',
  '/games/fate-game/dist/assets/sounds/passby',
  '/games/fate-game/dist/assets/sounds/hit',
  '/games/fate-game/dist/assets/videos/video'
];

verifyPatterns.forEach(pattern => {
  const count = (jsContent.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(`   ${pattern}: ${count} 個引用`);
});

console.log('\n🎮 Fate 遊戲手動路徑修復完成！');
