# v7.0 實施指南

## 📋 實施步驟

### 步驟 1：理解核心概念（5 分鐘）

**所有文字大小以卡片的大小為基礎**

```
文字高度 = 卡片高度 × 0.4
```

### 步驟 2：打開 game.js（1 分鐘）

文件位置：`public/games/match-up-game/scenes/game.js`

### 步驟 3：找到 createMixedLayout 方法（2 分鐘）

搜索：`createMixedLayout`

### 步驟 4：修改第 6 步 - 計算文字高度（5 分鐘）

**位置**：約第 667 行

**原代碼**：
```javascript
const chineseTextHeight = finalCardHeight * 0.4;
```

**新代碼**：
```javascript
// 🔥 v7.0：文字高度基於卡片大小
// 方法 1：固定比例（推薦）
const chineseTextHeight = finalCardHeight * 0.4;

// 方法 2：動態調整（可選）
// let textHeightRatio = 0.4;
// if (finalCardHeight < 80) {
//     textHeightRatio = 0.5;  // 小卡片：50%
// } else if (finalCardHeight > 150) {
//     textHeightRatio = 0.35;  // 大卡片：35%
// }
// const chineseTextHeight = finalCardHeight * textHeightRatio;

console.log('📝 文字高度計算:', {
    cardHeight: finalCardHeight.toFixed(1),
    textHeight: chineseTextHeight.toFixed(1),
    mode: '✅ 基於卡片大小'
});
```

### 步驟 5：添加第 8 步 - 反向驗證（10 分鐘）

**位置**：在計算完 `totalUnitHeight` 之後

**代碼**：
```javascript
// 🔥 v7.0：反向驗證，計算最小間距
const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
const actualRows = Math.ceil(itemCount / optimalCols);

console.log('📊 行數驗證:', {
    maxRows,
    actualRows,
    needsPagination: actualRows > maxRows ? '✅ 是' : '❌ 否'
});

if (actualRows > maxRows) {
    console.warn('⚠️ 卡片超過屏幕高度，需要調整！');
    
    const totalHeightNeeded = (finalCardHeight + chineseTextHeight) * actualRows;
    const availableSpaceForSpacing = availableHeight - totalHeightNeeded;
    const minSpacing = availableSpaceForSpacing / (actualRows + 1);
    
    console.log('🔧 最小間距計算:', {
        totalHeightNeeded: totalHeightNeeded.toFixed(1),
        minSpacing: minSpacing.toFixed(1),
        originalSpacing: verticalSpacing.toFixed(1)
    });
    
    if (minSpacing < 3) {
        console.warn('⚠️ 最小間距不足，需要分頁！');
        // TODO: 實現分頁邏輯
    }
}
```

### 步驟 6：測試（15 分鐘）

#### 測試場景 1：短文字
- 文字：「AI」
- 預期：文字高度 = 卡片高度 × 0.4

#### 測試場景 2：長文字
- 文字：「機器人學習系統」
- 預期：文字高度 = 卡片高度 × 0.4

#### 測試場景 3：混合文字
- 文字：混合長短
- 預期：所有文字高度相同

#### 測試場景 4：不同設備
- iPhone 14 直向
- iPad 橫向
- 桌面版
- 預期：所有設備都能正常顯示

#### 測試場景 5：多頁卡片
- 卡片數量：20+
- 預期：自動分頁或調整間距

### 步驟 7：驗收（5 分鐘）

檢查以下項目：

- [ ] 文字高度 = 卡片高度 × 0.4
- [ ] 所有文字高度統一
- [ ] 卡片不被切割
- [ ] 文字不超出邊界
- [ ] 間距自動調整
- [ ] 自動分頁（如需要）
- [ ] 所有設備都能正常顯示
- [ ] 控制台日誌正確

---

## 📊 預期日誌輸出

### 正常情況
```
📝 文字高度計算: {
    cardHeight: "65.0",
    textHeight: "26.0",
    mode: "✅ 基於卡片大小"
}

📏 單元總高度計算: {
    cardHeight: "65.0",
    textHeight: "26.0",
    verticalSpacing: "3.0",
    totalUnitHeight: "94.0",
    mode: "✅ 基於卡片大小"
}

📊 行數驗證: {
    maxRows: 8,
    actualRows: 4,
    needsPagination: "❌ 否"
}
```

### 需要分頁
```
⚠️ 卡片超過屏幕高度，需要調整！

🔧 最小間距計算: {
    totalHeightNeeded: "376.0",
    minSpacing: "11.7",
    originalSpacing: "3.0"
}

⚠️ 最小間距不足，需要分頁！
```

---

## 🔍 調試技巧

### 1. 查看日誌
打開瀏覽器控制台（F12），查看日誌輸出

### 2. 檢查卡片高度
```javascript
console.log('finalCardHeight:', finalCardHeight);
```

### 3. 檢查文字高度
```javascript
console.log('chineseTextHeight:', chineseTextHeight);
```

### 4. 檢查間距
```javascript
console.log('verticalSpacing:', verticalSpacing);
```

### 5. 檢查行數
```javascript
console.log('maxRows:', maxRows);
console.log('actualRows:', actualRows);
```

---

## ⏱️ 預計時間

| 步驟 | 時間 |
|------|------|
| 步驟 1-3 | 8 分鐘 |
| 步驟 4 | 5 分鐘 |
| 步驟 5 | 10 分鐘 |
| 步驟 6 | 15 分鐘 |
| 步驟 7 | 5 分鐘 |
| **總計** | **38 分鐘** |

---

## ✅ 完成檢查清單

- [ ] 理解核心概念
- [ ] 打開 game.js
- [ ] 找到 createMixedLayout 方法
- [ ] 修改第 6 步
- [ ] 添加第 8 步
- [ ] 測試所有場景
- [ ] 驗收所有項目
- [ ] 提交代碼

---

## 📞 常見問題

### Q：文字高度比例可以改嗎？
**A**：可以。改變 `finalCardHeight * 0.4` 中的 0.4 即可。

### Q：如何實現分頁？
**A**：在第 8 步的 `if (minSpacing < 3)` 中添加分頁邏輯。

### Q：如何測試？
**A**：打開瀏覽器控制台，查看日誌輸出。

### Q：出現問題怎麼辦？
**A**：查看日誌，對比 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md。

---

**版本**：v7.0
**狀態**：✅ 準備實施
**最後更新**：2025-11-02

