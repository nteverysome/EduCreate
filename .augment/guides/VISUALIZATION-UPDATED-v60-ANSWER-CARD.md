# 可視化工具更新 - v60.0 答案卡片位置可視化

## 🎮 可視化工具已更新

訪問以下 URL 查看最新的可視化工具：

```
http://localhost:3000/games/match-up-game/visualization/vertical-spacing-functions.html
```

---

## ✨ 新增功能

### 1️⃣ 答案卡片位置對比
- ❌ 左側：修改前（v33.0）- 水平排列
- ✅ 右側：修改後（v60.0）- 垂直排列

### 2️⃣ 答案卡片參數控制
- 🎛️ 圖片與框的間距 (imagePadding)
- 🎛️ 文字與圖片的間距 (textPadding)
- 🎛️ 圖片大小 (imageSize)
- 🎛️ 字體大小 (fontSize)

### 3️⃣ 實時調整和預覽
- 📊 實時查看參數變化
- 🔍 控制台輸出詳細信息
- 📈 位置計算公式展示

### 4️⃣ 修改說明
- 📝 v60.0 修改詳情
- 🎨 佈局方向說明
- ✅ 效果說明

---

## 📊 答案卡片參數

### 修改前（v33.0）- 水平排列

```
┌─────────────┐
│   空白框    │  [圖片] 文字
└─────────────┘

參數：
- imagePadding: 20px
- textPadding: 15px
- 文字位置: 圖片右邊
- 文字對齐: 左對齐
```

### 修改後（v60.0）- 垂直排列

```
┌─────────────┐
│   空白框    │
└─────────────┘
    [圖片]
    文字

參數：
- imagePadding: 10px
- textPadding: 8px
- 文字位置: 圖片下方
- 文字對齐: 水平居中
```

---

## 🎛️ 控制面板說明

### 圖片與框的間距 (imagePadding)
- **位置**: L9295
- **當前值**: 10px
- **範圍**: 5 - 30px
- **作用**: 控制圖片與空白框下邊界的距離

### 文字與圖片的間距 (textPadding)
- **位置**: L9296
- **當前值**: 8px
- **範圍**: 3 - 20px
- **作用**: 控制文字與圖片下邊界的距離

### 圖片大小 (imageSize)
- **位置**: L9294
- **當前值**: 90%
- **範圍**: 60% - 120%
- **作用**: 控制圖片相對於卡片高度的大小

### 字體大小 (fontSize)
- **位置**: L9325
- **當前值**: 16-28px
- **範圍**: 12-36px
- **作用**: 控制文字的字體大小

---

## 📐 位置計算公式

### 修改後（v60.0）

```javascript
// 圖片位置
const boxBottomEdge = boxY + boxHeight / 2;
const imageX = boxX;  // 水平居中於框
const imageY = boxBottomEdge + imagePadding + imageSize / 2;

// 文字位置
const textX = boxX;  // 水平居中於框
const textY = imageY + imageSize / 2 + textPadding;
```

### 計算步驟

1. **計算框的下邊界**
   ```
   boxBottomEdge = boxY + boxHeight / 2
   ```

2. **計算圖片位置**
   ```
   imageY = boxBottomEdge + imagePadding + imageSize / 2
   ```

3. **計算文字位置**
   ```
   textY = imageY + imageSize / 2 + textPadding
   ```

---

## 🎮 使用指南

### 1. 打開可視化工具
```
http://localhost:3000/games/match-up-game/visualization/vertical-spacing-functions.html
```

### 2. 查看答案卡片位置對比
- 向下滾動到「v60.0 答案卡片位置可視化」部分
- 左側顯示修改前的水平排列
- 右側顯示修改後的垂直排列

### 3. 調整答案卡片參數
- 使用 4 個滑塊調整參數
- 實時查看參數值變化
- 觀察位置計算公式

### 4. 檢查控制台
- 打開瀏覽器控制台（F12）
- 查看詳細的計算信息
- 驗證位置公式

---

## 📋 參數調整建議

### 緊湊佈局
```javascript
imagePadding: 5px
textPadding: 3px
imageSize: 70%
fontSize: 14px
```

### 標準佈局（推薦）
```javascript
imagePadding: 10px
textPadding: 8px
imageSize: 90%
fontSize: 20px
```

### 寬鬆佈局
```javascript
imagePadding: 20px
textPadding: 15px
imageSize: 110%
fontSize: 28px
```

---

## 📚 相關文檔

1. **VERSION-60-TEXT-POSITION-BELOW.md** - 文字位置調整詳情
2. **VERSION-59-PARAMETER-ADJUSTMENT.md** - 參數調整
3. **BUG-FIX-v58-VERTICAL-SPACING.md** - Bug 修復

---

## 🔍 控制台輸出示例

```javascript
🎨 [v60.0] 答案卡片位置調整: {
  imagePadding: "10px",
  textPadding: "8px",
  imageSize: "90%",
  fontSize: "20px",
  formula: "imageY = boxBottomEdge + 10px + imageSize/2",
  textFormula: "textY = imageY + imageSize/2 + 8px",
  description: "文字在空白框下方，圖片在文字上方"
}
```

---

## ✅ 驗證修改

### 步驟 1：打開可視化工具
```
http://localhost:3000/games/match-up-game/visualization/vertical-spacing-functions.html
```

### 步驟 2：查看答案卡片對比
- ✅ 修改前應該顯示水平排列
- ✅ 修改後應該顯示垂直排列

### 步驟 3：調整參數
- ✅ 滑塊應該能夠調整參數
- ✅ 標籤應該實時更新

### 步驟 4：檢查控制台
- ✅ 應該看到詳細的計算信息
- ✅ 應該看到位置公式

---

**最後更新**: 2025-01-14  
**版本**: v60.0  
**狀態**: ✅ 已更新

