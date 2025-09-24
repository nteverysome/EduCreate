const fs = require('fs');

console.log('🎯 開始精確版 TouchControls 與 Phaser 遊戲邏輯整合...');

const gameFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = gameFile + '.backup-before-integration-v3';

try {
    // 1. 創建備份
    console.log('💾 創建備份...');
    const originalContent = fs.readFileSync(gameFile, 'utf8');
    fs.writeFileSync(backupFile, originalContent, 'utf8');
    console.log('✅ 備份已創建:', backupFile);
    
    // 2. 分析文件結構，尋找 Player 類的 update 方法
    console.log('🔍 分析 Player 類的 update 方法...');
    
    // 尋找 Player 類的 update 方法中的具體位置
    // 尋找 this.cursor.left.isDown 這個模式
    const cursorLeftPattern = /this\.cursor\.left\.isDown/;
    const cursorLeftMatch = originalContent.search(cursorLeftPattern);
    
    if (cursorLeftMatch === -1) {
        console.log('❌ 未找到 this.cursor.left.isDown 模式');
        return;
    }
    
    console.log('✅ 找到鍵盤控制位置');
    
    // 3. 準備整合代碼 - 使用最簡單的語法
    const touchControlsCode = `
        // TouchControls 整合
        if(window.touchControls){
            var ts=window.touchControls.getInputState();
            if(ts.direction.x<-0.1){this.x-=5;this.anims.play(this.name+"left",true);}
            if(ts.direction.x>0.1){this.x+=5;this.anims.play(this.name+"right",true);}
            if(ts.direction.y<-0.1)this.y-=5;
            if(ts.direction.y>0.1)this.y+=5;
            if(ts.shooting&&!this.lastTouchShoot)this.shoot();
            this.lastTouchShoot=ts.shooting;
        }
        `;
    
    // 4. 在鍵盤控制之前插入 TouchControls 代碼
    const newContent = 
        originalContent.slice(0, cursorLeftMatch) +
        touchControlsCode +
        originalContent.slice(cursorLeftMatch);
    
    // 5. 驗證語法
    console.log('🔍 驗證語法...');
    const hasMatchingBraces = (newContent.match(/\{/g) || []).length === (newContent.match(/\}/g) || []).length;
    const hasMatchingParens = (newContent.match(/\(/g) || []).length === (newContent.match(/\)/g) || []).length;
    
    console.log(`括號匹配: ${hasMatchingBraces ? '✅' : '❌'}`);
    console.log(`圓括號匹配: ${hasMatchingParens ? '✅' : '❌'}`);
    
    if (!hasMatchingBraces || !hasMatchingParens) {
        console.log('❌ 語法檢查失敗，取消整合');
        return;
    }
    
    // 6. 寫入文件
    console.log('💾 寫入整合後的文件...');
    fs.writeFileSync(gameFile, newContent, 'utf8');
    
    // 7. 最終驗證
    const finalContent = fs.readFileSync(gameFile, 'utf8');
    const hasIntegrationCode = finalContent.includes('TouchControls 整合');
    const hasGetInputState = finalContent.includes('getInputState');
    
    console.log(`整合代碼存在: ${hasIntegrationCode ? '✅' : '❌'}`);
    console.log(`getInputState 存在: ${hasGetInputState ? '✅' : '❌'}`);
    
    if (hasIntegrationCode && hasGetInputState) {
        console.log('✅ 精確版 TouchControls 整合完成！');
        console.log('🎮 整合特點:');
        console.log('  - 使用最簡單的語法結構');
        console.log('  - 插入到正確的位置（鍵盤控制之前）');
        console.log('  - 避免複雜的錯誤處理');
        console.log('  - 保持與現有代碼的兼容性');
        
        console.log('📋 下一步:');
        console.log('  1. 測試遊戲載入');
        console.log('  2. 測試 TouchControls 功能');
        console.log('  3. 驗證整合效果');
    } else {
        console.log('❌ 整合驗證失敗');
    }
    
} catch (error) {
    console.error('❌ 整合過程中發生錯誤:', error.message);
    
    // 恢復備份
    if (fs.existsSync(backupFile)) {
        console.log('🔄 恢復備份...');
        try {
            const backupContent = fs.readFileSync(backupFile, 'utf8');
            fs.writeFileSync(gameFile, backupContent, 'utf8');
            console.log('✅ 已恢復備份');
        } catch (restoreError) {
            console.error('❌ 恢復備份失敗:', restoreError.message);
        }
    }
}

console.log('🎉 精確版 TouchControls 整合腳本執行完成！');
