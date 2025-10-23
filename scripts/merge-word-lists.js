/**
 * 合併多個單字列表
 * 
 * 功能:
 * - 讀取多個單字列表檔案
 * - 合併並去重
 * - 排序
 * - 保存到新檔案
 */

const fs = require('fs');
const path = require('path');

function mergeWordLists(files, outputFile, options = {}) {
  const {
    sort = true,                // 排序
    deduplicate = true,         // 去重
    showStats = true            // 顯示統計
  } = options;
  
  try {
    const allWords = new Set();
    const stats = [];
    
    console.log(`📚 合併 ${files.length} 個單字列表\n`);
    
    // 讀取每個檔案
    files.forEach((file, index) => {
      const filePath = path.resolve(file);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  檔案不存在,跳過: ${file}`);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const words = content
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(line => line && !line.startsWith('#'));
      
      words.forEach(word => allWords.add(word));
      
      stats.push({
        file: path.basename(file),
        words: words.length
      });
      
      console.log(`[${index + 1}/${files.length}] ${path.basename(file)}: ${words.length} 個單字`);
    });
    
    console.log('');
    
    // 轉換為陣列
    let merged = [...allWords];
    
    // 排序
    if (sort) {
      merged.sort();
    }
    
    // 保存
    fs.writeFileSync(outputFile, merged.join('\n'), 'utf8');
    
    // 顯示統計
    if (showStats) {
      console.log('=== 統計 ===\n');
      
      const totalInput = stats.reduce((sum, s) => sum + s.words, 0);
      const duplicates = totalInput - merged.length;
      
      console.log(`輸入檔案: ${files.length} 個`);
      console.log(`總輸入單字: ${totalInput} 個`);
      console.log(`重複單字: ${duplicates} 個`);
      console.log(`最終單字數: ${merged.length} 個`);
      console.log(`\n💾 保存到: ${outputFile}`);
    }
    
    console.log(`✅ 完成!\n`);
    
    return merged;
    
  } catch (error) {
    console.error(`❌ 錯誤:`, error.message);
    process.exit(1);
  }
}

// 主程式
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('使用方法:');
    console.log('  node merge-word-lists.js <file1> <file2> [file3...] <output-file>');
    console.log('');
    console.log('範例:');
    console.log('  node merge-word-lists.js \\');
    console.log('    data/word-lists/gept-kids-existing.txt \\');
    console.log('    data/word-lists/gept-kids-new.txt \\');
    console.log('    data/word-lists/gept-kids-merged.txt');
    console.log('');
    console.log('功能:');
    console.log('  - 合併多個單字列表');
    console.log('  - 自動去重');
    console.log('  - 排序');
    console.log('  - 顯示統計');
    process.exit(1);
  }
  
  const files = args.slice(0, -1);
  const outputFile = path.resolve(args[args.length - 1]);
  
  // 確保輸出目錄存在
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  mergeWordLists(files, outputFile);
}

if (require.main === module) {
  main();
}

module.exports = { mergeWordLists };

