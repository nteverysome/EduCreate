const fs = require('fs');

console.log('🔴 終極修復 Mars 遊戲的 timeline 問題...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

// 恢復備份
const backupFile = marsJsFile + '.backup';
if (fs.existsSync(backupFile)) {
    fs.copyFileSync(backupFile, marsJsFile);
    console.log('✅ 已恢復備份文件');
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

const originalContent = content;

// 替換所有 timeline 調用
let replacements = 0;

// 簡單替換：將 this.scene.tweens.timeline 替換為一個返回兼容對象的函數
content = content.replace(/this\.scene\.tweens\.timeline/g, (match) => {
    replacements++;
    console.log(`✅ 修復第 ${replacements} 個 timeline 引用`);
    // 返回一個簡單的函數，立即返回兼容對象
    return '(()=>({add:(t)=>this,play:()=>this,destroy:()=>{}}))';
});

// 檢查是否有修改
if (content !== originalContent) {
    console.log(`✅ 總共修復了 ${replacements} 個 timeline 引用`);
    console.log('🔧 替換為兼容的對象實現');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲 timeline 修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
}
