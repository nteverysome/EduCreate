const fs = require('fs');

console.log('🔧 最終語法修復...');

const jsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = jsFile + '.backup';

try {
    // 從備份恢復，然後重新整合
    console.log('🔄 從備份恢復原始文件...');
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    
    // 找到正確的插入位置
    const updateMethodPattern = /update\(e,t\)\{this\.death\|\|\(/;
    const match = backupContent.match(updateMethodPattern);
    
    if (match) {
        const matchIndex = backupContent.indexOf(match[0]);
        const insertPosition = matchIndex + match[0].length;
        
        console.log('✅ 找到正確的插入位置');
        
        // 創建正確的 TouchControls 整合代碼
        const touchControlsCode = `
// 🎮 TouchControls 整合
if(window.touchControls){
    const touchState = window.touchControls.getInputState();
    
    // 移動控制 - X軸
    if(Math.abs(touchState.direction.x) > 0.1) {
        if(touchState.direction.x < 0) {
            this.x -= 5;
            this.anims.play(this.name + "left", true);
            this.shadow.setScale(.5, 1);
        } else {
            this.x += 5;
            this.anims.play(this.name + "right", true);
            this.shadow.setScale(.5, 1);
        }
    }
    
    // 移動控制 - Y軸
    if(Math.abs(touchState.direction.y) > 0.1) {
        if(touchState.direction.y < 0) {
            this.y -= 5;
        } else {
            this.y += 5;
        }
    }
    
    // 射擊控制
    if(touchState.shooting && !this.lastTouchShoot) {
        this.shoot();
    }
    this.lastTouchShoot = touchState.shooting;
}
// 鍵盤控制邏輯
`;
        
        // 插入代碼
        const newContent = 
            backupContent.slice(0, insertPosition) + 
            touchControlsCode + 
            backupContent.slice(insertPosition);
        
        // 寫入文件
        fs.writeFileSync(jsFile, newContent, 'utf8');
        
        console.log('✅ TouchControls 整合完成');
        console.log(`📊 文件大小: ${newContent.length} 字符`);
        
        // 驗證語法結構
        const openBrackets = (newContent.match(/\{/g) || []).length;
        const closeBrackets = (newContent.match(/\}/g) || []).length;
        const openParens = (newContent.match(/\(/g) || []).length;
        const closeParens = (newContent.match(/\)/g) || []).length;
        
        console.log('🔍 語法驗證:');
        console.log(`  - 大括號平衡: ${openBrackets === closeBrackets ? '✅' : '❌'} (${openBrackets}/${closeBrackets})`);
        console.log(`  - 圓括號平衡: ${openParens === closeParens ? '✅' : '❌'} (${openParens}/${closeParens})`);
        
    } else {
        console.log('❌ 未找到正確的插入位置');
    }
    
} catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error.message);
}

console.log('🎉 最終語法修復完成！');
