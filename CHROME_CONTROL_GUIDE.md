# 🚨 Chrome 控制操作指南

## ⚠️ 重要提醒：正確的操作方式

### ❌ 錯誤方式（會啟動新 Chromium）
```javascript
// 這些 MCP 工具會啟動新瀏覽器！
mcp_Playwright_playwright_navigate()
mcp_Playwright_playwright_click()
mcp_Playwright_playwright_fill()
```

### ✅ 正確方式（連接現有 Chrome）

#### 方法 1：使用統一控制器（推薦）
```bash
# 查看 Chrome 狀態
node chrome-controller.js status

# 導航到指定頁面
node chrome-controller.js navigate https://edu-create.vercel.app

# 截圖
node chrome-controller.js screenshot my-screenshot.png

# 點擊元素
node chrome-controller.js click "button[data-testid='login']"
```

#### 方法 2：僅監控狀態
```javascript
// 只能查看，不能控制
mcp_Playwright_playwright_get("http://localhost:9222/json")
```

## 🎯 標準操作流程

### 1. 檢查 Chrome 狀態
```bash
node chrome-controller.js status
```

### 2. 執行操作
```bash
# 導航
node chrome-controller.js navigate https://edu-create.vercel.app

# 截圖記錄
node chrome-controller.js screenshot operation-result.png
```

### 3. 獲取結果
操作完成後會自動顯示頁面資訊和狀態

## 🔧 故障排除

### Chrome 未啟動 DevTools Protocol
```bash
# 重新啟動 Chrome（關閉所有 Chrome 視窗後執行）
chrome --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug"
```

### 連接失敗
1. 確認 Chrome 正在運行
2. 確認端口 9222 未被佔用
3. 檢查防火牆設置

## 📋 快速參考

| 需求 | 命令 |
|------|------|
| 查看狀態 | `node chrome-controller.js status` |
| 導航頁面 | `node chrome-controller.js navigate [url]` |
| 截圖 | `node chrome-controller.js screenshot [filename]` |
| 點擊元素 | `node chrome-controller.js click [selector]` |

## 🎯 記住：永遠使用 chrome-controller.js，不要使用 MCP Playwright 工具進行控制操作！