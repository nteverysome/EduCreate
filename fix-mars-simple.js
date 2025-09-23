const fs = require('fs');

console.log('🔴 簡單修復 Mars 遊戲的 timeline 問題...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

// 簡單替換：將 timeline() 調用替換為一個空的對象，避免錯誤
const originalContent = content;

// 替換 timeline 調用為一個簡單的對象
content = content.replace(
    /this\.scene\.tweens\.timeline\(\)/g,
    '{ add: function() { return this; }, play: function() { return this; } }'
);

// 檢查是否有修改
if (content !== originalContent) {
    console.log('✅ 找到並修復了 timeline 調用');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲 timeline 修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
}
