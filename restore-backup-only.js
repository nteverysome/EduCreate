const fs = require('fs');

console.log('🔄 恢復到穩定的備份版本...');

const jsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const backupFile = jsFile + '.backup';

try {
    // 完全恢復備份
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    fs.writeFileSync(jsFile, backupContent, 'utf8');
    
    console.log('✅ 已恢復到穩定的備份版本');
    console.log(`📊 文件大小: ${backupContent.length} 字符`);
    console.log('🎮 遊戲應該能正常載入，但 TouchControls 暫時不會影響遊戲');
    
} catch (error) {
    console.error('❌ 恢復過程中發生錯誤:', error.message);
}

console.log('🎉 恢復完成！');
