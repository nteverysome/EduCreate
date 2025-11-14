# 上下容器間距控制函數完整指南

## 🎯 核心概念

上下容器之間的垂直間距由以下因素決定：

```
總屏幕高度 (height)
    ↓
├─ 頂部按鈕區域 (topButtonArea)
├─ 上方容器 (cardHeight)
├─ 垂直間距 (verticalSpacing) ← 🔴 這是上下容器之間的距離
├─ 下方容器 (cardHeight)
└─ 底部按鈕區域 (bottomButtonArea)
```

---

## 🔴 直接控制上下容器間距的函數

### 1️⃣ createTopBottomSingleRow() - 上下單行佈局

**位置**: L2523  
**用途**: 7 個匹配數的上下單行佈局

**關鍵變數**:
```javascript
// L2551 - 垂直間距比例
const verticalSpacingRatio = 0.01;  // 🔥 控制間距的關鍵參數

// L2552 - 計算垂直間距
const idealVerticalSpacing = idealCardHeight * verticalSpacingRatio;

// L2563 或 L2572 - 應用垂直間距
verticalSpacing = idealVerticalSpacing;  // 理想尺寸
verticalSpacing = cardHeight * verticalSpacingRatio;  // 縮放模式

// L2597-2598 - 計算上下容器位置
const topY = topButtonArea + cardHeight / 2;
const bottomY = topY + cardHeight + verticalSpacing + cardHeight / 2;
```

**調整方法**:
```javascript
// 要減少上下容器間距，修改 verticalSpacingRatio
const verticalSpacingRatio = 0.01;  // 當前值：1%
// 改為：
const verticalSpacingRatio = 0.005;  // 新值：0.5%（減少 50%）
```

---

### 2️⃣ createTopBottomTwoRows() - 上下雙行佈局

**位置**: L2265  
**用途**: 8-14 個匹配數的上下雙行佈局

**關鍵變數**:
```javascript
// L2308 - 英文卡片垂直間距
const topVerticalSpacing = Math.max(5, height * 0.02);

// L2311 - 中文卡片垂直間距
const bottomVerticalSpacing = textHeight;

// L2315 - 上方區域起始位置
const topAreaStartY = height * 0.12;

// L2319 - 下方區域起始位置
const bottomAreaStartY = height * 0.55;  // 🔥 控制上下容器距離的關鍵
```

**調整方法**:
```javascript
// 要減少上下容器間距，修改 bottomAreaStartY
const bottomAreaStartY = height * 0.55;  // 當前值：55%
// 改為：
const bottomAreaStartY = height * 0.50;  // 新值：50%（更靠近上方）
```

---

### 3️⃣ createTopBottomMultiRows() - 上下多行佈局

**位置**: L2660  
**用途**: 15+ 個匹配數的上下多行佈局

**關鍵變數**:
```javascript
// L2682-2684 - 上下容器位置
const topY = positions.leftStartY;      // 上方容器 Y 位置
const bottomY = positions.rightStartY;  // 下方容器 Y 位置

// 間距 = bottomY - topY - cardHeight
const verticalSpacing = bottomY - topY - cardHeight;
```

**調整方法**:
```javascript
// 通過修改 positions 計算來調整間距
// 在 SeparatedMarginConfig 中修改 calculateTopOffsetForSeparated()
```

---

## 🟡 間接控制上下容器間距的函數

### 4️⃣ calculateAvailableHeight() - 計算可用高度

**位置**: L759-761, L2534  
**用途**: 計算扣除按鈕區域後的可用高度

```javascript
const topButtonArea = isCompactMode ? 50 : 60;
const bottomButtonArea = isCompactMode ? 50 : 60;
const availableHeight = height - topButtonArea - bottomButtonArea;
```

**影響**: 可用高度越小 → 上下容器間距越小

---

### 5️⃣ bottomButtonArea - 底部按鈕區域

**位置**: L2533  
**用途**: 為提交按鈕預留的空間

```javascript
const bottomButtonArea = 80;  // 🔥 [v57.0] 從 60px 增加到 80px
```

**影響**: 
- 增加 bottomButtonArea → 下方容器向上移動 → 上下容器間距減少
- 減少 bottomButtonArea → 下方容器向下移動 → 上下容器間距增加

---

### 6️⃣ topButtonArea - 頂部按鈕區域

**位置**: L2532  
**用途**: 計時器和頂部邊距

```javascript
const timerHeight = 50;
const timerGap = 20;
const additionalTopMargin = 90;
const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 160px
```

**影響**:
- 增加 topButtonArea → 上方容器向下移動 → 上下容器間距增加
- 減少 topButtonArea → 上方容器向上移動 → 上下容器間距減少

---

## 📊 間距計算公式

### 上下單行佈局 (createTopBottomSingleRow)

```
上方容器 Y 位置 (topY) = topButtonArea + cardHeight / 2
下方容器 Y 位置 (bottomY) = topY + cardHeight + verticalSpacing + cardHeight / 2

上下容器間距 = bottomY - topY - cardHeight
            = verticalSpacing
            = cardHeight * verticalSpacingRatio
```

### 上下雙行佈局 (createTopBottomTwoRows)

```
上方區域起始 Y = height * 0.12
下方區域起始 Y = height * 0.55

上下容器間距 = (height * 0.55) - (height * 0.12) - (上方區域總高度)
```

---

## 🎮 實時調整指南

### 場景 1：減少上下容器間距

**修改位置**: L2551 (createTopBottomSingleRow)

```javascript
// 修改前
const verticalSpacingRatio = 0.01;  // 1%

// 修改後
const verticalSpacingRatio = 0.005;  // 0.5%
```

**效果**: 間距從 ~2.2px 減少到 ~1.1px

---

### 場景 2：增加上下容器間距

**修改位置**: L2533 (bottomButtonArea)

```javascript
// 修改前
const bottomButtonArea = 80;

// 修改後
const bottomButtonArea = 60;  // 減少底部空間 → 下方容器向下移動
```

**效果**: 上下容器間距增加

---

### 場景 3：調整上方容器位置

**修改位置**: L2532 (topButtonArea)

```javascript
// 修改前
const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 160px

// 修改後
const additionalTopMargin = 70;  // 從 90 改為 70
const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 140px
```

**效果**: 上方容器向上移動 → 上下容器間距增加

---

## 📈 所有相關變數一覽

| 變數 | 位置 | 當前值 | 說明 |
|------|------|--------|------|
| `verticalSpacingRatio` | L2551 | 0.01 | 上下容器間距比例 |
| `bottomButtonArea` | L2533 | 80px | 底部按鈕區域 |
| `topButtonArea` | L2532 | 160px | 頂部按鈕區域 |
| `additionalTopMargin` | L2531 | 90px | 額外上方邊距 |
| `timerHeight` | L2529 | 50px | 計時器高度 |
| `timerGap` | L2530 | 20px | 計時器下方間距 |

---

**最後更新**: 2025-01-14  
**版本**: v1.0  
**狀態**: ✅ 完整說明

