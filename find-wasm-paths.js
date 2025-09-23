const fs = require('fs');

// 尋找並修復 WebAssembly 路徑
function findWasmPaths() {
    console.log('🔍 尋找 Fate 遊戲中的 WebAssembly 路徑...');
    
    const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
    
    if (!fs.existsSync(jsFilePath)) {
        console.error('❌ JavaScript 文件不存在:', jsFilePath);
        return;
    }
    
    // 讀取 JavaScript 文件
    let jsContent = fs.readFileSync(jsFilePath, 'utf8');
    console.log('📖 讀取 JavaScript 文件:', jsFilePath);
    console.log('📏 文件大小:', jsContent.length, '字符');
    
    // 尋找所有可能的 ammo 相關路徑
    const searchPatterns = [
        /["'`][^"'`]*ammo[^"'`]*["'`]/gi,
        /["'`][^"'`]*\.wasm[^"'`]*["'`]/gi,
        /["'`][^"'`]*assets[^"'`]*["'`]/gi
    ];
    
    let allMatches = [];
    
    searchPatterns.forEach((pattern, index) => {
        const matches = jsContent.match(pattern);
        if (matches) {
            console.log(`\n🔍 模式 ${index + 1} 找到 ${matches.length} 個匹配:`);
            matches.forEach((match, i) => {
                if (i < 10) { // 只顯示前10個
                    console.log(`  ${i + 1}. ${match}`);
                    allMatches.push(match);
                }
            });
            if (matches.length > 10) {
                console.log(`  ... 還有 ${matches.length - 10} 個匹配`);
            }
        }
    });
    
    // 特別尋找 ./assets/ 開頭的路徑
    const relativeAssetPaths = jsContent.match(/["'`]\.\/assets\/[^"'`]+["'`]/gi);
    if (relativeAssetPaths) {
        console.log(`\n🎯 找到 ${relativeAssetPaths.length} 個相對 assets 路徑:`);
        relativeAssetPaths.forEach((path, i) => {
            if (i < 20) {
                console.log(`  ${i + 1}. ${path}`);
            }
        });
    }
    
    // 尋找可能的動態路徑構建
    const dynamicPaths = jsContent.match(/["'`][^"'`]*\+[^"'`]*assets[^"'`]*["'`]/gi);
    if (dynamicPaths) {
        console.log(`\n🔧 找到 ${dynamicPaths.length} 個動態路徑構建:`);
        dynamicPaths.forEach((path, i) => {
            if (i < 10) {
                console.log(`  ${i + 1}. ${path}`);
            }
        });
    }
    
    // 現在執行修復
    console.log('\n🔧 開始執行路徑修復...');
    
    let totalReplacements = 0;
    
    // 修復相對路徑
    const replacements = [
        {
            from: /["'`]\.\/assets\/ammo\/([^"'`]+)["'`]/gi,
            to: '"/games/fate-game/dist/assets/ammo/$1"',
            description: '相對 ammo 路徑'
        },
        {
            from: /["'`]\.\/assets\/([^"'`]+)["'`]/gi,
            to: '"/games/fate-game/dist/assets/$1"',
            description: '相對 assets 路徑'
        }
    ];
    
    replacements.forEach(({ from, to, description }) => {
        const beforeMatches = jsContent.match(from);
        if (beforeMatches) {
            console.log(`🔄 修復 ${beforeMatches.length} 個 ${description}`);
            beforeMatches.forEach((match, i) => {
                if (i < 5) {
                    console.log(`  修復前: ${match}`);
                }
            });
            
            jsContent = jsContent.replace(from, to);
            totalReplacements += beforeMatches.length;
            
            // 顯示修復後的範例
            const afterMatches = jsContent.match(new RegExp(to.replace(/\$1/g, '[^"\'`]+'), 'gi'));
            if (afterMatches && afterMatches.length > 0) {
                console.log(`  修復後範例: ${afterMatches[0]}`);
            }
        }
    });
    
    // 寫入修復後的文件
    if (totalReplacements > 0) {
        fs.writeFileSync(jsFilePath, jsContent);
        console.log(`\n✅ WebAssembly 路徑修復完成！`);
        console.log(`📊 總共修復了 ${totalReplacements} 個路徑引用`);
        console.log(`📁 文件已更新: ${jsFilePath}`);
    } else {
        console.log('\n⚠️ 沒有找到需要修復的路徑');
    }
}

// 執行尋找和修復
findWasmPaths();
