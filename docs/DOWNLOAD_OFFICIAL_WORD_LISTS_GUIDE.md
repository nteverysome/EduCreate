# 下載官方單字表詳細指南

**日期**: 2025-10-23  
**目標**: 從 LTTC 官網下載並處理官方 GEPT 單字表

---

## 📋 需要下載的單字表

### 1. GEPT Kids (300 字)
- **來源**: https://www.geptkids.org.tw/geptkids/wordlist/
- **格式**: PDF
- **目標檔案**: `data/sources/gept-kids-official.pdf`

### 2. GEPT 初級 (約 2,000 字)
- **來源**: https://www.lttc.ntu.edu.tw/tw/vocabulary
- **格式**: 網頁或 PDF
- **目標檔案**: `data/sources/gept-elementary-official.txt`

### 3. GEPT 中級 (約 4,000 字)
- **來源**: https://www.lttc.ntu.edu.tw/tw/vocabulary
- **格式**: 網頁或 PDF
- **目標檔案**: `data/sources/gept-intermediate-official.txt`

### 4. GEPT 中高級 (約 7,000 字)
- **來源**: https://www.lttc.ntu.edu.tw/tw/vocabulary
- **格式**: 網頁或 PDF
- **目標檔案**: `data/sources/gept-high-intermediate-official.txt`

---

## 🔗 官方網站連結

### LTTC 全民英檢參考字表
**網址**: https://www.lttc.ntu.edu.tw/tw/vocabulary

**頁面說明**:
- 提供初級、中級、中高級單字表
- 可以按字母順序瀏覽
- 包含中文釋義和發音
- 提供 PDF 下載連結

### GEPT Kids 參考字表
**網址**: https://www.geptkids.org.tw/geptkids/wordlist/

**頁面說明**:
- 提供 300 個基礎單字
- 可按字母順序或主題分類查詢
- 提供語音播放
- 有 PDF 檔可供下載

---

## 📝 下載步驟

### 步驟 1: 訪問 LTTC 網站

1. **打開瀏覽器**
   ```
   https://www.lttc.ntu.edu.tw/tw/vocabulary
   ```

2. **找到下載連結**
   - 頁面底部有「單字表下載」連結
   - 點擊「初級單字表」、「中級單字表」、「中高級單字表」

3. **下載 PDF 或複製網頁內容**
   - 如果有 PDF: 下載並保存到 `data/sources/`
   - 如果是網頁: 複製單字列表到文字編輯器

### 步驟 2: 訪問 GEPT Kids 網站

1. **打開瀏覽器**
   ```
   https://www.geptkids.org.tw/geptkids/wordlist/
   ```

2. **下載 PDF**
   - 點擊「下載專區」
   - 下載「GEPT Kids 參考字表 PDF」
   - 保存到 `data/sources/gept-kids-official.pdf`

### 步驟 3: 提取單字

#### 方法 A: 從 PDF 提取 (推薦使用線上工具)

1. **使用線上 PDF 轉文字工具**
   - https://www.ilovepdf.com/pdf_to_text
   - https://www.pdftotext.com/
   - 上傳 PDF
   - 下載轉換後的文字檔

2. **保存到 sources 目錄**
   ```bash
   # 保存提取的文字到
   data/sources/gept-kids-raw.txt
   data/sources/gept-elementary-raw.txt
   data/sources/gept-intermediate-raw.txt
   data/sources/gept-high-intermediate-raw.txt
   ```

#### 方法 B: 從網頁複製

1. **瀏覽 LTTC 網頁版單字表**
   - 點擊「初級單字表」
   - 點擊字母 A-Z 查看所有單字

2. **複製單字**
   - 選擇並複製單字列表
   - 貼到文字編輯器 (Notepad, VS Code)
   - 保存為 .txt 檔案

3. **重複所有字母**
   - 依次點擊 A, B, C, ..., Z
   - 複製所有單字
   - 合併到同一個檔案

### 步驟 4: 清理和格式化

使用我們的清理工具:

```bash
# GEPT Kids
node scripts/clean-word-list.js \
  data/sources/gept-kids-raw.txt \
  data/word-lists/gept-kids-all.txt

# GEPT 初級
node scripts/clean-word-list.js \
  data/sources/gept-elementary-raw.txt \
  data/word-lists/gept-elementary.txt

# GEPT 中級
node scripts/clean-word-list.js \
  data/sources/gept-intermediate-raw.txt \
  data/word-lists/gept-intermediate.txt

# GEPT 中高級
node scripts/clean-word-list.js \
  data/sources/gept-high-intermediate-raw.txt \
  data/word-lists/gept-high-intermediate.txt
```

### 步驟 5: 驗證單字數量

```bash
# 檢查每個檔案的單字數量
wc -l data/word-lists/gept-*.txt

# 或使用 PowerShell (Windows)
Get-Content data/word-lists/gept-*.txt | Measure-Object -Line
```

**預期數量**:
- GEPT Kids: ~300 字
- GEPT 初級: ~2,000 字
- GEPT 中級: ~4,000 字
- GEPT 中高級: ~7,000 字

---

## 🛠️ 實用技巧

### 技巧 1: 批量處理

創建批量處理腳本 `scripts/process-all-word-lists.bat` (Windows):

```batch
@echo off
echo 清理所有單字列表...

if exist "data\sources\gept-kids-raw.txt" (
    node scripts\clean-word-list.js data\sources\gept-kids-raw.txt data\word-lists\gept-kids-all.txt
)

if exist "data\sources\gept-elementary-raw.txt" (
    node scripts\clean-word-list.js data\sources\gept-elementary-raw.txt data\word-lists\gept-elementary.txt
)

if exist "data\sources\gept-intermediate-raw.txt" (
    node scripts\clean-word-list.js data\sources\gept-intermediate-raw.txt data\word-lists\gept-intermediate.txt
)

if exist "data\sources\gept-high-intermediate-raw.txt" (
    node scripts\clean-word-list.js data\sources\gept-high-intermediate-raw.txt data\word-lists\gept-high-intermediate.txt
)

echo 完成!
pause
```

### 技巧 2: 合併 GEPT Kids

如果需要合併現有的 50 個單字和新下載的 300 個單字:

```bash
node scripts/merge-word-lists.js \
  data/word-lists/gept-kids-existing.txt \
  data/word-lists/gept-kids-all.txt \
  data/word-lists/gept-kids-merged.txt
```

### 技巧 3: 檢查重複

```bash
# 檢查單字列表中的重複
sort data/word-lists/gept-elementary.txt | uniq -d

# PowerShell (Windows)
Get-Content data/word-lists/gept-elementary.txt | Group-Object | Where-Object { $_.Count -gt 1 }
```

---

## 📊 處理流程圖

```
1. 訪問官網
   ↓
2. 下載 PDF 或複製網頁
   ↓
3. 提取單字到 data/sources/*.txt
   ↓
4. 使用 clean-word-list.js 清理
   ↓
5. 驗證單字數量
   ↓
6. 保存到 data/word-lists/*.txt
   ↓
7. 開始自動收集詞彙數據
```

---

## ✅ 檢查清單

### 下載前
- [ ] 確認網路連線
- [ ] 準備文字編輯器
- [ ] 創建 `data/sources/` 目錄

### 下載中
- [ ] 訪問 LTTC 網站
- [ ] 下載或複製初級單字表
- [ ] 下載或複製中級單字表
- [ ] 下載或複製中高級單字表
- [ ] 訪問 GEPT Kids 網站
- [ ] 下載 GEPT Kids PDF

### 下載後
- [ ] 提取單字到文字檔
- [ ] 使用清理工具格式化
- [ ] 驗證單字數量
- [ ] 檢查重複單字
- [ ] 保存到正確位置

---

## 🎯 下一步

完成單字列表準備後:

1. **開始自動收集**
   ```bash
   # GEPT Kids
   node scripts/collect-vocabulary-free.js \
     GEPT_KIDS \
     "GEPT Kids 基礎 300 字 - 幼兒園階段" \
     data/word-lists/gept-kids-all.txt
   
   # GEPT 初級
   node scripts/collect-vocabulary-free.js \
     GEPT_ELEMENTARY \
     "GEPT 初級 2000 字 - 國小階段" \
     data/word-lists/gept-elementary.txt
   ```

2. **驗證生成的數據**
   ```bash
   node scripts/validate-vocabulary.js data/gept-vocabulary/
   ```

3. **繼續 Phase 3: TTS 預生成**

---

## 💡 常見問題

### Q1: PDF 無法下載怎麼辦?

**A**: 使用網頁版單字表:
1. 點擊字母 A-Z 逐個查看
2. 複製單字到文字編輯器
3. 合併所有單字

### Q2: 單字數量不符合預期?

**A**: 可能原因:
- 包含重複單字 → 使用去重工具
- 包含非單字內容 → 使用清理工具
- 不同版本的單字表 → 確認來源

### Q3: 如何確認單字表是最新版?

**A**: 
- 檢查 LTTC 網站更新日期
- 比對教育部課綱
- 參考官方說明

---

## 📚 參考資源

### 官方網站
- LTTC: https://www.lttc.ntu.edu.tw/
- GEPT Kids: https://www.geptkids.org.tw/
- 教育部: https://www.edu.tw/

### 線上工具
- PDF 轉文字: https://www.ilovepdf.com/pdf_to_text
- 文字編輯器: VS Code, Notepad++

---

**最後更新**: 2025-10-23  
**維護者**: EduCreate Team

**準備好開始了嗎?** 🚀

1. 訪問 https://www.lttc.ntu.edu.tw/tw/vocabulary
2. 下載單字表
3. 使用我們的工具處理
4. 開始自動收集!

