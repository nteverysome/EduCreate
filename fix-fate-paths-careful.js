const fs = require('fs');

// 小心修復 Fate 遊戲的資源路徑
function fixFatePathsCareful() {
    console.log('⚡ 開始小心修復 Fate 遊戲資源路徑...');
    
    const jsFilePath = 'public/games/fate-game/dist/assets/index-DBbMvyNZ.js';
    
    if (!fs.existsSync(jsFilePath)) {
        console.error('❌ JavaScript 文件不存在:', jsFilePath);
        return;
    }
    
    // 讀取 JavaScript 文件
    let jsContent = fs.readFileSync(jsFilePath, 'utf8');
    console.log('📖 讀取 JavaScript 文件:', jsFilePath);
    console.log('📏 文件大小:', jsContent.length, '字符');
    
    // 備份原始文件
    fs.writeFileSync(jsFilePath + '.backup', jsContent);
    console.log('💾 已創建備份文件');
    
    let totalReplacements = 0;
    
    // 只修復資源路徑，不修改遊戲邏輯
    const pathReplacements = [
        // 圖片資源
        { 
            from: /"assets\/images\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/images/$1"',
            description: '圖片路徑'
        },
        // 字體資源
        { 
            from: /"assets\/fonts\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/fonts/$1"',
            description: '字體路徑'
        },
        // 音效資源
        { 
            from: /"assets\/sounds\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/sounds/$1"',
            description: '音效路徑'
        },
        // CSS 資源
        { 
            from: /"assets\/css\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/css/$1"',
            description: 'CSS 路徑'
        },
        // HTML 資源
        { 
            from: /"assets\/html\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/html/$1"',
            description: 'HTML 路徑'
        },
        // 3D 物件資源
        { 
            from: /"assets\/objects\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/objects/$1"',
            description: '3D 物件路徑'
        },
        // 影片資源
        { 
            from: /"assets\/videos\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/videos/$1"',
            description: '影片路徑'
        },
        // WebAssembly 彈藥資源
        { 
            from: /"assets\/ammo\/([^"]+)"/g, 
            to: '"/games/fate-game/dist/assets/ammo/$1"',
            description: 'WebAssembly 路徑'
        }
    ];
    
    // 執行路徑替換
    pathReplacements.forEach(({ from, to, description }) => {
        const beforeMatches = jsContent.match(from);
        if (beforeMatches) {
            console.log(`🔄 修復 ${beforeMatches.length} 個 ${description}`);
            jsContent = jsContent.replace(from, to);
            totalReplacements += beforeMatches.length;
            
            // 驗證替換結果
            const afterMatches = jsContent.match(new RegExp(to.replace(/\$1/g, '[^"]+'), 'g'));
            if (afterMatches && afterMatches.length === beforeMatches.length) {
                console.log(`  ✅ ${description} 替換成功`);
            } else {
                console.log(`  ⚠️ ${description} 替換可能有問題`);
            }
        }
    });
    
    // 寫入修復後的文件
    fs.writeFileSync(jsFilePath, jsContent);
    
    console.log(`✅ Fate 路徑修復完成！`);
    console.log(`📊 總共修復了 ${totalReplacements} 個路徑引用`);
    console.log(`📁 文件已更新: ${jsFilePath}`);
    console.log(`💾 備份文件: ${jsFilePath}.backup`);
    
    // 驗證文件完整性
    const newContent = fs.readFileSync(jsFilePath, 'utf8');
    if (newContent.length > 0 && newContent.includes('Phaser')) {
        console.log('✅ 文件完整性檢查通過');
    } else {
        console.log('❌ 文件完整性檢查失敗，恢復備份');
        fs.writeFileSync(jsFilePath, jsContent);
    }
}

// 執行修復
fixFatePathsCareful();
