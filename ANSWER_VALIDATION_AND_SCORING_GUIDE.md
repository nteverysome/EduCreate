# 🎯 Match-up 遊戲答案驗證和評分系統指南

## 📋 系統概述

Match-up 遊戲的答案驗證和評分系統包括以下步驟：

1. **詞彙數據加載** - 從 API 加載英文-中文詞彙對
2. **卡片創建** - 根據詞彙創建左側（中文）和右側（英文）卡片
3. **用戶配對** - 用戶拖動英文卡片到中文卡片上進行配對
4. **答案提交** - 用戶點擊"提交答案"按鈕
5. **答案驗證** - 系統檢查每個配對是否正確
6. **分數計算** - 計算正確答案數量
7. **結果顯示** - 顯示遊戲完成模態框

## 🔍 詞彙數據結構

### 原始數據格式（從 API 返回）
```javascript
{
  id: "activity-id",
  title: "活動標題",
  vocabularyItems: [
    {
      english: "hello",
      chinese: "你好",
      imageUrl: "...",
      chineseImageUrl: "...",
      audioUrl: "..."
    },
    // ... 更多詞彙
  ]
}
```

### 轉換後的格式（遊戲內部使用）
```javascript
this.pairs = [
  {
    id: 1,  // 🔥 重要：ID 是 1-based 索引
    english: "hello",
    chinese: "你好",
    question: "hello",
    answer: "你好",
    imageUrl: "...",
    chineseImageUrl: "...",
    audioUrl: "..."
  },
  // ... 更多詞彙
]
```

## 🎮 卡片配對邏輯

### 卡片數據結構
```javascript
// 左側卡片（中文）
leftCard.setData('pairId', 1);  // 對應 pairs[0].id
leftCard.setData('text', '你好');
leftCard.setData('isMatched', false);
leftCard.setData('matchedWith', null);

// 右側卡片（英文）
rightCard.setData('pairId', 1);  // 對應 pairs[0].id
rightCard.setData('text', 'hello');
rightCard.setData('isMatched', false);
rightCard.setData('matchedWith', null);
```

### 配對流程
1. 用戶拖動英文卡片（例如 pairId=2）到中文卡片上（例如 pairId=1）
2. 系統調用 `checkMatch(leftCard, rightCard)`
3. 無論對錯，都執行 `onMatchSuccess(leftCard, rightCard)`
4. 英文卡片移動到中文卡片位置
5. 記錄配對：`leftCard.setData('matchedWith', rightCard)`

## ✅ 答案驗證邏輯

### 驗證步驟（v56.0）

當用戶點擊"提交答案"按鈕時：

```javascript
checkAllMatches() {
  // 1. 獲取當前頁的詞彙
  const currentPagePairs = this.pairs.slice(startIndex, endIndex);
  
  // 2. 遍歷每個左側卡片
  this.leftCards.forEach(leftCard => {
    const leftPairId = leftCard.getData('pairId');  // 例如：1
    const rightCard = leftCard.getData('matchedWith');
    
    if (rightCard) {
      const rightPairId = rightCard.getData('pairId');  // 例如：2
      
      // 3. 比較 ID 是否相同
      const isCorrect = leftPairId === rightPairId;  // 1 === 2 ? false
      
      // 4. 記錄答案
      this.currentPageAnswers.push({
        leftText: '你好',  // 中文
        rightText: 'world',  // 用戶選擇的英文
        correctAnswer: 'hello',  // 正確的英文
        isCorrect: false,  // 因為 1 !== 2
        leftPairId: 1,
        rightPairId: 2
      });
    }
  });
}
```

### 驗證規則

| 情況 | leftPairId | rightPairId | isCorrect | 說明 |
|------|-----------|-----------|----------|------|
| 正確配對 | 1 | 1 | ✅ true | 英文卡片 ID 與中文卡片 ID 相同 |
| 錯誤配對 | 1 | 2 | ❌ false | 英文卡片 ID 與中文卡片 ID 不同 |
| 未配對 | 1 | null | ❌ false | 中文卡片沒有配對任何英文卡片 |

## 📊 分數計算邏輯

### 計算公式（v56.0）

```javascript
// 只計算已配對且正確的答案
const totalCorrect = this.allPagesAnswers
  .filter(answer => answer.isCorrect && answer.rightPairId !== null)
  .length;

// 總問題數 = 所有詞彙數
const totalQuestions = this.pairs.length;

// 顯示分數
scoreText = `${totalCorrect}/${totalQuestions}`;  // 例如：15/20
```

### 分數示例

假設有 20 個詞彙：

| 情況 | 正確 | 錯誤 | 未配對 | 分數 |
|------|------|------|--------|------|
| 全部正確 | 20 | 0 | 0 | 20/20 |
| 大部分正確 | 15 | 3 | 2 | 15/20 |
| 全部錯誤 | 0 | 20 | 0 | 0/20 |
| 全部未配對 | 0 | 0 | 20 | 0/20 |

## 🐛 調試方法

### 1. 檢查詞彙數據

在瀏覽器控制台執行：
```javascript
// 查看所有詞彙
console.log(window.matchUpGame.scene.scenes[0].pairs);

// 查看第一個詞彙
const pair = window.matchUpGame.scene.scenes[0].pairs[0];
console.log({
  id: pair.id,
  english: pair.english,
  chinese: pair.chinese
});
```

### 2. 檢查卡片配對

在提交答案前，檢查卡片的 pairId：
```javascript
const scene = window.matchUpGame.scene.scenes[0];
scene.leftCards.forEach((card, i) => {
  const rightCard = card.getData('matchedWith');
  console.log(`卡片 ${i + 1}:`, {
    leftPairId: card.getData('pairId'),
    rightPairId: rightCard ? rightCard.getData('pairId') : null,
    isCorrect: card.getData('pairId') === (rightCard ? rightCard.getData('pairId') : null)
  });
});
```

### 3. 檢查答案記錄

提交答案後，檢查答案記錄：
```javascript
const scene = window.matchUpGame.scene.scenes[0];
console.log('所有答案:', scene.allPagesAnswers);
console.log('正確答案數:', scene.allPagesAnswers.filter(a => a.isCorrect).length);
```

### 4. 查看詳細日誌

打開瀏覽器開發者工具（F12），查看控制台日誌：

- `🔍 [v56.0] 開始檢查所有配對` - 顯示配對檢查開始
- `🔍 [v56.0] 卡片 X` - 顯示每個卡片的配對信息
- `🔍 [v56.0] 答案驗證` - 顯示答案驗證結果
- `📊 [v56.0] 當前頁面分數` - 顯示最終分數

## 🔧 常見問題

### 問題 1：分數顯示為 0/20

**原因**：所有答案都被標記為不正確

**檢查步驟**：
1. 檢查詞彙數據是否正確加載
2. 檢查卡片的 pairId 是否正確設置
3. 查看控制台日誌中的 `leftPairId` 和 `rightPairId` 是否匹配

### 問題 2：分數計算不正確

**原因**：可能是答案記錄中有未配對的答案

**檢查步驟**：
1. 查看 `allPagesAnswers` 中每個答案的 `rightPairId`
2. 確認 `isCorrect` 字段是否正確
3. 檢查分數計算公式是否排除了未配對的答案

### 問題 3：某些答案沒有被記錄

**原因**：可能是卡片沒有正確配對

**檢查步驟**：
1. 確認所有卡片都已配對（`matchedWith` 不為 null）
2. 檢查是否有卡片沒有被添加到 `leftCards` 數組

## 📝 相關代碼位置

- **詞彙加載**：`game.js` 第 232-413 行
- **卡片創建**：`game.js` 第 1500-2000 行（估計）
- **答案驗證**：`game.js` 第 4424-4540 行（v56.0）
- **分數計算**：`game.js` 第 5040-5071 行（v56.0）
- **結果顯示**：`game.js` 第 5001-5140 行

## 🚀 下一步

1. **測試答案驗證**：創建一個活動，添加 5-10 個詞彙，測試配對和分數計算
2. **檢查日誌**：打開開發者工具，查看詳細的調試日誌
3. **驗證分數**：確認分數計算是否正確
4. **測試多頁**：如果啟用分頁，測試多頁的分數累計

