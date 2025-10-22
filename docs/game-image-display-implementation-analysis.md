# 遊戲場景圖片顯示邏輯實現分析

## 📋 概述

本文檔詳細分析如何在 shimozurdo-game 遊戲場景中實現圖片顯示邏輯。

---

## 🎯 當前狀態

### ✅ 已完成的部分

1. **圖片數據流程** ✅
   - 創建頁面 → 選擇圖片 → 生成圖片 → 上傳 Blob → 保存數據庫
   - 遊戲載入 → GEPTManager 處理 → 詞彙對象包含 image 字段

2. **測試驗證** ✅
   - 使用 Playwright 完整測試了圖片流程
   - 確認詞彙對象包含正確的 imageUrl
   - 控制台日誌顯示詞彙數據成功載入

### ❌ 未完成的部分

1. **遊戲場景圖片顯示** ❌
   - 雲朵敵人尚未顯示圖片
   - 目標詞彙區域尚未顯示圖片
   - 需要在 `public/games/shimozurdo-game/scenes/title.js` 中實現

---

## 🏗️ 架構分析

### 關鍵文件

**文件**: `public/games/shimozurdo-game/scenes/title.js`

**關鍵函數**:

1. **createTargetWordDisplay()** (第654-765行)
   - 創建UI元素（分數、中文文字、英文文字）
   - **需要添加**: 初始化圖片容器

2. **spawnCloudEnemy()** (第894-970行)
   - 生成雲朵敵人
   - 創建文字顯示
   - **需要添加**: 創建圖片顯示

3. **setRandomTargetWord()** (第793-828行)
   - 設置新的目標詞彙
   - 更新UI文字
   - **需要添加**: 更新目標圖片

4. **updateEnemies()** (第978-1040行)
   - 更新敵人移動
   - **需要添加**: 同步移動圖片

---

## 💡 實現方案

### 方案 1: 在雲朵敵人上顯示圖片

#### 位置: spawnCloudEnemy() 函數

**當前代碼** (第939-955行):
```javascript
// 🆕 添加詞彙文字 - 顯示英文單字（放入雲中，透明背景）
const wordText = this.add.text(
    enemy.x,
    enemy.y,
    word.english,
    {
        fontSize: '22px',
        color: isTarget ? '#ff0000' : '#000000',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 2
    }
).setOrigin(0.5);
wordText.setDepth(-63);

// 🆕 將文字綁定到敵人
enemy.setData('wordText', wordText);
```

**需要添加** (在第955行之後):
```javascript
// 🖼️ 如果詞彙有圖片，顯示圖片
if (word.image) {
    const imageKey = `word-image-${word.id}`;
    
    // 檢查圖片是否已經載入
    if (!this.textures.exists(imageKey)) {
        // 動態載入圖片
        this.load.image(imageKey, word.image);
        this.load.once('complete', () => {
            this.createWordImage(enemy, word, imageKey);
        });
        this.load.start();
    } else {
        // 圖片已載入，直接創建
        this.createWordImage(enemy, word, imageKey);
    }
}
```

#### 新增輔助函數: createWordImage()

**位置**: 在 spawnCloudEnemy() 之後

**代碼**:
```javascript
/**
 * 🖼️ 創建雲朵敵人的圖片顯示
 */
createWordImage(enemy, word, imageKey) {
    // 防禦性檢查：確保敵人仍然存在
    if (!enemy || !enemy.active) {
        console.warn('⚠️ 敵人已被銷毀，無法創建圖片');
        return;
    }
    
    // 創建圖片精靈
    const wordImage = this.add.image(
        enemy.x,
        enemy.y - 40,  // 在雲朵上方顯示
        imageKey
    );
    
    // 設置圖片屬性
    wordImage.setScale(0.15);      // 縮小圖片
    wordImage.setDepth(-62);       // 在文字前面，雲朵後面
    wordImage.setOrigin(0.5);      // 中心對齊
    wordImage.setAlpha(0.9);       // 稍微透明
    
    // 綁定到敵人
    enemy.setData('wordImage', wordImage);
    
    console.log(`🖼️ 創建雲朵圖片: ${word.english} at (${enemy.x}, ${enemy.y - 40})`);
}
```

---

### 方案 2: 在目標詞彙區域顯示圖片

#### 位置 1: createTargetWordDisplay() 函數

**當前代碼** (第672行):
```javascript
this.currentTargetWord = null;  // 當前目標詞彙
```

**需要添加** (在第672行之後):
```javascript
this.targetImage = null;        // 目標詞彙圖片容器
```

#### 位置 2: setRandomTargetWord() 函數

**當前代碼** (第812-815行):
```javascript
// 🆕 更新英文大字（中列，對換後）
this.chineseText.setText(this.currentTargetWord.english);

// 🆕 更新中文文字（右列，對換後）
this.targetText.setText(this.currentTargetWord.chinese);
```

**需要添加** (在第815行之後):
```javascript
// 🖼️ 更新目標詞彙圖片
if (this.currentTargetWord.image) {
    const imageKey = `target-image-${this.currentTargetWord.id}`;
    
    // 檢查圖片是否已經載入
    if (!this.textures.exists(imageKey)) {
        // 動態載入圖片
        this.load.image(imageKey, this.currentTargetWord.image);
        this.load.once('complete', () => {
            this.updateTargetImage(imageKey);
        });
        this.load.start();
    } else {
        // 圖片已載入，直接更新
        this.updateTargetImage(imageKey);
    }
} else {
    // 沒有圖片，隱藏圖片容器
    if (this.targetImage) {
        this.targetImage.setVisible(false);
    }
}
```

#### 新增輔助函數: updateTargetImage()

**位置**: 在 setRandomTargetWord() 之後

**代碼**:
```javascript
/**
 * 🖼️ 更新目標詞彙圖片顯示
 */
updateTargetImage(imageKey) {
    // 獲取相機視口
    const cam = this.cameras.main;
    const centerX = cam.scrollX + cam.width * 0.5;   // 中央位置
    const topY = cam.scrollY + 80;                   // 在文字下方
    
    if (this.targetImage) {
        // 更新現有圖片
        this.targetImage.setTexture(imageKey);
        this.targetImage.setVisible(true);
        this.targetImage.setPosition(centerX, topY);
    } else {
        // 創建新圖片
        this.targetImage = this.add.image(centerX, topY, imageKey);
        this.targetImage.setScale(0.2);              // 稍大一點
        this.targetImage.setDepth(200);              // 在最前面
        this.targetImage.setScrollFactor(1);         // 跟隨相機
        this.targetImage.setOrigin(0.5);             // 中心對齊
    }
    
    console.log(`🖼️ 更新目標圖片: ${imageKey} at (${centerX}, ${topY})`);
}
```

---

### 方案 3: 同步移動圖片

#### 位置: updateEnemies() 函數

**當前代碼** (第993-1040行):
```javascript
// 更新現有敵人 - 倒序遍歷以安全刪除元素
for (let i = this.enemies.length - 1; i >= 0; i--) {
    const enemy = this.enemies[i];
    
    if (!enemy || !enemy.active) {
        this.enemies.splice(i, 1);
        continue;
    }
    
    // 移動敵人
    enemy.x -= enemy.speed;
    
    // 同步移動文字
    const wordText = enemy.getData('wordText');
    if (wordText && wordText.active) {
        wordText.x = enemy.x;
        wordText.y = enemy.y;
    }
    
    // ... 其他邏輯
}
```

**需要添加** (在同步移動文字之後):
```javascript
// 🖼️ 同步移動圖片
const wordImage = enemy.getData('wordImage');
if (wordImage && wordImage.active) {
    wordImage.x = enemy.x;
    wordImage.y = enemy.y - 40;  // 保持在雲朵上方
}
```

---

### 方案 4: 清理圖片資源

#### 位置: 敵人銷毀邏輯

**當前代碼** (在多個位置):
```javascript
// 銷毀文字
const wordText = enemy.getData('wordText');
if (wordText && wordText.active) {
    wordText.destroy();
}

// 銷毀敵人
enemy.destroy();
```

**需要添加** (在銷毀文字之後):
```javascript
// 🖼️ 銷毀圖片
const wordImage = enemy.getData('wordImage');
if (wordImage && wordImage.active) {
    wordImage.destroy();
}
```

---

## 🎨 視覺設計

### 雲朵圖片

- **位置**: 雲朵上方 40 像素
- **縮放**: 0.15 (15%)
- **深度**: -62 (在文字前面，雲朵後面)
- **透明度**: 0.9 (稍微透明)
- **對齊**: 中心對齊

### 目標圖片

- **位置**: UI 區域中央，文字下方 80 像素
- **縮放**: 0.2 (20%)
- **深度**: 200 (在最前面)
- **透明度**: 1.0 (完全不透明)
- **對齊**: 中心對齊

---

## 🔧 技術細節

### 動態載入圖片

**Phaser 3 動態載入 API**:
```javascript
// 載入圖片
this.load.image(key, url);

// 監聽載入完成
this.load.once('complete', () => {
    // 載入完成後的邏輯
});

// 開始載入
this.load.start();
```

### 圖片快取檢查

**避免重複載入**:
```javascript
if (!this.textures.exists(imageKey)) {
    // 圖片未載入，需要載入
    this.load.image(imageKey, imageUrl);
    this.load.start();
} else {
    // 圖片已載入，直接使用
    this.add.image(x, y, imageKey);
}
```

### 深度管理

**深度層級**:
- `-110`: 背景色
- `-100 ~ -70`: 視差背景層
- `-65`: 雲朵敵人
- `-63`: 雲朵文字
- `-62`: 雲朵圖片 ⭐
- `0`: 太空船
- `200`: UI 元素（分數、目標文字、目標圖片）

---

## ✅ 實現檢查清單

### 必須實現的功能

- [ ] 在 `createTargetWordDisplay()` 中初始化 `this.targetImage = null`
- [ ] 在 `spawnCloudEnemy()` 中添加圖片顯示邏輯
- [ ] 創建 `createWordImage()` 輔助函數
- [ ] 在 `setRandomTargetWord()` 中添加目標圖片更新邏輯
- [ ] 創建 `updateTargetImage()` 輔助函數
- [ ] 在 `updateEnemies()` 中添加圖片同步移動邏輯
- [ ] 在所有敵人銷毀位置添加圖片清理邏輯

### 需要測試的場景

- [ ] 有圖片的詞彙正確顯示圖片
- [ ] 沒有圖片的詞彙不顯示圖片
- [ ] 圖片跟隨雲朵移動
- [ ] 圖片在敵人銷毀時正確清理
- [ ] 目標詞彙圖片正確更新
- [ ] 圖片載入失敗時不影響遊戲
- [ ] 多個相同詞彙共享圖片快取

---

## 🎯 預期效果

### 成功標準

1. ✅ 雲朵敵人顯示對應的圖片
2. ✅ 目標詞彙區域顯示對應的圖片
3. ✅ 圖片跟隨雲朵移動
4. ✅ 圖片正確縮放和定位
5. ✅ 沒有圖片的詞彙不顯示圖片
6. ✅ 資源正確清理，無記憶體洩漏
7. ✅ 圖片載入不影響遊戲流暢度

### 用戶體驗

- 🎨 視覺更豐富，學習更有趣
- 🖼️ 圖片輔助記憶，提升學習效果
- 🎮 遊戲性不受影響，流暢運行
- 📱 支援各種圖片格式和尺寸

---

## 📊 實施優先級

### 高優先級 (必須實現)

1. ✅ 雲朵敵人圖片顯示
2. ✅ 圖片同步移動
3. ✅ 圖片資源清理

### 中優先級 (建議實現)

4. ✅ 目標詞彙圖片顯示
5. ✅ 圖片快取優化

### 低優先級 (可選實現)

6. ⭐ 圖片載入動畫
7. ⭐ 圖片淡入淡出效果
8. ⭐ 圖片預載入優化

---

## 🚀 下一步

1. **實施代碼修改**
   - 按照上述方案修改 title.js
   - 添加所有必要的函數和邏輯

2. **測試驗證**
   - 使用 Playwright 測試圖片顯示
   - 驗證所有場景和邊緣情況

3. **性能優化**
   - 檢查圖片載入性能
   - 優化圖片快取機制

4. **文檔更新**
   - 更新遊戲文檔
   - 添加圖片功能說明

---

**準備好實施了嗎？** 🎉

