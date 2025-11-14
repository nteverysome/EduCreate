# iframe 寬度修復 - v69.0

## 問題描述

當通過 iframe 訪問遊戲（`/games/switcher`）時，遊戲只顯示使用約一半的容器寬度，而直接訪問遊戲頁面時卻能充分利用全寬度。

### 症狀
- **iframe 模式**：遊戲寬度 1841px，卡片寬度 139px
- **直接模式**：遊戲寬度 1920px，卡片寬度 248px
- **差異**：約 79px 的寬度損失

## 根本原因

iframe 容器的高度限制導致寬度被限制：

```javascript
// v68.0 - 問題代碼
height: isMobile ? (isGameFullscreen ? '100vh' : '90vh') : '70vh',
maxHeight: isMobile ? (isGameFullscreen ? '100vh' : '90vh') : '800px',
```

**為什麼會這樣？**
1. iframe 容器高度被限制為 70vh（約 672px）
2. 瀏覽器自動調整 iframe 寬度以保持容器比例
3. 導致 iframe 寬度被限制，遊戲無法充分利用容器寬度

## 解決方案

### 修改文件
**文件**: `components/games/GameSwitcher.tsx`  
**行號**: L1552-1567

### 修改內容

```javascript
// v69.0 - 修復代碼
height: isMobile ? (isGameFullscreen ? '100vh' : '90vh') : '100vh',
maxHeight: isMobile ? (isGameFullscreen ? '100vh' : '90vh') : 'none',
```

**關鍵改動**：
1. 桌面端高度從 `70vh` 改為 `100vh`（全高度）
2. 移除 `maxHeight: 800px` 限制（改為 `none`）

## 效果對比

| 參數 | v68.0 | v69.0 | 改進 |
|------|--------|--------|------|
| 桌面端高度 | 70vh | 100vh | ↑ 全高度 |
| maxHeight | 800px | none | ✅ 移除限制 |
| iframe 寬度 | ~1841px | ~1920px | ↑ 充分利用 |
| 遊戲寬度 | 1841px | 1920px | ↑ 最大化 |
| 卡片寬度 | 139px | 248px | ↑ 更大 |

## 驗證方法

### 1. 檢查 iframe 容器寬度
```javascript
// 在瀏覽器控制台執行
const iframe = document.querySelector('iframe');
const iframeDoc = iframe.contentDocument;
const gameContainer = iframeDoc.getElementById('game-container');
console.log('遊戲容器寬度:', gameContainer.offsetWidth);
```

### 2. 檢查 Phaser 遊戲寬度
```javascript
// 在遊戲控制台查看日誌
// 應該看到：this.scale.width: 1920
```

### 3. 視覺驗證
- 訪問 `http://localhost:3000/games/switcher?game=match-up-game&activityId=cmhjff7340001jf04htar2e5k`
- 確認 7 張卡片充分分佈在容器寬度內
- 卡片寬度應該約為 248px（而不是 139px）

## 相關版本歷史

### v68.0
- 調整卡片間距從 20px 到 18px
- 實現 100% 容器利用率
- 但 iframe 寬度仍受限

### v69.0
- 修復 iframe 容器高度限制
- 充分利用 iframe 寬度
- 卡片寬度最大化

## 技術細節

### Phaser Scale 配置
```javascript
scale: {
    mode: Phaser.Scale.RESIZE,  // 動態調整尺寸
    expandParent: true,          // 擴展父容器
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

Phaser 會根據父容器（iframe）的尺寸自動調整遊戲尺寸。當 iframe 寬度受限時，遊戲寬度也會受限。

### 為什麼不直接改 Phaser 配置？
- Phaser 的 `max.width: 1920` 是合理的上限
- 問題不在 Phaser，而在 iframe 容器的高度限制
- 修復容器高度是根本解決方案

## 注意事項

### 移動設備
- 移動設備的高度設置保持不變（90vh）
- 全螢幕模式保持 100vh
- 不受此修改影響

### 其他遊戲
- 此修改只影響 iframe 容器
- 所有在 `/games/switcher` 中的遊戲都會受益
- 其他遊戲頁面不受影響

## 後續改進建議

1. **響應式優化**：根據不同屏幕尺寸調整 iframe 高度
2. **性能監控**：監控 iframe 加載時間
3. **跨瀏覽器測試**：確保在所有瀏覽器中正常工作

## 相關文件

- `components/games/GameSwitcher.tsx` - iframe 容器配置
- `public/games/match-up-game/config.js` - Phaser 遊戲配置
- `public/games/match-up-game/scenes/game.js` - 遊戲場景邏輯

