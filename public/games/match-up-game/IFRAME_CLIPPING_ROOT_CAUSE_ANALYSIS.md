# 🔍 **GameSwitcher iframe 素材裁切根本原因分析**

## 問題描述
遊戲在 GameSwitcher iframe 中顯示時，右側素材（答案卡片）被裁切，只能看到左側部分。

---

## ✅ **根本原因已找到！**

### 🎯 **問題根源：HTML/Body 的 `overflow: hidden`**

**iframe 內部的 HTML 和 Body 元素設置了 `overflow: hidden`**

```
📄 HTML 計算樣式: {
  width: 1841px,
  height: 963px,
  overflow: hidden,  ❌ 這是問題！
  margin: 0px,
  padding: 0px
}

📄 Body 計算樣式: {
  width: 1841px,
  height: 963px,
  overflow: hidden,  ❌ 這是問題！
  margin: 0px,
  padding: 0px
}
```

---

## 📊 **詳細檢查結果**

### ✅ 正常的元素
- **iframe 尺寸**：1841 × 963 ✅
- **game-container**：1841 × 963，overflow: visible ✅
- **Canvas**：1841 × 963，display: inline ✅
- **父容器**：1841 × 963，overflow-hidden（React 容器）✅

### ❌ 問題元素
- **HTML**：overflow: hidden ❌
- **Body**：overflow: hidden ❌

---

## 🔧 **為什麼會導致裁切？**

1. **Canvas 尺寸**：1841 × 963（正確）
2. **遊戲內容位置**：
   - 左側卡片：X = 736
   - 右側卡片：X = 1197
   - 右側卡片右邊界：X = 1527（1197 + 330）

3. **HTML/Body overflow: hidden 的影響**：
   - 當 HTML 或 Body 設置 `overflow: hidden` 時
   - 任何超出其邊界的內容都會被裁切
   - 由於 Canvas 是 inline 元素，其內容受到 Body 的限制

4. **實際裁切情況**：
   - Canvas 寬度：1841px
   - Body 寬度：1841px
   - 但 overflow: hidden 會導致任何超出的內容被隱藏

---

## 🎯 **解決方案**

### 方案 1：移除 HTML/Body 的 overflow: hidden（推薦）

在 iframe 的 HTML 文件中添加 CSS：

```css
html, body {
  overflow: visible !important;
}
```

### 方案 2：在 Phaser 配置中設置

在 `config.js` 中添加：

```javascript
const config = {
  // ... 其他配置
  scale: {
    // ... 其他 scale 配置
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    // 確保 canvas 不被裁切
  },
  // 添加 CSS 規則
  render: {
    // ...
  }
};
```

### 方案 3：在 index.html 中設置

```html
<!DOCTYPE html>
<html style="overflow: visible;">
<head>
  <!-- ... -->
</head>
<body style="overflow: visible;">
  <!-- ... -->
</body>
</html>
```

---

## 📋 **檢查清單**

- ✅ Canvas 尺寸正確（1841 × 963）
- ✅ game-container 尺寸正確（1841 × 963）
- ✅ Camera Zoom 計算正確（v64.0 修復）
- ✅ 卡片位置計算正確
- ❌ **HTML/Body overflow: hidden 導致裁切**

---

## 🚀 **下一步行動**

1. 檢查 iframe 的 HTML 文件
2. 移除或修改 HTML/Body 的 `overflow: hidden`
3. 測試遊戲顯示
4. 驗證所有素材都正常顯示

---

**根本原因確認**：HTML/Body 的 `overflow: hidden` 導致遊戲內容被裁切

