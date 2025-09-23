const fs = require('fs');

// 修復 Fate 遊戲容器配置問題
function fixFateContainer() {
    console.log('🔧 開始修復 Fate 遊戲容器配置...');
    
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
    
    // 1. 尋找並修復 Phaser 遊戲配置
    const phaserConfigPatterns = [
        // 尋找 new Phaser.Game 配置
        {
            pattern: /new\s+[A-Za-z.]*Game\s*\(\s*\{([^}]+)\}\s*\)/g,
            description: 'Phaser Game 構造函數'
        },
        // 尋找遊戲配置物件
        {
            pattern: /\{[^}]*width\s*:\s*\d+[^}]*height\s*:\s*\d+[^}]*\}/g,
            description: '遊戲配置物件'
        }
    ];
    
    phaserConfigPatterns.forEach(({ pattern, description }) => {
        const matches = jsContent.match(pattern);
        if (matches) {
            console.log(`🔍 找到 ${matches.length} 個 ${description}`);
            matches.forEach((match, index) => {
                console.log(`  ${index + 1}. ${match.substring(0, 100)}...`);
            });
        }
    });
    
    // 2. 修復容器引用
    const containerReplacements = [
        // 修復 parent 配置
        {
            from: /parent\s*:\s*["']?(?!game-container)[^"',}]+["']?/g,
            to: 'parent:"game-container"',
            description: 'parent 配置'
        },
        // 修復 document.body 引用
        {
            from: /document\.body/g,
            to: 'document.getElementById("game-container")',
            description: 'document.body 引用'
        },
        // 修復可能的 app 容器引用
        {
            from: /getElementById\s*\(\s*["']app["']\s*\)/g,
            to: 'getElementById("game-container")',
            description: 'app 容器引用'
        }
    ];
    
    containerReplacements.forEach(({ from, to, description }) => {
        const matches = jsContent.match(from);
        if (matches) {
            console.log(`🔄 修復 ${matches.length} 個 ${description}`);
            jsContent = jsContent.replace(from, to);
            totalReplacements += matches.length;
        }
    });
    
    // 3. 確保遊戲尺寸配置正確
    const sizeReplacements = [
        // 修復可能的小尺寸配置
        {
            from: /width\s*:\s*300\b/g,
            to: 'width:1000',
            description: '寬度 300 -> 1000'
        },
        {
            from: /height\s*:\s*150\b/g,
            to: 'height:800',
            description: '高度 150 -> 800'
        },
        // 修復可能的其他小尺寸
        {
            from: /width\s*:\s*[1-4]\d{2}\b/g,
            to: 'width:1000',
            description: '小寬度 -> 1000'
        },
        {
            from: /height\s*:\s*[1-4]\d{2}\b/g,
            to: 'height:800',
            description: '小高度 -> 800'
        }
    ];
    
    sizeReplacements.forEach(({ from, to, description }) => {
        const matches = jsContent.match(from);
        if (matches) {
            console.log(`📏 修復 ${matches.length} 個 ${description}`);
            jsContent = jsContent.replace(from, to);
            totalReplacements += matches.length;
        }
    });
    
    // 4. 添加容器檢查和修復代碼
    const containerCheckCode = `
// EduCreate 容器修復代碼
(function() {
    const originalCreateGame = window.createGame || function() {};
    window.createGame = function() {
        const container = document.getElementById('game-container');
        if (container) {
            console.log('✅ 找到 game-container，尺寸:', container.offsetWidth, 'x', container.offsetHeight);
        } else {
            console.warn('⚠️ 未找到 game-container');
        }
        return originalCreateGame.apply(this, arguments);
    };
})();
`;
    
    // 在文件開頭添加容器檢查代碼
    if (!jsContent.includes('EduCreate 容器修復代碼')) {
        jsContent = containerCheckCode + jsContent;
        totalReplacements++;
        console.log('➕ 添加容器檢查代碼');
    }
    
    // 寫入修復後的文件
    fs.writeFileSync(jsFilePath, jsContent);
    
    console.log(`✅ Fate 容器配置修復完成！`);
    console.log(`📊 總共修復了 ${totalReplacements} 個配置項目`);
    console.log(`📁 文件已更新: ${jsFilePath}`);
    
    // 輸出修復後的一些關鍵配置
    const configSamples = jsContent.match(/parent\s*:\s*["'][^"']+["']/g);
    if (configSamples) {
        console.log('🔍 修復後的 parent 配置:', configSamples.slice(0, 3));
    }
}

// 執行修復
fixFateContainer();
