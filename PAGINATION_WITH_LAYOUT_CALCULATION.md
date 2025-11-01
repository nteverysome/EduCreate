# 📄 分頁邏輯與佈局計算整合方案 v6.0

## 🎯 核心概念

**分頁邏輯應該基於「每頁能容納的最大卡片數」，而不是固定的數字**

---

## 📊 計算流程

### 第一步：計算每頁能容納的最大卡片數

```javascript
function calculateMaxCardsPerPage(width, height, layout = 'mixed') {
    // 🔥 修復：手機直向應該也使用緊湊模式
    const isMobileDevice = width < 768;
    const isLandscapeMobile = width > height && height < 500;
    const isTinyHeight = height < 400;
    const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;

    // 獲取設備配置
    const deviceType = getDeviceType(width, height);
    const containerConfig = getContainerConfig(deviceType, false);

    // 計算可用空間
    const topButtonAreaHeight = containerConfig.topButtonArea;
    const bottomButtonAreaHeight = containerConfig.bottomButtonArea;
    const sideMargin = containerConfig.sideMargin;
    const availableWidth = width - sideMargin * 2;
    const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;

    // 根據佈局模式決定列數
    let cols;
    if (layout === 'mixed') {
        // 混合模式：固定 5 列（手機直向）
        cols = isCompactMode ? 5 : 3;
    } else {
        // 分離模式：根據寬度動態決定
        cols = Math.floor(availableWidth / 150);  // 假設最小卡片寬度 150px
    }

    // 計算卡片尺寸
    const horizontalSpacing = Math.max(5, Math.min(15, availableWidth * 0.01));
    const cardWidth = (availableWidth - horizontalSpacing * (cols + 1)) / cols;

    // 計算可容納的行數
    const verticalSpacing = Math.max(5, Math.min(20, availableHeight * 0.02));
    const cardHeight = 67;  // 假設卡片高度 67px
    const chineseTextHeight = 20;  // 中文文字高度
    const totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing;

    const maxRows = Math.floor((availableHeight - verticalSpacing) / totalUnitHeight);

    // 計算每頁最大卡片數
    const maxCardsPerPage = cols * maxRows;

    console.log('📊 每頁最大卡片數計算:', {
        deviceType,
        layout,
        cols,
        maxRows,
        maxCardsPerPage,
        cardWidth: cardWidth.toFixed(0),
        cardHeight,
        availableHeight: availableHeight.toFixed(0)
    });

    return maxCardsPerPage;
}
```

### 第二步：根據最大卡片數計算分頁

```javascript
function calculatePaginationWithLayout(totalPairs, width, height, layout = 'mixed') {
    // 計算每頁能容納的最大卡片數
    const maxCardsPerPage = calculateMaxCardsPerPage(width, height, layout);

    // 確保每頁至少有 1 個卡片
    const itemsPerPage = Math.max(1, maxCardsPerPage);

    // 計算總頁數
    const totalPages = Math.ceil(totalPairs / itemsPerPage);

    // 決定是否啟用分頁
    const enablePagination = totalPages > 1;

    console.log('📄 分頁計算結果:', {
        totalPairs,
        maxCardsPerPage,
        itemsPerPage,
        totalPages,
        enablePagination
    });

    return {
        itemsPerPage,
        totalPages,
        enablePagination,
        maxCardsPerPage
    };
}
```

---

## 📈 計算示例

### 手機直向（375×667px）- 混合模式

```javascript
// 輸入
width = 375
height = 667
layout = 'mixed'

// 計算過程
isMobileDevice = true (375 < 768)
isCompactMode = true
deviceType = 'mobile-portrait'
cols = 5（固定）
availableHeight = 667 - 50 - 50 = 567px

cardHeight = 67px
chineseTextHeight = 20px
verticalSpacing = 10px
totalUnitHeight = 67 + 20 + 10 = 97px

maxRows = floor((567 - 10) / 97) = floor(5.74) = 5 行

maxCardsPerPage = 5 × 5 = 25 個卡片

// 結果
20 個卡片：
  itemsPerPage = 25
  totalPages = ceil(20 / 25) = 1 頁
  enablePagination = false
  → 顯示全部 20 個卡片 ✅

30 個卡片：
  itemsPerPage = 25
  totalPages = ceil(30 / 25) = 2 頁
  enablePagination = true
  → 第 1 頁 25 個，第 2 頁 5 個 ✅
```

### 手機橫向（812×375px）- 混合模式

```javascript
// 輸入
width = 812
height = 375
layout = 'mixed'

// 計算過程
isLandscapeMobile = true (812 > 375 && 375 < 500)
isCompactMode = true
deviceType = 'mobile-landscape'
cols = 5（固定）
availableHeight = 375 - 30 - 30 = 315px

cardHeight = 35px（橫向模式卡片更小）
chineseTextHeight = 15px
verticalSpacing = 5px
totalUnitHeight = 35 + 15 + 5 = 55px

maxRows = floor((315 - 5) / 55) = floor(5.64) = 5 行

maxCardsPerPage = 5 × 5 = 25 個卡片

// 結果
20 個卡片：
  itemsPerPage = 25
  totalPages = 1 頁
  enablePagination = false
  → 顯示全部 20 個卡片 ✅
```

### 平板直向（768×1024px）- 分離模式

```javascript
// 輸入
width = 768
height = 1024
layout = 'separated'

// 計算過程
isMobileDevice = false (768 >= 768)
isCompactMode = false
deviceType = 'tablet-portrait'
cols = floor((768 - 40) / 150) = 4 列
availableHeight = 1024 - 60 - 60 = 904px

cardHeight = 100px
verticalSpacing = 15px
totalUnitHeight = 100 + 15 = 115px

maxRows = floor((904 - 15) / 115) = floor(7.73) = 7 行

maxCardsPerPage = 4 × 7 = 28 個卡片

// 結果
20 個卡片：
  itemsPerPage = 28
  totalPages = 1 頁
  enablePagination = false
  → 顯示全部 20 個卡片 ✅

50 個卡片：
  itemsPerPage = 28
  totalPages = ceil(50 / 28) = 2 頁
  enablePagination = true
  → 第 1 頁 28 個，第 2 頁 22 個 ✅
```

---

## 🔧 代碼實現

### 修改 initializePagination() 方法

```javascript
initializePagination() {
    const totalPairs = this.pairs.length;
    const width = this.scale.width;
    const height = this.scale.height;
    const layout = this.layout || 'mixed';

    console.log('📄 初始化分頁設置 - 總詞彙數:', totalPairs);

    // 🔥 新邏輯：根據佈局計算每頁最大卡片數
    const paginationResult = calculatePaginationWithLayout(
        totalPairs,
        width,
        height,
        layout
    );

    this.itemsPerPage = paginationResult.itemsPerPage;
    this.totalPages = paginationResult.totalPages;
    this.enablePagination = paginationResult.enablePagination;
    this.currentPage = 0;

    console.log('📄 分頁設置完成:', {
        totalPairs,
        itemsPerPage: this.itemsPerPage,
        totalPages: this.totalPages,
        enablePagination: this.enablePagination,
        maxCardsPerPage: paginationResult.maxCardsPerPage
    });
}
```

---

## ✅ 修復效果

### 修復前

```
20 個卡片 + 手機直向
→ 固定 itemsPerPage = 6
→ totalPages = 4
→ 但實際只能顯示 12 個卡片 ❌
```

### 修復後

```
20 個卡片 + 手機直向
→ 計算 maxCardsPerPage = 25
→ itemsPerPage = 25
→ totalPages = 1
→ 顯示全部 20 個卡片 ✅
```

---

## 📋 優勢

1. **自適應**：根據實際屏幕尺寸計算
2. **準確**：考慮所有佈局因素
3. **靈活**：支援多種設備和佈局
4. **一致**：分頁邏輯與佈局計算同步

---

## 🎯 集成步驟

1. **添加計算函數**
   - `calculateMaxCardsPerPage()`
   - `calculatePaginationWithLayout()`

2. **修改初始化方法**
   - 更新 `initializePagination()`

3. **測試驗證**
   - 手機直向：20 個卡片 → 1 頁 ✅
   - 手機橫向：20 個卡片 → 1 頁 ✅
   - 平板直向：50 個卡片 → 2 頁 ✅

---

**版本**：v6.0  
**日期**：2025-11-01  
**狀態**：📋 設計完成，待實施


