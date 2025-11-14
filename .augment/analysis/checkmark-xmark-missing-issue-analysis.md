# 勾勾與叉叉不顯示問題分析

## 🔍 問題描述

當卡片中沒有英文文字，只有圖片、語音或兩者組合時，提交答案後勾勾（✓）和叉叉（✗）不顯示。

## 🎯 根本原因分析

### 問題 1：背景訪問方式不正確

**當前代碼**（第 7238 行）：
```javascript
const background = card.list[0]; // 卡片背景
```

**問題**：
- 假設背景總是在 `card.list[0]`
- 但當卡片結構不同時（只有圖片、只有語音等），背景可能不在第一個位置
- 或者背景根本不在 list 中

**正確做法**：
```javascript
const background = card.getData('background'); // 從卡片數據中獲取背景
```

### 問題 2：勾勾和叉叉沒有添加到卡片容器中

**當前代碼**（第 7242 行）：
```javascript
checkMark.setPosition(markX, markY);
card.checkMark = checkMark;
```

**問題**：
- 勾勾只是設置了位置，但沒有添加到卡片容器中
- 勾勾是獨立的對象，不是卡片的子元素
- 當卡片移動時，勾勾不會跟著移動
- 當卡片被銷毀時，勾勾可能不會被銷毀

**正確做法**：
```javascript
card.add(checkMark); // 添加到卡片容器中
card.checkMark = checkMark;
```

## 📊 卡片結構分析

### createLeftCard 支持的佈局

| 佈局 | 內容 | 函數 |
|------|------|------|
| A | 圖片 + 文字 + 語音 | createCardLayoutA |
| B | 只有語音 | createCardLayoutB |
| C | 只有文字 | createCardLayoutC |
| D | 圖片 + 文字 | createCardLayoutD |
| E | 語音 + 文字 | createCardLayoutE |
| F | 只有圖片 | createCardLayoutF |

### 背景存儲位置

在 createLeftCard 中（第 3831-3844 行）：
```javascript
container.setData({
    pairId: pairId,
    side: 'left',
    background: background,  // ✅ 背景存儲在 getData 中
    text: cardText,
    isMatched: false,
    ...
});
```

## ✅ 解決方案

### 修改 showCorrectAnswerOnCard()

```javascript
showCorrectAnswerOnCard(card) {
    // 移除舊的標記（如果存在）
    if (card.checkMark) {
        card.checkMark.destroy();
    }

    // 創建勾勾標記
    const checkMark = this.add.text(0, 0, '✓', {
        fontSize: '64px',
        color: '#4caf50',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    checkMark.setOrigin(0.5);
    checkMark.setDepth(100);

    // 🔥 [v139.0] 改進：使用 getData 獲取背景
    const background = card.getData('background');
    if (background) {
        const markX = background.width / 2 - 32;
        const markY = -background.height / 2 + 32;
        checkMark.setPosition(markX, markY);
        card.add(checkMark);
    }

    card.checkMark = checkMark;
}
```

## 🔑 關鍵改進

1. **背景訪問**：使用 `getData('background')` 而非 `list[0]`
2. **位置計算**：相對於容器坐標而非全局坐標
3. **標記添加**：將標記添加到卡片容器中

## 📝 測試場景

- ✅ 只有圖片
- ✅ 只有語音
- ✅ 圖片 + 語音（無文字）
- ✅ 圖片 + 文字
- ✅ 語音 + 文字

---

**版本**：v139.0 - 修復勾勾與叉叉在非文字卡片中不顯示的問題

