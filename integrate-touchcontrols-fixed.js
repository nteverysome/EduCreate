const fs = require('fs');

console.log('🎮 開始修復版 TouchControls 與 Phaser 遊戲邏輯整合...');

const gameFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = gameFile + '.backup-before-integration-v2';

try {
    // 1. 創建新備份
    console.log('💾 創建新的遊戲文件備份...');
    const originalContent = fs.readFileSync(gameFile, 'utf8');
    fs.writeFileSync(backupFile, originalContent, 'utf8');
    console.log('✅ 新備份已創建:', backupFile);
    
    // 2. 分析文件結構
    console.log('📊 分析遊戲文件結構...');
    console.log(`文件大小: ${originalContent.length} 字符`);
    
    // 3. 準備修復版整合代碼
    console.log('🔧 準備修復版 TouchControls 整合代碼...');
    
    // 更安全的整合代碼，避免語法錯誤
    const touchControlsIntegration = `
        // TouchControls 整合 - 修復版
        if(typeof window!=='undefined'&&window.touchControls){
            try{
                var ts=window.touchControls.getInputState();
                if(ts&&ts.direction){
                    if(ts.direction.x<-0.1){this.x-=5;if(this.anims)this.anims.play(this.name+"left",true);}
                    if(ts.direction.x>0.1){this.x+=5;if(this.anims)this.anims.play(this.name+"right",true);}
                    if(ts.direction.y<-0.1)this.y-=5;
                    if(ts.direction.y>0.1)this.y+=5;
                }
                if(ts&&ts.shooting&&!this.lastTouchShoot){if(this.shoot)this.shoot();}
                this.lastTouchShoot=ts?ts.shooting:false;
            }catch(e){console.warn('TouchControls error:',e);}
        }`;
    
    // 4. 尋找更安全的整合位置
    console.log('🎯 尋找安全的整合位置...');
    
    // 尋找 Player 類的 update 方法中的鍵盤控制部分
    // 尋找 this.cursor.left.isDown 之前的位置
    const keyboardControlPattern = /this\.cursor\.left\.isDown/;
    const match = originalContent.search(keyboardControlPattern);
    
    if (match === -1) {
        console.log('❌ 未找到鍵盤控制代碼，嘗試其他位置');
        
        // 備用方案：尋找 this.death || ( 模式
        const deathPattern = /this\.death\s*\|\|\s*\(/;
        const deathMatch = originalContent.search(deathPattern);
        
        if (deathMatch === -1) {
            console.log('❌ 未找到合適的整合位置');
            return;
        }
        
        console.log('✅ 找到備用整合位置 (death check)');
        
        // 在 this.death || ( 之後插入
        const insertPosition = deathMatch + originalContent.match(deathPattern)[0].length;
        
        const newContent = 
            originalContent.slice(0, insertPosition) +
            touchControlsIntegration +
            ',' +
            originalContent.slice(insertPosition);
        
        // 寫入文件
        fs.writeFileSync(gameFile, newContent, 'utf8');
        
    } else {
        console.log('✅ 找到鍵盤控制位置');
        
        // 在鍵盤控制之前插入 TouchControls 代碼
        const newContent = 
            originalContent.slice(0, match) +
            touchControlsIntegration +
            '\n        ' +
            originalContent.slice(match);
        
        // 寫入文件
        fs.writeFileSync(gameFile, newContent, 'utf8');
    }
    
    // 5. 驗證整合結果
    console.log('🔍 驗證整合結果...');
    const newContent = fs.readFileSync(gameFile, 'utf8');
    
    // 基本語法檢查
    const hasMatchingBraces = (newContent.match(/\{/g) || []).length === (newContent.match(/\}/g) || []).length;
    const hasMatchingParens = (newContent.match(/\(/g) || []).length === (newContent.match(/\)/g) || []).length;
    const hasIntegrationCode = newContent.includes('TouchControls 整合');
    
    console.log(`括號匹配: ${hasMatchingBraces ? '✅' : '❌'}`);
    console.log(`圓括號匹配: ${hasMatchingParens ? '✅' : '❌'}`);
    console.log(`整合代碼存在: ${hasIntegrationCode ? '✅' : '❌'}`);
    
    if (!hasMatchingBraces || !hasMatchingParens) {
        console.log('❌ 語法檢查失敗，恢復備份');
        fs.writeFileSync(gameFile, originalContent, 'utf8');
        return;
    }
    
    console.log('✅ 修復版 TouchControls 整合完成！');
    console.log('🎮 整合改進:');
    console.log('  - 添加了更安全的錯誤處理');
    console.log('  - 改進了變數宣告方式');
    console.log('  - 添加了存在性檢查');
    console.log('  - 使用更保守的語法結構');
    console.log('  - 添加了調試日誌');
    
    console.log('📋 下一步:');
    console.log('  1. 測試遊戲載入是否正常');
    console.log('  2. 測試 TouchControls 是否能控制遊戲');
    console.log('  3. 驗證鍵盤控制是否仍然正常');
    
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

console.log('🎉 修復版 TouchControls 整合腳本執行完成！');
