# v7.0 快速參考卡

## 🎯 核心原則

**所有文字大小以卡片的大小為基礎**

```
文字高度 = 卡片高度 × 0.4
```

---

## 📐 核心公式

### 文字高度
```javascript
const chineseTextHeight = finalCardHeight * 0.4;
```

### 單元總高度
```javascript
const totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing;
```

### 最小間距
```javascript
const minSpacing = (availableHeight - totalHeightNeeded) / (actualRows + 1);
```

---

## 🔄 計算流程

```
第 1-5 步：基礎計算
    ↓
第 6 步：計算文字高度 = 卡片高度 × 0.4
    ↓
第 7 步：計算單元總高度 = 卡片 + 文字 + 間距
    ↓
第 8 步：反向驗證，計算最小間距
    ↓
第 9 步：計算卡片和文字位置
```

---

## 📝 代碼片段

### 第 6 步：計算文字高度
```javascript
const chineseTextHeight = finalCardHeight * 0.4;

console.log('📝 文字高度計算:', {
    cardHeight: finalCardHeight.toFixed(1),
    textHeight: chineseTextHeight.toFixed(1),
    mode: '✅ 基於卡片大小'
});
```

### 第 7 步：計算單元總高度
```javascript
const totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing;

console.log('📏 單元總高度計算:', {
    cardHeight: finalCardHeight.toFixed(1),
    textHeight: chineseTextHeight.toFixed(1),
    verticalSpacing: verticalSpacing.toFixed(1),
    totalUnitHeight: totalUnitHeight.toFixed(1),
    mode: '✅ 基於卡片大小'
});
```

### 第 8 步：反向驗證
```javascript
const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
const actualRows = Math.ceil(itemCount / optimalCols);

if (actualRows > maxRows) {
    const totalHeightNeeded = (finalCardHeight + chineseTextHeight) * actualRows;
    const availableSpaceForSpacing = availableHeight - totalHeightNeeded;
    const minSpacing = availableSpaceForSpacing / (actualRows + 1);
    
    if (minSpacing < 3) {
        // 需要分頁
    }
}
```

---

## 📊 計算示例

### iPhone 14 直向（390×844px）

| 項目 | 計算 | 結果 |
|------|------|------|
| **卡片高度** | - | 65px |
| **文字高度** | 65 × 0.4 | 26px |
| **垂直間距** | - | 3px |
| **totalUnitHeight** | 65 + 26 + 3 | 94px |
| **maxRows** | (844 - 3) / 94 | 8 |
| **actualRows** | ceil(20 / 5) | 4 |
| **結果** | 4 < 8 | ✅ 完整顯示 |

---

## 📁 文件位置

| 文件 | 說明 |
|------|------|
| **IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md** | 完整設計文檔 |
| **V7_FINAL_SUMMARY.md** | 修正總結 |
| **IMPLEMENTATION_GUIDE_V7.md** | 實施指南 |
| **QUICK_REFERENCE_V7.md** | 本文檔 |

---

## 🚀 快速實施

### 1. 打開 game.js
```
public/games/match-up-game/scenes/game.js
```

### 2. 找到 createMixedLayout 方法
```
搜索：createMixedLayout
```

### 3. 修改第 6 步（約第 667 行）
```javascript
const chineseTextHeight = finalCardHeight * 0.4;
```

### 4. 添加第 8 步（在 totalUnitHeight 之後）
```javascript
const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
const actualRows = Math.ceil(itemCount / optimalCols);

if (actualRows > maxRows) {
    // 計算最小間距或分頁
}
```

### 5. 測試
打開瀏覽器控制台，查看日誌輸出

---

## ✅ 驗收標準

- [ ] 文字高度 = 卡片高度 × 0.4
- [ ] 所有文字高度統一
- [ ] 卡片不被切割
- [ ] 文字不超出邊界
- [ ] 間距自動調整
- [ ] 所有設備都能正常顯示

---

## 📞 快速查詢

### 文字高度太小？
→ 增加比例（例如 0.5 代替 0.4）

### 文字高度太大？
→ 減少比例（例如 0.3 代替 0.4）

### 卡片被切割？
→ 檢查 maxRows 和 actualRows

### 文字超出邊界？
→ 檢查 chineseTextHeight 計算

### 間距太小？
→ 檢查 minSpacing 計算

---

## 🔍 調試命令

```javascript
// 查看卡片高度
console.log('finalCardHeight:', finalCardHeight);

// 查看文字高度
console.log('chineseTextHeight:', chineseTextHeight);

// 查看單元總高度
console.log('totalUnitHeight:', totalUnitHeight);

// 查看行數
console.log('maxRows:', maxRows, 'actualRows:', actualRows);

// 查看最小間距
console.log('minSpacing:', minSpacing);
```

---

## 📋 實施檢查清單

- [ ] 理解核心概念
- [ ] 打開 game.js
- [ ] 找到 createMixedLayout 方法
- [ ] 修改第 6 步
- [ ] 添加第 8 步
- [ ] 測試短文字
- [ ] 測試長文字
- [ ] 測試混合文字
- [ ] 測試不同設備
- [ ] 測試多頁卡片
- [ ] 驗收所有項目
- [ ] 提交代碼

---

**版本**：v7.0
**狀態**：✅ 快速參考
**最後更新**：2025-11-02

