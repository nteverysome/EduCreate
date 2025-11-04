# v7.1 快速實施指南 - 30% 文字高度版本

## 🎯 核心改變

```
中文字高度 = 卡片高度 × 0.3
```

---

## 📝 實施步驟

### 步驟 1：打開文件

```bash
打開：public/games/match-up-game/scenes/game.js
找到：createMixedLayout() 方法
位置：約第 667 行
```

### 步驟 2：修改文字高度計算

**找到這一行**：
```javascript
const chineseTextHeight = finalCardHeight * 0.4;  // 舊版本
```

**改為**：
```javascript
const chineseTextHeight = finalCardHeight * 0.3;  // v7.1 版本
```

### 步驟 3：添加調試日誌

在修改後添加：
```javascript
console.log('📝 v7.1 文字高度計算:', {
    cardHeight: finalCardHeight.toFixed(1),
    textHeightRatio: '30%',
    calculatedTextHeight: chineseTextHeight.toFixed(1),
    mode: '✅ 基於卡片大小（30% 版本）'
});
```

### 步驟 4：驗證修改

檢查以下位置是否也需要修改：
- [ ] 第 667 行：主要計算
- [ ] 第 795 行：中文文字位置計算
- [ ] 第 805 行：中文文字框高度

---

## 🧪 測試場景

### 場景 1：短文字

```javascript
// 測試數據
const pairs = [
    { english: 'big', chinese: '大' },
    { english: 'small', chinese: '小' },
    { english: 'good', chinese: '好' }
];

// 預期結果
// 中文字高度 = 卡片高度 × 0.3
// 例如：150px × 0.3 = 45px
```

### 場景 2：長文字

```javascript
// 測試數據
const pairs = [
    { english: 'artificial intelligence', chinese: '人工智能' },
    { english: 'machine learning', chinese: '機器學習系統' },
    { english: 'deep learning', chinese: '深度學習' }
];

// 預期結果
// 中文字高度 = 卡片高度 × 0.3
// 文字應該完整顯示，不超出邊界
```

### 場景 3：混合文字

```javascript
// 測試數據
const pairs = [
    { english: 'AI', chinese: '人工智能' },
    { english: 'ML', chinese: '機器學習' },
    { english: 'DL', chinese: '深度學習' }
];

// 預期結果
// 所有卡片的中文字高度相同
// 視覺效果統一
```

### 場景 4：多卡片（分頁測試）

```javascript
// 測試數據：20+ 卡片
const pairs = [
    // ... 20+ 個卡片
];

// 預期結果
// 如果超過屏幕高度，自動分頁
// 每頁顯示最多卡片數
```

---

## 📊 計算驗證

### iPhone 14 直向（390×844px）

```
第 1-5 步：基礎計算
- availableHeight = 764px
- verticalSpacing = 23px
- optimalCols = 5
- finalCardHeight = 150px

第 6 步：計算文字高度（v7.1）
- chineseTextHeight = 150 × 0.3 = 45px ✅

第 7 步：計算單元總高度
- totalUnitHeight = 150 + 45 + 23 = 218px ✅

第 8 步：反向驗證
- maxRows = floor(764 / 218) = 3
- actualRows = 4
- 結果：需要分頁 ✅
```

### 桌面版（1440×900px）

```
第 1-5 步：基礎計算
- availableHeight = 820px
- verticalSpacing = 40px
- optimalCols = 5
- finalCardHeight = 300px

第 6 步：計算文字高度（v7.1）
- chineseTextHeight = 300 × 0.3 = 90px ✅

第 7 步：計算單元總高度
- totalUnitHeight = 300 + 90 + 40 = 430px ✅

第 8 步：反向驗證
- maxRows = floor(820 / 430) = 1
- actualRows = 3
- 結果：需要分頁 ✅
```

---

## 🔍 調試技巧

### 1. 檢查計算結果

```javascript
console.log('📊 v7.1 計算結果:', {
    finalCardHeight,
    chineseTextHeight,
    ratio: (chineseTextHeight / finalCardHeight * 100).toFixed(0) + '%',
    totalUnitHeight,
    maxRows,
    actualRows,
    needsPagination: actualRows > maxRows
});
```

### 2. 檢查文字顯示

```javascript
// 在瀏覽器控制台檢查
console.log('📝 文字信息:', {
    text: pair.chinese,
    height: chineseTextHeight,
    fontSize: (chineseTextHeight * 0.6).toFixed(1) + 'px',
    overflow: '檢查是否超出邊界'
});
```

### 3. 檢查卡片位置

```javascript
console.log('📍 卡片位置:', {
    cardX,
    cardY,
    chineseTextY,
    cardHeight: finalCardHeight,
    textHeight: chineseTextHeight,
    totalHeight: finalCardHeight + chineseTextHeight
});
```

---

## ✅ 驗收清單

修改完成後檢查：

- [ ] 中文字高度 = 卡片高度 × 0.3
- [ ] 所有文字高度統一
- [ ] 卡片不被切割
- [ ] 文字不超出邊界
- [ ] 間距自動調整
- [ ] 自動分頁（如需要）
- [ ] 所有設備正常顯示
- [ ] 瀏覽器控制台無錯誤

---

## 📋 修改清單

### 必須修改
- [ ] 第 667 行：`finalCardHeight * 0.3`

### 建議修改
- [ ] 添加 console.log 調試
- [ ] 驗證第 795 行中文文字位置
- [ ] 驗證第 805 行中文文字框高度

### 可選修改
- [ ] 添加動態調整邏輯（小卡片 40%，大卡片 30%）
- [ ] 添加用戶配置選項

---

## 🚀 快速測試

### 在瀏覽器控制台執行

```javascript
// 檢查當前的中文字高度比例
const ratio = chineseTextHeight / finalCardHeight;
console.log('當前比例:', (ratio * 100).toFixed(0) + '%');

// 應該輸出：當前比例: 30%
```

---

## 📞 常見問題

### Q1：為什麼改為 30%？
A：參考 Wordwall 設計，提高屏幕利用率，更多卡片可以顯示。

### Q2：會影響可讀性嗎？
A：中文字會變小，但仍然可讀。如果需要更大的字，可以使用動態調整。

### Q3：如何恢復到 40%？
A：將 `0.3` 改回 `0.4` 即可。

### Q4：如何測試分頁功能？
A：添加 20+ 卡片，檢查是否自動分頁。

---

## 📊 預期效果

### 修改前（v7.0 - 40%）
```
卡片高度：150px
中文字高度：60px
totalUnitHeight：233px
可顯示行數：3
```

### 修改後（v7.1 - 30%）
```
卡片高度：150px
中文字高度：45px
totalUnitHeight：218px
可顯示行數：3
改進：更緊湊，屏幕利用率更高
```

---

## 🎯 實施時間

- **修改代碼**：5 分鐘
- **添加調試**：5 分鐘
- **測試場景**：15 分鐘
- **驗證結果**：10 分鐘
- **總計**：35 分鐘

---

## 📁 相關文檔

| 文檔 | 說明 |
|------|------|
| **IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md** | 完整設計文檔（已更新 v7.1） |
| **V7_1_MODIFICATION_COMPLETE.md** | 修改完成報告 |
| **V7_1_QUICK_IMPLEMENTATION.md** | 本文檔 |

---

**版本**：v7.1
**狀態**：✅ 準備實施
**最後更新**：2025-11-02

