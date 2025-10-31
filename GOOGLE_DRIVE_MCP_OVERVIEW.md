# Google Drive MCP 項目概覽

## 🎯 項目目標

為 EduCreate 項目創建一個完整的 **Google Drive MCP 服務器**，支持：
- ✅ Google Drive 文件操作
- ✅ 瀏覽器自動化（類似 Playwright）
- ✅ 詳細的錯誤處理和報告

## 📦 交付物

### 1. 完整的 MCP 服務器
```
google-drive-mcp/
├── src/                    # 源代碼
│   ├── index.ts           # MCP 服務器主入口
│   ├── error-handler.ts   # 錯誤處理系統
│   ├── google-drive-client.ts  # Google Drive 客戶端
│   └── browser-tools.ts   # 瀏覽器工具
├── dist/                  # 編譯後的代碼（需要構建）
├── examples/              # 使用示例
├── package.json           # 項目依賴
├── tsconfig.json          # TypeScript 配置
└── .env.example           # 環境配置示例
```

### 2. 12 個可用工具

**Google Drive 工具 (5 個):**
- `gdrive_list_files` - 列出文件
- `gdrive_get_file` - 獲取文件信息
- `gdrive_upload_file` - 上傳文件
- `gdrive_delete_file` - 刪除文件
- `gdrive_create_folder` - 創建文件夾

**瀏覽器工具 (7 個):**
- `browser_launch` - 啟動瀏覽器
- `browser_navigate` - 導航到 URL
- `browser_click` - 點擊元素
- `browser_type` - 輸入文本
- `browser_screenshot` - 截圖
- `browser_snapshot` - 獲取頁面快照
- `browser_close` - 關閉瀏覽器

### 3. 完整的文檔

| 文檔 | 用途 | 行數 |
|------|------|------|
| README.md | 完整 API 參考 | ~300 |
| SETUP_GUIDE.md | 詳細設置指南 | ~300 |
| QUICK_START.md | 5 分鐘快速開始 | ~200 |
| INTEGRATION_GUIDE.md | 與 EduCreate 集成 | ~300 |
| examples/basic-usage.md | 使用示例 | ~400 |
| GOOGLE_DRIVE_MCP_SUMMARY.md | 項目總結 | ~300 |
| GOOGLE_DRIVE_MCP_CHECKLIST.md | 完成清單 | ~300 |

### 4. MCP 配置更新

已更新 `claude_desktop_config.json`，添加 Google Drive MCP 服務器配置。

## 🚀 快速開始 (5 分鐘)

### 1. 安裝依賴
```bash
cd google-drive-mcp
npm install
npm run build
```

### 2. 設置 Google Service Account
1. 訪問 [Google Cloud Console](https://console.cloud.google.com)
2. 創建項目 → 啟用 Google Drive API
3. 創建 Service Account → 下載 JSON 金鑰
4. 保存到 `google-drive-mcp/credentials/service-account-key.json`

### 3. 配置環境
```bash
cp .env.example .env
# 編輯 .env，設置 GOOGLE_SERVICE_ACCOUNT_KEY_PATH
```

### 4. 重啟 Claude Desktop
完全關閉並重新打開 Claude Desktop。

### 5. 在 Claude 中使用
```
使用 gdrive_list_files 工具列出我的 Google Drive 文件
```

## 📚 文檔導航

### 新手入門
👉 **開始這裡**: [QUICK_START.md](./google-drive-mcp/QUICK_START.md)
- 5 分鐘快速設置
- 基本功能測試
- 常見問題解答

### 詳細設置
👉 **詳細步驟**: [SETUP_GUIDE.md](./google-drive-mcp/SETUP_GUIDE.md)
- Google Cloud 項目設置
- Service Account 創建
- 環境配置
- 故障排除

### API 參考
👉 **完整 API**: [README.md](./google-drive-mcp/README.md)
- 功能特性
- 工具參考
- 錯誤代碼
- 安全建議

### 使用示例
👉 **代碼示例**: [examples/basic-usage.md](./google-drive-mcp/examples/basic-usage.md)
- Google Drive 操作示例
- 瀏覽器自動化示例
- 錯誤處理示例
- 組合工作流程

### 集成指南
👉 **EduCreate 集成**: [INTEGRATION_GUIDE.md](./google-drive-mcp/INTEGRATION_GUIDE.md)
- 項目結構
- 集成步驟
- 代碼示例
- 部署指南

## 🔧 核心特性

### 1. Google Drive 集成
- 完整的 Google Drive API 支持
- 文件列表、上傳、下載、刪除
- 文件夾管理
- 錯誤處理

### 2. 瀏覽器自動化
- 基於 Playwright 的瀏覽器控制
- 導航、點擊、輸入、截圖
- 頁面快照和可訪問性樹
- 完整的錯誤報告

### 3. 錯誤處理
- 詳細的錯誤報告（類似 Playwright）
- 堆棧跟蹤
- 上下文信息
- 截圖捕捉
- 結構化錯誤代碼

### 4. MCP 集成
- 完整的 MCP 服務器實現
- 工具定義和請求處理
- Stdio 傳輸支持
- 與 Claude Desktop 無縫集成

## 💡 使用示例

### 在 Claude 中使用

```
1. 列出 Google Drive 文件
   使用 gdrive_list_files 工具列出我的 Google Drive 文件

2. 上傳文件
   使用 gdrive_upload_file 工具上傳文件 /path/to/file.pdf 到 Google Drive

3. 瀏覽器自動化
   1. 使用 browser_launch 啟動瀏覽器
   2. 使用 browser_navigate 訪問 https://example.com
   3. 使用 browser_screenshot 截圖
   4. 使用 browser_close 關閉瀏覽器

4. 組合工作流程
   1. 啟動瀏覽器
   2. 訪問網站
   3. 截圖
   4. 上傳到 Google Drive
   5. 關閉瀏覽器
```

### 在 EduCreate 中集成

```typescript
// 上傳用戶文件
const result = await mcpClient.call('gdrive_upload_file', {
  filePath: '/path/to/file.pdf',
  fileName: 'user-document.pdf'
});

// 進行自動化測試
await mcpClient.call('browser_launch', { headless: true });
await mcpClient.call('browser_navigate', { url: 'http://localhost:3000' });
const screenshot = await mcpClient.call('browser_screenshot', {
  path: '/tmp/test.png'
});
await mcpClient.call('browser_close', {});
```

## 🔐 安全考慮

1. **保護金鑰文件**
   ```bash
   chmod 600 credentials/service-account-key.json
   ```

2. **使用環境變數**
   - 不要在代碼中硬編碼金鑰
   - 使用 `.env` 文件

3. **限制權限**
   - 在 Google Cloud 中限制 Service Account 權限
   - 只授予必要的 Drive 訪問權限

4. **定期輪換金鑰**
   - 每 90 天創建新金鑰
   - 刪除舊金鑰

## 📊 項目統計

| 項目 | 數量 |
|------|------|
| 源代碼文件 | 4 個 |
| 配置文件 | 3 個 |
| 文檔文件 | 7 個 |
| 可用工具 | 12 個 |
| 代碼行數 | ~869 行 |
| 文檔行數 | ~2000+ 行 |

## 🎯 下一步

### 立即可做
1. ✅ 安裝依賴
2. ✅ 設置 Google Service Account
3. ✅ 配置環境
4. ✅ 重啟 Claude Desktop
5. ✅ 測試工具

### 後續步驟
1. 📋 在 EduCreate 中集成
2. 📋 創建自定義工作流程
3. 📋 部署到生產環境
4. 📋 監控和維護

## 📞 需要幫助?

### 快速問題
- 見 [QUICK_START.md](./google-drive-mcp/QUICK_START.md) 的常見問題

### 設置問題
- 見 [SETUP_GUIDE.md](./google-drive-mcp/SETUP_GUIDE.md) 的故障排除

### 使用問題
- 見 [examples/basic-usage.md](./google-drive-mcp/examples/basic-usage.md) 的示例

### 集成問題
- 見 [INTEGRATION_GUIDE.md](./google-drive-mcp/INTEGRATION_GUIDE.md) 的集成指南

## 📄 文件清單

### 核心文件
- ✅ `google-drive-mcp/src/index.ts`
- ✅ `google-drive-mcp/src/error-handler.ts`
- ✅ `google-drive-mcp/src/google-drive-client.ts`
- ✅ `google-drive-mcp/src/browser-tools.ts`

### 配置文件
- ✅ `google-drive-mcp/package.json`
- ✅ `google-drive-mcp/tsconfig.json`
- ✅ `google-drive-mcp/.env.example`
- ✅ `claude_desktop_config.json` (已更新)

### 文檔文件
- ✅ `google-drive-mcp/README.md`
- ✅ `google-drive-mcp/SETUP_GUIDE.md`
- ✅ `google-drive-mcp/QUICK_START.md`
- ✅ `google-drive-mcp/INTEGRATION_GUIDE.md`
- ✅ `google-drive-mcp/examples/basic-usage.md`
- ✅ `GOOGLE_DRIVE_MCP_SUMMARY.md`
- ✅ `GOOGLE_DRIVE_MCP_CHECKLIST.md`
- ✅ `GOOGLE_DRIVE_MCP_OVERVIEW.md` (本文件)

## 🎓 學習資源

- [Google Drive API 文檔](https://developers.google.com/drive/api)
- [Playwright 文檔](https://playwright.dev)
- [MCP 規範](https://modelcontextprotocol.io)
- [Claude 文檔](https://claude.ai/docs)

---

**Google Drive MCP 項目完成! 🚀**

所有文件已準備就緒。請從 [QUICK_START.md](./google-drive-mcp/QUICK_START.md) 開始。

