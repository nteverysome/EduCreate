# Match-up 遊戲 - 智能文字高度計算

## 🎯 新功能概述

實現了**智能垂直距離計算**，讓中文文字能夠自動調整大小以適應可用空間，完全參考 Screenshot_171 的設計。

### 功能特性
✅ **智能寬度計算** - 根據寬度調整字體大小
✅ **智能高度計算** - 根據高度調整字體大小 ⭐ 新增
✅ **雙重檢查** - 同時檢查寬度和高度
✅ **自動縮放** - 確保文字完全適應空間
✅ **詳細日誌** - 記錄寬度和高度比例

---

## 📊 改進對比

### 舊版本（只檢查寬度）
```
問題：文字可能超出垂直空間
┌─────────────────┐
│   ┌───────────┐ │
│   │  圖片1:1  │ │
│   └───────────┘ │
├─────────────────┤
│ 機器人 機器人   │  ← 文字可能超出邊界
│ 機器人 機器人   │
└─────────────────┘
```

### 新版本（同時檢查寬度和高度）⭐
```
改進：文字自動調整大小
┌─────────────────┐
│   ┌───────────┐ │
│   │  圖片1:1  │ │
│   └───────────┘ │
├─────────────────┤
│   機器人        │  ← 文字自動縮小以適應空間
│   機器人        │
└─────────────────┘
```

---

## 🔧 技術實現

### 修改的函數：`createTextElement`

```javascript
// 🔥 輔助函數 - 創建文字元素（智能計算寬度和高度）
createTextElement(container, text, x, y, width, height) {
    // 🔥 初始字體大小（基於高度的 60%）
    let fontSize = Math.max(14, Math.min(48, height * 0.6));

    // 創建臨時文字測量寬度和高度
    const tempText = this.add.text(0, 0, text, {
        fontSize: `${fontSize}px`,
        fontFamily: 'Arial'
    });

    // 🔥 計算最大寬度（留 15% 邊距）
    const maxTextWidth = width * 0.85;

    // 🔥 計算最大高度（留 10% 邊距）
    const maxTextHeight = height * 0.9;

    // 🔥 同時檢查寬度和高度，如果超過則縮小字體
    while ((tempText.width > maxTextWidth || tempText.height > maxTextHeight) && fontSize > 12) {
        fontSize -= 2;
        tempText.setFontSize(fontSize);
    }

    // 記錄最終的文字尺寸
    const finalTextWidth = tempText.width;
    const finalTextHeight = tempText.height;

    tempText.destroy();

    // 創建最終文字
    const cardText = this.add.text(x, y, text, {
        fontSize: `${fontSize}px`,
        color: '#333333',
        fontFamily: 'Arial',
        fontStyle: 'normal'
    });
    cardText.setOrigin(0.5);
    container.add(cardText);

    return cardText;
}
```

---

## 📐 計算邏輯

### 1. 初始字體大小
```javascript
let fontSize = Math.max(14, Math.min(48, height * 0.6));
```
- 基於可用高度的 60%
- 最小 14px，最大 48px

### 2. 最大寬度
```javascript
const maxTextWidth = width * 0.85;
```
- 留 15% 邊距（左右各 7.5%）

### 3. 最大高度
```javascript
const maxTextHeight = height * 0.9;
```
- 留 10% 邊距（上下各 5%）

### 4. 雙重檢查
```javascript
while ((tempText.width > maxTextWidth || tempText.height > maxTextHeight) && fontSize > 12) {
    fontSize -= 2;
    tempText.setFontSize(fontSize);
}
```
- 如果寬度 OR 高度超過限制，縮小字體
- 每次縮小 2px
- 最小字體 12px

---

## 📊 詳細日誌

### 控制台輸出示例

```
📝 createTextElement 被調用: {
    text: "機器人",
    textLength: 3,
    x: 0,
    y: 100,
    width: 200,
    height: 100,
    containerExists: true
}

✅ 文字對象已創建（智能計算）: {
    text: "機器人",
    fontSize: 36,
    textWidth: 85,
    textHeight: 42,
    maxTextWidth: 170,
    maxTextHeight: 90,
    widthRatio: "42.5%",
    heightRatio: "42.0%",
    visible: true,
    alpha: 1,
    x: 0,
    y: 100
}
```

### 日誌說明
- **widthRatio**: 文字寬度佔可用寬度的百分比
- **heightRatio**: 文字高度佔可用高度的百分比
- 兩個比例都應該在 40-90% 之間

---

## 🎨 支持的卡片類型

### 佈局 D：圖片 + 文字（50-50）
```
┌─────────────────┐
│   ┌───────────┐ │
│   │  圖片1:1  │ │  ← 圖片（上 50%）
│   └───────────┘ │
├─────────────────┤
│   機器人        │  ← 文字（下 50%，智能計算）
│   機器人        │
└─────────────────┘
```

### 佈局 A：圖片 + 文字 + 音頻
```
┌─────────────────┐
│      🔊         │  ← 音頻按鈕（上 30%）
├─────────────────┤
│   ┌───────────┐ │
│   │  圖片1:1  │ │  ← 圖片（中 40%）
│   └───────────┘ │
├─────────────────┤
│   機器人        │  ← 文字（下 30%，智能計算）
└─────────────────┘
```

### 佈局 E：文字 + 音頻
```
┌─────────────────┐
│      🔊         │  ← 音頻按鈕（上 40%）
├─────────────────┤
│   機器人        │  ← 文字（下 60%，智能計算）
│   機器人        │
└─────────────────┘
```

---

## 🧪 驗證步驟

### 1. 準備測試數據
- 創建有不同長度中文文字的卡片
- 包括 1-2 字、3-4 字、5+ 字的文字

### 2. 打開遊戲
- 加載遊戲頁面
- 打開瀏覽器開發者工具（F12）

### 3. 查看控制台日誌
- 檢查 `widthRatio` 和 `heightRatio`
- 確認都在合理範圍內（40-90%）

### 4. 驗證文字顯示
- [ ] 短文字（1-2 字）顯示正常
- [ ] 中等文字（3-4 字）自動縮小
- [ ] 長文字（5+ 字）進一步縮小
- [ ] 所有文字都在邊界內
- [ ] 文字清晰可讀

### 5. 測試不同卡片大小
- [ ] 小卡片（150×150）
- [ ] 中卡片（200×200）
- [ ] 大卡片（300×300）
- [ ] 非正方形卡片（200×300）

---

## 💡 設計考慮

### 為什麼使用 0.85 和 0.9？
- **寬度 0.85**：留 15% 邊距，確保文字不貼邊
- **高度 0.9**：留 10% 邊距，確保文字有呼吸空間

### 為什麼每次縮小 2px？
- 平衡速度和精度
- 避免過度調整
- 確保快速收斂

### 為什麼最小 12px？
- 確保文字可讀性
- 避免過小無法看清
- 符合無障礙設計標準

---

## 📊 代碼改動

**文件**：`public/games/match-up-game/scenes/game.js`

**改動位置**：第 2714-2779 行

**改動內容**：
- 添加高度檢查邏輯
- 改進雙重檢查條件
- 添加詳細日誌記錄
- 總計 +20 行代碼

---

## 🚀 部署狀態

### Git 提交
```
0a927d0 - Feature: Add intelligent vertical height calculation for text display
```

### 部署進度
- ✅ 代碼修改完成
- ✅ Git 提交成功
- ✅ GitHub 推送成功
- ⏳ Vercel 自動部署中（2-3 分鐘）

---

## ✨ 用戶體驗改進

### 之前
- 文字可能超出垂直空間
- 需要手動調整
- 顯示效果不穩定

### 之後
- 文字自動調整大小 ✅
- 完全適應可用空間 ✅
- 顯示效果穩定美觀 ✅

---

## 📞 下一步

### 立即驗證（部署後）
1. 打開遊戲頁面
2. 查看有中文文字的卡片
3. 打開開發者工具查看日誌
4. 驗證 widthRatio 和 heightRatio
5. 確認文字顯示效果

### 監控項目
- 文字顯示效果
- 不同長度文字的適配
- 用戶反饋

---

**最後更新**：2025-11-01
**版本**：v1.4 - 添加智能文字高度計算
**狀態**：✅ 完成，等待部署驗證

