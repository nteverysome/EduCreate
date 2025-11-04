# 動態連貫性實現指南

## 🎯 目標

實現完整的動態連貫設計：
```
容器大小 → 間距 → 列數 → 行數 → 卡片高度 → 文字高度 → 單元總高度 → 反向驗證
```

每一層都會影響下一層，形成完整的連貫鏈。

---

## 📐 修正後的計算流程（8 步）

### 第 1 步：計算容器大小（不變）
```javascript
const availableWidth = width - sideMargin * 2;
const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;
```

### 第 2 步：計算間距（不變）
```javascript
const horizontalSpacing = Math.max(10, Math.min(30, availableWidth * 0.02));
const verticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03));
```

### 第 3 步：計算列數（不變）
```javascript
let optimalCols = ...  // 根據設備類型和卡片類型
```

### 第 4 步：計算初始行數（不變）
```javascript
const optimalRows = Math.ceil(itemCount / optimalCols);
```

### 第 5 步：計算初始卡片高度（不變）
```javascript
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
let finalCardHeight = (availableHeightPerRow - verticalSpacing) / 1.4;
```

### 第 6 步：🔥 計算實際文字高度（新增 - 智能計算）
```javascript
// 根據文字內容計算實際文字高度
function calculateSmartTextHeight(text, containerWidth, containerHeight) {
    // 初始字體大小（基於高度的 60%）
    let fontSize = Math.max(14, Math.min(48, containerHeight * 0.6));
    
    // 創建臨時文字測量
    const tempText = this.add.text(0, 0, text, {
        fontSize: `${fontSize}px`,
        fontFamily: 'Arial'
    });
    
    // 計算最大寬度和高度限制
    const maxTextWidth = containerWidth * 0.85;
    const maxTextHeight = containerHeight * 0.9;
    
    // 雙重檢查：如果超過限制則縮小字體
    while ((tempText.width > maxTextWidth || tempText.height > maxTextHeight) && fontSize > 12) {
        fontSize -= 2;
        tempText.setFontSize(fontSize);
    }
    
    const actualHeight = tempText.height;
    tempText.destroy();
    
    return actualHeight;
}

// 計算所有卡片的最大文字高度
let maxChineseTextHeight = 0;
currentPagePairs.forEach(pair => {
    const textHeight = calculateSmartTextHeight(
        pair.answer,
        finalCardWidth,
        finalCardHeight
    );
    maxChineseTextHeight = Math.max(maxChineseTextHeight, textHeight);
});

console.log('📝 最大文字高度:', maxChineseTextHeight.toFixed(1), 'px');
```

### 第 7 步：🔥 調整卡片高度（新增 - 動態調整）
```javascript
// 如果實際文字高度超過預期（40%），調整卡片高度
const expectedTextHeight = finalCardHeight * 0.4;
if (maxChineseTextHeight > expectedTextHeight) {
    // 計算需要增加的高度
    const heightIncrease = maxChineseTextHeight - expectedTextHeight;
    
    // 調整卡片高度（但不超過最大值）
    const maxCardHeight = 300;
    finalCardHeight = Math.min(maxCardHeight, finalCardHeight + heightIncrease);
    
    console.log('🔄 卡片高度已調整:', {
        before: (finalCardHeight - heightIncrease).toFixed(1),
        after: finalCardHeight.toFixed(1),
        increase: heightIncrease.toFixed(1)
    });
}
```

### 第 8 步：🔥 重新計算單元總高度和驗證（新增 - 反向驗證）
```javascript
// 使用實際文字高度計算單元總高度
const chineseTextHeight = maxChineseTextHeight;
const totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing;

console.log('📏 單元總高度:', {
    cardHeight: finalCardHeight.toFixed(1),
    textHeight: chineseTextHeight.toFixed(1),
    spacing: verticalSpacing.toFixed(1),
    total: totalUnitHeight.toFixed(1)
});

// 🔥 反向驗證：檢查是否超過可用高度
const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
const actualRows = Math.ceil(itemCount / optimalCols);

console.log('📊 行數驗證:', {
    maxRows,
    actualRows,
    itemsPerPage: maxRows * optimalCols,
    totalItems: itemCount
});

// 如果實際行數超過最大行數，需要分頁
if (actualRows > maxRows) {
    console.warn('⚠️ 需要分頁！');
    console.warn(`   最多能顯示 ${maxRows * optimalCols} 個卡片`);
    console.warn(`   但有 ${itemCount} 個卡片`);
    
    // 啟用分頁
    const itemsPerPage = maxRows * optimalCols;
    const totalPages = Math.ceil(itemCount / itemsPerPage);
    
    console.log('📄 分頁信息:', {
        itemsPerPage,
        totalPages,
        currentPage: 1
    });
}
```

---

## 🔄 完整的動態連貫流程圖

```
容器大小（availableWidth, availableHeight）
    ↓
間距（horizontalSpacing, verticalSpacing）
    ↓
列數（optimalCols）
    ↓
初始行數（optimalRows = itemCount / cols）
    ↓
初始卡片高度（finalCardHeight）
    ↓
🔥 實際文字高度（maxChineseTextHeight - 智能計算）
    ↓
🔥 調整卡片高度（如果文字超出）
    ↓
🔥 單元總高度（totalUnitHeight = cardHeight + textHeight + spacing）
    ↓
🔥 反向驗證（maxRows = availableHeight / totalUnitHeight）
    ↓
🔥 檢查是否需要分頁（actualRows > maxRows？）
```

---

## 📊 計算示例

### iPhone 14 直向（390×844px）- 5列，20個卡片

```
第 1 步：容器大小
- availableWidth = 390 - 20*2 = 350px
- availableHeight = 844 - 40 - 40 = 764px

第 2 步：間距
- horizontalSpacing = max(10, min(30, 350*0.02)) = 10px
- verticalSpacing = max(10, min(40, 764*0.03)) = 23px

第 3 步：列數
- optimalCols = 5（緊湊模式）

第 4 步：初始行數
- optimalRows = ceil(20 / 5) = 4

第 5 步：初始卡片高度
- availableHeightPerRow = (764 - 23*5) / 4 = 162.25px
- finalCardHeight = (162.25 - 23) / 1.4 = 99.46px
- 調整到最小值：finalCardHeight = 150px

第 6 步：🔥 實際文字高度（智能計算）
- 假設最長文字是 "機器人學習系統"
- 初始字體 = min(48, 150*0.6) = 48px
- 實際文字高度 = 55px（根據文字內容）

第 7 步：🔥 調整卡片高度
- 預期文字高度 = 150 * 0.4 = 60px
- 實際文字高度 = 55px
- 不需要調整（55 < 60）✅

第 8 步：🔥 單元總高度和驗證
- totalUnitHeight = 150 + 55 + 23 = 228px
- maxRows = floor((764 - 23) / 228) = 3
- actualRows = 4
- ⚠️ 需要分頁！（4 > 3）
- itemsPerPage = 3 * 5 = 15
- totalPages = ceil(20 / 15) = 2
```

---

## 🛠️ 實現步驟

### 步驟 1：添加智能文字高度計算函數
```javascript
// 在 Scene 類中添加
calculateSmartTextHeight(text, containerWidth, containerHeight) {
    // 實現上面的函數
}
```

### 步驟 2：修改第 6 步計算
```javascript
// 在第 5 步之後添加
let maxChineseTextHeight = 0;
currentPagePairs.forEach(pair => {
    const textHeight = this.calculateSmartTextHeight(
        pair.answer,
        finalCardWidth,
        finalCardHeight
    );
    maxChineseTextHeight = Math.max(maxChineseTextHeight, textHeight);
});
```

### 步驟 3：修改第 7 步調整
```javascript
// 在第 6 步之後添加
const expectedTextHeight = finalCardHeight * 0.4;
if (maxChineseTextHeight > expectedTextHeight) {
    const heightIncrease = maxChineseTextHeight - expectedTextHeight;
    finalCardHeight = Math.min(300, finalCardHeight + heightIncrease);
}
```

### 步驟 4：修改第 8 步驗證
```javascript
// 替換第 667 行
const chineseTextHeight = maxChineseTextHeight;

// 添加反向驗證
const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
const actualRows = Math.ceil(itemCount / optimalCols);

if (actualRows > maxRows) {
    // 啟用分頁
    const itemsPerPage = maxRows * optimalCols;
    // ... 分頁邏輯
}
```

---

**最後更新**：2025-11-02
**版本**：v1.0 - 動態連貫性實現指南
**狀態**：準備實施

