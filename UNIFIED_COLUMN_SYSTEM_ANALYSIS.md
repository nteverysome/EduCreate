# 🔥 統一列數計算系統 - 深度分析

## 問題診斷

### 當前問題
- **1024×768** 和 **1024×1366** 都有相同的布局問題
- 這不是特定分辨率的問題，而是**系統性設計問題**
- 根本原因：**硬編碼的列數規則**，而不是基於容器寬度的動態計算

### 硬編碼列數規則的位置

| 位置 | 規則 | 問題 |
|------|------|------|
| 第 1393 行 | `columns = hasImages ? 5 : 2` | 固定 5 列或 2 列 |
| 第 1538-1546 行 | 根據 itemCount 固定列數 | 8 列或 10 列 |
| 第 1681-1723 行 | 根據 totalCards 和容器高度 | 3-6 列 |
| 第 2721-2735 行 | 根據寬高比固定列數 | 5-8 列 |

---

## 統一方案

### 核心原則

```
❌ 舊方式：設備類型 → 列數規則 → 卡片尺寸
✅ 新方式：容器寬度 → 最優列數 → 卡片尺寸
```

### 通用算法

```javascript
// 計算最優列數
const maxPossibleCols = Math.floor(
    (availableWidth + spacing) / (minCardWidth + spacing)
);
const optimalCols = Math.min(maxPossibleCols, itemCount);
```

**優點**：
- 適用於所有分辨率
- 自動適應容器寬度
- 無需特殊情況處理

---

## 實施步驟

### 第 1 步：添加統一計算器
✅ 已完成：`unified-column-calculator.js`

### 第 2 步：在 HTML 中加載
```html
<script src="unified-column-calculator.js"></script>
```

### 第 3 步：替換所有硬編碼列數

#### 位置 1：第 1393 行（createLeftRightMultiColumn）
```javascript
// ❌ 舊代碼
const columns = hasImages ? 5 : 2;

// ✅ 新代碼
const columns = UnifiedColumnCalculator.calculateOptimalColumns(
    width,
    itemCount,
    hasImages ? 60 : 80,  // 有圖片時卡片更小
    10,
    30
);
```

#### 位置 2：第 1538-1546 行（createLeftRightLargeLayout）
```javascript
// ❌ 舊代碼
let rows, columns;
if (itemCount <= 24) {
    rows = 3;
    columns = 8;
} else {
    rows = 3;
    columns = 10;
}

// ✅ 新代碼
const columns = UnifiedColumnCalculator.calculateOptimalColumns(
    width,
    itemCount,
    50,  // 最小卡片寬度
    5,   // 間距
    30   // 邊距
);
const rows = Math.ceil(itemCount / columns);
```

#### 位置 3：第 1681-1723 行（createMixedGridLayout）
```javascript
// ❌ 舊代碼
let columns = 1;
if (isMobilePortrait) {
    if (totalCards > 40) columns = 5;
    else if (totalCards > 30) columns = 5;
    // ... 更多規則
}

// ✅ 新代碼
const columns = UnifiedColumnCalculator.calculateOptimalColumnsWithAspectRatio(
    width,
    height,
    itemCount,
    {
        minCardWidth: 60,
        spacing: 10,
        horizontalMargin: 30,
        minCardHeight: 50,
        verticalMargin: 30
    }
);
```

#### 位置 4：第 2721-2735 行（createMixedLayout 無圖片模式）
```javascript
// ❌ 舊代碼
let optimalCols;
if (isIPad) {
    optimalCols = 5;
} else if (aspectRatio > 2.0) {
    optimalCols = Math.min(8, ...);
} // ... 更多規則

// ✅ 新代碼
const optimalCols = UnifiedColumnCalculator.calculateOptimalColumnsWithAspectRatio(
    width,
    height,
    itemCount,
    {
        minCardWidth: 80,
        spacing: 10,
        horizontalMargin: 30,
        minCardHeight: 60,
        verticalMargin: 30
    }
);
```

---

## 預期結果

### 修復前
| 分辨率 | 問題 |
|--------|------|
| 1024×768 | ❌ 固定 5 列，布局不適應 |
| 1024×1366 | ❌ 固定 5 列，布局不適應 |
| 其他分辨率 | ❌ 可能有類似問題 |

### 修復後
| 分辨率 | 結果 |
|--------|------|
| 1024×768 | ✅ 動態計算列數，根據容器寬度調整 |
| 1024×1366 | ✅ 動態計算列數，根據容器寬度調整 |
| 其他分辨率 | ✅ 統一使用動態計算 |

---

## 配置參數說明

### minCardWidth（最小卡片寬度）
- **有圖片**：60-80px
- **無圖片**：80-100px
- **手機**：40-50px

### spacing（卡片間距）
- **標準**：10px
- **緊湊**：5-8px
- **寬鬆**：15-20px

### horizontalMargin（水平邊距）
- **標準**：30px
- **手機**：10-20px
- **平板**：20-30px

---

## 驗證方法

### 測試分辨率
```javascript
// 測試 1024×768
const cols1 = UnifiedColumnCalculator.calculateOptimalColumns(1024, 20, 60, 10, 30);
console.log('1024×768 with 20 items:', cols1); // 應該是 5-6 列

// 測試 1024×1366
const cols2 = UnifiedColumnCalculator.calculateOptimalColumns(1024, 20, 60, 10, 30);
console.log('1024×1366 with 20 items:', cols2); // 應該是 5-6 列（相同）

// 測試 1920×1080
const cols3 = UnifiedColumnCalculator.calculateOptimalColumns(1920, 20, 60, 10, 30);
console.log('1920×1080 with 20 items:', cols3); // 應該是 9-10 列
```

### 調試信息
```javascript
const debugInfo = UnifiedColumnCalculator.getDebugInfo({
    containerWidth: 1024,
    containerHeight: 768,
    itemCount: 20,
    columns: 5,
    minCardWidth: 60,
    spacing: 10,
    horizontalMargin: 30
});
console.log(debugInfo);
```

---

## 優勢

✅ **統一**：所有分辨率使用相同的算法  
✅ **動態**：根據容器寬度自動調整  
✅ **可靠**：無需特殊情況處理  
✅ **可擴展**：支持新的分辨率和設備  
✅ **可維護**：代碼更簡潔，易於理解  

---

## 下一步

1. 在 `index.html` 中加載 `unified-column-calculator.js`
2. 逐個替換硬編碼的列數規則
3. 測試所有分辨率
4. 驗證布局是否正確調整

