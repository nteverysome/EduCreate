# 勾勾叉叉（✓✗）實現指南 - EduCreate 通用參考

## 📋 目錄

1. [概述](#概述)
2. [核心概念](#核心概念)
3. [實現方案](#實現方案)
4. [代碼模板](#代碼模板)
5. [常見問題](#常見問題)
6. [測試方法](#測試方法)
7. [版本歷史](#版本歷史)

---

## 概述

### 什麼是勾勾叉叉系統？

勾勾叉叉系統是 EduCreate 遊戲中用於顯示答案正確性的視覺反饋機制：
- **勾勾（✓）**：表示答案正確
- **叉叉（✗）**：表示答案錯誤

### 為什麼需要它？

1. **即時反饋**：用戶立即知道答案是否正確
2. **視覺清晰**：大型符號易於識別
3. **無障礙設計**：支持視覺障礙用戶
4. **遊戲體驗**：增強遊戲的互動性和趣味性

### 在 EduCreate 中的應用

- **Match-Up Game**：配對遊戲中顯示配對是否正確
- **其他遊戲**：任何需要答案驗證的遊戲都可以使用

---

## 核心概念

### Phaser 容器和數據存儲

#### ❌ 錯誤做法
```javascript
// 直接設置屬性
container.pairId = value;
const pairId = container.pairId;  // 可能返回 undefined
```

#### ✅ 正確做法
```javascript
// 使用 setData 和 getData
container.setData('pairId', value);
const pairId = container.getData('pairId');  // 正確返回值
```

### 座標系統

#### 全局坐標 vs 容器相對坐標

```javascript
// ❌ 錯誤：直接使用全局坐標
const checkMark = this.add.text(globalX, globalY, '✓');

// ✅ 正確：添加到容器中，使用相對坐標
const checkMark = this.add.text(relativeX, relativeY, '✓');
card.add(checkMark);  // 添加到卡片容器
```

### 佈局類型

| 佈局類型 | 特點 | 實現方式 |
|---------|------|---------|
| **混合佈局** | 英文卡片可拖動到中文框 | 使用容器相對坐標 |
| **分離佈局** | 英文和中文卡片分開 | 可使用全局坐標 |

---

## 實現方案

### 最佳實踐

#### 1. 創建標記函數

```javascript
showCorrectAnswerOnCard(card) {
    // 移除舊標記
    if (card.checkMark) {
        card.checkMark.destroy();
    }
    
    // 創建勾勾
    const checkMark = this.add.text(0, 0, '✓', {
        fontSize: '64px',
        color: '#4caf50',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    checkMark.setOrigin(0.5);
    checkMark.setDepth(100);
    
    // 獲取背景並計算位置
    const background = card.getData('background');
    if (background) {
        const markX = background.width / 2 - 32;
        const markY = -background.height / 2 + 32;
        checkMark.setPosition(markX, markY);
        card.add(checkMark);  // 添加到容器
    }
    
    card.checkMark = checkMark;
}
```

#### 2. 在答案檢查中調用

```javascript
checkAllMatches() {
    // ... 驗證邏輯 ...
    
    if (isCorrect) {
        this.showCorrectAnswerOnCard(card);
    } else {
        this.showIncorrectAnswerOnCard(card);
    }
}
```

---

## 代碼模板

### 完整的標記系統模板

見下一個文件：`.augment/guides/CHECKMARK-XMARK-CODE-TEMPLATE.md`

---

## 常見問題

### Q1: 勾勾叉叉不顯示

**原因**：
- 卡片查找失敗
- 背景對象不存在
- 深度設置不正確

**解決方案**：
```javascript
// 1. 檢查卡片查找
const card = this.cards.find(c => c.getData('pairId') === pairId);
console.log('卡片查找結果:', card ? '成功' : '失敗');

// 2. 檢查背景
const background = card.getData('background');
console.log('背景存在:', !!background);

// 3. 檢查深度
console.log('標記深度:', checkMark.depth);
```

### Q2: 位置不正確

**原因**：
- 使用了全局坐標而不是相對坐標
- 背景尺寸計算錯誤

**解決方案**：
```javascript
// 使用相對坐標
const markX = background.width / 2 - 32;
const markY = -background.height / 2 + 32;
checkMark.setPosition(markX, markY);
card.add(checkMark);  // 關鍵：添加到容器
```

### Q3: 卡片查找失敗

**原因**：
- 使用 `card.pairId` 而不是 `card.getData('pairId')`
- pairId 值不匹配

**解決方案**：
```javascript
// ❌ 錯誤
const card = this.cards.find(c => c.pairId === pairId);

// ✅ 正確
const card = this.cards.find(c => c.getData('pairId') === pairId);
```

---

## 測試方法

### 手動測試步驟

1. **正確答案測試**
   - 進行正確的配對
   - 提交答案
   - 驗證勾勾（✓）是否顯示

2. **錯誤答案測試**
   - 進行錯誤的配對
   - 提交答案
   - 驗證叉叉（✗）是否顯示

3. **多頁面測試**
   - 在第一頁進行配對
   - 進入第二頁
   - 返回第一頁
   - 驗證標記是否仍然顯示

### 控制台日誌檢查

```javascript
// 應該看到的日誌
console.log('✅ [v142.0] showCorrectAnswer 混合佈局 - 調用 showCorrectAnswerOnCard');
console.log('✅ [v142.0] showIncorrectAnswer 混合佈局 - 調用 showIncorrectAnswerOnCard');
```

---

## 版本歷史

| 版本 | 日期 | 改進 |
|------|------|------|
| v139.0 | 2025-11-10 | 初始實現，使用 getData('background') |
| v140.0 | 2025-11-10 | 實現優先級系統 |
| v141.0 | 2025-11-10 | 修復卡片查找，使用 getData('pairId') |
| v142.0 | 2025-11-10 | 統一混合佈局實現，簡化代碼 |

---

## 快速參考

### 關鍵函數

- `showCorrectAnswerOnCard(card)` - 顯示勾勾
- `showIncorrectAnswerOnCard(card)` - 顯示叉叉
- `checkAllMatches()` - 檢查所有答案

### 關鍵概念

- 使用 `getData()` 和 `setData()` 存儲卡片數據
- 使用容器相對坐標而不是全局坐標
- 將標記添加到卡片容器中

### 常見陷阱

- ❌ 使用 `card.pairId` 而不是 `card.getData('pairId')`
- ❌ 使用全局坐標而不是相對坐標
- ❌ 不將標記添加到容器中

---

**最後更新**：2025-11-10
**版本**：v142.0
**作者**：EduCreate 開發團隊

