/**
 * GEPT 詞彙驗證工具
 * 
 * 功能:
 * 1. 驗證 JSON 格式正確性
 * 2. 檢查必填欄位
 * 3. 驗證數據格式
 * 4. 檢查重複單字
 * 5. 生成驗證報告
 */

const fs = require('fs');
const path = require('path');

// ===== 驗證規則 =====

const VALIDATION_RULES = {
  // 必填欄位
  requiredFields: [
    'word',
    'translation',
    'phonetic',
    'partOfSpeech',
    'exampleSentence',
    'exampleTranslation'
  ],
  
  // 詞性列表
  validPartsOfSpeech: [
    'noun',
    'verb',
    'adjective',
    'adverb',
    'pronoun',
    'preposition',
    'conjunction',
    'interjection',
    'determiner'
  ],
  
  // 格式規則
  formats: {
    word: /^[a-z\s-]+$/,  // 只允許小寫字母、空格和連字符
    phonetic: /^\/.*\/$/,  // 必須以 / 開頭和結尾
    translation: /[\u4e00-\u9fa5]+/  // 必須包含中文字符
  }
};

// ===== 驗證函數 =====

/**
 * 驗證單個詞彙條目
 */
function validateEntry(entry, index) {
  const errors = [];
  const warnings = [];
  
  // 1. 檢查必填欄位
  VALIDATION_RULES.requiredFields.forEach(field => {
    if (!entry[field]) {
      errors.push(`缺少必填欄位: ${field}`);
    } else if (typeof entry[field] !== 'string') {
      errors.push(`${field} 必須是字符串`);
    } else if (entry[field].trim() === '') {
      errors.push(`${field} 不能為空`);
    }
  });
  
  // 2. 驗證 word 格式
  if (entry.word) {
    if (!VALIDATION_RULES.formats.word.test(entry.word)) {
      errors.push(`word 格式錯誤: ${entry.word} (只允許小寫字母、空格和連字符)`);
    }
    
    if (entry.word !== entry.word.toLowerCase()) {
      errors.push(`word 必須是小寫: ${entry.word}`);
    }
  }
  
  // 3. 驗證 phonetic 格式
  if (entry.phonetic) {
    if (!VALIDATION_RULES.formats.phonetic.test(entry.phonetic)) {
      warnings.push(`phonetic 格式可能錯誤: ${entry.phonetic} (建議使用 /.../ 格式)`);
    }
  }
  
  // 4. 驗證 translation 包含中文
  if (entry.translation) {
    if (!VALIDATION_RULES.formats.translation.test(entry.translation)) {
      warnings.push(`translation 可能不包含中文: ${entry.translation}`);
    }
  }
  
  // 5. 驗證 partOfSpeech
  if (entry.partOfSpeech) {
    if (!VALIDATION_RULES.validPartsOfSpeech.includes(entry.partOfSpeech)) {
      warnings.push(`partOfSpeech 可能不正確: ${entry.partOfSpeech}`);
    }
  }
  
  // 6. 驗證例句長度
  if (entry.exampleSentence) {
    const wordCount = entry.exampleSentence.split(' ').length;
    if (wordCount < 3) {
      warnings.push(`exampleSentence 太短: ${entry.exampleSentence}`);
    } else if (wordCount > 20) {
      warnings.push(`exampleSentence 太長: ${entry.exampleSentence}`);
    }
    
    // 檢查例句是否包含該單字
    const lowerSentence = entry.exampleSentence.toLowerCase();
    const lowerWord = entry.word.toLowerCase();
    if (!lowerSentence.includes(lowerWord)) {
      warnings.push(`exampleSentence 不包含單字 "${entry.word}"`);
    }
  }
  
  return { errors, warnings };
}

/**
 * 檢查重複單字
 */
function checkDuplicates(words) {
  const seen = new Map();
  const duplicates = [];
  
  words.forEach((entry, index) => {
    const word = entry.word.toLowerCase();
    if (seen.has(word)) {
      duplicates.push({
        word,
        indices: [seen.get(word), index + 1]
      });
    } else {
      seen.set(word, index + 1);
    }
  });
  
  return duplicates;
}

/**
 * 驗證詞彙檔案
 */
function validateVocabularyFile(filePath) {
  console.log(`\n📋 驗證檔案: ${filePath}\n`);
  
  // 1. 讀取檔案
  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(content);
  } catch (error) {
    console.error(`❌ 無法讀取或解析檔案: ${error.message}`);
    return false;
  }
  
  // 2. 檢查頂層結構
  if (!data.level) {
    console.error('❌ 缺少 level 欄位');
    return false;
  }
  
  if (!data.words || !Array.isArray(data.words)) {
    console.error('❌ 缺少 words 陣列');
    return false;
  }
  
  console.log(`等級: ${data.level}`);
  console.log(`描述: ${data.description || '無'}`);
  console.log(`總詞彙數: ${data.totalWords || data.words.length}`);
  console.log(`實際詞彙數: ${data.words.length}\n`);
  
  // 3. 驗證每個詞彙條目
  let totalErrors = 0;
  let totalWarnings = 0;
  const errorEntries = [];
  const warningEntries = [];
  
  data.words.forEach((entry, index) => {
    const { errors, warnings } = validateEntry(entry, index);
    
    if (errors.length > 0) {
      totalErrors += errors.length;
      errorEntries.push({
        index: index + 1,
        word: entry.word || '未知',
        errors
      });
    }
    
    if (warnings.length > 0) {
      totalWarnings += warnings.length;
      warningEntries.push({
        index: index + 1,
        word: entry.word || '未知',
        warnings
      });
    }
  });
  
  // 4. 檢查重複
  const duplicates = checkDuplicates(data.words);
  
  // 5. 生成報告
  console.log('=== 驗證結果 ===\n');
  
  // 錯誤報告
  if (totalErrors > 0) {
    console.log(`❌ 發現 ${totalErrors} 個錯誤:\n`);
    errorEntries.forEach(({ index, word, errors }) => {
      console.log(`   [${index}] ${word}:`);
      errors.forEach(error => console.log(`      - ${error}`));
      console.log('');
    });
  } else {
    console.log('✅ 沒有錯誤\n');
  }
  
  // 警告報告
  if (totalWarnings > 0) {
    console.log(`⚠️  發現 ${totalWarnings} 個警告:\n`);
    warningEntries.forEach(({ index, word, warnings }) => {
      console.log(`   [${index}] ${word}:`);
      warnings.forEach(warning => console.log(`      - ${warning}`));
      console.log('');
    });
  } else {
    console.log('✅ 沒有警告\n');
  }
  
  // 重複報告
  if (duplicates.length > 0) {
    console.log(`❌ 發現 ${duplicates.length} 個重複單字:\n`);
    duplicates.forEach(({ word, indices }) => {
      console.log(`   "${word}" 出現在: ${indices.join(', ')}`);
    });
    console.log('');
  } else {
    console.log('✅ 沒有重複單字\n');
  }
  
  // 統計摘要
  console.log('=== 統計摘要 ===\n');
  console.log(`總詞彙數: ${data.words.length}`);
  console.log(`錯誤數: ${totalErrors}`);
  console.log(`警告數: ${totalWarnings}`);
  console.log(`重複數: ${duplicates.length}\n`);
  
  // 返回驗證結果
  const isValid = totalErrors === 0 && duplicates.length === 0;
  
  if (isValid) {
    console.log('🎉 驗證通過!\n');
  } else {
    console.log('❌ 驗證失敗,請修正錯誤後重試\n');
  }
  
  return isValid;
}

/**
 * 批量驗證目錄中的所有詞彙檔案
 */
function validateDirectory(dirPath) {
  console.log(`\n📁 驗證目錄: ${dirPath}\n`);
  
  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('⚠️  目錄中沒有 JSON 檔案');
    return;
  }
  
  console.log(`找到 ${files.length} 個檔案\n`);
  
  const results = [];
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const isValid = validateVocabularyFile(filePath);
    results.push({ file, isValid });
    console.log('─'.repeat(60));
  });
  
  // 總結
  console.log('\n=== 總結 ===\n');
  results.forEach(({ file, isValid }) => {
    const status = isValid ? '✅' : '❌';
    console.log(`${status} ${file}`);
  });
  
  const passCount = results.filter(r => r.isValid).length;
  console.log(`\n通過: ${passCount}/${results.length}\n`);
}

// ===== 主程式 =====

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  node validate-vocabulary.js <file-or-directory>');
    console.log('');
    console.log('範例:');
    console.log('  node validate-vocabulary.js data/gept-vocabulary/gept-kids.json');
    console.log('  node validate-vocabulary.js data/gept-vocabulary/');
    process.exit(1);
  }
  
  const target = args[0];
  
  if (!fs.existsSync(target)) {
    console.error(`❌ 檔案或目錄不存在: ${target}`);
    process.exit(1);
  }
  
  const stats = fs.statSync(target);
  
  if (stats.isDirectory()) {
    validateDirectory(target);
  } else if (stats.isFile()) {
    const isValid = validateVocabularyFile(target);
    process.exit(isValid ? 0 : 1);
  } else {
    console.error(`❌ 不支援的類型: ${target}`);
    process.exit(1);
  }
}

// 執行主程式
if (require.main === module) {
  main();
}

// 導出函數
module.exports = {
  validateEntry,
  validateVocabularyFile,
  checkDuplicates
};

