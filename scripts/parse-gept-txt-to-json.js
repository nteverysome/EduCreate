/**
 * 解析 GEPT TXT 文件並生成中英對照 JSON
 * 
 * 使用方法:
 * 1. 將 PDF 轉換為 TXT (使用 https://www.ilovepdf.com/pdf_to_text)
 * 2. 將 TXT 文件放到 data/sources/ 目錄:
 *    - GEPT_Elementary.txt
 *    - GEPT_Intermediate.txt
 *    - GEPT_High-Intermediate.txt
 * 3. 運行此腳本: node scripts/parse-gept-txt-to-json.js
 */

const fs = require('fs');
const path = require('path');

/**
 * 從文本中提取中英對照
 * 
 * GEPT 格式範例:
 * abandon v. 放棄；拋棄
 * ability n. 能力
 * able a. 能夠的
 * about ad. 大約
 * about prep. 關於
 */
function extractTranslations(text, level) {
  const translations = {};
  const lines = text.split('\n');
  
  console.log(`\n   處理 ${lines.length} 行文本...`);
  
  let successCount = 0;
  let skipCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // 跳過空行
    if (!line || line.length < 3) {
      continue;
    }
    
    // 跳過標題行
    if (line.includes('全民英檢') || 
        line.includes('參考字表') || 
        line.includes('GEPT') ||
        line.includes('頁次') ||
        line.includes('財團法人') ||
        line.includes('語言訓練測驗中心') ||
        /^第?\s*\d+\s*頁/.test(line) ||
        /^\d+\s*$/.test(line)) {
      skipCount++;
      continue;
    }
    
    // 匹配格式: "word [詞性] 中文翻譯"
    // 範例: "abandon v. 放棄；拋棄"
    // 範例: "ability n. 能力"
    // 範例: "able a. 能夠的"
    // 範例: "about ad. 大約" 或 "about prep. 關於"
    
    // 正則表達式: 單字 + 可選詞性 + 中文
    // 支援的詞性: n., v., a., ad., prep., conj., int., aux., pron., num., det., modal
    const match = line.match(/^([a-zA-Z\-']+)\s+(?:(?:n|v|a|ad|adv|prep|conj|int|aux|pron|num|det|modal|abbr)\.\s+)?(.+)$/i);
    
    if (match) {
      const word = match[1].toLowerCase().trim();
      let chinese = match[2].trim();
      
      // 清理中文翻譯
      // 移除詞性標記
      chinese = chinese.replace(/^(?:n|v|a|ad|adv|prep|conj|int|aux|pron|num|det|modal|abbr)\.\s+/i, '');
      
      // 移除頁碼和數字
      chinese = chinese.replace(/\s*\d+\s*$/, '').trim();
      
      // 移除括號內容 (如果是英文說明)
      chinese = chinese.replace(/\([a-zA-Z\s]+\)/g, '').trim();
      
      // 只保留第一個翻譯 (如果有多個用分號、逗號或頓號分隔)
      if (chinese.includes('；')) {
        chinese = chinese.split('；')[0];
      } else if (chinese.includes('、')) {
        chinese = chinese.split('、')[0];
      } else if (chinese.includes('，')) {
        chinese = chinese.split('，')[0];
      } else if (chinese.includes(';')) {
        chinese = chinese.split(';')[0];
      } else if (chinese.includes(',')) {
        chinese = chinese.split(',')[0];
      }
      
      chinese = chinese.trim();
      
      // 驗證中文 (至少包含一個中文字符)
      if (/[\u4e00-\u9fa5]/.test(chinese) && chinese.length > 0 && chinese.length < 50) {
        // 如果單字已存在,保留較短的翻譯
        if (translations[word]) {
          if (chinese.length < translations[word].length) {
            translations[word] = chinese;
          }
        } else {
          translations[word] = chinese;
        }
        
        successCount++;
        
        // 顯示前 10 個範例
        if (successCount <= 10) {
          console.log(`   ✅ ${word} → ${chinese}`);
        }
      } else {
        // 調試: 顯示無法解析的行
        if (skipCount < 5 && /[a-zA-Z]/.test(line)) {
          console.log(`   ⚠️  跳過: ${line.substring(0, 80)}`);
        }
        skipCount++;
      }
    } else {
      // 嘗試更寬鬆的匹配
      const looseMatch = line.match(/^([a-zA-Z\-']+)\s+(.+)$/);
      if (looseMatch) {
        const word = looseMatch[1].toLowerCase().trim();
        let chinese = looseMatch[2].trim();
        
        // 清理
        chinese = chinese.replace(/^(?:n|v|a|ad|adv|prep|conj|int|aux|pron|num|det|modal|abbr)\.\s+/i, '');
        chinese = chinese.replace(/\s*\d+\s*$/, '').trim();
        
        if (/[\u4e00-\u9fa5]/.test(chinese) && chinese.length > 0 && chinese.length < 50) {
          if (!translations[word] || chinese.length < translations[word].length) {
            translations[word] = chinese;
            successCount++;
          }
        }
      }
    }
  }
  
  console.log(`   ✅ 成功提取: ${successCount} 個單字`);
  console.log(`   ⏭️  跳過: ${skipCount} 行`);
  
  return translations;
}

/**
 * 處理單個 TXT 文件
 */
function processTXT(txtPath, level) {
  console.log(`\n📄 處理 ${level} TXT...`);
  console.log(`   路徑: ${txtPath}`);
  
  try {
    // 讀取 TXT
    const text = fs.readFileSync(txtPath, 'utf-8');
    
    console.log(`   文件大小: ${text.length} 字符`);
    
    // 提取翻譯
    const translations = extractTranslations(text, level);
    
    console.log(`   ✅ 完成: ${Object.keys(translations).length} 個單字`);
    
    return translations;
  } catch (error) {
    console.error(`   ❌ 處理失敗: ${error.message}`);
    return {};
  }
}

/**
 * 主函數
 */
function main() {
  console.log('=== 解析 GEPT TXT 文件 ===\n');
  
  const sourcesDir = path.join(__dirname, '../data/sources');
  const outputDir = path.join(__dirname, '../data/translations');
  
  // 確保輸出目錄存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // TXT 文件列表
  const txtFiles = [
    { path: path.join(sourcesDir, 'GEPT_Elementary.txt'), level: 'ELEMENTARY' },
    { path: path.join(sourcesDir, 'GEPT_Intermediate.txt'), level: 'INTERMEDIATE' },
    { path: path.join(sourcesDir, 'GEPT_High-Intermediate.txt'), level: 'HIGH_INTERMEDIATE' }
  ];
  
  // 合併所有翻譯
  const allTranslations = {};
  const levelStats = {};
  
  // 處理每個 TXT
  for (const { path: txtPath, level } of txtFiles) {
    if (!fs.existsSync(txtPath)) {
      console.log(`⚠️  文件不存在: ${txtPath}`);
      console.log(`   請將 PDF 轉換為 TXT 並放到此路徑`);
      continue;
    }
    
    const translations = processTXT(txtPath, level);
    
    // 記錄統計
    levelStats[level] = Object.keys(translations).length;
    
    // 合併翻譯
    Object.assign(allTranslations, translations);
    
    // 保存單個等級的翻譯
    const levelOutputPath = path.join(outputDir, `gept-${level.toLowerCase()}-translations.json`);
    fs.writeFileSync(levelOutputPath, JSON.stringify(translations, null, 2), 'utf-8');
    console.log(`   💾 已保存到: ${levelOutputPath}`);
  }
  
  // 保存合併的翻譯
  const allOutputPath = path.join(outputDir, 'gept-all-translations.json');
  fs.writeFileSync(allOutputPath, JSON.stringify(allTranslations, null, 2), 'utf-8');
  
  console.log('\n=== 提取完成 ===');
  console.log(`總單字數: ${Object.keys(allTranslations).length}`);
  console.log(`已保存到: ${allOutputPath}`);
  
  // 顯示統計
  console.log('\n=== 各等級統計 ===');
  Object.entries(levelStats).forEach(([level, count]) => {
    console.log(`${level}: ${count} 個單字`);
  });
  
  // 顯示範例
  console.log('\n=== 範例 (前 20 個) ===');
  const words = Object.keys(allTranslations).slice(0, 20);
  words.forEach(word => {
    console.log(`${word} → ${allTranslations[word]}`);
  });
  
  console.log('\n✅ 完成!現在可以更新 SRS 系統使用這些翻譯。');
}

main();

