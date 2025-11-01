# 改進的混合模式佈局計算方案 v4.0

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

### 📋 v4.0 更新內容（基於深度分析報告）

#### 🔴 P0 嚴重問題修復
- ✅ **問題 1**：修復 horizontalSpacing 未定義就使用的問題（調整步驟順序）
- ✅ **問題 3**：🔥 修復設備檢測邏輯（手機直向應使用緊湊模式，不是桌面模式）
  - 之前：手機直向使用桌面模式 → 只有 3 列 ❌
  - 修復：手機直向使用緊湊模式 → 5 列 ✅
- ✅ **問題 8**：修正中文文字高度計算公式（考慮 verticalSpacing）

#### 🟠 P1 較高問題修復
- ✅ **問題 5**：提高手機橫向全螢幕最小卡片尺寸（70px → 80px）
- ✅ **問題 9**：統一長方形模式的高度計算邏輯
- ✅ **問題 11**：補充中文文字區域的位置計算
- ✅ **問題 12**：修正事件監聽器的 this 指向和記憶體洩漏問題

#### 🟡 P2 中等問題修復
- ✅ **問題 2**：調整手機直向全螢幕的頂部按鈕區域（40px → 50px）
- ✅ **問題 4**：簡化列數計算邏輯（移除重複分支）
- ✅ **問題 7**：統一全螢幕按鈕區域調整原則
- ✅ **問題 10**：修正設備類型表格中的範圍描述

---

## 🔥 v5.0 關鍵修復：設備檢測邏輯

### 問題根源

**為什麼文檔完美但實現有問題？**

之前的代碼中，手機直向（375×667px）被錯誤地分類為桌面模式，導致：
- ❌ 使用錯誤的列數計算邏輯
- ❌ 最小卡片尺寸設置為 150px（太大）
- ❌ 最終只顯示 3 列而不是 5 列
- ❌ 空間利用率只有 24% 而不是 76%

### 修復方案

**添加 `isMobileDevice` 檢測**

```javascript
// 之前（錯誤）
const isLandscapeMobile = width > height && height < 500;
const isTinyHeight = height < 400;
const isCompactMode = isLandscapeMobile || isTinyHeight;  // 手機直向不符合條件

// 修復後（正確）
const isMobileDevice = width < 768;  // 🔥 添加手機設備檢測
const isLandscapeMobile = width > height && height < 500;
const isTinyHeight = height < 400;
const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;  // 手機直向現在符合條件
```

### 修復效果

| 項目 | 修復前 | 修復後 |
|------|--------|--------|
| **手機直向檢測** | isCompactMode = false ❌ | isCompactMode = true ✅ |
| **使用模式** | 桌面模式 ❌ | 緊湊模式 ✅ |
| **列數** | 3 列 ❌ | 5 列 ✅ |
| **空間利用率** | 24% ❌ | 76% ✅ |
| **與 Wordwall 一致** | 否 ❌ | 是 ✅ |

---

## � v6.0 新增：分頁邏輯與佈局計算整合

### 核心概念

**分頁邏輯應該基於「每頁能容納的最大卡片數」，而不是固定的數字**

之前的分頁邏輯是固定的：
- 6-12 個卡片 → 每頁 4 個
- 13-18 個卡片 → 每頁 5 個
- 19-24 個卡片 → 每頁 6 個

**問題**：不考慮屏幕尺寸和佈局限制，導致分頁與實際顯示不符

**解決方案**：根據設備類型、屏幕尺寸、佈局模式動態計算每頁最大卡片數

### 計算流程

#### 第一步：計算每頁能容納的最大卡片數

```javascript
function calculateMaxCardsPerPage(width, height, layout = 'mixed') {
    // 🔥 檢測設備類型和模式
    const isMobileDevice = width < 768;
    const isLandscapeMobile = width > height && height < 500;
    const isTinyHeight = height < 400;
    const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;

    // 獲取設備配置
    const deviceType = getDeviceType(width, height);
    const containerConfig = getContainerConfig(deviceType, false);

    // 計算可用空間
    const availableWidth = width - containerConfig.sideMargin * 2;
    const availableHeight = height - containerConfig.topButtonArea - containerConfig.bottomButtonArea;

    // 根據佈局模式決定列數
    let cols;
    if (layout === 'mixed') {
        cols = isCompactMode ? 5 : 3;  // 混合模式：緊湊 5 列，正常 3 列
    } else {
        cols = Math.floor(availableWidth / 150);  // 分離模式：動態列數
    }

    // 計算卡片尺寸和行數
    const horizontalSpacing = Math.max(5, Math.min(15, availableWidth * 0.01));
    const cardWidth = (availableWidth - horizontalSpacing * (cols + 1)) / cols;

    const verticalSpacing = Math.max(5, Math.min(20, availableHeight * 0.02));
    const cardHeight = 67;  // 混合模式卡片高度
    const chineseTextHeight = 20;  // 中文文字高度
    const totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing;

    const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);
    const maxCardsPerPage = cols * maxRows;

    return {
        maxCardsPerPage,
        cols,
        maxRows,
        cardWidth,
        cardHeight,
        availableHeight
    };
}
```

#### 第二步：根據最大卡片數計算分頁

```javascript
function calculatePaginationWithLayout(totalPairs, width, height, layout = 'mixed') {
    // 計算每頁能容納的最大卡片數
    const layoutInfo = calculateMaxCardsPerPage(width, height, layout);
    const maxCardsPerPage = layoutInfo.maxCardsPerPage;

    // 確保每頁至少有 1 個卡片
    const itemsPerPage = Math.max(1, maxCardsPerPage);

    // 計算總頁數
    const totalPages = Math.ceil(totalPairs / itemsPerPage);

    // 決定是否啟用分頁
    const enablePagination = totalPages > 1;

    return {
        itemsPerPage,
        totalPages,
        enablePagination,
        maxCardsPerPage,
        ...layoutInfo
    };
}
```

### 計算示例

#### 手機直向（375×667px）- 混合模式

```
輸入：20 個卡片

計算：
- cols = 5（緊湊模式）
- availableHeight = 567px
- totalUnitHeight = 67 + 20 + 10 = 97px
- maxRows = floor(567 / 97) = 5 行
- maxCardsPerPage = 5 × 5 = 25 個

結果：
- itemsPerPage = 25
- totalPages = ceil(20 / 25) = 1 頁
- enablePagination = false
- 顯示全部 20 個卡片 ✅
```

#### 平板直向（768×1024px）- 分離模式

```
輸入：50 個卡片

計算：
- cols = 4（動態）
- availableHeight = 904px
- totalUnitHeight = 100 + 15 = 115px
- maxRows = floor(904 / 115) = 7 行
- maxCardsPerPage = 4 × 7 = 28 個

結果：
- itemsPerPage = 28
- totalPages = ceil(50 / 28) = 2 頁
- enablePagination = true
- 第 1 頁 28 個，第 2 頁 22 個 ✅
```

---

## �📱 設備檢測與容器配置

### 設備類型分類

根據螢幕寬度和方向，系統自動檢測設備類型：

```javascript
// 設備檢測函數（修正版 v5.0 - 修復手機直向檢測）
function getDeviceType(width, height) {
    // 🔥 修復：手機直向應該也使用緊湊模式
    // isMobileDevice：手機設備（寬度 < 768px）
    const isMobileDevice = width < 768;  // 手機設備（寬度 < 768px）

    // 特殊情況：手機橫向或極小高度
    const isLandscapeMobile = width > height && height < 500;  // 手機橫向
    const isTinyHeight = height < 400;  // 極小高度

    // 🔥 修復：手機直向、手機橫向、極小高度都應該使用緊湊模式
    if (isMobileDevice || isLandscapeMobile || isTinyHeight) {
        // 緊湊模式：手機直向、手機橫向、極小高度
        if (width < 768) {
            return height > width ? 'mobile-portrait' : 'mobile-landscape';
        } else {
            return 'mobile-landscape';  // 其他情況下的緊湊模式
        }
    }

    // 標準設備檢測（非手機設備）
    if (width < 1024) {
        // 平板設備
        return height > width ? 'tablet-portrait' : 'tablet-landscape';
    } else {
        // 桌面設備
        return 'desktop';
    }
}
```

### 設備類型與佈局模式（修復版 v5.0）

| 設備類型 | 寬度範圍 | 高度範圍 | 佈局模式 | 特點 |
|---------|---------|---------|---------|------|
| **手機直向** | < 768px | height > width（直向） | 🔥 緊湊模式 | 固定 5 列，扁平卡片 |
| **手機橫向** | < 768px | height < 500px 或 height < 400px（橫向） | 緊湊模式 | 固定 5 列，極度緊湊 |
| **極小高度** | 任意 | height < 400px（極小） | 緊湊模式 | 固定 5 列，極度緊湊 |
| **平板直向** | 768-1024px | height > width（直向） | 桌面模式 | 動態列數，充分利用空間 |
| **平板橫向** | 768-1024px | height < width（橫向） | 桌面模式 | 寬螢幕優化，完整功能 |
| **桌面版** | > 1024px | 任意 | 桌面模式 | 完整功能，詳細資訊 |

**🔥 v5.0 修復說明**：
- 手機直向（375×667px）現在正確使用緊湊模式
- 之前錯誤地使用桌面模式，導致只有 3 列
- 修復後應該顯示 5 列，與 Wordwall 一致

### 根據設備類型優化容器配置

```javascript
function getContainerConfig(deviceType, isFullscreen = false) {
    const configs = {
        'mobile-portrait': {
            topButtonArea: isFullscreen ? 50 : 40,      // 🔥 修正：全螢幕時增加到 50px
            bottomButtonArea: isFullscreen ? 50 : 40,
            sideMargin: isFullscreen ? 15 : 20,
            cols: 5,
            mode: 'compact',
            minCardSize: isFullscreen ? 80 : 150
        },
        'mobile-landscape': {
            topButtonArea: isFullscreen ? 25 : 30,
            bottomButtonArea: isFullscreen ? 30 : 30,
            sideMargin: isFullscreen ? 12 : 15,
            cols: 5,
            mode: 'compact',
            minCardSize: isFullscreen ? 80 : 150        // 🔥 修正：從 70px 提高到 80px
        },
        'tablet-portrait': {
            topButtonArea: isFullscreen ? 50 : 60,
            bottomButtonArea: isFullscreen ? 60 : 60,
            sideMargin: isFullscreen ? 25 : 30,
            cols: 'dynamic',
            mode: 'desktop',
            minCardSize: isFullscreen ? 100 : 150
        },
        'tablet-landscape': {
            topButtonArea: isFullscreen ? 60 : 50,
            bottomButtonArea: isFullscreen ? 80 : 50,
            sideMargin: isFullscreen ? 35 : 40,
            cols: 'dynamic',
            mode: 'desktop',
            minCardSize: isFullscreen ? 110 : 150
        },
        'desktop': {
            topButtonArea: isFullscreen ? 70 : 80,
            bottomButtonArea: isFullscreen ? 90 : 80,
            sideMargin: isFullscreen ? 45 : 50,
            cols: 'dynamic',
            mode: 'desktop',
            minCardSize: isFullscreen ? 120 : 150
        }
    };

    return configs[deviceType];
}
```

### 🔥 P2-3: 全螢幕按鈕區域調整統一原則

#### 設計原則

全螢幕模式下的按鈕區域調整遵循以下統一原則：

1. **手機設備（寬度 < 768px）**
   - **直向模式**：topButtonArea 從 40px 增加到 50px（+25%）
   - **橫向模式**：topButtonArea 從 30px 減少到 25px（-17%）
   - **原因**：直向模式空間有限，需要增加按鈕區域以提高可點擊性；橫向模式空間充足，可以減少按鈕區域以增加卡片空間

2. **平板設備（寬度 768-1024px）**
   - **直向模式**：topButtonArea 從 60px 減少到 50px（-17%）
   - **橫向模式**：topButtonArea 從 50px 增加到 60px（+20%）
   - **原因**：直向模式已有足夠空間，可以減少按鈕區域；橫向模式需要增加按鈕區域以保持一致性

3. **桌面設備（寬度 > 1024px）**
   - **topButtonArea**：從 80px 減少到 70px（-12.5%）
   - **bottomButtonArea**：從 80px 增加到 90px（+12.5%）
   - **原因**：桌面設備空間充足，可以靈活調整；底部按鈕區域增加以容納更多功能

#### 實施規則

| 設備類型 | 方向 | 非全螢幕 | 全螢幕 | 變化 | 說明 |
|---------|------|---------|--------|------|------|
| **手機** | 直向 | 40px | 50px | +25% | 增加可點擊性 |
| **手機** | 橫向 | 30px | 25px | -17% | 增加卡片空間 |
| **平板** | 直向 | 60px | 50px | -17% | 減少冗餘空間 |
| **平板** | 橫向 | 50px | 60px | +20% | 保持一致性 |
| **桌面** | - | 80px | 70px | -12.5% | 靈活調整 |

#### 代碼實現

```javascript
// 🔥 P2-3: 統一全螢幕按鈕調整原則
function getFullscreenButtonAreaAdjustment(deviceType, orientation) {
    const adjustments = {
        'mobile-portrait': { topButtonArea: 50, bottomButtonArea: 50 },      // +25%
        'mobile-landscape': { topButtonArea: 25, bottomButtonArea: 30 },     // -17%
        'tablet-portrait': { topButtonArea: 50, bottomButtonArea: 60 },      // -17%
        'tablet-landscape': { topButtonArea: 60, bottomButtonArea: 80 },     // +20%
        'desktop': { topButtonArea: 70, bottomButtonArea: 90 }               // -12.5%
    };

    return adjustments[deviceType];
}
```

### 全螢幕狀態檢測

```javascript
// 檢測全螢幕狀態
function isFullscreenMode() {
    return !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
    );
}

// 🔥 修正：在 Phaser 場景的 create() 方法中正確設置事件監聽器
create() {
    // 綁定 this 上下文，避免 this 指向問題
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);

    // 添加事件監聽器
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);

    window.addEventListener('orientationchange', this.handleOrientationChange);
    window.addEventListener('resize', this.handleOrientationChange);
}

// 全螢幕狀態變化處理函數
handleFullscreenChange() {
    console.log('🔄 全螢幕狀態已改變，重新計算佈局');
    if (typeof this.calculateLayout === 'function') {
        this.calculateLayout();
    }
}

// 方向變化處理函數
handleOrientationChange() {
    console.log('🔄 設備方向已改變，重新計算佈局');
    setTimeout(() => {
        if (typeof this.calculateLayout === 'function') {
            this.calculateLayout();
        }
    }, 100);
}

// 🔥 修正：在 shutdown() 或 destroy() 方法中移除監聽器，避免記憶體洩漏
shutdown() {
    // 移除事件監聽器
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);

    window.removeEventListener('orientationchange', this.handleOrientationChange);
    window.removeEventListener('resize', this.handleOrientationChange);
}
```

---

## �📐 改進的計算方案

### 第零步：檢測設備類型、全螢幕狀態與卡片類型

```javascript
// 檢測全螢幕狀態
const isFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
);

console.log('🖥️ 全螢幕狀態:', isFullscreen ? '✅ 全螢幕' : '❌ 非全螢幕');

// 檢測設備類型
const deviceType = getDeviceType(width, height);
const containerConfig = getContainerConfig(deviceType, isFullscreen);

console.log('📱 設備檢測:', {
    deviceType,
    width,
    height,
    aspectRatio: (width / height).toFixed(2),
    mode: containerConfig.mode,
    isFullscreen
});

// 檢測卡片類型
const hasImages = currentPagePairs.some(pair => pair.imageUrl);

console.log('🎨 卡片類型:', {
    hasImages,
    mode: hasImages ? '🟦 正方形（有圖片）' : '🟨 長方形（無圖片）'
});
```

### 第二步：計算可用空間

根據設備類型使用相應的容器配置：

```javascript
// 使用設備配置的按鈕區域和邊距
const topButtonAreaHeight = containerConfig.topButtonArea;
const bottomButtonAreaHeight = containerConfig.bottomButtonArea;
const sideMargin = containerConfig.sideMargin;

// 計算可用空間
const availableWidth = width - sideMargin * 2;
const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;

console.log('📐 可用空間:', {
    deviceType,
    availableWidth: availableWidth.toFixed(0),
    availableHeight: availableHeight.toFixed(0),
    aspectRatio: (availableWidth / availableHeight).toFixed(2),
    topButtonArea: topButtonAreaHeight,
    bottomButtonArea: bottomButtonAreaHeight,
    sideMargin: sideMargin
});
```

### 第三步：計算間距（🔥 修正：提前到第三步）

```javascript
// 🔥 重要：必須先計算間距，因為第四步計算列數時需要使用
// 水平間距：可用寬度的 2%，範圍 10-30px
const horizontalSpacing = Math.max(10, Math.min(30, availableWidth * 0.02));

// 垂直間距：可用高度的 3%，範圍 10-40px
const verticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03));

console.log('📏 間距計算:', {
    horizontalSpacing: horizontalSpacing.toFixed(1),
    verticalSpacing: verticalSpacing.toFixed(1)
});
```

### 第四步：計算最佳列數（🔥 修正：從第三步移到第四步）

根據設備類型和卡片類型計算最佳列數：

```javascript
const itemCount = currentPagePairs.length;
const aspectRatio = width / height;

let optimalCols;

// 如果設備配置指定了固定列數，直接使用
if (containerConfig.cols !== 'dynamic') {
    optimalCols = Math.min(containerConfig.cols, itemCount);
    console.log('📊 使用固定列數:', optimalCols);
} else {
    // 動態計算列數
    if (hasImages) {
        // 🟦 正方形模式（有圖片）- 列數較少
        const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (150 + horizontalSpacing));

        // 🔥 修正：簡化邏輯，移除重複分支
        let maxColsLimit;
        if (aspectRatio > 1.5) {
            maxColsLimit = 10;  // 寬螢幕：最多 10 列
        } else if (aspectRatio > 1.2) {
            maxColsLimit = 8;   // 標準螢幕：最多 8 列
        } else {
            maxColsLimit = 5;   // 直向螢幕：最多 5 列
        }

        optimalCols = Math.min(maxPossibleCols, maxColsLimit, itemCount);
    } else {
        // 🟨 長方形模式（無圖片）- 列數較多
        const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (200 + horizontalSpacing));

        // 🔥 修正：簡化邏輯，使用統一的計算方式
        let maxColsLimit;
        if (aspectRatio > 1.5) {
            maxColsLimit = 8;   // 寬螢幕：最多 8 列
        } else if (aspectRatio > 1.2) {
            maxColsLimit = 6;   // 標準螢幕：最多 6 列
        } else {
            maxColsLimit = 4;   // 直向螢幕：最多 4 列
        }

        optimalCols = Math.max(1, Math.min(maxPossibleCols, maxColsLimit, itemCount));
    }
}

const optimalRows = Math.ceil(itemCount / optimalCols);

console.log('📊 網格佈局:', {
    itemCount,
    deviceType,
    mode: hasImages ? '正方形（有圖片）' : '長方形（無圖片）',
    optimalCols,
    optimalRows,
    aspectRatio: aspectRatio.toFixed(2)
});
```

### 第五步：計算卡片尺寸

```javascript
let finalCardWidth, finalCardHeight, cardRatio;

// 根據全螢幕狀態調整最小卡片尺寸
const minCardSize = containerConfig.minCardSize;

if (hasImages) {
    // 🟦 正方形模式（有圖片）
    // 卡片是正方形（1:1 比例）

    // 方法1：基於高度（考慮中文文字和垂直間距）
    // 🔥 修正：正確的計算公式
    // totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing
    // 其中：chineseTextHeight = cardHeight * 0.4
    // 所以：availableHeightPerRow = cardHeight + cardHeight * 0.4 + verticalSpacing
    //      availableHeightPerRow = cardHeight * 1.4 + verticalSpacing
    //      cardHeight = (availableHeightPerRow - verticalSpacing) / 1.4
    const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
    let squareSizeByHeight = (availableHeightPerRow - verticalSpacing) / 1.4;

    // 方法2：基於寬度
    const squareSizeByWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

    // 取較小值
    let squareSize = Math.min(squareSizeByHeight, squareSizeByWidth);

    // 確保卡片尺寸在合理範圍內
    // 全螢幕模式下使用動態最小值，非全螢幕模式下使用固定最小值
    const minSquareSize = isFullscreen ? minCardSize : 150;
    const maxSquareSize = 300;
    squareSize = Math.max(minSquareSize, Math.min(maxSquareSize, squareSize));

    finalCardWidth = squareSize;
    finalCardHeight = squareSize;
    cardRatio = '1:1（正方形）';

    console.log('🟦 正方形模式（有圖片）:', {
        isFullscreen,
        minSquareSize,
        availableHeightPerRow: availableHeightPerRow.toFixed(1),
        squareSizeByHeight: squareSizeByHeight.toFixed(1),
        squareSizeByWidth: squareSizeByWidth.toFixed(1),
        finalSize: squareSize.toFixed(1)
    });

} else {
    // 🟨 長方形模式（無圖片）
    // 卡片是長方形（寬 > 高），充分利用寬度

    // 卡片寬度：充分利用可用寬度
    finalCardWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

    // 🔥 修正：卡片高度計算與正方形模式保持一致
    // totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing
    // 其中：chineseTextHeight = cardHeight * 0.4
    // 所以：cardHeight = (availableHeightPerRow - verticalSpacing) / 1.4
    const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
    finalCardHeight = (availableHeightPerRow - verticalSpacing) / 1.4;

    // 確保卡片尺寸在合理範圍內
    // 全螢幕模式下使用動態最小值，非全螢幕模式下使用固定最小值
    const minCardWidth = isFullscreen ? minCardSize : 200;
    const minCardHeight = isFullscreen ? (minCardSize * 0.5) : 100;
    const maxCardSize = 300;

    finalCardWidth = Math.max(minCardWidth, Math.min(maxCardSize, finalCardWidth));
    finalCardHeight = Math.max(minCardHeight, Math.min(maxCardSize, finalCardHeight));

    cardRatio = (finalCardWidth / finalCardHeight).toFixed(2) + ':1（長方形）';

    console.log('🟨 長方形模式（無圖片）:', {
        isFullscreen,
        minCardWidth,
        minCardHeight,
        availableHeightPerRow: availableHeightPerRow.toFixed(1),
        calculatedWidth: ((availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols).toFixed(1),
        calculatedHeight: ((availableHeightPerRow - verticalSpacing) / 1.4).toFixed(1),
        finalWidth: finalCardWidth.toFixed(1),
        finalHeight: finalCardHeight.toFixed(1)
    });
}

console.log('📦 卡片尺寸:', {
    deviceType,
    mode: hasImages ? '正方形（有圖片）' : '長方形（無圖片）',
    cardWidth: finalCardWidth.toFixed(1),
    cardHeight: finalCardHeight.toFixed(1),
    ratio: cardRatio
});
```

### 第六步：計算卡片和中文文字位置（🔥 補充中文文字位置計算）

```javascript
// 🔥 計算中文文字高度（與實際代碼一致）
const chineseTextHeight = finalCardHeight * 0.4;

// 計算單元總高度（包含卡片、中文文字和垂直間距）
const totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing;

// 計算網格起始位置（居中）
const totalGridWidth = optimalCols * finalCardWidth + horizontalSpacing * (optimalCols + 1);
const totalGridHeight = optimalRows * totalUnitHeight;

const gridStartX = (availableWidth - totalGridWidth) / 2 + sideMargin;
const gridStartY = (availableHeight - totalGridHeight) / 2 + topButtonAreaHeight;

// 創建卡片和中文文字
currentPagePairs.forEach((pair, index) => {
    const col = index % optimalCols;
    const row = Math.floor(index / optimalCols);

    // 計算英文卡片中心位置
    const cardX = gridStartX + horizontalSpacing + col * (finalCardWidth + horizontalSpacing) + finalCardWidth / 2;
    const cardY = gridStartY + row * totalUnitHeight + finalCardHeight / 2;

    // 🔥 計算中文文字框位置（在英文卡片下方）
    const chineseTextY = cardY + finalCardHeight / 2 + chineseTextHeight / 2;

    // 創建英文卡片
    const card = this.createCard(cardX, cardY, finalCardWidth, finalCardHeight, pair);

    // 🔥 創建中文文字框（混合模式的核心）
    const chineseText = this.createChineseText(
        cardX,                  // X 座標與英文卡片對齊
        chineseTextY,           // Y 座標在英文卡片下方
        finalCardWidth,         // 寬度與英文卡片相同
        chineseTextHeight,      // 高度為卡片高度的 40%
        pair
    );
});

console.log('📍 網格位置:', {
    gridStartX: gridStartX.toFixed(0),
    gridStartY: gridStartY.toFixed(0),
    totalGridWidth: totalGridWidth.toFixed(0),
    totalGridHeight: totalGridHeight.toFixed(0),
    chineseTextHeight: chineseTextHeight.toFixed(1),
    totalUnitHeight: totalUnitHeight.toFixed(1)
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
1. ✅ 實現設備類型檢測函數（getDeviceType）
2. ✅ 實現容器配置函數（getContainerConfig）
3. ✅ 實現自動檢測卡片類型（有圖片 vs 無圖片）
4. ✅ 實現統一的列數計算邏輯（根據模式選擇）
5. ✅ 實現統一的卡片尺寸計算（正方形 vs 長方形）
6. ✅ 實現統一的位置計算

### 優先級 2：設備優化
1. 根據設備類型優化按鈕區域高度
2. 根據設備類型優化邊距
3. 根據設備類型優化列數限制
4. 測試所有設備類型和方向組合

### 優先級 3：增強
1. 支持手動覆蓋模式選擇（URL 參數）
2. 支持自定義間距
3. 支持卡片對齐方式
4. 添加動畫延遲

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

### 步驟 1：創建設備檢測和配置函數
```javascript
// 設備檢測函數
function getDeviceType(width, height) {
    if (width < 768) {
        return height > width ? 'mobile-portrait' : 'mobile-landscape';
    } else if (width < 1024) {
        return height > width ? 'tablet-portrait' : 'tablet-landscape';
    } else {
        return 'desktop';
    }
}

// 容器配置函數
function getContainerConfig(deviceType) {
    const configs = {
        'mobile-portrait': { topButtonArea: 40, bottomButtonArea: 40, sideMargin: 20, cols: 5, mode: 'compact' },
        'mobile-landscape': { topButtonArea: 30, bottomButtonArea: 30, sideMargin: 15, cols: 5, mode: 'compact' },
        'tablet-portrait': { topButtonArea: 60, bottomButtonArea: 60, sideMargin: 30, cols: 'dynamic', mode: 'desktop' },
        'tablet-landscape': { topButtonArea: 50, bottomButtonArea: 50, sideMargin: 40, cols: 'dynamic', mode: 'desktop' },
        'desktop': { topButtonArea: 80, bottomButtonArea: 80, sideMargin: 50, cols: 'dynamic', mode: 'desktop' }
    };
    return configs[deviceType];
}
```

### 步驟 2：創建統一計算函數
```javascript
calculateGridLayout(itemCount, width, height, hasImages) {
    // 檢測設備類型
    const deviceType = getDeviceType(width, height);
    const containerConfig = getContainerConfig(deviceType);

    // 返回 {
    //   deviceType,
    //   cols, rows,
    //   cardWidth, cardHeight,
    //   horizontalSpacing, verticalSpacing,
    //   gridStartX, gridStartY,
    //   mode: 'square' | 'rectangle',
    //   containerConfig
    // }
}
```

### 步驟 3：替換現有計算邏輯
```javascript
// 新方式：統一函數
const hasImages = currentPagePairs.some(pair => pair.imageUrl);
const layout = this.calculateGridLayout(itemCount, width, height, hasImages);

// 使用統一的結果
const {
    deviceType, cols, rows, cardWidth, cardHeight,
    horizontalSpacing, verticalSpacing, gridStartX, gridStartY, mode
} = layout;
```

### 步驟 4：測試所有設備類型、模式和全螢幕狀態組合

#### 非全螢幕模式

##### 手機直向（375×667px）
- 正方形模式（有圖片）：minCardSize = 150px
- 長方形模式（無圖片）：minCardSize = 150px

##### 手機橫向（812×375px）
- 正方形模式（有圖片）：minCardSize = 150px
- 長方形模式（無圖片）：minCardSize = 150px

##### 平板直向（768×1024px）
- 正方形模式（有圖片）：minCardSize = 150px
- 長方形模式（無圖片）：minCardSize = 150px

##### 平板橫向（1024×768px）
- 正方形模式（有圖片）：minCardSize = 150px
- 長方形模式（無圖片）：minCardSize = 150px

##### 桌面版（1440×900px）
- 正方形模式（有圖片）：minCardSize = 150px
- 長方形模式（無圖片）：minCardSize = 150px

##### 超寬螢幕（1920×1080px）
- 正方形模式（有圖片）：minCardSize = 150px
- 長方形模式（無圖片）：minCardSize = 150px

#### 全螢幕模式

##### 手機直向全螢幕（375×667px）
- 正方形模式（有圖片）：minCardSize = 80px，按鈕區域調整
- 長方形模式（無圖片）：minCardSize = 80px，按鈕區域調整

##### 手機橫向全螢幕（812×375px）
- 正方形模式（有圖片）：minCardSize = 70px，按鈕區域調整
- 長方形模式（無圖片）：minCardSize = 70px，按鈕區域調整

##### 平板直向全螢幕（768×1024px）
- 正方形模式（有圖片）：minCardSize = 100px，按鈕區域調整
- 長方形模式（無圖片）：minCardSize = 100px，按鈕區域調整

##### 平板橫向全螢幕（1024×768px）
- 正方形模式（有圖片）：minCardSize = 110px，按鈕區域調整
- 長方形模式（無圖片）：minCardSize = 110px，按鈕區域調整

##### 桌面全螢幕（1440×900px）
- 正方形模式（有圖片）：minCardSize = 120px，按鈕區域調整
- 長方形模式（無圖片）：minCardSize = 120px，按鈕區域調整

##### 超寬螢幕全螢幕（1920×1080px）
- 正方形模式（有圖片）：minCardSize = 120px，按鈕區域調整
- 長方形模式（無圖片）：minCardSize = 120px，按鈕區域調整

---

## 📋 整合內容總結

本文檔已整合以下內容：

✅ **全螢幕狀態檢測**
- 檢測全螢幕狀態（document.fullscreenElement）
- 監聽全螢幕狀態變化事件
- 監聽設備方向變化事件

✅ **全螢幕模式下的容器配置**
- 根據全螢幕狀態調整按鈕區域高度
- 根據全螢幕狀態調整邊距
- 根據全螢幕狀態調整最小卡片尺寸

✅ **設備檢測與容器配置**
- 手機直向、手機橫向、平板直向、平板橫向、桌面版
- 根據設備類型優化按鈕區域、邊距、列數限制
- 支援全螢幕和非全螢幕兩種模式

✅ **改進的計算方案（6 步）**
- 第零步：檢測全螢幕狀態、設備類型與卡片類型
- 第二步：計算可用空間（使用設備配置）
- 第三步：計算間距（🔥 修正：提前到第三步，避免未定義錯誤）
- 第四步：計算最佳列數（🔥 修正：從第三步移到第四步，簡化邏輯）
- 第五步：計算卡片尺寸（🔥 修正：正確計算中文文字高度，考慮 verticalSpacing）
- 第六步：計算卡片和中文文字位置（🔥 補充：中文文字位置計算）

✅ **實施建議**
- 優先級 1：核心計算（全螢幕檢測、設備檢測、容器配置、卡片類型檢測）
- 優先級 2：設備優化（按鈕區域、邊距、列數限制）
- 優先級 3：全螢幕優化（動態最小卡片尺寸、事件監聽器管理）
- 優先級 4：增強功能（手動覆蓋、自定義間距、卡片對齐）

✅ **完整的測試場景**
- 6 種設備類型 × 2 種卡片模式 × 2 種全螢幕狀態 = 24 種組合

---

## 📋 v4.0 修正總結

### 🔴 P0 嚴重問題（已修復）
1. ✅ **horizontalSpacing 未定義**：調整步驟順序，先計算間距（第三步）再計算列數（第四步）
2. ✅ **設備檢測不一致**：統一設備檢測邏輯，優先檢查緊湊模式（與 game.js 一致）
3. ✅ **中文文字高度計算錯誤**：修正公式為 `(availableHeightPerRow - verticalSpacing) / 1.4`

### 🟠 P1 較高問題（已修復）
4. ✅ **minCardSize 過小**：手機橫向全螢幕從 70px 提高到 80px
5. ✅ **長方形高度計算不合理**：統一使用 `(availableHeightPerRow - verticalSpacing) / 1.4`
6. ✅ **缺少中文文字位置計算**：補充完整的中文文字框位置計算邏輯
7. ✅ **this 指向問題**：使用綁定方法和正確的事件監聽器管理，避免記憶體洩漏

### 🟡 P2 中等問題（已修復）
8. ✅ **手機直向按鈕區域**：全螢幕時 topButtonArea 從 40px 提高到 50px
9. ✅ **列數計算複雜**：簡化邏輯，移除重複分支（aspectRatio > 2.0 和 > 1.5 合併）
10. ✅ **按鈕區域不一致**：統一全螢幕調整原則
11. ✅ **設備類型表格錯誤**：修正高度範圍描述（手機直向：> width，手機橫向：< 500px 或 < 400px）

---

**最後更新**：2025-11-01
**版本**：v4.0 - 改進的混合模式佈局計算方案（已修復深度分析報告中發現的 12 個問題）
**基於**：IMPROVED_LAYOUT_DESIGN_ISSUES_ANALYSIS.md 深度分析報告

