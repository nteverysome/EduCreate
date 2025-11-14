# Match-Up Game 勾勾（✓）與叉叉（✗）實現分析

## 📋 概述

在 Match-Up Game 中，勾勾（✓）和叉叉（✗）用於表示用戶的答案是否正確。這些標記在提交答案後顯示在卡片上。

## 🎯 核心函數

### 1. **showCorrectAnswerOnCard()** - 顯示勾勾
**位置**：第 7221-7246 行
**功能**：在卡片上顯示綠色勾勾（✓）

```javascript
showCorrectAnswerOnCard(card) {
    // 移除舊的標記（如果存在）
    if (card.checkMark) {
        card.checkMark.destroy();
    }

    // 創建勾勾標記
    const checkMark = this.add.text(0, 0, '✓', {
        fontSize: '64px',
        color: '#4caf50',  // 綠色
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    checkMark.setOrigin(0.5);
    checkMark.setDepth(100);

    // 定位到卡片右上角
    const background = card.list[0]; // 卡片背景
    if (background) {
        const markX = card.x + background.width / 2 - 32;
        const markY = card.y - background.height / 2 + 32;
        checkMark.setPosition(markX, markY);
    }

    card.checkMark = checkMark;
}
```

### 2. **showIncorrectAnswerOnCard()** - 顯示叉叉
**位置**：第 7249-7274 行
**功能**：在卡片上顯示紅色叉叉（✗）

```javascript
showIncorrectAnswerOnCard(card) {
    // 移除舊的標記（如果存在）
    if (card.xMark) {
        card.xMark.destroy();
    }

    // 創建叉叉標記
    const xMark = this.add.text(0, 0, '✗', {
        fontSize: '64px',
        color: '#f44336',  // 紅色
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    xMark.setOrigin(0.5);
    xMark.setDepth(100);

    // 定位到卡片右上角
    const background = card.list[0]; // 卡片背景
    if (background) {
        const markX = card.x + background.width / 2 - 32;
        const markY = card.y - background.height / 2 + 32;
        xMark.setPosition(markX, markY);
    }

    card.xMark = xMark;
}
```

## 🎨 視覺呈現詳解

### 勾勾（✓）特性
| 屬性 | 值 |
|------|-----|
| 符號 | ✓ |
| 字體大小 | 64px |
| 顏色 | #4caf50（綠色） |
| 字體 | Arial Bold |
| 深度 | 100 |
| 位置 | 卡片右上角 |
| 偏移 | X: -32, Y: +32 |

### 叉叉（✗）特性
| 屬性 | 值 |
|------|-----|
| 符號 | ✗ |
| 字體大小 | 64px |
| 顏色 | #f44336（紅色） |
| 字體 | Arial Bold |
| 深度 | 100 |
| 位置 | 卡片右上角 |
| 偏移 | X: -32, Y: +32 |

## 📍 位置計算

```javascript
// 卡片右上角位置計算
const markX = card.x + background.width / 2 - 32;
const markY = card.y - background.height / 2 + 32;
```

**解釋**：
- `card.x + background.width / 2` - 卡片右邊界
- `- 32` - 向左偏移 32 像素（避免超出邊界）
- `card.y - background.height / 2` - 卡片上邊界
- `+ 32` - 向下偏移 32 像素（避免超出邊界）

## 🔄 調用流程

### 提交答案時的流程

```
submitAnswers()
    ↓
遍歷所有答案
    ↓
檢查每個答案是否正確
    ↓
如果正確 → showCorrectAnswerOnCard()
如果錯誤 → showIncorrectAnswerOnCard()
    ↓
在卡片上顯示勾勾或叉叉
```

### 相關調用函數

1. **submitAnswers()** - 提交答案
   - 遍歷所有答案
   - 檢查正確性
   - 調用 showCorrectAnswerOnCard() 或 showIncorrectAnswerOnCard()

2. **showAnswersOnCards()** - 顯示所有卡片上的勾勾和叉叉
   - 遍歷 allPagesAnswers
   - 根據 isCorrect 標誌調用相應函數

## 🎯 標記管理

### 標記存儲
```javascript
card.checkMark = checkMark;  // 存儲勾勾引用
card.xMark = xMark;          // 存儲叉叉引用
```

### 標記清理
```javascript
// 移除舊的標記（如果存在）
if (card.checkMark) {
    card.checkMark.destroy();
}
if (card.xMark) {
    card.xMark.destroy();
}
```

## 📊 佈局支持

### 混合佈局（Mixed Layout）
- 勾勾/叉叉顯示在英文卡片上
- 位置：卡片右上角

### 分離佈局（Separated Layout）
- 勾勾/叉叉顯示在右側卡片上
- 位置：卡片右上角

## 🔍 相關代碼位置

| 功能 | 位置 | 行數 |
|------|------|------|
| showCorrectAnswerOnCard() | game.js | 7221-7246 |
| showIncorrectAnswerOnCard() | game.js | 7249-7274 |
| showAnswersOnCards() | game.js | 7193-7215 |
| submitAnswers() | game.js | 5500+ |

## 💡 設計特點

1. **自動清理**
   - 顯示新標記前自動銷毀舊標記
   - 防止標記重複堆積

2. **視覺區分**
   - 綠色勾勾表示正確
   - 紅色叉叉表示錯誤
   - 清晰的視覺反饋

3. **位置一致**
   - 所有標記都在卡片右上角
   - 統一的用戶體驗

4. **深度管理**
   - 深度設置為 100
   - 確保標記顯示在卡片上方

## 🎬 動畫效果

目前實現中，勾勾和叉叉是**靜態顯示**，沒有動畫效果。

**可能的改進**：
- 添加淡入動畫
- 添加縮放動畫
- 添加旋轉動畫

## 📝 使用示例

```javascript
// 顯示勾勾
this.showCorrectAnswerOnCard(card);

// 顯示叉叉
this.showIncorrectAnswerOnCard(card);

// 顯示所有答案的勾勾和叉叉
this.showAnswersOnCards();
```

---

**總結**：勾勾和叉叉通過 Phaser 的 Text 對象實現，使用簡單的 Unicode 符號（✓ 和 ✗），通過顏色和位置來區分正確和錯誤的答案。

