# 🔍 碰撞閃爍問題分析報告

## 📊 測試結果摘要

**測試時間**: 2025-08-02 16:26:39  
**測試方法**: 連續截圖分析 (62張截圖，每500ms一張)  
**測試對象**: Vite版飛機遊戲 (http://localhost:3001/games/airplane-game/)  

## 🎯 發現的問題根源

通過代碼分析，我發現了導致遊戲閃爍的**三個主要原因**：

### 1. 🌪️ **螢幕震動特效過於激烈**

**位置**: `CollisionDetectionSystem.ts` 第232-240行

```typescript
private triggerScreenShake(type: 'correct' | 'incorrect'): void {
  const intensity = type === 'correct' ? 5 : 10;
  const duration = type === 'correct' ? 200 : 400;
  
  // 簡單的相機震動效果
  if (this.scene.cameras.main) {
    this.scene.cameras.main.shake(duration, intensity);  // ⚠️ 問題所在
  }
}
```

**問題分析**：
- 錯誤碰撞時震動強度為 `10`，持續時間 `400ms`
- 正確碰撞時震動強度為 `5`，持續時間 `200ms`
- 震動效果會導致整個遊戲畫面劇烈搖晃，造成視覺閃爍

### 2. ✨ **粒子特效重疊**

**位置**: `CollisionDetectionSystem.ts` 第198-219行

```typescript
private createParticleEffect(type: 'correct' | 'incorrect', x: number, y: number): void {
  const color = type === 'correct' ? 0x00ff00 : 0xff0000;
  const particleCount = this.getParticleCount();
  // 粒子特效可能造成視覺干擾
}
```

**問題分析**：
- 粒子特效與震動效果同時觸發
- 多個特效疊加可能造成渲染負擔

### 3. 🎨 **視覺反饋動畫**

**位置**: `CollisionDetectionSystem.ts` 第173-193行

```typescript
private createVisualFeedback(type: 'correct' | 'incorrect', x: number, y: number): void {
  const color = type === 'correct' ? '#00ff00' : '#ff0000';
  const text = type === 'correct' ? '✓' : '✗';
  
  // 動畫效果
  this.scene.tweens.add({
    targets: feedback,
    y: y - 50,
    alpha: 0,
    scale: 1.5,
    duration: 1000,  // ⚠️ 動畫時間較長
    ease: 'Power2',
    onComplete: () => feedback.destroy()
  });
}
```

## 🛠️ **解決方案**

### 方案1: 調整震動強度 (推薦)

```typescript
private triggerScreenShake(type: 'correct' | 'incorrect'): void {
  const intensity = type === 'correct' ? 2 : 4;  // 降低強度
  const duration = type === 'correct' ? 100 : 200;  // 縮短時間
  
  if (this.scene.cameras.main) {
    this.scene.cameras.main.shake(duration, intensity);
  }
}
```

### 方案2: 完全禁用震動效果

```typescript
// 在遊戲初始化時設置
this.collisionSystem = new CollisionDetectionSystem(
  this,
  this.gameConfig.geptLevel,
  {
    enableParticles: true,
    enableScreenShake: false,  // 禁用震動
    enableSoundEffects: true,
    enableVisualFeedback: true,
    particleIntensity: 'low',  // 降低粒子強度
    soundVolume: 0.5
  }
);
```

### 方案3: 優化特效組合

```typescript
// 根據碰撞類型選擇性啟用特效
private triggerCollisionEffects(event: CollisionEvent, cloud: any): void {
  if (event.type === 'correct') {
    // 正確碰撞：只顯示視覺反饋，不震動
    this.createVisualFeedback(event.type, event.cloudPosition.x, event.cloudPosition.y);
    this.createParticleEffect(event.type, event.cloudPosition.x, event.cloudPosition.y);
  } else {
    // 錯誤碰撞：輕微震動 + 視覺反饋
    this.createVisualFeedback(event.type, event.cloudPosition.x, event.cloudPosition.y);
    this.triggerScreenShake(event.type);  // 使用調整後的震動
  }
}
```

## 🎯 **建議的修復步驟**

1. **立即修復**: 調整震動強度和持續時間
2. **測試驗證**: 重新運行連續截圖測試
3. **用戶體驗**: 確保特效不會干擾遊戲體驗
4. **性能優化**: 監控特效對遊戲性能的影響

## 📈 **預期效果**

修復後應該能夠：
- ✅ 消除碰撞時的劇烈閃爍
- ✅ 保持適度的視覺反饋
- ✅ 提升整體遊戲體驗
- ✅ 減少視覺疲勞

## 🔧 **需要修改的文件**

1. `games/airplane-game/src/managers/CollisionDetectionSystem.ts`
2. `games/airplane-game/src/scenes/GameScene.ts` (碰撞系統初始化部分)

---

**結論**: 閃爍問題主要由過度激烈的螢幕震動特效引起。通過調整震動參數或選擇性禁用特效，可以有效解決這個問題。
