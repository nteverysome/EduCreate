# Match-Up Game - 重新載入機制深度分析

## 📊 概述

Match-Up Game 中有多個機制可能導致重新載入、重新創建卡片或重新洗牌。本文檔詳細分析所有這些機制。

---

## 🔴 **第一級：完整場景重新啟動**

### 1. `scene.restart()` - 場景完全重新啟動

**觸發位置：**
- `showAnswersReview()` 方法（第 6002 行）- 查看答案後點擊關閉按鈕
- `restartGame()` 方法（第 6462 行）- 遊戲完成後點擊「Start again」按鈕

**效果：**
```
完全重新啟動場景
↓
調用 create() 方法
↓
重新初始化所有變數
↓
重新載入詞彙數據
↓
重新洗牌卡片
↓
重新創建所有 UI 元素
```

**影響範圍：**
- ❌ 遊戲進度完全重置
- ❌ 所有卡片重新洗牌
- ❌ 計時器重置
- ❌ 已配對狀態清除

---

## 🟠 **第二級：完整佈局重新計算**

### 2. `updateLayout()` - 完整佈局重新計算

**觸發位置：**
- `create()` 方法（第 761 行）- 場景初始化時
- `handleResize()` 方法（第 1265 行）- 舊的 resize 事件處理（已棄用）
- `goToNextPage()` 方法（第 6062 行）- 進入下一頁時
- `handleFullscreenChange()` 方法（第 7379 行）- 全螢幕狀態變化時
- `handleOrientationChange()` 方法（第 7387 行）- 設備方向變化時
- `ResponsiveManager.updateLayout()` 方法（第 337 行）- 設備類型變化時

**內部流程：**
```javascript
updateLayout() {
    // 1️⃣ 清除所有現有元素
    this.children.removeAll(true);  // 第 1206 行
    
    // 2️⃣ 添加背景
    this.add.rectangle(...);
    
    // 3️⃣ 創建卡片
    this.createCards();  // 第 1220 行
    
    // 4️⃣ 創建計時器 UI
    this.createTimerUI();
    
    // 5️⃣ 顯示提交按鈕
    this.showSubmitButton();
}
```

**效果：**
- ❌ 清除所有 UI 元素
- ❌ 重新創建卡片（導致重新洗牌）
- ❌ 重新創建計時器
- ❌ 重新創建按鈕

**影響範圍：**
- ⚠️ 已配對狀態保留（通過 `matchedPairs` Map）
- ⚠️ 遊戲進度保留（通過 `currentPage` 等變數）
- ❌ 卡片順序改變（重新洗牌）

---

## 🟡 **第三級：卡片位置調整（推薦方式）**

### 3. `repositionCards()` - 只調整位置，不重新創建卡片

**觸發位置：**
- `resize` 事件監聽器（第 793 行）- 視窗大小改變時

**內部流程：**
```javascript
repositionCards() {
    // 1️⃣ 根據佈局模式調用相應方法
    if (this.layout === 'mixed') {
        this.repositionMixedLayout(width, height);
    } else {
        this.repositionSeparatedLayout(width, height);
    }
    
    // 2️⃣ 只調整位置，不重新創建卡片
    // 使用 card.setPosition() 而不是 createCard()
}
```

**效果：**
- ✅ 卡片位置調整
- ✅ 卡片尺寸調整
- ✅ 卡片順序保持不變
- ✅ 已配對狀態保持不變

**優點：**
- 性能最佳
- 用戶體驗最好
- 進度完全保留

---

## 🟢 **第四級：事件監聽器**

### 4. 事件監聽器觸發的重新載入

#### A. Resize 事件
```javascript
// 第 779-797 行
this.scale.on('resize', (gameSize) => {
    // 防抖延遲 300ms
    this.resizeTimeout = setTimeout(() => {
        this.repositionCards();  // ✅ v87.0 改進：只調整位置
    }, 300);
});
```

**狀態：** ✅ 已優化（v87.0）

#### B. Fullscreen 事件
```javascript
// 第 802 行
document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));

// 第 7376-7380 行
handleFullscreenChange() {
    this.updateLayout();  // ❌ 導致重新洗牌
}
```

**狀態：** ❌ 需要優化

#### C. Orientation 事件
```javascript
// 第 806 行
window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

// 第 7383-7388 行
handleOrientationChange() {
    this.updateLayout();  // ❌ 導致重新洗牌
}
```

**狀態：** ❌ 需要優化

#### D. Visibility 事件
```javascript
// 第 814-822 行
this.visibilityChangeListener = () => {
    if (document.hidden) {
        this.saveGameProgressLocally();  // ✅ 只保存進度
    }
};
document.addEventListener('visibilitychange', this.visibilityChangeListener);
```

**狀態：** ✅ 已優化（v97.0）

---

## 📋 **第五級：卡片創建時的洗牌機制**

### 5. `createCards()` - 創建卡片並洗牌

**觸發位置：**
- `updateLayout()` 方法（第 1220 行）
- `restoreMatchedPairsVisuals()` 方法（第 5792 行）

**內部流程：**
```javascript
createCards() {
    // 1️⃣ 獲取當前頁的詞彙數據
    const currentPagePairs = this.pairs.slice(startIndex, endIndex);
    
    // 2️⃣ 根據佈局模式創建卡片
    if (this.layout === 'mixed') {
        this.createMixedLayout(currentPagePairs, ...);
    } else {
        this.createSeparatedLayout(currentPagePairs, ...);
    }
}
```

### 6. `createSeparatedLayout()` - 分離佈局洗牌

**洗牌邏輯（第 1694-1729 行）：**
```javascript
// 🔥 v98.0: 檢查是否有緩存的右側卡片順序
if (this.rightCardsOrderCache && this.rightCardsOrderCache.length === currentPagePairs.length) {
    shuffledAnswers = this.rightCardsOrderCache;  // ✅ 使用緩存
} else {
    // 進行洗牌
    if (this.random === 'same') {
        // 固定隨機模式：使用 activityId 作為種子
        shuffledAnswers = rng.shuffle([...currentPagePairs]);
    } else {
        // 隨機模式：使用 Fisher-Yates 算法
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

**狀態：** ✅ 已優化（v98.0）

### 7. `createMixedLayout()` - 混合佈局洗牌

**洗牌邏輯（第 3618-3657 行）：**
```javascript
// 🔥 v54.0: 檢查是否有緩存的洗牌順序
if (this.shuffledPairsCache && this.shuffledPairsCache.length === currentPagePairs.length) {
    shuffledPairs = this.shuffledPairsCache;  // ✅ 使用緩存
} else {
    // 進行洗牌...
    this.shuffledPairsCache = shuffledPairs;  // 保存到緩存
}
```

**狀態：** ✅ 已優化（v54.0）

---

## 🔄 **第六級：緩存清除機制**

### 8. 何時清除緩存

#### A. 頁面變化時
```javascript
// 第 6054-6059 行
goToNextPage() {
    this.currentPage++;
    this.shuffledPairsCache = null;  // 清除混合佈局緩存
    this.rightCardsOrderCache = null;  // 清除分離佈局緩存
    this.updateLayout();  // 重新創建卡片（會重新洗牌）
}
```

#### B. 遊戲重新開始時
```javascript
// 第 6454-6459 行
restartGame() {
    this.shuffledPairsCache = null;  // 清除混合佈局緩存
    this.rightCardsOrderCache = null;  // 清除分離佈局緩存
    this.scene.restart();  // 完全重新啟動
}
```

---

## 📊 **重新載入機制總結表**

| 機制 | 觸發條件 | 清除元素 | 重新洗牌 | 保留進度 | 優化狀態 |
|------|--------|--------|--------|--------|--------|
| `scene.restart()` | 查看答案/重新開始 | ✅ 全部 | ✅ 是 | ❌ 否 | ✅ 正確 |
| `updateLayout()` | 全螢幕/方向變化/換頁 | ✅ 全部 | ✅ 是 | ⚠️ 部分 | ❌ 需優化 |
| `repositionCards()` | 視窗大小改變 | ❌ 無 | ❌ 否 | ✅ 是 | ✅ 已優化 |
| Fullscreen 事件 | 進入/退出全螢幕 | ✅ 全部 | ✅ 是 | ⚠️ 部分 | ❌ 需優化 |
| Orientation 事件 | 設備方向改變 | ✅ 全部 | ✅ 是 | ⚠️ 部分 | ❌ 需優化 |
| Visibility 事件 | 最小化/切換標籤 | ❌ 無 | ❌ 否 | ✅ 是 | ✅ 已優化 |

---

## 🎯 **優化建議**

### 1. 優化 Fullscreen 事件
```javascript
// 改為使用 repositionCards() 而不是 updateLayout()
handleFullscreenChange() {
    this.repositionCards();  // 只調整位置
}
```

### 2. 優化 Orientation 事件
```javascript
// 改為使用 repositionCards() 而不是 updateLayout()
handleOrientationChange() {
    this.repositionCards();  // 只調整位置
}
```

### 3. 禁用 ResponsiveManager 的自動 updateLayout()
```javascript
// 在 ResponsiveManager 中，改為調用 repositionCards()
if (this.scene && this.scene.repositionCards) {
    this.scene.repositionCards();  // 只調整位置
}
```

---

## 📈 **性能影響分析**

### 當前狀態（v98.0）

**高性能操作（推薦）：**
- ✅ Resize 事件 → `repositionCards()` → 性能最佳
- ✅ Visibility 事件 → 只保存進度 → 性能最佳

**中等性能操作（可接受）：**
- ⚠️ 換頁 → `updateLayout()` → 必要的重新洗牌
- ⚠️ 遊戲重新開始 → `scene.restart()` → 必要的完全重置

**低性能操作（需要優化）：**
- ❌ Fullscreen 事件 → `updateLayout()` → 不必要的重新洗牌
- ❌ Orientation 事件 → `updateLayout()` → 不必要的重新洗牌
- ❌ ResponsiveManager → `updateLayout()` → 不必要的重新洗牌

---

## 🔍 **調試建議**

### 1. 監控重新載入事件
```javascript
// 在 console 中查看日誌
// 搜索以下關鍵詞：
// - "updateLayout 開始"
// - "repositionCards 開始"
// - "scene.restart"
// - "已清除洗牌順序緩存"
```

### 2. 檢查緩存狀態
```javascript
// 在 console 中執行
console.log('rightCardsOrderCache:', this.scene.isRunning('GameScene') ? this.scene.get('GameScene').rightCardsOrderCache : 'N/A');
console.log('shuffledPairsCache:', this.scene.isRunning('GameScene') ? this.scene.get('GameScene').shuffledPairsCache : 'N/A');
```

### 3. 追蹤事件觸發
```javascript
// 在 console 中執行
document.addEventListener('fullscreenchange', () => console.log('fullscreenchange 觸發'));
window.addEventListener('orientationchange', () => console.log('orientationchange 觸發'));
```

---

## 📝 **版本歷史**

- **v54.0** - 添加混合佈局洗牌緩存
- **v87.0** - 改進 resize 事件，使用 repositionCards()
- **v96.0** - 添加進度保存系統
- **v97.0** - 改進 visibility 事件，只保存進度
- **v98.0** - 添加分離佈局洗牌緩存


