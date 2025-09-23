const fs = require('fs');

console.log('🔍 檢查 Mars 遊戲的語法錯誤...');

const marsJsFile = 'public/games/mars-game/dist/assets/index-CP-uPpKM.js';

if (!fs.existsSync(marsJsFile)) {
    console.error('❌ 找不到 Mars 遊戲文件:', marsJsFile);
    process.exit(1);
}

let content = fs.readFileSync(marsJsFile, 'utf8');
console.log('📝 文件大小:', content.length, '字符');

// 檢查常見的語法錯誤模式
const syntaxIssues = [
    { pattern: /\)\(\{[^}]*\}\)/, description: '立即調用函數語法錯誤' },
    { pattern: /\}\)\(\{/, description: '函數調用語法錯誤' },
    { pattern: /\)\)\(\{/, description: '多重括號語法錯誤' },
    { pattern: /\}\)\)\(\{/, description: '複雜括號語法錯誤' },
    { pattern: /timeline\(\{/, description: 'timeline 調用' },
    { pattern: /this\.scene\.tweens\.timeline/, description: 'timeline 方法調用' }
];

console.log('\n🔍 語法檢查結果：');
syntaxIssues.forEach(issue => {
    const matches = content.match(issue.pattern);
    if (matches) {
        console.log(`⚠️  發現 ${issue.description}:`, matches.length, '個匹配');
        matches.slice(0, 3).forEach((match, i) => {
            console.log(`   ${i + 1}. ${match.substring(0, 50)}...`);
        });
    } else {
        console.log(`✅ 沒有發現 ${issue.description}`);
    }
});

// 檢查括號平衡
let openParens = 0;
let openBraces = 0;
let openBrackets = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    switch (char) {
        case '(':
            openParens++;
            break;
        case ')':
            openParens--;
            break;
        case '{':
            openBraces++;
            break;
        case '}':
            openBraces--;
            break;
        case '[':
            openBrackets++;
            break;
        case ']':
            openBrackets--;
            break;
    }
}

console.log('\n🔍 括號平衡檢查：');
console.log(`圓括號 (): ${openParens === 0 ? '✅ 平衡' : '❌ 不平衡 (' + openParens + ')'}`);
console.log(`大括號 {}: ${openBraces === 0 ? '✅ 平衡' : '❌ 不平衡 (' + openBraces + ')'}`);
console.log(`方括號 []: ${openBrackets === 0 ? '✅ 平衡' : '❌ 不平衡 (' + openBrackets + ')'}`);
