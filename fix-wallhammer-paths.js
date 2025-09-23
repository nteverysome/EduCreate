const fs = require('fs');
const path = require('path');

// 修復 WallHammer 遊戲的資源路徑
function fixWallHammerPaths() {
    console.log('🔧 開始修復 WallHammer 遊戲資源路徑...');
    
    const jsFilePath = 'public/games/wallhammer-game/dist/assets/index-Du4WbNGK.js';
    
    if (!fs.existsSync(jsFilePath)) {
        console.error('❌ JavaScript 文件不存在:', jsFilePath);
        return;
    }
    
    // 讀取 JavaScript 文件
    let jsContent = fs.readFileSync(jsFilePath, 'utf8');
    console.log('📖 讀取 JavaScript 文件:', jsFilePath);
    console.log('📏 文件大小:', jsContent.length, '字符');
    
    // 記錄修復前的一些路徑範例
    const beforeSamples = jsContent.match(/"assets\/[^"]+"/g);
    if (beforeSamples) {
        console.log('🔍 修復前路徑範例:', beforeSamples.slice(0, 5));
    }
    
    // 修復資源路徑 - 將相對路徑轉換為絕對路徑
    const pathReplacements = [
        // 圖片資源
        { from: /"assets\/images\/([^"]+)"/g, to: '"/games/wallhammer-game/dist/assets/images/$1"' },

        // 字體資源
        { from: /"assets\/fonts\/([^"]+)"/g, to: '"/games/wallhammer-game/dist/assets/fonts/$1"' },

        // 音效資源
        { from: /"assets\/sounds\/([^"]+)"/g, to: '"/games/wallhammer-game/dist/assets/sounds/$1"' },

        // 地圖資源
        { from: /"assets\/maps\/([^"]+)"/g, to: '"/games/wallhammer-game/dist/assets/maps/$1"' },

        // CSS 資源
        { from: /"assets\/css\/([^"]+)"/g, to: '"/games/wallhammer-game/dist/assets/css/$1"' },

        // HTML 資源
        { from: /"assets\/html\/([^"]+)"/g, to: '"/games/wallhammer-game/dist/assets/html/$1"' },

        // 動態路徑修復 - 模板字符串和變數路徑
        { from: /`assets\/sounds\/music\$\{e\}\.mp3`/g, to: '`/games/wallhammer-game/dist/assets/sounds/music${e}.mp3`' },
        { from: /`assets\/images\/brick\$\{e\}\.png`/g, to: '`/games/wallhammer-game/dist/assets/images/brick${e}.png`' },
        { from: /`assets\/images\/platform\$\{e\+2\}\.png`/g, to: '`/games/wallhammer-game/dist/assets/images/platform${e+2}.png`' },
        { from: /`assets\/maps\/scene\$\{e\}\.json`/g, to: '`/games/wallhammer-game/dist/assets/maps/scene${e}.json`' },

        // 字符串拼接路徑修復
        { from: /"assets\/sounds\/music"\+e\+"\.mp3"/g, to: '"/games/wallhammer-game/dist/assets/sounds/music"+e+".mp3"' },
        { from: /"assets\/images\/brick"\+e\+"\.png"/g, to: '"/games/wallhammer-game/dist/assets/images/brick"+e+".png"' },
        { from: /"assets\/images\/platform"\+\(e\+2\)\+"\.png"/g, to: '"/games/wallhammer-game/dist/assets/images/platform"+(e+2)+".png"' },
        { from: /"assets\/maps\/scene"\+e\+"\.json"/g, to: '"/games/wallhammer-game/dist/assets/maps/scene"+e+".json"' }
    ];
    
    let totalReplacements = 0;
    
    // 執行路徑替換
    pathReplacements.forEach(replacement => {
        const matches = jsContent.match(replacement.from);
        if (matches) {
            console.log(`🔄 修復 ${matches.length} 個 ${replacement.from.source} 路徑`);
            jsContent = jsContent.replace(replacement.from, replacement.to);
            totalReplacements += matches.length;
        }
    });
    
    // 修復遊戲容器 ID (如果需要)
    const containerIdMatches = jsContent.match(/"contenedor"/g);
    if (containerIdMatches) {
        console.log(`🔄 修復 ${containerIdMatches.length} 個容器 ID`);
        jsContent = jsContent.replace(/"contenedor"/g, '"game-container"');
        totalReplacements += containerIdMatches.length;
    }
    
    // 檢查是否有其他可能的容器 ID
    const appIdMatches = jsContent.match(/"app"/g);
    if (appIdMatches && appIdMatches.length < 10) { // 避免替換太多非容器相關的 "app"
        console.log(`🔄 檢查到 ${appIdMatches.length} 個 "app" 引用`);
        // 只替換明顯是 DOM 選擇器的部分
        jsContent = jsContent.replace(/getElementById\("app"\)/g, 'getElementById("game-container")');
    }
    
    // 記錄修復後的一些路徑範例
    const afterSamples = jsContent.match(/\/games\/wallhammer-game\/dist\/assets\/[^"]+/g);
    if (afterSamples) {
        console.log('✅ 修復後路徑範例:', afterSamples.slice(0, 5));
    }
    
    // 寫入修復後的文件
    fs.writeFileSync(jsFilePath, jsContent);
    
    console.log(`✅ WallHammer 路徑修復完成！`);
    console.log(`📊 總共修復了 ${totalReplacements} 個路徑引用`);
    console.log(`📁 文件已更新: ${jsFilePath}`);
}

// 執行修復
fixWallHammerPaths();
