const fs = require('fs');

// 修復特定的問題路徑
function fixSpecificPaths() {
    console.log('🔧 修復 Fate 遊戲特定問題路徑...');
    
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
    
    // 根據網路請求錯誤，修復特定路徑
    const specificFixes = [
        // 修復 hit 音效路徑（缺少 /dist/）
        {
            from: /assets\/sounds\/hit(\d+)\.mp3/g,
            to: '/games/fate-game/dist/assets/sounds/hit$1.mp3',
            description: 'hit 音效路徑'
        },
        // 修復可能的其他音效路徑
        {
            from: /"assets\/sounds\/hit/g,
            to: '"/games/fate-game/dist/assets/sounds/hit',
            description: 'hit 音效路徑前綴'
        }
    ];
    
    specificFixes.forEach(({ from, to, description }) => {
        const beforeMatches = jsContent.match(from);
        if (beforeMatches) {
            console.log(`🔄 修復 ${beforeMatches.length} 個 ${description}`);
            beforeMatches.slice(0, 5).forEach((match, i) => {
                console.log(`  修復前 ${i + 1}: ${match}`);
            });
            
            jsContent = jsContent.replace(from, to);
            totalReplacements += beforeMatches.length;
            
            // 顯示修復後的範例
            const afterMatches = jsContent.match(new RegExp(to.replace(/\$1/g, '\\d+'), 'g'));
            if (afterMatches) {
                console.log(`  修復後範例: ${afterMatches[0]}`);
            }
        }
    });
    
    // 搜索並顯示所有 hit 相關路徑
    const hitPaths = jsContent.match(/[^a-zA-Z]hit\d+\.mp3/g);
    if (hitPaths) {
        console.log(`🔍 找到 ${hitPaths.length} 個 hit 音效引用:`);
        hitPaths.forEach((path, i) => {
            console.log(`  ${i + 1}. ${path}`);
        });
    }
    
    // 搜索所有音效相關路徑
    const soundPaths = jsContent.match(/["'`][^"'`]*sounds[^"'`]*\.mp3["'`]/g);
    if (soundPaths) {
        console.log(`🔍 找到 ${soundPaths.length} 個音效路徑:`);
        soundPaths.slice(0, 10).forEach((path, i) => {
            console.log(`  ${i + 1}. ${path}`);
        });
    }
    
    // 寫入修復後的文件
    if (totalReplacements > 0) {
        fs.writeFileSync(jsFilePath, jsContent);
        console.log(`✅ 特定路徑修復完成！`);
        console.log(`📊 總共修復了 ${totalReplacements} 個路徑引用`);
        console.log(`📁 文件已更新: ${jsFilePath}`);
    } else {
        console.log('⚠️ 沒有找到需要修復的特定路徑');
    }
}

// 執行修復
fixSpecificPaths();
