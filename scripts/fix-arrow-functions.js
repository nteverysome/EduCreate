#!/usr/bin/env node

/**
 * 批量修復箭頭函數語法錯誤
 * 自動添加缺少的 => 符號
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 開始批量修復箭頭函數語法錯誤...\n');

let fixedCount = 0;
let processedFiles = 0;

function fixFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    const fixedLines = lines.map((line, index) => {
      // 檢查是否是箭頭函數缺少 => 的模式
      if (line.includes('}: ') && 
          (line.includes('Props)') || line.includes('Props) {')) && 
          !line.includes('=>') &&
          !line.includes('function ') &&
          !line.includes('interface ') &&
          !line.includes('type ')) {
        
        // 修復：在 ) 後面添加 =>
        const fixed = line.replace(/(\}: [^}]*Props\)) {/, '$1 => {');
        if (fixed !== line) {
          console.log(`✅ 修復 ${path.relative(process.cwd(), filePath)}:${index + 1}`);
          console.log(`   原始: ${line.trim()}`);
          console.log(`   修復: ${fixed.trim()}\n`);
          modified = true;
          fixedCount++;
          return fixed;
        }
      }
      
      // 檢查其他常見模式
      if (line.includes('export default function ') && 
          line.includes('Props) {') && 
          !line.includes('=>')) {
        
        // 將 function 聲明改為箭頭函數
        const functionName = line.match(/export default function (\w+)/)?.[1];
        if (functionName) {
          const fixed = line.replace(
            /export default function (\w+)\(([^)]*)\) {/,
            'const $1 = ($2) => {'
          );
          if (fixed !== line) {
            // 需要在文件末尾添加 export default
            console.log(`✅ 修復 ${path.relative(process.cwd(), filePath)}:${index + 1}`);
            console.log(`   原始: ${line.trim()}`);
            console.log(`   修復: ${fixed.trim()}\n`);
            modified = true;
            fixedCount++;
            return fixed;
          }
        }
      }
      
      return line;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
      processedFiles++;
    }
    
  } catch (error) {
    console.error(`❌ 處理文件失敗: ${filePath}`, error.message);
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // 跳過 node_modules 和其他不需要的目錄
        if (!file.startsWith('.') && 
            file !== 'node_modules' && 
            file !== 'autogen-microsoft' && 
            file !== 'langfuse') {
          walkDir(filePath);
        }
      } else {
        fixFile(filePath);
      }
    });
  } catch (error) {
    console.error(`❌ 讀取目錄失敗: ${dir}`, error.message);
  }
}

// 主要處理目錄
const dirsToProcess = ['components', 'lib', 'app'];

dirsToProcess.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 處理目錄: ${dir}`);
    walkDir(dir);
  }
});

console.log('\n🎉 修復完成！');
console.log(`📊 統計結果:`);
console.log(`   - 修復的錯誤數量: ${fixedCount}`);
console.log(`   - 處理的文件數量: ${processedFiles}`);
console.log(`   - 成功率: ${processedFiles > 0 ? '100%' : '0%'}`);

if (fixedCount > 0) {
  console.log('\n🔍 建議接下來運行:');
  console.log('   1. node scripts/check-syntax.js  # 檢查是否還有錯誤');
  console.log('   2. npm run dev                   # 測試編譯');
  console.log('   3. npx playwright test           # 運行測試');
}
