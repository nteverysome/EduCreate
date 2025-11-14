# 遊戲問題集與解決方案參考

## 概述

本文檔收集了 EduCreate 遊戲開發中遇到的常見問題和解決方案，方便未來給其他遊戲做參考。

---

## 問題 1：Phaser 容器中卡片位置不正確

### 問題描述

**遊戲**：Match-up Game（配對遊戲）- 分離模式

**症狀**：
- 卡片被拖動到空白框容器中後，位置不正確
- 卡片顯示在容器的右下角，而不是中心
- 視覺指示器（✓/✗）無法正確顯示

**根本原因**：
在 Phaser 中，當對象被添加到容器時，其座標會變成相對於容器的座標。如果沒有正確設置本地座標，對象會保留之前的世界座標值，導致顯示在錯誤的位置。

### 解決方案

#### 步驟 1：理解 Phaser 容器座標系統

```javascript
// 在 Phaser 中，當對象被添加到容器時：
// 本地座標 = 對象世界座標 - 容器世界座標

// 例如：
// 對象世界座標：(800, 400)
// 容器世界座標：(600, 300)
// 對象本地座標：(200, 100)
```

#### 步驟 2：正確的添加流程

```javascript
// ❌ 錯誤做法
emptyBox.add(card);  // 卡片保留之前的世界座標值

// ✅ 正確做法
// 1. 計算相對座標
const cardRelativeX = card.x - emptyBox.x;
const cardRelativeY = card.y - emptyBox.y;

// 2. 添加到容器
emptyBox.add(card);

// 3. 設置本地座標
card.setPosition(cardRelativeX, cardRelativeY);
```

#### 步驟 3：簡化版本（當卡片已在容器位置時）

```javascript
// 如果卡片已經通過 tween 動畫移動到容器位置
// 可以直接設置本地座標為 (0, 0)
emptyBox.add(card);
card.setPosition(0, 0);  // 卡片會顯示在容器中心
```

### 實現代碼

**文件**：`public/games/match-up-game/scenes/game.js`

**函數**：`restoreCardPositions()` - v193.0 修復

```javascript
if (emptyBox) {
    // 記錄世界座標（用於調試）
    const cardWorldX = card.x;
    const cardWorldY = card.y;

    // 添加到容器
    emptyBox.add(card);
    
    // 🔥 [v193.0] 修復：設置卡片的本地座標為 (0, 0)
    // 這樣卡片就會顯示在容器的中心，而不是右下角
    card.setPosition(0, 0);
    
    card.setData('currentFrameIndex', frameIndex);
    card.setData('isMatched', savedPos.isMatched || false);
    card.setData('matchedWith', emptyBox);
    
    // 恢復視覺指示器
    if (savedPos.isMatched) {
        this.showCorrectAnswerOnCard(emptyBox);
    } else {
        this.showIncorrectAnswerOnCard(emptyBox);
    }
}
```

### 相關版本

- **v192.0**：修復卡片位置和視覺指示器恢復（移除 `isMatched` 限制）
- **v193.0**：修復卡片本地座標設置（當前版本）

### 應用到其他遊戲

當開發其他遊戲時，如果需要：
1. 將卡片/對象添加到容器中
2. 確保對象顯示在正確的位置

**記住**：
- ✅ 始終在添加到容器後設置本地座標
- ✅ 計算相對座標 = 對象座標 - 容器座標
- ✅ 如果對象已在容器位置，設置為 (0, 0)
- ❌ 不要忘記設置本地座標

### 調試技巧

```javascript
// 添加調試日誌
console.log('卡片世界座標:', { x: card.x, y: card.y });
console.log('容器世界座標:', { x: emptyBox.x, y: emptyBox.y });

// 添加到容器後
emptyBox.add(card);
card.setPosition(0, 0);

// 驗證本地座標
console.log('卡片本地座標:', { x: card.x, y: card.y });
console.log('卡片世界座標:', { x: card.getWorldTransformMatrix().tx, y: card.getWorldTransformMatrix().ty });
```

### 相關文檔

- `FIX_v192.0_卡片位置恢復修復.md` - 完整的問題分析
- `FIX_v193.0_卡片本地座標修復.md` - 詳細的修復方案
- `PHASER_CONTAINER_COORDINATE_SYSTEM_GUIDE.md` - Phaser 容器座標系統指南

---

## 問題 2：頁面導航時卡片位置無法恢復

### 問題描述

**遊戲**：Match-up Game（配對遊戲）- 分離模式

**症狀**：
- 用戶拖動卡片到空白框
- 提交答案後進入第2頁
- 返回第1頁時，卡片沒有恢復到之前的位置

**根本原因**：
- 錯誤配對的卡片（`isMatched: false`）沒有被保存
- 恢復邏輯只恢復 `isMatched: true` 的卡片

### 解決方案

**修復**：移除 `isMatched` 限制，只要有 `currentFrameIndex` 就恢復

```javascript
// ❌ 舊代碼
if (savedPos.isMatched && savedPos.currentFrameIndex !== undefined) {
    // 只恢復正確配對的卡片
}

// ✅ 新代碼
if (savedPos.currentFrameIndex !== undefined) {
    // 恢復所有有 currentFrameIndex 的卡片（無論是否正確配對）
}
```

### 相關版本

- **v192.0**：修復卡片位置和視覺指示器恢復

---

## 問題 3：視覺指示器沒有被恢復

### 問題描述

**遊戲**：Match-up Game（配對遊戲）- 分離模式

**症狀**：
- 卡片位置被恢復了
- 但是視覺指示器（✓/✗）沒有被恢復

**根本原因**：
`restoreCardPositions()` 函數沒有恢復視覺指示器的邏輯

### 解決方案

在恢復卡片位置後，根據 `isMatched` 狀態重新顯示視覺指示器

```javascript
// 恢復視覺指示器
if (savedPos.isMatched) {
    this.showCorrectAnswerOnCard(emptyBox);
} else {
    this.showIncorrectAnswerOnCard(emptyBox);
}
```

### 相關版本

- **v192.0**：添加視覺指示器恢復邏輯

---

## 快速參考

### 常見問題檢查清單

- [ ] 卡片是否被添加到容器中？
- [ ] 卡片的本地座標是否被正確設置？
- [ ] 是否保存了所有卡片的位置（包括錯誤配對）？
- [ ] 是否恢復了視覺指示器？
- [ ] 是否在多個頁面之間測試了導航？

### 相關文件

- `public/games/match-up-game/scenes/game.js` - Match-up Game 主文件
- `FIX_v192.0_卡片位置恢復修復.md` - v192.0 修復文檔
- `FIX_v193.0_卡片本地座標修復.md` - v193.0 修復文檔

---

---

## 最佳實踐

### 1. 容器座標系統

**原則**：
- 容器的原點（0, 0）通常在容器的中心
- 對象的本地座標是相對於容器的座標
- 添加到容器後，對象的座標會自動變成本地座標

**實踐**：
```javascript
// 始終在添加到容器後設置本地座標
container.add(object);
object.setPosition(localX, localY);
```

### 2. 狀態保存和恢復

**原則**：
- 保存所有相關的狀態信息（位置、匹配狀態、視覺指示器等）
- 恢復時要完整恢復所有狀態
- 不要有條件地跳過某些狀態

**實踐**：
```javascript
// 保存時：保存所有卡片的狀態
saveCardPositionForCurrentPage(card);

// 恢復時：恢復所有卡片的狀態
if (savedPos.currentFrameIndex !== undefined) {
    // 恢復位置
    emptyBox.add(card);
    card.setPosition(0, 0);

    // 恢復匹配狀態
    card.setData('isMatched', savedPos.isMatched || false);

    // 恢復視覺指示器
    if (savedPos.isMatched) {
        this.showCorrectAnswerOnCard(emptyBox);
    } else {
        this.showIncorrectAnswerOnCard(emptyBox);
    }
}
```

### 3. 調試技巧

**添加詳細的日誌**：
```javascript
console.log('🔥 [v193.0] 卡片已恢復到容器:', {
    pairId: pairId,
    frameIndex: frameIndex,
    isMatched: savedPos.isMatched,
    cardWorldPos: { x: cardWorldX, y: cardWorldY },
    cardLocalPos: { x: card.x, y: card.y }
});
```

**使用調試工具**：
- Chrome DevTools 的 Elements 面板查看 DOM 結構
- Phaser 的調試模式查看遊戲對象的位置和屬性
- 控制台日誌追蹤狀態變化

---

## 更新日誌

- **2025-11-12**：添加問題 1-3 和解決方案（v192.0-v193.0）
- **2025-11-12**：添加最佳實踐和調試技巧

