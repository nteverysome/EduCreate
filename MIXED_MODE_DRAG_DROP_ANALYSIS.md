# 🎯 混合模式拖移方式深度分析

## 📊 混合模式概述

### 什麼是混合模式？

**混合模式** 是 Match-up 遊戲的一種佈局模式，特點是：

1. **英文卡片和中文框混合排列在同一區域**
   - 不像分離模式（左英文、右中文）
   - 混合模式將兩者混合在一起

2. **英文卡片初始放在中文框內**
   - 用戶需要拖動英文卡片進行配對
   - 適用於移動設備和小屏幕

3. **拖移方式：交換位置（Swap）**
   - 拖動英文卡片到另一個英文卡片上 → 交換位置
   - 不是拖到中文框進行配對
   - 而是通過交換位置來進行配對

## 🔧 混合模式拖移邏輯

### 核心函數

#### 1. checkMixedModeDrop (第 5364-5423 行)
```javascript
checkMixedModeDrop(pointer, draggedCard) {
    // 檢查是否拖曳到另一個英文卡片
    // 如果是，執行交換操作
    // 如果否，返回原位
}
```

**功能**：
- 檢查拖曳的卡片是否拖到另一個英文卡片上
- 如果是，執行交換操作
- 如果否，返回原位

#### 2. swapMixedModeCards (第 5426-5470 行)
```javascript
swapMixedModeCards(card1, card2, frame1Index, frame2Index) {
    // 交換兩個英文卡片的位置
    // 更新卡片的框索引
    // 更新卡片的原始位置
    // 執行動畫移動
}
```

**功能**：
- 交換兩個英文卡片的位置
- 更新卡片的框索引（currentFrameIndex）
- 更新卡片的原始位置（originalX, originalY）
- 執行平滑的動畫移動

### 拖移流程

```
1. 用戶拖動英文卡片
   ↓
2. dragend 事件觸發
   ↓
3. 檢查 layout === 'mixed'
   ↓
4. 調用 checkMixedModeDrop()
   ↓
5. 檢查是否拖到另一個英文卡片上
   ├─ 是 → 調用 swapMixedModeCards() → 交換位置
   └─ 否 → 返回原位
```

## 📈 混合模式 vs 分離模式

| 特性 | 混合模式 | 分離模式 |
|------|--------|--------|
| 佈局 | 英文和中文混合 | 英文左、中文右 |
| 拖移方式 | 交換位置 | 拖到空白框 |
| 目標 | 另一個英文卡片 | 中文框 |
| 適用場景 | 移動設備、小屏幕 | 桌面、大屏幕 |

## 🎯 混合模式的優勢

1. **節省屏幕空間**
   - 英文和中文混合排列
   - 適合移動設備

2. **直觀的交互方式**
   - 拖動卡片交換位置
   - 用戶容易理解

3. **更好的視覺反饋**
   - 卡片交換時有動畫效果
   - 用戶能清楚看到位置變化

## 🔑 關鍵代碼位置

### 混合模式入口
- **第 1668-2250 行**：`createMixedLayout()` - 創建混合模式佈局

### 拖移邏輯
- **第 4205-4210 行**：dragend 事件中的混合模式檢查
- **第 5310-5327 行**：`checkDrop()` - 拖放檢查入口
- **第 5364-5423 行**：`checkMixedModeDrop()` - 混合模式拖放邏輯
- **第 5426-5470 行**：`swapMixedModeCards()` - 交換卡片位置

### 交換邏輯
- **第 5153-5192 行**：`checkSwap()` - 檢查卡片交換
- **第 5194-5240 行**：`swapCards()` - 執行卡片交換

## 💡 混合模式的核心特性

### 1. 框索引管理
```javascript
// 每個英文卡片都有一個框索引
card.setData('currentFrameIndex', frameIndex);

// 交換時更新框索引
card1.setData('currentFrameIndex', frame2Index);
card2.setData('currentFrameIndex', frame1Index);
```

### 2. 位置交換
```javascript
// 交換原始位置
card1.setData('originalX', card2OriginalX);
card1.setData('originalY', card2OriginalY);
card2.setData('originalX', card1OriginalX);
card2.setData('originalY', card1OriginalY);
```

### 3. 動畫效果
```javascript
// 平滑的動畫移動
this.tweens.add({
    targets: card1,
    x: card2OriginalX,
    y: card2OriginalY,
    duration: 300,
    ease: 'Back.easeOut'
});
```

## 🚀 建議的改進方向

1. **增強視覺反饋**
   - 拖動時顯示目標卡片的高亮效果
   - 交換時顯示動畫軌跡

2. **改進交互體驗**
   - 支持快速連續交換
   - 添加撤銷功能

3. **優化性能**
   - 減少動畫幀數
   - 優化碰撞檢測

## 📝 總結

混合模式是一種創新的拖移方式，通過交換卡片位置來進行配對。它特別適合移動設備和小屏幕，提供了更直觀和節省空間的交互體驗。

