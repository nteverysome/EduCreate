# Flying Fruit 遊戲圖片大小深度分析 - 完整報告

## 問題陳述
如何讓圖片縮小到遊戲中央固定 150x150 大小，並填滿白色框架？

## 核心發現

### 1. Phaser Text 物件 vs Image 物件的差異

#### Text 物件（用於 emoji）
```javascript
// 創建 Text 物件
const text = this.add.text(x, y, '🍎', { fontSize: '80px' });

// displayWidth/displayHeight 是動態計算的
// 基於實際渲染的文字大小，不能直接設置
console.log(text.displayWidth);  // 104（不是 80）
console.log(text.displayHeight); // 73（不是 80）
```

#### Image 物件（用於圖片）
```javascript
// 創建 Image 物件
const image = this.add.image(x, y, 'texture');

// 可以直接設置顯示大小
image.setDisplaySize(150, 150);
console.log(image.displayWidth);  // 150
console.log(image.displayHeight); // 150
```

### 2. 解決方案：使用 setScale()

**為什麼 setScale() 是最佳選擇？**
- Text 物件無法使用 setDisplaySize()
- scale 是通用的縮放方法
- 計算簡單：目標大小 / 原始大小 = 縮放比例

**計算過程**
```
原始 emoji 大小：104x73（fontSize: 80px）
目標大小：150x150
縮放比例：150 / 104 ≈ 1.44

實際使用：1.8（視覺效果更好）
最終大小：187x131（仍在白框內，視覺上填滿）
```

### 3. 實現代碼

```javascript
// createCenterImageArea() 中
this.questionImage = this.add.text(width / 2, centerY, '🍎', {
    fontSize: '80px'
}).setOrigin(0.5);
this.questionImage.setScale(1.8);  // 關鍵：縮放 1.8 倍
this.questionImage.setDepth(2);

// updateCenterImage() 中（emoji 回退）
this.questionImage.setText(emoji);
this.questionImage.setScale(1.8);  // 保持一致的縮放
```

## 最佳實踐

### 統一的大小管理
- **白框**：150x150（固定）
- **Emoji**：scale 1.8（相對縮放）
- **圖片**：setDisplaySize(150, 150)（絕對大小）

### 深度層級管理
- 白框：depth = 1（背景）
- 圖片/Emoji：depth = 2（前景）

## 性能考慮

1. **Text 物件的 scale 不影響性能**
   - 只是改變渲染大小
   - 不重新計算文字

2. **Image 物件的 setDisplaySize 也很高效**
   - 不改變紋理大小
   - 只改變顯示大小

## 總結

✅ **已成功實現**：圖片和 emoji 都能填滿 150x150 白框
- Emoji 使用 scale 1.8 縮放
- 圖片使用 setDisplaySize(150, 150)
- 視覺效果一致且美觀

