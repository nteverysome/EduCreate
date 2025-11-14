# Phase 3：創建計算類 - 完成報告

## ✅ 完成時間
- **開始時間**：Phase 2 完成後
- **完成時間**：現在
- **預計時間**：2-3 小時
- **實際時間**：✅ 完成

---

## 📦 創建的文件

### SeparatedLayoutCalculator 類
**文件**：`public/games/match-up-game/config/separated-layout-calculator.js`
**行數**：300+ 行
**功能**：
- 統一的佈局計算邏輯
- 支持所有設備類型
- 支持所有佈局變體
- 支持所有內容模式

---

## 🔧 提供的方法

### 基礎計算方法

1. **calculateCardSize()**
   - 計算卡片寬度和高度
   - 基於設備類型和容器尺寸
   - 返回：{ width, height }

2. **calculatePositions()**
   - 計算左右或上下位置
   - 基於設備類型
   - 返回：{ leftX, rightX, leftStartY, rightStartY }

3. **calculateSpacing()**
   - 計算水平和垂直間距
   - 基於容器高度
   - 返回：{ horizontal, vertical }

4. **getMargins()**
   - 獲取邊距配置
   - 基於設備類型
   - 返回：{ top, bottom, left, right }

### 高級計算方法

5. **calculateFontSize(cardHeight, text)**
   - 計算字體大小
   - 根據卡片高度和文字長度調整
   - 返回：number

6. **getLayoutVariant()**
   - 確定佈局變體
   - 基於卡片數量
   - 返回：'single-column' | 'multi-rows' | 'multi-columns'

7. **calculateColumns(hasImages)**
   - 計算列數
   - 基於是否有圖片
   - 返回：number

8. **calculateRows(columns)**
   - 計算行數
   - 基於列數和卡片數量
   - 返回：number

### 輔助方法

9. **getContentMode(hasImages)**
   - 確定內容模式
   - 返回：'square' | 'rectangle'

10. **calculateAvailableHeight()**
    - 計算可用高度
    - 返回：number

11. **calculateAvailableWidth()**
    - 計算可用寬度
    - 返回：number

12. **calculateSingleColumnSpacing(cardHeight)**
    - 計算單列佈局的間距
    - 返回：{ leftSpacing, rightSpacing }

13. **calculateMultiRowCardSize(columns, rows)**
    - 計算多行佈局的卡片尺寸
    - 返回：{ width, height }

### 完整計算方法

14. **getFullCalculation(hasImages)**
    - 獲取完整的計算結果
    - 返回：完整的計算對象

15. **getDebugInfo()**
    - 獲取調試信息
    - 返回：調試信息對象

---

## 📊 計算邏輯

### 卡片尺寸計算

```javascript
const calculator = new SeparatedLayoutCalculator(width, height, itemCount);
const cardSize = calculator.calculateCardSize();
// 返回：{ width: 150, height: 60 }
```

### 位置計算

```javascript
const positions = calculator.calculatePositions();
// 返回：{ leftX: 210, rightX: 340, leftStartY: 210, rightStartY: 188 }
```

### 字體大小計算

```javascript
const fontSize = calculator.calculateFontSize(60, '這是一個很長的中文文字');
// 返回：24（根據文字長度調整）
```

### 佈局變體確定

```javascript
const variant = calculator.getLayoutVariant();
// 3-5 個卡片：'single-column'
// 6-20 個卡片：'multi-rows'
// 21+ 個卡片：'multi-columns'
```

---

## 🔄 與配置系統的集成

### 依賴關係

```
SeparatedLayoutCalculator
    ├─ DeviceDetector（設備檢測）
    ├─ SeparatedModeConfig（配置管理）
    └─ CalculationConstants（計算常量）
```

### 使用流程

```javascript
// 1. 創建計算器
const calculator = new SeparatedLayoutCalculator(width, height, itemCount);

// 2. 獲取設備類型
const deviceType = calculator.deviceType;  // 'mobile-portrait'

// 3. 獲取配置
const config = calculator.config;  // SeparatedModeConfig

// 4. 計算卡片尺寸
const cardSize = calculator.calculateCardSize();

// 5. 計算位置
const positions = calculator.calculatePositions();

// 6. 計算間距
const spacing = calculator.calculateSpacing();
```

---

## ✅ 驗證清單

- [x] 創建 SeparatedLayoutCalculator 類
- [x] 實現基礎計算方法
- [x] 實現高級計算方法
- [x] 實現輔助方法
- [x] 實現完整計算方法
- [x] 添加調試方法
- [x] 添加完整的文檔註釋
- [x] 添加導出語句
- [x] 集成 DeviceDetector
- [x] 集成 SeparatedModeConfig
- [x] 集成 CalculationConstants

---

## 📈 改進效果

### 代碼複雜度

| 方面 | 改進前 | 改進後 |
|------|-------|-------|
| **計算邏輯位置** | 分散在 4 個函數中 | 集中在 1 個類中 |
| **計算方法數量** | 12+ 個分散的計算 | 15 個統一的方法 |
| **代碼重複** | 高 | 低 |

### 可維護性

- ✅ 計算邏輯集中，易於理解
- ✅ 方法清晰，易於使用
- ✅ 支持調試，易於排查問題

### 可擴展性

- ✅ 易於添加新的計算方法
- ✅ 易於支持新的佈局變體
- ✅ 易於調整計算邏輯

---

## 🔗 下一步行動

### Phase 4：重構實現（3-4 小時）

1. 重構 `createLeftRightSingleColumn()` 函數
   - 使用 SeparatedLayoutCalculator
   - 移除硬編碼常量
   - 簡化代碼邏輯

2. 重構 `createLeftRightMultiRows()` 函數
   - 使用 SeparatedLayoutCalculator
   - 移除硬編碼常量
   - 簡化代碼邏輯

3. 重構 `createTopBottomMultiRows()` 函數
   - 使用 SeparatedLayoutCalculator
   - 移除硬編碼常量
   - 簡化代碼邏輯

4. 創建 `SeparatedLayoutRenderer` 類
   - 統一的渲染器
   - 支持所有佈局變體
   - 簡化調用邏輯

**預計完成時間**：3-4 小時

---

## 📊 進度

```
Phase 1: 準備階段 ████████████████████ 100% ✅
Phase 2: 提取常量 ████████████████████ 100% ✅
Phase 3: 創建計算類 ████████████████████ 100% ✅
Phase 4: 重構實現 ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 5: 測試驗證 ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

**總進度**：60% 完成

---

## 📝 文件清單

✅ `public/games/match-up-game/config/separated-mode-config.js` - 250+ 行
✅ `public/games/match-up-game/config/device-detector.js` - 150+ 行
✅ `public/games/match-up-game/config/calculation-constants.js` - 200+ 行
✅ `public/games/match-up-game/config/separated-layout-calculator.js` - 300+ 行

**總計**：900+ 行新代碼

---

## 💡 關鍵特點

### 統一的計算邏輯
- 所有計算都通過 SeparatedLayoutCalculator 進行
- 消除了代碼重複
- 提高了代碼可維護性

### 完整的配置系統
- 5 種設備類型的預定義配置
- 支持動態計算
- 易於調整和擴展

### 清晰的方法接口
- 每個方法都有明確的功能
- 每個方法都有完整的文檔
- 易於理解和使用

### 強大的調試支持
- getDebugInfo() 方法提供完整的調試信息
- 易於排查問題
- 易於驗證計算結果

