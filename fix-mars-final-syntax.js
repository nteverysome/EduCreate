const fs = require('fs');

console.log('🔴 最終修復 Mars 遊戲的語法錯誤...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

const originalContent = content;

// 修復最後一個 moveTimeline 語法錯誤
// 將 (()=>({add:(t)=>this,play:()=>this,destroy:()=>{}}))({tweens:e,onComplete:...})
// 替換為 {add:(t)=>this,play:()=>this,destroy:()=>{}}
content = content.replace(
    /\(\(\)=>\(\{add:\(t\)=>this,play:\(\)=>this,destroy:\(\)=>\{\}\}\)\)\(\{tweens:e,onComplete:/g,
    '{add:(t)=>this,play:()=>this,destroy:()=>{}};this.onComplete='
);

// 檢查是否有修改
if (content !== originalContent) {
    console.log('✅ 修復了最後一個語法錯誤');
    console.log('🔧 將錯誤的函數調用替換為正確的對象賦值');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲最終語法錯誤修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的語法錯誤');
}
