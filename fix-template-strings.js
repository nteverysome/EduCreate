const fs = require('fs');

// 修復模板字符串路徑問題
function fixTemplateStrings() {
    console.log('🔧 修復 Fate 遊戲模板字符串路徑問題...');
    
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
    
    // 修復錯誤的模板字符串路徑
    const templateStringFixes = [
        // 修復 thunder 音效路徑
        {
            from: /`\/games\/fate-game\/dist\/assets\/sounds\/thunder\$\{e\}\.mp3`/g,
            to: '`/games/fate-game/dist/assets/sounds/thunder${e}.mp3`',
            description: 'thunder 音效模板字符串'
        },
        // 修復 passby 音效路徑
        {
            from: /`\/games\/fate-game\/dist\/assets\/sounds\/passby\$\{e\}\.mp3`/g,
            to: '`/games/fate-game/dist/assets/sounds/passby${e}.mp3`',
            description: 'passby 音效模板字符串'
        },
        // 修復 video 路徑
        {
            from: /`\/games\/fate-game\/dist\/assets\/videos\/video\$\{e\}\.mp4`/g,
            to: '`/games/fate-game/dist/assets/videos/video${e}.mp4`',
            description: 'video 模板字符串'
        }
    ];
    
    templateStringFixes.forEach(({ from, to, description }) => {
        const matches = jsContent.match(from);
        if (matches) {
            console.log(`🔄 修復 ${matches.length} 個 ${description}`);
            jsContent = jsContent.replace(from, to);
            totalReplacements += matches.length;
        }
    });
    
    // 修復其他可能的動態路徑問題
    const dynamicPathFixes = [
        // 修復 hit 音效路徑（這些可能不是模板字符串）
        {
            from: /assets\/sounds\/hit(\d+)\.mp3/g,
            to: '/games/fate-game/dist/assets/sounds/hit$1.mp3',
            description: 'hit 音效動態路徑'
        }
    ];
    
    dynamicPathFixes.forEach(({ from, to, description }) => {
        const matches = jsContent.match(from);
        if (matches) {
            console.log(`🔄 修復 ${matches.length} 個 ${description}`);
            jsContent = jsContent.replace(from, to);
            totalReplacements += matches.length;
        }
    });
    
    // 檢查是否還有其他問題路徑
    const problemPaths = [
        /assets\/sounds\/hit\d+\.mp3/g,
        /\$\{e\}/g,
        /\%7B.*\%7D/g
    ];
    
    problemPaths.forEach((pattern, index) => {
        const matches = jsContent.match(pattern);
        if (matches) {
            console.log(`⚠️ 發現 ${matches.length} 個可能的問題路徑 (模式 ${index + 1}):`);
            matches.slice(0, 5).forEach((match, i) => {
                console.log(`  ${i + 1}. ${match}`);
            });
        }
    });
    
    // 寫入修復後的文件
    if (totalReplacements > 0) {
        fs.writeFileSync(jsFilePath, jsContent);
        console.log(`✅ 模板字符串路徑修復完成！`);
        console.log(`📊 總共修復了 ${totalReplacements} 個路徑引用`);
        console.log(`📁 文件已更新: ${jsFilePath}`);
    } else {
        console.log('⚠️ 沒有找到需要修復的模板字符串路徑');
    }
    
    // 驗證修復結果
    const fixedContent = fs.readFileSync(jsFilePath, 'utf8');
    const templateStrings = fixedContent.match(/`[^`]*\$\{[^}]+\}[^`]*`/g);
    if (templateStrings) {
        console.log('✅ 修復後的模板字符串範例:');
        templateStrings.slice(0, 3).forEach((str, i) => {
            console.log(`  ${i + 1}. ${str}`);
        });
    }
}

// 執行修復
fixTemplateStrings();
