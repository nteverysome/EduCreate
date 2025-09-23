const fs = require('fs');

console.log('🔴 修復 Mars 遊戲的最後一個 timeline 調用...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

const originalContent = content;

// 修復最後一個 timeline 調用
// 將 this.moveTimeline=this.scene.tweens.timeline 替換為兼容的對象
content = content.replace(
    /this\.moveTimeline=this\.scene\.tweens\.timeline\(\{tweens:e,onComplete:/g, 
    'this.moveTimeline={tweens:e,add:function(){return this},play:function(){e.forEach((t,i)=>setTimeout(()=>this.scene.tweens.add(t),i*100));return this},scene:this.scene,onComplete:'
);

// 檢查是否有修改
if (content !== originalContent) {
    console.log('✅ 修復了最後一個 timeline 調用');
    console.log('🔧 將 timeline 替換為兼容對象');
    
    // 寫入修復後的文件
    fs.writeFileSync(marsJsFile, content);
    console.log('🎉 Mars 遊戲最後一個 timeline 調用修復完成！');
    console.log('📁 修復的文件:', marsJsFile);
    console.log('📝 修復後文件大小:', content.length, '字符');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
}
