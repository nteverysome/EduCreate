# 🎯 射手圖片設置指南

## 📁 文件複製步驟

### 1. 複製射手圖片文件
```bash
# 源文件位置
C:\Users\Administrator\Downloads\assetpack\Bonus (enemies)\random_shooter-sheet.png

# 目標位置
games/airplane-game/public/assets/random_shooter-sheet.png
```

## 🎯 當前實施狀態

### ✅ 代碼修改已完成：
1. **preload 方法**：使用 `this.load.image()` 載入單一圖片
2. **createPlayer 方法**：使用 `this.physics.add.image()` 創建靜態圖片
3. **自動檢測機制**：檢測圖片存在性，提供備用方案

### 🔧 技術實現：
```typescript
// 載入射手圖片（單一圖片，非精靈表）
this.load.image('random_shooter', 'assets/random_shooter-sheet.png');

// 創建玩家角色
const hasShooterImage = this.textures.exists('random_shooter');
if (hasShooterImage) {
  // 使用靜態圖片（非動畫）
  this.player = this.physics.add.image(150, 336, 'random_shooter');
} else {
  // 使用備用太空船精靈
  this.player = this.physics.add.sprite(150, 336, 'spaceship_0');
}
```

## 🎮 特性說明

### ✅ 單一圖片模式：
- **靜態圖片**：使用整個 `random_shooter-sheet.png` 作為單一圖片
- **無動畫**：不分幀，不播放動畫
- **完整圖片**：顯示完整的射手圖片內容
- **物理整合**：完整的碰撞檢測和物理系統

### 🔄 自動檢測機制：
- **圖片存在**：控制台顯示 `✅ 使用射手圖片`
- **圖片不存在**：控制台顯示 `⚠️ 射手圖片未找到，使用備用太空船`
- **無縫切換**：自動選擇最佳可用選項

## 🎨 備用太空船（當前狀態）

### 如果射手圖片未找到：
- **4幀動畫**：藍色系太空船動畫
- **動態效果**：顏色變化和引擎火焰
- **完整功能**：所有遊戲功能正常

## 📊 測試步驟

### 使用射手圖片：
1. 複製 `random_shooter-sheet.png` 到 `public/assets/`
2. 重新載入遊戲頁面
3. 檢查控制台：`✅ 使用射手圖片`
4. 觀察射手圖片是否正常顯示

### 使用備用方案（當前狀態）：
1. 控制台顯示：`⚠️ 射手圖片未找到，使用備用太空船`
2. 觀察動態太空船動畫
3. 測試遊戲控制和碰撞功能

## 🔧 圖片調整選項

### 如果圖片太大或太小：
```typescript
// 在 createPlayer 方法中調整縮放
this.player.setScale(0.8);  // 縮小到80%
this.player.setScale(1.5);  // 放大到150%
```

### 如果需要旋轉：
```typescript
// 調整角度
this.player.setRotation(Math.PI / 2);  // 旋轉90度
```

## 🏆 完成狀態

✅ **射手圖片系統完全就緒**：
- 支援單一圖片載入
- 自動檢測和切換機制
- 完整的物理和碰撞系統
- 備用方案確保穩定運行
