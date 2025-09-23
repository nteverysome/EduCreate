const fs = require('fs');

console.log('🔴 修復 Mars 遊戲的斷行語法錯誤...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

const originalContent = content;

// 修復斷行語法錯誤：將截斷的 setBloomR 修復為完整的 setBloomRadius
content = content.replace(/setBloomR$/g, 'setBloomRadius(t){return this.bloomRadius=t,this}');

// 檢查是否有修改
if (content !== originalContent) {
    console.log('✅ 修復了斷行語法錯誤');
    console.log('🔧 將斷行的代碼片段修復為正確的語法');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲斷行語法錯誤修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的斷行語法錯誤');
}
