# 分離模式 v11.0 改進 - 快速參考卡

## 🎯 一句話總結

**分離模式現在使用動態邊距計算系統，頂部和底部邊距自動對稱，與混合模式邏輯一致。**

---

## 📊 改進內容

### 改進前（v10.0）

```javascript
const leftStartY = height * 0.083;   // 固定 8.3%
const rightStartY = height * 0.083;  // 固定 8.3%
```

### 改進後（v11.0）

```javascript
const topButtonArea = 60;
const bottomButtonArea = 60;
const availableHeight = height - topButtonArea - bottomButtonArea;

const totalCardHeight = SeparatedMarginConfig.calculateTotalCardHeight(itemCount, cardHeight, leftSpacing);
const topOffset = SeparatedMarginConfig.calculateTopOffsetForSeparated(availableHeight, totalCardHeight);

const leftStartY = topButtonArea + topOffset;
const rightStartY = topButtonArea + topOffset;
const bottomOffset = topOffset;  // 自動對稱
```

---

## 🔑 三個新增方法

### 1️⃣ calculateTopOffsetForSeparated()

```javascript
static calculateTopOffsetForSeparated(availableHeight, totalContentHeight) {
    return Math.max(10, (availableHeight - totalContentHeight) / 2);
}
```

**用途**：計算頂部偏移（自動居中）

### 2️⃣ calculateAvailableHeightWithButtons()

```javascript
static calculateAvailableHeightWithButtons(height, topButtonArea = 60, bottomButtonArea = 60) {
    return height - topButtonArea - bottomButtonArea;
}
```

**用途**：計算可用高度（排除按鈕區域）

### 3️⃣ calculateTotalCardHeight()

```javascript
static calculateTotalCardHeight(itemCount, cardHeight, spacing) {
    let rows;
    if (itemCount <= 5) {
        rows = itemCount;
    } else if (itemCount <= 10) {
        rows = 2;
    } else {
        rows = Math.ceil(itemCount / 2);
    }
    
    return rows * cardHeight + (rows - 1) * spacing;
}
```

**用途**：計算卡片總高度

---

## 📐 邊距計算公式

```
可用高度 = 屏幕高度 - 頂部按鈕 - 底部按鈕
頂部偏移 = (可用高度 - 卡片總高度) / 2
底部偏移 = 頂部偏移（自動對稱）
實際頂部位置 = 頂部按鈕 + 頂部偏移
```

---

## 📍 代碼位置

| 功能 | 文件 | 行號 |
|------|------|------|
| 新增方法 | separated-margin-config.js | 140-185 |
| 位置計算 | game.js | 1567-1599 |
| 方法調用 | game.js | 1587-1588 |

---

## 🧪 快速測試

### 測試 3 對卡片

1. 打開遊戲，選擇 3 對卡片
2. 打開 DevTools（F12）
3. 查看控制台日誌
4. 驗證：
   - `topOffset` ≈ `bottomOffset`
   - `symmetry` 顯示 ✅

### 測試 10 對卡片

1. 打開遊戲，選擇 10 對卡片
2. 查看控制台日誌
3. 驗證：
   - `topOffset` 應該更大（因為內容更少）
   - `bottomOffset` 應該與 `topOffset` 相同

---

## 💡 改進優勢

✅ **與混合模式一致** - 使用相同的邊距計算邏輯
✅ **自動對稱** - 頂部和底部邊距自動相等
✅ **內容感知** - 根據卡片數量動態調整
✅ **更好的用戶體驗** - 視覺平衡更好
✅ **易於維護** - 集中在配置文件中

---

## 📊 邊距對比

### 3 對卡片

| 指標 | 改進前 | 改進後 |
|------|-------|-------|
| 頂部邊距 | 80px | 動態 |
| 底部邊距 | 96px | 動態 |
| 對稱性 | ❌ | ✅ |

### 10 對卡片

| 指標 | 改進前 | 改進後 |
|------|-------|-------|
| 頂部邊距 | 80px | 動態 |
| 底部邊距 | 96px | 動態 |
| 對稱性 | ❌ | ✅ |

---

## 🔍 控制台日誌

### 預期輸出

```javascript
🎮 GameScene: 卡片位置（v11.0 改進） {
  leftX: "672",
  rightX: "1344",
  leftStartY: "256",
  rightStartY: "256",
  containerLayout: "33%-33%-33%",
  timerGap: "30px",
  availableHeight: "843",
  totalCardHeight: "450",
  topOffset: "196",
  bottomOffset: "196",
  symmetry: "✅ 頂部和底部邊距對稱"
}
```

### 檢查項目

- [ ] `leftStartY` = `rightStartY`
- [ ] `topOffset` = `bottomOffset`
- [ ] `symmetry` 顯示 ✅
- [ ] `availableHeight` ≈ 843px
- [ ] `totalCardHeight` 根據卡片數量變化

---

## 🎯 關鍵概念

| 概念 | 說明 |
|------|------|
| topButtonArea | 頂部按鈕區域高度（60px） |
| bottomButtonArea | 底部按鈕區域高度（60px） |
| availableHeight | 可用高度（排除按鈕區域） |
| totalCardHeight | 卡片總高度（包含間距） |
| topOffset | 頂部偏移（自動居中） |
| bottomOffset | 底部偏移（自動對稱） |

---

## 🚀 快速開始

1. **查看改進**
   - 打開 separated-margin-config.js
   - 查看第 140-185 行的新方法

2. **測試改進**
   - 打開遊戲
   - 選擇不同卡片數量
   - 查看控制台日誌

3. **驗證效果**
   - 檢查邊距是否對稱
   - 確認卡片位置正確
   - 驗證視覺效果

---

## 📚 相關文檔

| 文檔 | 內容 |
|------|------|
| SEPARATED_MODE_IMPROVEMENT_PLAN.md | 詳細改進方案 |
| SEPARATED_MODE_IMPROVEMENT_TEST.md | 測試驗證指南 |
| HYBRID_MODE_MARGIN_SYSTEM_ANALYSIS.md | 混合模式邊距系統 |

---

## ❓ 常見問題

**Q：為什麼要改進分離模式？**
A：讓分離模式也能像混合模式一樣自動為頂部和底部留出對稱的空間。

**Q：改進後會影響現有功能嗎？**
A：不會，改進只是改變邊距計算方式，不影響卡片功能。

**Q：如何驗證改進是否成功？**
A：查看控制台日誌，確認 `topOffset` = `bottomOffset`。

**Q：可以自定義邊距嗎？**
A：可以，修改 `topButtonArea` 和 `bottomButtonArea` 的值即可。

---

## 📞 需要幫助？

查看相關文檔：
- 詳細方案 → SEPARATED_MODE_IMPROVEMENT_PLAN.md
- 測試指南 → SEPARATED_MODE_IMPROVEMENT_TEST.md
- 混合模式 → HYBRID_MODE_MARGIN_SYSTEM_ANALYSIS.md

