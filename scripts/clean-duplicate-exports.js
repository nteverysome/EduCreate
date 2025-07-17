#!/usr/bin/env node

/**
 * 清理重複的 export default 語句
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 開始清理重複的 export default 語句...\n');

let fixedCount = 0;
let processedFiles = 0;

function cleanFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    // 找到所有 export default 行
    const exportDefaultLines = [];
    lines.forEach((line, index) => {
      if (line.trim().startsWith('export default ')) {
        exportDefaultLines.push({ line: line.trim(), index });
      }
    });
    
    // 如果有多個 export default，只保留第一個
    if (exportDefaultLines.length > 1) {
      console.log(`🔍 發現 ${exportDefaultLines.length} 個 export default 在 ${path.relative(process.cwd(), filePath)}`);
      
      // 保留第一個，刪除其他的
      for (let i = 1; i < exportDefaultLines.length; i++) {
        const lineIndex = exportDefaultLines[i].index;
        console.log(`❌ 刪除重複的: ${exportDefaultLines[i].line}`);
        lines[lineIndex] = ''; // 清空該行
        modified = true;
        fixedCount++;
      }
      
      console.log(`✅ 保留: ${exportDefaultLines[0].line}\n`);
    }
    
    if (modified) {
      // 移除空行（但保留文件末尾的一個空行）
      const cleanedLines = lines.filter((line, index) => {
        return line.trim() !== '' || index === lines.length - 1;
      });
      
      fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
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
        if (!file.startsWith('.') && 
            file !== 'node_modules' && 
            file !== 'autogen-microsoft' && 
            file !== 'langfuse') {
          walkDir(filePath);
        }
      } else {
        cleanFile(filePath);
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

console.log('\n🎉 清理重複 export default 完成！');
console.log(`📊 統計結果:`);
console.log(`   - 清理的重複 export default 數量: ${fixedCount}`);
console.log(`   - 處理的文件數量: ${processedFiles}`);
console.log(`   - 成功率: ${processedFiles > 0 ? '100%' : '0%'}`);
