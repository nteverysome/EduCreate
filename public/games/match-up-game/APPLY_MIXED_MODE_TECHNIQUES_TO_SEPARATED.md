# 將混合模式技術應用到分離模式 - 實施指南

## 概述

本指南展示如何將混合模式中的先進響應式設計技術應用到分離模式，以實現更好的適應性和視覺效果。

---

## 改進 1：添加文字長度調整

### 當前分離模式代碼（第 5645-5680 行）
```javascript
createTextElement(container, text, x, y, width, height) {
    let fontSize = contentSizes
        ? contentSizes.text.fontSize
        : Math.max(14, Math.min(48, height * 0.6));

    const tempText = this.add.text(0, 0, text, {
        fontSize: `${fontSize}px`,
        fontFamily: 'Arial'
    });

    const maxTextWidth = width * 0.85;
    while (tempText.width > maxTextWidth && fontSize > 12) {
        fontSize -= 2;
        tempText.setFontSize(fontSize);
    }
    // ...
}
```

### 改進方案（參考混合模式第 3922-3932 行）
```javascript
createTextElement(container, text, x, y, width, height) {
    let fontSize = contentSizes
        ? contentSizes.text.fontSize
        : Math.max(14, Math.min(48, height * 0.6));

    // 🔥 新增：根據文字長度調整字體大小
    const textLength = text ? text.length : 0;
    let fontSizeMultiplier = 1.0;
    
    if (textLength <= 2) {
        fontSizeMultiplier = 1.0;   // 1-2 字：100%
    } else if (textLength <= 4) {
        fontSizeMultiplier = 0.85;  // 3-4 字：85%
    } else if (textLength <= 6) {
        fontSizeMultiplier = 0.75;  // 5-6 字：75%
    } else {
        fontSizeMultiplier = 0.65;  // 7+ 字：65%
    }
    
    fontSize = Math.max(12, fontSize * fontSizeMultiplier);

    const tempText = this.add.text(0, 0, text, {
        fontSize: `${fontSize}px`,
        fontFamily: 'Arial'
    });

    // 🔥 改進：逐像素調整而不是逐 2px
    const maxTextWidth = width * 0.85;
    while (tempText.width > maxTextWidth && fontSize > 12) {
        fontSize -= 1;  // 改為 -1 而不是 -2
        tempText.setFontSize(fontSize);
    }
    // ...
}
```

---

## 改進 2：添加動態邊距調整

### 當前分離模式代碼（第 5403-5408 行）
```javascript
createCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId) {
    // ...
    const textAreaHeight = height * 0.3;
    const bottomPadding = Math.max(6, height * 0.06);
    // ...
}
```

### 改進方案（參考混合模式第 3825-3847 行）
```javascript
createCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId) {
    // ...
    
    // 🔥 新增：根據卡片高度動態調整邊距
    let bottomPadding;
    let verticalSpacing;
    
    if (height < 50) {
        // 小卡片：最小邊距
        bottomPadding = 3;
        verticalSpacing = 2;
    } else if (height < 80) {
        // 中卡片：標準邊距
        bottomPadding = 6;
        verticalSpacing = 3;
    } else {
        // 大卡片：較大邊距
        bottomPadding = 8;
        verticalSpacing = 4;
    }
    
    const textAreaHeight = height * 0.3;
    const textHeight = textAreaHeight - bottomPadding;
    // ...
}
```

---

## 改進 3：根據卡片大小調整按鈕大小

### 當前分離模式代碼（第 5378-5380 行）
```javascript
const buttonSize = this.currentPageItemCount === 20
    ? Math.max(12, Math.min(24, buttonAreaHeight * 0.35))
    : Math.max(14, Math.min(28, buttonAreaHeight * 0.45));
```

### 改進方案（參考混合模式第 3825-3847 行）
```javascript
// 🔥 新增：根據卡片高度調整按鈕大小比例
let buttonSizeRatio;
let minButtonSize;
let maxButtonSize;

if (height < 50) {
    // 小卡片：更小的按鈕
    buttonSizeRatio = 0.35;
    minButtonSize = 10;
    maxButtonSize = 20;
} else if (height < 80) {
    // 中卡片：標準按鈕
    buttonSizeRatio = 0.45;
    minButtonSize = 14;
    maxButtonSize = 28;
} else {
    // 大卡片：更大的按鈕
    buttonSizeRatio = 0.50;
    minButtonSize = 18;
    maxButtonSize = 32;
}

const buttonSize = Math.max(minButtonSize, Math.min(maxButtonSize, buttonAreaHeight * buttonSizeRatio));
```

---

## 改進 4：添加響應式檢測

### 新增函數（參考混合模式第 3699-3733 行）
```javascript
// 在 createLeftCard 或 createCardLayoutA 中添加
detectResponsiveMode(width, height) {
    const isMobileDevice = width < 768;
    const isPortraitMode = height > width;
    const isLandscapeMode = width > height;
    const isLandscapeMobile = isLandscapeMode && height < 500;
    const isTinyHeight = height < 400;
    
    const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;
    const isPortraitCompactMode = isMobileDevice && isPortraitMode;
    const isLandscapeCompactMode = isLandscapeMobile || isTinyHeight;
    
    return {
        isMobileDevice,
        isPortraitMode,
        isLandscapeMode,
        isCompactMode,
        isPortraitCompactMode,
        isLandscapeCompactMode
    };
}
```

### 在佈局函數中使用
```javascript
createCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId) {
    // 🔥 新增：檢測響應式模式
    const responsive = this.detectResponsiveMode(width, height);
    
    // 根據模式調整內容
    if (responsive.isCompactMode) {
        // 緊湊模式：減少間距和邊距
        // ...
    } else {
        // 正常模式：標準間距和邊距
        // ...
    }
}
```

---

## 改進 5：統一的字體大小計算器

### 創建工具類
```javascript
class SeparatedModeFontSizeCalculator {
    /**
     * 計算最優字體大小
     * @param {number} containerHeight - 容器高度
     * @param {string} text - 文字內容
     * @param {number} containerWidth - 容器寬度
     * @returns {number} 最優字體大小
     */
    static calculate(containerHeight, text, containerWidth) {
        // 層 1：基礎字體大小
        let fontSize = Math.max(14, Math.min(48, containerHeight * 0.6));
        
        // 層 2：根據文字長度調整
        const textLength = text ? text.length : 0;
        const adjustments = {
            1: 1.0,
            2: 1.0,
            3: 0.85,
            4: 0.80,
            5: 0.75,
            6: 0.70,
            default: 0.65
        };
        
        const adjustment = adjustments[textLength] || adjustments.default;
        fontSize = Math.max(12, fontSize * adjustment);
        
        // 層 3：測量實際寬度，逐像素調整
        const tempText = new Phaser.GameObjects.Text(this.scene, 0, 0, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial'
        });
        
        const maxTextWidth = (containerWidth - 10) * 0.85;
        while (tempText.width > maxTextWidth && fontSize > 12) {
            fontSize -= 1;
            tempText.setFontSize(fontSize);
        }
        
        tempText.destroy();
        return fontSize;
    }
}
```

### 在代碼中使用
```javascript
createTextElement(container, text, x, y, width, height) {
    const fontSize = SeparatedModeFontSizeCalculator.calculate(height, text, width);
    
    const cardText = this.add.text(x, y, text, {
        fontSize: `${fontSize}px`,
        color: '#333333',
        fontFamily: 'Arial'
    });
    cardText.setOrigin(0.5);
    container.add(cardText);
}
```

---

## 實施優先級

### 🔴 高優先級（立即實施）
1. **改進 1**：添加文字長度調整
2. **改進 2**：添加動態邊距調整

### 🟡 中優先級（下一個版本）
1. **改進 3**：根據卡片大小調整按鈕大小
2. **改進 5**：統一的字體大小計算器

### 🟢 低優先級（後續版本）
1. **改進 4**：添加響應式檢測

---

## 測試計劃

### 測試場景
1. **小卡片**（高度 < 50px）
   - 驗證文字是否正確縮小
   - 驗證邊距是否合理

2. **中卡片**（高度 50-80px）
   - 驗證所有內容是否協調
   - 驗證按鈕是否合理大小

3. **大卡片**（高度 > 80px）
   - 驗證內容是否充分利用空間
   - 驗證文字是否過大

### 驗證清單
- [ ] 文字始終在卡片內
- [ ] 按鈕始終可點擊
- [ ] 圖片始終清晰
- [ ] 整體佈局協調
- [ ] 不同設備上表現一致

---

## 參考資源

- `CODE_COMPARISON_MIXED_VS_SEPARATED.md` - 代碼對比
- `MIXED_VS_SEPARATED_DESIGN_ANALYSIS.md` - 設計分析
- `SEPARATED_MODE_IMPROVEMENT_ROADMAP.md` - 改進路線圖

