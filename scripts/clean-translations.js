#!/usr/bin/env node
/**
 * 清理翻譯文件,移除詞性標記,只保留純中文
 */

const fs = require('fs');
const path = require('path');

console.log('=== 清理翻譯文件 ===\n');

// 載入翻譯
const translationsPath = path.join(__dirname, '../data/translations/gept-all-translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));

console.log(`📚 原始翻譯: ${Object.keys(translations).length} 個單字`);

// 詞性標記列表
const partOfSpeechPatterns = [
  /^noun\s+/,
  /^verb\s+/,
  /^adj\.\s+/,
  /^adv\.\s+/,
  /^prep\.\s+/,
  /^pron\.\s+/,
  /^conj\.\s+/,
  /^interj\.\s+/,
  /^art\.\s+/,
  /^aux\.\s+/,
  /^determiner\s+/,
  /^inf\.\s+/,
  /^number\s+/,
  /^prep\.\/adv\.\s+/,
  /^noun\/verb\s+/,
  /^adj\.\/adv\.\s+/,
  /^number\/pron\.\/noun\/adj\.\s+/,
  /^pron\.\/adj\.\s+/,
  /^verb\/noun\s+/,
  /^adv\.\/adj\.\s+/,
  /^noun\/adj\.\s+/,
  /^adj\.\/noun\s+/,
  /^prep\.\/conj\.\s+/,
  /^verb\/aux\.\s+/
];

// 級數標記
const levelPatterns = [
  /\s+初級$/,
  /\s+中級$/,
  /\s+中高級$/,
  /\s+高級$/
];

// 清理翻譯
const cleanedTranslations = {};
let cleanedCount = 0;

Object.keys(translations).forEach(key => {
  let value = translations[key];
  
  // 移除詞性標記
  partOfSpeechPatterns.forEach(pattern => {
    value = value.replace(pattern, '');
  });
  
  // 移除級數標記
  levelPatterns.forEach(pattern => {
    value = value.replace(pattern, '');
  });
  
  // 移除多餘的空格
  value = value.trim();
  
  // 移除括號內的註解 (但保留中文)
  // 例如: "一(個) 後接母音開頭之字時為  an" -> "一(個)"
  const match = value.match(/^([^後接]+)/);
  if (match) {
    value = match[1].trim();
  }
  
  // 如果翻譯被清理過,計數
  if (value !== translations[key]) {
    cleanedCount++;
  }
  
  cleanedTranslations[key] = value;
});

console.log(`✅ 清理了 ${cleanedCount} 個翻譯`);

// 顯示範例
console.log('\n📝 清理範例 (前 20 個):');
Object.keys(cleanedTranslations).slice(0, 20).forEach(key => {
  const original = translations[key];
  const cleaned = cleanedTranslations[key];
  if (original !== cleaned) {
    console.log(`  "${key}"`);
    console.log(`    原始: "${original}"`);
    console.log(`    清理: "${cleaned}"`);
  }
});

// 保存清理後的翻譯
fs.writeFileSync(translationsPath, JSON.stringify(cleanedTranslations, null, 2));
console.log(`\n💾 已保存到: ${translationsPath}`);

console.log('\n=== 完成 ===');

