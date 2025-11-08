# Match-Up Game - 重新載入調用鏈深度分析

## 📍 調用鏈追蹤

### 🔴 調用鏈 1：Resize 事件 → repositionCards()

```
用戶調整視窗大小
    ↓
Phaser scale.on('resize') 事件觸發
    ↓ (第 779-797 行)
防抖延遲 300ms
    ↓
repositionCards() 被調用
    ↓ (第 1305-1325 行)
根據佈局模式調用：
    ├─ repositionMixedLayout()
    │   ├─ 計算新的卡片尺寸
    │   └─ 調整卡片位置（使用 card.setPosition()）
    │
    └─ repositionSeparatedLayout()
        ├─ repositionLeftRightSingleColumn()
        │   ├─ 計算新的卡片尺寸
        │   └─ 調整卡片位置（使用 card.setPosition()）
        │
        └─ repositionLeftRightMultiRows()
            └─ 調用 repositionLeftRightSingleColumn()

✅ 結果：只調整位置，不重新創建卡片
```

**代碼位置：**
- 事件監聽：第 779-797 行
- 方法實現：第 1305-1325 行
- 混合佈局：第 1328-1358 行
- 分離佈局：第 1361-1376 行
- 單列調整：第 1378-1461 行
- 多行調整：第 1464-1472 行

---

### 🟠 調用鏈 2：Fullscreen 事件 → updateLayout()

```
用戶進入/退出全螢幕
    ↓
document.addEventListener('fullscreenchange') 觸發
    ↓ (第 802 行)
handleFullscreenChange() 被調用
    ↓ (第 7376-7380 行)
updateLayout() 被調用
    ↓ (第 1196-1259 行)
1️⃣ this.children.removeAll(true)
    ├─ 清除所有 UI 元素
    ├─ 清除所有卡片
    └─ 清除所有按鈕
    ↓
2️⃣ this.add.rectangle() - 添加背景
    ↓
3️⃣ this.createCards() 被調用
    ↓ (第 1475-1573 行)
    ├─ 獲取當前頁詞彙數據
    ├─ 根據佈局模式創建卡片：
    │   ├─ createMixedLayout()
    │   │   ├─ 檢查 shuffledPairsCache
    │   │   ├─ 如果有緩存，使用緩存
    │   │   └─ 如果無緩存，進行洗牌
    │   │
    │   └─ createSeparatedLayout()
    │       ├─ 檢查 rightCardsOrderCache
    │       ├─ 如果有緩存，使用緩存
    │       └─ 如果無緩存，進行洗牌
    │
    └─ 創建分頁指示器
    ↓
4️⃣ this.createTimerUI()
    ↓
5️⃣ this.showSubmitButton()

❌ 結果：清除所有元素，重新創建卡片，可能重新洗牌
```

**代碼位置：**
- 事件監聽：第 802 行
- 事件處理：第 7376-7380 行
- updateLayout：第 1196-1259 行
- createCards：第 1475-1573 行

---

### 🟡 調用鏈 3：Orientation 事件 → updateLayout()

```
用戶改變設備方向
    ↓
window.addEventListener('orientationchange') 觸發
    ↓ (第 806 行)
handleOrientationChange() 被調用
    ↓ (第 7383-7388 行)
updateLayout() 被調用
    ↓
[與調用鏈 2 相同的流程]

❌ 結果：清除所有元素，重新創建卡片，可能重新洗牌
```

**代碼位置：**
- 事件監聽：第 806 行
- 事件處理：第 7383-7388 行

---

### 🟢 調用鏈 4：Visibility 事件 → saveGameProgressLocally()

```
用戶最小化瀏覽器或切換標籤
    ↓
document.addEventListener('visibilitychange') 觸發
    ↓ (第 814-822 行)
visibilityChangeListener 被調用
    ↓
if (document.hidden) {
    this.saveGameProgressLocally()
}
    ↓ (第 5700-5750 行)
1️⃣ 準備進度數據
    ├─ sessionId
    ├─ activityId
    ├─ currentPage
    ├─ matchedPairs
    ├─ allPagesAnswers
    ├─ currentPageAnswers
    ├─ gameStartTime
    ├─ totalGameTime
    ├─ gameState
    ├─ timerType
    ├─ remainingTime
    ├─ layout
    ├─ random
    └─ timestamp
    ↓
2️⃣ localStorage.setItem('match-up-progress', JSON.stringify(progressData))
    ↓
3️⃣ console.log('✅ 進度已保存到本地')

✅ 結果：只保存進度，不修改遊戲狀態
```

**代碼位置：**
- 事件監聽：第 814-822 行
- 保存方法：第 5700-5750 行

---

### 🔵 調用鏈 5：頁面變化 → updateLayout()

```
用戶點擊「下一頁」按鈕
    ↓
goToNextPage() 被調用
    ↓ (第 6048-6063 行)
1️⃣ this.currentPage++
    ↓
2️⃣ this.shuffledPairsCache = null
    ↓
3️⃣ this.rightCardsOrderCache = null
    ↓
4️⃣ this.updateLayout() 被調用
    ↓
[與調用鏈 2 相同的流程]

⚠️ 結果：清除所有元素，重新創建卡片，重新洗牌（預期行為）
```

**代碼位置：**
- 方法實現：第 6048-6063 行

---

### 🟣 調用鏈 6：遊戲重新開始 → scene.restart()

```
用戶點擊「Start again」按鈕
    ↓
restartGame() 被調用
    ↓ (第 6433-6463 行)
1️⃣ 關閉模態框
    ├─ this.gameCompleteModal.overlay.destroy()
    └─ this.gameCompleteModal.modal.destroy()
    ↓
2️⃣ 重置遊戲狀態
    ├─ this.gameState = 'playing'
    ├─ this.gameStartTime = null
    ├─ this.gameEndTime = null
    ├─ this.totalGameTime = 0
    ├─ this.allPagesAnswers = []
    ├─ this.currentPageAnswers = []
    ├─ this.currentPage = 0
    └─ this.matchedPairs.clear()
    ↓
3️⃣ this.shuffledPairsCache = null
    ↓
4️⃣ this.rightCardsOrderCache = null
    ↓
5️⃣ this.scene.restart()
    ↓
Phaser 場景完全重新啟動
    ↓
調用 create() 方法
    ↓
[與調用鏈 2 相同的流程]

❌ 結果：完全重新啟動，所有進度清除，重新洗牌
```

**代碼位置：**
- 方法實現：第 6433-6463 行

---

### 🟠 調用鏈 7：ResponsiveManager → updateLayout()

```
設備類型變化（例如：從手機變為平板）
    ↓
ResponsiveManager.onResize() 被調用
    ↓ (responsive-manager.js 第 290-296 行)
防抖延遲
    ↓
ResponsiveManager.updateLayout() 被調用
    ↓ (responsive-manager.js 第 301-345 行)
1️⃣ 檢測設備類型
    ├─ DeviceDetector.detect(width, height)
    └─ 比較 currentDevice.type 是否改變
    ↓
2️⃣ 如果設備類型改變
    ├─ this.currentDevice = device
    └─ this.scene.updateLayout()
    ↓
[與調用鏈 2 相同的流程]

❌ 結果：清除所有元素，重新創建卡片，可能重新洗牌
```

**代碼位置：**
- 方法實現：responsive-manager.js 第 301-345 行

---

## 🔍 **調用鏈中的關鍵決策點**

### 1. 卡片創建時的洗牌決策

```javascript
// 在 createSeparatedLayout() 中（第 1694-1729 行）
if (this.rightCardsOrderCache && this.rightCardsOrderCache.length === currentPagePairs.length) {
    // ✅ 使用緩存的順序（不重新洗牌）
    shuffledAnswers = this.rightCardsOrderCache;
} else {
    // ❌ 進行新的洗牌
    if (this.random === 'same') {
        // 固定隨機模式
        shuffledAnswers = rng.shuffle([...currentPagePairs]);
    } else {
        // 隨機模式
        shuffledAnswers = [...currentPagePairs];
        for (let i = shuffledAnswers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
        }
    }
    // 保存到緩存
    this.rightCardsOrderCache = shuffledAnswers;
}
```

### 2. 緩存清除決策

```javascript
// 在 goToNextPage() 中（第 6054-6059 行）
this.shuffledPairsCache = null;  // 清除混合佈局緩存
this.rightCardsOrderCache = null;  // 清除分離佈局緩存

// 在 restartGame() 中（第 6454-6459 行）
this.shuffledPairsCache = null;  // 清除混合佈局緩存
this.rightCardsOrderCache = null;  // 清除分離佈局緩存
```

---

## 📊 **調用鏈性能對比**

| 調用鏈 | 觸發事件 | 方法調用 | 清除元素 | 重新洗牌 | 性能 | 優化狀態 |
|------|--------|--------|--------|--------|------|--------|
| 1 | Resize | repositionCards | ❌ | ❌ | ⭐⭐⭐⭐⭐ | ✅ |
| 2 | Fullscreen | updateLayout | ✅ | ⚠️ | ⭐⭐ | ❌ |
| 3 | Orientation | updateLayout | ✅ | ⚠️ | ⭐⭐ | ❌ |
| 4 | Visibility | saveProgress | ❌ | ❌ | ⭐⭐⭐⭐⭐ | ✅ |
| 5 | 頁面變化 | updateLayout | ✅ | ✅ | ⭐⭐⭐ | ✅ |
| 6 | 重新開始 | scene.restart | ✅ | ✅ | ⭐ | ✅ |
| 7 | 設備變化 | updateLayout | ✅ | ⚠️ | ⭐⭐ | ❌ |

---

## 🎯 **優化機會**

### 優先級 1：立即優化（高影響）

**調用鏈 2 和 3：Fullscreen 和 Orientation 事件**
```javascript
// 改為使用 repositionCards() 而不是 updateLayout()
handleFullscreenChange() {
    this.repositionCards();  // 只調整位置
}

handleOrientationChange() {
    this.repositionCards();  // 只調整位置
}
```

### 優先級 2：中期優化（中等影響）

**調用鏈 7：ResponsiveManager**
```javascript
// 改為使用 repositionCards() 而不是 updateLayout()
if (this.scene && this.scene.repositionCards) {
    this.scene.repositionCards();  // 只調整位置
}
```

### 優先級 3：長期優化（低影響）

**調用鏈 5：頁面變化**
- 當前行為是正確的（需要重新洗牌）
- 無需優化


