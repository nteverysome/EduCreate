const fs = require('fs');

console.log('🔴 精確修復 Mars 遊戲的 timeline 問題...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 原文件大小:', content.length, '字符');

// 查找並修復 typeText 方法中的 timeline 問題
const typeTextPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*this\.scene\.tweens\.timeline\(\);/g;
let match = typeTextPattern.exec(content);

if (match) {
    const varName = match[1];
    console.log('🔧 找到 typeText 中的 timeline 變量:', varName);
    
    // 替換為兼容的實現
    const replacement = `const ${varName} = {
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
    };`;
    
    content = content.replace(match[0], replacement);
    console.log('✅ 修復了 typeText 中的 timeline 調用');
}

// 查找並修復 moveTimeline 的問題
const moveTimelinePattern = /this\.moveTimeline\s*=\s*this\.scene\.tweens\.timeline\(\{tweens:([^}]+)\}/g;
match = moveTimelinePattern.exec(content);

if (match) {
    console.log('🔧 找到 moveTimeline 調用');
    const tweensArray = match[1];
    
    // 替換為 chain 方法
    const replacement = `this.moveTimeline = this.scene.tweens.chain({
        targets: this,
        tweens: ${tweensArray}`;
    
    content = content.replace(match[0], replacement);
    console.log('✅ 修復了 moveTimeline 調用');
}

// 寫入修復後的文件
fs.writeFileSync(marsJsFile, content);

console.log('🎉 精確修復完成！');
console.log('📁 修復的文件:', marsJsFile);
console.log('📝 修復後文件大小:', content.length, '字符');
