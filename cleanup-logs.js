#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 要清理的文件列表
const filesToClean = [
    'public/games/match-up-game/scenes/game.js',
    'public/games/match-up-game/responsive-config.js',
    'public/games/match-up-game/responsive-layout.js'
];

function cleanFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        let content = fs.readFileSync(fullPath, 'utf8');
        const originalLength = content.length;
        const originalLines = content.split('\n').length;

        // 移除 console.log 行（保留 console.error 和 console.warn）
        // 匹配模式：可選的空格 + console.log + 任何內容 + 分號 + 可選的空格 + 換行
        content = content.replace(/^\s*console\.log\([^)]*\);?\s*\n/gm, '');

        // 移除多個連續的空行（保留最多一個空行）
        content = content.replace(/\n\n\n+/g, '\n\n');

        const newLength = content.length;
        const newLines = content.split('\n').length;
        const reduction = originalLength - newLength;
        const reductionPercent = ((reduction / originalLength) * 100).toFixed(2);

        fs.writeFileSync(fullPath, content, 'utf8');

        console.log(`✅ ${filePath}`);
        console.log(`   - 行數: ${originalLines} → ${newLines} (-${originalLines - newLines})`);
        console.log(`   - 大小: ${(originalLength / 1024).toFixed(2)}KB → ${(newLength / 1024).toFixed(2)}KB (-${reductionPercent}%)`);
        console.log('');

        return {
            file: filePath,
            originalLength,
            newLength,
            reduction,
            originalLines,
            newLines
        };
    } catch (error) {
        console.error(`❌ 錯誤處理 ${filePath}:`, error.message);
        return null;
    }
}

console.log('🧹 開始清理代碼日誌...\n');

const results = [];
for (const file of filesToClean) {
    const result = cleanFile(file);
    if (result) {
        results.push(result);
    }
}

// 總結
console.log('📊 清理總結:');
console.log('═'.repeat(50));

let totalOriginal = 0;
let totalNew = 0;
let totalReduction = 0;
let totalOriginalLines = 0;
let totalNewLines = 0;

for (const result of results) {
    totalOriginal += result.originalLength;
    totalNew += result.newLength;
    totalReduction += result.reduction;
    totalOriginalLines += result.originalLines;
    totalNewLines += result.newLines;
}

console.log(`總文件大小: ${(totalOriginal / 1024).toFixed(2)}KB → ${(totalNew / 1024).toFixed(2)}KB`);
console.log(`減少大小: ${(totalReduction / 1024).toFixed(2)}KB (${((totalReduction / totalOriginal) * 100).toFixed(2)}%)`);
console.log(`總行數: ${totalOriginalLines} → ${totalNewLines} (-${totalOriginalLines - totalNewLines})`);
console.log('═'.repeat(50));
console.log('✅ 代碼清理完成！');

