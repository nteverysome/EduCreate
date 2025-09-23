const fs = require('fs');
const path = require('path');

console.log('🔢 全面修復 Math Attack 數學攻擊遊戲的路徑...');

// 需要修復的文件列表
const filesToFix = [
    'public/games/math-attack-game/scenes/preload.js',
    'public/games/math-attack-game/scenes/handler.js',
    'public/games/math-attack-game/scenes/title.js',
    'public/games/math-attack-game/scenes/hub.js',
    'public/games/math-attack-game/scenes/menu.js',
    'public/games/math-attack-game/scenes/game.js',
    'public/games/math-attack-game/scenes/credits.js',
    'public/games/math-attack-game/utils/buttons.js',
    'public/games/math-attack-game/utils/colors.js',
    'public/games/math-attack-game/utils/common.js',
    'public/games/math-attack-game/utils/screen.js',
    'public/games/math-attack-game/gameplay/countdown.math.js',
    'public/games/math-attack-game/gameplay/game.settings.js',
    'public/games/math-attack-game/logic/countdown.math.logic.js'
];

let totalFixCount = 0;

filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        console.log(`📝 修復文件: ${filePath}`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let fixCount = 0;
        
        // 修復相對路徑導入
        const importFixes = [
            { from: /from '\.\.\/constant\.js'/g, to: "from '/games/math-attack-game/constant.js'" },
            { from: /from '\.\.\/utils\/common\.js'/g, to: "from '/games/math-attack-game/utils/common.js'" },
            { from: /from '\.\.\/utils\/buttons\.js'/g, to: "from '/games/math-attack-game/utils/buttons.js'" },
            { from: /from '\.\.\/utils\/colors\.js'/g, to: "from '/games/math-attack-game/utils/colors.js'" },
            { from: /from '\.\.\/utils\/screen\.js'/g, to: "from '/games/math-attack-game/utils/screen.js'" },
            { from: /from '\.\.\/gameplay\/countdown\.math\.js'/g, to: "from '/games/math-attack-game/gameplay/countdown.math.js'" },
            { from: /from '\.\.\/gameplay\/game\.settings\.js'/g, to: "from '/games/math-attack-game/gameplay/game.settings.js'" },
            { from: /from '\.\.\/logic\/countdown\.math\.logic\.js'/g, to: "from '/games/math-attack-game/logic/countdown.math.logic.js'" },
            { from: /from '\.\/countdown\.math\.logic\.js'/g, to: "from '/games/math-attack-game/logic/countdown.math.logic.js'" }
        ];
        
        importFixes.forEach(fix => {
            const matches = content.match(fix.from);
            if (matches) {
                console.log(`  ✅ 修復 ${matches.length} 個導入路徑: ${fix.from.source}`);
                content = content.replace(fix.from, fix.to);
                fixCount += matches.length;
            }
        });
        
        // 修復資源路徑
        const assetFixes = [
            { from: /'assets\/images\//g, to: "'/games/math-attack-game/assets/images/" },
            { from: /'assets\/fonts\//g, to: "'/games/math-attack-game/assets/fonts/" },
            { from: /'assets\/audio\//g, to: "'/games/math-attack-game/assets/audio/" },
            { from: /"assets\/images\//g, to: '"/games/math-attack-game/assets/images/' },
            { from: /"assets\/fonts\//g, to: '"/games/math-attack-game/assets/fonts/' },
            { from: /"assets\/audio\//g, to: '"/games/math-attack-game/assets/audio/' }
        ];
        
        assetFixes.forEach(fix => {
            const matches = content.match(fix.from);
            if (matches) {
                console.log(`  ✅ 修復 ${matches.length} 個資源路徑: ${fix.from.source}`);
                content = content.replace(fix.from, fix.to);
                fixCount += matches.length;
            }
        });
        
        if (fixCount > 0) {
            fs.writeFileSync(filePath, content);
            console.log(`  ✅ 完成！修復了 ${fixCount} 個路徑引用`);
            totalFixCount += fixCount;
        } else {
            console.log(`  ℹ️ 無需修復`);
        }
    } else {
        console.log(`❌ 找不到文件: ${filePath}`);
    }
});

console.log(`🎉 Math Attack 數學攻擊遊戲路徑修復完成！總共修復了 ${totalFixCount} 個路徑引用`);
