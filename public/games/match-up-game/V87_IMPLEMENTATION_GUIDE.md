# Match-up Game v87.0 - 避免重新載入詞彙實現指南

## 🎯 目標

**完全避免在以下操作時重新載入詞彙：**
- ✅ 瀏覽器縮小/放大（zoom）
- ✅ 改變視窗大小（resize）
- ✅ 拉伸視窗
- ✅ 設備方向改變

## 📋 改動摘要

### v87.0 核心改動

**文件**: `public/games/match-up-game/scenes/game.js`

#### 1. 修改 resize 事件監聽器（第 552-575 行）

**之前**:
```javascript
this.scale.on('resize', (gameSize) => {
    // ... 防抖延遲 ...
    this.updateLayout();  // ❌ 清除所有卡片並重新創建
    this.matchedPairs = savedMatchedPairs;
    this.restoreMatchedPairsVisuals();
});
```

**之後**:
```javascript
this.scale.on('resize', (gameSize) => {
    // ... 防抖延遲 ...
    this.repositionCards();  // ✅ 只調整位置，不重新創建卡片
});
```

#### 2. 新增 repositionCards() 方法（第 1051-1074 行）

根據佈局模式調用相應的位置調整方法：
- 混合佈局：調用 `repositionMixedLayout()`
- 分離佈局：調用 `repositionSeparatedLayout()`

#### 3. 新增 repositionMixedLayout() 方法（第 1076-1108 行）

調整混合佈局中的卡片位置：
- 重新計算卡片尺寸
- 調整左側和右側卡片位置
- 保持詞彙數據和已配對狀態

#### 4. 新增 repositionSeparatedLayout() 方法（第 1110-1127 行）

調整分離佈局中的卡片位置：
- 根據卡片數量選擇佈局方式
- 調用相應的位置調整方法

#### 5. 新增 repositionLeftRightSingleColumn() 方法（第 1129-1216 行）

調整左右分離佈局 - 單列：
- 根據容器大小動態調整卡片尺寸
- 根據容器大小動態調整位置
- 根據容器大小動態調整間距

#### 6. 新增 repositionLeftRightMultiRows() 方法（第 1218-1226 行）

調整左右分離佈局 - 多行：
- 簡化版本，使用與單列相同的邏輯

## 🔧 技術細節

### 核心原理

1. **保留卡片對象**：不調用 `this.children.removeAll(true)`，保持卡片對象存在
2. **只調整位置**：使用 `card.setPosition()` 調整卡片位置
3. **保持狀態**：詞彙數據、已配對狀態、卡片順序都保持不變
4. **防抖延遲**：使用 300ms 防抖延遲，避免頻繁調整

### 性能優勢

- ✅ **減少 DOM 操作**：不需要銷毀和重新創建卡片
- ✅ **保持遊戲狀態**：已配對狀態、進度都保持不變
- ✅ **更快的響應**：只調整位置，不需要重新載入詞彙
- ✅ **更好的用戶體驗**：視窗改變時卡片平滑調整

## 📝 使用方式

### 自動觸發

resize 事件會自動觸發位置調整：
```javascript
// 用戶改變視窗大小時自動觸發
window.addEventListener('resize', () => {
    // repositionCards() 會自動被調用
});
```

### 手動觸發

如果需要手動調整位置：
```javascript
// 在 GameScene 中調用
this.repositionCards();
```

## ✅ 驗證步驟

### 步驟 1: 啟動遊戲
```
http://localhost:3000/games/switcher?game=match-up-game&activityId=YOUR_ACTIVITY_ID
```

### 步驟 2: 配對卡片
1. 等待遊戲完全載入
2. 配對 3-5 個卡片
3. 記住已配對的卡片位置

### 步驟 3: 改變視窗大小
1. 打開開發者工具（F12）
2. 改變視窗大小
3. **預期結果**：
   - ✅ 卡片位置調整
   - ✅ 詞彙數據不變
   - ✅ 已配對狀態保持
   - ✅ 卡片順序不變

### 步驟 4: 瀏覽器縮放
1. 使用 Ctrl+Plus 或 Ctrl+Minus 縮放
2. **預期結果**：
   - ✅ 卡片大小調整
   - ✅ 詞彙數據不變
   - ✅ 已配對狀態保持

### 步驟 5: 拉伸視窗
1. 拖動視窗邊界改變大小
2. **預期結果**：
   - ✅ 卡片平滑調整
   - ✅ 詞彙數據不變

## 🐛 故障排除

### 問題：卡片位置不正確

**解決方案**：
1. 檢查 `repositionLeftRightSingleColumn()` 中的位置計算
2. 確認容器大小檢測邏輯正確
3. 查看控制台日誌確認調整過程

### 問題：卡片重疊

**解決方案**：
1. 檢查間距計算邏輯
2. 確認卡片尺寸計算正確
3. 調整 `leftSpacing` 和 `rightSpacing` 值

### 問題：位置調整失敗

**解決方案**：
1. 檢查 `repositionCards()` 中的錯誤處理
2. 如果位置調整失敗，會自動回退到 `updateLayout()`
3. 查看控制台錯誤信息

## 📊 版本歷史

- **v87.0**：避免重新載入詞彙 - 只調整卡片位置
- **v86.0**：參考 df3e620 版本，將勾勾和叉叉標記放大到 64px
- **v85.1**：修復混合模式中英文卡片查找 bug
- **v85.0**：優化 v80.0 設計規格實現
- **v84.0**：將勾勾和叉叉標記放大 1 倍（32px -> 64px）

## 🎉 預期效果

✅ **詞彙數據保持不變**
✅ **已配對狀態保持不變**
✅ **卡片順序保持不變**
✅ **視窗改變時卡片自動調整**
✅ **性能提升**
✅ **更好的用戶體驗**

