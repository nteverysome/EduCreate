/**
 * GEPT 詞彙自動收集工具 (免費版)
 * 
 * 使用完全免費的 API:
 * - Free Dictionary API: 獲取音標、詞性和例句
 * - MyMemory Translation API: 獲取中文翻譯 (免費,無需認證)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ===== 配置 =====

const CONFIG = {
  // Free Dictionary API (完全免費)
  dictionaryAPI: {
    baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en'
  },
  
  // MyMemory Translation API (免費,每天 10,000 字符)
  translationAPI: {
    baseURL: 'https://api.mymemory.translated.net/get',
    email: 'educreate@example.com'  // 可選,提高限額
  },
  
  // 輸出目錄
  outputDir: path.join(__dirname, '../data/gept-vocabulary'),
  
  // 延遲設定 (避免 API 限流)
  delays: {
    betweenWords: 1000,  // 每個單字之間延遲 1 秒
    onError: 3000        // 錯誤後延遲 3 秒
  }
};

// ===== 核心功能 =====

/**
 * 使用 MyMemory API 獲取翻譯
 */
async function getTranslation(text) {
  try {
    const response = await axios.get(CONFIG.translationAPI.baseURL, {
      params: {
        q: text,
        langpair: 'en|zh-TW',
        de: CONFIG.translationAPI.email
      }
    });
    
    if (response.data && response.data.responseData) {
      return response.data.responseData.translatedText;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ 翻譯失敗 (${text}):`, error.message);
    return null;
  }
}

/**
 * 從字典 API 獲取單字詳細資訊
 */
async function getDictionaryInfo(word) {
  try {
    const response = await axios.get(`${CONFIG.dictionaryAPI.baseURL}/${word}`);
    const data = response.data[0];
    
    // 提取音標
    const phonetic = data.phonetic || 
                     data.phonetics.find(p => p.text)?.text || 
                     '';
    
    // 提取第一個詞性和定義
    const meaning = data.meanings[0];
    const partOfSpeech = meaning.partOfSpeech;
    const definition = meaning.definitions[0];
    
    // 提取例句 (如果沒有則生成簡單例句)
    let exampleSentence = definition.example;
    if (!exampleSentence) {
      // 根據詞性生成簡單例句
      if (partOfSpeech === 'noun') {
        exampleSentence = `This is a ${word}.`;
      } else if (partOfSpeech === 'verb') {
        exampleSentence = `I ${word} every day.`;
      } else if (partOfSpeech === 'adjective') {
        exampleSentence = `It is very ${word}.`;
      } else {
        exampleSentence = `The word is ${word}.`;
      }
    }
    
    return {
      phonetic,
      partOfSpeech,
      definition: definition.definition,
      exampleSentence
    };
  } catch (error) {
    console.error(`❌ 字典查詢失敗 (${word}):`, error.message);
    return null;
  }
}

/**
 * 處理單個單字,獲取完整資訊
 */
async function enrichWord(word) {
  console.log(`🔍 處理: ${word}`);
  
  try {
    // 1. 獲取字典資訊
    const dictInfo = await getDictionaryInfo(word);
    if (!dictInfo) {
      throw new Error('字典查詢失敗');
    }
    
    // 2. 獲取單字翻譯
    const translation = await getTranslation(word);
    if (!translation) {
      throw new Error('翻譯失敗');
    }
    
    // 3. 翻譯例句
    const exampleTranslation = await getTranslation(dictInfo.exampleSentence);
    
    // 4. 組合結果
    const result = {
      word: word.toLowerCase(),
      translation,
      phonetic: dictInfo.phonetic,
      partOfSpeech: dictInfo.partOfSpeech,
      exampleSentence: dictInfo.exampleSentence,
      exampleTranslation: exampleTranslation || ''
    };
    
    console.log(`✅ 完成: ${word} → ${translation}`);
    return result;
    
  } catch (error) {
    console.error(`❌ 處理失敗 (${word}):`, error.message);
    return null;
  }
}

/**
 * 延遲函數
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 批量處理單字列表
 */
async function processWordList(words, level, description) {
  console.log(`\n📚 開始處理 ${level}: ${words.length} 個單字\n`);
  
  const vocabulary = {
    level,
    description,
    totalWords: words.length,
    words: []
  };
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim().toLowerCase();
    
    if (!word) continue;
    
    console.log(`[${i + 1}/${words.length}] ${word}`);
    
    const enrichedWord = await enrichWord(word);
    
    if (enrichedWord) {
      vocabulary.words.push(enrichedWord);
      successCount++;
      await delay(CONFIG.delays.betweenWords);
    } else {
      failCount++;
      await delay(CONFIG.delays.onError);
    }
    
    // 每處理 10 個單字顯示進度
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 進度: ${i + 1}/${words.length} (成功: ${successCount}, 失敗: ${failCount})\n`);
    }
  }
  
  console.log(`\n✅ 處理完成:`);
  console.log(`   成功: ${successCount}`);
  console.log(`   失敗: ${failCount}`);
  console.log(`   總計: ${words.length}\n`);
  
  return vocabulary;
}

/**
 * 保存詞彙數據到 JSON 檔案
 */
function saveVocabulary(vocabulary, filename) {
  const filePath = path.join(CONFIG.outputDir, filename);
  
  // 確保目錄存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // 寫入檔案
  fs.writeFileSync(
    filePath,
    JSON.stringify(vocabulary, null, 2),
    'utf8'
  );
  
  console.log(`💾 已保存: ${filePath}`);
  console.log(`   檔案大小: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
}

/**
 * 從文字檔讀取單字列表
 */
function loadWordList(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

/**
 * 驗證詞彙數據
 */
function validateVocabulary(vocabulary) {
  const errors = [];
  const requiredFields = ['word', 'translation', 'phonetic', 'partOfSpeech'];
  
  vocabulary.words.forEach((entry, index) => {
    requiredFields.forEach(field => {
      if (!entry[field]) {
        errors.push(`第 ${index + 1} 個單字缺少 ${field}: ${entry.word || '未知'}`);
      }
    });
  });
  
  if (errors.length > 0) {
    console.error('\n⚠️  驗證錯誤:');
    errors.forEach(error => console.error(`   ${error}`));
    return false;
  }
  
  console.log('✅ 驗證通過');
  return true;
}

/**
 * 去重
 */
function deduplicateWords(words) {
  const seen = new Set();
  const duplicates = [];
  
  const unique = words.filter(entry => {
    const word = entry.word.toLowerCase();
    if (seen.has(word)) {
      duplicates.push(word);
      return false;
    }
    seen.add(word);
    return true;
  });
  
  if (duplicates.length > 0) {
    console.warn(`\n⚠️  發現重複單字: ${duplicates.join(', ')}`);
  }
  
  return unique;
}

// ===== 主程式 =====

async function main() {
  console.log('🚀 GEPT 詞彙自動收集工具 (免費版)\n');
  console.log('使用 API:');
  console.log('  - Free Dictionary API (字典)');
  console.log('  - MyMemory Translation API (翻譯)\n');
  
  // 檢查命令行參數
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('使用方法:');
    console.log('  node collect-vocabulary-free.js <level> <description> <word-list-file>');
    console.log('');
    console.log('範例:');
    console.log('  node collect-vocabulary-free.js GEPT_KIDS "GEPT Kids 基礎 300 字" data/word-lists/gept-kids.txt');
    process.exit(1);
  }
  
  const [level, description, wordListFile] = args;
  
  try {
    // 1. 讀取單字列表
    console.log(`📖 讀取單字列表: ${wordListFile}`);
    const words = loadWordList(wordListFile);
    console.log(`   找到 ${words.length} 個單字\n`);
    
    // 2. 處理單字
    const vocabulary = await processWordList(words, level, description);
    
    // 3. 去重
    vocabulary.words = deduplicateWords(vocabulary.words);
    vocabulary.totalWords = vocabulary.words.length;
    
    // 4. 驗證
    if (!validateVocabulary(vocabulary)) {
      console.error('\n❌ 驗證失敗,請檢查數據');
      process.exit(1);
    }
    
    // 5. 保存
    const filename = `${level.toLowerCase().replace(/_/g, '-')}.json`;
    saveVocabulary(vocabulary, filename);
    
    console.log('\n🎉 完成!');
    console.log(`\n💡 提示: 使用以下命令驗證生成的檔案:`);
    console.log(`   node scripts/validate-vocabulary.js data/gept-vocabulary/${filename}`);
    
  } catch (error) {
    console.error('\n❌ 錯誤:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 執行主程式
if (require.main === module) {
  main();
}

// 導出函數供其他模組使用
module.exports = {
  enrichWord,
  processWordList,
  validateVocabulary,
  deduplicateWords
};

