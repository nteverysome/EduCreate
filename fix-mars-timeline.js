const fs = require('fs');
const path = require('path');

console.log('🔴 修復 Mars 火星探險遊戲的 timeline 問題...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

// 備份原文件
const backupFile = marsJsFile + '.backup';
if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(marsJsFile, backupFile);
    console.log('✅ 已備份原文件到:', backupFile);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
let fixCount = 0;

console.log('📝 開始修復 timeline 方法...');

// 修復 1: 替換 this.scene.tweens.timeline() 為兼容的方法
const timelinePattern = /this\.scene\.tweens\.timeline\(\)/g;
const timelineMatches = content.match(timelinePattern);
if (timelineMatches) {
    console.log(`🔧 找到 ${timelineMatches.length} 個 timeline() 調用`);
    
    // 替換為創建一個簡單的 timeline 對象
    content = content.replace(
        /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*this\.scene\.tweens\.timeline\(\)/g,
        'const $1 = { tweens: [], add: function(config) { this.tweens.push(config); return this; }, play: function() { this.tweens.forEach((tween, index) => { setTimeout(() => { this.scene.tweens.add(tween); }, index * 100); }); return this; } }'
    );
    
    // 替換變量賦值的情況
    content = content.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*this\.scene\.tweens\.timeline\(\)/g,
        '$1 = { tweens: [], add: function(config) { this.tweens.push(config); return this; }, play: function() { this.tweens.forEach((tween, index) => { setTimeout(() => { this.scene.tweens.add(tween); }, index * 100); }); return this; } }'
    );
    
    fixCount += timelineMatches.length;
}

// 修復 2: 處理壓縮代碼中的 timeline 調用
// 在壓縮代碼中，可能是 d=this.scene.tweens.timeline() 的形式
const compressedTimelinePattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*this\.scene\.tweens\.timeline\(\)/g;
const compressedMatches = content.match(compressedTimelinePattern);
if (compressedMatches) {
    console.log(`🔧 找到 ${compressedMatches.length} 個壓縮的 timeline() 調用`);
    
    content = content.replace(compressedTimelinePattern, (match, varName) => {
        return `${varName} = { 
            tweens: [], 
            scene: this.scene,
            add: function(config) { 
                this.tweens.push(config); 
                return this; 
            }, 
            play: function() { 
                let delay = 0;
                this.tweens.forEach((tween) => { 
                    setTimeout(() => { 
                        this.scene.tweens.add(tween); 
                    }, delay); 
                    delay += (tween.duration || 100) + 50;
                }); 
                return this; 
            } 
        }`;
    });
    
    fixCount += compressedMatches.length;
}

// 修復 3: 處理 moveTimeline 的 timeline 調用
const moveTimelinePattern = /this\.moveTimeline\s*=\s*this\.scene\.tweens\.timeline\(/g;
const moveTimelineMatches = content.match(moveTimelinePattern);
if (moveTimelineMatches) {
    console.log(`🔧 找到 ${moveTimelineMatches.length} 個 moveTimeline 調用`);
    
    // 替換為使用 chain 方法
    content = content.replace(
        /this\.moveTimeline\s*=\s*this\.scene\.tweens\.timeline\(\{tweens:([^}]+)\}/g,
        'this.moveTimeline = this.scene.tweens.chain({ targets: this, tweens: $1'
    );
    
    fixCount += moveTimelineMatches.length;
}

// 修復 4: 處理其他可能的 timeline 使用
const genericTimelinePattern = /\.tweens\.timeline\(/g;
const genericMatches = content.match(genericTimelinePattern);
if (genericMatches) {
    console.log(`🔧 找到 ${genericMatches.length} 個通用 timeline 調用`);
    
    // 替換為 chain 方法
    content = content.replace(genericTimelinePattern, '.tweens.chain(');
    fixCount += genericMatches.length;
}

// 寫入修復後的文件
fs.writeFileSync(marsJsFile, content);

console.log(`🎉 Mars 遊戲 timeline 修復完成！`);
console.log(`✅ 總共修復了 ${fixCount} 個 timeline 相關問題`);
console.log(`📁 修復的文件: ${marsJsFile}`);
console.log(`💾 備份文件: ${backupFile}`);

if (fixCount > 0) {
    console.log('🚀 建議重新測試 Mars 遊戲以確認修復效果');
} else {
    console.log('ℹ️  沒有找到需要修復的 timeline 調用');
}
