# mcp-feedback-collector Node.js 版本安裝和配置指南

## 📋 概述

Node.js 版本的 mcp-feedback-collector 是一個功能更強大的反饋收集工具，相比 Python 版本有以下優勢：

### ✅ 優勢
- 🚀 **更穩定**：解決了 Python 版本的穩定性問題
- 🌐 **Web 界面**：基於 Web 的現代化界面，無需 tkinter
- 🔧 **更易配置**：通過環境變量靈活配置
- 💬 **AI 對話**：集成 AI 助手，支持文字和圖片對話
- 📄 **圖片轉文字**：AI 智能圖片描述，提升兼容性
- 🎨 **現代設計**：VS Code 深色主題風格
- ⚡ **高性能**：支持 10 個並發連接
- 🔗 **遠程支持**：支持遠程服務器部署

---

## 🚀 安裝步驟

### 步驟 1：檢查環境

```powershell
# 檢查 Node.js 版本（需要 18.0.0+）
node --version
# 輸出：v18.19.0 ✅

# 檢查 npm 版本
npm --version
# 輸出：10.2.3 ✅
```

### 步驟 2：全局安裝

```powershell
# 全局安裝（推薦）
npm install -g mcp-feedback-collector

# 或使用 npx 直接運行（無需安裝）
npx mcp-feedback-collector
```

**安裝結果**：
```
✅ 已成功安裝
✅ 274 個依賴包
✅ 安裝時間：約 30 秒
```

### 步驟 3：驗證安裝

```powershell
# 檢查版本
mcp-feedback-collector --version

# 查看幫助
mcp-feedback-collector --help

# 健康檢查
mcp-feedback-collector health

# 顯示配置
mcp-feedback-collector config
```

---

## ⚙️ 配置方法

### 方法 1：環境變量配置（推薦）

創建 `.env` 文件：

```env
# AI API 配置
MCP_API_KEY="your_api_key_here"
MCP_API_BASE_URL="https://api.ssopen.top"
MCP_DEFAULT_MODEL="grok-3"

# Web 服務器配置
MCP_WEB_PORT="5000"
MCP_DIALOG_TIMEOUT="60000"  # 60000 秒（約 16.7 小時）

# 功能開關
MCP_ENABLE_CHAT="true"
MCP_ENABLE_IMAGE_TO_TEXT="true"

# URL 和端口優化配置
MCP_USE_FIXED_URL="true"
MCP_FORCE_PORT="false"
MCP_KILL_PORT_PROCESS="false"
MCP_CLEANUP_PORT_ON_START="true"
```

### 方法 2：Augment MCP 配置

如果 Augment 支持 MCP 服務器配置，可以嘗試以下配置：

```json
{
  "mcpServers": {
    "mcp-feedback-collector": {
      "command": "npx",
      "args": ["-y", "mcp-feedback-collector@latest"],
      "env": {
        "MCP_API_KEY": "your_api_key_here",
        "MCP_API_BASE_URL": "https://api.ssopen.top",
        "MCP_DEFAULT_MODEL": "grok-3",
        "MCP_WEB_PORT": "5050",
        "MCP_DIALOG_TIMEOUT": "60000",
        "MCP_ENABLE_IMAGE_TO_TEXT": "true"
      }
    }
  }
}
```

**配置位置**：
- 查找 Augment 的 MCP 配置文件
- 可能在 VS Code 設置中
- 或者 `.augment/mcp-config.json`

---

## 🔧 使用方法

### 命令行選項

```powershell
# 啟動服務器（默認）
mcp-feedback-collector

# 指定端口
mcp-feedback-collector --port 8080

# 僅 Web 模式
mcp-feedback-collector --web

# 測試 collect_feedback 功能
mcp-feedback-collector test-feedback

# 自定義測試內容
mcp-feedback-collector test-feedback -m "我的工作汇报" -t 120

# 健康檢查
mcp-feedback-collector health

# 顯示配置
mcp-feedback-collector config
```

### MCP 工具調用

```javascript
// 收集反饋
collect_feedback("我已經完成了代碼重構工作，主要改進了性能和可讀性。")

// 參數說明：
// - work_summary: AI 工作汇報內容（必需）
// - 超時時間通過環境變量 MCP_DIALOG_TIMEOUT 配置
```

---

## 🎨 功能特性

### 1. 雙標籤頁設計
- **工作汇報標籤**：顯示 AI 完成的工作
- **AI 對話標籤**：與 AI 助手實時對話

### 2. 多模態支持
- ✅ 文字反饋
- ✅ 圖片上傳
- ✅ 圖片轉文字（AI 描述）
- ✅ 文字 + 圖片組合

### 3. 智能提交
- 用戶可選擇提交後是否關閉頁面
- 3 秒倒計時自動關閉
- 支持取消提交

### 4. 實時通信
- WebSocket 連接狀態指示
- 自動重連機制
- 智能頁面刷新

### 5. MCP 標準日志
- 支持 8 個標準日志級別
- 客戶端動態控制日志級別
- 實時通知到 MCP 客戶端

---

## 🆕 最新功能（v2.1.3）

### 📋 MCP 標準日志功能
- ✅ 完整日志支持
- ✅ 多級別日志（debug, info, warning, error 等）
- ✅ 客戶端控制
- ✅ 實時通知
- ✅ 專業輸出（無表情符號）

### 🔧 智能端口衝突解決
- ✅ 自動檢測和解決端口衝突
- ✅ 漸進式進程終止
- ✅ 自進程識別
- ✅ 跨平台兼容
- ✅ 智能降級

### 🛡️ 優雅退出處理
- ✅ 完整信號處理
- ✅ 智能異常處理
- ✅ 防重複關閉
- ✅ 客戶端通知
- ✅ 資源清理

### 📄 圖片轉文字功能（v2.1.1）
- ✅ AI 智能圖片描述
- ✅ 解決客戶端兼容性問題
- ✅ 用戶可控轉換
- ✅ 可編輯描述
- ✅ 批量處理

---

## 📊 系統要求

### 最低要求
- **Node.js**：18.0.0 或更高
- **瀏覽器**：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **操作系統**：Windows 10+, macOS 10.15+, Ubuntu 18.04+

### 性能指標
- **啟動時間**：< 3 秒
- **內存使用**：< 100MB
- **響應時間**：< 2 秒
- **並發連接**：支持 10 個同時連接

---

## 🐛 故障排除

### 問題 1：WebSocket 連接失敗

```powershell
# 檢查服務器狀態
mcp-feedback-collector health

# 訪問測試頁面
# 打開瀏覽器：http://localhost:5000/test.html

# 查看瀏覽器控制台錯誤信息
```

### 問題 2：端口被占用

```powershell
# 檢查端口使用情況
netstat -an | Select-String ":5000"

# 使用其他端口
mcp-feedback-collector --port 5001

# 或設置環境變量
$env:MCP_WEB_PORT="5001"
mcp-feedback-collector
```

### 問題 3：API 密鑰錯誤

```powershell
# 檢查配置
mcp-feedback-collector config

# 設置環境變量
$env:MCP_API_KEY="your_key_here"
$env:MCP_API_BASE_URL="https://api.ssopen.top"
$env:MCP_DEFAULT_MODEL="grok-3"
```

### 問題 4：權限問題

```powershell
# 使用 npx 避免全局安裝權限問題
npx mcp-feedback-collector

# 或以管理員身份運行 PowerShell
```

---

## 🔗 與 Python 版本對比

| 特性 | Python 版本 | Node.js 版本 |
|------|------------|--------------|
| **GUI 依賴** | tkinter（需要圖形界面） | Web 界面（無需 GUI） |
| **穩定性** | 一般 | 優秀 ⭐ |
| **配置方式** | 環境變量 | 環境變量 + 配置文件 |
| **AI 對話** | ❌ 不支持 | ✅ 支持 |
| **圖片轉文字** | ❌ 不支持 | ✅ 支持 |
| **遠程部署** | ❌ 困難 | ✅ 支持 |
| **並發連接** | 1 個 | 10 個 |
| **啟動時間** | 較慢 | < 3 秒 ⭐ |
| **內存使用** | 較高 | < 100MB ⭐ |
| **跨平台** | 有限 | 完全支持 ⭐ |

**結論**：Node.js 版本在各方面都優於 Python 版本，強烈推薦使用。

---

## 📚 相關資源

- **GitHub 倉庫**：https://github.com/sanshao85/mcp-feedback-collector-web
- **NPM 包**：https://www.npmjs.com/package/mcp-feedback-collector
- **Python 版本**：https://github.com/sanshao85/mcp-feedback-collector
- **MCP 協議**：https://modelcontextprotocol.io/
- **API 中轉站**：https://api.ssopen.top/

---

## 🎯 下一步行動

### 立即行動
1. ✅ **已完成安裝**：Node.js 版本已成功安裝
2. 📝 **配置環境變量**：創建 `.env` 文件或設置環境變量
3. 🧪 **測試功能**：運行 `mcp-feedback-collector test-feedback`
4. 🔧 **配置 Augment**：如果 Augment 支持 MCP，添加配置

### 短期行動
1. 📚 **閱讀文檔**：查看完整的用戶指南和配置文檔
2. 🔍 **研究 Augment MCP**：了解 Augment 的 MCP 支持情況
3. 🛠️ **更新規則文件**：修改規則以使用正確的工具名稱

### 長期行動
1. 🚀 **部署到生產**：如果測試成功，部署到生產環境
2. 📊 **監控性能**：使用日志功能監控系統性能
3. 🤝 **反饋改進**：向項目提交問題和建議

---

**安裝狀態**：✅ 成功完成  
**版本**：v2.1.3  
**安裝時間**：2025-01-18  
**下一步**：配置環境變量並測試功能

