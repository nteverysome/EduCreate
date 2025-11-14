# 🚀 快速參考 - 分離佈局設計

## 📍 佈局策略

```
itemCount ≤ 5  →  垂直單列 (1 列)
itemCount = 7  →  多行多列 (2 列)
itemCount = 10 →  水平排列 (1 行 × 10 列)
itemCount = 20 →  多行排列 (2 行 × 10 列)
```

---

## 📊 預設值配置

| 值 | 左側 | 右側 | 卡片大小 |
|----|------|------|---------|
| **3** | 1×3 | 1×3 | 120×65px |
| **4** | 1×4 | 1×4 | 110×56px |
| **5** | 1×5 | 1×5 | 100×48px |
| **7** | 2×4 | 1×7 | 80×35px |
| **10** | 1×10 | 1×10 | 60×28px |
| **20** | 2×10 | 1×20 | 70×40px |

---

## 💻 核心方法

### SeparatedLayoutCalculator

```javascript
// 計算左側佈局
calculateLeftLayout(itemCount)

// 計算右側佈局
calculateRightLayout(itemCount)

// 計算卡片大小
calculateCardSize(itemCount)

// 計算左側卡片位置
calculateLeftCardPositions(itemCount, startX, startY, spacing)

// 計算右側卡片位置
calculateRightCardPositions(itemCount, startX, startY, spacing)
```

---

## 🔧 修改文件

1. `public/games/match-up-game/config/separated-layout-calculator.js`
   - 添加 5 個新方法

2. `public/games/match-up-game/scenes/game.js`
   - 修改 `createLeftRightSingleColumn()`

---

## ✅ 驗證清單

- [ ] 代碼無錯誤
- [ ] 所有 6 個預設值都能正確計算
- [ ] 佈局切換正確
- [ ] 卡片大小合適
- [ ] 所有 35 個現有測試通過
- [ ] 視覺驗證通過

---

## 📚 相關文檔

- `SEPARATED_LAYOUT_DESIGN_FROM_SCREENSHOTS.md` - 設計分析
- `SEPARATED_LAYOUT_IMPLEMENTATION_CODE.md` - 實現代碼
- `SEPARATED_LAYOUT_EXECUTION_PLAN.md` - 執行計劃
- `SEPARATED_LAYOUT_FINAL_SUMMARY.md` - 最終總結

---

**版本**: 1.0 | **狀態**: ✅ 準備實施

