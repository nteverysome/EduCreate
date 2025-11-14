# 混合模式卡片動態調整尺寸 - 實現指南

## 🎯 核心設計原則

### 1. 優先級順序

```
最小尺寸限制 > 寬高比限制 > 可用空間限制 > 最大尺寸限制
```

### 2. 計算順序

```
設備檢測 → 配置選擇 → 空間計算 → 列數計算 → 尺寸計算 → 限制應用
```

### 3. 響應式策略

- **手機**：固定 5 列，緊湊模式
- **平板**：動態列數，平衡模式
- **桌面**：動態列數，完整模式

---

## 💻 實現代碼框架

### 第 1 步：設備檢測

```javascript
class DeviceDetector {
    static getDeviceType(width, height) {
        const aspectRatio = width / height;
        
        if (width < 768) {
            return height > width ? 'mobile-portrait' : 'mobile-landscape';
        } else if (width < 1024) {
            return height > width ? 'tablet-portrait' : 'tablet-landscape';
        } else {
            return 'desktop';
        }
    }
    
    static isFullscreen() {
        return !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
        );
    }
}
```

### 第 2 步：配置管理

```javascript
class ContainerConfigManager {
    static CONFIG = {
        'mobile-portrait': {
            topButtonArea: 40,
            bottomButtonArea: 40,
            sideMargin: 20,
            cols: 5,
            mode: 'compact',
            minCardSize: 150
        },
        // ... 其他設備配置
    };
    
    static getConfig(deviceType, isFullscreen) {
        let config = { ...this.CONFIG[deviceType] };
        
        if (isFullscreen) {
            config.topButtonArea *= 0.5;
            config.bottomButtonArea *= 0.5;
            config.sideMargin *= 0.75;
            config.minCardSize *= 0.8;
        }
        
        return config;
    }
}
```

### 第 3 步：空間計算

```javascript
class SpaceCalculator {
    static calculate(width, height, config) {
        const availableWidth = width - config.sideMargin * 2;
        const availableHeight = height - config.topButtonArea - config.bottomButtonArea;
        
        const horizontalSpacing = Math.max(15, Math.min(30, width * 0.015));
        const verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
        
        return {
            availableWidth,
            availableHeight,
            horizontalSpacing,
            verticalSpacing
        };
    }
}
```

### 第 4 步：列數計算

```javascript
class ColumnCalculator {
    static calculate(width, height, itemCount, config, spacing) {
        const aspectRatio = width / height;
        const maxPossibleCols = Math.floor(
            (spacing.availableWidth + spacing.horizontalSpacing) / 
            (config.minCardSize + spacing.horizontalSpacing)
        );
        
        let optimalCols;
        if (aspectRatio > 2.0) {
            optimalCols = Math.min(maxPossibleCols, 10, itemCount);
        } else if (aspectRatio > 1.5) {
            optimalCols = Math.min(maxPossibleCols, 10, itemCount);
        } else if (aspectRatio > 1.2) {
            optimalCols = Math.min(maxPossibleCols, 8, itemCount);
        } else {
            optimalCols = Math.min(maxPossibleCols, 5, itemCount);
        }
        
        return optimalCols;
    }
}
```

### 第 5 步：卡片尺寸計算

```javascript
class CardSizeCalculator {
    static calculateSquare(cols, rows, space, config, isFullscreen) {
        const availableHeightPerRow = 
            (space.availableHeight - space.verticalSpacing * (rows + 1)) / rows;
        const squareSizeByHeight = availableHeightPerRow / 1.4;
        
        const squareSizeByWidth = 
            (space.availableWidth - space.horizontalSpacing * (cols + 1)) / cols;
        
        let squareSize = Math.min(squareSizeByHeight, squareSizeByWidth);
        
        const minSize = isFullscreen ? config.minCardSize : 150;
        const maxSize = 300;
        squareSize = Math.max(minSize, Math.min(maxSize, squareSize));
        
        return { width: squareSize, height: squareSize };
    }
    
    static calculateRectangle(cols, rows, space, config, isFullscreen) {
        const width = (space.availableWidth - space.horizontalSpacing * (cols + 1)) / cols;
        
        const availableHeightPerRow = 
            (space.availableHeight - space.verticalSpacing * (rows + 1)) / rows;
        const height = (availableHeightPerRow - space.verticalSpacing) / 1.4;
        
        const minWidth = isFullscreen ? config.minCardSize : 200;
        const minHeight = isFullscreen ? (config.minCardSize * 0.5) : 100;
        const maxSize = 300;
        
        return {
            width: Math.max(minWidth, Math.min(maxSize, width)),
            height: Math.max(minHeight, Math.min(maxSize, height))
        };
    }
}
```

### 第 6 步：完整計算器

```javascript
class HybridCardSizeCalculator {
    calculate(width, height, itemCount, hasImages, isFullscreen = false) {
        // 1. 設備檢測
        const deviceType = DeviceDetector.getDeviceType(width, height);
        
        // 2. 配置選擇
        const config = ContainerConfigManager.getConfig(deviceType, isFullscreen);
        
        // 3. 空間計算
        const space = SpaceCalculator.calculate(width, height, config);
        
        // 4. 列數計算
        const cols = config.cols === 'dynamic'
            ? ColumnCalculator.calculate(width, height, itemCount, config, space)
            : config.cols;
        
        // 5. 行數計算
        const rows = Math.ceil(itemCount / cols);
        
        // 6. 卡片尺寸計算
        const cardSize = hasImages
            ? CardSizeCalculator.calculateSquare(cols, rows, space, config, isFullscreen)
            : CardSizeCalculator.calculateRectangle(cols, rows, space, config, isFullscreen);
        
        return {
            cardWidth: cardSize.width,
            cardHeight: cardSize.height,
            cols,
            rows,
            horizontalSpacing: space.horizontalSpacing,
            verticalSpacing: space.verticalSpacing,
            deviceType,
            mode: config.mode
        };
    }
}
```

---

## 🧪 測試用例

### 測試場景 1：手機直向（375×667）

```javascript
const result = calculator.calculate(375, 667, 12, true, false);
// 預期：
// - cols: 5
// - cardWidth: ~60px
// - cardHeight: ~60px
// - mode: 'compact'
```

### 測試場景 2：平板橫向（1024×768）

```javascript
const result = calculator.calculate(1024, 768, 12, true, false);
// 預期：
// - cols: 動態計算（約 6-8）
// - cardWidth: ~120px
// - cardHeight: ~120px
// - mode: 'desktop'
```

### 測試場景 3：桌面全螢幕（1920×1080）

```javascript
const result = calculator.calculate(1920, 1080, 20, false, true);
// 預期：
// - cols: 動態計算（約 8-10）
// - cardWidth: ~180px
// - cardHeight: ~90px
// - mode: 'desktop'
```

---

## 🔍 調試技巧

### 1. 打印計算過程

```javascript
console.log('🖥️ 設備類型:', deviceType);
console.log('📐 可用空間:', { availableWidth, availableHeight });
console.log('🔢 列數:', cols, '行數:', rows);
console.log('📏 卡片尺寸:', { cardWidth, cardHeight });
console.log('📊 間距:', { horizontalSpacing, verticalSpacing });
```

### 2. 驗證卡片是否超出邊界

```javascript
function validateCardPlacement(cols, rows, cardWidth, cardHeight, space) {
    const totalWidth = cols * cardWidth + (cols - 1) * space.horizontalSpacing;
    const totalHeight = rows * cardHeight + (rows - 1) * space.verticalSpacing;
    
    console.assert(totalWidth <= space.availableWidth, '寬度超出邊界');
    console.assert(totalHeight <= space.availableHeight, '高度超出邊界');
}
```

### 3. 邊界情況測試

```javascript
// 最少卡片
calculator.calculate(1920, 1080, 1, true, false);

// 最多卡片
calculator.calculate(1920, 1080, 100, true, false);

// 極端寬高比
calculator.calculate(3840, 1080, 20, true, false);  // 超寬
calculator.calculate(1080, 1920, 20, true, false);  // 超高
```

---

## 📋 集成檢查清單

- [ ] 設備檢測正確
- [ ] 配置選擇正確
- [ ] 空間計算正確
- [ ] 列數計算正確
- [ ] 卡片尺寸計算正確
- [ ] 最小/最大限制應用正確
- [ ] 全螢幕模式正確
- [ ] 響應式事件監聽正確
- [ ] 所有測試用例通過
- [ ] 邊界情況處理正確

