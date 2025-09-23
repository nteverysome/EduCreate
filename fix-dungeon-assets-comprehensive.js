const fs = require('fs');

console.log('🔧 全面修復 Dungeon 遊戲的資源路徑...');

const jsFile = 'public/games/dungeon-game/dist/assets/index-CQq0-1Ik.js';

if (fs.existsSync(jsFile)) {
    console.log('📝 修復主要 JavaScript 文件:', jsFile);
    
    let content = fs.readFileSync(jsFile, 'utf8');
    let fixCount = 0;
    
    // 修復所有 assets/ 開頭的路徑
    const assetsPaths = [
        // 字體
        { from: /"assets\/fonts\/pico\.png"/g, to: '"/games/dungeon-game/dist/assets/fonts/pico.png"' },
        { from: /"assets\/fonts\/pico\.xml"/g, to: '"/games/dungeon-game/dist/assets/fonts/pico.xml"' },
        
        // 圖片
        { from: /"assets\/images\/pello_ok\.png"/g, to: '"/games/dungeon-game/dist/assets/images/pello_ok.png"' },
        { from: /"assets\/images\/fireball\.png"/g, to: '"/games/dungeon-game/dist/assets/images/fireball.png"' },
        { from: /"assets\/images\/block\.png"/g, to: '"/games/dungeon-game/dist/assets/images/block.png"' },
        { from: /"assets\/images\/seesaw\.png"/g, to: '"/games/dungeon-game/dist/assets/images/seesaw.png"' },
        { from: /"assets\/images\/bubble\.png"/g, to: '"/games/dungeon-game/dist/assets/images/bubble.png"' },
        { from: /"assets\/images\/platform\.png"/g, to: '"/games/dungeon-game/dist/assets/images/platform.png"' },
        { from: /"assets\/images\/player\.png"/g, to: '"/games/dungeon-game/dist/assets/images/player.png"' },
        { from: /"assets\/images\/dust\.png"/g, to: '"/games/dungeon-game/dist/assets/images/dust.png"' },
        { from: /"assets\/images\/coin\.png"/g, to: '"/games/dungeon-game/dist/assets/images/coin.png"' },
        { from: /"assets\/images\/keys\.png"/g, to: '"/games/dungeon-game/dist/assets/images/keys.png"' },
        { from: /"assets\/images\/bat\.png"/g, to: '"/games/dungeon-game/dist/assets/images/bat.png"' },
        { from: /"assets\/images\/wizard\.png"/g, to: '"/games/dungeon-game/dist/assets/images/wizard.png"' },
        
        // 地圖
        { from: /"assets\/maps\/pixel-poem-tiles\.png"/g, to: '"/games/dungeon-game/dist/assets/maps/pixel-poem-tiles.png"' },
        { from: /"assets\/maps\/level\.json"/g, to: '"/games/dungeon-game/dist/assets/maps/level.json"' },
        
        // 音效 - 使用模板字符串修復
        { from: /`assets\/sounds\/climb\$\{e\}\.mp3`/g, to: '`/games/dungeon-game/dist/assets/sounds/climb${e}.mp3`' },
        { from: /"assets\/sounds\/splash\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/splash.mp3"' },
        { from: /"assets\/sounds\/music\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/music.mp3"' },
        { from: /"assets\/sounds\/jump\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/jump.mp3"' },
        { from: /"assets\/sounds\/bubble\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/bubble.mp3"' },
        { from: /"assets\/sounds\/trap\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/trap.mp3"' },
        { from: /"assets\/sounds\/crash\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/crash.mp3"' },
        { from: /"assets\/sounds\/fireball\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/fireball.mp3"' },
        { from: /"assets\/sounds\/win\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/win.mp3"' },
        { from: /"assets\/sounds\/start\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/start.mp3"' },
        { from: /"assets\/sounds\/death\.mp3"/g, to: '"/games/dungeon-game/dist/assets/sounds/death.mp3"' }
    ];
    
    assetsPaths.forEach(fix => {
        const matches = content.match(fix.from);
        if (matches) {
            console.log(`  ✅ 修復 ${matches.length} 個路徑: ${fix.from.source}`);
            content = content.replace(fix.from, fix.to);
            fixCount += matches.length;
        }
    });
    
    fs.writeFileSync(jsFile, content);
    console.log(`✅ 完成！總共修復了 ${fixCount} 個路徑引用`);
} else {
    console.log('❌ 找不到主要 JavaScript 文件');
}

console.log('🎉 Dungeon 地牢探險遊戲資源路徑全面修復完成！');
