# 分離模式實現指南 - 業界標準架構

## 🎯 實現目標

將分離模式從當前的 600+ 行複雜代碼重構為 250 行的模塊化系統，提升可維護性和性能。

---

## 📐 Layer 1：設備檢測系統

### DeviceDetector 類

```javascript
class DeviceDetector {
    static getDeviceType(width, height) {
        const aspectRatio = width / height;
        const isPortrait = width < height;
        
        // 預定義斷點
        if (width < 600) {
            return isPortrait ? 'mobile-portrait' : 'mobile-landscape';
        } else if (width < 1024) {
            return isPortrait ? 'tablet-portrait' : 'tablet-landscape';
        } else {
            return 'desktop';
        }
    }
    
    static getScreenSize(width, height) {
        if (height < 600) return 'small';
        if (height < 800) return 'medium';
        return 'large';
    }
    
    static isIPad(width, height) {
        return width >= 768 && width <= 1024 && height >= 600;
    }
}
```

---

## 🎨 Layer 2：設計令牌系統

### SeparatedModeConfig 類

```javascript
class SeparatedModeConfig {
    static CONFIG = {
        'mobile-portrait': {
            cardWidth: { min: 120, max: 200, ratio: 0.18 },
            cardHeight: { min: 40, max: 65, ratio: 0.09 },
            leftX: 0.42,
            rightX: 0.68,
            leftStartY: 0.25,
            rightStartY: 0.22,
            spacing: { horizontal: 10, vertical: 5 },
            margins: { top: 30, bottom: 30, left: 15, right: 15 }
        },
        'mobile-landscape': {
            cardWidth: { min: 100, max: 150, ratio: 0.15 },
            cardHeight: { min: 28, max: 40, ratio: 0.08 },
            leftX: 0.38,
            rightX: 0.70,
            leftStartY: 0.15,
            rightStartY: 0.12,
            spacing: { horizontal: 8, vertical: 3 },
            margins: { top: 20, bottom: 20, left: 10, right: 10 }
        },
        'tablet-portrait': {
            cardWidth: { min: 140, max: 220, ratio: 0.19 },
            cardHeight: { min: 45, max: 72, ratio: 0.095 },
            leftX: 0.44,
            rightX: 0.66,
            leftStartY: 0.30,
            rightStartY: 0.27,
            spacing: { horizontal: 12, vertical: 8 },
            margins: { top: 40, bottom: 40, left: 20, right: 20 }
        },
        'tablet-landscape': {
            cardWidth: { min: 150, max: 250, ratio: 0.2 },
            cardHeight: { min: 50, max: 80, ratio: 0.1 },
            leftX: 0.40,
            rightX: 0.65,
            leftStartY: 0.25,
            rightStartY: 0.22,
            spacing: { horizontal: 15, vertical: 10 },
            margins: { top: 50, bottom: 50, left: 25, right: 25 }
        },
        'desktop': {
            cardWidth: { min: 160, max: 280, ratio: 0.22 },
            cardHeight: { min: 55, max: 90, ratio: 0.12 },
            leftX: 0.35,
            rightX: 0.70,
            leftStartY: 0.20,
            rightStartY: 0.18,
            spacing: { horizontal: 20, vertical: 15 },
            margins: { top: 60, bottom: 60, left: 30, right: 30 }
        }
    };
    
    static get(deviceType) {
        return this.CONFIG[deviceType] || this.CONFIG['mobile-portrait'];
    }
    
    static calculateCardSize(width, height, deviceType) {
        const config = this.get(deviceType);
        const cardConfig = config.cardWidth;
        
        const calculatedWidth = Math.max(
            cardConfig.min,
            Math.min(cardConfig.max, width * cardConfig.ratio)
        );
        
        const cardHeightConfig = config.cardHeight;
        const calculatedHeight = Math.max(
            cardHeightConfig.min,
            Math.min(cardHeightConfig.max, height * cardHeightConfig.ratio)
        );
        
        return { width: calculatedWidth, height: calculatedHeight };
    }
}
```

---

## 🧮 Layer 3：佈局計算引擎

### SeparatedLayoutCalculator 類

```javascript
class SeparatedLayoutCalculator {
    constructor(width, height, itemCount, layoutType = 'left-right') {
        this.width = width;
        this.height = height;
        this.itemCount = itemCount;
        this.layoutType = layoutType;
        this.deviceType = DeviceDetector.getDeviceType(width, height);
        this.config = SeparatedModeConfig.get(this.deviceType);
    }
    
    calculatePositions() {
        return {
            leftX: this.width * this.config.leftX,
            rightX: this.width * this.config.rightX,
            leftStartY: this.height * this.config.leftStartY,
            rightStartY: this.height * this.config.rightStartY,
            spacing: this.config.spacing,
            margins: this.config.margins
        };
    }
    
    calculateCardSize() {
        return SeparatedModeConfig.calculateCardSize(
            this.width,
            this.height,
            this.deviceType
        );
    }
    
    calculateFontSize(cardHeight, textLength) {
        // 基礎字體大小
        let fontSize = cardHeight * 0.4;
        
        // 根據文字長度調整
        if (textLength > 20) fontSize *= 0.7;
        else if (textLength > 15) fontSize *= 0.85;
        
        return Math.max(12, Math.min(24, fontSize));
    }
    
    getLayoutVariant() {
        if (this.itemCount <= 5) return 'single-column';
        if (this.itemCount <= 20) return 'multi-rows';
        return 'multi-columns';
    }
}
```

---

## 🎨 Layer 4：組件化架構

### SeparatedLayoutRenderer 類

```javascript
class SeparatedLayoutRenderer {
    constructor(scene, width, height) {
        this.scene = scene;
        this.width = width;
        this.height = height;
    }
    
    render(pairs, layoutType = 'left-right') {
        const calculator = new SeparatedLayoutCalculator(
            this.width,
            this.height,
            pairs.length,
            layoutType
        );
        
        const variant = calculator.getLayoutVariant();
        
        if (layoutType === 'left-right') {
            if (variant === 'single-column') {
                this.renderLeftRightSingleColumn(pairs, calculator);
            } else {
                this.renderLeftRightMultiRows(pairs, calculator);
            }
        } else if (layoutType === 'top-bottom') {
            this.renderTopBottomMultiRows(pairs, calculator);
        }
    }
    
    renderLeftRightSingleColumn(pairs, calculator) {
        const positions = calculator.calculatePositions();
        const cardSize = calculator.calculateCardSize();
        
        // 左側卡片
        pairs.forEach((pair, index) => {
            const y = positions.leftStartY + index * (cardSize.height + positions.spacing.vertical);
            this.scene.createLeftCard(
                positions.leftX,
                y,
                cardSize.width,
                cardSize.height,
                pair
            );
        });
        
        // 右側卡片
        pairs.forEach((pair, index) => {
            const y = positions.rightStartY + index * (cardSize.height + positions.spacing.vertical);
            this.scene.createRightCard(
                positions.rightX,
                y,
                cardSize.width,
                cardSize.height,
                pair
            );
        });
    }
    
    renderLeftRightMultiRows(pairs, calculator) {
        // 類似實現，支持多行
    }
    
    renderTopBottomMultiRows(pairs, calculator) {
        // 類似實現，支持上下分離
    }
}
```

---

## 🔄 使用示例

### 在 createCards 中使用

```javascript
createCards() {
    const width = this.scale.width;
    const height = this.scale.height;
    const currentPagePairs = this.getCurrentPagePairs();
    
    // 使用新的渲染器
    const renderer = new SeparatedLayoutRenderer(this, width, height);
    renderer.render(currentPagePairs, 'left-right');
}
```

---

## 📊 改進對比

| 方面 | 改進前 | 改進後 |
|------|-------|-------|
| **代碼行數** | 600+ | 250 |
| **函數數量** | 4 | 1 |
| **配置位置** | 分散 | 集中 |
| **計算邏輯** | 重複 | 統一 |
| **可擴展性** | 低 | 高 |

---

## ✅ 驗收標準

- ✅ 所有設備類型都能正確支持
- ✅ 卡片尺寸在所有分辨率上都合適
- ✅ 字體大小在所有文字長度上都合適
- ✅ 計算時間減少 80% 以上
- ✅ 代碼行數減少 50% 以上

