# 📄 分頁問題分析：為什麼 IMG_0821 只顯示 12 個卡片

## 🎯 問題陳述

**現象**：IMG_0821 顯示 "1/2"（第 1 頁，共 2 頁），只有 12 個卡片  
**預期**：應該顯示全部 20 個卡片  
**原因**：分頁邏輯自動將 20 個卡片分成 2 頁

---

## 🔍 根本原因

### 分頁計算邏輯（第 542-596 行）

**文件**：`public/games/match-up-game/scenes/game.js`

```javascript
// 根據詞彙數量自動決定每頁顯示數量
if (totalPairs <= 6) {
    this.itemsPerPage = totalPairs;  // 不分頁
} else if (totalPairs <= 12) {
    this.itemsPerPage = 4;  // 每頁 4 個
} else if (totalPairs <= 18) {
    this.itemsPerPage = 5;  // 每頁 5 個
} else if (totalPairs <= 24) {
    this.itemsPerPage = 6;  // 每頁 6 個  ← 20 個卡片符合這個條件
} else {
    this.itemsPerPage = 7;  // 每頁 7 個
}

// 計算總頁數
this.totalPages = Math.ceil(totalPairs / this.itemsPerPage);
```

### 計算過程

**20 個卡片的情況**

```
totalPairs = 20
符合條件：totalPairs <= 24
itemsPerPage = 6

totalPages = Math.ceil(20 / 6) = Math.ceil(3.33) = 4 頁

頁面分配：
- 第 1 頁：卡片 1-6（6 個）
- 第 2 頁：卡片 7-12（6 個）
- 第 3 頁：卡片 13-18（6 個）
- 第 4 頁：卡片 19-20（2 個）
```

**但 IMG_0821 顯示的是 "1/2"，表示只有 2 頁**

```
這意味著：
itemsPerPage = 10（或更大）
totalPages = Math.ceil(20 / 10) = 2 頁

第 1 頁：卡片 1-10（10 個）
第 2 頁：卡片 11-20（10 個）
```

---

## 🤔 為什麼只顯示 12 個卡片？

### 可能的原因

#### 原因 1：佈局限制（最可能）

**混合模式（mixed layout）**
- 手機直向（375×667px）
- 使用緊湊模式
- 固定 5 列

```javascript
// 第 1718 行
cols = Math.min(5, itemCount);  // 固定最多 5 列

// 計算行數
const rows = Math.ceil(itemCount / cols);

// 20 個卡片 ÷ 5 列 = 4 行
// 但螢幕高度可能不足以顯示 4 行
```

#### 原因 2：可用高度限制

**手機直向（375×667px）**
```
總高度：667px
- 頂部按鈕區域：50px
- 底部按鈕區域：50px
- 可用高度：567px

每行高度計算：
- 卡片高度：~30px
- 中文文字高度：~20px
- 垂直間距：~5px
- 總高度：~55px

可容納行數：567 ÷ 55 ≈ 10 行

但實際只能顯示 2-3 行（12 個卡片）
```

#### 原因 3：分頁邏輯與佈局不匹配

**問題**：
- 分頁邏輯決定每頁 6 個卡片
- 但佈局邏輯可能只能顯示 12 個卡片
- 導致第 1 頁顯示 12 個卡片（2 行 × 6 列 或 3 行 × 4 列）

---

## 📊 分析對比

### IMG_0821 的實際情況

```
顯示：1/2（第 1 頁，共 2 頁）
卡片數：12 個
佈局：3 行 × 4 列（或 2 行 × 6 列）
```

### 預期情況

```
顯示：1/4（第 1 頁，共 4 頁）
卡片數：6 個（或 5 個）
佈局：1 行 × 6 列（或 1 行 × 5 列）
```

---

## 🔧 解決方案

### 方案 A：調整分頁邏輯（推薦）

**修改第 557-567 行**

```javascript
// 當前邏輯（不適合手機直向）
if (totalPairs <= 6) {
    this.itemsPerPage = totalPairs;
} else if (totalPairs <= 12) {
    this.itemsPerPage = 4;
} else if (totalPairs <= 18) {
    this.itemsPerPage = 5;
} else if (totalPairs <= 24) {
    this.itemsPerPage = 6;  // 20 個卡片 → 6 個/頁 → 4 頁
} else {
    this.itemsPerPage = 7;
}

// 新邏輯（根據設備類型調整）
const isMobileDevice = window.innerWidth < 768;
const isPortrait = window.innerHeight > window.innerWidth;

if (isMobileDevice && isPortrait) {
    // 手機直向：每頁 5 個卡片
    if (totalPairs <= 5) {
        this.itemsPerPage = totalPairs;
    } else if (totalPairs <= 10) {
        this.itemsPerPage = 5;
    } else if (totalPairs <= 15) {
        this.itemsPerPage = 5;
    } else {
        this.itemsPerPage = 5;  // 固定 5 個/頁
    }
} else {
    // 其他設備：使用原邏輯
    if (totalPairs <= 6) {
        this.itemsPerPage = totalPairs;
    } else if (totalPairs <= 12) {
        this.itemsPerPage = 4;
    } else if (totalPairs <= 18) {
        this.itemsPerPage = 5;
    } else if (totalPairs <= 24) {
        this.itemsPerPage = 6;
    } else {
        this.itemsPerPage = 7;
    }
}
```

### 方案 B：禁用分頁（簡單）

```javascript
// 手機直向不使用分頁
if (isMobileDevice && isPortrait) {
    this.itemsPerPage = totalPairs;  // 顯示全部卡片
    this.enablePagination = false;
} else {
    // 其他設備使用分頁
    // ... 原邏輯
}
```

### 方案 C：根據佈局模式調整

```javascript
// 根據佈局模式決定每頁卡片數
if (this.layout === 'mixed') {
    // 混合模式：每頁 5 個卡片（1 行 × 5 列）
    this.itemsPerPage = 5;
} else if (this.layout === 'separated') {
    // 分離模式：每頁 6 個卡片（2 行 × 3 列）
    this.itemsPerPage = 6;
}
```

---

## ✅ 修復效果

### 修復前

```
20 個卡片
↓
itemsPerPage = 6
↓
totalPages = 4
↓
第 1 頁顯示 6 個卡片
但實際顯示 12 個卡片（佈局限制）
```

### 修復後（方案 A）

```
20 個卡片
↓
itemsPerPage = 5（手機直向）
↓
totalPages = 4
↓
第 1 頁顯示 5 個卡片
符合佈局限制（1 行 × 5 列）
```

### 修復後（方案 B）

```
20 個卡片
↓
itemsPerPage = 20（禁用分頁）
↓
totalPages = 1
↓
顯示全部 20 個卡片
```

---

## 📋 建議

### 短期解決方案

**禁用手機直向的分頁**
- 簡單快速
- 用戶體驗好
- 適合小屏幕

### 長期解決方案

**根據設備類型和佈局模式調整分頁**
- 更靈活
- 支援多種設備
- 需要更多測試

---

## 🎯 下一步

1. **確認問題**
   - 驗證 IMG_0821 的實際卡片數
   - 檢查分頁設置

2. **選擇方案**
   - 方案 B（禁用分頁）最簡單
   - 方案 A（調整邏輯）最靈活

3. **實施修復**
   - 修改 initializePagination() 方法
   - 測試所有設備類型

4. **驗證效果**
   - 手機直向：應該顯示全部卡片或合理分頁
   - 其他設備：保持原有分頁邏輯

---

**分析日期**：2025-11-01  
**問題等級**：🟡 中等  
**修復難度**：🟢 低


