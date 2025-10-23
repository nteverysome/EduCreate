# GEPT 詞彙自動化工具使用指南

## 📚 工具概述

我們開發了兩個自動化工具來加速 GEPT 詞彙收集和驗證:

1. **`collect-vocabulary.js`**: 自動收集和豐富詞彙數據
2. **`validate-vocabulary.js`**: 驗證詞彙數據的完整性和正確性

---

## 🛠️ 工具 1: collect-vocabulary.js

### 功能

- ✅ 從單字列表自動生成完整詞彙數據
- ✅ 整合 Google Translate API 獲取中文翻譯
- ✅ 整合 Free Dictionary API 獲取音標、詞性和例句
- ✅ 自動翻譯例句
- ✅ 去重和驗證
- ✅ 輸出標準 JSON 格式

### 安裝依賴

```bash
npm install @google-cloud/translate axios
```

### 使用方法

#### 1. 準備單字列表

創建一個文字檔,每行一個單字:

```txt
# data/word-lists/gept-kids-remaining.txt
ant
bear
cake
duck
...
```

#### 2. 執行收集腳本

```bash
node scripts/collect-vocabulary.js GEPT_KIDS "GEPT Kids 基礎 300 字" data/word-lists/gept-kids-remaining.txt
```

**參數說明**:
- `GEPT_KIDS`: 詞彙等級
- `"GEPT Kids 基礎 300 字"`: 描述
- `data/word-lists/gept-kids-remaining.txt`: 單字列表檔案

#### 3. 查看輸出

腳本會自動生成 `data/gept-vocabulary/gept-kids.json`:

```json
{
  "level": "GEPT_KIDS",
  "description": "GEPT Kids 基礎 300 字",
  "totalWords": 250,
  "words": [
    {
      "word": "ant",
      "translation": "螞蟻",
      "phonetic": "/ænt/",
      "partOfSpeech": "noun",
      "exampleSentence": "The ant is small.",
      "exampleTranslation": "螞蟻很小。"
    }
  ]
}
```

### 測試工具

使用測試單字列表驗證工具功能:

```bash
node scripts/collect-vocabulary.js TEST_WORDS "測試詞彙" data/word-lists/test-words.txt
```

### 配置選項

編輯 `scripts/collect-vocabulary.js` 中的 `CONFIG` 對象:

```javascript
const CONFIG = {
  // Google Translate API
  googleTranslate: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  },
  
  // 延遲設定 (避免 API 限流)
  delays: {
    betweenWords: 500,  // 每個單字之間延遲 500ms
    onError: 2000       // 錯誤後延遲 2 秒
  }
};
```

### 錯誤處理

如果某個單字處理失敗,腳本會:
1. 顯示錯誤訊息
2. 跳過該單字
3. 繼續處理下一個單字
4. 在最後顯示成功/失敗統計

---

## 🔍 工具 2: validate-vocabulary.js

### 功能

- ✅ 驗證 JSON 格式正確性
- ✅ 檢查必填欄位
- ✅ 驗證數據格式 (單字、音標、翻譯)
- ✅ 檢查重複單字
- ✅ 驗證例句質量
- ✅ 生成詳細驗證報告

### 使用方法

#### 驗證單個檔案

```bash
node scripts/validate-vocabulary.js data/gept-vocabulary/gept-kids.json
```

#### 驗證整個目錄

```bash
node scripts/validate-vocabulary.js data/gept-vocabulary/
```

### 驗證規則

#### 必填欄位
- `word`: 英文單字
- `translation`: 中文翻譯
- `phonetic`: 音標
- `partOfSpeech`: 詞性
- `exampleSentence`: 英文例句
- `exampleTranslation`: 例句翻譯

#### 格式規則
- **word**: 只允許小寫字母、空格和連字符
- **phonetic**: 必須以 `/` 開頭和結尾
- **translation**: 必須包含中文字符
- **partOfSpeech**: 必須是有效的詞性 (noun, verb, adjective, etc.)

#### 質量檢查
- 例句長度: 3-20 個單字
- 例句必須包含該單字
- 無重複單字

### 輸出範例

```
📋 驗證檔案: data/gept-vocabulary/gept-kids.json

等級: GEPT_KIDS
描述: GEPT Kids 基礎 300 字
總詞彙數: 50
實際詞彙數: 50

=== 驗證結果 ===

✅ 沒有錯誤

⚠️  發現 2 個警告:

   [15] orange:
      - exampleSentence 太短: The orange is sweet.

   [23] water:
      - phonetic 格式可能錯誤: /wɔːtər/ (建議使用 /.../ 格式)

✅ 沒有重複單字

=== 統計摘要 ===

總詞彙數: 50
錯誤數: 0
警告數: 2
重複數: 0

🎉 驗證通過!
```

---

## 📋 完整工作流程

### 步驟 1: 準備單字列表

創建單字列表檔案:

```bash
# data/word-lists/gept-kids-remaining.txt
ant
bear
cake
duck
elephant
...
```

### 步驟 2: 執行自動收集

```bash
node scripts/collect-vocabulary.js \
  GEPT_KIDS \
  "GEPT Kids 基礎 300 字 - 幼兒園階段" \
  data/word-lists/gept-kids-remaining.txt
```

### 步驟 3: 驗證生成的數據

```bash
node scripts/validate-vocabulary.js data/gept-vocabulary/gept-kids.json
```

### 步驟 4: 修正錯誤 (如果有)

根據驗證報告手動修正錯誤:

```bash
# 編輯 JSON 檔案
code data/gept-vocabulary/gept-kids.json

# 重新驗證
node scripts/validate-vocabulary.js data/gept-vocabulary/gept-kids.json
```

### 步驟 5: 合併到現有數據

如果已有部分數據,需要合併:

```javascript
// merge-vocabulary.js
const fs = require('fs');

const existing = require('./data/gept-vocabulary/gept-kids.json');
const newData = require('./data/gept-vocabulary/gept-kids-new.json');

// 合併 words 陣列
existing.words = [...existing.words, ...newData.words];
existing.totalWords = existing.words.length;

// 保存
fs.writeFileSync(
  './data/gept-vocabulary/gept-kids.json',
  JSON.stringify(existing, null, 2)
);
```

---

## 🎯 批量處理範例

### 處理所有 GEPT 等級

創建批量處理腳本 `scripts/collect-all-levels.sh`:

```bash
#!/bin/bash

# GEPT Kids
node scripts/collect-vocabulary.js \
  GEPT_KIDS \
  "GEPT Kids 基礎 300 字" \
  data/word-lists/gept-kids.txt

# GEPT 初級
node scripts/collect-vocabulary.js \
  GEPT_ELEMENTARY \
  "GEPT 初級 1000 字" \
  data/word-lists/gept-elementary.txt

# GEPT 中級
node scripts/collect-vocabulary.js \
  GEPT_INTERMEDIATE \
  "GEPT 中級 2000 字" \
  data/word-lists/gept-intermediate.txt

# GEPT 中高級
node scripts/collect-vocabulary.js \
  GEPT_HIGH_INTERMEDIATE \
  "GEPT 中高級 3000 字" \
  data/word-lists/gept-high-intermediate.txt

# 驗證所有檔案
node scripts/validate-vocabulary.js data/gept-vocabulary/
```

執行:

```bash
chmod +x scripts/collect-all-levels.sh
./scripts/collect-all-levels.sh
```

---

## ⚠️ 注意事項

### API 限制

#### Google Translate API
- **免費額度**: 每月 500,000 字符
- **收費**: $20 / 百萬字符
- **限流**: 建議每個請求間隔 500ms

#### Free Dictionary API
- **免費**: 無限制
- **限流**: 建議每個請求間隔 500ms
- **備註**: 部分單字可能查詢不到

### 成本估算

處理 6,000 個單字:
- 單字翻譯: 6,000 × 10 字符 = 60,000 字符
- 例句翻譯: 6,000 × 50 字符 = 300,000 字符
- **總計**: 360,000 字符 (在免費額度內)

### 處理時間

- 每個單字約需 2-3 秒 (包含 API 延遲)
- 6,000 個單字約需 **3-5 小時**

建議分批處理:
- 每批 500-1,000 個單字
- 每批之間休息 10-15 分鐘

---

## 🐛 故障排除

### 問題 1: Google Translate API 錯誤

**錯誤訊息**: `Error: Could not load the default credentials`

**解決方法**:
```bash
# 確認環境變數設定
echo $GOOGLE_APPLICATION_CREDENTIALS

# 重新設定
export GOOGLE_APPLICATION_CREDENTIALS="./google-cloud-tts-key.json"
```

### 問題 2: Dictionary API 查詢失敗

**錯誤訊息**: `❌ 字典查詢失敗 (word): Request failed with status code 404`

**原因**: 該單字在 Free Dictionary API 中不存在

**解決方法**:
1. 手動補充該單字的資訊
2. 使用其他字典 API (如 Oxford, Cambridge)
3. 跳過該單字,稍後手動處理

### 問題 3: API 限流

**錯誤訊息**: `429 Too Many Requests`

**解決方法**:
```javascript
// 增加延遲時間
const CONFIG = {
  delays: {
    betweenWords: 1000,  // 增加到 1 秒
    onError: 5000        // 增加到 5 秒
  }
};
```

---

## 📊 進度追蹤

### 當前狀態

- [x] 開發 collect-vocabulary.js
- [x] 開發 validate-vocabulary.js
- [x] 創建測試單字列表
- [ ] 測試工具功能
- [ ] 收集 GEPT Kids 剩餘 250 字
- [ ] 收集 GEPT 初級 1,000 字
- [ ] 收集 GEPT 中級 2,000 字
- [ ] 收集 GEPT 中高級 3,000 字

### 下一步

1. **測試工具** (今天)
   ```bash
   node scripts/collect-vocabulary.js TEST_WORDS "測試詞彙" data/word-lists/test-words.txt
   node scripts/validate-vocabulary.js data/gept-vocabulary/test-words.json
   ```

2. **收集 GEPT Kids** (本週)
   - 準備剩餘 250 個單字列表
   - 執行自動收集
   - 驗證和修正

3. **收集其他等級** (本月)
   - GEPT 初級 1,000 字
   - GEPT 中級 2,000 字
   - GEPT 中高級 3,000 字

---

**最後更新**: 2025-10-23
**維護者**: EduCreate Team

