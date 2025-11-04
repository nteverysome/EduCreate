# 快速參考指南

## 🎯 一句話總結

**文字以最大的為基準，間距以最小距離為標準**

---

## 📊 核心公式

### 文字高度
```javascript
maxChineseTextHeight = max(所有文字高度)
```

### 單元總高度
```javascript
totalUnitHeight = finalCardHeight + maxChineseTextHeight + verticalSpacing
```

### 最大行數
```javascript
maxRows = floor((availableHeight - verticalSpacing) / totalUnitHeight)
```

### 最小間距
```javascript
minSpacing = (availableHeight - totalHeightNeeded) / (actualRows + 1)
```

---

## 🔧 實施要點

### 第 6 步：計算最大文字高度
```javascript
let maxChineseTextHeight = 0;
currentPagePairs.forEach(pair => {
    const textHeight = this.calculateSmartTextHeight(pair.answer, finalCardWidth, finalCardHeight);
    maxChineseTextHeight = Math.max(maxChineseTextHeight, textHeight);
});
```

### 第 7 步：使用最大文字高度
```javascript
const chineseTextHeight = maxChineseTextHeight;
const totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing;
```

### 第 8 步：反向驗證
```javascript
const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
const actualRows = Math.ceil(itemCount / optimalCols);

if (actualRows > maxRows) {
    // 計算最小間距或分頁
    const itemsPerPage = maxRows * optimalCols;
}
```

---

## 📋 檢查清單

### 實施前
- [ ] 備份原始代碼
- [ ] 創建新分支
- [ ] 準備測試環境

### 實施中
- [ ] 實現 `calculateSmartTextHeight()` 函數
- [ ] 修改第 6 步
- [ ] 修改第 7 步
- [ ] 添加第 8 步
- [ ] 添加日誌輸出

### 實施後
- [ ] 測試基本功能
- [ ] 測試所有場景
- [ ] 檢查視覺效果
- [ ] 驗收標準檢查
- [ ] 代碼審查
- [ ] 提交代碼

---

## 🧪 測試場景

### 場景 1：短文字
```
文字："AI"
預期：正常顯示，不超出邊界
```

### 場景 2：長文字
```
文字："機器人學習系統"
預期：正常顯示，不超出邊界
```

### 場景 3：混合文字
```
文字：["AI", "機器人學習系統", "深度學習"]
預期：所有文字高度統一，都不超出邊界
```

### 場景 4：超多卡片
```
卡片數：20+
預期：自動分頁，每頁卡片數正確
```

### 場景 5：不同設備
```
設備：iPhone, iPad, Desktop
預期：所有設備都能正常顯示
```

---

## 📊 預期結果

### 修正前
```
❌ 卡片可能被切割
❌ 文字可能超出邊界
❌ 無法自動分頁
❌ 視覺效果不統一
```

### 修正後
```
✅ 卡片永遠不會被切割
✅ 文字永遠不會超出邊界
✅ 自動分頁
✅ 視覺效果統一
```

---

## 🚀 快速開始

### 第 1 步：準備
```bash
# 備份代碼
git add .
git commit -m "backup: before optimization"

# 創建新分支
git checkout -b feature/optimized-text-spacing
```

### 第 2 步：實施
1. 實現 `calculateSmartTextHeight()` 函數
2. 修改第 6-8 步
3. 添加日誌輸出
4. 測試基本功能

### 第 3 步：測試
```bash
# 測試所有場景
npm test

# 視覺測試
# 檢查卡片是否被切割
# 檢查文字是否超出邊界
# 檢查間距是否均勻
```

### 第 4 步：提交
```bash
# 提交代碼
git add .
git commit -m "feat: implement optimized text spacing calculation"

# 推送到遠程
git push origin feature/optimized-text-spacing

# 創建 PR
# 等待審查
# 合併到主分支
```

---

## 📁 文檔導航

| 文檔 | 用途 |
|------|------|
| **OPTIMIZED_SOLUTION_SUMMARY.md** | 方案總結 |
| **OPTIMIZED_TEXT_SPACING_CALCULATION.md** | 詳細說明 |
| **OPTIMIZED_VS_ORIGINAL.md** | 對比分析 |
| **IMPLEMENTATION_ROADMAP.md** | 實施路線圖 |
| **QUICK_REFERENCE_GUIDE.md** | 快速參考（本文檔） |

---

## 💡 常見問題

### Q1：為什麼要使用最大文字高度？
**A**：確保所有文字都能完整顯示，視覺效果統一。

### Q2：如果最小間距不足怎麼辦？
**A**：自動啟用分頁，確保卡片完整顯示。

### Q3：性能會受影響嗎？
**A**：性能開銷很小（每頁 5-10ms），可以接受。

### Q4：需要修改多少代碼？
**A**：主要修改 4 個地方（第 6-8 步），約 50-100 行代碼。

### Q5：需要多長時間實施？
**A**：核心實施 2-3 小時，完整優化 7-10 小時。

---

## 🎯 優先級

### 🔴 P0（立即實施）
- 實現 `calculateSmartTextHeight()` 函數
- 修改第 6-8 步
- 添加反向驗證

### 🟠 P1（短期改進）
- 實現最小間距計算
- 實現自動分頁
- 完整測試

### 🟡 P2（長期規劃）
- 支持多行文字
- 支持自定義配置
- 支持文字溢出處理

---

## ✅ 驗收標準

- ✅ 所有卡片的文字高度統一
- ✅ 間距根據可用空間動態調整
- ✅ 卡片永遠不會被切割
- ✅ 文字永遠不會超出邊界
- ✅ 自動分頁（如果需要）
- ✅ 視覺效果統一整齊

---

## 📞 聯繫方式

如有問題，請參考：
1. **OPTIMIZED_TEXT_SPACING_CALCULATION.md** - 詳細說明
2. **IMPLEMENTATION_ROADMAP.md** - 實施步驟
3. **OPTIMIZED_VS_ORIGINAL.md** - 對比分析

---

**最後更新**：2025-11-02
**版本**：v1.0 - 快速參考指南
**狀態**：準備實施

