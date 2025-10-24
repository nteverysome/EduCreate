/**
 * 從 GEPT PDF 文件提取中英對照
 * 
 * 使用 pdf-parse 庫解析 PDF 並提取單字和中文翻譯
 */

const fs = require('fs');
const path = require('path');

// 檢查是否安裝了 pdf-parse
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (error) {
  console.log('❌ 未安裝 pdf-parse 套件');
  console.log('   請執行: npm install pdf-parse');
  process.exit(1);
}

/**
 * 從 PDF 文本中提取中英對照
 * 
 * GEPT PDF 格式範例:
 * abandon v. 放棄；拋棄
 * ability n. 能力
 * able a. 能夠的
 */
function extractTranslations(text) {
  const translations = {};
  const lines = text.split('\n');
  
  let count = 0;
  
  for (let line of lines) {
    // 清理行
    line = line.trim();
    
    // 跳過空行和標題行
    if (!line || line.length < 3) continue;
    if (line.includes('全民英檢')) continue;
    if (line.includes('參考字表')) continue;
    if (line.includes('GEPT')) continue;
    if (line.includes('頁次')) continue;
    
    // 匹配格式: "word [詞性] 中文翻譯"
    // 範例: "abandon v. 放棄；拋棄"
    // 範例: "ability n. 能力"
    // 範例: "able a. 能夠的"
    
    // 正則表達式: 單字 + 可選詞性 + 中文
    const match = line.match(/^([a-zA-Z\-']+)\s+(?:[a-z]+\.\s+)?(.+)$/);
    
    if (match) {
      const word = match[1].toLowerCase().trim();
      let chinese = match[2].trim();
      
      // 清理中文翻譯
      // 移除詞性標記 (n., v., a., ad., prep., conj., int., aux., pron.)
      chinese = chinese.replace(/^[a-z]+\.\s+/, '');
      
      // 移除頁碼
      chinese = chinese.replace(/\d+$/, '').trim();
      
      // 只保留第一個翻譯 (如果有多個用分號或逗號分隔)
      if (chinese.includes('；')) {
        chinese = chinese.split('；')[0];
      }
      if (chinese.includes('，')) {
        chinese = chinese.split('，')[0];
      }
      if (chinese.includes(';')) {
        chinese = chinese.split(';')[0];
      }
      if (chinese.includes(',')) {
        chinese = chinese.split(',')[0];
      }
      
      // 驗證中文 (至少包含一個中文字符)
      if (/[\u4e00-\u9fa5]/.test(chinese)) {
        translations[word] = chinese;
        count++;
        
        if (count <= 10) {
          console.log(`  ✅ ${word} → ${chinese}`);
        }
      }
    }
  }
  
  return translations;
}

/**
 * 處理單個 PDF 文件
 */
async function processPDF(pdfPath, level) {
  console.log(`\n📄 處理 ${level} PDF...`);
  console.log(`   路徑: ${pdfPath}`);
  
  try {
    // 讀取 PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // 解析 PDF
    console.log('   解析 PDF...');
    const data = await pdfParse(dataBuffer);
    
    console.log(`   總頁數: ${data.numpages}`);
    console.log(`   提取文本長度: ${data.text.length} 字符`);
    
    // 提取翻譯
    console.log('   提取中英對照...');
    const translations = extractTranslations(data.text);
    
    console.log(`   ✅ 成功提取 ${Object.keys(translations).length} 個單字`);
    
    // 顯示前 10 個範例
    console.log('\n   範例:');
    
    return translations;
  } catch (error) {
    console.error(`   ❌ 處理失敗: ${error.message}`);
    return {};
  }
}

/**
 * 主函數
 */
async function main() {
  console.log('=== 從 GEPT PDF 提取中英對照 ===\n');
  
  const sourcesDir = path.join(__dirname, '../data/sources');
  const outputDir = path.join(__dirname, '../data/translations');
  
  // 確保輸出目錄存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // PDF 文件列表
  const pdfFiles = [
    { path: path.join(sourcesDir, 'GEPT_Elementary.pdf'), level: 'ELEMENTARY' },
    { path: path.join(sourcesDir, 'GEPT_Intermediate.pdf'), level: 'INTERMEDIATE' },
    { path: path.join(sourcesDir, 'GEPT_High-Intermediate.pdf'), level: 'HIGH_INTERMEDIATE' }
  ];
  
  // 合併所有翻譯
  const allTranslations = {};
  let totalCount = 0;
  
  // 處理每個 PDF
  for (const { path: pdfPath, level } of pdfFiles) {
    if (!fs.existsSync(pdfPath)) {
      console.log(`⚠️  文件不存在: ${pdfPath}`);
      continue;
    }
    
    const translations = await processPDF(pdfPath, level);
    
    // 合併翻譯
    Object.assign(allTranslations, translations);
    totalCount += Object.keys(translations).length;
    
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
  console.log('\n=== 統計 ===');
  console.log(`ELEMENTARY: ${Object.keys(allTranslations).filter(w => w).length} 個單字`);
  console.log(`總計: ${Object.keys(allTranslations).length} 個單字`);
  
  // 顯示範例
  console.log('\n=== 範例 (前 20 個) ===');
  const words = Object.keys(allTranslations).slice(0, 20);
  words.forEach(word => {
    console.log(`${word} → ${allTranslations[word]}`);
  });
}

main().catch(console.error);

