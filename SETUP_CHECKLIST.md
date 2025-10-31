# ✅ Google Service Account 設置檢查清單

## 📊 設置進度

```
[████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 20% 完成
```

---

## 🎯 第 1 階段: Google Cloud 項目設置

### 步驟 1.1: 創建項目
- [ ] 訪問 https://console.cloud.google.com
- [ ] 點擊項目選擇器
- [ ] 點擊 "新建項目"
- [ ] 輸入項目名稱: `EduCreate Google Drive`
- [ ] 點擊 "創建"
- [ ] 等待項目創建完成

**狀態:** ⏳ 等待中

---

### 步驟 1.2: 啟用 Google Drive API
- [ ] 進入 "API 和服務" > "庫"
- [ ] 搜索 "Google Drive API"
- [ ] 點擊 "Google Drive API"
- [ ] 點擊 "啟用" 按鈕
- [ ] 等待 API 啟用完成

**狀態:** ⏳ 等待中

---

## 🎯 第 2 階段: Service Account 創建

### 步驟 2.1: 創建 Service Account
- [ ] 進入 "API 和服務" > "憑據"
- [ ] 點擊 "+ 創建憑據"
- [ ] 選擇 "服務帳戶"
- [ ] 填寫服務帳戶名稱: `google-drive-mcp`
- [ ] 填寫描述: `MCP Server for Google Drive`
- [ ] 點擊 "創建並繼續"

**狀態:** ⏳ 等待中

---

### 步驟 2.2: 授予權限
- [ ] 選擇角色: **Editor**
- [ ] 點擊 "繼續"
- [ ] 點擊 "完成"
- [ ] 返回到憑據頁面

**狀態:** ⏳ 等待中

---

## 🎯 第 3 階段: 金鑰創建和下載

### 步驟 3.1: 創建 JSON 金鑰
- [ ] 在 "服務帳戶" 部分找到 `google-drive-mcp`
- [ ] 點擊服務帳戶的電子郵件地址
- [ ] 進入 "密鑰" 標籤
- [ ] 點擊 "添加密鑰" > "創建新密鑰"
- [ ] 選擇 **JSON** 格式
- [ ] 點擊 "創建"
- [ ] 金鑰文件自動下載

**狀態:** ⏳ 等待中

**下載文件位置:**
```
C:\Users\Administrator\Downloads\project-id-xxxxx.json
```

---

## 🎯 第 4 階段: 本地文件設置

### 步驟 4.1: 創建目錄結構
- [ ] 打開文件管理器
- [ ] 導航到: `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\`
- [ ] 創建新文件夾: `credentials`
- [ ] 最終路徑: `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\credentials\`

**狀態:** ⏳ 等待中

---

### 步驟 4.2: 複製和重命名金鑰文件
- [ ] 打開下載文件夾
- [ ] 找到下載的 JSON 文件
- [ ] 複製該文件
- [ ] 粘貼到 `credentials` 文件夾
- [ ] 重命名為: `service-account-key.json`

**最終路徑:**
```
C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\credentials\service-account-key.json
```

**狀態:** ⏳ 等待中

---

### 步驟 4.3: 創建 .env 文件
- [ ] 打開文本編輯器
- [ ] 創建新文件，內容:
  ```
  GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
  NODE_ENV=production
  BROWSER_HEADLESS=true
  LOG_LEVEL=info
  ```
- [ ] 保存為: `.env`
- [ ] 位置: `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\.env`

**狀態:** ⏳ 等待中

---

## 🎯 第 5 階段: 驗證設置

### 步驟 5.1: 驗證文件存在
- [ ] 打開命令提示符
- [ ] 運行命令:
  ```bash
  cd C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp
  dir credentials\
  ```
- [ ] 確認看到 `service-account-key.json`

**狀態:** ⏳ 等待中

---

### 步驟 5.2: 驗證 .env 文件
- [ ] 在同一目錄中運行:
  ```bash
  type .env
  ```
- [ ] 確認看到環境變數配置

**狀態:** ⏳ 等待中

---

## 🎯 第 6 階段: 安裝和構建

### 步驟 6.1: 安裝依賴
- [ ] 在命令提示符中運行:
  ```bash
  cd C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp
  npm install
  ```
- [ ] 等待安裝完成

**狀態:** ⏳ 等待中

---

### 步驟 6.2: 構建項目
- [ ] 運行命令:
  ```bash
  npm run build
  ```
- [ ] 確認構建成功（無錯誤）

**狀態:** ⏳ 等待中

---

## 🎯 第 7 階段: Claude Desktop 配置

### 步驟 7.1: 重啟 Claude Desktop
- [ ] 完全關閉 Claude Desktop
- [ ] 等待 30 秒
- [ ] 重新打開 Claude Desktop
- [ ] 等待 MCP 服務器連接

**狀態:** ⏳ 等待中

---

## 🎯 第 8 階段: 測試連接

### 步驟 8.1: 測試 Google Drive
- [ ] 在 Claude 中輸入:
  ```
  使用 gdrive_list_files 工具列出我的 Google Drive 文件
  ```
- [ ] 確認返回文件列表或詳細的錯誤報告

**狀態:** ⏳ 等待中

---

### 步驟 8.2: 測試瀏覽器
- [ ] 在 Claude 中輸入:
  ```
  使用 browser_launch 啟動瀏覽器
  ```
- [ ] 確認瀏覽器啟動成功

**狀態:** ⏳ 等待中

---

## 📊 整體進度

```
第 1 階段: Google Cloud 項目設置     [░░░░░░░░░░] 0%
第 2 階段: Service Account 創建      [░░░░░░░░░░] 0%
第 3 階段: 金鑰創建和下載            [░░░░░░░░░░] 0%
第 4 階段: 本地文件設置              [░░░░░░░░░░] 0%
第 5 階段: 驗證設置                  [░░░░░░░░░░] 0%
第 6 階段: 安裝和構建                [░░░░░░░░░░] 0%
第 7 階段: Claude Desktop 配置       [░░░░░░░░░░] 0%
第 8 階段: 測試連接                  [░░░░░░░░░░] 0%

總進度: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```

---

## 🆘 遇到問題?

### 常見問題和解決方案

| 問題 | 解決方案 |
|------|--------|
| 找不到項目選擇器 | 在頁面左上角，Google Cloud 標誌旁邊 |
| Google Drive API 找不到 | 確保在 "庫" 頁面搜索 |
| 金鑰文件下載失敗 | 檢查瀏覽器下載設置 |
| 文件夾創建失敗 | 使用管理員權限打開文件管理器 |
| npm install 失敗 | 確保 Node.js 已安裝，運行 `node -v` |
| 構建失敗 | 檢查 TypeScript 錯誤，查看 `npm run build` 輸出 |

---

## 📞 需要幫助?

1. 查看 [BROWSER_SETUP_GUIDE.md](./BROWSER_SETUP_GUIDE.md) 詳細步驟
2. 查看 [google-drive-mcp/SETUP_GUIDE.md](./google-drive-mcp/SETUP_GUIDE.md) 故障排除
3. 查看 Google Cloud 文檔: https://cloud.google.com/docs

---

## ✨ 完成後

設置完成後，您將能夠:

- ✅ 使用 Google Drive 工具
- ✅ 使用瀏覽器自動化工具
- ✅ 在 EduCreate 中集成功能
- ✅ 創建自定義工作流程

---

**開始設置吧! 🚀**

檢查清單版本: 1.0  
最後更新: 2024-01-15

