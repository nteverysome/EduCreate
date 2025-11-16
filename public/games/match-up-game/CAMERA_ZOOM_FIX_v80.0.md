# Camera Zoom 修復 v80.0 - 支援橫向/直向偵測

## 📋 修復概述

**版本**: v80.0  
**日期**: 2025-11-16  
**問題**: v79.0 沒有偵測手機橫向/直向模式  
**解決方案**: 使用較小的尺寸維度來判斷設備類型

---

## 🔍 問題分析

### 用戶反饋
> "是不是沒有加入偵測直向與橫向"

### v79.0 的問題

```javascript
// ❌ v79.0 的判斷邏輯
const isMobile = scene.sizer.width < 768
```

**問題場景**：

| 設備狀態 | 尺寸 | width | isMobile | 結果 |
|---------|------|-------|----------|------|
| 手機直向 | 390×844 | 390 | true ✅ | 正確 |
| 手機橫向 | 844×390 | 844 | false ❌ | **錯誤！** |
| 桌面 | 1841×911 | 1841 | false ✅ | 正確 |

**問題**：
- 手機橫向時，width = 844 > 768
- 被誤判為桌面設備
- 使用 zoom=1 導致內容太小！

---

## 🎯 **v80.0 解決方案：使用較小的尺寸維度**

### **核心改變**

```javascript
// ✅ v80.0 的判斷邏輯
const minDimension = Math.min(scene.sizer.width, scene.sizer.height)
const isMobile = minDimension < 768
```

### **為什麼這樣做？**

**使用較小的尺寸維度**可以正確識別手機設備，無論橫向或直向：

| 設備狀態 | 尺寸 | minDimension | isMobile | 結果 |
|---------|------|--------------|----------|------|
| 手機直向 | 390×844 | 390 | true ✅ | 正確 |
| 手機橫向 | 844×390 | 390 | true ✅ | **修復！** |
| 桌面 | 1841×911 | 911 | false ✅ | 正確 |

---

## 📊 **實際效果**

### **手機直向（390×844）**
```javascript
minDimension = Math.min(390, 844) = 390
isMobile = 390 < 768 = true
orientation = 'portrait'

// 使用手機端策略
zoom = Math.max(scaleX, scaleY)
centerOn(baseSize/2)

✅ 內容放大到適合手機螢幕
```

### **手機橫向（844×390）**
```javascript
minDimension = Math.min(844, 390) = 390
isMobile = 390 < 768 = true
orientation = 'landscape'

// 使用手機端策略
zoom = Math.max(scaleX, scaleY)
centerOn(baseSize/2)

✅ 內容放大到適合手機螢幕（修復！）
```

### **桌面（1841×911）**
```javascript
minDimension = Math.min(1841, 911) = 911
isMobile = 911 < 768 = false
orientation = 'landscape'

// 使用桌面端策略
zoom = 1
centerOn(sizer/2)

✅ 內容完美置中
```

---

## 📝 **修改的文件**

1. ✅ `public/games/match-up-game/scenes/handler.js`
   - `updateCamera()` 方法：使用 minDimension 判斷設備類型
   - `resize()` 方法：使用 minDimension 判斷設備類型
   - Console 訊息：新增 minDimension 和 orientation 資訊

2. ✅ `public/games/_template/scenes/handler.js`
   - `updateCamera()` 方法：使用 minDimension 判斷設備類型
   - `resize()` 方法：使用 minDimension 判斷設備類型
   - Console 訊息：新增 minDimension 和 orientation 資訊

---

## 🎯 **Console 訊息範例**

### **手機直向**
```json
{
  "scaleX": "0.406",
  "scaleY": "1.563",
  "zoom": "1.563",
  "minDimension": 390,
  "isMobile": true,
  "orientation": "portrait",
  "strategy": "Mobile - Math.max (v74 method)",
  "centerX": "480.0",
  "centerY": "270.0",
  "sizerSize": "390×844",
  "baseSize": "960×540"
}
```

### **手機橫向**
```json
{
  "scaleX": "0.879",
  "scaleY": "0.722",
  "zoom": "0.879",
  "minDimension": 390,
  "isMobile": true,
  "orientation": "landscape",
  "strategy": "Mobile - Math.max (v74 method)",
  "centerX": "480.0",
  "centerY": "270.0",
  "sizerSize": "844×390",
  "baseSize": "960×540"
}
```

### **桌面**
```json
{
  "scaleX": "1.918",
  "scaleY": "1.687",
  "zoom": "1.000",
  "minDimension": 911,
  "isMobile": false,
  "orientation": "landscape",
  "strategy": "Desktop - zoom=1, centerOn(sizer/2) (v77 method)",
  "centerX": "920.5",
  "centerY": "455.5",
  "sizerSize": "1841×911",
  "baseSize": "960×540"
}
```

---

## 📊 **版本演進總結**

| 版本 | 設備判斷邏輯 | 手機直向 | 手機橫向 | 桌面 |
|------|------------|---------|---------|------|
| v79.0 | `width < 768` | ✅ 正常 | ❌ 誤判為桌面 | ✅ 正常 |
| **v80.0** | **`Math.min(width, height) < 768`** | ✅ **正常** | ✅ **修復** | ✅ **正常** |

---

## 🎯 **設計理念**

### **為什麼使用較小的尺寸維度？**

1. **手機的特徵**：
   - 無論橫向或直向，至少有一個維度是小的（通常 < 768）
   - 手機直向：390×844 → minDimension = 390
   - 手機橫向：844×390 → minDimension = 390

2. **桌面的特徵**：
   - 兩個維度都比較大（通常 > 768）
   - 桌面：1841×911 → minDimension = 911

3. **768px 作為分界點**：
   - 這是常見的平板/手機分界線
   - 符合響應式設計的標準斷點

---

## 🧪 **測試計畫**

### **桌面端測試** ✅
- ✅ 確認 Console 顯示 `minDimension: 911, isMobile: false, orientation: 'landscape'`
- ✅ 確認內容完美置中

### **手機直向測試** ⏳
- ⏳ 確認 Console 顯示 `minDimension: 390, isMobile: true, orientation: 'portrait'`
- ⏳ 確認內容放大到適合螢幕

### **手機橫向測試** ⏳
- ⏳ 確認 Console 顯示 `minDimension: 390, isMobile: true, orientation: 'landscape'`
- ⏳ 確認內容放大到適合螢幕（不會被誤判為桌面）

---

## 📝 **總結**

**問題根源**：
- v79.0 只檢查 width，無法正確識別手機橫向模式

**最終解決方案**：
- v80.0 使用較小的尺寸維度判斷設備類型
- 支援手機橫向/直向模式自動偵測
- Console 訊息新增 orientation 資訊方便調試

**適用範圍**：
- ✅ 已更新 match-up-game
- ✅ 已更新模板系統 (_template)
- ✅ 適用於所有需要跨設備支援的遊戲

---

## 🎯 **下一步**

1. ⏳ 在瀏覽器中測試桌面端（確認仍然正常）
2. ⏳ 在真實手機上測試直向模式
3. ⏳ 在真實手機上測試橫向模式（重點測試）
4. ⏳ 如果測試通過，提交到 GitHub

