/**
 * 從現有的 GEPT 詞彙 JSON 檔案提取單字列表
 */

const fs = require('fs');
const path = require('path');

function extractWords(jsonFile, outputFile) {
  try {
    // 讀取 JSON 檔案
    const data = require(jsonFile);
    
    if (!data.words || !Array.isArray(data.words)) {
      throw new Error('無效的 JSON 格式');
    }
    
    // 提取單字
    const words = data.words.map(entry => entry.word.toLowerCase());
    
    // 排序
    const sorted = words.sort();
    
    // 保存到文字檔
    fs.writeFileSync(outputFile, sorted.join('\n'), 'utf8');
    
    console.log(`✅ 成功提取 ${words.length} 個單字`);
    console.log(`   來源: ${jsonFile}`);
    console.log(`   輸出: ${outputFile}`);
    
    return words;
    
  } catch (error) {
    console.error(`❌ 錯誤:`, error.message);
    process.exit(1);
  }
}

// 主程式
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  node extract-existing-words.js <json-file> [output-file]');
    console.log('');
    console.log('範例:');
    console.log('  node extract-existing-words.js data/gept-vocabulary/gept-kids.json');
    console.log('  node extract-existing-words.js data/gept-vocabulary/gept-kids.json data/word-lists/gept-kids-existing.txt');
    process.exit(1);
  }
  
  const jsonFile = path.resolve(args[0]);
  
  // 如果沒有指定輸出檔案,自動生成
  let outputFile;
  if (args[1]) {
    outputFile = path.resolve(args[1]);
  } else {
    const basename = path.basename(jsonFile, '.json');
    outputFile = path.join(__dirname, '../data/word-lists', `${basename}-existing.txt`);
  }
  
  // 確保輸出目錄存在
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  extractWords(jsonFile, outputFile);
}

if (require.main === module) {
  main();
}

module.exports = { extractWords };

