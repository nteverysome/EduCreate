# 精靈動圖設置指南

## 🎯 如何使用真實的精靈圖片

### 1. 複製精靈圖片文件
將用戶提供的精靈圖片文件：
```
C:\Users\Administrator\Downloads\assetpack\Bonus (enemies)\enemy_circle-sheet.png
```

複製到：
```
games/airplane-game/public/assets/enemy_circle-sheet.png
```

### 2. 修改載入代碼
在 `games/airplane-game/src/scenes/GameScene.ts` 中，將：
```typescript
// 創建動態精靈圖片（備用方案）
this.createDynamicSprite();
```

替換為：
```typescript
// 載入真實精靈動圖
this.load.spritesheet('enemy_circle', 'assets/enemy_circle-sheet.png', {
  frameWidth: 64,  // 根據實際圖片調整
  frameHeight: 64  // 根據實際圖片調整
});
```

### 3. 修改玩家創建代碼
在 `createPlayer()` 方法中，將：
```typescript
this.player = this.physics.add.sprite(150, 336, 'enemy_circle_0');
```

替換為：
```typescript
this.player = this.physics.add.sprite(150, 336, 'enemy_circle');
```

並添加動畫創建：
```typescript
// 創建精靈動畫
this.anims.create({
  key: 'enemy_circle_anim',
  frames: this.anims.generateFrameNumbers('enemy_circle', { start: 0, end: 7 }),
  frameRate: 10,
  repeat: -1
});
```

### 4. 當前狀態
目前使用動態生成的彩色圓形精靈作為備用方案，具有：
- 8幀動畫
- 彩虹色變化效果
- 10fps 播放速度
- 無限循環

### 5. 精靈圖片規格
建議的精靈圖片規格：
- 格式：PNG
- 每幀尺寸：64x64 像素
- 幀數：8幀（可調整）
- 排列：水平排列

## 🎮 當前效果
- ✅ 動態生成的彩色圓形精靈
- ✅ 流暢的動畫效果
- ✅ 完整的物理碰撞
- ✅ 鍵盤控制響應
- ✅ 與遊戲系統完全整合

## 📝 注意事項
1. 確保精靈圖片文件路徑正確
2. 根據實際圖片調整 frameWidth 和 frameHeight
3. 根據精靈圖片的幀數調整動畫範圍
4. 可以調整 frameRate 來控制動畫速度
