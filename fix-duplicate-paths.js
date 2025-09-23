const fs = require('fs');

// 修復重複路徑前綴問題
function fixDuplicatePaths() {
    console.log('🔧 修復 Fate 遊戲重複路徑前綴問題...');
    
    const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
    
    if (!fs.existsSync(jsFilePath)) {
        console.error('❌ JavaScript 文件不存在:', jsFilePath);
        return;
    }
    
    // 讀取 JavaScript 文件
    let jsContent = fs.readFileSync(jsFilePath, 'utf8');
    console.log('📖 讀取 JavaScript 文件:', jsFilePath);
    console.log('📏 文件大小:', jsContent.length, '字符');
    
    let totalReplacements = 0;
    
    // 修復重複的路徑前綴
    const duplicatePathFixes = [
        {
            from: /\/games\/fate-game\/dist\/\/games\/fate-game\/dist\//g,
            to: '/games/fate-game/dist/',
            description: '重複的路徑前綴'
        }
    ];
    
    duplicatePathFixes.forEach(({ from, to, description }) => {
        const beforeMatches = jsContent.match(from);
        if (beforeMatches) {
            console.log(`🔄 修復 ${beforeMatches.length} 個 ${description}`);
            beforeMatches.forEach((match, i) => {
                console.log(`  修復前 ${i + 1}: ${match}`);
            });
            
            jsContent = jsContent.replace(from, to);
            totalReplacements += beforeMatches.length;
            
            console.log(`  修復後: ${to}`);
        }
    });
    
    // 寫入修復後的文件
    if (totalReplacements > 0) {
        fs.writeFileSync(jsFilePath, jsContent);
        console.log(`✅ 重複路徑前綴修復完成！`);
        console.log(`📊 總共修復了 ${totalReplacements} 個重複前綴`);
        console.log(`📁 文件已更新: ${jsFilePath}`);
    } else {
        console.log('⚠️ 沒有找到重複的路徑前綴');
    }
    
    // 驗證修復結果 - 檢查所有音效路徑
    const fixedContent = fs.readFileSync(jsFilePath, 'utf8');
    const allSoundPaths = fixedContent.match(/["'`][^"'`]*sounds[^"'`]*\.mp3["'`]/g);
    if (allSoundPaths) {
        console.log('✅ 最終的音效路徑:');
        allSoundPaths.forEach((path, i) => {
            console.log(`  ${i + 1}. ${path}`);
        });
    }
}

// 執行修復
fixDuplicatePaths();
