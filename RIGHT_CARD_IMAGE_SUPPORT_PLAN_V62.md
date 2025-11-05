# 🎯 改進計劃：右側卡片支持圖片功能 (v62.0)

## 📋 當前狀態

### 左側卡片（英文）- 支持多種組合 ✅
- ✅ 文字
- ✅ 圖片
- ✅ 語音
- ✅ 圖片 + 文字
- ✅ 圖片 + 語音
- ✅ 圖片 + 文字 + 語音
- ✅ 文字 + 語音

### 右側卡片（中文）- 只支持文字 ⚠️
- ✅ 文字
- ❌ 圖片
- ❌ 語音
- ❌ 圖片 + 文字
- ❌ 圖片 + 語音

## 🔧 改進方案

### 步驟 1：修改 createRightCard 函數

**文件**：`public/games/match-up-game/scenes/game.js`

**位置**：第 3900-4000 行

**改進內容**：
1. 添加 `imageUrl` 和 `audioUrl` 參數
2. 檢查內容組合（圖片、文字、語音）
3. 根據組合選擇合適的佈局
4. 支持多種佈局方式

### 步驟 2：創建右側卡片佈局函數

**新增函數**：
- `createRightCardLayoutA()` - 圖片 + 文字 + 語音
- `createRightCardLayoutB()` - 只有語音
- `createRightCardLayoutC()` - 只有文字（現有）
- `createRightCardLayoutD()` - 圖片 + 文字
- `createRightCardLayoutE()` - 文字 + 語音
- `createRightCardLayoutF()` - 只有圖片
- `createRightCardLayoutImageAudio()` - 圖片 + 語音

### 步驟 3：更新詞彙數據加載

**文件**：`public/games/match-up-game/scenes/game.js`

**位置**：第 232-413 行（loadVocabularyFromAPI）

**改進內容**：
- 確保 `chineseImageUrl` 被正確加載
- 確保 `audioUrl` 被正確加載

### 步驟 4：更新右側卡片創建調用

**文件**：`public/games/match-up-game/scenes/game.js`

**位置**：第 3050-3100 行（創建右側卡片的地方）

**改進內容**：
- 傳遞 `chineseImageUrl` 參數
- 傳遞 `audioUrl` 參數

## 📊 改進前後對比

### 改進前 ❌

```javascript
createRightCard(x, y, width, height, text, pairId, textPosition = 'bottom') {
    // 只支持文字
    const cardText = this.add.text(textX, textY, text, {...});
    container.add([background, cardText]);
}
```

### 改進後 ✅

```javascript
createRightCard(x, y, width, height, text, pairId, imageUrl = null, audioUrl = null, textPosition = 'bottom') {
    // 檢查內容組合
    const hasImage = imageUrl && imageUrl.trim() !== '';
    const hasText = text && text.trim() !== '';
    const hasAudio = audioUrl && audioUrl.trim() !== '';
    
    // 根據組合選擇佈局
    if (hasImage && hasText && hasAudio) {
        this.createRightCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId);
    } else if (hasImage && hasText && !hasAudio) {
        this.createRightCardLayoutD(container, background, width, height, text, imageUrl, pairId);
    } else if (hasImage && !hasText && hasAudio) {
        this.createRightCardLayoutImageAudio(container, background, width, height, imageUrl, audioUrl, pairId);
    } else if (!hasImage && hasText && hasAudio) {
        this.createRightCardLayoutE(container, background, width, height, text, audioUrl, pairId);
    } else if (hasImage && !hasText && !hasAudio) {
        this.createRightCardLayoutF(container, background, width, height, imageUrl, pairId);
    } else if (!hasImage && !hasText && hasAudio) {
        this.createRightCardLayoutB(container, background, width, height, audioUrl, pairId);
    } else {
        // 只有文字（現有邏輯）
        this.createRightCardLayoutC(container, background, width, height, text);
    }
}
```

## 🎨 佈局設計

### 佈局 A：圖片 + 文字 + 語音

```
┌─────────────────┐
│   語音按鈕      │ (上 30%)
├─────────────────┤
│                 │
│     圖片        │ (中 40%)
│                 │
├─────────────────┤
│     文字        │ (下 30%)
└─────────────────┘
```

### 佈局 D：圖片 + 文字

```
┌─────────────────┐
│                 │
│     圖片        │ (上 60%)
│                 │
├─────────────────┤
│     文字        │ (下 40%)
└─────────────────┘
```

### 佈局 E：文字 + 語音

```
┌─────────────────┐
│     文字        │ (上 70%)
├─────────────────┤
│   語音按鈕      │ (下 30%)
└─────────────────┘
```

### 佈局 F：只有圖片

```
┌─────────────────┐
│                 │
│     圖片        │ (1:1 比例)
│                 │
└─────────────────┘
```

## 📝 實現步驟

1. ✅ 修改 `createRightCard` 函數簽名
2. ✅ 添加內容檢查邏輯
3. ✅ 創建佈局函數
4. ✅ 更新詞彙加載邏輯
5. ✅ 更新右側卡片創建調用
6. ✅ 測試所有組合

## 🧪 測試場景

| 場景 | 圖片 | 文字 | 語音 | 預期佈局 |
|------|------|------|------|---------|
| 1 | ✅ | ✅ | ✅ | 佈局 A |
| 2 | ✅ | ✅ | ❌ | 佈局 D |
| 3 | ✅ | ❌ | ✅ | ImageAudio |
| 4 | ✅ | ❌ | ❌ | 佈局 F |
| 5 | ❌ | ✅ | ✅ | 佈局 E |
| 6 | ❌ | ✅ | ❌ | 佈局 C |
| 7 | ❌ | ❌ | ✅ | 佈局 B |

## ✨ 預期結果

- ✅ 右側卡片支持圖片顯示
- ✅ 右側卡片支持語音按鈕
- ✅ 右側卡片支持多種內容組合
- ✅ 與左側卡片功能對稱
- ✅ 保持現有文字功能
- ✅ 自動適應不同屏幕尺寸

