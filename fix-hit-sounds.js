const fs = require('fs');

// 修復 hit 音效路徑問題
function fixHitSounds() {
    console.log('🔧 修復 Fate 遊戲 hit 音效路徑問題...');
    
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
    
    // 修復 hit 音效的特定問題
    const hitSoundFixes = [
        // 修復模板字符串中的 hit 音效路徑
        {
            from: /`assets\/sounds\/hit\$\{e\+1\}\.mp3`/g,
            to: '`/games/fate-game/dist/assets/sounds/hit${e+1}.mp3`',
            description: 'hit 音效模板字符串'
        },
        // 修復字符串中的 hit 音效路徑
        {
            from: /"assets\/sounds\/hit\$\{e\+1\}\.mp3"/g,
            to: '"/games/fate-game/dist/assets/sounds/hit${e+1}.mp3"',
            description: 'hit 音效字符串'
        },
        // 修復其他可能的 hit 音效路徑格式
        {
            from: /assets\/sounds\/hit\$\{e\+1\}\.mp3/g,
            to: '/games/fate-game/dist/assets/sounds/hit${e+1}.mp3',
            description: 'hit 音效路徑（無引號）'
        }
    ];
    
    hitSoundFixes.forEach(({ from, to, description }) => {
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
    
    // 檢查是否還有其他未修復的 assets/sounds 路徑
    const remainingAssetsPaths = jsContent.match(/(?<!\/games\/fate-game\/dist\/)assets\/sounds\/[^"'`\s]+/g);
    if (remainingAssetsPaths) {
        console.log(`⚠️ 發現 ${remainingAssetsPaths.length} 個未修復的 assets/sounds 路徑:`);
        remainingAssetsPaths.forEach((path, i) => {
            console.log(`  ${i + 1}. ${path}`);
        });
        
        // 嘗試修復這些路徑
        remainingAssetsPaths.forEach(path => {
            const fixedPath = '/games/fate-game/dist/' + path;
            jsContent = jsContent.replace(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fixedPath);
            totalReplacements++;
            console.log(`  修復: ${path} -> ${fixedPath}`);
        });
    }
    
    // 寫入修復後的文件
    if (totalReplacements > 0) {
        fs.writeFileSync(jsFilePath, jsContent);
        console.log(`✅ hit 音效路徑修復完成！`);
        console.log(`📊 總共修復了 ${totalReplacements} 個路徑引用`);
        console.log(`📁 文件已更新: ${jsFilePath}`);
        
        // 驗證修復結果
        const fixedContent = fs.readFileSync(jsFilePath, 'utf8');
        const allSoundPaths = fixedContent.match(/["'`][^"'`]*sounds[^"'`]*\.mp3["'`]/g);
        if (allSoundPaths) {
            console.log('✅ 修復後的音效路徑:');
            allSoundPaths.forEach((path, i) => {
                console.log(`  ${i + 1}. ${path}`);
            });
        }
    } else {
        console.log('⚠️ 沒有找到需要修復的 hit 音效路徑');
    }
}

// 執行修復
fixHitSounds();
