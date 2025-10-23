# GEPT 詞彙數據庫

## 📚 概述

這個目錄包含全民英檢 (GEPT) 各等級的詞彙數據,用於 EduCreate TTS 預生成系統。

## 📊 詞彙等級

| 等級 | 詞彙量 | 適用年齡 | 檔案 | 狀態 |
|------|--------|---------|------|------|
| **GEPT Kids** | 300 字 | 幼兒園 | `gept-kids.json` | ✅ 範例 (50/300) |
| **GEPT 初級** | 1,000 字 | 國小 | `gept-elementary.json` | ⏳ 待補充 |
| **GEPT 中級** | 2,000 字 | 國中 | `gept-intermediate.json` | ⏳ 待補充 |
| **GEPT 中高級** | 3,000 字 | 高中 | `gept-high-intermediate.json` | ⏳ 待補充 |

**總計**: 6,000 個獨特單字

## 📝 JSON 格式規範

每個詞彙檔案使用以下 JSON 結構:

```json
{
  "level": "GEPT_KIDS",
  "description": "GEPT Kids 基礎 300 字 - 幼兒園階段",
  "totalWords": 300,
  "sampleWords": 50,
  "words": [
    {
      "word": "apple",
      "translation": "蘋果",
      "phonetic": "/ˈæp.əl/",
      "partOfSpeech": "noun",
      "exampleSentence": "I like to eat an apple.",
      "exampleTranslation": "我喜歡吃蘋果。"
    }
  ]
}
```

### 欄位說明

- **word**: 英文單字 (小寫)
- **translation**: 中文翻譯
- **phonetic**: 國際音標 (IPA)
- **partOfSpeech**: 詞性 (noun, verb, adjective, adverb, etc.)
- **exampleSentence**: 英文例句
- **exampleTranslation**: 例句中文翻譯

## 🎯 TTS 預生成需求

### 音頻檔案生成

每個單字需要生成 **4 個音頻檔案**:

1. **英文 - 男聲**: `{word}_en_male.mp3`
2. **英文 - 女聲**: `{word}_en_female.mp3`
3. **中文 - 男聲**: `{translation}_zh_male.mp3`
4. **中文 - 女聲**: `{translation}_zh_female.mp3`

### 總音頻檔案數

- GEPT Kids: 300 × 4 = **1,200 檔案**
- GEPT 初級: 1,000 × 4 = **4,000 檔案**
- GEPT 中級: 2,000 × 4 = **8,000 檔案**
- GEPT 中高級: 3,000 × 4 = **12,000 檔案**

**總計**: **25,200 音頻檔案**

## 📥 如何補充完整詞彙

### 方法 1: 官方來源

1. **LTTC 全民英檢官網**
   - 網址: https://www.lttc.ntu.edu.tw/
   - 下載官方詞彙表 PDF
   - 手動整理成 JSON 格式

2. **GEPT Kids 官網**
   - 網址: https://www.geptkids.org.tw/
   - 查看官方教材詞彙

### 方法 2: 教育資源

1. **教育部國小英語基本字彙**
   - 包含 1,000 個國小必學單字
   - 可對應到 GEPT 初級

2. **國中英語常用字彙**
   - 包含 2,000 個國中常用單字
   - 可對應到 GEPT 中級

### 方法 3: 開源資源

1. **GitHub 搜尋**
   ```bash
   搜尋關鍵字: "GEPT vocabulary" OR "全民英檢詞彙"
   ```

2. **教育開放數據**
   - 台灣教育部開放資料平台
   - 各縣市教育局資源

## 🔧 數據驗證

### 驗證腳本

創建 `scripts/validate-vocabulary.js`:

```javascript
const fs = require('fs');

function validateVocabulary(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // 檢查必要欄位
  const requiredFields = ['word', 'translation', 'phonetic', 'partOfSpeech'];
  
  data.words.forEach((entry, index) => {
    requiredFields.forEach(field => {
      if (!entry[field]) {
        console.error(`❌ 第 ${index + 1} 個單字缺少 ${field}`);
      }
    });
  });
  
  console.log(`✅ ${filePath} 驗證完成: ${data.words.length} 個單字`);
}
```

### 去重腳本

創建 `scripts/deduplicate-vocabulary.js`:

```javascript
function deduplicateWords(words) {
  const seen = new Set();
  return words.filter(entry => {
    if (seen.has(entry.word.toLowerCase())) {
      console.warn(`⚠️  重複單字: ${entry.word}`);
      return false;
    }
    seen.add(entry.word.toLowerCase());
    return true;
  });
}
```

## 📈 進度追蹤

### 當前狀態

- [x] 創建數據結構
- [x] GEPT Kids 範例 (50/300)
- [ ] GEPT Kids 完整 (300/300)
- [ ] GEPT 初級 (0/1,000)
- [ ] GEPT 中級 (0/2,000)
- [ ] GEPT 中高級 (0/3,000)

### 下一步

1. **補充 GEPT Kids 剩餘 250 字**
2. **收集 GEPT 初級 1,000 字**
3. **收集 GEPT 中級 2,000 字**
4. **收集 GEPT 中高級 3,000 字**
5. **驗證和去重**
6. **執行 TTS 預生成**

## 🎓 詞彙來源建議

### 推薦資源

1. **Oxford 3000**: 牛津大學出版社的 3,000 個核心英文單字
2. **Cambridge English Vocabulary**: 劍橋英語詞彙表
3. **台灣教育部字彙表**: 官方認可的學習詞彙

### 注意事項

- ✅ 確保詞彙適合目標年齡層
- ✅ 包含常用生活詞彙
- ✅ 提供清晰的中文翻譯
- ✅ 例句簡單易懂
- ✅ 音標準確

## 💡 使用範例

### 讀取詞彙

```javascript
const geptKids = require('./gept-kids.json');

console.log(`GEPT Kids 等級: ${geptKids.level}`);
console.log(`總詞彙量: ${geptKids.totalWords}`);
console.log(`第一個單字: ${geptKids.words[0].word}`);
```

### 生成 TTS

```javascript
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const client = new TextToSpeechClient();

async function generateTTS(word, language, voice) {
  const request = {
    input: { text: word },
    voice: { languageCode: language, name: voice },
    audioConfig: { audioEncoding: 'MP3' }
  };
  
  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
}
```

## 📞 聯絡資訊

如有詞彙數據問題或建議,請聯絡 EduCreate 團隊。

---

**最後更新**: 2025-10-23
**維護者**: EduCreate Team

