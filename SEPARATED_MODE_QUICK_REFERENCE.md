# 分離模式優化 - 快速參考指南

## 🚀 快速開始

### 1. 配置文件集成
在 `index.html` 中添加以下腳本：
```html
<!-- 分離模式配置系統 -->
<script src="./games/match-up-game/config/separated-mode-config.js"></script>
<script src="./games/match-up-game/config/device-detector.js"></script>
<script src="./games/match-up-game/config/calculation-constants.js"></script>
<script src="./games/match-up-game/config/separated-layout-calculator.js"></script>
<script src="./games/match-up-game/config/separated-layout-renderer.js"></script>
```

### 2. 基本使用

#### 設備檢測
```javascript
const deviceType = DeviceDetector.getDeviceType(width, height);
// 返回：'mobile-portrait' | 'mobile-landscape' | 'tablet-portrait' | 'tablet-landscape' | 'desktop'

const deviceInfo = DeviceDetector.getDeviceInfo(width, height);
// 返回：{ width, height, aspectRatio, deviceType, screenSize, isIPad, ... }
```

#### 佈局計算
```javascript
const calculator = new SeparatedLayoutCalculator(width, height, itemCount, 'left-right');

// 計算卡片尺寸
const cardSize = calculator.calculateCardSize();
// 返回：{ width: 150, height: 60 }

// 計算位置
const positions = calculator.calculatePositions();
// 返回：{ leftX: 210, rightX: 340, leftStartY: 210, rightStartY: 188 }

// 計算間距
const spacing = calculator.calculateSpacing();
// 返回：{ horizontal: 10, vertical: 5 }

// 獲取完整計算結果
const fullCalc = calculator.getFullCalculation(hasImages);
```

#### 佈局渲染
```javascript
const renderer = new SeparatedLayoutRenderer(scene, calculator);

// 渲染單列佈局
renderer.renderSingleColumn(pairs, {
    leftX: 210,
    rightX: 340,
    leftStartY: 210,
    rightStartY: 188,
    cardWidth: 150,
    cardHeight: 60,
    leftSpacing: 70,
    rightSpacing: 70,
    hasImages: false
});

// 獲取卡片
const cards = renderer.getCards();
```

---

## 📚 API 參考

### DeviceDetector
```javascript
// 獲取設備類型
DeviceDetector.getDeviceType(width, height)

// 獲取屏幕尺寸分類
DeviceDetector.getScreenSize(height)

// 檢測是否為 iPad
DeviceDetector.isIPad(width, height)

// 檢測是否為手機橫向模式
DeviceDetector.isLandscapeMobile(width, height)

// 檢測是否為小容器
DeviceDetector.isSmallContainer(height)

// 檢測是否為中等容器
DeviceDetector.isMediumContainer(height)

// 檢測是否為大容器
DeviceDetector.isLargeContainer(height)

// 獲取完整設備信息
DeviceDetector.getDeviceInfo(width, height)
```

### SeparatedModeConfig
```javascript
// 獲取設備配置
SeparatedModeConfig.get(deviceType)

// 計算卡片尺寸
SeparatedModeConfig.calculateCardSize(width, height, deviceType)

// 計算位置
SeparatedModeConfig.calculatePositions(width, height, deviceType)

// 計算間距
SeparatedModeConfig.calculateSpacing(height, deviceType)

// 獲取邊距
SeparatedModeConfig.getMargins(deviceType)
```

### SeparatedLayoutCalculator
```javascript
// 計算卡片尺寸
calculator.calculateCardSize()

// 計算位置
calculator.calculatePositions()

// 計算間距
calculator.calculateSpacing()

// 計算字體大小
calculator.calculateFontSize(cardHeight, text)

// 確定佈局變體
calculator.getLayoutVariant()

// 計算列數
calculator.calculateColumns(hasImages)

// 計算行數
calculator.calculateRows(columns)

// 獲取完整計算結果
calculator.getFullCalculation(hasImages)

// 獲取調試信息
calculator.getDebugInfo()
```

### SeparatedLayoutRenderer
```javascript
// 渲染單列佈局
renderer.renderSingleColumn(pairs, options)

// 渲染多行佈局
renderer.renderMultiRows(pairs, options)

// 渲染上下分離佈局
renderer.renderTopBottom(pairs, options)

// 清除所有卡片
renderer.clear()

// 獲取所有卡片
renderer.getCards()

// 獲取卡片數量
renderer.getCardCount()
```

---

## 🎯 常見任務

### 任務 1：檢測設備類型
```javascript
const width = this.scale.width;
const height = this.scale.height;
const deviceType = DeviceDetector.getDeviceType(width, height);
console.log(`設備類型：${deviceType}`);
```

### 任務 2：計算卡片尺寸
```javascript
const calculator = new SeparatedLayoutCalculator(width, height, itemCount);
const cardSize = calculator.calculateCardSize();
console.log(`卡片尺寸：${cardSize.width} × ${cardSize.height}`);
```

### 任務 3：計算佈局位置
```javascript
const positions = calculator.calculatePositions();
console.log(`左側位置：${positions.leftX}, 右側位置：${positions.rightX}`);
```

### 任務 4：計算字體大小
```javascript
const fontSize = calculator.calculateFontSize(cardHeight, text);
console.log(`字體大小：${fontSize}px`);
```

### 任務 5：確定佈局變體
```javascript
const variant = calculator.getLayoutVariant();
// 'single-column' | 'multi-rows' | 'multi-columns'
console.log(`佈局變體：${variant}`);
```

---

## 📊 配置參考

### 設備類型
- `mobile-portrait` - 手機直向
- `mobile-landscape` - 手機橫向
- `tablet-portrait` - 平板直向
- `tablet-landscape` - 平板橫向
- `desktop` - 桌面

### 屏幕尺寸
- `small` - 高度 < 600px
- `medium` - 高度 600-800px
- `large` - 高度 > 800px

### 佈局變體
- `single-column` - 單列（3-5 個卡片）
- `multi-rows` - 多行（6-20 個卡片）
- `multi-columns` - 多列（21+ 個卡片）

### 內容模式
- `square` - 正方形（有圖片）
- `rectangle` - 長方形（無圖片）

---

## 🔍 調試技巧

### 1. 獲取完整設備信息
```javascript
const deviceInfo = DeviceDetector.getDeviceInfo(width, height);
console.log(deviceInfo);
// 輸出：{ width, height, aspectRatio, deviceType, screenSize, isIPad, ... }
```

### 2. 獲取完整計算結果
```javascript
const fullCalc = calculator.getFullCalculation(hasImages);
console.log(fullCalc);
// 輸出：{ deviceType, layoutType, variant, itemCount, cardSize, positions, ... }
```

### 3. 獲取調試信息
```javascript
const debugInfo = calculator.getDebugInfo();
console.log(debugInfo);
// 輸出：{ width, height, itemCount, layoutType, deviceType, ... }
```

---

## ⚠️ 常見問題

### Q1：如何添加新的設備類型？
A：在 `SeparatedModeConfig.CONFIG` 中添加新的設備配置，然後在 `DeviceDetector.getDeviceType()` 中添加檢測邏輯。

### Q2：如何調整卡片尺寸？
A：修改 `SeparatedModeConfig` 中對應設備類型的 `cardWidth` 和 `cardHeight` 配置。

### Q3：如何調整位置？
A：修改 `SeparatedModeConfig` 中對應設備類型的 `positions` 配置。

### Q4：如何調整間距？
A：修改 `SeparatedModeConfig` 中對應設備類型的 `spacing` 配置。

### Q5：如何添加新的佈局變體？
A：在 `SeparatedLayoutRenderer` 中添加新的 `render*()` 方法。

---

## 📖 詳細文檔

- `SEPARATED_MODE_IMPLEMENTATION_GUIDE.md` - 完整實現指南
- `SEPARATED_MODE_DEEP_ANALYSIS.md` - 深度分析
- `PHASE_4_REFACTORING_STRATEGY.md` - 重構策略
- `CURRENT_STATUS_AND_NEXT_STEPS.md` - 當前狀態和下一步

---

## 🚀 下一步

1. 完成 Phase 4 剩餘工作（2 小時）
2. 進行 Phase 5 測試驗證（2-3 小時）
3. 部署到生產環境

**預計完成時間**：4-5 小時

