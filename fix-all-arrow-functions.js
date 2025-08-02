/**
 * 掃描並修復所有箭頭函數語法錯誤的腳本
 */

const fs = require('fs');
const path = require('path');

function scanDirectory(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 跳過 node_modules, .next, .git 等目錄
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
        scanDirectory(fullPath, files);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixArrowFunctionSyntax(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 修復 function 聲明中的箭頭函數語法錯誤
    // 將 "}: Props) => {" 替換為 "}: Props) {"
    const functionArrowRegex = /(\}: \w+Props\)) => \{/g;
    const fixedFunctionArrow = content.replace(functionArrowRegex, '$1 {');

    if (content !== fixedFunctionArrow) {
      content = fixedFunctionArrow;
      changed = true;
    }

    // 修復 const 聲明中缺少箭頭的問題
    // 將 "const Component = ({ props }: Props) {" 替換為 "const Component = ({ props }: Props) => {"
    const constMissingArrowRegex = /(const\s+\w+\s*=\s*\([^)]*\):\s*\w+\)\s*)\{/g;
    const fixedConstMissingArrow = content.replace(constMissingArrowRegex, '$1 => {');

    if (content !== fixedConstMissingArrow) {
      content = fixedConstMissingArrow;
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

console.log('🔧 掃描並修復所有箭頭函數語法錯誤...');

// 掃描所有 TypeScript/TSX 文件
const allFiles = scanDirectory(__dirname);
const tsxFiles = allFiles.filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

console.log(`📁 找到 ${tsxFiles.length} 個 TypeScript/TSX 文件`);

let fixedCount = 0;
let totalCount = 0;

for (const file of tsxFiles) {
  totalCount++;
  const relativePath = path.relative(__dirname, file);
  
  if (fixArrowFunctionSyntax(file)) {
    console.log(`✅ 已修復: ${relativePath}`);
    fixedCount++;
  }
}

console.log(`\n📊 修復統計:`);
console.log(`   總文件數: ${totalCount}`);
console.log(`   已修復: ${fixedCount}`);
console.log(`   無需修復: ${totalCount - fixedCount}`);
console.log('✅ 修復完成！');
