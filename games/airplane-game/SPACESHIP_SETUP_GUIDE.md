# 🚀 太空船精靈替換完整指南

## 🎯 當前狀態
✅ **代碼修改已完成** - 支援真實精靈圖片和備用太空船
✅ **備用太空船正常運行** - 動態生成的太空船形狀精靈
✅ **自動檢測機制** - 自動選擇真實圖片或備用方案

## 📁 使用真實精靈圖片的步驟

### 1. 複製精靈圖片文件
```bash
# 源文件位置
C:\Users\Administrator\Downloads\assetpack\Bonus (player ship)\sprite_player_spaceship_up_down.png

# 目標位置
games/airplane-game/public/assets/sprite_player_spaceship_up_down.png
```

### 2. 精靈圖片規格調整
根據實際圖片調整以下參數：

```typescript
// 在 preload 方法中
this.load.spritesheet('player_spaceship', 'assets/sprite_player_spaceship_up_down.png', {
  frameWidth: 64,  // 🔧 根據實際每幀寬度調整
  frameHeight: 64  // 🔧 根據實際每幀高度調整
});
```

### 3. 動畫幀數調整
```typescript
// 在 createPlayer 方法中
this.anims.create({
  key: 'spaceship_anim',
  frames: this.anims.generateFrameNumbers('player_spaceship', { 
    start: 0, 
    end: 3  // 🔧 根據實際幀數調整（如果是4幀則為0-3）
  }),
  frameRate: 8,  // 🔧 可調整播放速度
  repeat: -1
});
```

## 🎯 常見精靈圖片規格

### 可能的規格選項：
1. **64x64 像素，4幀動畫** (最常見)
2. **32x32 像素，6幀動畫**
3. **48x48 像素，8幀動畫**
4. **128x128 像素，2幀動畫**

### 如何確定規格：
1. 用圖片查看器打開文件
2. 查看總寬度和高度
3. 計算：總寬度 ÷ 幀數 = 每幀寬度

## 🔧 代碼修改已完成

### ✅ 已修改的部分：
1. **preload 方法**：載入太空船精靈圖片
2. **createPlayer 方法**：使用太空船精靈和動畫
3. **動畫配置**：創建 'spaceship_anim' 動畫

### 🎮 預期效果：
- 太空船精靈替換圓形精靈
- 上下移動動畫效果
- 保持所有遊戲功能（碰撞、控制等）
- 適合太空主題的視覺效果

## 🚨 注意事項

1. **文件路徑**：確保文件複製到正確位置
2. **規格匹配**：frameWidth 和 frameHeight 必須正確
3. **幀數範圍**：end 值必須小於實際幀數
4. **性能考慮**：較大的精靈圖片可能影響性能

## 🔄 如果載入失敗

如果精靈圖片載入失敗，系統會：
1. 在控制台顯示錯誤信息
2. 可能顯示空白或錯誤紋理
3. 需要檢查文件路徑和規格設置

## 🎮 當前備用太空船特性

### ✅ 動態生成的太空船精靈：
- **4幀動畫**：藍色系太空船，顏色漸變效果
- **太空船形狀**：橢圓主體 + 三角機翼 + 圓形駕駛艙
- **引擎效果**：動態火焰噴射，根據幀變化
- **8fps 播放**：流暢的動畫效果

### 🔧 技術實現：
```typescript
// 自動檢測真實精靈圖片
const hasRealSprite = this.textures.exists('player_spaceship');

if (hasRealSprite) {
  // 使用真實太空船精靈
  this.player.play('spaceship_anim');
} else {
  // 使用備用太空船精靈
  this.player.play('spaceship_backup_anim');
}
```

## 📊 測試步驟

### 使用真實精靈圖片：
1. 複製文件到指定位置
2. 重新載入遊戲頁面
3. 檢查控制台顯示：`✅ 使用真實太空船精靈圖片`
4. 觀察太空船是否正常顯示和動畫

### 使用備用太空船（當前狀態）：
1. 控制台顯示：`⚠️ 太空船精靈圖片未找到，使用備用太空船`
2. 觀察動態生成的藍色太空船
3. 測試遊戲控制和碰撞功能
4. 確認動畫播放正常

## 🏆 完成狀態

✅ **太空船精靈系統完全就緒**：
- 支援真實精靈圖片載入
- 備用太空船完美運行
- 自動檢測和切換機制
- 完整的動畫和物理整合
