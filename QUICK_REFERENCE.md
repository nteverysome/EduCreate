# 🚀 Google Service Account 快速參考卡片

## 📍 當前位置
- 🌐 瀏覽器: Google Cloud Console 已打開
- 📂 工作目錄: `C:\Users\Administrator\Desktop\EduCreate`
- 🎯 目標: 設置 Google Service Account 金鑰

---

## ⚡ 10 分鐘快速設置

### 🔵 第 1-2 分鐘: 創建項目和啟用 API

```
1. 點擊項目選擇器 → 新建項目
   名稱: EduCreate Google Drive
   
2. 進入 API 和服務 → 庫
   搜索: Google Drive API
   點擊: 啟用
```

**預期:** 看到 "已啟用" 消息

---

### 🔵 第 3-5 分鐘: 創建 Service Account

```
1. 進入 API 和服務 → 憑據
   點擊: + 創建憑據 → 服務帳戶
   
2. 填寫信息:
   名稱: google-drive-mcp
   描述: MCP Server for Google Drive
   
3. 點擊: 創建並繼續
   角色: Editor
   點擊: 繼續 → 完成
```

**預期:** 返回到憑據頁面

---

### 🔵 第 6-8 分鐘: 下載 JSON 金鑰

```
1. 在服務帳戶列表中找到 google-drive-mcp
   點擊: 電子郵件地址
   
2. 進入 密鑰 標籤
   點擊: 添加密鑰 → 創建新密鑰
   
3. 選擇: JSON 格式
   點擊: 創建
   
4. 金鑰文件自動下載
```

**預期:** 下載文件到 `C:\Users\Administrator\Downloads\`

---

### 🔵 第 9-10 分鐘: 本地配置

```
1. 創建目錄:
   C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\credentials\
   
2. 複製下載的 JSON 文件到該目錄
   重命名為: service-account-key.json
   
3. 創建 .env 文件:
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
   NODE_ENV=production
```

**預期:** 文件結構完成

---

## 📋 關鍵文件位置

| 文件 | 位置 |
|------|------|
| 金鑰文件 | `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\credentials\service-account-key.json` |
| .env 文件 | `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\.env` |
| 源代碼 | `C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp\src\` |
| 配置文件 | `C:\Users\Administrator\Desktop\EduCreate\claude_desktop_config.json` |

---

## 🔧 命令速查表

### 安裝和構建

```bash
# 進入項目目錄
cd C:\Users\Administrator\Desktop\EduCreate\google-drive-mcp

# 安裝依賴
npm install

# 構建項目
npm run build

# 開發模式（監視文件變化）
npm run dev
```

### 驗證設置

```bash
# 檢查金鑰文件
dir credentials\

# 檢查 .env 文件
type .env

# 檢查 Node.js 版本
node -v

# 檢查 npm 版本
npm -v
```

---

## 🎯 Google Cloud Console 導航

### 快速鏈接

| 頁面 | 路徑 |
|------|------|
| 項目選擇器 | 頁面左上角 |
| API 庫 | API 和服務 → 庫 |
| 憑據 | API 和服務 → 憑據 |
| 服務帳戶 | 憑據 → 服務帳戶 |
| 密鑰管理 | 服務帳戶 → 密鑰 |

---

## ✅ 驗證清單

### 瀏覽器操作完成後

- [ ] Google Cloud 項目已創建
- [ ] Google Drive API 已啟用
- [ ] Service Account 已創建
- [ ] JSON 金鑰已下載

### 本地操作完成後

- [ ] 金鑰文件已保存到正確位置
- [ ] .env 文件已創建
- [ ] 依賴已安裝
- [ ] 項目已構建

### 最終驗證

- [ ] Claude Desktop 已重啟
- [ ] MCP 服務器已連接
- [ ] 測試工具已成功運行

---

## 🆘 快速故障排除

### 問題: 找不到項目選擇器
**解決:** 在頁面左上角，Google Cloud 標誌旁邊

### 問題: API 啟用失敗
**解決:** 確保在 "庫" 頁面，不是 "API" 頁面

### 問題: 金鑰文件下載失敗
**解決:** 檢查瀏覽器下載設置，可能被阻止

### 問題: npm install 失敗
**解決:** 確保 Node.js 已安裝，運行 `node -v`

### 問題: 構建失敗
**解決:** 檢查 TypeScript 錯誤，查看完整輸出

### 問題: MCP 服務器未連接
**解決:** 重啟 Claude Desktop，檢查配置文件

---

## 📞 需要幫助?

### 詳細文檔

- 📖 [BROWSER_SETUP_GUIDE.md](./BROWSER_SETUP_GUIDE.md) - 詳細步驟
- 📋 [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - 完整清單
- 🔧 [google-drive-mcp/SETUP_GUIDE.md](./google-drive-mcp/SETUP_GUIDE.md) - 故障排除

### 外部資源

- 🌐 [Google Cloud 文檔](https://cloud.google.com/docs)
- 🔐 [Service Account 文檔](https://cloud.google.com/iam/docs/service-accounts)
- 📚 [Google Drive API 文檔](https://developers.google.com/drive/api)

---

## 🎓 下一步

### 設置完成後

1. **測試 Google Drive**
   ```
   在 Claude 中: 使用 gdrive_list_files 工具列出我的 Google Drive 文件
   ```

2. **測試瀏覽器**
   ```
   在 Claude 中: 使用 browser_launch 啟動瀏覽器
   ```

3. **集成到 EduCreate**
   - 查看 [INTEGRATION_GUIDE.md](./google-drive-mcp/INTEGRATION_GUIDE.md)

4. **創建自定義工作流程**
   - 查看 [examples/basic-usage.md](./google-drive-mcp/examples/basic-usage.md)

---

## 💡 提示

- 💾 **保存金鑰文件:** 不要分享或上傳到公開倉庫
- 🔐 **定期輪換:** 每 90 天創建新金鑰
- 📝 **記錄 Service Account 郵箱:** 在 Google Drive 中共享文件時需要
- 🔄 **重啟 Claude:** 配置更改後必須重啟

---

## 📊 設置時間估計

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

- ✅ 列表、上傳、下載 Google Drive 文件
- ✅ 使用瀏覽器進行自動化操作
- ✅ 獲得詳細的錯誤報告
- ✅ 在 EduCreate 中集成功能

---

**祝您設置順利! 🚀**

快速參考版本: 1.0  
最後更新: 2024-01-15

