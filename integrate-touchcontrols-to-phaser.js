const fs = require('fs');

console.log('🎮 開始 TouchControls 與 Phaser 遊戲邏輯整合...');

const gameFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = gameFile + '.backup-before-integration';

try {
    // 1. 創建備份
    console.log('💾 創建遊戲文件備份...');
    const originalContent = fs.readFileSync(gameFile, 'utf8');
    fs.writeFileSync(backupFile, originalContent, 'utf8');
    console.log('✅ 備份已創建:', backupFile);
    
    // 2. 檢查文件大小和基本結構
    console.log('📊 分析遊戲文件結構...');
    console.log(`文件大小: ${originalContent.length} 字符`);
    
    // 檢查是否包含 Player 類和 update 方法
    const hasPlayerClass = originalContent.includes('class Player') || originalContent.includes('Player=class');
    const hasUpdateMethod = originalContent.includes('update(') && originalContent.includes('this.death');
    
    console.log(`包含 Player 類: ${hasPlayerClass ? '✅' : '❌'}`);
    console.log(`包含 update 方法: ${hasUpdateMethod ? '✅' : '❌'}`);
    
    if (!hasUpdateMethod) {
        console.log('❌ 未找到 Player update 方法，無法進行整合');
        return;
    }
    
    // 3. 準備整合代碼
    console.log('🔧 準備 TouchControls 整合代碼...');
    
    // 簡化的整合代碼，避免語法錯誤
    const touchControlsIntegration = `
        // TouchControls 整合
        if(window.touchControls){
            try{
                const ts=window.touchControls.getInputState();
                if(ts.direction.x<-0.1){this.x-=5;this.anims.play(this.name+"left",true);}
                if(ts.direction.x>0.1){this.x+=5;this.anims.play(this.name+"right",true);}
                if(ts.direction.y<-0.1)this.y-=5;
                if(ts.direction.y>0.1)this.y+=5;
                if(ts.shooting&&!this.lastTouchShoot){this.shoot();}
                this.lastTouchShoot=ts.shooting;
            }catch(e){}
        }`;
    
    // 4. 尋找整合位置
    console.log('🎯 尋找整合位置...');
    
    // 尋找 Player 類的 update 方法中的特定模式
    // 尋找 this.death || ( 後面的位置
    const updatePattern = /this\.death\s*\|\|\s*\(/;
    const match = originalContent.match(updatePattern);
    
    if (!match) {
        console.log('❌ 未找到合適的整合位置');
        return;
    }
    
    console.log('✅ 找到整合位置');
    
    // 5. 執行整合
    console.log('🔄 執行 TouchControls 整合...');
    
    // 在 this.death || ( 之後插入 TouchControls 代碼
    const insertPosition = match.index + match[0].length;
    
    const newContent = 
        originalContent.slice(0, insertPosition) +
        touchControlsIntegration +
        ',' +
        originalContent.slice(insertPosition);
    
    // 6. 驗證新內容
    console.log('🔍 驗證整合後的代碼...');
    
    // 基本語法檢查
    const hasMatchingBraces = (newContent.match(/\{/g) || []).length === (newContent.match(/\}/g) || []).length;
    const hasMatchingParens = (newContent.match(/\(/g) || []).length === (newContent.match(/\)/g) || []).length;
    
    console.log(`括號匹配: ${hasMatchingBraces ? '✅' : '❌'}`);
    console.log(`圓括號匹配: ${hasMatchingParens ? '✅' : '❌'}`);
    
    if (!hasMatchingBraces || !hasMatchingParens) {
        console.log('❌ 語法檢查失敗，取消整合');
        return;
    }
    
    // 7. 寫入整合後的文件
    console.log('💾 寫入整合後的遊戲文件...');
    fs.writeFileSync(gameFile, newContent, 'utf8');
    
    console.log('✅ TouchControls 整合完成！');
    console.log('🎮 整合內容:');
    console.log('  - 添加了 TouchControls 狀態讀取');
    console.log('  - 實現了方向控制 (上下左右移動)');
    console.log('  - 實現了射擊控制');
    console.log('  - 添加了錯誤處理');
    console.log('  - 保持與鍵盤控制的兼容性');
    
    console.log('📋 下一步:');
    console.log('  1. 測試遊戲載入是否正常');
    console.log('  2. 測試 TouchControls 是否能控制遊戲');
    console.log('  3. 驗證鍵盤控制是否仍然正常');
    console.log('  4. 如有問題，可使用備份文件回滾');
    
} catch (error) {
    console.error('❌ 整合過程中發生錯誤:', error.message);
    
    // 如果出錯，嘗試恢復備份
    if (fs.existsSync(backupFile)) {
        console.log('🔄 嘗試從備份恢復...');
        try {
            const backupContent = fs.readFileSync(backupFile, 'utf8');
            fs.writeFileSync(gameFile, backupContent, 'utf8');
            console.log('✅ 已從備份恢復原始文件');
        } catch (restoreError) {
            console.error('❌ 恢復備份失敗:', restoreError.message);
        }
    }
}

console.log('🎉 TouchControls 整合腳本執行完成！');
