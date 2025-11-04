# 快速開始指南

## 🎯 一句話總結

**已在 `IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md` 中添加 v7.0 優化，實現文字以最大的為基準，間距以最小距離為標準。**

---

## 📖 閱讀順序

### 1️⃣ 先讀這個（5 分鐘）
📄 **MODIFICATION_COMPLETE_REPORT.md**
- 了解修改了什麼
- 了解為什麼要修改
- 了解預期效果

### 2️⃣ 再讀這個（10 分鐘）
📄 **V7_OPTIMIZATION_SUMMARY.md**
- 了解修改位置
- 了解核心改進
- 了解計算示例

### 3️⃣ 然後讀這個（20 分鐘）
📄 **IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md**
- 第 663-815 行：新增的第 6-9 步
- 第 819-904 行：新增的 `calculateSmartTextHeight()` 函數
- 第 933-1021 行：計算示例對比

### 4️⃣ 最後讀這個（10 分鐘）
📄 **IMPLEMENTATION_CHECKLIST.md**
- 了解實施步驟
- 了解測試場景
- 了解驗收標準

---

## 🔧 實施步驟（簡版）

### 步驟 1：實現函數
在 `public/games/match-up-game/scenes/game.js` 中添加：

```javascript
calculateSmartTextHeight(text, containerWidth, containerHeight) {
    // 參考 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 819-904 行
}
```

### 步驟 2：修改第 6 步
在 `createMixedLayout()` 方法中，替換：

```javascript
// 舊代碼
const chineseTextHeight = finalCardHeight * 0.4;

// 新代碼
let maxChineseTextHeight = 0;
currentPagePairs.forEach(pair => {
    const textHeight = this.calculateSmartTextHeight(
        pair.answer,
        finalCardWidth,
        finalCardHeight * 0.6
    );
    maxChineseTextHeight = Math.max(maxChineseTextHeight, textHeight);
});
```

### 步驟 3：修改第 7 步
```javascript
const chineseTextHeight = maxChineseTextHeight;
const totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing;
```

### 步驟 4：添加第 8 步
```javascript
const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
const actualRows = Math.ceil(itemCount / optimalCols);

if (actualRows > maxRows) {
    // 計算最小間距或分頁
}
```

### 步驟 5：測試
- 測試短文字、長文字、混合文字
- 測試不同設備類型
- 測試不同卡片數量

---

## 📊 預期效果

### 修正前 ❌
```
卡片可能被切割
文字可能超出邊界
無法自動分頁
視覺效果不統一
```

### 修正後 ✅
```
卡片永遠不會被切割
文字永遠不會超出邊界
自動分頁
視覺效果統一
```

---

## 📐 計算示例

### iPhone 14 直向（390×844px）- 20 個卡片

| 項目 | 修正前 | 修正後 |
|------|--------|--------|
| **文字高度** | 60px（固定） | 55px（最大） |
| **totalUnitHeight** | 233px | 228px |
| **maxRows** | 3 | 3 |
| **actualRows** | 4 | 4 |
| **驗證機制** | 無 | 有 |
| **分頁** | 無 | 自動 |
| **結果** | ❌ 超出屏幕 | ✅ 完整顯示 |

---

## 💡 核心概念

### 文字以最大的為基準
```
所有卡片的文字高度 = max(所有文字高度)
✅ 視覺效果統一
✅ 所有文字都能完整顯示
```

### 間距以最小距離為標準
```
間距 = (可用空間 - 卡片高度 - 文字高度) / (行數 + 1)
✅ 充分利用空間
✅ 自動調整
```

---

## 🚀 快速提交

```bash
# 1. 備份
git add .
git commit -m "backup: before v7.0"

# 2. 創建分支
git checkout -b feature/v7-optimization

# 3. 實施修改
# ... 修改 game.js ...

# 4. 提交
git add public/games/match-up-game/scenes/game.js
git commit -m "feat: implement v7.0 text spacing optimization"

# 5. 推送
git push origin feature/v7-optimization
```

---

## ✅ 驗收清單

- [ ] 實現 `calculateSmartTextHeight()` 函數
- [ ] 修改第 6 步 - 計算最大文字高度
- [ ] 修改第 7 步 - 使用最大文字高度
- [ ] 添加第 8 步 - 反向驗證
- [ ] 測試短文字
- [ ] 測試長文字
- [ ] 測試混合文字
- [ ] 測試不同設備
- [ ] 測試不同卡片數量
- [ ] 所有驗收標準通過

---

## 📞 常見問題

### Q：修改在哪裡？
**A**：IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 663-815 行

### Q：需要修改多少代碼？
**A**：約 50-100 行代碼

### Q：需要多長時間？
**A**：核心實施 2-3 小時，完整測試 3-4 小時

### Q：如何測試？
**A**：在瀏覽器控制台查看日誌輸出

### Q：出現問題怎麼辦？
**A**：查看日誌，對比 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md

---

## 📁 文檔導航

| 文檔 | 用途 | 時間 |
|------|------|------|
| **MODIFICATION_COMPLETE_REPORT.md** | 了解修改內容 | 5 分鐘 |
| **V7_OPTIMIZATION_SUMMARY.md** | 了解修改位置 | 10 分鐘 |
| **IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md** | 詳細設計文檔 | 20 分鐘 |
| **IMPLEMENTATION_CHECKLIST.md** | 實施檢查清單 | 10 分鐘 |
| **QUICK_START.md** | 本文檔 | 5 分鐘 |

---

## 🎯 下一步

1. **立即**：閱讀 MODIFICATION_COMPLETE_REPORT.md（5 分鐘）
2. **然後**：閱讀 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 第 663-815 行（20 分鐘）
3. **接著**：在 game.js 中實現修改（2-3 小時）
4. **最後**：測試所有場景（3-4 小時）

---

**最後更新**：2025-11-02
**版本**：v1.0 - 快速開始指南
**狀態**：✅ 準備開始

