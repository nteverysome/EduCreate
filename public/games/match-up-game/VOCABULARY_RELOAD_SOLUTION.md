# Match-up Game - 避免重新載入詞彙解決方案

## 問題描述

目前當用戶進行以下操作時，遊戲會重新載入詞彙：
1. ❌ 瀏覽器縮小/放大（zoom）
2. ❌ 改變視窗大小（resize）
3. ❌ 換頁（page change）
4. ❌ 拉伸視窗

## 根本原因

### 1. Resize 事件觸發 updateLayout()
**文件**: `scenes/game.js` (第 556-586 行)

```javascript
this.scale.on('resize', (gameSize) => {
    // ... 防抖延遲 300ms ...
    this.updateLayout();  // ❌ 清除所有卡片並重新創建
    this.matchedPairs = savedMatchedPairs;  // 恢復已配對狀態
    this.restoreMatchedPairsVisuals();
});
```

**問題**: `updateLayout()` 會調用 `this.children.removeAll(true)` 清除所有元素，然後重新創建卡片。

### 2. updateLayout() 清除所有元素
**文件**: `scenes/game.js` (第 956-1020 行)

```javascript
updateLayout() {
    this.children.removeAll(true);  // ❌ 清除所有卡片
    this.createCards();  // 重新創建卡片
}
```

### 3. 頁面變化清除洗牌順序
**文件**: `scenes/game.js` (第 5621-5632 行)

```javascript
goToNextPage() {
    this.currentPage++;
    this.shuffledPairsCache = null;  // ❌ 清除洗牌順序
    this.updateLayout();  // 重新佈局
}
```

## 解決方案

### 方案 A：只調整位置，不重新創建卡片（推薦）

**優點**:
- ✅ 詞彙數據保持不變
- ✅ 已配對狀態保持不變
- ✅ 卡片順序保持不變
- ✅ 性能最佳

**實現步驟**:

1. **修改 resize 事件監聽器**
   - 改為調用 `repositionCards()` 而不是 `updateLayout()`
   - 只調整卡片位置和大小

2. **新增 repositionCards() 方法**
   - 計算新的螢幕尺寸
   - 根據佈局模式調用相應的位置調整方法
   - 保持卡片內容不變

3. **新增 repositionMixedLayout() 方法**
   - 調整混合佈局中的卡片位置
   - 重新計算卡片尺寸

4. **新增 repositionSeparatedLayout() 方法**
   - 調整分離佈局中的卡片位置
   - 重新計算卡片尺寸

### 方案 B：禁用 resize 事件（簡單但不推薦）

```javascript
// 移除 resize 事件監聽器
this.scale.off('resize');
```

**缺點**: 視窗改變大小時，卡片不會調整，可能導致佈局混亂。

### 方案 C：使用 CSS 媒體查詢（前端方案）

在 HTML 中使用 CSS 媒體查詢，根據螢幕大小自動調整遊戲容器大小，而不是依賴 Phaser 的 resize 事件。

**缺點**: 需要修改 HTML 和 CSS，可能與現有設計衝突。

## 推薦實現：方案 A

### 步驟 1：修改 resize 事件監聽器

```javascript
this.scale.on('resize', (gameSize) => {
    console.log('🔄 resize 事件觸發，調整卡片位置');
    
    // 清除之前的超時
    if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
    }
    
    // 設置新的超時，300ms 後才執行位置調整
    this.resizeTimeout = setTimeout(() => {
        // 保存已配對狀態
        const savedMatchedPairs = new Set(this.matchedPairs);
        
        // 調整卡片位置（不重新創建卡片）
        this.repositionCards();
        
        // 恢復已配對狀態
        this.matchedPairs = savedMatchedPairs;
    }, 300);
}, this);
```

### 步驟 2：新增 repositionCards() 方法

```javascript
repositionCards() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    if (this.layout === 'mixed') {
        this.repositionMixedLayout(width, height);
    } else {
        this.repositionSeparatedLayout(width, height);
    }
}
```

### 步驟 3：新增 repositionMixedLayout() 方法

```javascript
repositionMixedLayout(width, height) {
    // 重新計算卡片尺寸和位置
    // 調整所有卡片的位置和大小
    // 保持卡片內容不變
}
```

### 步驟 4：新增 repositionSeparatedLayout() 方法

```javascript
repositionSeparatedLayout(width, height) {
    // 重新計算卡片尺寸和位置
    // 調整所有卡片的位置和大小
    // 保持卡片內容不變
}
```

## 瀏覽器縮放（Zoom）處理

瀏覽器縮放不會觸發 resize 事件，但會改變 `window.innerWidth` 和 `window.innerHeight`。

**解決方案**: 監聽 `window` 的 `resize` 事件

```javascript
window.addEventListener('resize', () => {
    console.log('🔄 視窗大小改變');
    // 觸發 Phaser 的 resize 事件
    this.scale.resize(window.innerWidth, window.innerHeight);
});
```

## 測試步驟

1. 啟動遊戲
2. 配對 3-5 個卡片
3. 改變視窗大小 → 卡片應該調整位置，但詞彙不變
4. 瀏覽器縮放 → 卡片應該調整大小，但詞彙不變
5. 換頁 → 應該顯示新頁面的詞彙
6. 返回上一頁 → 應該顯示上一頁的詞彙和已配對狀態

## 預期結果

✅ 詞彙數據保持不變
✅ 已配對狀態保持不變
✅ 卡片順序保持不變
✅ 視窗改變時卡片自動調整
✅ 性能提升（不需要重新創建卡片）

