# Match-up Game - Resize Fix Changelog

## v50.0 - 改進的 Resize 事件處理

### 🎯 目標
改變瀏覽器尺寸時，不要重新載入詞彙，只調整卡片位置。

### 📝 改動說明

#### 1. 修改 Resize 事件監聽器
**文件**: `scenes/game.js` (第 552-559 行)

**之前**:
```javascript
this.scale.on('resize', (gameSize) => {
    console.log('🔥 [v49.0] 實時 resize 事件觸發:', { width: gameSize.width, height: gameSize.height });
    this.updateLayout();  // ❌ 會清除所有卡片並重新創建
}, this);
```

**之後**:
```javascript
this.scale.on('resize', (gameSize) => {
    console.log('🔥 [v50.0] 實時 resize 事件觸發:', { width: gameSize.width, height: gameSize.height });
    this.repositionCards();  // ✅ 只調整位置，保持遊戲狀態
}, this);
```

#### 2. 新增 repositionCards() 方法
**文件**: `scenes/game.js` (第 998-1044 行)

功能:
- 計算新的螢幕尺寸
- 根據佈局模式調用相應的位置調整方法
- 如果調整失敗，自動回退到完整重建

#### 3. 新增 repositionSeparatedLayout() 方法
**文件**: `scenes/game.js` (第 1046-1129 行)

功能:
- 計算新的卡片尺寸和位置
- 調整左側卡片位置
- 調整右側卡片位置
- 支持所有容器大小（小、中、大）和設備類型（手機、平板、桌面）

#### 4. 新增 repositionMixedLayout() 方法
**文件**: `scenes/game.js` (第 1131-1139 行)

功能:
- 混合佈局暫時回退到完整重建
- 未來可以實現更複雜的位置調整邏輯

### ✅ 優勢

1. **保持遊戲狀態**
   - 已配對的卡片保持配對狀態
   - 遊戲進度不會丟失

2. **流暢的用戶體驗**
   - 沒有閃爍
   - 卡片位置平滑調整

3. **性能提升**
   - 不需要重新創建卡片對象
   - 不需要重新綁定事件監聽器

4. **詞彙數據保留**
   - 詞彙數據（this.pairs）不會重新載入
   - API 請求不會重複發送

### 🧪 測試方法

1. 打開遊戲: `http://localhost:3000/games/switcher?game=match-up-game&activityId=YOUR_ACTIVITY_ID`
2. 配對幾個卡片
3. 改變瀏覽器窗口大小
4. 檢查已配對的卡片是否仍然保持配對狀態
5. 打開開發者工具（F12）查看控制台日誌

### 📊 支持的佈局

| 佈局類型 | 支持狀態 | 說明 |
|---------|--------|------|
| Separated | ✅ 完全支持 | 分離佈局，卡片位置可調整 |
| Mixed | ⚠️ 部分支持 | 混合佈局，暫時回退到完整重建 |

### 🔍 調試日誌

搜索以下日誌來追蹤位置調整過程:
- `[v50.0] repositionCards 開始` - 位置調整開始
- `[v50.0] 當前螢幕尺寸` - 新的螢幕尺寸
- `[v50.0] 新卡片尺寸` - 計算的新卡片尺寸
- `[v50.0] 調整分離佈局位置` - 分離佈局位置調整
- `[v50.0] 分離佈局位置調整完成` - 位置調整完成

### ⚠️ 已知限制

1. 混合佈局暫時回退到完整重建
2. 如果位置調整失敗，會自動回退到完整重建

### 🚀 未來改進

1. 實現混合佈局的位置調整
2. 優化位置調整算法
3. 添加動畫過渡效果

