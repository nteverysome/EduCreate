const fs = require('fs');

console.log('💥 全面修復 Blastemup 太空射擊遊戲的資源路徑...');

const jsFile = 'public/games/blastemup-game/dist/assets/index-d9ZvbO5r.js';

if (fs.existsSync(jsFile)) {
    console.log('📝 修復主要 JavaScript 文件:', jsFile);
    
    let content = fs.readFileSync(jsFile, 'utf8');
    let fixCount = 0;
    
    // 修復所有 assets/ 開頭的路徑
    const assetsPaths = [
        // 字體
        { from: /"assets\/fonts\/arcade\.png"/g, to: '"/games/blastemup-game/dist/assets/fonts/arcade.png"' },
        { from: /"assets\/fonts\/arcade\.xml"/g, to: '"/games/blastemup-game/dist/assets/fonts/arcade.xml"' },
        { from: /"assets\/fonts\/starshipped\.png"/g, to: '"/games/blastemup-game/dist/assets/fonts/starshipped.png"' },
        { from: /"assets\/fonts\/starshipped\.xml"/g, to: '"/games/blastemup-game/dist/assets/fonts/starshipped.xml"' },
        { from: /"assets\/fonts\/wendy\.png"/g, to: '"/games/blastemup-game/dist/assets/fonts/wendy.png"' },
        { from: /"assets\/fonts\/wendy\.xml"/g, to: '"/games/blastemup-game/dist/assets/fonts/wendy.xml"' },
        
        // 圖片
        { from: /"assets\/images\/asteroid\.png"/g, to: '"/games/blastemup-game/dist/assets/images/asteroid.png"' },
        { from: /"assets\/images\/breadship\.png"/g, to: '"/games/blastemup-game/dist/assets/images/breadship.png"' },
        { from: /"assets\/images\/energy\.png"/g, to: '"/games/blastemup-game/dist/assets/images/energy.png"' },
        { from: /"assets\/images\/foeship\.png"/g, to: '"/games/blastemup-game/dist/assets/images/foeship.png"' },
        { from: /"assets\/images\/hex\.png"/g, to: '"/games/blastemup-game/dist/assets/images/hex.png"' },
        { from: /"assets\/images\/hex64\.png"/g, to: '"/games/blastemup-game/dist/assets/images/hex64.png"' },
        { from: /"assets\/images\/logo\.png"/g, to: '"/games/blastemup-game/dist/assets/images/logo.png"' },
        { from: /"assets\/images\/pello\.png"/g, to: '"/games/blastemup-game/dist/assets/images/pello.png"' },
        { from: /"assets\/images\/ship1_1\.png"/g, to: '"/games/blastemup-game/dist/assets/images/ship1_1.png"' },
        { from: /"assets\/images\/shot\.png"/g, to: '"/games/blastemup-game/dist/assets/images/shot.png"' },
        { from: /"assets\/images\/shotfoe\.png"/g, to: '"/games/blastemup-game/dist/assets/images/shotfoe.png"' },
        { from: /"assets\/images\/starship\.png"/g, to: '"/games/blastemup-game/dist/assets/images/starship.png"' },
        
        // 音效
        { from: /"assets\/sounds\/asteroid\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/asteroid.mp3"' },
        { from: /"assets\/sounds\/bump\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/bump.mp3"' },
        { from: /"assets\/sounds\/cellheart\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/cellheart.mp3"' },
        { from: /"assets\/sounds\/destroy\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/destroy.mp3"' },
        { from: /"assets\/sounds\/evolve\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/evolve.mp3"' },
        { from: /"assets\/sounds\/explosion\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/explosion.mp3"' },
        { from: /"assets\/sounds\/foeshot\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/foeshot.mp3"' },
        { from: /"assets\/sounds\/game-over\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/game-over.mp3"' },
        { from: /"assets\/sounds\/move\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/move.mp3"' },
        { from: /"assets\/sounds\/muzik0\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/muzik0.mp3"' },
        { from: /"assets\/sounds\/muzik1\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/muzik1.mp3"' },
        { from: /"assets\/sounds\/muzik2\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/muzik2.mp3"' },
        { from: /"assets\/sounds\/muzik3\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/muzik3.mp3"' },
        { from: /"assets\/sounds\/muzik4\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/muzik4.mp3"' },
        { from: /"assets\/sounds\/muzik5\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/muzik5.mp3"' },
        { from: /"assets\/sounds\/pick\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/pick.mp3"' },
        { from: /"assets\/sounds\/shot\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/shot.mp3"' },
        { from: /"assets\/sounds\/speed\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/speed.mp3"' },
        { from: /"assets\/sounds\/splash\.mp3"/g, to: '"/games/blastemup-game/dist/assets/sounds/splash.mp3"' },

        // 修復模板字符串中的音樂路徑
        { from: /`assets\/sounds\/muzik\$\{t\}\.mp3`/g, to: '`/games/blastemup-game/dist/assets/sounds/muzik${t}.mp3`' }
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

console.log('💥 Blastemup 太空射擊遊戲資源路徑全面修復完成！');
