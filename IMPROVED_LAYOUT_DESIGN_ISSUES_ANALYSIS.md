# IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md 設計問題深度分析

## 🔍 分析方法

本分析從以下角度檢視文檔設計的合理性：
1. **邏輯一致性**：計算邏輯是否前後一致
2. **實際可行性**：設計是否能在真實場景中運作
3. **數值合理性**：配置數值是否合理
4. **邊界條件**：極端情況下的表現
5. **與現有代碼的對比**：是否符合實際實現

---

## ❌ 問題 1：第三步中 horizontalSpacing 未定義就使用

### 問題描述

在**第三步：計算最佳列數**（第 213 行和第 227 行）中，代碼使用了 `horizontalSpacing` 變量：

```javascript
// 第三步：計算最佳列數（第 213 行）
const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (150 + horizontalSpacing));
```

但 `horizontalSpacing` 是在**第四步：計算間距**（第 259 行）才定義的：

```javascript
// 第四步：計算間距（第 259 行）
const horizontalSpacing = Math.max(10, Math.min(30, availableWidth * 0.02));
```

### 影響

- **執行順序錯誤**：第三步依賴第四步的變量
- **運行時錯誤**：會導致 `ReferenceError: horizontalSpacing is not defined`
- **邏輯矛盾**：列數計算需要知道間距，但間距計算不需要知道列數

### 建議修正

**方案 1：調整步驟順序**

```javascript
// 第三步：計算間距（提前）
const horizontalSpacing = Math.max(10, Math.min(30, availableWidth * 0.02));
const verticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03));

// 第四步：計算最佳列數（延後）
const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (150 + horizontalSpacing));
```

**方案 2：使用預估間距**

```javascript
// 第三步：計算最佳列數
const estimatedSpacing = availableWidth * 0.02;  // 預估間距
const maxPossibleCols = Math.floor((availableWidth + estimatedSpacing) / (150 + estimatedSpacing));
```

---

## ❌ 問題 2：手機直向全螢幕按鈕區域配置不合理

### 問題描述

在容器配置中（第 58-65 行），手機直向的全螢幕和非全螢幕配置幾乎相同：

```javascript
'mobile-portrait': {
    topButtonArea: isFullscreen ? 40 : 40,      // ❌ 相同
    bottomButtonArea: isFullscreen ? 50 : 40,   // ✅ 不同
    sideMargin: isFullscreen ? 15 : 20,         // ✅ 不同
    cols: 5,
    mode: 'compact',
    minCardSize: isFullscreen ? 80 : 150        // ✅ 不同
}
```

### 問題分析

1. **topButtonArea 沒有變化**：全螢幕和非全螢幕都是 40px
   - 全螢幕時螢幕高度從 540px → 667px（增加 23.5%）
   - 但頂部按鈕區域沒有調整
   - 導致全螢幕時頂部按鈕區域佔比下降

2. **與其他設備不一致**：
   - 平板橫向：topButtonArea 從 50px → 60px（增加 20%）
   - 桌面版：topButtonArea 從 80px → 70px（減少 12.5%）
   - 手機直向：topButtonArea 從 40px → 40px（無變化）❌

### 建議修正

```javascript
'mobile-portrait': {
    topButtonArea: isFullscreen ? 50 : 40,      // ✅ 全螢幕時增加
    bottomButtonArea: isFullscreen ? 50 : 40,
    sideMargin: isFullscreen ? 15 : 20,
    cols: 5,
    mode: 'compact',
    minCardSize: isFullscreen ? 80 : 150
}
```

---

## ❌ 問題 3：設備檢測邏輯與實際代碼不一致

### 問題描述

文檔中的設備檢測邏輯（第 27-40 行）：

```javascript
function getDeviceType(width, height) {
    const aspectRatio = width / height;  // ❌ 計算了但未使用

    if (width < 768) {
        return height > width ? 'mobile-portrait' : 'mobile-landscape';
    } else if (width < 1024) {
        return height > width ? 'tablet-portrait' : 'tablet-landscape';
    } else {
        return 'desktop';
    }
}
```

實際代碼中的檢測邏輯（game.js 第 1677-1679 行）：

```javascript
const isLandscapeMobile = width > height && height < 500;
const isTinyHeight = height < 400;
const isCompactMode = isLandscapeMobile || isTinyHeight;
```

### 問題分析

1. **檢測標準不同**：
   - 文檔：只看寬度（< 768px）
   - 實際：看寬高比 + 高度限制（height < 500）

2. **缺少高度限制**：
   - 實際代碼有 `height < 500` 和 `height < 400` 的限制
   - 文檔中沒有這些限制

3. **邊界情況處理不同**：
   - 文檔：768×400 會被判定為平板直向
   - 實際：768×400 會被判定為緊湊模式（因為 height < 500）

### 建議修正

```javascript
function getDeviceType(width, height) {
    // 優先檢查緊湊模式（與實際代碼一致）
    const isLandscapeMobile = width > height && height < 500;
    const isTinyHeight = height < 400;
    
    if (isLandscapeMobile || isTinyHeight) {
        return 'mobile-landscape';  // 緊湊模式
    }
    
    if (width < 768) {
        return height > width ? 'mobile-portrait' : 'mobile-landscape';
    } else if (width < 1024) {
        return height > width ? 'tablet-portrait' : 'tablet-landscape';
    } else {
        return 'desktop';
    }
}
```

---

## ❌ 問題 4：列數計算邏輯過於複雜且重複

### 問題描述

在第三步（第 211-241 行）中，正方形模式和長方形模式的列數計算邏輯高度重複：

```javascript
if (hasImages) {
    // 正方形模式
    if (aspectRatio > 2.0) {
        optimalCols = Math.min(maxPossibleCols, maxColsLimit, itemCount);
    } else if (aspectRatio > 1.5) {
        optimalCols = Math.min(maxPossibleCols, maxColsLimit, itemCount);  // ❌ 與上面相同
    } else if (aspectRatio > 1.2) {
        optimalCols = Math.min(maxPossibleCols, 8, itemCount);
    } else {
        optimalCols = Math.min(maxPossibleCols, 5, itemCount);
    }
} else {
    // 長方形模式
    if (aspectRatio > 2.0) {
        optimalCols = Math.min(8, Math.ceil(Math.sqrt(itemCount * aspectRatio)));
    } else if (aspectRatio > 1.5) {
        optimalCols = Math.min(6, Math.ceil(Math.sqrt(itemCount * aspectRatio / 1.5)));
    } else if (aspectRatio > 1.2) {
        optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount)));
    } else {
        optimalCols = Math.min(3, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
    }
}
```

### 問題分析

1. **正方形模式的重複**：
   - `aspectRatio > 2.0` 和 `aspectRatio > 1.5` 的計算完全相同
   - 可以合併為 `aspectRatio > 1.5`

2. **長方形模式的複雜度**：
   - 使用了 `Math.sqrt(itemCount * aspectRatio)` 等複雜公式
   - 沒有解釋為什麼要這樣計算
   - 與正方形模式的邏輯差異太大

3. **缺少邊界檢查**：
   - 沒有檢查 `optimalCols` 是否為 0
   - 沒有檢查 `optimalCols` 是否超過 `itemCount`

### 建議修正

```javascript
// 簡化的列數計算
let maxColsLimit;

if (hasImages) {
    // 正方形模式：列數較少
    if (aspectRatio > 1.5) {
        maxColsLimit = 10;
    } else if (aspectRatio > 1.2) {
        maxColsLimit = 8;
    } else {
        maxColsLimit = 5;
    }
} else {
    // 長方形模式：列數較多
    if (aspectRatio > 1.5) {
        maxColsLimit = 8;
    } else if (aspectRatio > 1.2) {
        maxColsLimit = 6;
    } else {
        maxColsLimit = 4;
    }
}

// 統一計算
const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minCardWidth + horizontalSpacing));
optimalCols = Math.max(1, Math.min(maxPossibleCols, maxColsLimit, itemCount));
```

---

## ❌ 問題 5：minCardSize 在全螢幕手機橫向模式下過小

### 問題描述

手機橫向全螢幕的最小卡片尺寸設定為 70px（第 72 行）：

```javascript
'mobile-landscape': {
    minCardSize: isFullscreen ? 70 : 150  // ❌ 70px 太小
}
```

### 問題分析

1. **觸控友好性**：
   - iOS 建議最小觸控目標：44×44px
   - Android 建議最小觸控目標：48×48px
   - 70×70px 勉強符合標準，但考慮到卡片內還有文字和圖片，實際可點擊區域可能更小

2. **可讀性問題**：
   - 70×70px 的卡片內要顯示英文單字 + 圖片
   - 字體大小會被壓縮到很小
   - 用戶體驗不佳

3. **與其他設備不一致**：
   - 手機直向全螢幕：80px
   - 平板直向全螢幕：100px
   - 手機橫向全螢幕：70px ❌（最小）

### 建議修正

```javascript
'mobile-landscape': {
    minCardSize: isFullscreen ? 80 : 150  // ✅ 提高到 80px
}
```

---

## ⚠️ 問題 6：計算示例中的數學錯誤

### 問題描述

在計算示例（第 436 行）中：

```
第四步：計算卡片尺寸
- optimalRows = ceil(20 / 5) = 4
- availableHeightPerRow = (560 - 17 * 5) / 4 = 103.75px  // ❌ 錯誤
```

### 數學驗證

```
availableHeight = 560px
verticalSpacing = 17px
optimalRows = 4

正確計算：
- 總垂直間距 = verticalSpacing * (optimalRows + 1) = 17 * 5 = 85px
- availableHeightPerRow = (560 - 85) / 4 = 475 / 4 = 118.75px

文檔中的計算：
- availableHeightPerRow = (560 - 17 * 5) / 4 = (560 - 85) / 4 = 118.75px

實際上文檔是對的，但公式寫法容易誤解
```

### 建議修正

```
第四步：計算卡片尺寸
- optimalRows = ceil(20 / 5) = 4
- 總垂直間距 = 17 * (4 + 1) = 85px
- availableHeightPerRow = (560 - 85) / 4 = 118.75px  // ✅ 更清晰
- squareSizeByHeight = 118.75 / 1.4 = 84.8px
```

---

## ⚠️ 問題 7：全螢幕按鈕區域調整邏輯不一致

### 問題描述

不同設備在全螢幕模式下的按鈕區域調整方向不一致：

| 設備 | topButtonArea | bottomButtonArea | 邏輯 |
|------|--------------|------------------|------|
| 手機直向 | 40 → 40 | 40 → 50 | 只增加底部 |
| 手機橫向 | 30 → 25 | 30 → 30 | 只減少頂部 |
| 平板直向 | 60 → 50 | 60 → 60 | 只減少頂部 |
| 平板橫向 | 50 → 60 | 50 → 80 | 兩者都增加 |
| 桌面版 | 80 → 70 | 80 → 90 | 減少頂部，增加底部 |

### 問題分析

1. **沒有統一的調整原則**：
   - 有些設備增加按鈕區域
   - 有些設備減少按鈕區域
   - 沒有明確的設計理由

2. **與螢幕尺寸變化不匹配**：
   - 手機直向全螢幕：高度增加 23.5%，但頂部按鈕區域不變
   - 平板橫向全螢幕：高度不變，但按鈕區域增加 60%

3. **可能的設計意圖不明確**：
   - 是為了增加遊戲區域？
   - 是為了適應全螢幕UI？
   - 還是為了其他原因？

### 建議修正

**統一原則：全螢幕模式下，按鈕區域佔比保持一致**

```javascript
function getContainerConfig(deviceType, isFullscreen = false) {
    // 基礎配置
    const baseConfigs = {
        'mobile-portrait': { topRatio: 0.06, bottomRatio: 0.075, sideRatio: 0.05 },
        'mobile-landscape': { topRatio: 0.067, bottomRatio: 0.08, sideRatio: 0.04 },
        // ...
    };
    
    const base = baseConfigs[deviceType];
    const height = isFullscreen ? actualFullscreenHeight : normalHeight;
    const width = isFullscreen ? actualFullscreenWidth : normalWidth;
    
    return {
        topButtonArea: Math.round(height * base.topRatio),
        bottomButtonArea: Math.round(height * base.bottomRatio),
        sideMargin: Math.round(width * base.sideRatio),
        // ...
    };
}
```

---

## 📊 問題嚴重程度總結

| 問題 | 嚴重程度 | 影響 | 優先級 |
|------|---------|------|--------|
| **問題 1：horizontalSpacing 未定義** | 🔴 嚴重 | 運行時錯誤 | P0 |
| **問題 2：手機直向按鈕區域** | 🟡 中等 | 用戶體驗 | P2 |
| **問題 3：設備檢測不一致** | 🔴 嚴重 | 邏輯錯誤 | P0 |
| **問題 4：列數計算複雜** | 🟡 中等 | 可維護性 | P2 |
| **問題 5：minCardSize 過小** | 🟠 較高 | 用戶體驗 | P1 |
| **問題 6：計算示例錯誤** | 🟢 輕微 | 文檔準確性 | P3 |
| **問題 7：按鈕區域不一致** | 🟡 中等 | 設計一致性 | P2 |

---

## ⚠️ 問題 8：中文文字高度計算缺失

### 問題描述

在第五步的正方形模式計算中（第 284 行）：

```javascript
let squareSizeByHeight = availableHeightPerRow / 1.4;  // 考慮中文文字高度（40%）
```

但在實際代碼中，中文文字高度是動態計算的，不是固定的 40%。

### 實際代碼中的計算

```javascript
// game.js 中的實際計算
chineseTextHeight = squareSize * 0.4;  // 中文文字高度是卡片尺寸的 40%
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

### 問題分析

1. **循環依賴**：
   - 文檔：`squareSize` 依賴 `availableHeightPerRow`
   - 實際：`totalUnitHeight` 依賴 `squareSize`
   - 實際：`availableHeightPerRow` 依賴 `totalUnitHeight`

2. **計算順序錯誤**：
   - 文檔先計算 `squareSize`，再用它計算 `chineseTextHeight`
   - 但 `squareSize` 的計算需要知道 `chineseTextHeight`

3. **公式不準確**：
   - `squareSizeByHeight = availableHeightPerRow / 1.4` 假設中文文字佔 40%
   - 但實際上 `totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing`
   - 正確公式應該是：`cardHeight = (availableHeightPerRow - verticalSpacing) / 1.4`

### 建議修正

```javascript
// 正確的計算順序
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;

// 單元總高度 = 卡片高度 + 中文文字高度 + 垂直間距
// 其中：中文文字高度 = 卡片高度 * 0.4
// 所以：availableHeightPerRow = cardHeight + cardHeight * 0.4 + verticalSpacing
//      availableHeightPerRow = cardHeight * 1.4 + verticalSpacing
//      cardHeight = (availableHeightPerRow - verticalSpacing) / 1.4

let squareSizeByHeight = (availableHeightPerRow - verticalSpacing) / 1.4;
```

---

## ⚠️ 問題 9：長方形模式的高度計算不合理

### 問題描述

在第五步的長方形模式計算中（第 318 行）：

```javascript
finalCardHeight = availableHeightPerRow * 0.6;  // 單元總高度的 60%
```

### 問題分析

1. **與正方形模式不一致**：
   - 正方形模式：考慮中文文字高度（40%）和垂直間距
   - 長方形模式：只考慮 60% 的比例，沒有考慮垂直間距

2. **計算邏輯不同**：
   - 正方形模式：`totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing`
   - 長方形模式：`totalUnitHeight = cardHeight + chineseTextHeight`（缺少 verticalSpacing）

3. **實際代碼中的計算**：
   ```javascript
   // game.js 第 2048 行
   totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
   ```
   實際代碼中兩種模式都包含 `verticalSpacing`

### 建議修正

```javascript
// 長方形模式的正確計算
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;

// 單元總高度 = 卡片高度 + 中文文字高度 + 垂直間距
// 假設中文文字高度 = 卡片高度 * 0.4（與正方形模式一致）
// availableHeightPerRow = cardHeight + cardHeight * 0.4 + verticalSpacing
// cardHeight = (availableHeightPerRow - verticalSpacing) / 1.4

finalCardHeight = (availableHeightPerRow - verticalSpacing) / 1.4;
```

---

## ⚠️ 問題 10：設備類型表格中的高度範圍錯誤

### 問題描述

在設備類型表格中（第 45-51 行）：

| 設備類型 | 寬度範圍 | 高度範圍 | 佈局模式 |
|---------|---------|---------|---------|
| **手機直向** | < 768px | > 768px | 緊湊模式 |
| **手機橫向** | > 768px | < 500px | 緊湊模式 |

### 問題分析

1. **手機直向的高度範圍錯誤**：
   - 表格說：高度 > 768px
   - 但檢測邏輯是：`height > width`（沒有 768px 的限制）
   - 實際上手機直向的高度範圍應該是：> width（通常 375-428px）

2. **手機橫向的寬度範圍錯誤**：
   - 表格說：寬度 > 768px
   - 但檢測邏輯是：`width < 768`（手機設備）
   - 實際上手機橫向的寬度範圍應該是：< 768px

3. **邏輯矛盾**：
   - 手機橫向：寬度 > 768px，但檢測邏輯是 `width < 768`
   - 這兩個條件互相矛盾

### 建議修正

| 設備類型 | 寬度範圍 | 高度範圍 | 佈局模式 | 特點 |
|---------|---------|---------|---------|------|
| **手機直向** | < 768px | > width | 緊湊模式 | 固定 5 列，扁平卡片 |
| **手機橫向** | < 768px | < 500px | 緊湊模式 | 固定 5 列，極度緊湊 |
| **平板直向** | 768-1024px | > width | 桌面模式 | 動態列數，充分利用空間 |
| **平板橫向** | 768-1024px | < width | 桌面模式 | 寬螢幕優化，完整功能 |
| **桌面版** | > 1024px | 任意 | 桌面模式 | 完整功能，詳細資訊 |

---

## ⚠️ 問題 11：缺少中文文字區域的位置計算

### 問題描述

在第六步（第 352-380 行）中，只計算了卡片的位置，沒有計算中文文字區域的位置。

### 實際代碼中的計算

```javascript
// game.js 中需要計算中文文字的位置
const chineseTextY = cardY + cardHeightInFrame / 2 + chineseTextHeight / 2;
```

### 問題分析

1. **文檔不完整**：
   - 只計算了英文卡片的位置
   - 沒有計算中文文字框的位置
   - 這是混合模式佈局的核心部分

2. **缺少關鍵信息**：
   - 中文文字框的 Y 座標如何計算
   - 中文文字框的尺寸如何確定
   - 中文文字框與英文卡片的間距

### 建議補充

```javascript
// 第六步：計算卡片和中文文字位置
currentPagePairs.forEach((pair, index) => {
    const col = index % optimalCols;
    const row = Math.floor(index / optimalCols);

    // 計算英文卡片中心位置
    const cardX = gridStartX + horizontalSpacing + col * (finalCardWidth + horizontalSpacing) + finalCardWidth / 2;
    const cardY = gridStartY + verticalSpacing + row * (totalUnitHeight) + finalCardHeight / 2;

    // 計算中文文字框位置
    const chineseTextHeight = finalCardHeight * 0.4;
    const chineseTextY = cardY + finalCardHeight / 2 + chineseTextHeight / 2;

    // 創建英文卡片
    const card = this.createCard(cardX, cardY, finalCardWidth, finalCardHeight, pair);

    // 創建中文文字框
    const chineseText = this.createChineseText(cardX, chineseTextY, finalCardWidth, chineseTextHeight, pair);
});
```

---

## ⚠️ 問題 12：全螢幕檢測函數的上下文問題

### 問題描述

在全螢幕狀態檢測部分（第 117-128 行）：

```javascript
document.addEventListener('fullscreenchange', () => {
    console.log('🔄 全螢幕狀態已改變，重新計算佈局');
    // 觸發佈局重新計算
    this.calculateLayout();  // ❌ this 指向問題
});
```

### 問題分析

1. **this 指向錯誤**：
   - 箭頭函數中的 `this` 指向外層作用域
   - 但在文檔的上下文中，`this` 可能不是 Phaser 場景實例

2. **事件監聽器重複註冊**：
   - 每次調用這段代碼都會添加新的事件監聽器
   - 沒有移除舊的監聽器
   - 可能導致記憶體洩漏

3. **缺少錯誤處理**：
   - 如果 `calculateLayout()` 不存在會報錯
   - 沒有檢查方法是否可用

### 建議修正

```javascript
// 在 Phaser 場景的 create() 方法中
create() {
    // 綁定 this 上下文
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);

    // 添加事件監聽器
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('orientationchange', this.handleOrientationChange);
}

handleFullscreenChange() {
    console.log('🔄 全螢幕狀態已改變，重新計算佈局');
    if (typeof this.calculateLayout === 'function') {
        this.calculateLayout();
    }
}

handleOrientationChange() {
    console.log('🔄 設備方向已改變，重新計算佈局');
    setTimeout(() => {
        if (typeof this.calculateLayout === 'function') {
            this.calculateLayout();
        }
    }, 100);
}

// 在 shutdown() 或 destroy() 方法中移除監聽器
shutdown() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
}
```

---

## 📊 更新後的問題嚴重程度總結

| 問題 | 嚴重程度 | 影響 | 優先級 |
|------|---------|------|--------|
| **問題 1：horizontalSpacing 未定義** | 🔴 嚴重 | 運行時錯誤 | P0 |
| **問題 2：手機直向按鈕區域** | 🟡 中等 | 用戶體驗 | P2 |
| **問題 3：設備檢測不一致** | 🔴 嚴重 | 邏輯錯誤 | P0 |
| **問題 4：列數計算複雜** | 🟡 中等 | 可維護性 | P2 |
| **問題 5：minCardSize 過小** | 🟠 較高 | 用戶體驗 | P1 |
| **問題 6：計算示例錯誤** | 🟢 輕微 | 文檔準確性 | P3 |
| **問題 7：按鈕區域不一致** | 🟡 中等 | 設計一致性 | P2 |
| **問題 8：中文文字高度計算** | 🔴 嚴重 | 計算錯誤 | P0 |
| **問題 9：長方形高度計算** | 🟠 較高 | 計算不準確 | P1 |
| **問題 10：設備類型表格錯誤** | 🟡 中等 | 文檔準確性 | P2 |
| **問題 11：缺少中文文字位置** | 🟠 較高 | 功能不完整 | P1 |
| **問題 12：this 指向問題** | 🟠 較高 | 運行時錯誤 | P1 |

---

## 🎯 優先修復建議

### P0 級別（立即修復）

1. **問題 1**：調整步驟順序，先計算間距再計算列數
2. **問題 3**：統一設備檢測邏輯，與實際代碼保持一致
3. **問題 8**：修正中文文字高度計算公式

### P1 級別（高優先級）

4. **問題 5**：提高手機橫向全螢幕的最小卡片尺寸到 80px
5. **問題 9**：統一長方形模式的高度計算邏輯
6. **問題 11**：補充中文文字區域的位置計算
7. **問題 12**：修正事件監聽器的 this 指向和記憶體洩漏問題

### P2 級別（中優先級）

8. **問題 2**：調整手機直向全螢幕的頂部按鈕區域
9. **問題 4**：簡化列數計算邏輯
10. **問題 7**：統一全螢幕按鈕區域調整原則
11. **問題 10**：修正設備類型表格中的範圍描述

### P3 級別（低優先級）

12. **問題 6**：改進計算示例的公式表達方式

---

**分析完成日期**：2025-11-01
**分析版本**：v1.0 - 針對 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md v3.0
**發現問題總數**：12 個
**嚴重問題**：3 個（P0）
**較高問題**：4 個（P1）
**中等問題**：4 個（P2）
**輕微問題**：1 個（P3）

