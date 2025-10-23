# GEPT 詞彙收集完整指南

## 📋 目錄

1. [概述](#概述)
2. [詞彙來源](#詞彙來源)
3. [收集方法](#收集方法)
4. [數據格式](#數據格式)
5. [質量控制](#質量控制)
6. [自動化工具](#自動化工具)

---

## 概述

### 目標

收集全民英檢 (GEPT) 四個等級共 **6,000 個單字**,用於 TTS 預生成系統。

### 詞彙分級

| 等級 | 詞彙量 | 適用年齡 | 優先級 |
|------|--------|---------|--------|
| GEPT Kids | 300 字 | 幼兒園 | 🔴 高 |
| GEPT 初級 | 1,000 字 | 國小 | 🟠 高 |
| GEPT 中級 | 2,000 字 | 國中 | 🟡 中 |
| GEPT 中高級 | 3,000 字 | 高中 | 🟢 中 |

---

## 詞彙來源

### 1. 官方來源 (最推薦)

#### LTTC 全民英檢官網

**網址**: https://www.lttc.ntu.edu.tw/

**資源**:
- 官方詞彙表 PDF
- 各等級參考字表
- 測驗範例

**下載步驟**:
1. 進入官網
2. 點選「測驗介紹」→「參考字表」
3. 下載各等級 PDF 檔案

#### GEPT Kids 官網

**網址**: https://www.geptkids.org.tw/

**資源**:
- 300 個基礎單字
- 分級教材詞彙
- 互動學習資源

### 2. 教育部資源

#### 國小英語基本字彙

**來源**: 教育部國民及學前教育署

**內容**:
- 1,000 個國小必學單字
- 對應 GEPT 初級
- 包含音標和例句

**取得方式**:
- 教育部網站下載
- 各縣市教育局資源中心

#### 國中英語常用字彙

**來源**: 教育部

**內容**:
- 2,000 個國中常用單字
- 對應 GEPT 中級
- 按主題分類

### 3. 開源資源

#### GitHub 資源

**搜尋關鍵字**:
```
"GEPT vocabulary"
"全民英檢詞彙"
"Taiwan English vocabulary"
```

**推薦專案**:
- 台灣英語教育開源專案
- 詞彙學習 App 開源數據

#### 教育開放數據

**平台**:
- 政府資料開放平台
- 教育雲資源
- 各大學開放課程

### 4. 商業資源 (需授權)

#### 出版社教材

- 康軒版英語教材
- 翰林版英語教材
- 南一版英語教材

**注意**: 需要取得授權才能使用

---

## 收集方法

### 方法 1: 手動整理 (最準確)

#### 步驟

1. **下載官方 PDF**
   ```bash
   # 從 LTTC 官網下載
   GEPT_Elementary.pdf
   GEPT_Intermediate.pdf
   GEPT_High-Intermediate.pdf
   ```

2. **轉換為文字**
   - 使用 Adobe Acrobat Reader
   - 或線上 PDF 轉文字工具
   - 複製單字列表

3. **整理成 JSON**
   ```javascript
   {
     "word": "apple",
     "translation": "蘋果",
     "phonetic": "/ˈæp.əl/",
     "partOfSpeech": "noun",
     "exampleSentence": "I like to eat an apple.",
     "exampleTranslation": "我喜歡吃蘋果。"
   }
   ```

4. **補充資訊**
   - 中文翻譯: 使用 Google Translate 或字典
   - 音標: 參考 Cambridge Dictionary
   - 例句: 參考 Oxford Learner's Dictionary

#### 優點
- ✅ 數據準確
- ✅ 質量可控
- ✅ 符合官方標準

#### 缺點
- ❌ 耗時較長
- ❌ 需要人工檢查

### 方法 2: 半自動化 (推薦)

#### 工具

**PDF 解析**:
```bash
npm install pdf-parse
```

**詞典 API**:
- Cambridge Dictionary API
- Oxford Dictionary API
- Google Translate API

#### 腳本範例

```javascript
const pdfParse = require('pdf-parse');
const fs = require('fs');

async function extractWords(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  // 提取單字 (假設每行一個單字)
  const words = data.text
    .split('\n')
    .filter(line => /^[a-z]+$/i.test(line.trim()))
    .map(word => word.trim().toLowerCase());
  
  return words;
}

async function enrichWord(word) {
  // 使用 API 獲取翻譯、音標、例句
  const translation = await getTranslation(word);
  const phonetic = await getPhonetic(word);
  const example = await getExample(word);
  
  return {
    word,
    translation,
    phonetic,
    partOfSpeech: 'noun', // 需要進一步判斷
    exampleSentence: example.en,
    exampleTranslation: example.zh
  };
}
```

#### 優點
- ✅ 效率較高
- ✅ 可批量處理
- ✅ 減少人工工作

#### 缺點
- ⚠️ 需要 API 金鑰
- ⚠️ 可能有錯誤需要檢查

### 方法 3: 眾包 (長期方案)

#### 平台

- Google Sheets 協作
- GitHub Issues
- 線上表單

#### 流程

1. **創建協作表單**
   - 單字列表
   - 翻譯欄位
   - 例句欄位

2. **邀請貢獻者**
   - 英語教師
   - 學生家長
   - 志願者

3. **審核和整合**
   - 定期檢查提交
   - 驗證準確性
   - 合併到主數據庫

---

## 數據格式

### JSON 結構

```json
{
  "level": "GEPT_KIDS",
  "description": "GEPT Kids 基礎 300 字",
  "totalWords": 300,
  "words": [
    {
      "word": "apple",
      "translation": "蘋果",
      "phonetic": "/ˈæp.əl/",
      "partOfSpeech": "noun",
      "exampleSentence": "I like to eat an apple.",
      "exampleTranslation": "我喜歡吃蘋果。",
      "difficulty": 1,
      "frequency": "high",
      "topics": ["food", "fruit"]
    }
  ]
}
```

### 欄位規範

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| word | string | ✅ | 英文單字 (小寫) |
| translation | string | ✅ | 中文翻譯 |
| phonetic | string | ✅ | IPA 音標 |
| partOfSpeech | string | ✅ | 詞性 |
| exampleSentence | string | ✅ | 英文例句 |
| exampleTranslation | string | ✅ | 例句翻譯 |
| difficulty | number | ⭕ | 難度 (1-5) |
| frequency | string | ⭕ | 使用頻率 |
| topics | array | ⭕ | 主題標籤 |

---

## 質量控制

### 驗證檢查清單

#### 1. 單字檢查
- [ ] 拼寫正確
- [ ] 全部小寫
- [ ] 無特殊字符
- [ ] 無重複

#### 2. 翻譯檢查
- [ ] 翻譯準確
- [ ] 適合年齡層
- [ ] 使用常用詞彙
- [ ] 無繁簡混用

#### 3. 音標檢查
- [ ] 使用 IPA 格式
- [ ] 包含重音符號
- [ ] 格式統一

#### 4. 例句檢查
- [ ] 句子完整
- [ ] 語法正確
- [ ] 長度適中 (5-15 字)
- [ ] 使用該單字

### 自動驗證腳本

```javascript
function validateEntry(entry) {
  const errors = [];
  
  // 檢查必填欄位
  if (!entry.word) errors.push('缺少 word');
  if (!entry.translation) errors.push('缺少 translation');
  if (!entry.phonetic) errors.push('缺少 phonetic');
  
  // 檢查格式
  if (entry.word !== entry.word.toLowerCase()) {
    errors.push('word 應為小寫');
  }
  
  if (!entry.phonetic.startsWith('/') || !entry.phonetic.endsWith('/')) {
    errors.push('phonetic 格式錯誤');
  }
  
  return errors;
}
```

---

## 自動化工具

### 詞彙收集腳本

創建 `scripts/collect-vocabulary.js`:

```javascript
const axios = require('axios');
const fs = require('fs');

async function collectVocabulary(level, wordList) {
  const vocabulary = {
    level,
    totalWords: wordList.length,
    words: []
  };
  
  for (const word of wordList) {
    try {
      const entry = await enrichWord(word);
      vocabulary.words.push(entry);
      console.log(`✅ ${word}`);
    } catch (error) {
      console.error(`❌ ${word}: ${error.message}`);
    }
  }
  
  fs.writeFileSync(
    `data/gept-vocabulary/${level}.json`,
    JSON.stringify(vocabulary, null, 2)
  );
}
```

### 批量翻譯腳本

```javascript
async function batchTranslate(words) {
  const { Translate } = require('@google-cloud/translate').v2;
  const translate = new Translate();
  
  const [translations] = await translate.translate(words, 'zh-TW');
  
  return words.map((word, i) => ({
    word,
    translation: translations[i]
  }));
}
```

---

## 📊 進度追蹤

### 當前狀態

- [x] 創建數據結構
- [x] GEPT Kids 範例 (50/300)
- [ ] GEPT Kids 完整 (300/300)
- [ ] GEPT 初級 (0/1,000)
- [ ] GEPT 中級 (0/2,000)
- [ ] GEPT 中高級 (0/3,000)

### 預估時間

| 任務 | 方法 | 預估時間 |
|------|------|---------|
| GEPT Kids (250字) | 手動 | 5 小時 |
| GEPT 初級 (1,000字) | 半自動 | 10 小時 |
| GEPT 中級 (2,000字) | 半自動 | 20 小時 |
| GEPT 中高級 (3,000字) | 半自動 | 30 小時 |
| **總計** | | **65 小時** |

---

## 🎯 下一步行動

1. **立即行動** (今天)
   - 下載 LTTC 官方 PDF
   - 提取 GEPT Kids 剩餘 250 字
   - 補充到 `gept-kids.json`

2. **短期目標** (本週)
   - 完成 GEPT Kids 300 字
   - 開始收集 GEPT 初級 1,000 字

3. **中期目標** (本月)
   - 完成 GEPT 初級和中級
   - 開始 TTS 預生成測試

4. **長期目標** (下月)
   - 完成所有 6,000 字
   - 執行完整 TTS 預生成
   - 部署到 Cloudflare R2

---

**最後更新**: 2025-10-23
**維護者**: EduCreate Team

