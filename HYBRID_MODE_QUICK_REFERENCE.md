# 混合模式邊距系統 - 快速參考卡

## 🎯 一句話總結

**混合模式通過三層邊距系統（屏幕級 → 內容級 → 單元級）實現自動垂直居中和對稱邊距。**

---

## 📊 三層邊距系統

```
┌─────────────────────────────────────────┐
│ 第 1 層：屏幕級別                       │
│ ├─ topButtonAreaHeight（頂部按鈕）     │
│ ├─ bottomButtonAreaHeight（底部按鈕）  │
│ └─ sideMargin（側邊距）                 │
├─────────────────────────────────────────┤
│ 第 2 層：內容級別 ⭐ 關鍵層             │
│ ├─ topOffset（頂部偏移）                │
│ │  ├─ 緊湊模式：30px                   │
│ │  └─ 桌面模式：(height - content) / 2 │
│ └─ bottomOffset（底部偏移，自動對稱）  │
├─────────────────────────────────────────┤
│ 第 3 層：單元級別                       │
│ ├─ cardHeightInFrame（卡片高度）       │
│ ├─ chineseTextHeight（文字高度）       │
│ │  ├─ 正方形：squareSize × 0.6        │
│ │  └─ 長方形：30px                    │
│ └─ verticalSpacing（卡片-文字間距）    │
└─────────────────────────────────────────┘
```

---

## 🔑 三個核心公式

### 1️⃣ 頂部偏移（topOffset）

```javascript
const topOffset = isCompactMode ? 30 : Math.max(10, (height - totalContentHeight) / 2);
```

| 模式 | 值 | 說明 |
|------|-----|------|
| 手機 | 30px | 固定值 |
| 桌面 | 動態 | 自動居中 |

### 2️⃣ 內容總高度（totalContentHeight）

```javascript
const totalContentHeight = rows * totalUnitHeight;
```

| 變量 | 說明 |
|------|------|
| rows | 行數 = ceil(itemCount / cols) |
| totalUnitHeight | 每行高度 = 卡片 + 文字 + 間距 |

### 3️⃣ 單元總高度（totalUnitHeight）

```javascript
totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;
```

| 組件 | 說明 |
|------|------|
| cardHeightInFrame | 英文卡片高度 |
| chineseTextHeight | 中文文字區域高度 |
| verticalSpacing | 卡片和文字之間的間距 |

---

## 📍 代碼位置速查

| 功能 | 位置 | 行號 |
|------|------|------|
| 頂部偏移 | game.js | 3350 |
| 內容高度 | game.js | 3349 |
| 單元高度 | game.js | 3164/3273 |
| 卡片位置 | game.js | 3463 |
| 文字高度 | game.js | 3163/3271 |
| 間距計算 | game.js | 2690 |

---

## 🔧 快速調整

### 增加頂部空間

```javascript
// 第 3350 行
const topOffset = isCompactMode ? 50 : Math.max(30, (height - totalContentHeight) / 2);
```

### 增加文字區域

```javascript
// 第 3163 行（正方形）
chineseTextHeight = squareSize * 0.8;

// 第 3271 行（長方形）
chineseTextHeight = 40;
```

### 增加卡片間距

```javascript
// 第 2690 行
dynamicVerticalSpacing = Math.max(15, Math.min(50, availableHeight * 0.04));
```

---

## 📊 邊距計算流程

```
1. 計算可用高度 = 屏幕高度 - 按鈕區域
2. 計算卡片尺寸（cardHeightInFrame）
3. 計算文字高度（chineseTextHeight）
4. 計算間距（verticalSpacing）
5. 計算單元高度 = 卡片 + 文字 + 間距
6. 計算內容高度 = 行數 × 單元高度
7. 計算頂部偏移 = (屏幕高度 - 內容高度) / 2
8. 計算底部偏移 = 頂部偏移（自動對稱）
9. 計算卡片位置 = 頂部偏移 + 行號 × 單元高度 + 單元高度 / 2
```

---

## 💡 邊距系統優勢

✅ 自動垂直居中
✅ 對稱邊距設計
✅ 響應式適配
✅ 設備自動檢測
✅ 內容感知調整

---

## 🎨 實際數值示例

**1920×963 屏幕，3 行 4 列，有圖片**

```
可用高度：963 - 120 = 843px
單元高度：100 + 60 + 20 = 180px
內容高度：3 × 180 = 540px
頂部偏移：(843 - 540) / 2 = 151.5px
底部偏移：151.5px（自動對稱）
```

---

## 🧪 測試檢查

- [ ] 頂部邊距符合預期
- [ ] 底部邊距與頂部對稱
- [ ] 卡片完全在框內
- [ ] 文字不被裁切
- [ ] 手機模式正確
- [ ] 桌面模式正確
- [ ] 不同卡片數量都能顯示
- [ ] 控制台無錯誤

---

## 📚 相關文檔

| 文檔 | 內容 |
|------|------|
| HYBRID_MODE_MARGIN_SYSTEM_ANALYSIS.md | 詳細系統分析 |
| SEPARATED_VS_HYBRID_MARGIN_COMPARISON.md | 模式對比 |
| HYBRID_MODE_MARGIN_PRACTICAL_GUIDE.md | 實踐指南 |
| HYBRID_MODE_MARGIN_SUMMARY.md | 完整總結 |

---

## 🎯 關鍵概念

| 概念 | 說明 |
|------|------|
| topOffset | 內容距離屏幕頂部的距離 |
| totalContentHeight | 所有卡片的總高度 |
| totalUnitHeight | 單個單元的高度 |
| isCompactMode | 是否為手機模式 |
| 自動居中 | 內容自動在屏幕中央 |
| 對稱邊距 | 頂部 = 底部邊距 |

---

## ❓ 常見問題

**Q：為什麼要分三層？**
A：分層便於管理複雜佈局，每層職責清晰。

**Q：手機和桌面邊距為什麼不同？**
A：手機空間有限，需要固定邊距；桌面可以自動居中。

**Q：底部邊距為什麼自動對稱？**
A：自動對稱確保視覺平衡，無需手動計算。

**Q：如何快速調整邊距？**
A：修改 topOffset、chineseTextHeight 或 verticalSpacing 的公式。

---

## 🚀 快速開始

1. **查看當前邊距**
   - 打開 Chrome DevTools
   - 查看控制台日誌（第 3352-3360 行）

2. **調整邊距**
   - 打開 game.js
   - 找到相應行號
   - 修改公式

3. **測試效果**
   - 刷新頁面（F5）
   - 檢查邊距是否符合預期
   - 驗證卡片位置

4. **驗證結果**
   - 檢查控制台日誌
   - 確認邊距計算正確
   - 測試不同設備

---

## 📞 需要幫助？

查看相關文檔：
- 詳細分析 → HYBRID_MODE_MARGIN_SYSTEM_ANALYSIS.md
- 實踐指南 → HYBRID_MODE_MARGIN_PRACTICAL_GUIDE.md
- 完整總結 → HYBRID_MODE_MARGIN_SUMMARY.md

