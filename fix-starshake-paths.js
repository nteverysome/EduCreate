const fs = require('fs');
const path = require('path');

// 修復 Starshake 遊戲中的資源路徑問題
function fixStarshakePaths() {
    console.log('🔧 修復 Starshake 遊戲資源路徑...');
    
    // 讀取 JavaScript 文件
    const jsFilePath = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
    
    if (!fs.existsSync(jsFilePath)) {
        console.error('❌ JavaScript 文件不存在:', jsFilePath);
        return;
    }
    
    let jsContent = fs.readFileSync(jsFilePath, 'utf8');
    
    // 替換所有相對路徑為絕對路徑
    const replacements = [
        // 字體文件
        { from: '"assets/fonts/', to: '"/games/starshake-game/dist/assets/fonts/' },
        // 圖片文件
        { from: '"assets/images/', to: '"/games/starshake-game/dist/assets/images/' },
        // 音效文件
        { from: '"assets/sounds/', to: '"/games/starshake-game/dist/assets/sounds/' },
        // CSS 文件
        { from: '"assets/css/', to: '"/games/starshake-game/dist/assets/css/' },
        // 其他 assets 引用
        { from: '`assets/', to: '`/games/starshake-game/dist/assets/' },
        { from: "'assets/", to: "'/games/starshake-game/dist/assets/" }
    ];
    
    let changesMade = 0;
    
    replacements.forEach(({ from, to }) => {
        const beforeLength = jsContent.length;
        jsContent = jsContent.split(from).join(to);
        const afterLength = jsContent.length;
        
        if (beforeLength !== afterLength) {
            changesMade++;
            console.log(`✅ 替換: ${from} -> ${to}`);
        }
    });
    
    if (changesMade > 0) {
        // 寫回文件
        fs.writeFileSync(jsFilePath, jsContent, 'utf8');
        console.log(`🎉 成功修復 ${changesMade} 個路徑問題`);
    } else {
        console.log('ℹ️  沒有發現需要修復的路徑');
    }
    
    // 檢查容器 ID 問題
    console.log('🔍 檢查容器 ID 配置...');
    
    if (jsContent.includes('"contenedor"')) {
        jsContent = jsContent.replace('"contenedor"', '"game-container"');
        fs.writeFileSync(jsFilePath, jsContent, 'utf8');
        console.log('✅ 修復容器 ID: contenedor -> game-container');
    } else if (jsContent.includes('"app"')) {
        jsContent = jsContent.replace('"app"', '"game-container"');
        fs.writeFileSync(jsFilePath, jsContent, 'utf8');
        console.log('✅ 修復容器 ID: app -> game-container');
    } else {
        console.log('ℹ️  容器 ID 配置正確');
    }
    
    console.log('🚀 Starshake 遊戲路徑修復完成！');
}

// 執行修復
fixStarshakePaths();
