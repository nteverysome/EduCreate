#!/usr/bin/env node
/**
 * 分析翻譯覆蓋率
 */

const fs = require('fs');
const path = require('path');

console.log('=== 翻譯覆蓋率分析 ===\n');

// 載入翻譯
const translationsPath = path.join(__dirname, '../data/translations/gept-all-translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));

console.log(`📚 翻譯文件: ${Object.keys(translations).length} 個單字\n`);

// 顯示前 10 個翻譯
console.log('前 10 個翻譯範例:');
Object.keys(translations).slice(0, 10).forEach(key => {
  console.log(`  "${key}" => "${translations[key]}"`);
});

// 載入詞彙列表
const elementaryPath = path.join(__dirname, '../data/word-lists/gept-elementary-unique.txt');
const intermediatePath = path.join(__dirname, '../data/word-lists/gept-intermediate-unique.txt');
const highIntermediatePath = path.join(__dirname, '../data/word-lists/gept-high-intermediate-unique.txt');

const elementary = fs.readFileSync(elementaryPath, 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w);

const intermediate = fs.readFileSync(intermediatePath, 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w);

const highIntermediate = fs.readFileSync(highIntermediatePath, 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w);

const allWords = [...new Set([...elementary, ...intermediate, ...highIntermediate])];

console.log(`\n📖 詞彙列表:`);
console.log(`  - ELEMENTARY: ${elementary.length} 個單字`);
console.log(`  - INTERMEDIATE: ${intermediate.length} 個單字`);
console.log(`  - HIGH_INTERMEDIATE: ${highIntermediate.length} 個單字`);
console.log(`  - 總計 (去重): ${allWords.length} 個單字`);

// 檢查覆蓋率
const missing = [];
const found = [];

allWords.forEach(word => {
  const key = word.toLowerCase();
  if (translations[key]) {
    found.push(word);
  } else {
    missing.push(word);
  }
});

console.log(`\n📊 覆蓋率統計:`);
console.log(`  - 已翻譯: ${found.length} 個單字 (${(found.length / allWords.length * 100).toFixed(2)}%)`);
console.log(`  - 缺失: ${missing.length} 個單字 (${(missing.length / allWords.length * 100).toFixed(2)}%)`);

if (missing.length > 0) {
  console.log(`\n❌ 缺失翻譯的單字 (前 50 個):`);
  missing.slice(0, 50).forEach(word => {
    console.log(`  - ${word}`);
  });
  
  // 保存完整的缺失列表
  const missingPath = path.join(__dirname, '../data/translations/missing-translations.txt');
  fs.writeFileSync(missingPath, missing.join('\n'));
  console.log(`\n💾 完整缺失列表已保存到: ${missingPath}`);
}

// 檢查翻譯文件中有但詞彙列表沒有的單字
const extraTranslations = Object.keys(translations).filter(key => {
  return !allWords.some(word => word.toLowerCase() === key);
});

if (extraTranslations.length > 0) {
  console.log(`\n⚠️  翻譯文件中有但詞彙列表沒有的單字: ${extraTranslations.length} 個`);
  console.log(`前 20 個範例:`);
  extraTranslations.slice(0, 20).forEach(key => {
    console.log(`  - ${key} => ${translations[key]}`);
  });
}

console.log('\n=== 分析完成 ===');

