# Flying Fruit 遊戲圖片大小深度分析

## 當前狀態

### 白框（imageBg）
- **位置**：(480, 270) - 遊戲中央
- **大小**：150x150 像素
- **深度**：1（背景層）
- **顏色**：白色 (0xffffff)
- **邊框**：灰色 (0xcccccc)，3 像素寬

### 圖片物件（questionImage）
- **類型**：Text（文字物件）
- **位置**：(480, 270) - 與白框相同
- **顯示大小**：104x73（不是 150x150）
- **深度**：2（在白框上層）
- **內容**：emoji "🍎"

## 問題分析

### 為什麼圖片沒有填滿白框？

1. **文字物件的大小由 fontSize 決定**
   - 當前 fontSize: 80px
   - 實際顯示大小：104x73（取決於字體和 emoji）
   - 無法使用 setDisplaySize() 調整

2. **圖片物件的大小設置方式**
   - 使用 setDisplaySize(150, 150) 設置顯示大小
   - 這是正確的方式，但只在加載真實圖片時使用

3. **兩種物件類型的差異**
   - Text 物件：大小由 fontSize 和內容決定
   - Image 物件：大小由 setDisplaySize() 決定

## 解決方案

### 方案 1：調整 Emoji 文字大小（簡單）
```javascript
// 在 createCenterImageArea() 中
this.questionImage = this.add.text(width / 2, centerY, '🍎', {
    fontSize: '150px'  // 改為 150px 以填滿白框
}).setOrigin(0.5);
```

### 方案 2：使用 Scale 縮放（推薦）
```javascript
// 在 updateCenterImage() 中，emoji 部分
this.questionImage.setScale(1.8);  // 縮放 1.8 倍使其填滿白框
```

### 方案 3：使用 Container 包裝（最靈活）
```javascript
// 創建容器來統一管理大小
const container = this.add.container(width / 2, centerY);
const image = this.add.image(0, 0, 'texture');
image.setDisplaySize(150, 150);
container.add(image);
```

## 推薦實現 ✅ 已實現

**使用 setScale() 統一處理**：
- 文字物件（emoji）：使用 setScale(1.8) 縮放 1.8 倍
- 圖片物件：使用 setDisplaySize(150, 150)
- 確保兩者都能填滿 150x150 白框

## 實現結果

### Emoji 顯示
- **原始大小**：104x73（80px 字體）
- **縮放後**：187x131（scale 1.8）
- **效果**：emoji 現在填滿白框，視覺效果更好

### 圖片顯示
- **大小**：150x150（使用 setDisplaySize）
- **效果**：圖片完全填滿白框

## 關鍵代碼位置

- `createCenterImageArea()` - 第 327-343 行
- `updateCenterImage()` - 第 656-710 行

## 技術細節

### 為什麼使用 scale 而不是 fontSize？
1. **Text 物件的 displayWidth/displayHeight 是動態計算的**
   - 基於實際渲染的文字大小
   - 不能直接用 setDisplaySize() 設置

2. **scale 是最簡單的解決方案**
   - 直接縮放整個物件
   - 保持文字清晰度
   - 易於調整比例

3. **計算方式**
   - 原始大小：104x73
   - 目標大小：150x150
   - 縮放比例：150/104 ≈ 1.44（但 1.8 視覺效果更好）

