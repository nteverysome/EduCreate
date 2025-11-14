# 🚀 快速參考卡片 - Match-up 自適應設計

## 📌 核心概念 (30 秒理解)

```
單元 = 1 對卡片 (英文 + 中文)
自適應 = 根據卡片數自動調整大小

3 對 → 大卡片 (65px)
10 對 → 小卡片 (28px)
20 對 → 最小卡片 (14px)
```

---

## 🎯 關鍵公式 (1 分鐘掌握)

### 卡片高度
```javascript
cardHeight = (容器高度 - 邊距 - 間距) / 卡片數
```

### 邊距調整
```javascript
if (卡片數 ≤ 5) {
  邊距 = 基礎邊距 (30px)
} else {
  邊距 = max(10px, 基礎邊距 - (卡片數-5)×2)
}
```

### 間距調整
```javascript
if (卡片數 ≤ 5) {
  間距 = 基礎間距 (5px)
} else {
  間距 = max(2px, 基礎間距 - (卡片數-5)×0.5)
}
```

---

## 📊 參數速查表

### mobile-portrait (375×667)

| 卡片數 | 高度 | 寬度 | 邊距 | 間距 |
|--------|------|------|------|------|
| 3 | 65px | 130px | 20px | 3px |
| 5 | 48px | 96px | 20px | 3px |
| 10 | 28px | 56px | 20px | 2px |
| 20 | 14px | 28px | 10px | 2px |

### desktop (1920×1080)

| 卡片數 | 高度 | 寬度 | 邊距 | 間距 |
|--------|------|------|------|------|
| 3 | 95px | 228px | 45px | 10px |
| 5 | 68px | 163px | 45px | 10px |
| 10 | 40px | 96px | 45px | 6px |
| 20 | 20px | 48px | 25px | 2px |

---

## 🛠️ 代碼片段

### 計算卡片高度
```javascript
calculateCardHeight(containerHeight, itemCount, baseMargin, baseSpacing) {
    const topMargin = this.calculateDynamicMargin(baseMargin, itemCount);
    const bottomMargin = this.calculateDynamicMargin(baseMargin, itemCount);
    const verticalSpacing = this.calculateDynamicSpacing(baseSpacing, itemCount);
    
    const availableHeight = containerHeight - topMargin - bottomMargin;
    const totalSpacingHeight = (itemCount - 1) * verticalSpacing;
    const cardHeight = (availableHeight - totalSpacingHeight) / itemCount;
    
    return cardHeight;
}
```

### 計算動態邊距
```javascript
calculateDynamicMargin(baseMargin, itemCount, minMargin = 10) {
    if (itemCount <= 5) return baseMargin;
    const reduction = (itemCount - 5) * 2;
    return Math.max(minMargin, baseMargin - reduction);
}
```

### 計算動態間距
```javascript
calculateDynamicSpacing(baseSpacing, itemCount, minSpacing = 2) {
    if (itemCount <= 5) return baseSpacing;
    const reduction = (itemCount - 5) * 0.5;
    return Math.max(minSpacing, baseSpacing - reduction);
}
```

---

## 📝 修改清單

### 文件 1: SeparatedLayoutCalculator
- [ ] 修改 `calculateCardSize()` 方法
- [ ] 添加 `calculateDynamicMargin()` 方法
- [ ] 添加 `calculateDynamicSpacing()` 方法

### 文件 2: game.js
- [ ] 修改 `createLeftRightSingleColumn()` 方法
- [ ] 傳遞 itemCount 到計算器
- [ ] 使用動態計算的卡片大小

### 文件 3: test-runner.html
- [ ] 添加 3, 4, 5, 10, 15, 20 對卡片的測試用例

---

## ✅ 驗證清單

- [ ] 卡片不超出容器邊界
- [ ] 卡片大小在 [min, max] 範圍內
- [ ] 所有卡片都能顯示
- [ ] 文字能正確顯示
- [ ] 圖片能正確顯示
- [ ] 在不同設備上都能正常工作
- [ ] 所有 35 個現有測試仍然通過
- [ ] 新的自適應測試全部通過

---

## 🎯 預期結果

### 空間利用率
```
3 對:  ████████ 60%
5 對:  ██████████ 75%
10 對: ████████████ 85%
15 對: ██████████████ 90%
20 對: ████████████████ 92%
```

### 性能指標
- 計算時間: < 30ms ✅
- 內存使用: 正常 ✅
- 測試通過率: 100% ✅

---

## 📚 相關文檔

| 文檔 | 用途 |
|------|------|
| ADAPTIVE_CARD_SIZE_DESIGN.md | 詳細設計方案 |
| ADAPTIVE_IMPLEMENTATION_CODE.md | 完整代碼實現 |
| UNIT_STRUCTURE_AND_ADAPTIVE_SUMMARY.md | 完整指南 |
| FINAL_SUMMARY_REPORT.md | 最終報告 |

---

## 🚀 快速開始

1. **理解設計** (5 分鐘)
   - 閱讀本文檔
   - 查看 Mermaid 圖表

2. **實現代碼** (2-3 小時)
   - 修改 SeparatedLayoutCalculator
   - 修改 game.js
   - 添加測試用例

3. **測試驗證** (1-2 小時)
   - 運行所有測試
   - 視覺驗證
   - 性能檢查

4. **完成** ✅
   - 所有測試通過
   - 用戶體驗改進
   - 代碼質量提升

---

## 💡 提示

- 邊距和間距的減少因子可以根據需要調整
- 最小卡片大小應該保持在 14px 以上以保持可讀性
- 在不同設備上測試以確保一致性
- 保持所有 35 個現有測試通過

---

**最後更新**: 2025-11-10
**版本**: 1.0
**狀態**: 準備實現

