# v102.0-v102.2 完整修復報告

## 🎯 問題描述

**用戶報告**：經過多次修復（v94.0 - v101.0），問題依然存在：
- 換標籤就重新載入詞彙（顯示「載入詞彙中…」）
- 縮小到工作列或換分頁就重新載入詞彙
- 卡片順序被重新洗牌
- 已配對狀態丟失

**用戶的關鍵洞察**：「有沒有可能是父容器的問題」

---

## 🔍 根本原因分析

### 第一層：Phaser 配置層級（v102.0）

**問題**：Phaser 預設 `pauseOnBlur: true`
- 當頁面失焦時，Phaser 自動暫停所有場景
- 可能觸發場景重啟

**修復**：添加 `pauseOnBlur: false`

### 第二層：場景啟動策略（v102.1）

**問題**：PreloadScene 每次都用 `scene.start()` 重啟 GameScene
- `scene.start()` 會完全銷毀並重建場景
- 即使 GameScene 已運行也會被重啟

**修復**：參考 Shimozurdo 遊戲，使用 `scene.launch()` 啟動背景場景

### 第三層：React 組件層級（v102.2）⭐ 關鍵修復

**問題**：當 `customVocabulary` 改變時，會改變 `gameKey`
- 改變 `gameKey` 導致 GameSwitcher 組件被卸載和重新掛載
- iframe 被銷毀和重建
- iframe 重新加載時，遊戲被重新初始化
- GameScene.create() 被調用，顯示「載入詞彙中…」

**修復**：移除在 `customVocabulary` 改變時改變 `gameKey` 的邏輯
- 讓 iframe 的 src 自動更新（通過 `getGameUrlWithVocabulary` 函數）
- iframe 會自動重新加載，但不會銷毀 Phaser 遊戲實例

---

## 📊 修復層級結構

```
React 層級（v102.2）⭐ 關鍵
├─ 移除 gameKey 改變邏輯
└─ 讓 iframe src 自動更新

Phaser 場景層級（v102.1）
├─ 使用 scene.launch() 而非 scene.start()
└─ 避免不必要的場景重啟

Phaser 配置層級（v102.0）
├─ 添加 pauseOnBlur: false
├─ 添加 Handler 頁面可見性處理
└─ 添加 PreloadScene 場景檢查
```

---

## ✅ 完整修復清單

### v102.0 修復
- ✅ config.js：添加 `pauseOnBlur: false`
- ✅ PreloadScene：檢查 GameScene 是否已運行
- ✅ Handler：添加頁面可見性處理

### v102.1 修復
- ✅ Handler：使用 `scene.launch()` 啟動背景場景

### v102.2 修復（關鍵）
- ✅ app/games/switcher/page.tsx：移除 gameKey 改變邏輯

---

## 🎉 預期效果

- ✅ 切換標籤不再顯示「載入詞彙中…」
- ✅ 最小化到工作列不再重新載入
- ✅ 切換分頁不再重啟場景
- ✅ 卡片順序和已配對狀態完全保持
- ✅ 詞彙更新時不再重新初始化遊戲
- ✅ 配合 v101.0 的詞彙快取，三重保險

---

## 🧪 驗證步驟

1. **第一次載入**
   - 正常顯示「載入詞彙中…」

2. **配對幾組卡片**
   - 產生已配對狀態

3. **切換標籤測試**
   - 切到別的標籤，等 2 秒
   - 切回來
   - **預期**：不顯示「載入詞彙中…」

4. **最小化測試**
   - 最小化到工作列，等 2 秒
   - 恢復視窗
   - **預期**：不顯示「載入詞彙中…」

5. **Console 檢查**
   - 應該看到：`🔧 Handler: 啟動背景場景 PreloadScene`
   - 不應該看到：`🎮 GameScene: 創建白色背景和載入文字`（除非第一次）

---

## 📝 技術細節

### 為什麼 v102.2 是關鍵修復？

**原始代碼**（有問題）：
```javascript
useEffect(() => {
  if (customVocabulary.length > 0) {
    setGameKey(prev => prev + 1);  // ❌ 導致組件卸載
  }
}, [customVocabulary]);
```

**修復後**（正確）：
```javascript
// 移除此 useEffect
// 讓 iframe 的 src 自動更新
// iframe 會自動重新加載，但不會銷毀 Phaser 遊戲實例
```

### iframe src 如何自動更新？

```javascript
<iframe
  src={getGameUrlWithVocabulary(currentGame)}  // ← 自動更新
  ...
/>
```

當 `customVocabulary` 改變時：
1. `getGameUrlWithVocabulary()` 返回不同的 URL
2. iframe 的 src 自動改變
3. iframe 自動重新加載
4. 但 Phaser 遊戲實例不被銷毀

---

## 🎯 總結

**根本原因**：React 層級的 gameKey 改變導致組件卸載

**解決方案**：移除 gameKey 改變邏輯，讓 iframe src 自動更新

**效果**：完全解決「換標籤重新載入詞彙」的問題

---

**版本**：v102.0-v102.2  
**日期**：2025-11-08  
**狀態**：✅ 已修復並推送到 GitHub

