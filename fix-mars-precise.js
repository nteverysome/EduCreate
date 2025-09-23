const fs = require('fs');

console.log('🔴 精確修復 Mars 遊戲的 timeline 問題...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

const originalContent = content;

// 查找並替換 timeline 調用
// 查找模式：this.scene.tweens.timeline()
const timelinePattern = /this\.scene\.tweens\.timeline\(\)/g;

// 檢查是否找到 timeline 調用
const matches = content.match(timelinePattern);
if (matches) {
    console.log('🔍 找到', matches.length, '個 timeline 調用');
    
    // 替換為 chain 調用
    content = content.replace(timelinePattern, 'this.scene.tweens.chain');
    
    console.log('✅ 已將 timeline() 替換為 chain');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲 timeline 修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
}
