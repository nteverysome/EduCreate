# 改進的混合模式佈局計算方案

## 🎯 核心改進思路

**目標**：模仿 Screenshot_175 的均勻網格佈局，使 Screenshot_174 的卡片排列更加整齊和響應式。

### 當前問題
- 卡片尺寸計算複雜，有多個分支邏輯
- 間距計算不夠統一
- 不同解析度下的適配邏輯分散

### 改進方向
- 統一使用 **網格佈局計算**
- 先計算 **可用空間**，再計算 **卡片尺寸**
- 使用 **百分比 + 最小值** 的組合方式

---

## 📐 改進的計算方案

### 第零步：檢測卡片類型（有圖片 vs 無圖片）

```javascript
// 根據內容自動選擇模式
const hasImages = currentPagePairs.some(pair => pair.imageUrl);

if (hasImages) {
    // 🟦 正方形模式（有圖片）
    // 卡片是正方形（1:1 比例），適合展示圖片
    // 最小尺寸：150×150px
    // 最大列數：10 列
    console.log('🟦 使用正方形模式（有圖片）');
} else {
    // 🟨 長方形模式（無圖片）
    // 卡片是長方形（寬 > 高），充分利用寬度
    // 最小尺寸：200×100px
    // 最大列數：8 列
    console.log('🟨 使用長方形模式（無圖片）');
}
```

### 第一步：計算可用空間

```javascript
// 定義邊距和按鈕區域
const topButtonAreaHeight = Math.max(50, Math.min(80, height * 0.08));
const bottomButtonAreaHeight = Math.max(50, Math.min(80, height * 0.10));
const sideMargin = Math.max(30, Math.min(80, width * 0.03));

// 計算可用空間
const availableWidth = width - sideMargin * 2;
const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;

console.log('📐 可用空間:', {
    availableWidth: availableWidth.toFixed(0),
    availableHeight: availableHeight.toFixed(0),
    aspectRatio: (availableWidth / availableHeight).toFixed(2)
});
```

### 第二步：計算最佳列數

```javascript
// 根據匹配數、寬高比和卡片類型計算最佳列數
const itemCount = currentPagePairs.length;
const aspectRatio = width / height;

let optimalCols;

if (hasImages) {
    // 🟦 正方形模式（有圖片）- 列數較少
    // 策略：優先使用最大可能列數，但不超過 10 列
    const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (150 + horizontalSpacing));
    const maxColsLimit = 10;  // 最多 10 列

    if (aspectRatio > 2.0) {
        optimalCols = Math.min(maxPossibleCols, maxColsLimit, itemCount);
    } else if (aspectRatio > 1.5) {
        optimalCols = Math.min(maxPossibleCols, maxColsLimit, itemCount);
    } else if (aspectRatio > 1.2) {
        optimalCols = Math.min(maxPossibleCols, 8, itemCount);
    } else {
        optimalCols = Math.min(maxPossibleCols, 5, itemCount);
    }
} else {
    // 🟨 長方形模式（無圖片）- 列數較多
    // 策略：基於匹配數的平方根，更靈活
    const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (200 + horizontalSpacing));

    if (aspectRatio > 2.0) {
        optimalCols = Math.min(8, Math.ceil(Math.sqrt(itemCount * aspectRatio)));
    } else if (aspectRatio > 1.5) {
        optimalCols = Math.min(6, Math.ceil(Math.sqrt(itemCount * aspectRatio / 1.5)));
    } else if (aspectRatio > 1.2) {
        optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount)));
    } else {
        optimalCols = Math.min(3, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
    }

    optimalCols = Math.max(1, Math.min(optimalCols, maxPossibleCols, itemCount));
}

const optimalRows = Math.ceil(itemCount / optimalCols);

console.log('📊 網格佈局:', {
    itemCount,
    mode: hasImages ? '正方形（有圖片）' : '長方形（無圖片）',
    optimalCols,
    optimalRows,
    aspectRatio: aspectRatio.toFixed(2)
});
```

### 第三步：計算間距

```javascript
// 水平間距：基於寬度的百分比
const horizontalSpacing = Math.max(10, Math.min(30, availableWidth * 0.02));

// 垂直間距：基於高度的百分比
const verticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03));

console.log('📏 間距:', {
    horizontalSpacing: horizontalSpacing.toFixed(1),
    verticalSpacing: verticalSpacing.toFixed(1)
});
```

### 第四步：計算卡片尺寸

```javascript
let finalCardWidth, finalCardHeight, cardRatio;

if (hasImages) {
    // 🟦 正方形模式（有圖片）
    // 卡片是正方形（1:1 比例）

    // 方法1：基於高度（考慮中文文字）
    const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
    let squareSizeByHeight = availableHeightPerRow / 1.4;  // 考慮中文文字高度（40%）

    // 方法2：基於寬度
    const squareSizeByWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

    // 取較小值
    let squareSize = Math.min(squareSizeByHeight, squareSizeByWidth);

    // 確保卡片尺寸在合理範圍內
    const minSquareSize = 150;
    const maxSquareSize = 300;
    squareSize = Math.max(minSquareSize, Math.min(maxSquareSize, squareSize));

    finalCardWidth = squareSize;
    finalCardHeight = squareSize;
    cardRatio = '1:1（正方形）';

} else {
    // 🟨 長方形模式（無圖片）
    // 卡片是長方形（寬 > 高），充分利用寬度

    // 卡片寬度：充分利用可用寬度
    finalCardWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

    // 卡片高度：單元總高度的 60%
    const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
    finalCardHeight = availableHeightPerRow * 0.6;

    // 確保卡片尺寸在合理範圍內
    const minCardWidth = 200;
    const minCardHeight = 100;
    const maxCardSize = 300;

    finalCardWidth = Math.max(minCardWidth, Math.min(maxCardSize, finalCardWidth));
    finalCardHeight = Math.max(minCardHeight, Math.min(maxCardSize, finalCardHeight));

    cardRatio = (finalCardWidth / finalCardHeight).toFixed(2) + ':1（長方形）';
}

console.log('📦 卡片尺寸:', {
    mode: hasImages ? '正方形（有圖片）' : '長方形（無圖片）',
    cardWidth: finalCardWidth.toFixed(1),
    cardHeight: finalCardHeight.toFixed(1),
    ratio: cardRatio
});
```

### 第五步：計算卡片位置

```javascript
// 計算網格起始位置（居中）
const totalGridWidth = optimalCols * finalCardWidth + horizontalSpacing * (optimalCols + 1);
const totalGridHeight = optimalRows * finalCardHeight + verticalSpacing * (optimalRows + 1);

const gridStartX = (availableWidth - totalGridWidth) / 2 + sideMargin;
const gridStartY = (availableHeight - totalGridHeight) / 2 + topButtonAreaHeight;

// 創建卡片
currentPagePairs.forEach((pair, index) => {
    const col = index % optimalCols;
    const row = Math.floor(index / optimalCols);
    
    // 計算卡片中心位置
    const cardX = gridStartX + horizontalSpacing + col * (finalCardWidth + horizontalSpacing) + finalCardWidth / 2;
    const cardY = gridStartY + verticalSpacing + row * (finalCardHeight + verticalSpacing) + finalCardHeight / 2;
    
    // 創建卡片
    const card = this.createCard(cardX, cardY, finalCardWidth, finalCardHeight, pair);
});

console.log('📍 網格位置:', {
    gridStartX: gridStartX.toFixed(0),
    gridStartY: gridStartY.toFixed(0),
    totalGridWidth: totalGridWidth.toFixed(0),
    totalGridHeight: totalGridHeight.toFixed(0)
});
```

---

## 🔍 改進方案的優勢

### 1. 統一的計算邏輯
```
✅ 所有解析度使用相同的計算流程
✅ 減少條件分支，代碼更清晰
✅ 易於維護和擴展
```

### 2. 更好的響應式適配
```
✅ 自動根據寬高比調整列數
✅ 卡片尺寸自動適應屏幕
✅ 間距自動調整
```

### 3. 更均勻的佈局
```
✅ 卡片均勻分佈在網格中
✅ 間距一致
✅ 視覺效果更整齊
```

---

## 📊 計算示例對比

### 示例：1280×720（20個卡片）

#### 正方形模式（有圖片）- Screenshot_174

```
第零步：檢測卡片類型
- hasImages = true（有圖片）
- 使用正方形模式

第一步：計算可用空間
- availableWidth = 1280 - 60 = 1220px
- availableHeight = 720 - 80 - 80 = 560px

第二步：計算最佳列數
- itemCount = 20
- aspectRatio = 1280 / 720 = 1.78（寬螢幕）
- maxPossibleCols = floor((1220 + 29) / (150 + 29)) = 6
- optimalCols = min(6, 10, 20) = 5

第三步：計算間距
- horizontalSpacing = max(10, min(30, 1220 * 0.02)) = 24px
- verticalSpacing = max(10, min(40, 560 * 0.03)) = 17px

第四步：計算卡片尺寸
- optimalRows = ceil(20 / 5) = 4
- availableHeightPerRow = (560 - 17 * 5) / 4 = 103.75px
- squareSizeByHeight = 103.75 / 1.4 = 74.1px
- squareSizeByWidth = (1220 - 24 * 6) / 5 = 209.2px
- squareSize = min(74.1, 209.2) = 74.1px
- finalCardWidth = max(150, min(300, 74.1)) = 150px（調整到最小值）
- finalCardHeight = 150px

結果：
- 卡片尺寸：150 × 150px（正方形）
- 卡片比例：1:1
- 水平間距：24px
- 垂直間距：17px
```

#### 長方形模式（無圖片）- Screenshot_176

```
第零步：檢測卡片類型
- hasImages = false（無圖片）
- 使用長方形模式

第一步：計算可用空間
- availableWidth = 1280 - 60 = 1220px
- availableHeight = 720 - 80 - 80 = 560px

第二步：計算最佳列數
- itemCount = 20
- aspectRatio = 1280 / 720 = 1.78（寬螢幕）
- maxPossibleCols = floor((1220 + 29) / (200 + 29)) = 5
- optimalCols = min(6, ceil(sqrt(20 * 1.78 / 1.5))) = min(6, 5) = 5

第三步：計算間距
- horizontalSpacing = max(10, min(30, 1220 * 0.02)) = 24px
- verticalSpacing = max(10, min(40, 560 * 0.03)) = 17px

第四步：計算卡片尺寸
- optimalRows = ceil(20 / 5) = 4
- finalCardWidth = (1220 - 24 * 6) / 5 = 209.2px
- availableHeightPerRow = (560 - 17 * 5) / 4 = 103.75px
- finalCardHeight = 103.75 * 0.6 = 62.25px
- finalCardWidth = max(200, min(300, 209.2)) = 209.2px
- finalCardHeight = max(100, min(300, 62.25)) = 100px（調整到最小值）

結果：
- 卡片尺寸：209.2 × 100px（長方形）
- 卡片比例：2.09:1
- 水平間距：24px
- 垂直間距：17px
```

#### 對比總結

| 項目 | 正方形模式 | 長方形模式 |
|------|----------|----------|
| **卡片尺寸** | 150 × 150px | 209.2 × 100px |
| **卡片比例** | 1:1 | 2.09:1 |
| **列數** | 5 | 5 |
| **行數** | 4 | 4 |
| **適用場景** | 有圖片 | 無圖片 |
| **視覺效果** | 緊湊 | 寬鬆 |

---

## 🎯 實施建議

### 優先級 1：核心計算
1. ✅ 實現自動檢測卡片類型（有圖片 vs 無圖片）
2. ✅ 實現統一的列數計算邏輯（根據模式選擇）
3. ✅ 實現統一的卡片尺寸計算（正方形 vs 長方形）
4. ✅ 實現統一的位置計算

### 優先級 2：優化
1. 添加最小/最大卡片尺寸限制（已包含）
2. 添加響應式斷點（已包含）
3. 添加動畫延遲

### 優先級 3：增強
1. 支持手動覆蓋模式選擇（URL 參數）
2. 支持自定義間距
3. 支持卡片對齐方式

### 模式選擇邏輯

```javascript
// 自動檢測
const hasImages = currentPagePairs.some(pair => pair.imageUrl);

// 或手動指定（通過 URL 參數）
const layoutParam = urlParams.get('cardLayout');  // 'square' 或 'rectangle'
const forceMode = layoutParam ? (layoutParam === 'square') : null;

// 最終決定
const useSquareMode = forceMode !== null ? forceMode : hasImages;
```

---

## 📚 關鍵代碼位置

| 功能 | 當前位置 | 改進位置 |
|------|---------|---------|
| **列數計算** | 1846-1868 | 統一函數 |
| **卡片尺寸** | 1873-1965 | 統一函數 |
| **位置計算** | 2155-2157 | 統一函數 |
| **間距計算** | 1828, 1840 | 統一函數 |

---

## 💡 實施步驟

### 步驟 1：創建統一計算函數
```javascript
calculateGridLayout(itemCount, width, height, hasImages) {
    // 返回 {
    //   cols, rows,
    //   cardWidth, cardHeight,
    //   horizontalSpacing, verticalSpacing,
    //   gridStartX, gridStartY,
    //   mode: 'square' | 'rectangle'
    // }
}
```

### 步驟 2：替換現有計算邏輯
```javascript
// 舊方式：多個分支
if (hasImages) {
    // 正方形模式計算
} else {
    // 長方形模式計算
}

// 新方式：統一函數
const hasImages = currentPagePairs.some(pair => pair.imageUrl);
const layout = this.calculateGridLayout(itemCount, width, height, hasImages);

// 使用統一的結果
const { cols, rows, cardWidth, cardHeight, horizontalSpacing, verticalSpacing, gridStartX, gridStartY, mode } = layout;
```

### 步驟 3：測試不同解析度和模式
- **1920×1080（16:9 寬螢幕）**
  - 正方形模式（有圖片）
  - 長方形模式（無圖片）
- **1280×720（16:9 標準寬螢幕）**
  - 正方形模式（有圖片）
  - 長方形模式（無圖片）
- **768×1024（3:4 直向螢幕）**
  - 正方形模式（有圖片）
  - 長方形模式（無圖片）
- **480×800（9:16 手機直向）**
  - 正方形模式（有圖片）
  - 長方形模式（無圖片）

---

**最後更新**：2025-11-01
**版本**：v1.0 - 改進的混合模式佈局計算方案

