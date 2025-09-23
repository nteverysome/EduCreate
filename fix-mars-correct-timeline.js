const fs = require('fs');

console.log('🔴 正確修復 Mars 遊戲的 timeline 問題...');

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

// 替換完整的 timeline 調用
let replacements = 0;

// 替換 this.scene.tweens.timeline({tweens:e,onComplete:...})
content = content.replace(/this\.scene\.tweens\.timeline\(\{tweens:([^,]+),onComplete:([^}]+)\}\)/g, (match, tweensVar, onCompleteFunc) => {
    replacements++;
    console.log(`✅ 修復第 ${replacements} 個完整 timeline 調用`);
    // 創建一個兼容的實現，直接執行 tweens 數組中的動畫
    return `(function(){let tweens=${tweensVar};tweens.forEach((t,i)=>setTimeout(()=>this.scene.tweens.add(t),i*100));setTimeout(()=>(${onCompleteFunc})(),tweens.length*100);return{destroy:()=>{}}}())`;
});

// 檢查是否有修改
if (content !== originalContent) {
    console.log(`✅ 總共修復了 ${replacements} 個 timeline 調用`);
    console.log('🔧 替換為兼容的實現');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲 timeline 修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
    console.log('🔍 讓我檢查文件內容...');
    
    // 檢查是否有其他形式的 timeline 調用
    const timelineMatches = content.match(/this\.scene\.tweens\.timeline/g);
    if (timelineMatches) {
        console.log(`📋 找到 ${timelineMatches.length} 個 timeline 引用`);
        
        // 顯示前後文
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('this.scene.tweens.timeline')) {
                console.log(`第 ${index + 1} 行: ${line.substring(0, 200)}...`);
            }
        });
    }
}
