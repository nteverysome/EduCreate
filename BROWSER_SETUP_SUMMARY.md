# 🌐 瀏覽器設置 Google Service Account 金鑰 - 完整總結

## 📍 當前狀態

✅ **Google Cloud Console 已在瀏覽器中打開**

```
URL: https://console.cloud.google.com
狀態: 準備就緒
下一步: 按照以下步驟操作
```

---

## 🎯 設置目標

創建 Google Service Account 金鑰，用於 EduCreate 項目中的 Google Drive MCP 服務器。

---

## 📚 可用資源

### 📖 詳細指南
1. **[BROWSER_SETUP_GUIDE.md](./BROWSER_SETUP_GUIDE.md)** ⭐ 推薦
   - 詳細的分步指南
   - 每個步驟都有截圖說明
   - 包含預期結果

2. **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)**
   - 完整的檢查清單
   - 進度追蹤
   - 常見問題解決

3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
   - 快速參考卡片
   - 命令速查表
   - 關鍵文件位置

4. **[google-drive-mcp/SETUP_GUIDE.md](./google-drive-mcp/SETUP_GUIDE.md)**
   - 完整的技術文檔
   - 故障排除指南
   - 安全最佳實踐

---

## 🚀 快速開始 (10 分鐘)

### 第 1 步: 創建 Google Cloud 項目 (1 分鐘)

在瀏覽器中:

1. 點擊頁面左上角的 **項目選擇器**
2. 點擊 **新建項目**
3. 輸入名稱: `EduCreate Google Drive`
4. 點擊 **創建**
5. 等待項目創建完成

---

### 第 2 步: 啟用 Google Drive API (1 分鐘)

在瀏覽器中:

1. 進入 **API 和服務** → **庫**
2. 搜索: `Google Drive API`
3. 點擊搜索結果
4. 點擊 **啟用** 按鈕
5. 等待啟用完成

---

### 第 3 步: 創建 Service Account (2 分鐘)

在瀏覽器中:

1. 進入 **API 和服務** → **憑據**
2. 點擊 **+ 創建憑據** → **服務帳戶**
3. 填寫:
   - 名稱: `google-drive-mcp`
   - 描述: `MCP Server for Google Drive`
4. 點擊 **創建並繼續**
5. 選擇角色: **Editor**
6. 點擊 **繼續** → **完成**

---

### 第 4 步: 下載 JSON 金鑰 (1 分鐘)

在瀏覽器中:

1. 在服務帳戶列表中找到 `google-drive-mcp`
2. 點擊其 **電子郵件地址**
3. 進入 **密鑰** 標籤
4. 點擊 **添加密鑰** → **創建新密鑰**
5. 選擇 **JSON** 格式
6. 點擊 **創建**
7. 金鑰文件自動下載

**下載位置:** `C:\Users\Administrator\Downloads\project-id-xxxxx.json`

---

### 第 5 步: 本地配置 (2 分鐘)

在您的電腦上:

1. **創建目錄:**
   ```
   C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\credentials\
   ```

2. **複製金鑰文件:**
   - 從下載文件夾複製 JSON 文件
   - 粘貼到 `credentials` 文件夾
   - 重命名為: `service-account-key.json`

3. **創建 .env 文件:**
   - 打開文本編輯器
   - 輸入以下內容:
     ```
     GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
     NODE_ENV=production
     BROWSER_HEADLESS=true
     LOG_LEVEL=info
     ```
   - 保存為: `.env`
   - 位置: `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\.env`

---

### 第 6 步: 安裝和構建 (3 分鐘)

打開命令提示符，運行:

```bash
cd C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp
npm install
npm run build
```

---

### 第 7 步: 重啟 Claude Desktop

1. 完全關閉 Claude Desktop
2. 等待 30 秒
3. 重新打開 Claude Desktop
4. 等待 MCP 服務器連接

---

### 第 8 步: 測試連接

在 Claude 中輸入:

```
使用 gdrive_list_files 工具列出我的 Google Drive 文件
```

**預期結果:**
- ✅ 成功: 返回文件列表
- ❌ 失敗: 返回詳細的錯誤報告

---

## 📊 文件結構

設置完成後，您的文件結構應該如下:

```
C:\Users\Administrator\Desktop\EduCreate\
├── google-drive-mcp/
│   ├── src/                          # 源代碼
│   ├── dist/                         # 編譯後的代碼
│   ├── credentials/
│   │   └── service-account-key.json  # ⭐ 金鑰文件
│   ├── .env                          # ⭐ 環境配置
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── BROWSER_SETUP_GUIDE.md            # 詳細指南
├── SETUP_CHECKLIST.md                # 檢查清單
├── QUICK_REFERENCE.md                # 快速參考
└── claude_desktop_config.json        # MCP 配置
```

---

## ✅ 驗證清單

### 瀏覽器操作

- [ ] Google Cloud 項目已創建
- [ ] Google Drive API 已啟用
- [ ] Service Account 已創建
- [ ] JSON 金鑰已下載

### 本地操作

- [ ] 金鑰文件已保存到 `credentials/service-account-key.json`
- [ ] `.env` 文件已創建
- [ ] 依賴已安裝 (`npm install` 成功)
- [ ] 項目已構建 (`npm run build` 成功)

### 最終驗證

- [ ] Claude Desktop 已重啟
- [ ] MCP 服務器已連接
- [ ] `gdrive_list_files` 工具已測試

---

## 🆘 常見問題

### Q: 找不到項目選擇器?
**A:** 在頁面左上角，Google Cloud 標誌旁邊。如果看不到，點擊左上角的 ☰ (菜單)。

### Q: Google Drive API 找不到?
**A:** 確保在 "庫" 頁面搜索，不是在 "API" 頁面。

### Q: 金鑰文件下載失敗?
**A:** 檢查瀏覽器的下載設置，可能被阻止了。查看下載文件夾或檢查瀏覽器通知。

### Q: npm install 失敗?
**A:** 確保 Node.js 已安裝。運行 `node -v` 檢查版本。

### Q: 構建失敗?
**A:** 檢查 TypeScript 錯誤。查看 `npm run build` 的完整輸出。

### Q: MCP 服務器未連接?
**A:** 重啟 Claude Desktop。檢查 `claude_desktop_config.json` 的語法和文件路徑。

---

## 📞 需要幫助?

### 詳細文檔

1. **[BROWSER_SETUP_GUIDE.md](./BROWSER_SETUP_GUIDE.md)** - 詳細的分步指南
2. **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - 完整的檢查清單
3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 快速參考卡片
4. **[google-drive-mcp/SETUP_GUIDE.md](./google-drive-mcp/SETUP_GUIDE.md)** - 故障排除

### 外部資源

- 🌐 [Google Cloud Console](https://console.cloud.google.com)
- 📚 [Google Cloud 文檔](https://cloud.google.com/docs)
- 🔐 [Service Account 文檔](https://cloud.google.com/iam/docs/service-accounts)
- 📖 [Google Drive API 文檔](https://developers.google.com/drive/api)

---

## 🎓 下一步

### 設置完成後

1. **測試 Google Drive 功能**
   ```
   在 Claude 中: 使用 gdrive_list_files 工具列出我的 Google Drive 文件
   ```

2. **測試瀏覽器功能**
   ```
   在 Claude 中: 使用 browser_launch 啟動瀏覽器
   ```

3. **在 EduCreate 中集成**
   - 查看 [google-drive-mcp/INTEGRATION_GUIDE.md](./google-drive-mcp/INTEGRATION_GUIDE.md)

4. **創建自定義工作流程**
   - 查看 [google-drive-mcp/examples/basic-usage.md](./google-drive-mcp/examples/basic-usage.md)

---

## 💡 重要提示

- 🔐 **保護金鑰文件:** 不要分享或上傳到公開倉庫
- 📝 **記錄 Service Account 郵箱:** 在 Google Drive 中共享文件時需要
- 🔄 **重啟 Claude:** 配置更改後必須重啟
- 🔑 **定期輪換:** 每 90 天創建新金鑰

---

## 📊 設置時間

| 步驟 | 時間 |
|------|------|
| 創建項目 | 1 分鐘 |
| 啟用 API | 1 分鐘 |
| 創建 Service Account | 2 分鐘 |
| 下載金鑰 | 1 分鐘 |
| 本地配置 | 2 分鐘 |
| 安裝和構建 | 3 分鐘 |
| **總計** | **~10 分鐘** |

---

## ✨ 完成後

設置完成後，您將能夠:

- ✅ 使用 Google Drive 工具 (列表、上傳、下載、刪除、創建文件夾)
- ✅ 使用瀏覽器工具 (啟動、導航、點擊、輸入、截圖、快照、關閉)
- ✅ 獲得詳細的錯誤報告 (類似 Playwright)
- ✅ 在 EduCreate 中集成功能
- ✅ 創建自定義工作流程

---

## 🎉 開始設置吧!

**推薦:** 先閱讀 [BROWSER_SETUP_GUIDE.md](./BROWSER_SETUP_GUIDE.md)，然後按照步驟操作。

---

設置總結版本: 1.0  
最後更新: 2024-01-15  
狀態: 準備就緒 ✅

