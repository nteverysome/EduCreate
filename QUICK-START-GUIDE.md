# 🚀 Chrome DevTools MCP 快速開始指南

## ✅ 安裝完成

所有必要的軟件和配置已安裝完成：

| 項目 | 版本 | 狀態 |
|------|------|------|
| Node.js | v20.19.0 | ✅ |
| npm | 10.8.2 | ✅ |
| .NET Framework | 4.8 | ✅ |
| Chrome DevTools MCP | Latest | ✅ |

---

## 🔄 重啟步驟（必須執行）

### 方案 A：重啟計算機（推薦）
```powershell
Restart-Computer
```

### 方案 B：只重啟應用程序

1. **關閉 VS Code**
   - Ctrl+Shift+P → "Developer: Reload Window"
   - 或完全關閉並重新打開

2. **關閉 Augment/Claude Desktop**
   - 完全關閉應用
   - 等待 30 秒
   - 重新打開

---

## 🧪 測試 Chrome DevTools MCP

### 步驟 1：打開 Augment

### 步驟 2：輸入測試提示

複製以下提示之一到 Augment：

```
Check the performance of https://developers.chrome.com
```

### 步驟 3：觀察結果

Chrome DevTools MCP 應該會：
1. 自動啟動 Chrome 瀏覽器
2. 訪問該網站
3. 記錄性能數據
4. 返回分析結果

### 預期輸出

```
✅ Chrome browser launched
✅ Navigated to https://developers.chrome.com
✅ Performance trace recorded
✅ Analysis complete

Performance Metrics:
- LCP: X.XXs
- FID: X.XXms
- CLS: X.XX
```

---

## 🎯 其他測試提示

### 截圖測試
```
Take a screenshot of https://example.com
```

### 網絡分析
```
Navigate to https://github.com and list all network requests
```

### 控制台檢查
```
Go to https://example.com and check the browser console for any errors
```

### 表單填充
```
Go to https://example.com and fill the search form with "test"
```

---

## 🔴 如果仍然顯示紅燈

### 快速檢查

1. **驗證 Node.js**
   ```powershell
   node --version  # 應該是 v20.19.0+
   ```

2. **驗證 .NET Framework**
   ```powershell
   # 檢查註冊表
   Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full' -Name Release
   # 應該返回 394802 或更高
   ```

3. **驗證 Chrome**
   ```powershell
   Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe"
   # 應該返回 True
   ```

### 常見解決方案

| 問題 | 解決方案 |
|------|--------|
| 紅燈不消失 | 重啟計算機 |
| Chrome 無法啟動 | 確保 Chrome 已安裝 |
| 性能分析失敗 | 檢查網絡連接 |
| PowerShell 仍報錯 | 重啟計算機 |

---

## 📞 需要幫助？

如果遇到問題，請提供：

1. 錯誤消息的完整文本
2. 你嘗試的測試提示
3. 系統信息（Node.js 版本、.NET Framework 版本等）

---

## 📚 更多資源

- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Chrome DevTools 文檔](https://developer.chrome.com/docs/devtools/)
- [MCP 協議](https://modelcontextprotocol.io/)

---

## ✨ 完成清單

- [x] 軟件安裝完成
- [x] 配置完成
- [ ] 重啟應用程序
- [ ] 測試 Chrome DevTools MCP
- [ ] 開始使用！

**準備好了嗎？重啟應用程序，然後開始測試吧！** 🎉

