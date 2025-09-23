const fs = require('fs');

console.log('🔧 全面修復 Fate 遊戲資源路徑...');

// 讀取主要的 JavaScript 文件
const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
let jsContent = fs.readFileSync(jsFilePath, 'utf8');

console.log('📁 原始文件大小:', jsContent.length, '字符');

// 定義所有需要修復的資源路徑
const assetFixes = [
  // 字體文件
  {
    pattern: /["']assets\/fonts\/mario\.png["']/g,
    replacement: '"/games/fate-game/dist/assets/fonts/mario.png"',
    description: 'Mario 字體 PNG'
  },
  {
    pattern: /["']assets\/fonts\/mario\.xml["']/g,
    replacement: '"/games/fate-game/dist/assets/fonts/mario.xml"',
    description: 'Mario 字體 XML'
  },
  {
    pattern: /["']assets\/fonts\/computer\.png["']/g,
    replacement: '"/games/fate-game/dist/assets/fonts/computer.png"',
    description: 'Computer 字體 PNG'
  },
  {
    pattern: /["']assets\/fonts\/computer\.xml["']/g,
    replacement: '"/games/fate-game/dist/assets/fonts/computer.xml"',
    description: 'Computer 字體 XML'
  },
  
  // 圖像文件
  {
    pattern: /["']assets\/images\/pello_logo_old\.png["']/g,
    replacement: '"/games/fate-game/dist/assets/images/pello_logo_old.png"',
    description: 'Pello Logo'
  },
  {
    pattern: /["']assets\/images\/logo\.png["']/g,
    replacement: '"/games/fate-game/dist/assets/images/logo.png"',
    description: 'Logo'
  },
  {
    pattern: /["']assets\/images\/stars\.png["']/g,
    replacement: '"/games/fate-game/dist/assets/images/stars.png"',
    description: 'Stars 背景'
  },
  {
    pattern: /["']assets\/images\/nebulaset\.png["']/g,
    replacement: '"/games/fate-game/dist/assets/images/nebulaset.png"',
    description: 'Nebula 背景'
  },
  {
    pattern: /["']assets\/images\/grass\.jpg["']/g,
    replacement: '"/games/fate-game/dist/assets/images/grass.jpg"',
    description: 'Grass 紋理'
  },
  
  // 音效文件
  {
    pattern: /["']assets\/sounds\/thunder(\d+)\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/thunder$1.mp3"',
    description: 'Thunder 音效'
  },
  {
    pattern: /["']assets\/sounds\/passby(\d+)\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/passby$1.mp3"',
    description: 'Passby 音效'
  },
  {
    pattern: /["']assets\/sounds\/hit(\d+)\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/hit$1.mp3"',
    description: 'Hit 音效'
  },
  {
    pattern: /["']assets\/sounds\/hymn\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/hymn.mp3"',
    description: 'Hymn 音樂'
  },
  {
    pattern: /["']assets\/sounds\/music\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/music.mp3"',
    description: 'Music 音樂'
  },
  {
    pattern: /["']assets\/sounds\/type\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/type.mp3"',
    description: 'Type 音效'
  },
  {
    pattern: /["']assets\/sounds\/shot\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/shot.mp3"',
    description: 'Shot 音效'
  },
  {
    pattern: /["']assets\/sounds\/voice_start\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/voice_start.mp3"',
    description: 'Voice Start'
  },
  {
    pattern: /["']assets\/sounds\/voice_drop\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/voice_drop.mp3"',
    description: 'Voice Drop'
  },
  {
    pattern: /["']assets\/sounds\/voice_hit\.mp3["']/g,
    replacement: '"/games/fate-game/dist/assets/sounds/voice_hit.mp3"',
    description: 'Voice Hit'
  },
  
  // 影片文件
  {
    pattern: /["']assets\/videos\/video(\d+)\.mp4["']/g,
    replacement: '"/games/fate-game/dist/assets/videos/video$1.mp4"',
    description: 'Video 文件'
  },
  
  // 3D 物件文件
  {
    pattern: /["']\.\/assets\/objects\/ship\.glb["']/g,
    replacement: '"/games/fate-game/dist/assets/objects/ship.glb"',
    description: 'Ship 3D 模型'
  },
  {
    pattern: /["']assets\/objects\/ship\.glb["']/g,
    replacement: '"/games/fate-game/dist/assets/objects/ship.glb"',
    description: 'Ship 3D 模型 (相對路徑)'
  },
  {
    pattern: /["']assets\/objects\/suzanne\.glb["']/g,
    replacement: '"/games/fate-game/dist/assets/objects/suzanne.glb"',
    description: 'Suzanne 3D 模型'
  }
];

let totalFixes = 0;

// 應用所有修復
assetFixes.forEach(fix => {
  const matches = jsContent.match(fix.pattern);
  if (matches) {
    console.log(`🔧 修復 ${fix.description}: ${matches.length} 個匹配`);
    jsContent = jsContent.replace(fix.pattern, fix.replacement);
    totalFixes += matches.length;
  }
});

// 寫回文件
fs.writeFileSync(jsFilePath, jsContent);

console.log(`✅ 完成！總共修復了 ${totalFixes} 個資源路徑`);
console.log('📁 修復後文件大小:', jsContent.length, '字符');
console.log('🎮 Fate 遊戲所有資源路徑修復完成！');
