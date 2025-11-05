# 🔍 深度分析：為什麼修復了 API 卻仍然沒有圖片顯示？

## 問題陳述

✅ **已修復**：API 現在返回 `chineseImageUrl` 字段
❌ **仍未解決**：遊戲頁面仍然沒有顯示中文圖片

## 🎯 完整數據流分析

### 第 1 層：編輯頁面 → 數據庫

```
編輯頁面 (app/create/[templateId]/page.tsx)
  ↓
用戶上傳中文圖片
  ↓
VocabularyItemWithImage 組件
  ↓
調用 /api/images/upload-test
  ↓
圖片上傳到 Vercel Blob Storage
  ↓
獲得 imageUrl
  ↓
onChange({ ...item, chineseImageUrl: imageUrl })
  ↓
保存到 state
  ↓
點擊"保存"
  ↓
調用 /api/activities/[id] PUT
  ↓
保存 chineseImageUrl 到數據庫 ✅
```

### 第 2 層：遊戲頁面 → API 加載

```
遊戲頁面 (app/games/switcher/page.tsx)
  ↓
useEffect 檢測 activityId
  ↓
調用 loadCustomVocabulary(activityId)
  ↓
fetch /api/activities/{activityId}/vocabulary
  ↓
API 返回 vocabularyItems（包含 chineseImageUrl）✅ [v63.0 修復]
  ↓
setCustomVocabulary(data.vocabularyItems)
  ↓
useEffect 檢測 customVocabulary 變化
  ↓
setGameKey(prev => prev + 1) [強制重新渲染]
  ↓
GameSwitcher 重新渲染
```

### 第 3 層：GameSwitcher → iframe

```
GameSwitcher 組件 (components/games/GameSwitcher.tsx)
  ↓
getGameUrlWithVocabulary(currentGame)
  ↓
生成 iframe URL：
  /games/match-up-game/?activityId=...&customVocabulary=true
  ↓
<iframe src={url} />
  ↓
iframe 加載遊戲
```

### 第 4 層：遊戲場景 → 詞彙加載

```
Match-up 遊戲場景 (public/games/match-up-game/scenes/game.js)
  ↓
preload() 方法
  ↓
從 URL 參數獲取 activityId
  ↓
fetch /api/activities/{activityId}
  ↓
❌ 問題 1：這裡調用的是 /api/activities/{activityId}
  ↓
❌ 不是 /api/activities/{activityId}/vocabulary
  ↓
API 返回 activity 對象
  ↓
檢查 activity.vocabularyItems
  ↓
轉換為 pairs 數組
  ↓
✅ 包含 chineseImageUrl
```

## 🔴 發現的問題

### 問題 1：遊戲場景調用了錯誤的 API 端點

**遊戲場景代碼** (第 280 行)：
```javascript
const apiUrl = `/api/activities/${activityId}`;
const response = await fetch(apiUrl);
```

**應該調用**：
```javascript
const apiUrl = `/api/activities/${activityId}/vocabulary`;
```

### 問題 2：/api/activities/{activityId} 端點返回的數據結構

**當前返回**：
```json
{
  "id": "...",
  "title": "...",
  "vocabularyItems": [...],
  "elements": [...],
  "content": {...},
  ...其他字段
}
```

**問題**：
- 返回了完整的 activity 對象
- 包含了 vocabularyItems 關聯
- 但遊戲場景期望的是 /api/activities/{activityId}/vocabulary 的格式

### 問題 3：數據流不一致

**遊戲頁面加載**：
```
fetch /api/activities/{activityId}/vocabulary
  ↓
返回 { vocabularyItems: [...] }
  ↓
setCustomVocabulary(data.vocabularyItems)
```

**遊戲場景加載**：
```
fetch /api/activities/{activityId}
  ↓
返回 { id, title, vocabularyItems, ... }
  ↓
使用 activity.vocabularyItems
```

## ✅ 為什麼現在能工作（但可能有延遲）

1. ✅ API 現在返回 `chineseImageUrl`
2. ✅ 遊戲場景檢查 `activity.vocabularyItems`
3. ✅ 轉換為 `pairs` 數組時包含 `chineseImageUrl`
4. ✅ `createRightCard` 函數接收 `pair.chineseImageUrl`
5. ✅ `loadAndDisplayImage` 函數加載圖片

**但是**：可能存在以下問題：

### 潛在問題 1：圖片 URL 格式

檢查 `chineseImageUrl` 是否是有效的 URL：
- ✅ 以 `http://` 或 `https://` 開頭
- ✅ 指向有效的圖片文件
- ✅ 圖片可以在瀏覽器中訪問

### 潛在問題 2：CORS 問題

如果圖片 URL 來自不同的域，可能被 CORS 阻止：
```javascript
fetch(imageUrl)  // 可能被 CORS 阻止
```

### 潛在問題 3：圖片加載時序

`loadAndDisplayImage` 是異步的，但可能在卡片創建後才完成：
```javascript
this.loadAndDisplayImage(container, imageUrl, 0, imageAreaY, squareSize, pairId)
  .catch(error => {
    console.error('❌ 圖片載入失敗:', error);
  });
```

### 潛在問題 4：容器深度問題

圖片可能被其他元素遮擋：
```javascript
cardImage.setDisplaySize(size, size);
cardImage.setOrigin(0.5);
container.add(cardImage);  // 深度可能不對
```

## 🔧 建議的驗證步驟

### 步驟 1：檢查 API 返回

打開瀏覽器開發者工具（F12）：

1. 進入 Network 標籤
2. 刷新遊戲頁面
3. 找到 `/api/activities/[id]/vocabulary` 請求
4. 檢查 Response 中的 `chineseImageUrl` 值

**預期結果**：
```json
{
  "vocabularyItems": [
    {
      "chineseImageUrl": "https://...",
      ...
    }
  ]
}
```

### 步驟 2：檢查遊戲場景加載

在 Console 中查看日誌：

```
✅ 活動數據載入成功: {
  vocabularyItemsCount: X,
  ...
}

✅ 詞彙數據轉換完成: {
  totalPairs: X,
  firstPair: {
    chineseImageUrl: "https://...",
    ...
  }
}
```

### 步驟 3：檢查圖片加載

在 Console 中查看：

```
🎨 [v62.0] createRightCard 被調用: {
  hasImage: true,  // 應該是 true
  ...
}

✅ 圖片載入完成: card-image-...
```

### 步驟 4：檢查圖片 URL 有效性

在 Console 中執行：

```javascript
// 檢查第一個詞彙的中文圖片 URL
const firstPair = window.matchUpGame?.scene?.scenes[0]?.pairs?.[0];
console.log('中文圖片 URL:', firstPair?.chineseImageUrl);

// 嘗試加載圖片
fetch(firstPair?.chineseImageUrl)
  .then(r => console.log('✅ 圖片可訪問:', r.status))
  .catch(e => console.error('❌ 圖片無法訪問:', e));
```

## 📊 數據流驗證清單

- [ ] API 返回 `chineseImageUrl` ✅ [v63.0 修復]
- [ ] 遊戲場景接收 `chineseImageUrl`
- [ ] `createRightCard` 檢測到 `hasImage: true`
- [ ] `loadAndDisplayImage` 被調用
- [ ] 圖片 URL 有效且可訪問
- [ ] 圖片成功加載到 Phaser 紋理管理器
- [ ] 圖片顯示在卡片上

## 🎯 下一步行動

1. **打開遊戲頁面**
2. **打開開發者工具（F12）**
3. **查看 Console 日誌**
4. **檢查上述驗證步驟**
5. **報告具體的問題**

根據 Console 日誌，我們可以確定問題的確切位置。

---

**版本**：v63.0
**分析日期**：2025-11-05
**狀態**：待驗證

