const fs = require('fs');

// 修復 Fate 遊戲的 WebAssembly 路徑
function fixFateWasm() {
    console.log('🔧 開始修復 Fate 遊戲 WebAssembly 路徑...');
    
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
    
    // 尋找 WebAssembly 相關路徑
    const wasmPatterns = [
        // 直接的 ./assets/ammo/ 路徑
        {
            from: /["']\.\/assets\/ammo\/([^"']+)["']/g,
            to: '"/games/fate-game/dist/assets/ammo/$1"',
            description: '相對 WebAssembly 路徑'
        },
        // 可能的 assets/ammo/ 路徑
        {
            from: /["']assets\/ammo\/([^"']+)["']/g,
            to: '"/games/fate-game/dist/assets/ammo/$1"',
            description: 'WebAssembly 路徑'
        },
        // 模板字符串中的路徑
        {
            from: /`\.\/assets\/ammo\/([^`]+)`/g,
            to: '`/games/fate-game/dist/assets/ammo/$1`',
            description: '模板字符串 WebAssembly 路徑'
        },
        // 字符串拼接中的路徑
        {
            from: /"\.\/assets\/ammo\/"\s*\+/g,
            to: '"/games/fate-game/dist/assets/ammo/" +',
            description: '字符串拼接 WebAssembly 路徑'
        }
    ];
    
    // 執行 WebAssembly 路徑替換
    wasmPatterns.forEach(({ from, to, description }) => {
        const matches = jsContent.match(from);
        if (matches) {
            console.log(`🔄 修復 ${matches.length} 個 ${description}`);
            matches.forEach((match, index) => {
                console.log(`  ${index + 1}. ${match}`);
            });
            jsContent = jsContent.replace(from, to);
            totalReplacements += matches.length;
        }
    });
    
    // 特殊處理：尋找可能的動態路徑構建
    const dynamicPathMatches = jsContent.match(/['"]\.[\/\\]assets[\/\\]ammo[\/\\]['"]/g);
    if (dynamicPathMatches) {
        console.log(`🔍 找到 ${dynamicPathMatches.length} 個動態路徑構建`);
        dynamicPathMatches.forEach((match, index) => {
            console.log(`  ${index + 1}. ${match}`);
        });
    }
    
    // 檢查是否有其他可能的 ammo 引用
    const ammoReferences = jsContent.match(/ammo\.(js|wasm)/gi);
    if (ammoReferences) {
        console.log(`🔍 找到 ${ammoReferences.length} 個 ammo 文件引用`);
        ammoReferences.forEach((match, index) => {
            console.log(`  ${index + 1}. ${match}`);
        });
    }
    
    // 寫入修復後的文件
    fs.writeFileSync(jsFilePath, jsContent);
    
    console.log(`✅ Fate WebAssembly 路徑修復完成！`);
    console.log(`📊 總共修復了 ${totalReplacements} 個路徑引用`);
    console.log(`📁 文件已更新: ${jsFilePath}`);
    
    // 驗證修復結果
    const fixedContent = fs.readFileSync(jsFilePath, 'utf8');
    const fixedPaths = fixedContent.match(/\/games\/fate-game\/dist\/assets\/ammo\/[^"'`]+/g);
    if (fixedPaths) {
        console.log('✅ 修復後的 WebAssembly 路徑:', fixedPaths.slice(0, 3));
    }
}

// 執行修復
fixFateWasm();
