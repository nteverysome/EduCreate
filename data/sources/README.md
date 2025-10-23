# GEPT 單字列表來源檔案

此目錄用於存放從官方網站下載的原始單字列表檔案。

---

## 📁 目錄結構

```
data/sources/
├── README.md                           (本檔案)
├── gept-kids-raw.txt                   (GEPT Kids 原始單字列表)
├── gept-elementary-raw.txt             (GEPT 初級原始單字列表)
├── gept-intermediate-raw.txt           (GEPT 中級原始單字列表)
└── gept-high-intermediate-raw.txt      (GEPT 中高級原始單字列表)
```

---

## 📥 如何獲取原始檔案

### 方法 1: 從 LTTC 官網下載

1. **訪問 LTTC 全民英檢參考字表**
   ```
   https://www.lttc.ntu.edu.tw/tw/vocabulary
   ```

2. **下載單字表**
   - 點擊「初級單字表」、「中級單字表」、「中高級單字表」
   - 下載 PDF 或複製網頁內容

3. **提取單字**
   - 使用 PDF 轉文字工具: https://www.ilovepdf.com/pdf_to_text
   - 或手動複製網頁內容

4. **保存到此目錄**
   - `gept-elementary-raw.txt`
   - `gept-intermediate-raw.txt`
   - `gept-high-intermediate-raw.txt`

### 方法 2: 從 GEPT Kids 官網下載

1. **訪問 GEPT Kids 參考字表**
   ```
   https://www.geptkids.org.tw/geptkids/wordlist/
   ```

2. **下載 PDF**
   - 點擊「下載專區」
   - 下載「GEPT Kids 參考字表 PDF」

3. **提取單字**
   - 使用 PDF 轉文字工具

4. **保存到此目錄**
   - `gept-kids-raw.txt`

---

## 🔄 處理流程

### 步驟 1: 下載原始檔案

將下載的單字列表保存到此目錄:
- `gept-kids-raw.txt`
- `gept-elementary-raw.txt`
- `gept-intermediate-raw.txt`
- `gept-high-intermediate-raw.txt`

### 步驟 2: 清理和格式化

使用批量處理腳本:

```bash
# Windows
scripts\process-all-word-lists.bat

# 或手動處理單個檔案
node scripts/clean-word-list.js data/sources/gept-kids-raw.txt data/word-lists/gept-kids-all.txt
```

### 步驟 3: 驗證結果

檢查生成的檔案:
```bash
# 查看單字數量
dir data\word-lists\*.txt

# 或使用 PowerShell
Get-ChildItem data\word-lists\*.txt | ForEach-Object { 
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    Write-Host "$($_.Name): $lines 個單字"
}
```

---

## 📋 檔案格式要求

### 原始檔案格式 (raw.txt)

可以包含:
- 單字 (每行一個)
- 空行
- 註釋 (以 # 開頭)
- 行號
- 其他格式化字符

範例:
```
1. apple
2. banana
3. cat

# 動物
dog
fish

...
```

### 清理後格式 (word-lists/*.txt)

只包含:
- 單字 (每行一個)
- 全部小寫
- 按字母順序排列
- 無重複

範例:
```
apple
banana
cat
dog
fish
```

---

## ✅ 檢查清單

### 下載前
- [ ] 確認網路連線
- [ ] 準備文字編輯器
- [ ] 確認此目錄存在

### 下載中
- [ ] 訪問 LTTC 網站
- [ ] 下載或複製單字表
- [ ] 保存到此目錄

### 下載後
- [ ] 檢查檔案是否存在
- [ ] 檢查檔案內容是否正確
- [ ] 執行批量處理腳本
- [ ] 驗證生成的檔案

---

## 🎯 預期結果

處理完成後,應該在 `data/word-lists/` 目錄中看到:

- `gept-kids-all.txt` (~300 個單字)
- `gept-elementary.txt` (~2,000 個單字)
- `gept-intermediate.txt` (~4,000 個單字)
- `gept-high-intermediate.txt` (~7,000 個單字)

---

## 💡 提示

1. **原始檔案可以很亂**
   - 不用擔心格式問題
   - 清理工具會自動處理

2. **保留原始檔案**
   - 不要刪除 raw.txt 檔案
   - 方便日後重新處理

3. **檢查單字數量**
   - 確認數量符合預期
   - 如果差異太大,檢查來源

---

## 📚 相關文檔

- [下載官方單字表指南](../../docs/DOWNLOAD_OFFICIAL_WORD_LISTS_GUIDE.md)
- [單字列表準備指南](../../docs/GEPT_WORD_LIST_PREPARATION_GUIDE.md)
- [詞彙自動化工具指南](../../docs/VOCABULARY_AUTOMATION_TOOLS_GUIDE.md)

---

**最後更新**: 2025-10-23  
**維護者**: EduCreate Team

