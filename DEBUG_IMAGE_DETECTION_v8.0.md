# 🔍 v8.0 圖片檢測調試指南

## 🎯 問題診斷

您的情況：
- ✅ 有圖片
- ✅ 有聲音
- ✅ 有文字
- ✅ 手機直向（375×667px）
- ❌ 框是**長方形**（應該是正方形）
- ✅ 每頁 20 個卡片

**根本原因**：圖片檢測失敗，代碼進入了長方形模式而不是正方形模式

---

## 🔧 調試步驟

### 步驟 1：硬刷新瀏覽器

```
Ctrl+Shift+R（Windows）
Cmd+Shift+R（Mac）
```

### 步驟 2：打開開發者工具

```
F12 或 Ctrl+Shift+I
```

### 步驟 3：查看 Console 日誌

找到以下日誌：

```
🔍 詳細圖片檢測: {
    totalPairs: 20,
    hasImages: true,  ← 應該是 TRUE
    mode: "🟦 正方形模式",
    pairDetails: [
        {
            index: 0,
            imageUrl: "...",  ← 應該有值
            chineseImageUrl: "...",  ← 應該有值
            imageId: null,
            chineseImageId: null,
            hasAnyImage: true  ← 應該是 TRUE
        },
        ...
    ]
}
```

---

## 📊 可能的問題

### 情況 1：hasImages = false（圖片檢測失敗）

**症狀**：
```
hasImages: false,
mode: "🟨 長方形模式"
```

**原因**：
- 圖片字段為 `null` 或 `undefined`
- 圖片字段名稱不匹配

**解決方案**：
1. 檢查您的數據結構
2. 確認圖片字段名稱是否正確
3. 查看 `pairDetails` 中的 `imageUrl` 和 `chineseImageUrl` 值

### 情況 2：hasImages = true，但框仍是長方形

**症狀**：
```
hasImages: true,
mode: "🟦 正方形模式"
但框仍是長方形
```

**原因**：
- 代碼進入了正方形模式，但卡片尺寸計算有誤
- 可能是 `frameWidth` 和 `cardHeightInFrame` 不相等

**解決方案**：
查看以下日誌：
```
🟦 正方形卡片佈局: {
    frameWidth: 100,  ← 應該等於 cardHeightInFrame
    cardHeightInFrame: 100,  ← 應該等於 frameWidth
    cardRatio: "1:1 (正方形)"  ← 應該是 1:1
}
```

---

## 🔍 詳細檢查清單

### 檢查 1：圖片字段名稱

您的數據結構應該有以下字段之一：
- ✅ `imageUrl` - 英文圖片 URL
- ✅ `chineseImageUrl` - 中文圖片 URL
- ✅ `imageId` - 英文圖片 ID
- ✅ `chineseImageId` - 中文圖片 ID

**查看方法**：
在 Console 中執行：
```javascript
// 查看第一個卡片的所有字段
console.log(this.scene.scenes[0].pairs[0]);
```

**預期輸出**：
```javascript
{
    id: 1,
    question: "apple",
    answer: "蘋果",
    imageUrl: "https://...",  ← 應該有值
    chineseImageUrl: "https://...",  ← 應該有值
    audioUrl: "https://...",
    ...
}
```

### 檢查 2：圖片 URL 是否有效

在 Console 中執行：
```javascript
const pair = this.scene.scenes[0].pairs[0];
console.log('圖片 URL:', {
    imageUrl: pair.imageUrl,
    chineseImageUrl: pair.chineseImageUrl,
    imageUrlType: typeof pair.imageUrl,
    chineseImageUrlType: typeof pair.chineseImageUrl
});
```

**預期輸出**：
```javascript
{
    imageUrl: "https://example.com/image.jpg",
    chineseImageUrl: "https://example.com/chinese.jpg",
    imageUrlType: "string",
    chineseImageUrlType: "string"
}
```

### 檢查 3：佈局模式

在 Console 中執行：
```javascript
console.log('當前佈局模式:', {
    layout: this.scene.scenes[0].layout,
    itemsPerPage: this.scene.scenes[0].itemsPerPage,
    currentPage: this.scene.scenes[0].currentPage
});
```

**預期輸出**：
```javascript
{
    layout: "mixed",
    itemsPerPage: 20,
    currentPage: 0
}
```

---

## 📝 可能的數據結構問題

### 問題 1：圖片字段為 null

**症狀**：
```
imageUrl: null,
chineseImageUrl: null
```

**原因**：
- API 沒有返回圖片 URL
- 圖片 URL 在數據庫中為空

**解決方案**：
1. 檢查數據庫中的圖片 URL 是否已保存
2. 檢查 API 是否正確返回圖片 URL

### 問題 2：圖片字段名稱不匹配

**症狀**：
```
imageUrl: undefined,
但實際字段是 image_url 或 englishImageUrl
```

**原因**：
- 數據結構使用了不同的字段名稱

**解決方案**：
1. 查看 Console 中的 `pairDetails`
2. 找到實際的圖片字段名稱
3. 更新圖片檢測邏輯

---

## 🎯 預期結果

### 修復前（長方形模式）
```
🔍 詳細圖片檢測: {
    hasImages: false,  ← ❌ 錯誤
    mode: "🟨 長方形模式"
}

🟨 長方形卡片佈局: {
    frameWidth: 75,
    cardHeightInFrame: 67,
    cardRatio: "1.12:1"  ← 長方形
}
```

### 修復後（正方形模式）
```
🔍 詳細圖片檢測: {
    hasImages: true,  ← ✅ 正確
    mode: "🟦 正方形模式"
}

🟦 正方形卡片佈局: {
    frameWidth: 75,
    cardHeightInFrame: 75,
    cardRatio: "1:1 (正方形)"  ← 正方形
}
```

---

## 📞 需要幫助？

請提供以下信息：

1. **Console 日誌截圖**
   - 🔍 詳細圖片檢測 的完整輸出
   - 🟦 或 🟨 卡片佈局 的完整輸出

2. **第一個卡片的數據**
   ```javascript
   console.log(this.scene.scenes[0].pairs[0]);
   ```

3. **當前設備信息**
   - 設備型號
   - 瀏覽器版本
   - 屏幕解析度


