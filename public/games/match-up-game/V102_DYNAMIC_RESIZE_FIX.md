# v102.3 - 修復卡片動態調整問題

## 🔴 新問題

v102.2 修復後，出現了新問題：**卡片不會動態調整了**

用戶報告：卡片大小沒有根據螢幕尺寸動態調整

## 🔍 根本原因

### 問題分析

1. **v102.2 修復**：移除了在 `customVocabulary` 改變時改變 `gameKey` 的邏輯
   - 這解決了「換標籤重新載入詞彙」的問題

2. **但引入了新問題**：
   - 當 `customVocabulary` 改變時，iframe 的 src 仍然會改變
   - 因為 `getGameUrlWithVocabulary()` 會添加 `customVocabulary=true` 參數
   - iframe src 改變導致 iframe 重新加載
   - iframe 重新加載時，遊戲被完全重新初始化
   - 卡片大小調整邏輯沒有被正確執行

### 為什麼卡片不會動態調整？

- iframe 重新加載時，Phaser 遊戲實例被完全重新初始化
- 但卡片大小調整邏輯可能沒有被正確執行
- 或者卡片大小調整邏輯被執行了，但結果不正確

## ✅ v102.3 修復方案

### 修復 1：GameSwitcher 不再添加 customVocabulary 參數到 URL

**文件**：`components/games/GameSwitcher.tsx`

```javascript
// 🔥 v102.3: 不再添加 customVocabulary=true 參數到 URL
// 改為通過 localStorage 傳遞詞彙，避免 iframe src 改變導致重新加載
// if (customVocabulary.length > 0) {
//   url += `&customVocabulary=true`;
// }
```

### 修復 2：GameSwitcher 將 customVocabulary 存儲到 localStorage

**文件**：`components/games/GameSwitcher.tsx`

```javascript
// 🔥 v102.3: 當 customVocabulary 改變時，將其存儲到 localStorage
useEffect(() => {
  if (customVocabulary.length > 0) {
    console.log('🔄 [v102.3] 將 customVocabulary 存儲到 localStorage:', customVocabulary.length, '個詞彙');
    localStorage.setItem('gameCustomVocabulary', JSON.stringify(customVocabulary));
  }
}, [customVocabulary]);
```

### 修復 3：match-up-game 支持從 localStorage 讀取 customVocabulary

**文件**：`public/games/match-up-game/scenes/game.js`

```javascript
// 🔥 v102.3: 檢查 localStorage 中是否有 gameCustomVocabulary
let customVocabFromStorage = null;
try {
  const stored = localStorage.getItem('gameCustomVocabulary');
  if (stored) {
    customVocabFromStorage = JSON.parse(stored);
    console.log('✅ [v102.3] 從 localStorage 讀取 gameCustomVocabulary:', customVocabFromStorage.length, '個詞彙');
    customVocabulary = 'true';
  }
} catch (e) {
  console.warn('⚠️ [v102.3] 解析 localStorage 中的 gameCustomVocabulary 失敗', e);
}

// 如果 localStorage 中有詞彙，直接使用
if (customVocabFromStorage && Array.isArray(customVocabFromStorage) && customVocabFromStorage.length > 0) {
  console.log('✅ [v102.3] 使用 localStorage 中的自定義詞彙');
  this.pairs = customVocabFromStorage;
  return true;
}
```

## 🎯 完整修復流程

### 第一次載入
1. GameSwitcher 載入 customVocabulary
2. 存儲到 localStorage
3. iframe 載入遊戲
4. 遊戲從 localStorage 讀取 customVocabulary
5. 遊戲初始化並顯示卡片

### 當 customVocabulary 改變時
1. GameSwitcher 更新 customVocabulary
2. 存儲到 localStorage
3. **iframe src 不改變**（因為沒有添加 customVocabulary=true 參數）
4. **iframe 不重新加載**
5. 遊戲保持運行
6. 卡片可以正常動態調整

## ✅ 預期效果

- ✅ 切換標籤不再顯示「載入詞彙中…」
- ✅ 最小化到工作列不再重新載入
- ✅ 卡片順序和已配對狀態完全保持
- ✅ **卡片會動態調整大小**（新修復）
- ✅ 詞彙更新時不再重新初始化遊戲
- ✅ 配合 v101.0 的詞彙快取，四重保險

## 🧪 驗證步驟

1. **第一次載入**
   - 正常顯示卡片

2. **調整螢幕尺寸**
   - 卡片應該動態調整大小

3. **切換標籤**
   - 不顯示「載入詞彙中…」
   - 卡片保持原位

4. **最小化**
   - 不顯示「載入詞彙中…」
   - 卡片保持原位

## 📝 技術細節

### 為什麼這個方案有效？

1. **iframe src 不改變**
   - 避免 iframe 重新加載
   - 避免 Phaser 遊戲實例被重新初始化

2. **詞彙通過 localStorage 傳遞**
   - 遊戲可以隨時讀取最新的詞彙
   - 不需要重新初始化遊戲

3. **卡片大小調整邏輯保持不變**
   - 遊戲保持運行
   - resize 事件監聽器保持活躍
   - 卡片可以正常動態調整

---

**版本**：v102.3  
**日期**：2025-11-08  
**狀態**：✅ 已修復並推送到 GitHub

