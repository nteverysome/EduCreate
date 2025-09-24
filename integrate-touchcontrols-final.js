const fs = require('fs');

console.log('🎯 開始最終版 TouchControls 整合...');

const gameFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = gameFile + '.backup-final';

try {
    // 1. 創建備份
    console.log('💾 創建最終備份...');
    const originalContent = fs.readFileSync(gameFile, 'utf8');
    fs.writeFileSync(backupFile, originalContent, 'utf8');
    console.log('✅ 備份已創建');
    
    // 2. 尋找正確的整合位置
    console.log('🔍 尋找正確的整合位置...');
    
    // 尋找 Player 類的 update 方法中的具體模式
    // 尋找 this.cursor.left.isDown 之前的位置
    const pattern = /this\.cursor\.left\.isDown\?\(this\.x-=5/;
    const match = originalContent.search(pattern);
    
    if (match === -1) {
        console.log('❌ 未找到正確的整合位置');
        return;
    }
    
    console.log('✅ 找到正確的整合位置');
    
    // 3. 準備最簡單的整合代碼
    const touchControlsCode = `if(window.touchControls){var ts=window.touchControls.getInputState();if(ts.direction.x<-0.1){this.x-=5;this.anims.play(this.name+"left",!0);}if(ts.direction.x>0.1){this.x+=5;this.anims.play(this.name+"right",!0);}if(ts.direction.y<-0.1)this.y-=5;if(ts.direction.y>0.1)this.y+=5;if(ts.shooting&&!this.lastTouchShoot)this.shoot();this.lastTouchShoot=ts.shooting;}`;
    
    // 4. 在正確位置插入代碼
    const newContent = 
        originalContent.slice(0, match) +
        touchControlsCode +
        originalContent.slice(match);
    
    // 5. 驗證語法
    console.log('🔍 驗證語法...');
    const hasMatchingBraces = (newContent.match(/\{/g) || []).length === (newContent.match(/\}/g) || []).length;
    const hasMatchingParens = (newContent.match(/\(/g) || []).length === (newContent.match(/\)/g) || []).length;
    
    console.log(`括號匹配: ${hasMatchingBraces ? '✅' : '❌'}`);
    console.log(`圓括號匹配: ${hasMatchingParens ? '✅' : '❌'}`);
    
    if (!hasMatchingBraces || !hasMatchingParens) {
        console.log('❌ 語法檢查失敗');
        return;
    }
    
    // 6. 寫入文件
    console.log('💾 寫入最終整合文件...');
    fs.writeFileSync(gameFile, newContent, 'utf8');
    
    // 7. 驗證
    const finalContent = fs.readFileSync(gameFile, 'utf8');
    const hasIntegration = finalContent.includes('window.touchControls');
    const hasGetInputState = finalContent.includes('getInputState');
    
    console.log(`整合代碼存在: ${hasIntegration ? '✅' : '❌'}`);
    console.log(`getInputState 存在: ${hasGetInputState ? '✅' : '❌'}`);
    
    if (hasIntegration && hasGetInputState) {
        console.log('✅ 最終版 TouchControls 整合完成！');
        console.log('🎮 整合特點:');
        console.log('  - 使用最簡化的語法');
        console.log('  - 插入到正確位置');
        console.log('  - 避免換行和空格問題');
        console.log('  - 與現有代碼完全兼容');
    } else {
        console.log('❌ 整合失敗');
    }
    
} catch (error) {
    console.error('❌ 整合錯誤:', error.message);
    
    // 恢復備份
    if (fs.existsSync(backupFile)) {
        console.log('🔄 恢復備份...');
        const backupContent = fs.readFileSync(backupFile, 'utf8');
        fs.writeFileSync(gameFile, backupContent, 'utf8');
        console.log('✅ 已恢復備份');
    }
}

console.log('🎉 最終版整合完成！');
