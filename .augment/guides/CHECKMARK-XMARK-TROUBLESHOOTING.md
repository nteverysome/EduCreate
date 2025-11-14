# 勾勾叉叉故障排除指南

## 🔍 問題診斷流程

```
問題：勾勾叉叉不顯示
  ↓
[步驟 1] 檢查卡片查找
  ↓
[步驟 2] 檢查背景對象
  ↓
[步驟 3] 檢查深度設置
  ↓
[步驟 4] 檢查座標系統
  ↓
[步驟 5] 檢查容器添加
```

---

## 問題 1：勾勾叉叉完全不顯示

### 症狀
- 提交答案後沒有任何標記出現
- 按 showAnswers 按鈕也沒有標記

### 診斷代碼

```javascript
// 在 showCorrectAnswerOnCard() 中添加診斷日誌
showCorrectAnswerOnCard(card) {
    console.log('🔍 診斷開始:', {
        cardExists: !!card,
        cardPairId: card ? card.getData('pairId') : null,
        backgroundExists: card ? !!card.getData('background') : false,
        backgroundData: card ? card.getData('background') : null
    });
    
    // ... 其他代碼 ...
}
```

### 常見原因和解決方案

#### 原因 1：卡片查找失敗

**症狀**：`cardExists: false`

**解決方案**：
```javascript
// ❌ 錯誤
const card = this.leftCards.find(c => c.pairId === pairId);

// ✅ 正確
const card = this.leftCards.find(c => c.getData('pairId') === pairId);
```

#### 原因 2：背景對象不存在

**症狀**：`backgroundExists: false`

**解決方案**：
```javascript
// 在卡片創建時確保存儲背景
container.setData({
    pairId: pairId,
    background: background,  // 必須存儲
    // ... 其他數據
});
```

#### 原因 3：函數未被調用

**症狀**：控制台沒有任何日誌

**解決方案**：
```javascript
// 檢查 checkAllMatches() 是否調用了 showCorrectAnswerOnCard()
checkAllMatches() {
    // ...
    if (isCorrect) {
        console.log('🔥 調用 showCorrectAnswerOnCard');
        this.showCorrectAnswerOnCard(card);  // 確保這行被執行
    }
    // ...
}
```

---

## 問題 2：標記位置不正確

### 症狀
- 標記出現但位置錯誤
- 標記在卡片外面
- 標記重疊或隱藏

### 診斷代碼

```javascript
showCorrectAnswerOnCard(card) {
    const background = card.getData('background');
    if (background) {
        const markX = background.width / 2 - 32;
        const markY = -background.height / 2 + 32;
        
        console.log('📍 位置診斷:', {
            backgroundWidth: background.width,
            backgroundHeight: background.height,
            markX,
            markY,
            cardX: card.x,
            cardY: card.y
        });
        
        // ... 其他代碼 ...
    }
}
```

### 常見原因和解決方案

#### 原因 1：使用全局坐標而不是相對坐標

**症狀**：標記在屏幕的奇怪位置

**解決方案**：
```javascript
// ❌ 錯誤：全局坐標
const checkMark = this.add.text(globalX, globalY, '✓');

// ✅ 正確：相對坐標
const checkMark = this.add.text(relativeX, relativeY, '✓');
card.add(checkMark);  // 添加到容器
```

#### 原因 2：背景尺寸計算錯誤

**症狀**：標記位置偏離

**解決方案**：
```javascript
// 調整偏移量
const markX = background.width / 2 - 32;  // 調整 32
const markY = -background.height / 2 + 32;  // 調整 32

// 或者使用絕對位置
const markX = 0;  // 卡片中心
const markY = 0;
```

#### 原因 3：深度設置不正確

**症狀**：標記被其他對象遮擋

**解決方案**：
```javascript
// 確保深度足夠高
checkMark.setDepth(100);  // 或更高的值

// 檢查其他對象的深度
console.log('標記深度:', checkMark.depth);
console.log('背景深度:', background.depth);
```

---

## 問題 3：標記重複出現

### 症狀
- 多個勾勾或叉叉出現在同一卡片上
- 標記堆疊在一起

### 診斷代碼

```javascript
showCorrectAnswerOnCard(card) {
    console.log('🔍 標記檢查:', {
        existingCheckMark: !!card.checkMark,
        existingXMark: !!card.xMark
    });
    
    // ... 其他代碼 ...
}
```

### 解決方案

```javascript
// 在添加新標記前移除舊標記
showCorrectAnswerOnCard(card) {
    // 移除舊的標記（如果存在）
    if (card.checkMark) {
        card.checkMark.destroy();
        card.checkMark = null;
    }
    if (card.xMark) {
        card.xMark.destroy();
        card.xMark = null;
    }
    
    // 現在添加新標記
    // ...
}
```

---

## 問題 4：標記在卡片移動時不跟隨

### 症狀
- 卡片移動但標記留在原地
- 標記和卡片分離

### 原因

標記沒有添加到卡片容器中

### 解決方案

```javascript
// ❌ 錯誤：標記不跟隨卡片
const checkMark = this.add.text(globalX, globalY, '✓');

// ✅ 正確：標記跟隨卡片
const checkMark = this.add.text(relativeX, relativeY, '✓');
card.add(checkMark);  // 關鍵：添加到容器
```

---

## 問題 5：多頁面場景中標記丟失

### 症狀
- 第一頁的標記正常
- 進入第二頁後返回第一頁，標記消失

### 原因

頁面切換時標記被清除或卡片被重新創建

### 解決方案

```javascript
// 在頁面切換時保存答案狀態
switchPage(pageNumber) {
    // 保存當前頁面的答案
    this.savePageAnswers(this.currentPage);
    
    // 切換頁面
    this.currentPage = pageNumber;
    
    // 恢復新頁面的答案
    this.restorePageAnswers(pageNumber);
}

// 恢復答案時重新顯示標記
restorePageAnswers(pageNumber) {
    const answers = this.allPagesAnswers.filter(a => a.page === pageNumber);
    answers.forEach((answer) => {
        const card = this.leftCards.find(c => c.getData('pairId') === answer.leftPairId);
        if (card) {
            if (answer.isCorrect) {
                this.showCorrectAnswerOnCard(card);
            } else {
                this.showIncorrectAnswerOnCard(card);
            }
        }
    });
}
```

---

## 調試技巧

### 1. 添加詳細日誌

```javascript
showCorrectAnswerOnCard(card) {
    console.log('=== showCorrectAnswerOnCard 開始 ===');
    console.log('卡片 ID:', card.getData('pairId'));
    console.log('背景:', card.getData('background'));
    
    // ... 代碼 ...
    
    console.log('=== showCorrectAnswerOnCard 完成 ===');
}
```

### 2. 使用瀏覽器開發者工具

```javascript
// 在控制台中檢查卡片
const card = scene.leftCards[0];
console.log('卡片數據:', card.getData());
console.log('背景:', card.getData('background'));
console.log('標記:', card.checkMark);
```

### 3. 視覺調試

```javascript
// 添加臨時的視覺標記
const debugMark = this.add.text(markX, markY, '●', {
    fontSize: '32px',
    color: '#ffff00'
});
card.add(debugMark);
```

---

## 快速檢查清單

在遇到問題時檢查以下項目：

- [ ] 卡片是否正確查找？（使用 `getData('pairId')`）
- [ ] 背景對象是否存在？（檢查 `getData('background')`）
- [ ] 標記是否添加到容器中？（使用 `card.add(mark)`）
- [ ] 深度是否設置正確？（`setDepth(100)`）
- [ ] 舊標記是否被移除？（檢查 `destroy()`）
- [ ] 座標是否正確？（相對坐標而不是全局坐標）
- [ ] 函數是否被調用？（檢查控制台日誌）
- [ ] 是否有 JavaScript 錯誤？（檢查控制台）

---

## 聯繫支持

如果問題仍未解決，請提供以下信息：

1. 控制台日誌輸出
2. 遊戲佈局類型（混合/分離）
3. 卡片類型和數據
4. 重現問題的步驟

---

**最後更新**：2025-11-10
**版本**：v142.0

