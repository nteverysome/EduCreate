# 卡片與卡片之間的垂直距離計算分析（智能文字高度版）

## 🎯 核心概念

**垂直距離 = 單元總高度（totalUnitHeight）**

每個卡片單元包含三個部分：
1. **英文卡片高度** (`finalCardHeight`)
2. **中文文字高度** (`chineseTextHeight`) - **智能計算**
3. **垂直間距** (`verticalSpacing`)

---

## 📐 計算公式

### 完整公式
```javascript
totalUnitHeight = finalCardHeight + chineseTextHeight + verticalSpacing
```

### 關鍵差異
- ❌ **舊方式**：`chineseTextHeight = finalCardHeight * 0.4`（固定40%）
- ✅ **新方式**：`chineseTextHeight` 根據文字內容**智能計算**（可變）

---

## 🔍 各部分詳細計算

### 1️⃣ 英文卡片高度（cardHeightInFrame）

#### 緊湊模式（手機直向）- 根據列數動態調整
```javascript
if (cols === 5) {
    maxCardHeight = hasImages ? 65 : 50;  // 5列：65px（有圖）或50px（無圖）
} else if (cols === 4) {
    maxCardHeight = hasImages ? 75 : 60;  // 4列：75px（有圖）或60px（無圖）
} else if (cols === 3) {
    maxCardHeight = hasImages ? 85 : 70;  // 3列：85px（有圖）或70px（無圖）
} else {
    maxCardHeight = hasImages ? 95 : 80;  // 2列或更少：95px（有圖）或80px（無圖）
}
```

#### 桌面模式（正方形卡片）
```javascript
// 基於高度計算
const availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
const squareSizeByHeight = (availableHeightPerRow - verticalSpacing) / 1.4;

// 基於寬度計算
const squareSizeByWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

// 取較小值
cardHeightInFrame = Math.min(squareSizeByHeight, squareSizeByWidth);
```

#### 桌面模式（長方形卡片）
```javascript
const availableHeightPerRow = (availableHeight - verticalSpacing * (rows + 1)) / rows;
cardHeightInFrame = (availableHeightPerRow - verticalSpacing) / 1.4;
```

---

### 2️⃣ 中文文字高度（chineseTextHeight）- 🔥 智能計算

#### 智能計算流程（INTELLIGENT_TEXT_HEIGHT_CALCULATION.md）

```javascript
// 🔥 第一步：初始字體大小（基於可用高度的 60%）
let fontSize = Math.max(14, Math.min(48, height * 0.6));

// 🔥 第二步：計算最大寬度和高度限制
const maxTextWidth = width * 0.85;      // 留 15% 邊距
const maxTextHeight = height * 0.9;     // 留 10% 邊距

// 🔥 第三步：創建臨時文字測量實際尺寸
const tempText = this.add.text(0, 0, text, {
    fontSize: `${fontSize}px`,
    fontFamily: 'Arial'
});

// 🔥 第四步：雙重檢查 - 如果超過限制則縮小字體
while ((tempText.width > maxTextWidth || tempText.height > maxTextHeight) && fontSize > 12) {
    fontSize -= 2;
    tempText.setFontSize(fontSize);
}

// 🔥 第五步：記錄最終的文字高度
const finalTextHeight = tempText.height;  // ← 這是實際的文字高度
```

#### 智能計算的優勢
- ✅ **動態適應** - 根據實際文字內容調整
- ✅ **寬度檢查** - 確保文字不超出邊界
- ✅ **高度檢查** - 確保文字在垂直空間內
- ✅ **可讀性** - 最小字體 12px，最大 48px

#### 緊湊模式的基礎值（用於初始估算）
```javascript
// 5列：18px（基礎值，實際會智能調整）
// 4列：20px（基礎值，實際會智能調整）
// 3列：22px（基礎值，實際會智能調整）
// 2列或更少：24px（基礎值，實際會智能調整）
```

---

### 3️⃣ 垂直間距（verticalSpacing）

#### 緊湊模式（手機直向）- 根據列數設置
```javascript
if (cols === 5) {
    verticalSpacingBase = 3;  // 5列：3px
} else if (cols === 4) {
    verticalSpacingBase = 3;  // 4列：3px
} else if (cols === 3) {
    verticalSpacingBase = 4;  // 3列：4px
} else {
    verticalSpacingBase = 5;  // 2列或更少：5px
}
```

#### 桌面模式（正方形和長方形）
```javascript
// 基於螢幕高度的 4%，範圍 40-80px
verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
```

#### 分離模式
```javascript
// 基於可用高度動態計算
verticalSpacing = Math.max(3, (availableHeight - totalCardHeight) / (rows + 1));
```

---

## 📊 計算示例

### 示例 1：iPhone 14 直向（390×844px）- 混合模式，5列，20個卡片

```
第一步：檢測設備和模式
- 設備：手機直向（390 < 768）
- 模式：緊湊模式
- 列數：5列
- 卡片類型：假設有圖片（正方形）
- 中文文字：例如 "機器人"（3個字）

第二步：計算卡片高度
- maxCardHeight = 65px（5列，有圖片）

第三步：計算中文文字高度（🔥 智能計算）
- 可用寬度：65 * 0.85 = 55.25px
- 可用高度：65 * 0.9 = 58.5px
- 初始字體大小：max(14, min(48, 65 * 0.6)) = max(14, min(48, 39)) = 39px
- 測試文字 "機器人"：
  - 39px 字體寬度 ≈ 117px（超過 55.25px）→ 縮小
  - 37px 字體寬度 ≈ 111px（超過 55.25px）→ 縮小
  - 35px 字體寬度 ≈ 105px（超過 55.25px）→ 縮小
  - ...
  - 18px 字體寬度 ≈ 54px（符合 55.25px）✅
  - 18px 字體高度 ≈ 21px（符合 58.5px）✅
- 最終：chineseTextHeight ≈ 21px（智能計算結果）

第四步：計算垂直間距
- verticalSpacingBase = 3px（5列）

第五步：計算單元總高度
- totalUnitHeight = 65 + 21 + 3 = 89px

結果：
- 卡片之間的垂直距離 = 89px（而不是固定的 94px）
- 每行佔用高度 = 89px
- 5行卡片總高度 = 89 * 5 = 445px
- 節省空間：470 - 445 = 25px（相比固定計算）
```

### 示例 2：桌面版（1440×900px）- 混合模式，正方形卡片，20個卡片

```
第一步：檢測設備和模式
- 設備：桌面版（1440 > 1024）
- 模式：桌面模式
- 卡片類型：正方形（有圖片）

第二步：計算垂直間距
- verticalSpacing = max(40, min(80, 900 * 0.04)) = max(40, min(80, 36)) = 40px

第三步：計算可用高度
- availableHeight = 900 - 80 - 80 = 740px

第四步：計算卡片高度
- 假設 4 行，5 列
- availableHeightPerRow = (740 - 40 * 5) / 4 = 135px
- squareSizeByHeight = (135 - 40) / 1.4 = 67.9px
- squareSizeByWidth = (1280 - 30 * 6) / 5 = 246px
- cardHeightInFrame = min(67.9, 246) = 67.9px ≈ 68px

第五步：計算中文文字高度
- chineseTextHeight = 68 * 0.4 = 27.2px ≈ 27px

第六步：計算單元總高度
- totalUnitHeight = 68 + 27 + 40 = 135px

結果：
- 卡片之間的垂直距離 = 135px
- 每行佔用高度 = 135px
- 4行卡片總高度 = 135 * 4 = 540px
```

---

## 🎯 關鍵要點

### ✅ 垂直距離的三個組成部分
1. **英文卡片** - 主要內容區域（固定值）
2. **中文文字** - 翻譯區域（🔥 智能計算，根據文字內容動態調整）
3. **垂直間距** - 卡片之間的空白（固定值，2-80px）

### ✅ 計算優先級
1. 先計算 `cardHeightInFrame`（基於設備和模式）
2. 再計算 `chineseTextHeight`（🔥 **智能計算**，根據實際文字寬度和高度）
3. 最後計算 `verticalSpacing`（基於設備和模式）
4. 最終 `totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing`

### 🔥 智能計算 vs 固定計算

| 項目 | 固定計算 | 智能計算 |
|------|---------|---------|
| **計算方式** | `chineseTextHeight = cardHeight * 0.4` | 根據實際文字寬度和高度動態調整 |
| **適應性** | 不考慮文字內容 | 根據文字長度自動縮放 |
| **空間利用** | 可能浪費空間 | 充分利用可用空間 |
| **可讀性** | 固定字體大小 | 確保最小 12px，最大 48px |
| **邊界檢查** | 無 | 同時檢查寬度和高度 |
| **示例** | 65px → 26px | 65px → 21px（節省 5px） |

### ✅ 卡片位置計算
```javascript
// Y座標 = 頂部偏移 + 行號 * 單元總高度 + 單元總高度 / 2
const frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;
```

---

## 📍 代碼位置

| 功能 | 行號 | 說明 |
|------|------|------|
| 緊湊模式卡片高度 | 1903-1923 | 根據列數動態調整 |
| 中文文字高度 | 2018, 2274, 2358 | = cardHeightInFrame * 0.4 |
| 垂直間距（緊湊） | 1907, 1912, 1917, 1922 | 3-5px |
| 垂直間距（桌面） | 2149, 2307 | 40-80px |
| 單元總高度 | 2073, 2275, 2360 | = cardHeight + textHeight + spacing |
| 卡片Y座標 | 2526 | = topOffset + row * totalUnitHeight + totalUnitHeight / 2 |

---

**最後更新**：2025-11-02
**版本**：v2.0 - 垂直距離計算分析（加入智能文字高度計算）
**基於**：game.js 實際代碼分析 + INTELLIGENT_TEXT_HEIGHT_CALCULATION.md

## 🔥 v2.0 更新內容

✅ **加入智能文字高度計算**
- 文字高度不再是固定的 `cardHeight * 0.4`
- 根據實際文字寬度和高度動態調整
- 同時檢查寬度和高度限制
- 確保最小 12px，最大 48px 的可讀性

✅ **更新計算示例**
- iPhone 14 示例：89px（而不是 94px）
- 節省 5px 空間（相比固定計算）

✅ **新增對比表格**
- 智能計算 vs 固定計算
- 清晰展示兩種方式的差異

