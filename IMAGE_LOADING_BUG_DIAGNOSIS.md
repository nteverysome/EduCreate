# 🔴 Match-up 遊戲圖片載入失敗 Bug 診斷報告

## 問題描述

Match-up 遊戲中圖片無法正確載入，導致卡片顯示為空白。

## 🔍 根本原因分析

### 問題位置
**文件**：`public/games/match-up-game/scenes/game.js`
**函數**：`loadAndDisplayImage()` 第 3423-3448 行

### 問題代碼
```javascript
loadAndDisplayImage(container, imageUrl, x, y, size, pairId) {
    const imageKey = `card-image-${pairId}`;

    if (!this.textures.exists(imageKey)) {
        this.load.image(imageKey, imageUrl);

        // ❌ 問題：使用 this.load.once() 只監聽一次事件
        this.load.once('complete', () => {
            if (this.textures.exists(imageKey)) {
                const cardImage = this.add.image(x, y, imageKey);
                cardImage.setDisplaySize(size, size);
                cardImage.setOrigin(0.5);
                container.add(cardImage);
            }
        });

        this.load.once('loaderror', (file) => {
            console.warn(`⚠️ 圖片載入失敗: ${file.key}`, imageUrl);
        });

        this.load.start();
    } else {
        // 如果已經載入過，直接使用
        const cardImage = this.add.image(x, y, imageKey);
        cardImage.setDisplaySize(size, size);
        cardImage.setOrigin(0.5);
        container.add(cardImage);
    }
}
```

### 根本原因

**使用 `this.load.once()` 導致事件監聽器只觸發一次**

當多個圖片同時載入時：
1. 第一張圖片：`this.load.once('complete')` 監聽器被觸發 ✅
2. 第二張圖片：`this.load.once('complete')` 監聽器已被消費，不再觸發 ❌
3. 第三張圖片及以後：同樣無法觸發 ❌

**結果**：只有第一張圖片能正確載入，其他圖片全部失敗

### 為什麼會這樣

Phaser 的 `load.once()` 方法只會監聽一次事件，然後自動移除監聽器。這在單個圖片載入時沒問題，但當多個圖片同時載入時就會出現問題。

## 🔧 修復方案

### 方案 1：使用 Promise 包裝（推薦）

```javascript
loadAndDisplayImage(container, imageUrl, x, y, size, pairId) {
    const imageKey = `card-image-${pairId}`;

    if (!this.textures.exists(imageKey)) {
        // 使用 Promise 包裝 Phaser 的載入系統
        return new Promise((resolve, reject) => {
            this.load.image(imageKey, imageUrl);

            // 使用 on() 而不是 once()，並在完成後移除監聽器
            const onComplete = () => {
                if (this.textures.exists(imageKey)) {
                    const cardImage = this.add.image(x, y, imageKey);
                    cardImage.setDisplaySize(size, size);
                    cardImage.setOrigin(0.5);
                    container.add(cardImage);
                    
                    // 移除監聽器
                    this.load.off('complete', onComplete);
                    this.load.off('loaderror', onError);
                    resolve();
                }
            };

            const onError = (file) => {
                if (file.key === imageKey) {
                    console.warn(`⚠️ 圖片載入失敗: ${file.key}`, imageUrl);
                    this.load.off('complete', onComplete);
                    this.load.off('loaderror', onError);
                    reject(new Error(`Failed to load image: ${imageKey}`));
                }
            };

            this.load.on('complete', onComplete);
            this.load.on('loaderror', onError);
            this.load.start();
        });
    } else {
        // 如果已經載入過，直接使用
        const cardImage = this.add.image(x, y, imageKey);
        cardImage.setDisplaySize(size, size);
        cardImage.setOrigin(0.5);
        container.add(cardImage);
        return Promise.resolve();
    }
}
```

### 方案 2：使用特定文件事件

```javascript
// 使用 filecomplete 事件而不是 complete 事件
this.load.on(`filecomplete-image-${imageKey}`, () => {
    // 圖片載入完成
});
```

## 📊 影響範圍

- ✅ 所有使用圖片的卡片
- ✅ 所有佈局類型（A、B、C、D、E、F）
- ✅ 所有設備尺寸

## 🚀 預期效果

修復後：
1. ✅ 所有圖片都能正確載入
2. ✅ 多個圖片同時載入時不會出現遺漏
3. ✅ 圖片載入失敗時能正確捕獲錯誤
4. ✅ 遊戲不會因為圖片載入失敗而卡住

## ⚠️ 注意事項

- 需要確保 imageUrl 是有效的 URL
- 需要處理跨域圖片載入的問題
- 應添加超時機制防止無限等待

