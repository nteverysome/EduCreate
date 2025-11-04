# iPhone 14 直向垂直距離計算（智能文字高度版）

## 🎯 核心公式

```
totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing
```

**關鍵差異**：
- ❌ 舊方式：`chineseTextHeight = finalCardHeight * 0.4`（固定40%）
- ✅ 新方式：`chineseTextHeight` 根據文字內容**智能計算**（可變）

---

## 📐 iPhone 14 直向（390×844px）- 5列計算步驟

### 第一步：檢測設備和模式
```
- 設備寬度：390px < 768px → 手機設備
- 設備高度：844px > 390px → 直向
- 模式：緊湊模式（compact mode）
- 列數：5列
- 卡片類型：假設有圖片（正方形）
```

### 第二步：計算可用空間
```javascript
// 根據 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md
const sideMargin = 20;  // 手機直向邊距
const topButtonArea = 40;
const bottomButtonArea = 40;

const availableWidth = 390 - 20 * 2 = 350px
const availableHeight = 844 - 40 - 40 = 764px
```

### 第三步：計算垂直間距
```javascript
// 根據 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md
// 垂直間距 = 可用高度的 3%，範圍 10-40px
const verticalSpacing = Math.max(10, Math.min(40, 764 * 0.03));
// = Math.max(10, Math.min(40, 22.92))
// = 22.92px ≈ 23px
```

### 第四步：計算列數和行數
```javascript
const itemCount = 20;
const cols = 5;
const rows = Math.ceil(20 / 5) = 4;
```

### 第五步：計算卡片高度
```javascript
// 根據 IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md
// 正方形模式計算

// 基於高度計算
const availableHeightPerRow = (764 - 23 * (4 + 1)) / 4;
// = (764 - 115) / 4
// = 649 / 4
// = 162.25px

const squareSizeByHeight = (162.25 - 23) / 1.4;
// = 139.25 / 1.4
// = 99.46px

// 基於寬度計算
const horizontalSpacing = Math.max(10, Math.min(30, 350 * 0.02));
// = Math.max(10, Math.min(30, 7))
// = 10px

const squareSizeByWidth = (350 - 10 * (5 + 1)) / 5;
// = (350 - 60) / 5
// = 290 / 5
// = 58px

// 取較小值
let squareSize = Math.min(99.46, 58) = 58px

// 確保在合理範圍內
const minSquareSize = 150;  // 非全螢幕
finalCardHeight = Math.max(150, Math.min(300, 58)) = 150px
```

### 第六步：計算中文文字高度（智能計算）
```javascript
// 根據 INTELLIGENT_TEXT_HEIGHT_CALCULATION.md
// 不再使用固定的 40%，而是智能計算

// 可用高度 = finalCardHeight = 150px
const textHeight = 150px;

// 初始字體大小（基於高度的 60%）
let fontSize = Math.max(14, Math.min(48, 150 * 0.6));
// = Math.max(14, Math.min(48, 90))
// = 48px（達到最大值）

// 計算最大寬度和高度限制
const maxTextWidth = 150 * 0.85 = 127.5px;
const maxTextHeight = 150 * 0.9 = 135px;

// 假設文字是 "機器人"（3個字）
// 測試字體大小 48px 時的實際尺寸
// 實際寬度 ≈ 120px（3個字 × 40px）
// 實際高度 ≈ 50px

// 檢查是否超過限制
// 120px < 127.5px ✅ 寬度OK
// 50px < 135px ✅ 高度OK

// 最終字體大小：48px
// 最終文字高度：50px
chineseTextHeight = 50px
```

### 第七步：計算單元總高度
```javascript
totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing
               = 150 + 50 + 23
               = 223px
```

---

## 📊 計算結果對比

### ❌ 舊方式（固定40%）
```
卡片高度：65px
文字高度：65 * 0.4 = 26px
間距：3px
總垂直距離：65 + 26 + 3 = 94px
```

### ✅ 新方式（智能計算）
```
卡片高度：150px（根據可用空間計算）
文字高度：50px（根據文字內容智能計算）
間距：23px（可用高度的3%）
總垂直距離：150 + 50 + 23 = 223px
```

---

## 🔑 關鍵要點

### 1. 文字高度不再固定
- ❌ 不是 `cardHeight * 0.4`
- ✅ 根據文字內容和可用空間動態計算
- ✅ 初始字體 = `height * 0.6`（基於可用高度）
- ✅ 如果超過邊界則自動縮小字體

### 2. 垂直間距基於可用高度
- 公式：`verticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03))`
- 範圍：10-40px
- 不是固定的 3px

### 3. 卡片高度基於可用空間
- 不是固定的 65px
- 根據列數、行數、可用寬度和高度動態計算
- 最小值：150px（非全螢幕）

---

**最後更新**：2025-11-02
**版本**：v2.0 - 智能文字高度版本
**基於**：IMPROVED_MIXED_MODE_LAYOUT_CALCULATION.md + INTELLIGENT_TEXT_HEIGHT_CALCULATION.md

