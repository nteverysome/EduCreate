const fs = require('fs');

console.log('🔧 修復 Fate 遊戲模板字符串路徑...');

// 讀取主要的 JavaScript 文件
const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
let jsContent = fs.readFileSync(jsFilePath, 'utf8');

console.log('📁 原始文件大小:', jsContent.length, '字符');

// 修復模板字符串路徑
const templateStringFixes = [
  // Thunder 音效
  {
    pattern: /`\.\/assets\/sounds\/thunder\$\{e\}\.mp3`/g,
    replacement: '`/games/fate-game/dist/assets/sounds/thunder${e}.mp3`',
    description: 'Thunder 模板字符串'
  },
  // Passby 音效
  {
    pattern: /`\.\/assets\/sounds\/passby\$\{e\}\.mp3`/g,
    replacement: '`/games/fate-game/dist/assets/sounds/passby${e}.mp3`',
    description: 'Passby 模板字符串'
  },
  // Hit 音效
  {
    pattern: /`assets\/sounds\/hit\$\{e\+1\}\.mp3`/g,
    replacement: '`/games/fate-game/dist/assets/sounds/hit${e+1}.mp3`',
    description: 'Hit 模板字符串'
  },
  // Video 文件
  {
    pattern: /`\.\/assets\/videos\/video\$\{e\}\.mp4`/g,
    replacement: '`/games/fate-game/dist/assets/videos/video${e}.mp4`',
    description: 'Video 模板字符串'
  }
];

let totalFixes = 0;

// 應用模板字符串修復
templateStringFixes.forEach(fix => {
  const matches = jsContent.match(fix.pattern);
  if (matches) {
    console.log(`🔧 修復 ${fix.description}: ${matches.length} 個匹配`);
    jsContent = jsContent.replace(fix.pattern, fix.replacement);
    totalFixes += matches.length;
  }
});

// 如果沒有找到模板字符串，嘗試查找其他格式
if (totalFixes === 0) {
  console.log('🔍 未找到模板字符串，搜索其他格式...');
  
  // 搜索可能的其他格式
  const alternativePatterns = [
    // 帶引號的模板字符串
    {
      pattern: /"\.\\/assets\\/sounds\\/thunder"\+e\+"\.mp3"/g,
      replacement: '"/games/fate-game/dist/assets/sounds/thunder"+e+".mp3"',
      description: 'Thunder 字符串拼接'
    },
    {
      pattern: /"\.\\/assets\\/sounds\\/passby"\+e\+"\.mp3"/g,
      replacement: '"/games/fate-game/dist/assets/sounds/passby"+e+".mp3"',
      description: 'Passby 字符串拼接'
    },
    {
      pattern: /"assets\\/sounds\\/hit"\+\(e\+1\)\+"\.mp3"/g,
      replacement: '"/games/fate-game/dist/assets/sounds/hit"+(e+1)+".mp3"',
      description: 'Hit 字符串拼接'
    },
    {
      pattern: /"\.\\/assets\\/videos\\/video"\+e\+"\.mp4"/g,
      replacement: '"/games/fate-game/dist/assets/videos/video"+e+".mp4"',
      description: 'Video 字符串拼接'
    }
  ];
  
  alternativePatterns.forEach(pattern => {
    const matches = jsContent.match(pattern.pattern);
    if (matches) {
      console.log(`🔧 修復 ${pattern.description}: ${matches.length} 個匹配`);
      jsContent = jsContent.replace(pattern.pattern, pattern.replacement);
      totalFixes += matches.length;
    }
  });
}

// 寫回文件
fs.writeFileSync(jsFilePath, jsContent);

console.log(`✅ 完成！總共修復了 ${totalFixes} 個模板字符串路徑`);
console.log('📁 修復後文件大小:', jsContent.length, '字符');
console.log('🎮 Fate 遊戲模板字符串路徑修復完成！');
