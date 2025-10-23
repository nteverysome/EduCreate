/**
 * 清理和格式化單字列表
 * 
 * 功能:
 * - 移除空行和註釋
 * - 轉換為小寫
 * - 移除非字母字符
 * - 去重和排序
 */

const fs = require('fs');
const path = require('path');

function cleanWordList(inputFile, outputFile, options = {}) {
  const {
    removeNumbers = true,      // 移除數字開頭的行
    removePunctuation = true,   // 移除標點符號
    sort = true,                // 排序
    deduplicate = true,         // 去重
    toLowerCase = true          // 轉換為小寫
  } = options;
  
  try {
    // 讀取檔案
    const content = fs.readFileSync(inputFile, 'utf8');
    
    // 分割成行
    let lines = content.split('\n');
    
    console.log(`📖 讀取: ${inputFile}`);
    console.log(`   原始行數: ${lines.length}`);
    
    // 清理每一行
    let words = lines
      .map(line => {
        let cleaned = line.trim();
        
        // 轉換為小寫
        if (toLowerCase) {
          cleaned = cleaned.toLowerCase();
        }
        
        return cleaned;
      })
      .filter(line => {
        // 移除空行
        if (!line) return false;
        
        // 移除註釋
        if (line.startsWith('#')) return false;
        if (line.startsWith('//')) return false;
        
        // 移除數字開頭的行 (行號)
        if (removeNumbers && /^\d+/.test(line)) return false;
        
        // 只保留字母、空格和連字符
        if (!/^[a-z\s-]+$/.test(line)) return false;
        
        return true;
      });
    
    console.log(`   清理後: ${words.length} 個單字`);
    
    // 去重
    if (deduplicate) {
      const before = words.length;
      words = [...new Set(words)];
      const duplicates = before - words.length;
      if (duplicates > 0) {
        console.log(`   去重: 移除 ${duplicates} 個重複單字`);
      }
    }
    
    // 排序
    if (sort) {
      words.sort();
      console.log(`   排序: 完成`);
    }
    
    // 保存
    fs.writeFileSync(outputFile, words.join('\n'), 'utf8');
    
    console.log(`💾 保存: ${outputFile}`);
    console.log(`   最終單字數: ${words.length}`);
    console.log(`✅ 完成!\n`);
    
    return words;
    
  } catch (error) {
    console.error(`❌ 錯誤:`, error.message);
    process.exit(1);
  }
}

// 主程式
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('使用方法:');
    console.log('  node clean-word-list.js <input-file> <output-file>');
    console.log('');
    console.log('範例:');
    console.log('  node clean-word-list.js data/sources/raw-words.txt data/word-lists/gept-elementary.txt');
    console.log('');
    console.log('功能:');
    console.log('  - 移除空行和註釋');
    console.log('  - 轉換為小寫');
    console.log('  - 移除非字母字符');
    console.log('  - 去重和排序');
    process.exit(1);
  }
  
  const inputFile = path.resolve(args[0]);
  const outputFile = path.resolve(args[1]);
  
  // 檢查輸入檔案是否存在
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ 輸入檔案不存在: ${inputFile}`);
    process.exit(1);
  }
  
  // 確保輸出目錄存在
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  cleanWordList(inputFile, outputFile);
}

if (require.main === module) {
  main();
}

module.exports = { cleanWordList };

