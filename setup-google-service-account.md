# 🔧 Google Service Account 設置指南

## 📋 **完整設置步驟**

### **步驟 1: 創建 Google Cloud 項目**

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊 "選擇項目" → "新增項目"
3. 輸入項目名稱（例如：`educreate-gdrive`）
4. 點擊 "建立"

### **步驟 2: 啟用 Google Drive API**

1. 在 Google Cloud Console 中，前往 "API 和服務" → "程式庫"
2. 搜索 "Google Drive API"
3. 點擊 "Google Drive API" → "啟用"

### **步驟 3: 創建 Service Account**

1. 前往 "API 和服務" → "憑證"
2. 點擊 "建立憑證" → "服務帳戶"
3. 填寫服務帳戶詳細資料：
   - **服務帳戶名稱**: `educreate-gdrive-service`
   - **服務帳戶 ID**: `educreate-gdrive-service`
   - **描述**: `EduCreate Google Drive 存取服務帳戶`
4. 點擊 "建立並繼續"
5. 在 "將此服務帳戶的存取權授予專案" 中，選擇角色：
   - 搜索並選擇 "基本" → "檢視者"
6. 點擊 "繼續" → "完成"

### **步驟 4: 下載 JSON 金鑰**

1. 在 "憑證" 頁面中，找到剛創建的服務帳戶
2. 點擊服務帳戶的電子郵件地址
3. 前往 "金鑰" 標籤
4. 點擊 "新增金鑰" → "建立新金鑰"
5. 選擇 "JSON" 格式
6. 點擊 "建立" - 金鑰文件會自動下載

### **步驟 5: 轉換 JSON 為 Base64**

#### **Windows PowerShell 方法：**
```powershell
# 將下載的 JSON 文件路徑替換為實際路徑
$jsonPath = "C:\Users\你的用戶名\Downloads\educreate-gdrive-service-xxxxxxxx.json"
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($jsonPath))
Write-Output $base64
```

#### **線上工具方法：**
1. 前往 [Base64 Encode](https://www.base64encode.org/)
2. 上傳 JSON 文件或複製內容
3. 點擊 "Encode" 獲取 Base64 字符串

### **步驟 6: 更新 .env 文件**

將獲得的 Base64 字符串複製到 `.env` 文件中：

```env
GOOGLEDRIVE_SERVICE_ACCOUNT_KEY="eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InlvdXItcHJvamVjdC1pZCIsInByaXZhdGVfa2V5X2lkIjoiLi4uIn0="
```

### **步驟 7: 設置 Google Drive 權限**

**重要：** Service Account 需要存取權限才能讀取 Google Drive 文件。

#### **方法 1: 共享特定文件夾**
1. 在 Google Drive 中創建一個文件夾（例如：`EduCreate Files`）
2. 右鍵點擊文件夾 → "共用"
3. 在 "新增使用者和群組" 中輸入服務帳戶的電子郵件地址
   - 格式：`educreate-gdrive-service@your-project-id.iam.gserviceaccount.com`
4. 設置權限為 "檢視者"
5. 點擊 "傳送"

#### **方法 2: 共享整個 Drive（不推薦）**
- 將服務帳戶電子郵件添加為整個 Google Drive 的檢視者

### **步驟 8: 獲取文件夾 ID**

1. 在 Google Drive 中打開共享的文件夾
2. 從 URL 中複製文件夾 ID：
   ```
   https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74mMjoeAiGU
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          這就是文件夾 ID
   ```

## ✅ **驗證設置**

完成設置後，運行測試腳本驗證配置：

```bash
python test-google-drive-mcp.py
```

## 🔒 **安全注意事項**

1. **保護 JSON 金鑰文件** - 不要將原始 JSON 文件提交到版本控制
2. **限制權限** - 只給予必要的最小權限
3. **定期輪換** - 定期更新服務帳戶金鑰
4. **監控使用** - 在 Google Cloud Console 中監控 API 使用情況

## 🆘 **常見問題**

### **問題 1: "403 Forbidden" 錯誤**
- **原因**: 服務帳戶沒有存取權限
- **解決**: 確保已將服務帳戶電子郵件添加到 Google Drive 文件夾的共享列表

### **問題 2: "400 Bad Request" 錯誤**
- **原因**: API 未啟用或金鑰格式錯誤
- **解決**: 檢查 Google Drive API 是否已啟用，確認 Base64 編碼正確

### **問題 3: "找不到文件" 錯誤**
- **原因**: 文件 ID 或文件夾 ID 錯誤
- **解決**: 確認從 Google Drive URL 中複製的 ID 正確

## 📞 **需要幫助？**

如果遇到問題，請提供以下信息：
- 錯誤訊息的完整內容
- Google Cloud 項目 ID
- 服務帳戶電子郵件地址
- 嘗試存取的文件夾 ID