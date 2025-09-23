const fs = require('fs');
const path = require('path');

// 修復 PushPull 遊戲的資源路徑
function fixPushPullPaths() {
    const jsFile = 'public/games/pushpull-game/dist/assets/index-D29MUjmQ.js';
    
    console.log('🔧 開始修復 PushPull 遊戲資源路徑...');
    
    // 讀取文件
    let content = fs.readFileSync(jsFile, 'utf8');
    
    // 修復所有 assets/ 路徑為絕對路徑
    const pathReplacements = [
        // 字體文件
        ['"assets/fonts/mario.png"', '"/games/pushpull-game/dist/assets/fonts/mario.png"'],
        ['"assets/fonts/mario.xml"', '"/games/pushpull-game/dist/assets/fonts/mario.xml"'],
        
        // 圖片文件
        ['"assets/images/pello.png"', '"/games/pushpull-game/dist/assets/images/pello.png"'],
        ['"assets/images/background.png"', '"/games/pushpull-game/dist/assets/images/background.png"'],
        ['"assets/images/block_red.png"', '"/games/pushpull-game/dist/assets/images/block_red.png"'],
        ['"assets/images/block_green.png"', '"/games/pushpull-game/dist/assets/images/block_green.png"'],
        ['"assets/images/block_blue.png"', '"/games/pushpull-game/dist/assets/images/block_blue.png"'],
        ['"assets/images/block_yellow.png"', '"/games/pushpull-game/dist/assets/images/block_yellow.png"'],
        ['"assets/images/star.png"', '"/games/pushpull-game/dist/assets/images/star.png"'],
        ['"assets/images/spider.png"', '"/games/pushpull-game/dist/assets/images/spider.png"'],
        ['"assets/images/heart.png"', '"/games/pushpull-game/dist/assets/images/heart.png"'],
        ['"assets/images/frog.png"', '"/games/pushpull-game/dist/assets/images/frog.png"'],
        ['"assets/images/frog2.png"', '"/games/pushpull-game/dist/assets/images/frog2.png"'],
        ['"assets/images/trail.png"', '"/games/pushpull-game/dist/assets/images/trail.png"'],
        ['"assets/images/block.png"', '"/games/pushpull-game/dist/assets/images/block.png"'],
        
        // 地圖文件
        ['"assets/maps/tileset_fg.png"', '"/games/pushpull-game/dist/assets/maps/tileset_fg.png"'],
        
        // 音效文件
        ['"assets/sounds/music.mp3"', '"/games/pushpull-game/dist/assets/sounds/music.mp3"'],
        ['"assets/sounds/splash.mp3"', '"/games/pushpull-game/dist/assets/sounds/splash.mp3"'],
        ['"assets/sounds/win.mp3"', '"/games/pushpull-game/dist/assets/sounds/win.mp3"'],
        ['"assets/sounds/hover.mp3"', '"/games/pushpull-game/dist/assets/sounds/hover.mp3"'],
        ['"assets/sounds/select.mp3"', '"/games/pushpull-game/dist/assets/sounds/select.mp3"'],
        ['"assets/sounds/bump.mp3"', '"/games/pushpull-game/dist/assets/sounds/bump.mp3"'],
        ['"assets/sounds/move.mp3"', '"/games/pushpull-game/dist/assets/sounds/move.mp3"']
    ];
    
    // 修復地圖文件路徑 (動態生成的)
    for (let i = 0; i < 9; i++) {
        pathReplacements.push([
            `\`assets/maps/scene\${e}.json\``,
            `\`/games/pushpull-game/dist/assets/maps/scene\${e}.json\``
        ]);
    }
    
    // 應用所有路徑修復
    pathReplacements.forEach(([oldPath, newPath]) => {
        content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
    });
    
    // 修復遊戲容器 ID
    content = content.replace('"contenedor"', '"game-container"');
    
    // 寫回文件
    fs.writeFileSync(jsFile, content);
    
    console.log('✅ PushPull 遊戲資源路徑修復完成');
    console.log('✅ 遊戲容器 ID 已修復為 game-container');
}

// 執行修復
fixPushPullPaths();
