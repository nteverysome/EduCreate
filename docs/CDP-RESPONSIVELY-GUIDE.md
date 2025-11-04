# Chrome DevTools Protocol (CDP) 操作 Responsively App 指南

## 📋 概述

本指南介紹如何使用 **Chrome DevTools Protocol (CDP)** 來操作和控制 Responsively App，實現完整的自動化測試和數據收集。

---

## 🎯 CDP 的優勢

| 功能 | 說明 |
|------|------|
| **設備模擬** | 精確模擬 iPhone 14 的視口、DPR、用戶代理 |
| **視口控制** | 動態設置和改變視口尺寸 |
| **事件監聽** | 監聽所有頁面事件、網絡請求、控制台消息 |
| **JavaScript 執行** | 在頁面上下文中執行任意代碼 |
| **性能監控** | 獲取性能指標、FPS、內存使用 |
| **截圖** | 高質量截圖和視頻錄製 |
| **DOM 操作** | 查詢和修改 DOM 元素 |
| **網絡控制** | 模擬網絡條件、攔截請求 |

---

## 🚀 快速開始

### 步驟 1: 啟動 Responsively App 並啟用 CDP

```powershell
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-with-cdp.ps1
```

**或者手動啟動:**

```powershell
$responsivelyPath = "C:\Users\Administrator\AppData\Local\Programs\ResponsivelyApp\ResponsivelyApp.exe"
$gameUrl = "https://edu-create.vercel.app/games/switcher?game=match-up-game&activityId=cmh93tjuh0001l404hszkdf94&layout=mixed&itemsPerPage=20"

& $responsivelyPath --remote-debugging-port=9222 $gameUrl
```

### 步驟 2: 運行 CDP 控制器

在另一個終端中運行:

```bash
node scripts/cdp-responsively-controller.js
```

### 步驟 3: 查看結果

- 控制台輸出會顯示所有日誌
- 報告會保存到 `reports/cdp-responsively-report.json`

---

## 📊 CDP 控制器功能

### `scripts/cdp-responsively-controller.js`

**功能:**
1. ✅ 連接到 Responsively App 的 CDP 端點
2. ✅ 設置 iPhone 14 設備模擬 (390×844px, DPR=3)
3. ✅ 設置正確的用戶代理
4. ✅ 導航到遊戲 URL
5. ✅ 監聽和收集控制台日誌
6. ✅ 獲取頁面信息和遊戲狀態
7. ✅ 生成詳細報告

**輸出:**
```
✅ 已連接到 Responsively App
✅ 設備模擬已設置: 390×844px (DPR: 3)
✅ 用戶代理已設置
✅ 頁面已導航
✅ 頁面加載完成

📊 頁面信息:
  • 標題: EduCreate
  • URL: https://edu-create.vercel.app/games/switcher?...
  • 寬度: 390px
  • 高度: 844px
  • DPR: 3

🎯 目標控制台日誌:
  [1] [LOG] 🔥 [v18.0] 動態列數計算: itemCount=20, cols=5
  [2] [LOG] 📱 [v20.0] 設備尺寸和寬高比詳細信息: {...}

💾 報告已保存: reports/cdp-responsively-report.json
```

---

## 🔧 進階用法

### 自定義 CDP 命令

你可以修改 `cdp-responsively-controller.js` 來執行自定義操作:

#### 1. 執行 JavaScript

```javascript
const result = await Runtime.evaluate({
  expression: `({
    cardCount: document.querySelectorAll('.card').length,
    gameState: window.gameState
  })`
});
```

#### 2. 模擬用戶交互

```javascript
// 點擊卡片
await Runtime.evaluate({
  expression: `document.querySelector('.card').click()`
});

// 等待
await new Promise(resolve => setTimeout(resolve, 1000));
```

#### 3. 設置視口尺寸

```javascript
await Emulation.setDeviceMetricsOverride({
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  mobile: true,
  hasTouch: true
});
```

#### 4. 模擬網絡條件

```javascript
await Network.emulateNetworkConditions({
  offline: false,
  downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
  uploadThroughput: 750 * 1024 / 8,          // 750 Kbps
  latency: 40                                  // 40ms
});
```

#### 5. 截圖

```javascript
const screenshot = await Page.captureScreenshot({
  format: 'png',
  quality: 100
});

fs.writeFileSync('screenshot.png', Buffer.from(screenshot.data, 'base64'));
```

---

## 📝 CDP 端點信息

### 連接參數

```javascript
const CDP = require('chrome-remote-interface');

const client = await CDP({
  port: 9222,           // CDP 端口
  host: 'localhost',    // 主機
  timeout: 10000        // 超時時間 (ms)
});
```

### 可用的 CDP 域

| 域 | 功能 |
|----|------|
| **Page** | 頁面導航、截圖、打印 |
| **Runtime** | JavaScript 執行、對象檢查 |
| **Emulation** | 設備模擬、網絡模擬 |
| **Network** | 網絡請求、用戶代理 |
| **Console** | 控制台消息 |
| **DOM** | DOM 查詢、修改 |
| **CSS** | CSS 查詢、修改 |
| **Performance** | 性能指標 |
| **Debugger** | 斷點、單步執行 |

---

## 🐛 故障排除

### 問題 1: 無法連接到 CDP 端口

**症狀:**
```
Error: connect ECONNREFUSED 127.0.0.1:9222
```

**解決方案:**
1. 確保 Responsively App 已啟動
2. 確保使用了 `--remote-debugging-port=9222` 參數
3. 檢查端口 9222 是否被其他進程佔用
4. 嘗試使用不同的端口

### 問題 2: 設備模擬不生效

**症狀:**
```
視口尺寸不是 390×844px
```

**解決方案:**
1. 確保 `Emulation.setDeviceMetricsOverride()` 已調用
2. 檢查 Responsively App 中的設備設置
3. 刷新頁面後重試

### 問題 3: 控制台日誌未收集

**症狀:**
```
未找到目標日誌
```

**解決方案:**
1. 確保 `Console.enable()` 已調用
2. 確保 `Console.messageAdded()` 監聽器已設置
3. 等待足夠的時間讓頁面加載
4. 檢查遊戲是否正確加載

---

## 📊 報告格式

生成的報告 (`reports/cdp-responsively-report.json`) 包含:

```json
{
  "timestamp": "2025-11-02T...",
  "method": "Chrome DevTools Protocol (CDP)",
  "specs": {
    "width": 390,
    "height": 844,
    "devicePixelRatio": 3,
    "userAgent": "Mozilla/5.0 (iPhone; ...)"
  },
  "pageInfo": {
    "title": "EduCreate",
    "url": "https://edu-create.vercel.app/...",
    "viewport": {
      "innerWidth": 390,
      "innerHeight": 844,
      "devicePixelRatio": 3
    },
    "gameState": {
      "cardCount": 20,
      "containerWidth": 390,
      "containerHeight": 844
    }
  },
  "targetLogs": [
    {
      "type": "log",
      "text": "🔥 [v18.0] 動態列數計算: itemCount=20, cols=5",
      "timestamp": "2025-11-02T..."
    }
  ],
  "allLogs": [...]
}
```

---

## 🎯 使用場景

### 場景 1: 自動化測試

```bash
# 啟動 Responsively App
powershell -ExecutionPolicy Bypass -File scripts/launch-responsively-with-cdp.ps1

# 在另一個終端運行測試
node scripts/cdp-responsively-controller.js
```

### 場景 2: 性能監控

修改 `cdp-responsively-controller.js` 添加性能監控:

```javascript
const metrics = await Performance.getMetrics();
console.log('性能指標:', metrics);
```

### 場景 3: 網絡模擬

```javascript
await Network.emulateNetworkConditions({
  offline: false,
  downloadThroughput: 1.6 * 1024 * 1024 / 8,
  uploadThroughput: 750 * 1024 / 8,
  latency: 40
});
```

---

## 📚 相關資源

- [Chrome DevTools Protocol 文檔](https://chromedevtools.github.io/devtools-protocol/)
- [chrome-remote-interface 文檔](https://github.com/cyrus-and/chrome-remote-interface)
- [Responsively App 官網](https://responsively.app/)
- [Phaser 3 文檔](https://photonstorm.github.io/phaser3-docs/)

---

## ✅ 檢查清單

- [ ] Responsively App 已安裝
- [ ] `chrome-remote-interface` 已安裝 (`npm list chrome-remote-interface`)
- [ ] `scripts/launch-responsively-with-cdp.ps1` 已創建
- [ ] `scripts/cdp-responsively-controller.js` 已創建
- [ ] 已成功啟動 Responsively App 並啟用 CDP
- [ ] 已成功連接到 CDP 端點
- [ ] 已收集到控制台日誌
- [ ] 已生成報告

---

**最後更新**: 2025-11-02

