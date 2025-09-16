# 🚀 Airplane Game 視差背景實現分析

## 📁 背景資源結構

airplane-game 使用了6層月亮主題的視差背景：

```
public/games/airplane-game/assets/backgrounds/moon/
├── moon_sky.png    - 天空層 (1900x1000, 10.2KB)
├── moon_earth.png  - 地球層 (3800x1000, 30.7KB) 
├── moon_back.png   - 後景層
├── moon_mid.png    - 中景層
├── moon_front.png  - 前景層
└── moon_floor.png  - 地面層
```

## 🎨 視差背景實現架構

### 1. 資源載入階段 (preload)

<augment_code_snippet path="games/airplane-game/src/scenes/GameScene.ts" mode="EXCERPT">
````typescript
private loadMoonBackground(): void {
  console.log('🌙 載入月亮主題背景');
  
  // 載入6層視差背景圖片
  this.load.image('moon-sky', 'assets/backgrounds/moon/moon_sky.png');
  this.load.image('moon-back', 'assets/backgrounds/moon/moon_back.png');
  this.load.image('moon-mid', 'assets/backgrounds/moon/moon_mid.png');
  this.load.image('moon-earth', 'assets/backgrounds/moon/moon_earth.png');
  this.load.image('moon-front', 'assets/backgrounds/moon/moon_front.png');
  this.load.image('moon-floor', 'assets/backgrounds/moon/moon_floor.png');
}
````
</augment_code_snippet>

### 2. 背景層創建 (create)

<augment_code_snippet path="games/airplane-game/src/scenes/GameScene.ts" mode="EXCERPT">
````typescript
private createParallaxBackground(): void {
  // 創建基礎背景色（深太空黑色）
  const bgRect = this.add.rectangle(637, 369.5, 1274, 739, 0x000000);
  bgRect.setDepth(-20);
  
  // 創建月亮主題背景層
  this.createMoonBackgroundLayers();
  
  // 創建星空背景
  this.createStarField();
}
````
</augment_code_snippet>

### 3. 月亮背景層實現

<augment_code_snippet path="phaser3-plane-selector/src/game/scenes/GameScene.ts" mode="EXCERPT">
````typescript
private createParallaxBackground() {
  const { width, height } = this.cameras.main;
  
  // 創建6層視差背景（從後到前）
  this.backgroundLayers = {
    sky: this.add.tileSprite(0, 0, width, height, 'moon-sky').setOrigin(0, 0),
    earth: this.add.tileSprite(0, 0, width, height, 'moon-earth').setOrigin(0, 0),
    back: this.add.tileSprite(0, 0, width, height, 'moon-back').setOrigin(0, 0),
    mid: this.add.tileSprite(0, 0, width, height, 'moon-mid').setOrigin(0, 0),
    front: this.add.tileSprite(0, 0, width, height, 'moon-front').setOrigin(0, 0),
    floor: this.add.tileSprite(0, 0, width, height, 'moon-floor').setOrigin(0, 0)
  };
  
  // 設置深度層級（確保背景在最後面）
  this.backgroundLayers.sky.setDepth(-100);
  this.backgroundLayers.earth.setDepth(-95);
  this.backgroundLayers.back.setDepth(-90);
  this.backgroundLayers.mid.setDepth(-85);
  this.backgroundLayers.front.setDepth(-80);
  this.backgroundLayers.floor.setDepth(-75);
}
````
</augment_code_snippet>

### 4. 視差滾動更新 (update)

<augment_code_snippet path="phaser3-plane-selector/src/game/scenes/GameScene.ts" mode="EXCERPT">
````typescript
private updateParallaxBackground() {
  if (!this.backgroundLayers) return;
  
  // 不同層以不同速度移動創造視差效果
  this.backgroundLayers.sky.tilePositionX += 0.05;     // 天空最慢
  this.backgroundLayers.earth.tilePositionX += 0.2;    // 地球較慢
  this.backgroundLayers.back.tilePositionX += 0.3;     // 遠景月球地形
  this.backgroundLayers.mid.tilePositionX += 0.5;      // 中景月球地形
  this.backgroundLayers.front.tilePositionX += 0.7;    // 前景月球地形
  this.backgroundLayers.floor.tilePositionX += 1.0;    // 地面最快
}
````
</augment_code_snippet>

## 🔧 核心技術特點

### 1. **TileSprite 技術**
- 使用 `this.add.tileSprite()` 創建可重複滾動的背景
- 支援無限滾動效果，不會出現邊界問題

### 2. **深度分層管理**
```typescript
// 深度值越小，層級越後面
sky: -100    // 最遠背景
earth: -95   // 地球層
back: -90    // 後景
mid: -85     // 中景
front: -80   // 前景
floor: -75   // 地面
```

### 3. **差異化滾動速度**
```typescript
// 速度遞增創造視差效果
sky: 0.05     // 最慢 - 遠景
earth: 0.2    // 較慢
back: 0.3     // 中等
mid: 0.5      // 較快
front: 0.7    // 快
floor: 1.0    // 最快 - 近景
```

### 4. **響應式適配**
- 使用相機尺寸 `this.cameras.main` 動態調整背景大小
- 支援不同螢幕解析度的自動適配

## 🎯 視差效果原理

### 視差滾動公式
```
視差效果 = 距離感 × 速度差異

遠景物體移動慢 → 感覺距離遠
近景物體移動快 → 感覺距離近
```

### 層級速度設計
```
Layer 1 (sky):   0.05x → 20倍慢 → 極遠距離
Layer 2 (earth): 0.2x  → 5倍慢  → 遠距離  
Layer 3 (back):  0.3x  → 3倍慢  → 中遠距離
Layer 4 (mid):   0.5x  → 2倍慢  → 中距離
Layer 5 (front): 0.7x  → 1.4倍慢 → 近距離
Layer 6 (floor): 1.0x  → 基準速度 → 最近距離
```

## 🌟 優勢特點

### 1. **性能優化**
- 使用 TileSprite 而非多個 Sprite，減少記憶體使用
- 只更新 tilePositionX，不創建/銷毀物件

### 2. **視覺效果**
- 6層背景創造豐富的深度感
- 月亮主題營造太空氛圍
- 流暢的滾動動畫

### 3. **可擴展性**
- 容易添加新的背景層
- 可調整各層速度創造不同效果
- 支援主題切換

## 🔄 與 shimozurdo 的對比

| 特性 | airplane-game | shimozurdo-game |
|------|---------------|-----------------|
| 背景層數 | 6層 | 6層 |
| 實現方式 | TileSprite | TileSprite + ParallaxBackground類 |
| 滾動方式 | 手動更新 tilePositionX | 自動滾動 + 手動控制 |
| 響應式 | 相機尺寸適配 | 複雜縮放算法 |
| 錯誤處理 | 基礎檢查 | 詳細錯誤處理 |
| 配置靈活性 | 硬編碼 | 配置驅動 |

## 💡 學習要點

1. **TileSprite 是視差背景的最佳選擇**
2. **深度管理決定層級順序**
3. **速度差異創造視差效果**
4. **響應式設計確保兼容性**
5. **性能優化比視覺效果更重要**

這個實現方式簡潔高效，是學習視差背景的絕佳範例！
