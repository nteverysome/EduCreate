/**
 * 精確修復箭頭函數語法錯誤的腳本
 */

const fs = require('fs');
const path = require('path');

function fixArrowFunctionSyntax(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // 修復 const Component = ({ props }: Props) { 的情況
    // 這種情況需要添加 => 
    const constArrowRegex = /const\s+(\w+)\s*=\s*\(\{[^}]*\}:\s*\w+Props\)\s*\{/g;
    const fixedConstArrow = content.replace(constArrowRegex, (match, componentName) => {
      return match.replace(') {', ') => {');
    });
    
    if (content !== fixedConstArrow) {
      content = fixedConstArrow;
      changed = true;
    }
    
    // 修復 export default function Component({ props }: Props) => { 的情況
    // 這種情況需要移除 =>
    const functionArrowRegex = /(export\s+default\s+function\s+\w+\s*\([^)]*\))\s*=>\s*\{/g;
    const fixedFunctionArrow = content.replace(functionArrowRegex, '$1 {');
    
    if (content !== fixedFunctionArrow) {
      content = fixedFunctionArrow;
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 修復失敗 ${filePath}:`, error.message);
    return false;
  }
}

// 需要修復的特定文件
const problematicFiles = [
  'components/H5P/H5PExport.tsx',
  'components/Layout.tsx',
  'components/Leaderboard.tsx',
  'components/ShareActivity.tsx',
  'components/batch/BatchOperationPanel.tsx'
];

console.log('🔧 精確修復箭頭函數語法錯誤...');

let fixedCount = 0;

for (const file of problematicFiles) {
  const fullPath = path.join(__dirname, file);
  const relativePath = file;
  
  if (fixArrowFunctionSyntax(fullPath)) {
    console.log(`✅ 已修復: ${relativePath}`);
    fixedCount++;
  } else {
    console.log(`⚪ 無需修復: ${relativePath}`);
  }
}

console.log(`\n📊 修復統計:`);
console.log(`   已修復: ${fixedCount}`);
console.log('✅ 修復完成！');
