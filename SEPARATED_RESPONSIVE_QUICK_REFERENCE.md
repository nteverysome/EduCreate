# 分離模式響應式配置 - 快速參考卡片

## 🚀 快速開始

### 基本使用

```javascript
// 1. 創建配置實例
const config = new SeparatedResponsiveConfig(width, height, itemCount);

// 2. 獲取布局
const layout = config.calculateLayout();

// 3. 使用結果
const cardWidth = layout.cardSize.width;
const cardHeight = layout.cardSize.height;
const fontSize = layout.fontSize;
```

---

## 📊 斷點速查表

| 設備 | 寬度 | 斷點 | 列數 | 邊距 |
|------|------|------|------|------|
| 手機直向 | 375px | mobile | 1 | 8px |
| 手機橫向 | 812px | tablet | 2 | 12px |
| 平板 | 1024px | desktop | 3 | 16px |
| 桌面 | 1440px | wide | 4 | 20px |

---

## 🔧 常用方法

### 計算完整布局

```javascript
const layout = config.calculateLayout();
// 返回: {
//   breakpoint: 'desktop',
//   cols: 3,
//   cardSize: { width: 200, height: 150 },
//   fontSize: 18,
//   margins: { side: 16, top: 80, bottom: 90, spacing: 12 },
//   availableWidth: 1408,
//   availableHeight: 720
// }
```

### 計算容器位置

```javascript
const positions = config.calculateContainerPositions();
// 返回: {
//   left: { x: 224, width: 448, containerWidth: 512 },
//   right: { x: 1216, width: 448, containerWidth: 512 }
// }
```

### 計算字體大小

```javascript
// 基於寬度
const fontSize = FontSizeCalculator.calculateByWidth(1024);  // 18px

// 基於卡片高度和文字長度
const chineseFontSize = FontSizeCalculator.calculateChineseFontSize(
    150,        // 卡片高度
    3,          // 文字長度
    'desktop'   // 模式
);  // 38px
```

### 計算動態邊距

```javascript
// 邊距會根據項目數量自動調整
const margin = MarginCalculator.calculateDynamicMargin(20, 10);  // 基礎邊距 20px，10 項

// 間距也會自動調整
const spacing = MarginCalculator.calculateDynamicSpacing(12, 10);
```

---

## 💡 實用代碼片段

### 片段 1: 在 game.js 中使用

```javascript
createSeparatedLayout(pairs, width, height) {
    const config = new SeparatedResponsiveConfig(width, height, pairs.length);
    const layout = config.calculateLayout();
    const positions = config.calculateContainerPositions();

    // 使用計算結果創建卡片
    pairs.forEach((pair, index) => {
        const x = positions.left.x;
        const y = positions.left.y + index * (layout.cardSize.height + layout.margins.spacing);
        
        this.createLeftCard(
            x, y,
            layout.cardSize.width,
            layout.cardSize.height,
            pair.question,
            layout.fontSize
        );
    });
}
```

### 片段 2: 監聽窗口大小變化

```javascript
let currentBreakpoint = null;

window.addEventListener('resize', () => {
    const config = new SeparatedResponsiveConfig(
        window.innerWidth,
        window.innerHeight
    );

    if (config.breakpoint !== currentBreakpoint) {
        currentBreakpoint = config.breakpoint;
        console.log(`斷點改變: ${currentBreakpoint}`);
        // 重新渲染
    }
});
```

### 片段 3: 調試配置

```javascript
// 在控制台中
const config = new SeparatedResponsiveConfig(1024, 768, 10);
config.printConfig();

// 或運行完整測試
SeparatedResponsiveConfigTest.runAllTests();

// 或查看集成示例
SeparatedResponsiveIntegrationExample.runAllExamples();
```

---

## 🎯 常見場景

### 場景 1: 手機用戶

```javascript
const config = new SeparatedResponsiveConfig(390, 844, 8);
// 結果: mobile 斷點，1 列，卡片 ~350×420px
```

### 場景 2: 平板用戶

```javascript
const config = new SeparatedResponsiveConfig(1024, 1366, 12);
// 結果: desktop 斷點，3 列，卡片 ~200×240px
```

### 場景 3: 桌面用戶

```javascript
const config = new SeparatedResponsiveConfig(1440, 900, 15);
// 結果: wide 斷點，4 列，卡片 ~250×200px
```

---

## 📋 檢查清單

在使用響應式配置時：

- [ ] 已在 index.html 中引入 `separated-responsive-config.js`
- [ ] 已創建 `SeparatedResponsiveConfig` 實例
- [ ] 已調用 `calculateLayout()` 獲取布局
- [ ] 已使用 `layout.cardSize` 設置卡片大小
- [ ] 已使用 `layout.fontSize` 設置字體大小
- [ ] 已使用 `layout.margins` 設置邊距
- [ ] 已測試各種解析度
- [ ] 已在控制台驗證配置

---

## 🐛 調試技巧

### 查看當前斷點

```javascript
const config = new SeparatedResponsiveConfig(window.innerWidth, window.innerHeight);
console.log(config.breakpoint);  // 'mobile', 'tablet', 'desktop', 或 'wide'
```

### 查看完整布局

```javascript
const config = new SeparatedResponsiveConfig(window.innerWidth, window.innerHeight);
console.log(config.calculateLayout());
```

### 查看容器位置

```javascript
const config = new SeparatedResponsiveConfig(window.innerWidth, window.innerHeight);
console.log(config.calculateContainerPositions());
```

### 運行測試

```javascript
SeparatedResponsiveConfigTest.runAllTests();
```

### 查看集成示例

```javascript
SeparatedResponsiveIntegrationExample.runAllExamples();
```

---

## 📚 相關文件

| 文件 | 說明 |
|------|------|
| `separated-responsive-config.js` | 主配置類 |
| `separated-responsive-config.test.js` | 測試套件 |
| `separated-responsive-integration-example.js` | 集成示例 |
| `SEPARATED_RESPONSIVE_CONFIG_GUIDE.md` | 完整指南 |

---

## 🔗 相關類

| 類 | 用途 |
|------|------|
| `BreakpointSystem` | 斷點管理 |
| `ColumnCalculator` | 列數計算 |
| `CardSizeCalculator` | 卡片大小計算 |
| `FontSizeCalculator` | 字體大小計算 |
| `MarginCalculator` | 邊距計算 |
| `SeparatedResponsiveConfig` | 主配置類 |

---

## 💬 常見問題

**Q: 如何自定義斷點？**
A: 修改 `BreakpointSystem` 類中的 `breakpoints` 對象

**Q: 如何調整卡片大小限制？**
A: 修改 `CardSizeCalculator.constrainCardSize()` 中的 `minSize` 和 `maxSize`

**Q: 如何根據設備類型調整？**
A: 使用 `config.breakpoint` 判斷設備類型，然後應用不同邏輯

**Q: 如何監聽窗口大小變化？**
A: 使用 `window.addEventListener('resize', ...)` 並重新創建配置實例

---

## 📞 支持

如有問題，請查看：
1. `SEPARATED_RESPONSIVE_CONFIG_GUIDE.md` - 完整文檔
2. 控制台中的測試輸出
3. 集成示例代碼

