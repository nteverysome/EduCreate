const fs = require('fs');

console.log('🔧 修復 Fate 遊戲物理引擎路徑...');

// 讀取主要的 JavaScript 文件
const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
let jsContent = fs.readFileSync(jsFilePath, 'utf8');

console.log('📁 原始文件大小:', jsContent.length, '字符');

// 修復物理引擎路徑
const originalPath = '.withPhysics("./assets/ammo")';
const newPath = '.withPhysics("/games/fate-game/dist/assets/ammo")';

if (jsContent.includes(originalPath)) {
  jsContent = jsContent.replace(originalPath, newPath);
  console.log('✅ 成功修復物理引擎路徑');
} else {
  console.log('❌ 未找到物理引擎路徑，嘗試其他模式...');
  
  // 嘗試其他可能的模式
  const patterns = [
    {
      pattern: /\.withPhysics\(["']\.\/assets\/ammo["']\)/g,
      replacement: '.withPhysics("/games/fate-game/dist/assets/ammo")'
    },
    {
      pattern: /\.withPhysics\(["']assets\/ammo["']\)/g,
      replacement: '.withPhysics("/games/fate-game/dist/assets/ammo")'
    }
  ];
  
  let fixed = false;
  patterns.forEach(({pattern, replacement}) => {
    if (jsContent.match(pattern)) {
      jsContent = jsContent.replace(pattern, replacement);
      console.log('✅ 使用模式匹配修復物理引擎路徑');
      fixed = true;
    }
  });
  
  if (!fixed) {
    console.log('❌ 無法找到物理引擎路徑模式');
  }
}

// 寫回文件
fs.writeFileSync(jsFilePath, jsContent);

console.log('📁 修復後文件大小:', jsContent.length, '字符');
console.log('🎮 Fate 遊戲物理引擎路徑修復完成！');
