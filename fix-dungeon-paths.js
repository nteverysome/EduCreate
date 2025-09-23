const fs = require('fs');
const path = require('path');

console.log('🔧 修復 Dungeon 地牢探險遊戲的資源路徑...');

// 修復主要 JavaScript 文件
const jsFile = 'public/games/dungeon-game/dist/assets/index-CQq0-1Ik.js';

if (fs.existsSync(jsFile)) {
    console.log('📝 修復主要 JavaScript 文件:', jsFile);
    
    let content = fs.readFileSync(jsFile, 'utf8');
    let fixCount = 0;
    
    // 修復各種資源路徑
    const pathFixes = [
        // 特殊修復：phaser 文件路徑
        { from: /from"\/games\/dungeon-game\/dist\/phaser-zcydYi9M\.js"/g, to: 'from"/games/dungeon-game/dist/assets/phaser-zcydYi9M.js"' },

        // 圖片資源
        { from: /"\.\/(assets\/images\/[^"]+)"/g, to: '"/games/dungeon-game/dist/$1"' },
        { from: /'\.\/assets\/images\/([^']+)'/g, to: '"/games/dungeon-game/dist/assets/images/$1"' },

        // 地圖資源
        { from: /"\.\/(assets\/maps\/[^"]+)"/g, to: '"/games/dungeon-game/dist/$1"' },
        { from: /'\.\/assets\/maps\/([^']+)'/g, to: '"/games/dungeon-game/dist/assets/maps/$1"' },

        // 音效資源
        { from: /"\.\/(assets\/sounds\/[^"]+)"/g, to: '"/games/dungeon-game/dist/$1"' },
        { from: /'\.\/assets\/sounds\/([^']+)'/g, to: '"/games/dungeon-game/dist/assets/sounds/$1"' },

        // 字體資源
        { from: /"\.\/(assets\/fonts\/[^"]+)"/g, to: '"/games/dungeon-game/dist/$1"' },
        { from: /'\.\/assets\/fonts\/([^']+)'/g, to: '"/games/dungeon-game/dist/assets/fonts/$1"' },

        // CSS 資源
        { from: /"\.\/(assets\/css\/[^"]+)"/g, to: '"/games/dungeon-game/dist/$1"' },
        { from: /'\.\/assets\/css\/([^']+)'/g, to: '"/games/dungeon-game/dist/assets/css/$1"' },

        // HTML 資源
        { from: /"\.\/(assets\/html\/[^"]+)"/g, to: '"/games/dungeon-game/dist/$1"' },
        { from: /'\.\/assets\/html\/([^']+)'/g, to: '"/games/dungeon-game/dist/assets/html/$1"' },

        // 通用 assets 路徑
        { from: /"\.\/assets\//g, to: '"/games/dungeon-game/dist/assets/' },
        { from: /'\.\/assets\//g, to: '"/games/dungeon-game/dist/assets/' },

        // 根目錄資源
        { from: /"\.\//g, to: '"/games/dungeon-game/dist/' },
        { from: /'\.\//g, to: '"/games/dungeon-game/dist/' }
    ];
    
    pathFixes.forEach(fix => {
        const matches = content.match(fix.from);
        if (matches) {
            console.log(`  ✅ 修復 ${matches.length} 個路徑: ${fix.from.source}`);
            content = content.replace(fix.from, fix.to);
            fixCount += matches.length;
        }
    });
    
    // 特殊處理：模板字符串中的路徑
    const templateStringFixes = [
        { from: /`\.\/(assets\/[^`]+)`/g, to: '`/games/dungeon-game/dist/$1`' },
        { from: /`\.\/([^`]+)`/g, to: '`/games/dungeon-game/dist/$1`' }
    ];
    
    templateStringFixes.forEach(fix => {
        const matches = content.match(fix.from);
        if (matches) {
            console.log(`  ✅ 修復模板字符串 ${matches.length} 個路徑: ${fix.from.source}`);
            content = content.replace(fix.from, fix.to);
            fixCount += matches.length;
        }
    });
    
    fs.writeFileSync(jsFile, content);
    console.log(`✅ 完成！總共修復了 ${fixCount} 個路徑引用`);
} else {
    console.log('❌ 找不到主要 JavaScript 文件');
}

// 檢查 Phaser 文件
const phaserFile = 'public/games/dungeon-game/dist/assets/phaser-zcydYi9M.js';
if (fs.existsSync(phaserFile)) {
    console.log('📝 檢查 Phaser 文件:', phaserFile);
    
    let phaserContent = fs.readFileSync(phaserFile, 'utf8');
    let phaserFixCount = 0;
    
    // 修復 Phaser 文件中的路徑（如果有的話）
    const phaserFixes = [
        { from: /"\.\/assets\//g, to: '"/games/dungeon-game/dist/assets/' },
        { from: /'\.\/assets\//g, to: '"/games/dungeon-game/dist/assets/' }
    ];
    
    phaserFixes.forEach(fix => {
        const matches = phaserContent.match(fix.from);
        if (matches) {
            console.log(`  ✅ 修復 Phaser 文件 ${matches.length} 個路徑`);
            phaserContent = phaserContent.replace(fix.from, fix.to);
            phaserFixCount += matches.length;
        }
    });
    
    if (phaserFixCount > 0) {
        fs.writeFileSync(phaserFile, phaserContent);
        console.log(`✅ Phaser 文件修復完成！修復了 ${phaserFixCount} 個路徑`);
    } else {
        console.log('✅ Phaser 文件無需修復');
    }
}

console.log('🎉 Dungeon 地牢探險遊戲路徑修復完成！');
