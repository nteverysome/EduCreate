# 🤖 如何使用 Augment 操作 Responsively App 獲取 iPhone 實際資訊

## 📋 概述

本指南說明如何使用 Augment 工具來操作 Responsively App 並獲取 iPhone 實際資訊。

---

## 🛠️ Augment 可用的工具

### 1️⃣ **Playwright 工具** (推薦用於已打開的瀏覽器)

| 工具 | 用途 | 例子 |
|------|------|------|
| `browser_snapshot_Playwright` | 獲取頁面快照 (文本) | 獲取頁面結構和元素 |
| `browser_take_screenshot_Playwright` | 截圖 (PNG/JPEG) | 保存遊戲畫面 |
| `browser_evaluate_Playwright` | 執行 JavaScript | 獲取遊戲狀態、卡片信息 |
| `browser_console_messages_Playwright` | 獲取控制台日誌 | 獲取 [v20.0] 和 [v18.0] 日誌 |
| `browser_click_Playwright` | 點擊元素 | 點擊卡片、按鈕 |
| `browser_hover_Playwright` | 懸停元素 | 觸發懸停效果 |

### 2️⃣ **Chrome DevTools 工具** (用於 CDP 連接)

| 工具 | 用途 | 例子 |
|------|------|------|
| `take_snapshot_chrome-devtools` | 獲取頁面快照 | 獲取頁面結構 |
| `take_screenshot_chrome-devtools` | 截圖 | 保存遊戲畫面 |
| `evaluate_script_chrome-devtools` | 執行 JavaScript | 獲取遊戲數據 |
| `list_console_messages_chrome-devtools` | 獲取控制台日誌 | 獲取所有日誌 |
| `click_chrome-devtools` | 點擊元素 | 點擊卡片 |

### 3️⃣ **進程工具** (用於啟動和控制應用)

| 工具 | 用途 | 例子 |
|------|------|------|
| `launch-process` | 啟動應用 | 啟動 Responsively App |
| `read-process` | 讀取進程輸出 | 讀取應用日誌 |
| `write-process` | 寫入進程輸入 | 發送命令 |

### 4️⃣ **文件工具** (用於讀寫文件)

| 工具 | 用途 | 例子 |
|------|------|------|
| `view` | 查看文件 | 查看配置文件 |
| `str-replace-editor` | 編輯文件 | 修改腳本 |
| `save-file` | 保存文件 | 保存報告 |

---

## 📝 清晰的溝通模板

### 模板 1: 獲取頁面信息

```
我想要獲取 Responsively App 中 iPhone 14 遊戲頁面的信息：

【設備信息】
- 設備: iPhone 14
- 視口: 390×844px
- 遊戲 URL: https://edu-create.vercel.app/games/switcher?game=match-up-game&...

【需要獲取的信息】
1. 頁面快照 (文本結構)
2. 控制台日誌 (特別是 [v20.0] 和 [v18.0])
3. 遊戲狀態 (卡片數、列數、卡片尺寸)
4. 截圖 (PNG 格式)

【期望結果】
- 生成報告文件
- 保存截圖
- 輸出控制台日誌
```

### 模板 2: 執行特定操作

```
我想要在 Responsively App 中執行以下操作：

【操作步驟】
1. 啟動 Responsively App
2. 設置 iPhone 14 設備 (390×844px)
3. 加載遊戲 URL
4. 等待頁面加載完成
5. 點擊第一張卡片
6. 獲取卡片信息
7. 截圖並保存

【期望結果】
- 卡片被點擊
- 獲取卡片詳細信息
- 保存截圖
```

### 模板 3: 收集特定數據

```
我想要從 Responsively App 中收集以下數據：

【數據類型】
- 設備尺寸信息
- 卡片佈局信息
- 性能指標
- 控制台日誌

【收集方法】
- 使用 JavaScript 執行獲取
- 從控制台日誌提取
- 從 DOM 元素讀取

【輸出格式】
- JSON 格式
- Markdown 報告
- CSV 表格
```

---

## 🚀 具體操作步驟

### 步驟 1: 啟動 Responsively App

**你應該說:**
```
請幫我啟動 Responsively App，並打開遊戲 URL：
https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20

使用 CDP 遠程調試端口 9222
```

**我會做:**
- 使用 `launch-process` 啟動 Responsively App
- 傳遞 `--remote-debugging-port=9222` 參數
- 傳遞遊戲 URL

### 步驟 2: 連接到頁面

**你應該說:**
```
請連接到 Responsively App 中已打開的頁面，並獲取頁面快照
```

**我會做:**
- 使用 `browser_snapshot_Playwright` 或 `take_snapshot_chrome-devtools`
- 獲取頁面結構和元素信息

### 步驟 3: 獲取控制台日誌

**你應該說:**
```
請獲取 Responsively App 中的所有控制台日誌，特別是包含 [v20.0] 和 [v18.0] 的日誌
```

**我會做:**
- 使用 `browser_console_messages_Playwright` 或 `list_console_messages_chrome-devtools`
- 過濾並提取目標日誌

### 步驟 4: 執行 JavaScript 獲取數據

**你應該說:**
```
請在 Responsively App 中執行 JavaScript 代碼，獲取以下信息：
- 遊戲視口尺寸
- 卡片數量
- 列數
- 卡片尺寸

並返回 JSON 格式的結果
```

**我會做:**
- 使用 `browser_evaluate_Playwright` 或 `evaluate_script_chrome-devtools`
- 執行自定義 JavaScript 代碼
- 返回結果

### 步驟 5: 截圖

**你應該說:**
```
請對 Responsively App 中的遊戲頁面進行截圖，保存為 PNG 格式，
文件名為 iphone14-game-screenshot.png
```

**我會做:**
- 使用 `browser_take_screenshot_Playwright` 或 `take_screenshot_chrome-devtools`
- 保存截圖文件

---

## 💡 最佳實踐

### ✅ 好的溝通方式

```
✅ "請幫我在 Responsively App 中設置 iPhone 14 (390×844px)，
   然後獲取遊戲頁面的控制台日誌，特別是 [v20.0] 和 [v18.0] 的日誌。
   最後生成一個 JSON 報告。"

✅ "我想要獲取 iPhone 14 上遊戲的以下信息：
   1. 卡片尺寸
   2. 列數
   3. 間距
   請使用 JavaScript 執行並返回 JSON 格式。"

✅ "請執行以下操作：
   1. 啟動 Responsively App
   2. 設置 iPhone 14 設備
   3. 加載遊戲
   4. 點擊第一張卡片
   5. 獲取卡片信息
   6. 截圖並保存"
```

### ❌ 不好的溝通方式

```
❌ "幫我看看 iPhone 14 上的遊戲"
   (太模糊，不知道要做什麼)

❌ "獲取所有信息"
   (不清楚需要哪些信息)

❌ "修復遊戲"
   (沒有具體的操作步驟)

❌ "檢查一下"
   (沒有明確的目標)
```

---

## 📊 常見操作示例

### 示例 1: 獲取遊戲狀態

```
請在 Responsively App 中執行以下 JavaScript 代碼，獲取遊戲狀態：

const gameState = {
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio
  },
  cards: {
    count: document.querySelectorAll('[data-card]').length,
    size: document.querySelector('[data-card]')?.getBoundingClientRect()
  },
  columns: Math.floor(window.innerWidth / cardWidth)
};

返回 JSON 格式的結果。
```

### 示例 2: 監控性能

```
請在 Responsively App 中收集以下性能指標：
- FPS (幀率)
- 內存使用
- 加載時間
- 渲染時間

並生成性能報告。
```

### 示例 3: 測試不同設備

```
請在 Responsively App 中依次測試以下設備，
並為每個設備生成報告：
1. iPhone 14 (390×844px)
2. iPhone 13 (390×844px)
3. iPhone SE (375×667px)
4. iPad (768×1024px)

對比它們的遊戲表現。
```

---

## 🎯 快速參考

### 獲取信息
- **頁面結構**: `browser_snapshot_Playwright`
- **控制台日誌**: `browser_console_messages_Playwright`
- **遊戲數據**: `browser_evaluate_Playwright` + JavaScript
- **截圖**: `browser_take_screenshot_Playwright`

### 執行操作
- **點擊**: `browser_click_Playwright`
- **懸停**: `browser_hover_Playwright`
- **輸入**: `browser_type_Playwright`
- **選擇**: `browser_select_option_Playwright`

### 啟動應用
- **啟動**: `launch-process`
- **讀取輸出**: `read-process`
- **寫入輸入**: `write-process`

### 文件操作
- **查看**: `view`
- **編輯**: `str-replace-editor`
- **保存**: `save-file`

---

## 📞 需要幫助？

如果你不確定如何表達需求，可以：

1. **描述你的目標**
   - "我想要獲取 iPhone 14 上的遊戲信息"

2. **列出具體步驟**
   - "1. 啟動應用 2. 設置設備 3. 加載遊戲 4. 獲取數據"

3. **說明期望結果**
   - "返回 JSON 格式的報告"

4. **提供上下文**
   - "設備: iPhone 14, URL: ..., 特別關注: [v20.0] 日誌"

---

**記住**: 越具體越好！提供清晰的步驟和期望結果，我就能準確地幫助你。

祝你使用愉快！ 🚀

