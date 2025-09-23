const fs = require('fs');

console.log('🔴 立即修復 Mars 遊戲的 timeline 問題...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

const originalContent = content;

// 簡單修復：將所有 timeline 調用替換為 add 調用
content = content.replace(
    /this\.scene\.tweens\.timeline/g,
    'this.scene.tweens.add'
);

// 檢查是否有修改
if (content !== originalContent) {
    console.log('✅ 修復了 timeline 調用');
    console.log('🔧 將 timeline 替換為 add');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲 timeline 修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
}
