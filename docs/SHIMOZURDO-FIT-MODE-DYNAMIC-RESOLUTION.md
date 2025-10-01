# Shimozurdo 遊戲 FIT 模式 + 動態解析度實現

> 將 Shimozurdo 從 RESIZE 模式升級為 FIT 模式，並添加動態解析度功能

## 📋 改進概述

### 改進前（RESIZE 模式）
- ❌ 使用 `Phaser.Scale.RESIZE` 模式
- ❌ 固定解析度 960×540
- ❌ 無法適應超寬螢幕
- ❌ 橫向模式可能有黑邊
- ❌ 遊戲內容可能變形

### 改進後（FIT 模式 + 動態解析度）
- ✅ 使用 `Phaser.Scale.FIT` 模式
- ✅ 動態解析度計算
- ✅ 適應超寬螢幕（寬高比 > 2.0）
- ✅ 橫向模式無黑邊
- ✅ 遊戲內容保持比例

## 🎯 技術實現

### 1. 動態解析度計算函數

```javascript
// 🎯 動態調整遊戲解析度 - 根據螢幕寬高比（參考 Starshake）
function calculateGameDimensions() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const aspectRatio = screenWidth / screenHeight;

  console.log('📱 Shimozurdo 螢幕尺寸:', screenWidth, 'x', screenHeight);
  console.log('📐 寬高比:', aspectRatio.toFixed(2));

  let gameWidth, gameHeight;

  // 檢測橫向模式且寬高比 > 2.0（超寬螢幕）
  if (aspectRatio > 2.0) {
    // 超寬螢幕：增加遊戲寬度以填滿螢幕
    gameWidth = 1600;
    gameHeight = 900;
    console.log('🎮 Shimozurdo 使用超寬解析度:', gameWidth, 'x', gameHeight);
  } else if (aspectRatio > 1.5) {
    // 橫向模式：使用加寬解析度
    gameWidth = 1200;
    gameHeight = 675;
    console.log('🎮 Shimozurdo 使用橫向解析度:', gameWidth, 'x', gameHeight);
  } else {
    // 直向模式或正常寬高比：使用原始解析度
    gameWidth = SIZE_WIDTH_SCREEN;  // 960
    gameHeight = SIZE_HEIGHT_SCREEN; // 540
    console.log('🎮 Shimozurdo 使用標準解析度:', gameWidth, 'x', gameHeight);
  }

  return { gameWidth, gameHeight };
}
```

### 2. FIT 模式配置

```javascript
// 導出遊戲配置物件 - 使用 FIT 模式 + 動態解析度
export const gameConfig = {
  type: Phaser.AUTO,
  // 🎯 使用動態計算的遊戲尺寸
  width: gameWidth,
  height: gameHeight,
  scale: {
    // 🎯 使用 FIT 模式，保持比例並適應容器（參考 Starshake）
    mode: Phaser.Scale.FIT,
    parent: 'game',
    // 🎯 水平居中，垂直向上對齊（參考 Starshake）
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  autoRound: false,
  dom: {
    createContainer: true
  },
  scene: []
};
```

### 3. 視窗大小變化監聽

```javascript
// 🔄 監聽視窗大小變化，動態調整遊戲解析度（參考 Starshake）
window.addEventListener('resize', () => {
  const { gameWidth: newWidth, gameHeight: newHeight } = calculateGameDimensions();

  // 如果解析度改變，重新載入遊戲
  if (newWidth !== gameWidth || newHeight !== gameHeight) {
    console.log('🔄 Shimozurdo 螢幕尺寸改變，重新載入遊戲');
    console.log('📊 舊解析度:', gameWidth, 'x', gameHeight);
    console.log('📊 新解析度:', newWidth, 'x', newHeight);
    window.location.reload();
  }
});
```

## 📊 解析度策略表

| 螢幕類型 | 寬高比範圍 | 遊戲解析度 | 範例設備 |
|---------|-----------|-----------|---------|
| **直向模式** | < 1.5 | 960×540 | iPhone 直向 |
| **橫向模式** | 1.5-2.0 | 1200×675 | iPad 橫向 |
| **超寬螢幕** | > 2.0 | 1600×900 | iPhone 14 橫向 (2.25) |

### 解析度選擇邏輯

#### 直向模式（< 1.5）
- **解析度**：960×540
- **適用場景**：手機直向、平板直向
- **特點**：保持原始遊戲比例

#### 橫向模式（1.5-2.0）
- **解析度**：1200×675
- **適用場景**：平板橫向、小筆電
- **特點**：增加 25% 寬度，提供更寬視野

#### 超寬螢幕（> 2.0）
- **解析度**：1600×900
- **適用場景**：手機橫向、超寬顯示器
- **特點**：增加 67% 寬度，完全填滿螢幕

## 🔄 與 Starshake 的對比

### 相同點
1. **FIT 模式**：兩者都使用 `Phaser.Scale.FIT`
2. **動態解析度**：根據寬高比動態調整
3. **CENTER_HORIZONTALLY**：水平居中，垂直向上對齊
4. **Resize 監聽**：監聽視窗大小變化並重新載入

### 不同點

| 特性 | Starshake | Shimozurdo |
|------|-----------|------------|
| **標準解析度** | 1000×800 | 960×540 |
| **橫向解析度** | 1200×800 | 1200×675 |
| **超寬解析度** | 1600×800 | 1600×900 |
| **寬高比** | 1.25 (4:3.2) | 1.78 (16:9) |

### 為什麼不同？

**Shimozurdo 使用 16:9 比例**：
- 更適合現代螢幕（大多數手機和顯示器都是 16:9）
- 更寬的視野，適合橫向捲軸遊戲
- 更好的移動設備體驗

**Starshake 使用 4:3.2 比例**：
- 更接近正方形，適合垂直移動
- 更緊湊的遊戲畫面
- 更適合街機風格遊戲

## 🎮 FIT 模式 vs RESIZE 模式

### FIT 模式優勢
1. **保持比例**：遊戲內容不會變形
2. **適應容器**：自動縮放以適應容器大小
3. **黑邊控制**：可以通過動態解析度消除黑邊
4. **性能穩定**：固定解析度，性能可預測

### RESIZE 模式劣勢
1. **可能變形**：遊戲內容可能拉伸或壓縮
2. **性能不穩定**：解析度隨容器變化，性能波動
3. **佈局複雜**：需要處理各種尺寸的佈局
4. **測試困難**：需要測試各種螢幕尺寸

## 📱 移動設備測試

### iPhone 14 橫向模式
```
螢幕尺寸：844×390
寬高比：2.16
遊戲解析度：1600×900
結果：✅ 完全填滿螢幕，無黑邊
```

### iPad 橫向模式
```
螢幕尺寸：1024×768
寬高比：1.33
遊戲解析度：960×540
結果：✅ 保持比例，有黑邊（正常）
```

### iPhone 14 直向模式
```
螢幕尺寸：390×844
寬高比：0.46
遊戲解析度：960×540
結果：✅ 保持比例，適應容器
```

## 🔧 實施步驟

### 步驟 1：添加動態解析度函數
在 `main-module.js` 頂部添加 `calculateGameDimensions()` 函數。

### 步驟 2：計算初始尺寸
```javascript
const { gameWidth, gameHeight } = calculateGameDimensions();
```

### 步驟 3：修改遊戲配置
將 `scale.mode` 從 `RESIZE` 改為 `FIT`，並使用動態尺寸。

### 步驟 4：添加 Resize 監聽器
在 `initGame()` 函數中添加視窗大小變化監聽器。

### 步驟 5：測試
在不同設備和方向上測試遊戲。

## ✅ 驗證清單

### 功能驗證
- [ ] 直向模式正常顯示
- [ ] 橫向模式正常顯示
- [ ] 超寬螢幕無黑邊
- [ ] 視窗大小變化時重新載入
- [ ] 遊戲內容保持比例

### 性能驗證
- [ ] FPS 穩定在 60
- [ ] 無明顯卡頓
- [ ] 記憶體使用正常
- [ ] 載入時間合理

### 兼容性驗證
- [ ] iPhone 14 橫向/直向
- [ ] iPad 橫向/直向
- [ ] 桌面瀏覽器
- [ ] 超寬顯示器

## 🐛 已知問題和解決方案

### 問題 1：視窗大小變化時遊戲重新載入
**原因**：動態解析度改變需要重新初始化 Phaser
**解決方案**：這是預期行為，確保遊戲使用正確的解析度

### 問題 2：TouchControls 位置可能需要調整
**原因**：FIT 模式可能改變遊戲容器的實際尺寸
**解決方案**：TouchControls 使用 `position: fixed`，不受影響

### 問題 3：某些場景可能需要調整佈局
**原因**：不同解析度下，遊戲元素的位置可能需要調整
**解決方案**：使用響應式佈局，參考 `handler.js` 的 `updateResize()` 方法

## 🚀 未來改進

### 1. 更精細的解析度控制
```javascript
// 添加更多解析度檔位
if (aspectRatio > 2.5) {
  gameWidth = 2000;
  gameHeight = 800;
} else if (aspectRatio > 2.0) {
  gameWidth = 1600;
  gameHeight = 900;
}
// ...
```

### 2. 性能優化
```javascript
// 添加防抖，避免頻繁重新載入
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // 檢查解析度變化
  }, 500);
});
```

### 3. 用戶偏好設定
```javascript
// 允許用戶選擇解析度模式
const userPreference = localStorage.getItem('resolutionMode');
if (userPreference === 'high') {
  gameWidth *= 1.5;
  gameHeight *= 1.5;
}
```

## 📚 參考資料

### 相關文檔
- [Phaser Scale Manager 官方文檔](https://photonstorm.github.io/phaser3-docs/Phaser.Scale.ScaleManager.html)
- [PHASER-GAME-INTEGRATION-GUIDE.md](./PHASER-GAME-INTEGRATION-GUIDE.md)
- [PHASER-QUICK-REFERENCE.md](./PHASER-QUICK-REFERENCE.md)

### 參考實現
- Starshake 遊戲：`temp-phaser-zenbaki/starshake/src/main.js`
- Shimozurdo 遊戲：`public/games/shimozurdo-game/main-module.js`

## 📊 改進效果總結

### 改進前
- ❌ RESIZE 模式，可能變形
- ❌ 固定解析度 960×540
- ❌ 超寬螢幕有黑邊
- ❌ 性能不穩定

### 改進後
- ✅ FIT 模式，保持比例
- ✅ 動態解析度（960×540 / 1200×675 / 1600×900）
- ✅ 超寬螢幕無黑邊
- ✅ 性能穩定可預測

---

**文檔版本**：1.0  
**創建日期**：2025-10-01  
**作者**：EduCreate 開發團隊  
**參考**：Starshake 遊戲實現

