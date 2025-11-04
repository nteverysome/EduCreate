# Chrome DevTools MCP 測試指南

## ✅ 升級完成

- **Node.js 版本**: v20.19.0 ✅
- **npm 版本**: 10.8.2 ✅
- **Chrome DevTools MCP**: 已配置 ✅
- **配置文件**: `claude_desktop_config.json` ✅

## 🚀 後續步驟

### 1. 重啟 Augment 或 Claude Desktop
升級 Node.js 後，需要重啟應用程序以加載新版本。

### 2. 在 Augment 中測試 Chrome DevTools MCP

在 Augment 的對話框中輸入以下提示之一：

#### 測試 1：性能分析
```
Check the performance of https://developers.chrome.com
```

#### 測試 2：截圖
```
Take a screenshot of https://example.com
```

#### 測試 3：網絡分析
```
Navigate to https://github.com and list all network requests
```

#### 測試 4：控制台檢查
```
Go to https://example.com and check the browser console for any errors
```

### 3. 預期結果

Chrome DevTools MCP 應該會：
1. ✅ 自動啟動 Chrome 瀏覽器
2. ✅ 執行指定的操作（導航、截圖、性能分析等）
3. ✅ 返回結果和分析

## 🔧 配置詳情

### claude_desktop_config.json 中的 Chrome DevTools 配置

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": [
      "-y",
      "chrome-devtools-mcp@latest"
    ],
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### 可用的 Chrome DevTools MCP 工具

#### 輸入自動化 (8 個工具)
- click - 點擊元素
- drag - 拖動元素
- fill - 填充表單字段
- fill_form - 填充多個表單字段
- handle_dialog - 處理對話框
- hover - 懸停在元素上
- press_key - 按下鍵盤按鍵
- upload_file - 上傳文件

#### 導航自動化 (6 個工具)
- close_page - 關閉頁面
- list_pages - 列出所有頁面
- navigate_page - 導航到 URL
- new_page - 打開新頁面
- select_page - 選擇頁面
- wait_for - 等待條件

#### 模擬 (2 個工具)
- emulate - 模擬設備
- resize_page - 調整頁面大小

#### 性能 (3 個工具)
- performance_analyze_insight - 分析性能
- performance_start_trace - 開始性能追蹤
- performance_stop_trace - 停止性能追蹤

#### 網絡 (2 個工具)
- get_network_request - 獲取網絡請求
- list_network_requests - 列出所有網絡請求

#### 調試 (5 個工具)
- evaluate_script - 執行 JavaScript
- get_console_message - 獲取控制台消息
- list_console_messages - 列出所有控制台消息
- take_screenshot - 截圖
- take_snapshot - 獲取頁面快照

## 🐛 故障排除

### 如果 Chrome DevTools MCP 仍然顯示紅燈

1. **檢查 Node.js 版本**
   ```powershell
   node --version  # 應該是 v20.19.0 或更新
   ```

2. **檢查 Chrome 是否已安裝**
   ```powershell
   # Chrome 應該安裝在以下位置之一：
   # C:\Program Files\Google\Chrome\Application\chrome.exe
   # C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
   ```

3. **重啟 Augment/Claude Desktop**
   - 完全關閉應用程序
   - 等待 30 秒
   - 重新打開

4. **查看日誌**
   - 在 Augment 中查看 MCP 服務器狀態
   - 檢查是否有錯誤消息

### 常見問題

**Q: Chrome DevTools MCP 無法啟動 Chrome**
A: 確保 Chrome 已安裝。如果使用自定義路徑，可以在配置中添加 `--executablePath` 參數。

**Q: 性能分析失敗**
A: 確保網站可以訪問。某些網站可能有安全限制。

**Q: 截圖為空或不完整**
A: 嘗試增加等待時間或調整視口大小。

## 📚 更多資源

- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Chrome DevTools 文檔](https://developer.chrome.com/docs/devtools/)
- [MCP 協議文檔](https://modelcontextprotocol.io/)

## ✨ 完成清單

- [x] Node.js 升級到 v20.19.0
- [x] Chrome DevTools MCP 配置添加
- [x] 配置文件驗證
- [ ] 重啟 Augment/Claude Desktop
- [ ] 在 Augment 中測試 Chrome DevTools MCP

