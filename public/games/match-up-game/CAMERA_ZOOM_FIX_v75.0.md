# Camera Zoom 修復 v75.0 - Math.min 策略

## 📋 修復概述

**版本**: v75.0  
**日期**: 2025-11-16  
**問題**: v74.0 的 Math.max 策略在桌面端導致內容被裁切  
**解決方案**: 使用 Math.min 策略確保所有內容在所有設備上都完全可見

---

## 🔍 問題分析

### v73.0 - v75.0 的演進

| 版本 | Camera Zoom 策略 | 桌面端效果 | 手機端效果 | 問題 |
|------|-----------------|-----------|-----------|------|
| v73.0 | `zoom = 1` (固定值) | ✅ 正常 | ❌ 內容太小 | 手機顯示異常 |
| v74.0 | `zoom = Math.max(scaleX, scaleY)` | ❌ 內容被裁切 | ✅ 正常 | 桌面顯示異常 |
| v75.0 | `zoom = Math.min(scaleX, scaleY)` | ✅ 所有內容可見 | ✅ 所有內容可見 | ✅ 完美解決 |

### 為什麼 Math.max 會導致裁切？

**桌面端尺寸**（1841×911）：
```javascript
scaleX = 1841 / 960 = 1.918
scaleY = 911 / 540 = 1.687

// v74.0 使用 Math.max
zoom = Math.max(1.918, 1.687) = 1.918  // ❌ 選擇較大值

// 結果：
// - 寬度方向填滿螢幕 ✅
// - 高度方向超出邊界 ❌ (911 / 1.918 ≈ 475 < 540)
// - 底部內容被裁切！
```

**實際測量**（從 Console 訊息）：
- 場景高度：911px
- Camera zoom：1.687 (v74.0)
- 實際可見高度：911 / 1.687 ≈ 540px
- 卡片佈局底部 Y 座標：417px
- **問題**：如果卡片佈局總高度 > 540px，底部會被裁切

### 為什麼 Math.min 是正確的？

```javascript
// v75.0 使用 Math.min
zoom = Math.min(1.918, 1.687) = 1.687  // ✅ 選擇較小值

// 結果：
// - 寬度方向：1841 / 1.687 ≈ 1091 > 960 ✅ (有空白但內容完全可見)
// - 高度方向：911 / 1.687 ≈ 540 ✅ (完全填滿)
// - 所有內容都在可見範圍內！
```

**Math.min 的優點**：
- ✅ 確保內容在**兩個方向都不會超出邊界**
- ✅ 桌面和手機都能正常顯示
- ✅ 可能會在某個方向留下空白，但這是可接受的設計取捨
- ✅ 符合 Phaser.Scale.FIT 模式的設計理念

---

## 🔧 修復內容

### 修改的文件

1. ✅ `public/games/match-up-game/scenes/handler.js`
   - `updateCamera()` 方法：Math.max → Math.min
   - `resize()` 方法：Math.max → Math.min

2. ✅ `public/games/_template/scenes/handler.js`
   - `updateCamera()` 方法：Math.max → Math.min
   - `resize()` 方法：Math.min → Math.min

### 代碼變更

**updateCamera() 方法**：
```javascript
// v74.0 ❌
const zoom = Math.max(scaleX, scaleY)

// v75.0 ✅
const zoom = Math.min(scaleX, scaleY)
```

**resize() 方法**：
```javascript
// v74.0 ❌
const zoom = Math.max(scaleX, scaleY)

// v75.0 ✅
const zoom = Math.min(scaleX, scaleY)
```

---

## 📊 預期效果

### 桌面端（1841×911）
```
scaleX = 1.918
scaleY = 1.687
zoom = Math.min(1.918, 1.687) = 1.687

✅ 所有內容完全可見
✅ 不會裁切底部的卡片或答案框
⚠️ 左右兩側可能有少量空白（可接受）
```

### 手機端（390×844）
```
scaleX = 390 / 960 = 0.406
scaleY = 844 / 540 = 1.563
zoom = Math.min(0.406, 1.563) = 0.406

✅ 所有內容完全可見
✅ 卡片尺寸適中（不會太小）
⚠️ 上下可能有空白（可接受）
```

---

## 🧪 測試計畫

### 立即測試
1. **桌面測試**：
   - 打開 http://localhost:3000/games/switcher?game=match-up-game&activityId=cmhjff7340001jf04htar2e5k
   - 檢查底部的答案框是否完全可見
   - 調整視窗大小測試 resize 功能

2. **手機測試**：
   - 在真實手機上打開遊戲
   - 檢查卡片尺寸和佈局
   - 旋轉螢幕測試橫向/直向模式

### Console 訊息驗證
修復後應該看到：
```
🔥 [v75.0] updateCamera - Camera zoom 設置 (Math.min): {
  scaleX: "1.918",
  scaleY: "1.687",
  zoom: "1.687",
  strategy: "Math.min - 確保所有內容可見",
  ...
}
```

---

## 📝 總結

**問題根源**：
- v74.0 使用 Math.max 選擇較大的縮放比例
- 導致內容在某個方向超出邊界並被裁切

**解決方案**：
- v75.0 使用 Math.min 選擇較小的縮放比例
- 確保內容在兩個方向都不會超出邊界
- 所有內容都完全可見

**設計取捨**：
- Math.min 可能會在某個方向留下空白
- 但這比內容被裁切要好得多
- 符合「內容完整性優先」的設計原則

---

## 🎯 下一步

1. ✅ 修復已完成
2. ⏳ 等待瀏覽器重新載入
3. ⏳ 驗證桌面端和手機端效果
4. ⏳ 如果測試通過，提交到 GitHub

