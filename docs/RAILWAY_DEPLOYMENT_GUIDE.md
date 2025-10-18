# Railway 部署指南（Monorepo 方案）

## 📋 部署步驟

### 步驟 1：提交代碼到 EduCreate 倉庫

#### 1.1 檢查 screenshot-service 文件
```bash
# 在 EduCreate 根目錄執行
ls -la screenshot-service/

# 應該看到：
# index.js
# package.json
# README.md
# test.js
# .gitignore
```

#### 1.2 提交到 Git
```bash
# 在 EduCreate 根目錄執行
git add screenshot-service/
git commit -m "feat: 添加 Railway 截圖服務"
git push origin master
```

**驗證提交**：
- 訪問 https://github.com/nteverysome/EduCreate
- 確認 `screenshot-service/` 目錄已出現

---

### 步驟 2：在 Railway 創建項目

#### 2.1 註冊/登錄 Railway
1. 訪問 https://railway.app
2. 點擊 "Login" 或 "Start a New Project"
3. 使用 GitHub 帳號登錄（推薦）
4. 授權 Railway 訪問 GitHub

#### 2.2 創建新項目
1. 點擊 "New Project"
2. 選擇 "Deploy from GitHub repo"
3. 如果是第一次使用，需要：
   - 點擊 "Configure GitHub App"
   - 選擇要授權的倉庫（**EduCreate**）
   - 點擊 "Install & Authorize"
4. 返回 Railway，選擇 **EduCreate** 倉庫
5. Railway 會檢測到多個 package.json，需要配置

#### 2.3 配置 Root Directory（重要！）⭐
1. Railway 會提示選擇服務
2. 點擊 "Add variables" 或 "Settings"
3. 找到 "Service Settings" 部分
4. 設置以下配置：
   - **Root Directory**: `screenshot-service`
   - **Start Command**: `npm start`
   - **Build Command**: `npm install`（可選，通常自動檢測）
5. 點擊 "Save"
6. Railway 開始部署

#### 2.4 等待部署完成
- Railway 會：
  - 進入 `screenshot-service/` 目錄
  - 檢測 `package.json`
  - 安裝依賴（`npm install`）
  - 運行 `npm start`
- 部署時間：約 2-5 分鐘
- 狀態顯示：
  - 🟡 Building...
  - 🟢 Deployed

---

### 步驟 3：配置服務

#### 3.1 生成公開 URL
1. 在 Railway 項目頁面，點擊服務（screenshot-service）
2. 進入 "Settings" 標籤
3. 找到 "Networking" 部分
4. 點擊 "Generate Domain"
5. Railway 會生成一個 URL，例如：
   ```
   https://screenshot-service-production-xxxx.up.railway.app
   ```
6. **記錄此 URL**，稍後需要配置到 EduCreate

#### 3.2 驗證服務運行
```bash
# 測試健康檢查（替換為您的 Railway URL）
curl https://your-service.railway.app/health
```

**預期響應**：
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T10:00:00.000Z",
  "service": "screenshot-service",
  "version": "1.0.0"
}
```

#### 3.3 測試截圖功能
```bash
# 測試截圖（替換為您的 Railway URL）
curl -X POST https://your-service.railway.app/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://edu-create.vercel.app"}' \
  --output test-screenshot.png
```

**預期結果**：
- 生成 `test-screenshot.png` 文件
- 文件大小：約 20-30 KB
- 可以打開查看截圖

---

### 步驟 4：配置 EduCreate

#### 4.1 添加環境變數到 Vercel
1. 訪問 https://vercel.com/dashboard
2. 選擇 EduCreate 項目
3. 進入 "Settings" → "Environment Variables"
4. 添加以下變數：

**RAILWAY_SCREENSHOT_SERVICE_URL**：
```
https://your-service.railway.app
```

**BLOB_READ_WRITE_TOKEN**（如果還沒有）：
```
vercel_blob_rw_xxxxx
```

5. 點擊 "Save"
6. 重新部署 EduCreate（Vercel 會自動觸發）

#### 4.2 獲取 Vercel Blob Token（如果還沒有）
1. 在 Vercel Dashboard，選擇 EduCreate 項目
2. 進入 "Storage" 標籤
3. 點擊 "Create Database"
4. 選擇 "Blob"
5. 輸入名稱：`educreate-screenshots`
6. 點擊 "Create"
7. 複製 "Read/Write Token"
8. 添加到環境變數（見上面步驟 4.1）

---

## 📊 部署驗證清單

### Railway 服務
- [ ] screenshot-service 代碼已提交到 EduCreate 倉庫
- [ ] 代碼已推送到 GitHub
- [ ] Railway 項目已創建
- [ ] Root Directory 已設置為 `screenshot-service`
- [ ] 服務部署成功（狀態：🟢 Deployed）
- [ ] 公開 URL 已生成
- [ ] 健康檢查通過
- [ ] 截圖功能測試通過

### EduCreate 配置
- [ ] RAILWAY_SCREENSHOT_SERVICE_URL 已添加
- [ ] BLOB_READ_WRITE_TOKEN 已添加
- [ ] Vercel Blob Storage 已創建
- [ ] EduCreate 重新部署完成

---

## 🎯 下一步

完成 Railway 部署後，繼續：
1. **添加 thumbnailUrl 欄位到資料庫**
2. **創建截圖生成 API**
3. **修改活動卡片組件**
4. **測試完整流程**

---

## 🐛 常見問題

### 問題 1：Railway 部署失敗
**症狀**：部署狀態顯示 ❌ Failed

**解決方案**：
1. 檢查 Railway 日誌（Deployments → 點擊失敗的部署 → View Logs）
2. 常見原因：
   - `package.json` 格式錯誤
   - Node.js 版本不兼容
   - 依賴安裝失敗

**修復**：
```bash
# 確保 package.json 正確
cat screenshot-service/package.json

# 確保 Node.js 版本 >= 18
node --version

# 本地測試安裝
cd screenshot-service
npm install
```

### 問題 2：健康檢查失敗
**症狀**：`curl https://your-service.railway.app/health` 返回錯誤

**解決方案**：
1. 檢查 Railway 服務狀態（應該是 🟢 Deployed）
2. 檢查 Railway 日誌（Deployments → View Logs）
3. 確認 URL 正確（不要忘記 https://）

### 問題 3：截圖功能失敗
**症狀**：`POST /screenshot` 返回 500 錯誤

**解決方案**：
1. 檢查 Railway 日誌
2. 常見原因：
   - Puppeteer 啟動失敗（記憶體不足）
   - 目標 URL 無法訪問
   - 超時

**修復**：
- 升級 Railway 方案（增加記憶體）
- 增加 `waitTime` 參數
- 檢查目標 URL 是否可訪問

### 問題 4：Railway 收費問題
**症狀**：擔心意外收費

**說明**：
- Railway 提供 $5 免費額度/月
- 超過後按使用量計費
- 基本服務約 $5/月
- 可以設置使用限制

**設置限制**：
1. Railway Dashboard → Project Settings
2. 找到 "Usage Limits"
3. 設置最大預算（例如 $10/月）

---

## 💰 成本估算

### Railway 成本
- **免費額度**：$5/月
- **基本服務**：約 $5/月
- **總成本**：約 $5/月（扣除免費額度後 $0-5/月）

### Vercel Blob 成本
- **免費額度**：1 GB
- **當前需求**：300 MB（1 萬張圖片）
- **總成本**：$0/月

### 總計
- **Railway + Vercel Blob**：約 $5/月

---

## 📝 部署後檢查

### 1. Railway 服務檢查
```bash
# 健康檢查
curl https://your-service.railway.app/health

# 截圖測試
curl -X POST https://your-service.railway.app/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://edu-create.vercel.app"}' \
  --output test.png
```

### 2. Vercel 環境變數檢查
```bash
# 在 EduCreate 項目中檢查
vercel env ls
```

### 3. 完整流程測試
- 創建新活動
- 檢查是否自動生成截圖
- 檢查活動卡片是否顯示截圖
- 檢查 Vercel Blob Storage 是否有新文件

---

## 🎉 部署完成！

完成所有步驟後，您的 Railway 截圖服務已經成功部署並運行！

**下一步**：
1. 記錄 Railway 服務 URL
2. 配置 EduCreate 環境變數
3. 繼續實施後續任務

**需要幫助？**
- Railway 文檔：https://docs.railway.app
- Vercel Blob 文檔：https://vercel.com/docs/storage/vercel-blob
- EduCreate 技術支援：GitHub Issues

