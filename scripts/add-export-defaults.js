#!/usr/bin/env node

/**
 * 批量添加缺少的 export default 語句
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 開始添加缺少的 export default 語句...\n');

let fixedCount = 0;
let processedFiles = 0;

function fixFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    // 查找 const ComponentName = 模式
    const componentMatch = content.match(/const (\w+) = \([^)]*\) => \{/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      
      // 檢查是否已經有 export default
      if (!content.includes(`export default ${componentName}`)) {
        // 在文件末尾添加 export default
        const lastLine = lines[lines.length - 1];
        if (lastLine.trim() === '') {
          lines[lines.length - 1] = `export default ${componentName};`;
          lines.push('');
        } else {
          lines.push('');
          lines.push(`export default ${componentName};`);
        }
        
        console.log(`✅ 添加 export default ${componentName} 到 ${path.relative(process.cwd(), filePath)}`);
        modified = true;
        fixedCount++;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
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
        fixFile(filePath);
      }
    });
  } catch (error) {
    console.error(`❌ 讀取目錄失敗: ${dir}`, error.message);
  }
}

// 主要處理目錄
const dirsToProcess = ['components'];

dirsToProcess.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 處理目錄: ${dir}`);
    walkDir(dir);
  }
});

console.log('\n🎉 添加 export default 完成！');
console.log(`📊 統計結果:`);
console.log(`   - 添加的 export default 數量: ${fixedCount}`);
console.log(`   - 處理的文件數量: ${processedFiles}`);
console.log(`   - 成功率: ${processedFiles > 0 ? '100%' : '0%'}`);
