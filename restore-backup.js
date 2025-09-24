const fs = require('fs');

console.log('🔄 恢復遊戲文件備份...');

const gameFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = gameFile + '.backup-before-integration';

try {
    // 檢查備份文件是否存在
    if (!fs.existsSync(backupFile)) {
        console.log('❌ 備份文件不存在，無法恢復');
        return;
    }
    
    // 讀取備份文件
    console.log('📖 讀取備份文件...');
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    
    // 恢復原始文件
    console.log('💾 恢復原始遊戲文件...');
    fs.writeFileSync(gameFile, backupContent, 'utf8');
    
    // 驗證恢復
    const restoredContent = fs.readFileSync(gameFile, 'utf8');
    const isRestored = restoredContent === backupContent;
    
    console.log(`✅ 文件恢復${isRestored ? '成功' : '失敗'}`);
    console.log(`📊 恢復後文件大小: ${restoredContent.length} 字符`);
    
    // 檢查是否還有整合代碼
    const hasIntegrationCode = restoredContent.includes('window.touchControls');
    console.log(`🔍 整合代碼已清除: ${!hasIntegrationCode ? '✅' : '❌'}`);
    
    if (isRestored && !hasIntegrationCode) {
        console.log('🎉 備份恢復完成！遊戲文件已回到整合前的狀態');
    }
    
} catch (error) {
    console.error('❌ 恢復過程中發生錯誤:', error.message);
}

console.log('🔄 備份恢復腳本執行完成！');
