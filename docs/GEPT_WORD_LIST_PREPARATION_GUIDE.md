# GEPT 單字列表準備指南

**日期**: 2025-10-23  
**目標**: 準備 6,000 個 GEPT 單字列表供自動化工具使用

---

## 📋 需要準備的單字列表

### 1. GEPT Kids (300 字)
- **檔案**: `data/word-lists/gept-kids-remaining.txt`
- **數量**: 250 個單字 (已有 50 個)
- **來源**: LTTC GEPT Kids 官方詞彙表

### 2. GEPT 初級 (1,000 字)
- **檔案**: `data/word-lists/gept-elementary.txt`
- **數量**: 1,000 個單字
- **來源**: LTTC GEPT 初級官方詞彙表

### 3. GEPT 中級 (2,000 字)
- **檔案**: `data/word-lists/gept-intermediate.txt`
- **數量**: 2,000 個單字
- **來源**: LTTC GEPT 中級官方詞彙表

### 4. GEPT 中高級 (3,000 字)
- **檔案**: `data/word-lists/gept-high-intermediate.txt`
- **數量**: 3,000 個單字
- **來源**: LTTC GEPT 中高級官方詞彙表

---

## 🔗 官方資源

### LTTC (Language Training & Testing Center)

**官方網站**: https://www.lttc.ntu.edu.tw/

**詞彙表下載**:
1. GEPT Kids: https://www.geptkids.org.tw/
2. GEPT 初級: https://www.lttc.ntu.edu.tw/GEPT.htm
3. GEPT 中級: https://www.lttc.ntu.edu.tw/GEPT.htm
4. GEPT 中高級: https://www.lttc.ntu.edu.tw/GEPT.htm

### 教育部字彙表

**網站**: https://www.edu.tw/

**資源**:
- 國小英語字彙表
- 國中英語字彙表
- 高中英語字彙表

---

## 📝 準備方法

### 方法 1: 手動提取 (最準確)

#### 步驟 1: 下載官方 PDF
```bash
# 從 LTTC 網站下載官方詞彙表 PDF
# 保存到 data/sources/ 目錄
```

#### 步驟 2: 複製單字到文字檔
```bash
# 打開 PDF
# 選擇並複製單字列表
# 貼到文字編輯器
# 保存為 .txt 檔案
```

#### 步驟 3: 清理格式
```bash
# 移除行號、頁碼等
# 每行一個單字
# 移除空行
# 轉換為小寫
```

#### 範例:
```txt
# data/word-lists/gept-kids-remaining.txt
ant
bear
cake
duck
elephant
...
```

### 方法 2: 使用線上資源

#### 資源 1: Quizlet
- 搜尋 "GEPT Kids vocabulary"
- 搜尋 "GEPT Elementary vocabulary"
- 複製單字列表

#### 資源 2: GitHub
- 搜尋 "GEPT vocabulary list"
- 尋找開源詞彙表專案

#### 資源 3: 教育網站
- VoiceTube
- 空中英語教室
- 常春藤英語

### 方法 3: 使用現有數據

#### 從 gept-kids.json 提取已有單字
```bash
# 創建提取腳本
node scripts/extract-existing-words.js
```

---

## 🛠️ 輔助工具

### 工具 1: 提取現有單字

創建 `scripts/extract-existing-words.js`:

```javascript
const fs = require('fs');
const path = require('path');

// 讀取現有的 GEPT Kids 數據
const geptKids = require('../data/gept-vocabulary/gept-kids.json');

// 提取單字列表
const words = geptKids.words.map(entry => entry.word);

// 保存到文字檔
const outputPath = path.join(__dirname, '../data/word-lists/gept-kids-existing.txt');
fs.writeFileSync(outputPath, words.join('\n'), 'utf8');

console.log(`✅ 已提取 ${words.length} 個單字到 ${outputPath}`);
```

### 工具 2: 清理和格式化

創建 `scripts/clean-word-list.js`:

```javascript
const fs = require('fs');

function cleanWordList(inputFile, outputFile) {
  // 讀取檔案
  const content = fs.readFileSync(inputFile, 'utf8');
  
  // 清理和格式化
  const words = content
    .split('\n')
    .map(line => line.trim().toLowerCase())
    .filter(line => {
      // 移除空行
      if (!line) return false;
      // 移除註釋
      if (line.startsWith('#')) return false;
      // 移除數字開頭的行 (行號)
      if (/^\d+/.test(line)) return false;
      // 只保留字母和連字符
      if (!/^[a-z\s-]+$/.test(line)) return false;
      return true;
    })
    .sort();  // 排序
  
  // 去重
  const unique = [...new Set(words)];
  
  // 保存
  fs.writeFileSync(outputFile, unique.join('\n'), 'utf8');
  
  console.log(`✅ 清理完成:`);
  console.log(`   原始: ${words.length} 個單字`);
  console.log(`   去重後: ${unique.length} 個單字`);
  console.log(`   保存到: ${outputFile}`);
}

// 使用範例
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.log('使用方法:');
  console.log('  node clean-word-list.js <input-file> <output-file>');
  process.exit(1);
}

cleanWordList(inputFile, outputFile);
```

### 工具 3: 合併單字列表

創建 `scripts/merge-word-lists.js`:

```javascript
const fs = require('fs');

function mergeWordLists(files, outputFile) {
  const allWords = new Set();
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const words = content
      .split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => line && !line.startsWith('#'));
    
    words.forEach(word => allWords.add(word));
  });
  
  const sorted = [...allWords].sort();
  fs.writeFileSync(outputFile, sorted.join('\n'), 'utf8');
  
  console.log(`✅ 合併完成:`);
  console.log(`   輸入檔案: ${files.length} 個`);
  console.log(`   總單字數: ${sorted.length} 個`);
  console.log(`   保存到: ${outputFile}`);
}

// 使用範例
const files = process.argv.slice(2, -1);
const outputFile = process.argv[process.argv.length - 1];

if (files.length < 2) {
  console.log('使用方法:');
  console.log('  node merge-word-lists.js <file1> <file2> ... <output-file>');
  process.exit(1);
}

mergeWordLists(files, outputFile);
```

---

## 📊 進度追蹤

### 當前狀態

- [x] GEPT Kids: 50/300 (16.7%)
- [ ] GEPT 初級: 0/1,000 (0%)
- [ ] GEPT 中級: 0/2,000 (0%)
- [ ] GEPT 中高級: 0/3,000 (0%)

**總進度**: 50/6,300 (0.8%)

### 目標時程

**本週** (2025-10-23 ~ 2025-10-29):
- [ ] 完成 GEPT Kids 剩餘 250 字
- [ ] 開始 GEPT 初級 1,000 字

**本月** (2025-10):
- [ ] 完成 GEPT 初級 1,000 字
- [ ] 完成 GEPT 中級 2,000 字

**下月** (2025-11):
- [ ] 完成 GEPT 中高級 3,000 字
- [ ] 最終驗證和整合

---

## 🎯 快速開始

### 選項 1: 使用線上資源 (推薦)

1. **搜尋 GitHub**:
   ```bash
   # 在 GitHub 搜尋
   "GEPT vocabulary list"
   "GEPT word list"
   "全民英檢單字表"
   ```

2. **下載並清理**:
   ```bash
   # 下載找到的單字列表
   # 使用清理工具格式化
   node scripts/clean-word-list.js downloaded.txt data/word-lists/gept-elementary.txt
   ```

3. **驗證數量**:
   ```bash
   # 檢查單字數量
   wc -l data/word-lists/gept-elementary.txt
   ```

### 選項 2: 手動建立 (最準確)

1. **訪問 LTTC 官網**:
   - https://www.lttc.ntu.edu.tw/

2. **下載官方詞彙表**:
   - 尋找 PDF 或 Word 檔案

3. **提取單字**:
   - 複製貼上到文字編輯器
   - 每行一個單字
   - 保存為 .txt 檔案

4. **清理格式**:
   ```bash
   node scripts/clean-word-list.js raw.txt data/word-lists/gept-elementary.txt
   ```

---

## 💡 實用技巧

### 技巧 1: 批量處理

創建批量處理腳本:

```bash
#!/bin/bash
# scripts/prepare-all-word-lists.sh

echo "準備 GEPT 單字列表..."

# GEPT Kids
if [ -f "data/sources/gept-kids-raw.txt" ]; then
  node scripts/clean-word-list.js \
    data/sources/gept-kids-raw.txt \
    data/word-lists/gept-kids-remaining.txt
fi

# GEPT 初級
if [ -f "data/sources/gept-elementary-raw.txt" ]; then
  node scripts/clean-word-list.js \
    data/sources/gept-elementary-raw.txt \
    data/word-lists/gept-elementary.txt
fi

# GEPT 中級
if [ -f "data/sources/gept-intermediate-raw.txt" ]; then
  node scripts/clean-word-list.js \
    data/sources/gept-intermediate-raw.txt \
    data/word-lists/gept-intermediate.txt
fi

# GEPT 中高級
if [ -f "data/sources/gept-high-intermediate-raw.txt" ]; then
  node scripts/clean-word-list.js \
    data/sources/gept-high-intermediate-raw.txt \
    data/word-lists/gept-high-intermediate.txt
fi

echo "完成!"
```

### 技巧 2: 驗證單字數量

```bash
# 檢查所有單字列表的數量
for file in data/word-lists/gept-*.txt; do
  count=$(wc -l < "$file")
  echo "$file: $count 個單字"
done
```

### 技巧 3: 檢查重複

```bash
# 檢查單字列表中的重複
sort data/word-lists/gept-elementary.txt | uniq -d
```

---

## 📚 參考資源

### 官方資源
- LTTC 官網: https://www.lttc.ntu.edu.tw/
- GEPT Kids: https://www.geptkids.org.tw/
- 教育部: https://www.edu.tw/

### 線上工具
- Quizlet: https://quizlet.com/
- Anki: https://apps.ankiweb.net/
- Memrise: https://www.memrise.com/

### GitHub 專案
- 搜尋關鍵字: "GEPT vocabulary", "全民英檢單字"

---

## ✅ 檢查清單

準備單字列表前的檢查:

- [ ] 確認官方來源
- [ ] 下載或複製單字列表
- [ ] 清理和格式化
- [ ] 驗證單字數量
- [ ] 檢查重複單字
- [ ] 保存到正確位置
- [ ] 測試自動化工具

---

**最後更新**: 2025-10-23  
**維護者**: EduCreate Team

