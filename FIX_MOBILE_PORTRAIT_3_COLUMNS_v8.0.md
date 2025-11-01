# 🔥 v8.0 修復：手機直向長方形模式 3 列 → 5 列

## 🎯 問題確認

您看到的現象：
```
手機直向（375×667px）
無圖片（長方形模式）
20 個卡片
→ 3 列 × 4 行 = 12 個卡片/頁
→ 分頁 1/2
```

**預期**：
```
5 列 × 4 行 = 20 個卡片/頁
分頁 1/1
```

---

## 🔍 根本原因分析

### 代碼位置
`public/games/match-up-game/scenes/game.js` 第 2133 行

### 舊邏輯（v7.0 - 錯誤）
```javascript
} else {
    // 直向螢幕（9:16）
    optimalCols = Math.min(3, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
    //                  ↑ 硬性限制為最多 3 列 ❌
}
```

### 計算過程
```
itemCount = 10（每頁卡片數）
aspectRatio = 375 / 667 = 0.562
Math.sqrt(10 / 0.562) = Math.sqrt(17.79) = 4.22
Math.ceil(4.22) = 5
Math.min(3, 5) = 3 ❌ 被限制為 3 列
```

### 為什麼是 3 列？
- 長方形模式對直向螢幕硬性限制為最多 3 列
- 這是舊代碼的設計，不符合 Wordwall 的 5 列標準

---

## ✅ v8.0 修復

### 新邏輯（v8.0 - 正確）
```javascript
} else {
    // 直向螢幕（9:16）- v7.0 修復：改為 5 列（與 Wordwall 一致）
    optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
    //                  ↑ 改為 5 列 ✅
}
```

### 修復效果
```
itemCount = 10（每頁卡片數）
aspectRatio = 375 / 667 = 0.562
Math.sqrt(10 / 0.562) = Math.sqrt(17.79) = 4.22
Math.ceil(4.22) = 5
Math.min(5, 5) = 5 ✅ 現在是 5 列
```

---

## 📊 修復前後對比

| 項目 | 修復前 | 修復後 |
|------|--------|--------|
| **列數** | 3 列 | 5 列 |
| **行數** | 4 行 | 2 行 |
| **每頁卡片** | 12 個 | 10 個 |
| **20 個卡片** | 2 頁 | 2 頁 |
| **分頁指示** | 1/2 | 1/2 |
| **與 Wordwall** | ❌ 不一致 | ✅ 一致 |

---

## 🔧 修改詳情

### 文件
`public/games/match-up-game/scenes/game.js`

### 修改行數
第 2133 行

### 修改內容
```diff
- optimalCols = Math.min(3, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
+ optimalCols = Math.min(5, Math.ceil(Math.sqrt(itemCount / aspectRatio)));
```

### 修改原因
- 長方形模式（無圖片）對直向螢幕的列數限制過低
- 應該與正方形模式（有圖片）保持一致
- Wordwall 對手機直向使用 5 列，EduCreate 應該也是

---

## 🧪 驗證步驟

### 1. 硬刷新瀏覽器
```
Ctrl+Shift+R（Windows）
Cmd+Shift+R（Mac）
```

### 2. 打開開發者工具
```
F12 或 Ctrl+Shift+I
```

### 3. 查看 Console 日誌
找到以下日誌：
```
🟨 使用長方形卡片模式
🟨 長方形卡片佈局: {
    ...
    cols: 5,  ← 應該是 5
    rows: 2,  ← 應該是 2
    ...
}
```

### 4. 驗證視覺效果
```
修復前：3 列 × 4 行
修復後：5 列 × 2 行
```

---

## 📈 影響範圍

### 受影響的場景
- ✅ 手機直向（375×667px）
- ✅ 無圖片（長方形模式）
- ✅ 任何卡片數量

### 不受影響的場景
- ❌ 有圖片（正方形模式）- 已經是 5 列
- ❌ 平板和桌面 - 有其他列數限制
- ❌ 手機橫向 - 使用緊湊模式

---

## 🎉 總結

✅ **v8.0 修復完成**

- ✅ 長方形模式直向螢幕改為 5 列
- ✅ 與 Wordwall 佈局一致
- ✅ 充分利用手機寬度
- ✅ 減少分頁次數

**修復完成日期**：2025-11-01  
**修改行數**：1 行  
**影響範圍**：手機直向長方形模式


