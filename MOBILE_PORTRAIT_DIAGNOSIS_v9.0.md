# 📱 手機直向佈局診斷指南 v9.0

## 🎯 問題描述

您的情況：
- ✅ 有圖片、聲音、文字
- ✅ 手機直向（375×667px）
- ❌ 框是**長方形**（應該是正方形）
- ✅ 每頁 20 個卡片

**根本原因**：圖片檢測失敗 → 進入長方形模式而不是正方形模式

---

## 🔍 診斷步驟

### 步驟 1：訪問遊戲頁面

在手機上打開：
```
https://edu-create.vercel.app/games/match-up-game/?activityId=cmh93tjuh0001l404hszkdf94&customVocabulary=true
```

### 步驟 2：打開 F12 Console

- **iPhone**：Safari → 開發者工具 → Console
- **Android**：Chrome → 開發者工具 → Console

### 步驟 3：查看 Console 日誌

遊戲加載後，查找以下日誌：

#### 🔍 原始詞彙數據結構檢查

```
🔍 [v9.0] 原始詞彙數據結構檢查: {
    totalItems: 20,
    firstItemKeys: [...],
    firstItem: {...},
    hasImageUrl: ???,
    hasChineseImageUrl: ???,
    imageUrlValue: ???,
    chineseImageUrlValue: ???
}
```

**需要記錄的信息**：
1. `totalItems`: 應該是 20
2. `firstItemKeys`: 應該包含 `imageUrl` 和 `chineseImageUrl`
3. `hasImageUrl`: 應該是 true
4. `hasChineseImageUrl`: 應該是 true
5. `imageUrlValue`: 應該有 URL 值，不是 null
6. `chineseImageUrlValue`: 應該有 URL 值，不是 null

#### 🟦 或 🟨 卡片佈局日誌

```
🟦 使用正方形卡片模式
或
🟨 使用長方形卡片模式
```

**預期結果**：應該看到 `🟦 使用正方形卡片模式`

#### 📐 卡片佈局詳情

```
🟦 正方形卡片佈局: {
    cols: 5,
    rows: 4,
    frameWidth: 75,
    cardHeightInFrame: 75,
    cardRatio: '1:1 (正方形)'
}
```

或

```
🟨 長方形卡片佈局: {
    cols: 3,
    rows: 4,
    frameWidth: 75,
    cardHeightInFrame: 67,
    cardRatio: '1.12:1'
}
```

---

## 📊 可能的診斷結果

### 情況 A：✅ 正確（應該看到）

```
🔍 [v9.0] 原始詞彙數據結構檢查: {
    totalItems: 20,
    firstItemKeys: ['id', 'english', 'chinese', 'imageUrl', 'chineseImageUrl', 'audioUrl', ...],
    hasImageUrl: true,
    hasChineseImageUrl: true,
    imageUrlValue: "https://example.com/image.jpg",
    chineseImageUrlValue: "https://example.com/chinese.jpg"
}

🟦 使用正方形卡片模式

🟦 正方形卡片佈局: {
    cols: 5,
    rows: 4,
    frameWidth: 75,
    cardHeightInFrame: 75,
    cardRatio: '1:1 (正方形)'
}
```

**結論**：✅ 圖片檢測成功，佈局正確

### 情況 B：❌ 圖片字段缺失

```
🔍 [v9.0] 原始詞彙數據結構檢查: {
    totalItems: 20,
    firstItemKeys: ['id', 'english', 'chinese', 'audioUrl', ...],  // ❌ 沒有 imageUrl
    hasImageUrl: false,
    hasChineseImageUrl: false,
    imageUrlValue: null,
    chineseImageUrlValue: null
}

🟨 使用長方形卡片模式

🟨 長方形卡片佈局: {
    cols: 3,
    rows: 4,
    frameWidth: 75,
    cardHeightInFrame: 67,
    cardRatio: '1.12:1'
}
```

**結論**：❌ API 沒有返回圖片字段

**解決方案**：
1. 檢查數據庫中的 VocabularyItem 是否有 imageUrl 和 chineseImageUrl
2. 檢查 API 是否正確返回這些字段
3. 可能需要重新上傳圖片

### 情況 C：❌ 圖片字段為空字符串

```
🔍 [v9.0] 原始詞彙數據結構檢查: {
    totalItems: 20,
    firstItemKeys: ['id', 'english', 'chinese', 'imageUrl', 'chineseImageUrl', ...],
    hasImageUrl: false,  // ❌ 為空字符串被視為 false
    hasChineseImageUrl: false,
    imageUrlValue: "",  // ❌ 空字符串
    chineseImageUrlValue: ""  // ❌ 空字符串
}
```

**結論**：❌ 圖片字段為空字符串

**解決方案**：需要修改圖片檢測邏輯以排除空字符串

---

## 🔧 修復方案

### 如果是情況 B（圖片字段缺失）

**修復步驟**：
1. 檢查 `/api/activities/[id]` 是否正確返回 `vocabularyItems`
2. 確認 VocabularyItem 表中有 `imageUrl` 和 `chineseImageUrl` 數據
3. 如果沒有，需要重新上傳圖片

### 如果是情況 C（圖片字段為空字符串）

**修復代碼**（在 game.js 第 1911-1913 行）：

```javascript
// 修改前
const hasImages = currentPagePairs.some(pair =>
    pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
);

// 修改後
const hasImages = currentPagePairs.some(pair =>
    (pair.imageUrl && pair.imageUrl.trim()) || 
    (pair.chineseImageUrl && pair.chineseImageUrl.trim()) || 
    pair.imageId || 
    pair.chineseImageId
);
```

---

## 📞 下一步

1. **訪問遊戲頁面** - 在手機上打開上面的 URL
2. **打開 F12 Console** - 查看詳細日誌
3. **記錄所有信息** - 特別是 `🔍 [v9.0] 原始詞彙數據結構檢查` 部分
4. **告訴我結果** - 分享您看到的日誌
5. **我會診斷問題** - 根據日誌確定根本原因
6. **實施修復** - 修改代碼或數據

---

## 📋 需要提供的信息

訪問遊戲後，請告訴我：

1. **totalItems**: 應該是 20
2. **firstItemKeys**: 列出所有字段名
3. **hasImageUrl**: true 或 false
4. **hasChineseImageUrl**: true 或 false
5. **imageUrlValue**: URL 或 null 或 ""
6. **chineseImageUrlValue**: URL 或 null 或 ""
7. **佈局模式**: 🟦 正方形模式 或 🟨 長方形模式
8. **列數**: 應該是 5（正確）或 3（錯誤）
9. **行數**: 應該是 4

---

**現在就訪問遊戲頁面並查看 Console 日誌吧！** 🚀


