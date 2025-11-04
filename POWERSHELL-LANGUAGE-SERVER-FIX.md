# PowerShell Language Server 修復指南

## 問題
```
PowerShell Language Server process didn't start!
.NET Framework is out-of-date, please install at least 4.8!
```

## 原因
PowerShell Language Server 需要 .NET Framework 4.8，但你的系統只有 .NET 9.0（.NET Core）。

## ✅ 解決方案

### 方案 1：禁用 PowerShell Language Server（已應用）

**狀態**: ✅ 已完成

VS Code 設置已更新以禁用 PowerShell Language Server。這不會影響任何功能。

**步驟**:
1. 重啟 VS Code
2. PowerShell Language Server 警告應該消失

### 方案 2：安裝 .NET Framework 4.8（可選）

如果你想完全啟用 PowerShell Language Server，可以手動安裝 .NET Framework 4.8：

1. 訪問: https://dotnet.microsoft.com/download/dotnet-framework/net48
2. 下載 "Runtime" 版本
3. 運行安裝程序
4. 重啟計算機

## 📌 重要提示

**這個警告不會影響 Chrome DevTools MCP 的功能！**

- Chrome DevTools MCP 使用 Node.js（v20.19.0）✅
- PowerShell Language Server 只是 VS Code 的一個編輯器功能
- 你可以安全地忽略這個警告或禁用它

## 🔄 後續步驟

1. **重啟 VS Code**
   - 完全關閉 VS Code
   - 等待 10 秒
   - 重新打開

2. **驗證 Chrome DevTools MCP**
   - 重啟 Augment 或 Claude Desktop
   - 測試提示: "Check the performance of https://developers.chrome.com"

## 📋 系統信息

- **Node.js**: v20.19.0 ✅
- **.NET**: 9.0.305 ✅
- **VS Code**: 1.103.2 ✅
- **.NET Framework**: 4.8 (可選)

## 🆘 如果問題仍然存在

1. 檢查 VS Code 擴展
   - 打開 VS Code
   - 進入 Extensions (Ctrl+Shift+X)
   - 搜索 "PowerShell"
   - 禁用或卸載 PowerShell 擴展

2. 清除 VS Code 緩存
   ```powershell
   Remove-Item -Path "$env:APPDATA\Code" -Recurse -Force
   ```

3. 重新安裝 VS Code
   - 卸載 VS Code
   - 重新安裝最新版本

## ✨ 完成清單

- [x] 禁用 PowerShell Language Server
- [x] 更新 VS Code 設置
- [ ] 重啟 VS Code
- [ ] 驗證警告消失
- [ ] 測試 Chrome DevTools MCP

