# 勾勾叉叉代碼模板 - 可複用實現

## 📝 完整代碼模板

### 1. 顯示正確答案（勾勾）

```javascript
/**
 * 在卡片上顯示勾勾（✓）
 * @param {Phaser.GameObjects.Container} card - 卡片容器
 */
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
    
    // 獲取背景並計算位置
    const background = card.getData('background');
    if (background) {
        // 相對於卡片容器的位置
        const markX = background.width / 2 - 32;
        const markY = -background.height / 2 + 32;
        checkMark.setPosition(markX, markY);
        // 將標記添加到卡片容器中
        card.add(checkMark);
    }
    
    // 保存引用以便後續清除
    card.checkMark = checkMark;
    
    console.log('✅ 勾勾已添加到卡片:', card.getData('pairId'));
}
```

### 2. 顯示錯誤答案（叉叉）

```javascript
/**
 * 在卡片上顯示叉叉（✗）
 * @param {Phaser.GameObjects.Container} card - 卡片容器
 */
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
    
    // 獲取背景並計算位置
    const background = card.getData('background');
    if (background) {
        // 相對於卡片容器的位置
        const markX = background.width / 2 - 32;
        const markY = -background.height / 2 + 32;
        xMark.setPosition(markX, markY);
        // 將標記添加到卡片容器中
        card.add(xMark);
    }
    
    // 保存引用以便後續清除
    card.xMark = xMark;
    
    console.log('❌ 叉叉已添加到卡片:', card.getData('pairId'));
}
```

### 3. 在答案檢查中調用

```javascript
/**
 * 檢查所有答案並顯示勾勾/叉叉
 */
checkAllMatches() {
    console.log('🎮 開始檢查所有答案');
    
    let correctCount = 0;
    let incorrectCount = 0;
    
    // 遍歷所有答案
    this.allAnswers.forEach((answer) => {
        // 查找對應的卡片
        const card = this.leftCards.find(c => c.getData('pairId') === answer.leftPairId);
        
        if (!card) {
            console.warn('⚠️ 卡片查找失敗:', answer.leftPairId);
            return;
        }
        
        // 根據答案正確性顯示標記
        if (answer.isCorrect) {
            correctCount++;
            this.showCorrectAnswerOnCard(card);
        } else {
            incorrectCount++;
            this.showIncorrectAnswerOnCard(card);
        }
    });
    
    console.log(`📊 檢查完成 - 正確: ${correctCount}, 錯誤: ${incorrectCount}`);
}
```

### 4. 清除所有標記

```javascript
/**
 * 清除所有卡片上的標記
 */
clearAllMarks() {
    this.leftCards.forEach((card) => {
        if (card.checkMark) {
            card.checkMark.destroy();
            card.checkMark = null;
        }
        if (card.xMark) {
            card.xMark.destroy();
            card.xMark = null;
        }
    });
    
    console.log('🧹 所有標記已清除');
}
```

### 5. 顯示所有答案（用於 showAnswers 按鈕）

```javascript
/**
 * 顯示所有答案的勾勾和叉叉
 */
showAnswersOnCards() {
    console.log('🎮 顯示所有卡片上的勾勾和叉叉');
    
    if (this.allPagesAnswers && this.allPagesAnswers.length > 0) {
        this.allPagesAnswers.forEach((answer) => {
            // 查找對應的卡片
            const leftCard = this.leftCards.find(card => 
                card.getData('pairId') === answer.leftPairId
            );
            
            if (leftCard) {
                // 根據答案正確性顯示標記
                if (answer.isCorrect) {
                    this.showCorrectAnswerOnCard(leftCard);
                } else {
                    this.showIncorrectAnswerOnCard(leftCard);
                }
            }
        });
    }
}
```

---

## 🔧 集成步驟

### 步驟 1：添加函數到遊戲場景

將上述函數添加到您的遊戲場景類中。

### 步驟 2：在卡片創建時存儲背景

```javascript
// 在 createLeftCard() 或類似函數中
container.setData({
    pairId: pairId,
    background: background,  // 存儲背景引用
    // ... 其他數據
});
```

### 步驟 3：在答案檢查時調用

```javascript
// 在 checkAllMatches() 中
if (isCorrect) {
    this.showCorrectAnswerOnCard(card);
} else {
    this.showIncorrectAnswerOnCard(card);
}
```

### 步驟 4：測試

1. 進行正確的配對 → 應該看到勾勾
2. 進行錯誤的配對 → 應該看到叉叉
3. 檢查控制台日誌

---

## 🎨 自定義選項

### 改變顏色

```javascript
// 綠色勾勾
color: '#4caf50'  // 默認

// 藍色勾勾
color: '#2196f3'

// 紅色叉叉
color: '#f44336'  // 默認

// 橙色叉叉
color: '#ff9800'
```

### 改變大小

```javascript
// 大號
fontSize: '80px'

// 中號
fontSize: '64px'  // 默認

// 小號
fontSize: '48px'
```

### 改變位置

```javascript
// 右上角
const markX = background.width / 2 - 32;
const markY = -background.height / 2 + 32;

// 左上角
const markX = -background.width / 2 + 32;
const markY = -background.height / 2 + 32;

// 中心
const markX = 0;
const markY = 0;
```

---

## ✅ 檢查清單

在實現時檢查以下項目：

- [ ] 使用 `getData()` 和 `setData()` 存儲卡片數據
- [ ] 使用容器相對坐標而不是全局坐標
- [ ] 將標記添加到卡片容器中（`card.add(mark)`）
- [ ] 設置正確的深度（`setDepth(100)`）
- [ ] 移除舊標記以避免重複
- [ ] 保存標記引用以便後續清除
- [ ] 添加控制台日誌用於調試
- [ ] 測試所有佈局類型
- [ ] 測試多頁面場景

---

**最後更新**：2025-11-10
**版本**：v142.0

