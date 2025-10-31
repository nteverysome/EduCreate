# 🌐 使用瀏覽器設置 Google Service Account 金鑰

## 📍 當前狀態
- ✅ Google Cloud Console 已在瀏覽器中打開
- 📍 URL: https://console.cloud.google.com
- 🎯 目標: 創建 Service Account 並下載 JSON 金鑰

---

## 📋 設置步驟 (共 6 步)

### ✅ 步驟 1: 創建 Google Cloud 項目

**在瀏覽器中操作:**

1. 在 Google Cloud Console 頁面中，找到頂部的 **項目選擇器**
   - 通常在左上角，顯示當前項目名稱
   
2. 點擊 **項目選擇器** 按鈕

3. 在彈出的對話框中，點擊 **新建項目**

4. 填寫項目信息:
   ```
   項目名稱: EduCreate Google Drive
   組織: (可選，保持默認)
   位置: (可選，保持默認)
   ```

5. 點擊 **創建** 按鈕

6. 等待項目創建完成（通常需要 1-2 分鐘）

**預期結果:** 
- 頁面會自動切換到新項目
- 頂部會顯示 "EduCreate Google Drive" 項目名稱

---

### ✅ 步驟 2: 啟用 Google Drive API

**在瀏覽器中操作:**

1. 在左側菜單中，找到 **API 和服務**
   - 如果看不到，點擊左上角的 ☰ (菜單)

2. 點擊 **API 和服務** > **庫**

3. 在搜索框中輸入: `Google Drive API`

4. 點擊搜索結果中的 **Google Drive API**

5. 點擊藍色的 **啟用** 按鈕

6. 等待 API 啟用完成

**預期結果:**
- 按鈕會變成 "禁用"
- 頁面會顯示 "已啟用"

---

### ✅ 步驟 3: 創建 Service Account

**在瀏覽器中操作:**

1. 在左側菜單中，點擊 **API 和服務** > **憑據**

2. 在頁面頂部，點擊 **+ 創建憑據** 按鈕

3. 在下拉菜單中，選擇 **服務帳戶**

4. 填寫服務帳戶詳情:
   ```
   服務帳戶名稱: google-drive-mcp
   服務帳戶 ID: (自動生成，無需修改)
   描述: MCP Server for Google Drive
   ```

5. 點擊 **創建並繼續** 按鈕

6. 在 "授予此服務帳戶對項目的訪問權限" 部分:
   - 角色: 選擇 **Editor**
   - 點擊 **繼續**

7. 在 "授予用戶訪問此服務帳戶的權限" 部分:
   - 點擊 **完成**

**預期結果:**
- 返回到憑據頁面
- 在 "服務帳戶" 部分可以看到新創建的帳戶

---

### ✅ 步驟 4: 創建 JSON 金鑰

**在瀏覽器中操作:**

1. 在 "服務帳戶" 部分，找到剛創建的 **google-drive-mcp** 帳戶

2. 點擊該帳戶的 **電子郵件地址**
   - 格式類似: `google-drive-mcp@...iam.gserviceaccount.com`

3. 進入服務帳戶詳情頁面

4. 點擊頂部的 **密鑰** 標籤

5. 點擊 **添加密鑰** > **創建新密鑰**

6. 在彈出的對話框中:
   - 選擇 **JSON** 格式
   - 點擊 **創建**

7. JSON 金鑰文件會自動下載到您的 **下載** 文件夾
   - 文件名類似: `project-id-xxxxx.json`

**預期結果:**
- 瀏覽器下載了 JSON 文件
- 頁面顯示 "已創建密鑰"

---

### ✅ 步驟 5: 保存金鑰文件

**在您的電腦上操作:**

1. 打開 **文件管理器**

2. 導航到 **下載** 文件夾

3. 找到剛下載的 JSON 文件（名稱類似 `project-id-xxxxx.json`）

4. 創建目錄結構:
   ```
   C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\credentials\
   ```
   - 如果 `credentials` 文件夾不存在，請創建它

5. 將 JSON 文件複製到該目錄

6. 重命名為: `service-account-key.json`

**最終路徑:**
```
C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\credentials\service-account-key.json
```

---

### ✅ 步驟 6: 配置環境變數

**在您的電腦上操作:**

1. 打開文本編輯器（如 Notepad 或 VS Code）

2. 創建新文件，內容如下:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
   NODE_ENV=production
   BROWSER_HEADLESS=true
   LOG_LEVEL=info
   ```

3. 保存為: `.env`
   - 位置: `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\.env`

4. 確保文件名是 `.env`（不是 `.env.txt`）

---

## ✅ 驗證設置

### 檢查清單

- [ ] Google Cloud 項目已創建
- [ ] Google Drive API 已啟用
- [ ] Service Account 已創建
- [ ] JSON 金鑰已下載
- [ ] 金鑰文件已保存到正確位置
- [ ] `.env` 文件已創建

### 驗證文件

打開命令提示符，運行:

```bash
cd C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp
dir credentials\
```

應該看到:
```
service-account-key.json
```

---

## 🚀 下一步

完成上述步驟後:

1. **安裝依賴**
   ```bash
   cd google-drive-mcp
   npm install
   npm run build
   ```

2. **重啟 Claude Desktop**
   - 完全關閉
   - 重新打開

3. **測試連接**
   - 在 Claude 中使用 `gdrive_list_files` 工具

---

## 🆘 遇到問題?

### 常見問題

**Q: 找不到項目選擇器?**
- A: 在頁面左上角，通常在 Google Cloud 標誌旁邊

**Q: Google Drive API 找不到?**
- A: 確保在 "庫" 頁面搜索，不是在 "API" 頁面

**Q: 金鑰文件下載失敗?**
- A: 檢查瀏覽器的下載設置，可能被阻止了

**Q: 不知道 Service Account 郵箱?**
- A: 在服務帳戶詳情頁面的 "詳情" 標籤中可以看到

---

## 📞 需要幫助?

如果遇到任何問題:

1. 查看 [SETUP_GUIDE.md](./google-drive-mcp/SETUP_GUIDE.md) 的故障排除部分
2. 檢查 Google Cloud 文檔: https://cloud.google.com/docs
3. 查看 Service Account 文檔: https://cloud.google.com/iam/docs/service-accounts

---

## ✨ 完成後

設置完成後，您將能夠:

- ✅ 使用 Google Drive 工具列表、上傳、下載文件
- ✅ 使用瀏覽器工具進行自動化操作
- ✅ 獲得詳細的錯誤報告（類似 Playwright）
- ✅ 在 EduCreate 中集成 Google Drive 功能

---

**祝您設置順利! 🎉**

設置指南版本: 1.0  
最後更新: 2024-01-15

