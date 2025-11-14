# v61.0 動態卡片高度計算

## 🎯 修改目標

為了能放下圖片與文字，卡片高度 (cardHeight) 改成動態識別容器大小。

---

## ✨ 修改內容

### 修改前（v60.0）
- 卡片高度是固定的滑塊控制（150-300px）
- 用戶手動調整卡片高度
- 可能導致圖片和文字沒有足夠空間

### 修改後（v61.0）
- 卡片高度根據容器大小動態計算
- 自動為圖片和文字留出空間
- 調整其他參數時自動重新計算

---

## 📐 動態計算公式

### 基本公式

```javascript
cardHeight = (screenHeight - timerHeight - timerGap - topMargin - bottomButtonArea - answerCardsHeight) / 2
```

### 詳細計算

```javascript
// 屏幕總高度
const screenHeight = 600;

// 固定區域高度
const timerHeight = 50;
const timerGap = 20;

// 答案卡片區域高度（估計值）
const estimatedImageHeight = 50 * (imageSize / 100);
const estimatedTextHeight = 20;
const answerCardsHeight = estimatedImageHeight + imagePadding + textPadding + estimatedTextHeight + 10;

// 可用高度
const availableHeight = screenHeight - timerHeight - timerGap - topMargin - bottomButtonArea - answerCardsHeight;

// 卡片高度（上下各一個容器）
const dynamicCardHeight = Math.max(80, Math.floor(availableHeight / 2));
```

---

## 🎛️ 影響卡片高度的參數

### 直接影響
1. **額外上方邊距 (additionalTopMargin)**
   - 增加 → 卡片高度減少
   - 減少 → 卡片高度增加

2. **底部按鈕區域 (bottomButtonArea)**
   - 增加 → 卡片高度減少
   - 減少 → 卡片高度增加

### 間接影響（通過答案卡片區域）
1. **圖片與框的間距 (imagePadding)**
   - 增加 → 答案卡片區域增加 → 卡片高度減少
   - 減少 → 答案卡片區域減少 → 卡片高度增加

2. **文字與圖片的間距 (textPadding)**
   - 增加 → 答案卡片區域增加 → 卡片高度減少
   - 減少 → 答案卡片區域減少 → 卡片高度增加

3. **圖片大小 (imageSize)**
   - 增加 → 答案卡片區域增加 → 卡片高度減少
   - 減少 → 答案卡片區域減少 → 卡片高度增加

---

## 🎮 使用指南

### 1. 打開可視化工具
```
http://localhost:3000/games/match-up-game/visualization/vertical-spacing-functions.html
```

### 2. 查看卡片高度
- 卡片高度現在顯示為「動態計算」
- 不再有滑塊控制
- 實時根據其他參數調整

### 3. 調整參數
- 調整任何參數時，卡片高度會自動重新計算
- 屏幕中的容器位置會實時更新

### 4. 檢查控制台
- 打開瀏覽器控制台（F12）
- 查看動態計算的卡片高度值

---

## 📊 示例計算

### 標準配置

```
屏幕高度: 600px
計時器: 50px
計時器間距: 20px
額外上方邊距: 50px
底部按鈕區域: 40px
圖片與框的間距: 10px
文字與圖片的間距: 8px
圖片大小: 90%

計算步驟：
1. 估計圖片高度 = 50 × 0.9 = 45px
2. 估計文字高度 = 20px
3. 答案卡片區域 = 45 + 10 + 8 + 20 + 10 = 93px
4. 可用高度 = 600 - 50 - 20 - 50 - 40 - 93 = 347px
5. 卡片高度 = 347 / 2 = 173.5px ≈ 173px
```

### 緊湊配置

```
額外上方邊距: 50px
底部按鈕區域: 40px
圖片與框的間距: 5px
文字與圖片的間距: 3px
圖片大小: 70%

計算步驟：
1. 估計圖片高度 = 50 × 0.7 = 35px
2. 答案卡片區域 = 35 + 5 + 3 + 20 + 10 = 73px
3. 可用高度 = 600 - 50 - 20 - 50 - 40 - 73 = 367px
4. 卡片高度 = 367 / 2 = 183.5px ≈ 183px
```

### 寬鬆配置

```
額外上方邊距: 90px
底部按鈕區域: 80px
圖片與框的間距: 20px
文字與圖片的間距: 15px
圖片大小: 110%

計算步驟：
1. 估計圖片高度 = 50 × 1.1 = 55px
2. 答案卡片區域 = 55 + 20 + 15 + 20 + 10 = 120px
3. 可用高度 = 600 - 50 - 20 - 90 - 80 - 120 = 240px
4. 卡片高度 = 240 / 2 = 120px
```

---

## 🔍 控制台輸出示例

```javascript
📊 [v61.0] 上下容器間距計算（動態卡片高度）: {
  verticalSpacingRatio: 0,
  cardHeight_dynamic: 173,
  verticalSpacing: "0.00",
  topY: 120,
  bottomY_correct: 293,
  spacing_correct: "0.00",
  formula_dynamic: "cardHeight = (600 - 50 - 20 - 50 - 40 - answerCardsHeight) / 2 = 173px",
  formula_correct: "bottomY = topY + cardHeight + verticalSpacing = 120 + 173 + 0.00",
  note: "卡片高度現在根據容器大小動態計算，為圖片和文字留出空間"
}
```

---

## ✅ 驗證修改

### 步驟 1：打開可視化工具
```
http://localhost:3000/games/match-up-game/visualization/vertical-spacing-functions.html
```

### 步驟 2：查看卡片高度
- ✅ 卡片高度應該顯示為「動態計算」
- ✅ 不應該有卡片高度滑塊

### 步驟 3：調整參數
- ✅ 調整額外上方邊距時，卡片高度應該變化
- ✅ 調整底部按鈕區域時，卡片高度應該變化
- ✅ 調整圖片與框的間距時，卡片高度應該變化

### 步驟 4：檢查屏幕
- ✅ 屏幕中的容器應該自動調整大小
- ✅ 圖片和文字應該有足夠空間

### 步驟 5：檢查控制台
- ✅ 應該看到動態計算的卡片高度值
- ✅ 應該看到計算公式

---

## 📚 相關文檔

1. **VERSION-61-DYNAMIC-CARD-HEIGHT.md** ⭐ 動態卡片高度說明
2. **VISUALIZATION-INTEGRATED-v60-ANSWER-CARDS.md** - 答案卡片整合
3. **VERSION-60-TEXT-POSITION-BELOW.md** - 文字位置調整
4. **VERSION-59-PARAMETER-ADJUSTMENT.md** - 參數調整

---

## 🔧 代碼位置

### 函數位置
- **calculateDynamicCardHeight()**: L839-857
- **updateVisualization()**: L859-928

### 控制面板位置
- **卡片高度顯示**: L620-630

### 事件監聽器位置
- **imagePaddingSlider**: L1009-1012
- **textPaddingSlider**: L1013-1016
- **imageSizeSlider**: L1017-1020

---

**最後更新**: 2025-01-14  
**版本**: v61.0  
**狀態**: ✅ 已實現

