# 🔊 聲音按鈕調整指南

## 📍 配置文件位置

```
public/games/match-up-game/config/AUDIO_BUTTON_CONFIG.js
```

---

## 🎯 快速調整方法

### 方法 1️⃣：使用預設大小

編輯 `game.js` 第 2108 行附近，在 `contentSizes` 計算前添加：

```javascript
// 🔥 [v220.0] 使用預設大小
const PRESET = 'small';  // 改為 'tiny', 'small', 'medium', 'large', 'xlarge'

if (PRESET === 'small') {
    // 使用小按鈕預設
    audioButton: {
        size: itemCount === 20
            ? Math.max(Math.floor(cardHeight * 0.06), 8)
            : Math.max(Math.floor(cardHeight * 0.09), 10),
        minSize: itemCount === 20 ? 8 : 10,
        maxSize: itemCount === 20 ? 16 : 20
    }
}
```

### 方法 2️⃣：直接修改配置文件

編輯 `AUDIO_BUTTON_CONFIG.js`：

```javascript
const AUDIO_BUTTON_CONFIG = {
    size: {
        percentageFor20Items: 0.06,      // 改為 0.06（從 0.03）
        percentageForOthers: 0.09,       // 改為 0.09（從 0.045）
        minSizeFor20Items: 8,            // 改為 8（從 5）
        minSizeForOthers: 10,            // 改為 10（從 6）
        maxSizeFor20Items: 16,           // 改為 16（從 8）
        maxSizeForOthers: 20,            // 改為 20（從 10）
    }
};
```

---

## 📏 大小調整

### 按鈕大小百分比

| 預設 | 7 個卡片 | 10 個卡片 | 20 個卡片 | 說明 |
|------|---------|---------|---------|------|
| tiny | 1% | 4.5% | 1% | 超小 |
| small | 3% | 9% | 3% | 小 |
| medium | 6% | 18% | 6% | 中等 |
| large | 10% | 27% | 10% | 大 |
| xlarge | 25% | 35% | 25% | 超大 |

### 調整方法

```javascript
// 在 AUDIO_BUTTON_CONFIG 中修改
size: {
    percentageFor7Items: 0.03,   // ← 改 7 個卡片的大小
    percentageFor10Items: 0.09,  // ← 改 10 個卡片的大小
    percentageFor20Items: 0.06,  // ← 改 20 個卡片的大小
}
```

**說明**：
- `0.01` = 1%（超小）
- `0.03` = 3%（小）
- `0.06` = 6%（中等）
- `0.10` = 10%（大）
- `0.25` = 25%（超大）

---

## 🎨 顏色調整

### 顏色預設

| 預設 | 背景色 | 邊框色 | Hover 色 | 播放色 |
|------|--------|--------|---------|--------|
| green | 0x4CAF50 | 0x2E7D32 | 0x45a049 | 0x1B5E20 |
| blue | 0x2196F3 | 0x1565C0 | 0x1976D2 | 0x0D47A1 |
| red | 0xF44336 | 0xC62828 | 0xE53935 | 0xB71C1C |
| orange | 0xFF9800 | 0xE65100 | 0xFB8C00 | 0xBF360C |
| purple | 0x9C27B0 | 0x6A1B9A | 0xAB47BC | 0x4A148C |

### 調整方法

```javascript
// 在 AUDIO_BUTTON_CONFIG 中修改
colors: {
    background: 0x2196F3,  // 改為藍色
    border: 0x1565C0,      // 改為深藍色
    hover: 0x1976D2,       // 改為藍色
    playing: 0x0D47A1,     // 改為深藍色
}
```

### 十六進制顏色轉換

```
紅色：0xFF0000
綠色：0x00FF00
藍色：0x0000FF
黃色：0xFFFF00
紫色：0xFF00FF
青色：0x00FFFF
```

---

## 📍 位置調整

### 按鈕區域高度

```javascript
position: {
    buttonAreaHeightRatio: 0.2,  // 改為 0.15（15%）或 0.25（25%）
}
```

### 按鈕垂直對齐

```javascript
position: {
    verticalAlignment: 0.5,  // 0 = 頂部，0.5 = 居中，1 = 底部
}
```

### 按鈕偏移

```javascript
position: {
    offsetX: 0,    // 水平偏移（像素）
    offsetY: 5,    // 垂直偏移（像素）
}
```

---

## 🔧 邊框調整

```javascript
border: {
    width: 2,      // 改為 1（細邊框）或 3（粗邊框）
    style: 'solid',
}
```

---

## 🔊 圖標調整

### 改變圖標符號

```javascript
icon: {
    emoji: '🎵',   // 改為其他符號：🎶, 🎤, 🔔, 📢 等
    sizeRatio: 0.6,
}
```

### 改變圖標大小

```javascript
icon: {
    sizeRatio: 0.8,  // 改為 0.8（80% 的按鈕大小）
}
```

---

## 📊 完整調整示例

### 示例 1：大藍色按鈕

```javascript
const AUDIO_BUTTON_CONFIG = {
    size: {
        percentageFor20Items: 0.18,
        percentageForOthers: 0.27,
        minSizeFor20Items: 16,
        minSizeForOthers: 20,
        maxSizeFor20Items: 32,
        maxSizeForOthers: 48,
    },
    colors: {
        background: 0x2196F3,
        border: 0x1565C0,
        hover: 0x1976D2,
        playing: 0x0D47A1,
    },
};
```

### 示例 2：小紅色按鈕

```javascript
const AUDIO_BUTTON_CONFIG = {
    size: {
        percentageFor20Items: 0.06,
        percentageForOthers: 0.09,
        minSizeFor20Items: 8,
        minSizeForOthers: 10,
        maxSizeFor20Items: 16,
        maxSizeForOthers: 20,
    },
    colors: {
        background: 0xF44336,
        border: 0xC62828,
        hover: 0xE53935,
        playing: 0xB71C1C,
    },
};
```

---

## ✅ 調整步驟

1. 打開 `AUDIO_BUTTON_CONFIG.js`
2. 修改相應的配置值
3. 保存文件
4. 刷新瀏覽器
5. 查看效果

---

## 🐛 調試技巧

### 啟用調試日誌

```javascript
debug: {
    logEnabled: true,      // 打印日誌
    showBounds: true,      // 顯示邊界框
}
```

### 查看控制台日誌

按 `F12` 打開開發者工具，查看 Console 標籤中的日誌輸出。

---

**版本**：v220.0
**最後更新**：2025-11-14

