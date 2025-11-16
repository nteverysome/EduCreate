# 模板系統更新 - v73.0

## 📅 更新日期
2025-11-16

## 🎯 更新目的
將 match-up-game 的 v73.0 修復應用到核心模板系統，確保所有使用 `Phaser.Scale.RESIZE` 模式的遊戲都能正確處理視窗大小改變。

---

## 🔧 更新內容

### 修改文件
`public/games/_template/scenes/handler.js`

### 修改方法

#### 1. `resize()` 方法（第 99-130 行）

**修改前**：
```javascript
// 計算水平方向的縮放比例
const scaleX = this.sizer.width / this.game.screenBaseSize.width
// 計算垂直方向的縮放比例
const scaleY = this.sizer.height / this.game.screenBaseSize.height

// 設定攝影機縮放，使用較大的縮放比例
camera.setZoom(Math.max(scaleX, scaleY))
camera.centerOn(this.game.screenBaseSize.width / 2, this.game.screenBaseSize.height / 2)
```

**修改後**：
```javascript
// 🔥 [v73.0] 使用 RESIZE 模式的遊戲不需要攝影機縮放
console.log('🔥 [v73.0] resize - 使用 RESIZE 模式，不使用攝影機縮放', {
  width,
  height
});

// 重置攝影機縮放為 1
const camera = this.cameras.main
if (camera) {
  camera.setZoom(1);
}
```

#### 2. `updateCamera()` 方法（第 132-154 行）

**修改前**：
```javascript
// 計算水平方向的縮放比例
const scaleX = scene.sizer.width / this.game.screenBaseSize.width
// 計算垂直方向的縮放比例
const scaleY = scene.sizer.height / this.game.screenBaseSize.height

// 設定攝影機縮放比例
camera.setZoom(Math.max(scaleX, scaleY))
camera.centerOn(this.game.screenBaseSize.width / 2, this.game.screenBaseSize.height / 2)
```

**修改後**：
```javascript
// 🔥 [v73.0] 使用 RESIZE 模式的遊戲不需要攝影機縮放
console.log('🔥 [v73.0] updateCamera - 使用 RESIZE 模式，不使用攝影機縮放');

// 重置攝影機縮放為 1
camera.setZoom(1);

// 不需要 centerOn，因為遊戲使用 RESIZE 模式
```

---

## 📋 技術說明

### 為什麼需要這個修復？

1. **Phaser.Scale.RESIZE 模式的特性**
   - 自動調整 Canvas 尺寸以匹配容器
   - 不需要手動計算縮放比例
   - Camera zoom 應該保持為 1

2. **使用 Math.max(scaleX, scaleY) 的問題**
   - 會導致內容被放大
   - 視窗大小改變時可能造成裁切
   - 與 RESIZE 模式的自動調整衝突

3. **修復效果**
   - ✅ 視窗大小改變時無裁切
   - ✅ 內容完全顯示
   - ✅ 卡片尺寸正確響應

---

## 🎮 適用範圍

### 適用的遊戲類型
所有使用 `Phaser.Scale.RESIZE` 模式的遊戲，包括：
- match-up-game ✅ (已修復)
- 未來基於此模板創建的所有遊戲 ✅

### 不適用的情況
如果遊戲使用其他 Scale 模式（如 FIT, ENVELOP），可能需要不同的處理方式。

---

## ✅ 驗證清單

使用此模板創建新遊戲時，請確認：

- [ ] config.js 使用 `Phaser.Scale.RESIZE` 模式
- [ ] handler.js 的 `resize()` 方法設置 `camera.setZoom(1)`
- [ ] handler.js 的 `updateCamera()` 方法設置 `camera.setZoom(1)`
- [ ] 測試視窗大小改變時無裁切
- [ ] 測試不同螢幕尺寸下的顯示效果

---

## 📚 相關文檔

- Match-up Game 修復記錄：`public/games/match-up-game/CAMERA_ZOOM_CORRECTION_v71.md`
- 原始問題分析：`public/games/match-up-game/CANVAS_CLIPPING_ROOT_CAUSE_v68.0.md`

---

## 🔄 版本歷史

| 版本 | 日期 | 說明 |
|------|------|------|
| v73.0 | 2025-11-16 | 應用 match-up-game 的 Camera zoom 修復到模板系統 |

