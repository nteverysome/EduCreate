# 混合模式卡片尺寸調整 - 決策樹

## 🌳 完整決策流程

```
開始
  ↓
[1] 獲取螢幕尺寸 (width, height)
  ↓
[2] 檢測全螢幕狀態
  ├─ 是 → isFullscreen = true
  └─ 否 → isFullscreen = false
  ↓
[3] 計算寬高比 (aspectRatio = width / height)
  ↓
[4] 判斷設備類型
  ├─ width < 768
  │  ├─ height > width → 'mobile-portrait'
  │  └─ height ≤ width → 'mobile-landscape'
  ├─ 768 ≤ width < 1024
  │  ├─ height > width → 'tablet-portrait'
  │  └─ height ≤ width → 'tablet-landscape'
  └─ width ≥ 1024 → 'desktop'
  ↓
[5] 根據設備類型選擇配置
  ├─ mobile-portrait → config_mp
  ├─ mobile-landscape → config_ml
  ├─ tablet-portrait → config_tp
  ├─ tablet-landscape → config_tl
  └─ desktop → config_d
  ↓
[6] 應用全螢幕調整
  ├─ isFullscreen = true
  │  ├─ topButtonArea *= 0.5
  │  ├─ bottomButtonArea *= 0.5
  │  ├─ sideMargin *= 0.75
  │  └─ minCardSize *= 0.8
  └─ isFullscreen = false → 保持原配置
  ↓
[7] 計算可用空間
  ├─ availableWidth = width - sideMargin * 2
  └─ availableHeight = height - topButtonArea - bottomButtonArea
  ↓
[8] 計算間距
  ├─ horizontalSpacing = clamp(width * 0.015, 15, 30)
  └─ verticalSpacing = clamp(height * 0.04, 40, 80)
  ↓
[9] 判斷列數類型
  ├─ config.cols = 'dynamic'
  │  ├─ 計算 maxPossibleCols
  │  ├─ 根據 aspectRatio 選擇最佳列數
  │  └─ optimalCols = min(maxPossibleCols, maxLimit, itemCount)
  └─ config.cols = 固定值
     └─ optimalCols = config.cols
  ↓
[10] 計算行數
  └─ optimalRows = ceil(itemCount / optimalCols)
  ↓
[11] 判斷卡片類型
  ├─ hasImages = true → 正方形模式
  │  ├─ 計算 squareSizeByHeight = availableHeightPerRow / 1.4
  │  ├─ 計算 squareSizeByWidth = (availableWidth - spacing * (cols + 1)) / cols
  │  ├─ squareSize = min(squareSizeByHeight, squareSizeByWidth)
  │  ├─ 應用最小/最大限制
  │  └─ cardWidth = cardHeight = squareSize
  └─ hasImages = false → 長方形模式
     ├─ cardWidth = (availableWidth - spacing * (cols + 1)) / cols
     ├─ cardHeight = (availableHeightPerRow - spacing) / 1.4
     └─ 應用最小/最大限制
  ↓
[12] 驗證卡片尺寸
  ├─ cardSize < minSize?
  │  ├─ 是 → 增加列數，重新計算
  │  └─ 否 → 繼續
  ├─ rows > maxPossibleRows?
  │  ├─ 是 → 增加列數，重新計算
  │  └─ 否 → 繼續
  └─ 所有卡片都在容器內?
     ├─ 是 → 繼續
     └─ 否 → 調整尺寸
  ↓
[13] 計算文字高度
  ├─ hasImages = true
  │  └─ chineseTextHeight = cardHeight * 0.4
  └─ hasImages = false
     └─ chineseTextHeight = 30px
  ↓
[14] 計算總單元高度
  └─ totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing
  ↓
[15] 輸出結果
  └─ {
       cardWidth,
       cardHeight,
       cols,
       rows,
       horizontalSpacing,
       verticalSpacing,
       deviceType,
       mode,
       chineseTextHeight,
       totalUnitHeight
     }
  ↓
結束
```

---

## 🔀 分支決策點詳解

### 決策點 [4]：設備類型判斷

```javascript
function getDeviceType(width, height) {
    if (width < 768) {
        // 手機設備
        return height > width ? 'mobile-portrait' : 'mobile-landscape';
    } else if (width < 1024) {
        // 平板設備
        return height > width ? 'tablet-portrait' : 'tablet-landscape';
    } else {
        // 桌面設備
        return 'desktop';
    }
}
```

**決策邏輯**：
- 寬度是主要判斷標準
- 高度用於判斷方向（直向 vs 橫向）

### 決策點 [9]：列數計算

```javascript
function calculateOptimalCols(width, height, itemCount, config, spacing) {
    const aspectRatio = width / height;
    const maxPossibleCols = Math.floor(
        (spacing.availableWidth + spacing.horizontalSpacing) / 
        (config.minCardSize + spacing.horizontalSpacing)
    );
    
    let optimalCols;
    if (config.cols !== 'dynamic') {
        // 固定列數（手機）
        optimalCols = config.cols;
    } else {
        // 動態列數（平板、桌面）
        if (aspectRatio > 2.0) {
            optimalCols = Math.min(maxPossibleCols, 10, itemCount);
        } else if (aspectRatio > 1.5) {
            optimalCols = Math.min(maxPossibleCols, 10, itemCount);
        } else if (aspectRatio > 1.2) {
            optimalCols = Math.min(maxPossibleCols, 8, itemCount);
        } else {
            optimalCols = Math.min(maxPossibleCols, 5, itemCount);
        }
    }
    
    return optimalCols;
}
```

**決策邏輯**：
- 手機：固定 5 列
- 平板/桌面：根據寬高比動態計算
- 超寬螢幕（21:9）：最多 10 列
- 標準螢幕（16:9）：最多 8-10 列
- 直向螢幕（9:16）：最多 5 列

### 決策點 [11]：卡片類型判斷

```javascript
if (hasImages) {
    // 正方形模式
    // 卡片是 1:1 比例
    // 文字高度 = 卡片高度 × 0.4
} else {
    // 長方形模式
    // 卡片寬 > 高
    // 文字高度 = 固定 30px
}
```

**決策邏輯**：
- 有圖片 → 正方形（1:1）
- 無圖片 → 長方形（寬 > 高）

### 決策點 [12]：驗證和調整

```javascript
// 檢查 1：卡片尺寸過小
if (cardSize < minSize && optimalCols < itemCount) {
    optimalCols++;
    optimalRows = Math.ceil(itemCount / optimalCols);
    // 重新計算卡片尺寸
}

// 檢查 2：行數超限
if (optimalRows > maxPossibleRows && optimalCols < itemCount) {
    optimalCols++;
    optimalRows = Math.ceil(itemCount / optimalCols);
    // 重新計算卡片尺寸
}

// 檢查 3：卡片超出邊界
const totalWidth = optimalCols * cardWidth + (optimalCols - 1) * horizontalSpacing;
const totalHeight = optimalRows * cardHeight + (optimalRows - 1) * verticalSpacing;

if (totalWidth > availableWidth || totalHeight > availableHeight) {
    // 調整卡片尺寸
}
```

---

## 📊 決策表

### 設備類型決策表

| 寬度 | 高度 | 寬高比 | 設備類型 | 列數 | 模式 |
|------|------|--------|---------|------|------|
| < 768 | > 768 | < 1 | mobile-portrait | 5 | compact |
| > 768 | < 500 | > 1.5 | mobile-landscape | 5 | compact |
| 768-1024 | > 768 | < 1 | tablet-portrait | 動態 | desktop |
| 768-1024 | < 768 | > 1 | tablet-landscape | 動態 | desktop |
| > 1024 | > 768 | > 1 | desktop | 動態 | desktop |

### 寬高比決策表

| 寬高比 | 螢幕類型 | 最大列數 | 說明 |
|--------|---------|---------|------|
| > 2.0 | 超寬（21:9） | 10 | 超寬螢幕 |
| 1.5-2.0 | 寬（16:9） | 10 | 標準寬螢幕 |
| 1.2-1.5 | 標準（4:3） | 8 | 標準螢幕 |
| < 1.2 | 直向（9:16） | 5 | 直向螢幕 |

### 卡片尺寸決策表

| 卡片類型 | 寬度計算 | 高度計算 | 文字高度 |
|---------|--------|--------|---------|
| 正方形 | 基於寬度 | 基於高度 | cardHeight × 0.4 |
| 長方形 | 充分利用 | 單元高度 × 0.6 | 固定 30px |

---

## 🎯 優化建議

### 1. 快速路徑（Fast Path）

```javascript
// 對於常見設備類型，使用預計算的配置
if (deviceType === 'desktop' && !isFullscreen) {
    // 直接使用預設配置，跳過複雜計算
    return PRESET_DESKTOP_CONFIG;
}
```

### 2. 緩存策略

```javascript
// 緩存計算結果，避免重複計算
const cache = new Map();
const cacheKey = `${width}x${height}x${itemCount}x${hasImages}`;

if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
}

const result = calculateCardSize(...);
cache.set(cacheKey, result);
return result;
```

### 3. 增量更新

```javascript
// 只在必要時重新計算
if (newWidth === oldWidth && newHeight === oldHeight) {
    // 尺寸未變，不需要重新計算
    return oldResult;
}
```

---

## 🧪 測試決策樹

### 測試用例 1：手機直向

```
輸入：width=375, height=667, itemCount=12, hasImages=true
預期路徑：[1]→[2]→[3]→[4]→mobile-portrait→[5]→[6]→[7]→[8]→[9]→5列→[10]→3行→[11]→正方形→[12]→驗證通過→[13]→[14]→[15]
```

### 測試用例 2：桌面全螢幕

```
輸入：width=1920, height=1080, itemCount=20, hasImages=false, isFullscreen=true
預期路徑：[1]→[2]→[3]→[4]→desktop→[5]→[6]調整→[7]→[8]→[9]→動態列數→[10]→計算行數→[11]→長方形→[12]→驗證通過→[13]→[14]→[15]
```

---

## ✅ 驗證清單

- [ ] 所有決策點都有明確的判斷條件
- [ ] 所有分支都有對應的處理邏輯
- [ ] 所有邊界情況都被考慮
- [ ] 所有計算結果都被驗證
- [ ] 所有特殊情況都被處理
- [ ] 所有測試用例都通過

