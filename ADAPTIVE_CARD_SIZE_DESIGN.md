# 🎴 自適應卡片大小設計方案 (3-20 對卡片)

## 📋 目錄
1. [需求分析](#需求分析)
2. [設計原理](#設計原理)
3. [計算公式](#計算公式)
4. [實現方案](#實現方案)
5. [測試策略](#測試策略)

---

## 🎯 需求分析

### 當前狀況
- 固定配置：每頁 3 對卡片
- 配置文件：`separated-mode-config.js`
- 計算器：`SeparatedLayoutCalculator`

### 新需求
- 支持 3-20 對卡片
- 根據「每頁匹配數」選項動態調整
- 卡片大小自動適應
- 保持良好的用戶體驗

### 關鍵約束
- 卡片不能超出容器邊界
- 卡片大小在可接受範圍內 (min-max)
- 文字和圖片能正確顯示
- 在所有設備上都能正常工作

---

## 🔧 設計原理

### 1. 卡片高度計算

```
可用高度 = 容器高度 - 頂部邊距 - 底部邊距
總間距高度 = (卡片數 - 1) × 垂直間距
卡片高度 = (可用高度 - 總間距高度) / 卡片數
最終高度 = clamp(卡片高度, min, max)
```

### 2. 卡片寬度計算

```
寬高比 = 配置寬度比 / 配置高度比
卡片寬度 = 最終高度 × 寬高比
最終寬度 = clamp(卡片寬度, min, max)
```

### 3. 邊距動態調整

```
當卡片數 ≤ 5：使用基礎邊距
當卡片數 > 5：邊距 = max(最小邊距, 基礎邊距 - (卡片數 - 5) × 減少因子)
```

### 4. 間距動態調整

```
當卡片數 ≤ 5：使用基礎間距
當卡片數 > 5：間距 = max(最小間距, 基礎間距 - (卡片數 - 5) × 減少因子)
```

---

## 📐 計算公式

### 邊距計算公式

```javascript
function calculateMargin(baseMargin, itemCount, minMargin = 10) {
    if (itemCount <= 5) {
        return baseMargin;
    }
    
    // 每增加 1 對卡片，邊距減少 2px
    const reductionFactor = 2;
    const reduction = (itemCount - 5) * reductionFactor;
    
    return Math.max(minMargin, baseMargin - reduction);
}
```

### 間距計算公式

```javascript
function calculateSpacing(baseSpacing, itemCount, minSpacing = 2) {
    if (itemCount <= 5) {
        return baseSpacing;
    }
    
    // 每增加 1 對卡片，間距減少 0.5px
    const reductionFactor = 0.5;
    const reduction = (itemCount - 5) * reductionFactor;
    
    return Math.max(minSpacing, baseSpacing - reduction);
}
```

### 卡片高度計算公式

```javascript
function calculateCardHeight(containerHeight, itemCount, baseMargin, baseSpacing) {
    const topMargin = calculateMargin(baseMargin, itemCount);
    const bottomMargin = calculateMargin(baseMargin, itemCount);
    const verticalSpacing = calculateSpacing(baseSpacing, itemCount);
    
    const availableHeight = containerHeight - topMargin - bottomMargin;
    const totalSpacingHeight = (itemCount - 1) * verticalSpacing;
    const cardHeight = (availableHeight - totalSpacingHeight) / itemCount;
    
    return cardHeight;
}
```

---

## 🛠️ 實現方案

### 修改 SeparatedLayoutCalculator

需要在 `calculateCardSize()` 方法中添加 itemCount 參數：

```javascript
calculateCardSize(itemCount) {
    const config = SeparatedModeConfig.get(this.deviceType);
    
    // 計算動態邊距和間距
    const topMargin = this.calculateMargin(config.margins.top, itemCount);
    const bottomMargin = this.calculateMargin(config.margins.bottom, itemCount);
    const verticalSpacing = this.calculateSpacing(config.spacing.vertical, itemCount);
    
    // 計算可用高度
    const availableHeight = this.height - topMargin - bottomMargin;
    const totalSpacingHeight = (itemCount - 1) * verticalSpacing;
    
    // 計算卡片高度
    let cardHeight = (availableHeight - totalSpacingHeight) / itemCount;
    cardHeight = Math.max(config.cardHeight.min, 
                         Math.min(config.cardHeight.max, cardHeight));
    
    // 計算卡片寬度
    const widthHeightRatio = config.cardWidth.ratio / config.cardHeight.ratio;
    let cardWidth = cardHeight * widthHeightRatio;
    cardWidth = Math.max(config.cardWidth.min, 
                        Math.min(config.cardWidth.max, cardWidth));
    
    return { width: cardWidth, height: cardHeight };
}
```

### 添加輔助方法

```javascript
calculateMargin(baseMargin, itemCount, minMargin = 10) {
    if (itemCount <= 5) return baseMargin;
    const reduction = (itemCount - 5) * 2;
    return Math.max(minMargin, baseMargin - reduction);
}

calculateSpacing(baseSpacing, itemCount, minSpacing = 2) {
    if (itemCount <= 5) return baseSpacing;
    const reduction = (itemCount - 5) * 0.5;
    return Math.max(minSpacing, baseSpacing - reduction);
}
```

---

## 🧪 測試策略

### 測試用例

| 卡片數 | 預期高度 | 預期寬度 | 邊距 | 間距 |
|--------|---------|---------|------|------|
| 3 | 基礎 | 基礎 | 基礎 | 基礎 |
| 4 | 減少 | 減少 | 基礎 | 基礎 |
| 5 | 減少 | 減少 | 基礎 | 基礎 |
| 10 | 更小 | 更小 | 減少 | 減少 |
| 15 | 最小 | 最小 | 更小 | 更小 |
| 20 | 最小 | 最小 | 最小 | 最小 |

### 驗證點

1. ✅ 卡片不超出容器邊界
2. ✅ 卡片大小在 [min, max] 範圍內
3. ✅ 所有卡片都能顯示
4. ✅ 文字能正確顯示
5. ✅ 圖片能正確顯示
6. ✅ 在不同設備上都能正常工作

---

## 📊 預期效果

### 空間利用率

| 卡片數 | 利用率 | 說明 |
|--------|-------|------|
| 3 | ~60% | 基礎配置 |
| 5 | ~75% | 優化配置 |
| 10 | ~85% | 緊湊配置 |
| 15 | ~90% | 超緊湊配置 |
| 20 | ~92% | 最大利用 |

### 卡片大小變化

```
3 對：  ████████ (100%)
4 對：  ███████  (87%)
5 對：  ██████   (75%)
10 對： ███      (37%)
15 對： ██       (25%)
20 對： █        (12%)
```

---

## 🚀 實現步驟

1. **修改 SeparatedLayoutCalculator**
   - 添加 `calculateMargin()` 方法
   - 添加 `calculateSpacing()` 方法
   - 修改 `calculateCardSize()` 方法

2. **更新 game.js**
   - 傳遞 itemCount 到計算器
   - 使用動態計算的卡片大小

3. **添加測試用例**
   - 為 3, 4, 5, 10, 15, 20 對卡片添加測試
   - 驗證所有邊界情況

4. **視覺驗證**
   - 在瀏覽器中測試不同卡片數
   - 確保用戶體驗良好

