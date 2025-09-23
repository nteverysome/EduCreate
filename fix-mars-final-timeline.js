const fs = require('fs');

console.log('🔴 最終修復 Mars 遊戲的 timeline 問題...');

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

// 創建一個緊湊的 timeline 替代對象
const timelineReplacement = '{tweens:[],add:function(c){this.tweens.push(c);return this},play:function(){this.tweens.forEach((t,i)=>setTimeout(()=>this.scene.tweens.add(t),i*100));return this},scene:this.scene}';

// 替換所有 timeline() 調用
let replacements = 0;

// 替換 this.scene.tweens.timeline() 和 this.scene.tweens.timeline({
content = content.replace(/this\.scene\.tweens\.timeline\(/g, (match) => {
    replacements++;
    console.log(`✅ 修復第 ${replacements} 個 timeline() 調用`);
    return timelineReplacement + '.play(';
});

// 檢查是否有修改
if (content !== originalContent) {
    console.log(`✅ 總共修復了 ${replacements} 個 timeline() 調用`);
    console.log('🔧 替換為兼容的對象實現');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲所有 timeline 修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
}
