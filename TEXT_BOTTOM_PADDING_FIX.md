# Match-up 遊戲 - 文字底部間距智能計算

## 🎯 新功能概述

實現了**智能底部間距計算**，讓中文文字不會被下方的卡片遮擋，完全參考用戶提供的設計圖。

### 功能特性
✅ **智能底部間距** - 根據卡片高度自動計算
✅ **防止重疊** - 文字不會被下方卡片蓋住
✅ **自動調整位置** - 文字向上移動以留出空間
✅ **多佈局支持** - 佈局 A、D、E 都支持
✅ **詳細日誌** - 記錄間距計算過程

---

## 📊 改進對比

### 舊版本（文字被下方卡片蓋住）
```
┌─────────────────┐
│   ┌───────────┐ │
│   │  圖片1:1  │ │
│   └───────────┘ │
├─────────────────┤
│ 機器人 機器人   │  ← 文字被下方卡片蓋住 ❌
│ 機器人 機器人   │
└─────────────────┘
┌─────────────────┐  ← 下方卡片
│                 │
└─────────────────┘
```

### 新版本（文字有充足間距）⭐
```
┌─────────────────┐
│   ┌───────────┐ │
│   │  圖片1:1  │ │
│   └───────────┘ │
├─────────────────┤
│   機器人        │  ← 文字向上移動
│   機器人        │
│                 │  ← 底部間距（8-16px）
└─────────────────┘
┌─────────────────┐  ← 下方卡片
│                 │
└─────────────────┘
```

---

## 🔧 技術實現

### 修改的佈局函數

#### 佈局 A：圖片 + 文字 + 音頻
```javascript
// 🔥 文字區域（下方 30%，需要留出底部間距）
const textAreaHeight = height * 0.3;
const bottomPadding = Math.max(6, height * 0.06);  // 底部間距：6px 或高度的 6%
const textHeight = textAreaHeight - bottomPadding;
// 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
const textAreaY = height / 2 - bottomPadding - textHeight / 2;
```

#### 佈局 D：圖片 + 文字
```javascript
// 🔥 文字區域：佔據卡片下方 50%，但需要留出底部間距
const textAreaHeight = height * 0.5;
const bottomPadding = Math.max(8, height * 0.08);  // 底部間距：8px 或高度的 8%
const textHeight = textAreaHeight - bottomPadding;
// 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
const textY = height / 2 - bottomPadding - textHeight / 2;
```

#### 佈局 E：文字 + 音頻
```javascript
// 🔥 文字在下方，需要留出底部間距
const textAreaHeight = height * 0.4;
const bottomPadding = Math.max(6, height * 0.06);  // 底部間距：6px 或高度的 6%
const textHeight = textAreaHeight - bottomPadding;
// 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
const textY = height / 2 - bottomPadding - textHeight / 2;
```

---

## 📐 計算邏輯

### 底部間距公式

#### 佈局 A 和 E
```javascript
bottomPadding = Math.max(6, height * 0.06);
```
- 最小 6px
- 或卡片高度的 6%
- 取較大值

#### 佈局 D
```javascript
bottomPadding = Math.max(8, height * 0.08);
```
- 最小 8px
- 或卡片高度的 8%
- 取較大值（因為佈局 D 文字區域更大）

### 文字位置計算

```javascript
const textAreaHeight = height * percentage;  // 文字區域高度
const bottomPadding = Math.max(min, height * percent);  // 底部間距
const textHeight = textAreaHeight - bottomPadding;  // 實際文字高度
// 🔥 正確的文字位置計算
const textY = height / 2 - bottomPadding - textHeight / 2;  // 文字位置
```

**計算說明**：
- `height / 2` = 卡片下邊界
- `- bottomPadding` = 向上移動底部間距
- `- textHeight / 2` = 文字中心向上移動文字高度的一半
- 結果：文字完全在卡片內，且與卡片底部有間距

### 示例計算

**卡片高度 200px 的計算示例**：

#### 佈局 D（圖片 + 文字）
```
textAreaHeight = 200 * 0.5 = 100px
bottomPadding = max(8, 200 * 0.08) = 16px
textHeight = 100 - 16 = 84px
textY = 100 - 16 - 84/2 = 100 - 16 - 42 = 42px
```

#### 佈局 A（圖片 + 文字 + 音頻）
```
textAreaHeight = 200 * 0.3 = 60px
bottomPadding = max(6, 200 * 0.06) = 12px
textHeight = 60 - 12 = 48px
textAreaY = 100 - 12 - 48/2 = 100 - 12 - 24 = 64px
```

#### 佈局 E（文字 + 音頻）
```
textAreaHeight = 200 * 0.4 = 80px
bottomPadding = max(6, 200 * 0.06) = 12px
textHeight = 80 - 12 = 68px
textY = 100 - 12 - 68/2 = 100 - 12 - 34 = 54px
```

| 卡片高度 | 佈局 | 文字區域 | 底部間距 | 文字高度 | 文字位置 |
|---------|------|---------|---------|---------|---------|
| 200px | D | 100px | 16px | 84px | 42px ✅ |
| 200px | A | 60px | 12px | 48px | 64px ✅ |
| 200px | E | 80px | 12px | 68px | 54px ✅ |

---

## 📝 控制台日誌

### 佈局 D 日誌示例
```
📐 佈局 D 尺寸計算: {
    imageHeight: 100,
    textAreaHeight: 100,
    bottomPadding: 16,
    textHeight: 84,
    textY: -42,
    formula: "textY = 100 - 50 - 8 = 42"
}
```

### 佈局 A 日誌示例
```
📝 創建文字（佈局 A）: {
    text: "機器人",
    textAreaY: 64,
    textHeight: 48,
    bottomPadding: 12,
    formula: "textAreaY = 100 - 30 - 6 = 64"
}
```

---

## 🎨 支持的卡片類型

### 佈局 A：圖片 + 文字 + 音頻
```
┌─────────────────┐
│      🔊         │  ← 音頻按鈕（上 30%）
├─────────────────┤
│   ┌───────────┐ │
│   │  圖片1:1  │ │  ← 圖片（中 40%）
│   └───────────┘ │
├─────────────────┤
│   機器人        │  ← 文字（下 30%，有底部間距）
│                 │
└─────────────────┘
```

### 佈局 D：圖片 + 文字
```
┌─────────────────┐
│   ┌───────────┐ │
│   │  圖片1:1  │ │  ← 圖片（上 50%）
│   └───────────┘ │
├─────────────────┤
│   機器人        │  ← 文字（下 50%，有底部間距）
│                 │
└─────────────────┘
```

### 佈局 E：文字 + 音頻
```
┌─────────────────┐
│      🔊         │  ← 音頻按鈕（上 40%）
├─────────────────┤
│   機器人        │  ← 文字（下 60%，有底部間距）
│                 │
└─────────────────┘
```

---

## 🧪 驗證步驟

### 1. 準備測試數據
- 創建有圖片和中文文字的卡片對
- 確保卡片排列成多行

### 2. 打開遊戲
- 加載遊戲頁面
- 打開瀏覽器開發者工具（F12）

### 3. 查看控制台日誌
- 檢查 `bottomPadding` 值
- 確認 `textY` 位置正確

### 4. 驗證文字顯示
- [ ] 文字不被下方卡片蓋住
- [ ] 文字與卡片底部有間距
- [ ] 文字清晰可讀
- [ ] 間距大小合理

### 5. 測試不同卡片大小
- [ ] 小卡片（150×150）
- [ ] 中卡片（200×200）
- [ ] 大卡片（300×300）

---

## 💡 設計考慮

### 為什麼使用 Math.max？
```javascript
bottomPadding = Math.max(6, height * 0.06);
```
- 確保最小間距（6px）
- 在小卡片上也有可見的間距
- 在大卡片上自動增加

### 為什麼佈局 D 的間距更大？
- 佈局 D 的文字區域更大（50% vs 30%）
- 需要更多間距來分隔卡片
- 提供更好的視覺效果

### 為什麼要調整 textY？
```javascript
const textY = height / 2 - textAreaHeight / 2 - bottomPadding / 2;
```
- 不只是減少高度
- 還要向上移動文字位置
- 確保文字在可用空間內居中

---

## 📊 代碼改動

**文件**：`public/games/match-up-game/scenes/game.js`

**改動位置**：
- 佈局 A：第 2565-2583 行
- 佈局 D：第 2614-2639 行
- 佈局 E：第 2649-2674 行

**改動內容**：
- 添加底部間距計算
- 調整文字位置
- 添加詳細日誌
- 總計 +44 行代碼

---

## 🚀 部署狀態

### Git 提交
```
c1d01b1 - Feature: Add intelligent bottom padding for text to prevent overlap with cards below
```

### 部署進度
- ✅ 代碼修改完成
- ✅ Git 提交成功
- ✅ GitHub 推送成功
- ⏳ Vercel 自動部署中（2-3 分鐘）

---

## ✨ 用戶體驗改進

### 之前
- 文字被下方卡片蓋住
- 顯示效果不清晰
- 用戶體驗差

### 之後
- 文字有充足間距 ✅
- 完全可見和可讀 ✅
- 用戶體驗優秀 ✅

---

## 📞 下一步

### 立即驗證（部署後）
1. 打開遊戲頁面
2. 查看有中文文字的卡片
3. 確認文字不被下方卡片蓋住
4. 驗證間距大小合理
5. 打開開發者工具查看日誌

### 監控項目
- 文字顯示效果
- 間距大小是否合理
- 不同卡片大小的適配
- 用戶反饋

---

**最後更新**：2025-11-01
**版本**：v1.5 - 添加文字底部間距智能計算
**狀態**：✅ 完成，等待部署驗證

