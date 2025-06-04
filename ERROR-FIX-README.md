# EduCreate 錯誤修復指南

## 問題概述

根據錯誤日誌和截圖，EduCreate 項目存在以下問題：

1. **圖標 404 錯誤**：`GET http://localhost:3000/icons/icon-144x144.png 404 (Not Found)`
2. **API 認證 401 錯誤**：`GET http://localhost:3000/api/search 401 (Unauthorized)`
3. **API 連接問題**：搜索和高級搜索 API 返回 401 未授權錯誤

## 錯誤原因分析

### 1. 圖標 404 錯誤

雖然圖標文件實際存在於 `public/icons` 目錄中，但由於以下原因可能導致無法正確加載：

- PWA 配置問題：`next.config.js` 可能沒有正確引用 `next-pwa` 配置
- 圖標文件格式問題：SVG 內容被保存為 PNG 文件，瀏覽器無法正確解析
- 緩存問題：舊的緩存可能導致瀏覽器無法獲取更新的圖標文件

### 2. API 認證 401 錯誤

認證錯誤主要由以下原因導致：

- 測試令牌未正確獲取：`_app.tsx` 中的測試令牌獲取邏輯可能失敗
- 測試令牌未正確使用：`networkMonitor.ts` 中的 API 請求可能沒有正確附加測試令牌
- 認證中間件問題：`withTestAuth.ts` 中的認證邏輯可能存在問題
- 數據庫問題：Prisma 遷移或種子可能未正確執行，導致測試用戶不存在

## 修復方案

我們提供了兩個綜合修復腳本，分別適用於不同的環境：

1. **批處理腳本**：`fix-all-errors.bat`（適用於 Windows 命令提示符）
2. **PowerShell 腳本**：`fix-all-errors.ps1`（適用於 Windows PowerShell）

這兩個腳本執行相同的修復步驟，只是語法不同。

### 修復步驟詳解

兩個腳本都執行以下修復步驟：

1. **修復圖標 404 錯誤**
   - 確保 `public/icons` 目錄存在
   - 重新生成所有尺寸的圖標文件（使用 SVG 格式）

2. **修復 PWA 配置**
   - 檢查並安裝 `next-pwa` 依賴
   - 修復 `next.config.js` 配置，確保正確引用 `next-pwa`

3. **修復 API 認證 401 錯誤**
   - 運行 `scripts/fix-auth-errors.js` 腳本，修復認證中間件和 API 認證邏輯

4. **運行 Prisma 遷移和種子**
   - 執行 Prisma 遷移，確保數據庫結構正確
   - 執行 Prisma 種子，創建測試用戶

5. **清理緩存和終止佔用端口的進程**
   - 終止佔用端口 3000, 3001, 3002 的進程
   - 清理 `.next` 目錄和 `node_modules/.cache` 目錄

6. **啟動開發服務器**
   - 運行 `npm run dev` 啟動開發服務器

## 使用方法

### 使用批處理腳本（Windows 命令提示符）

1. 打開 Windows 命令提示符（CMD）
2. 導航到項目根目錄：`cd C:\Users\Administrator\Desktop\EduCreate`
3. 運行修復腳本：`fix-all-errors.bat`
4. 等待腳本執行完成，開發服務器將自動啟動
5. 在瀏覽器中訪問 http://localhost:3000 或 http://127.0.0.1:3000

### 使用 PowerShell 腳本（Windows PowerShell）

1. 打開 Windows PowerShell
2. 導航到項目根目錄：`cd C:\Users\Administrator\Desktop\EduCreate`
3. 如果遇到執行策略限制，可以使用以下命令臨時允許腳本執行：
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
4. 運行修復腳本：`.\fix-all-errors.ps1`
5. 等待腳本執行完成，開發服務器將自動啟動
6. 在瀏覽器中訪問 http://localhost:3000 或 http://127.0.0.1:3000

## 手動修復指南

如果自動修復腳本無法解決問題，您可以嘗試以下手動修復步驟：

### 1. 手動修復圖標 404 錯誤

1. 確保 `public/icons` 目錄存在
2. 使用圖像編輯軟件創建所需尺寸的圖標文件
3. 確保 `public/manifest.json` 中的圖標路徑正確
4. 清除瀏覽器緩存

### 2. 手動修復 API 認證 401 錯誤

1. 檢查 `middleware/withTestAuth.ts` 文件，確保認證邏輯正確
2. 檢查 `pages/api/auth/test-token.ts` 文件，確保測試令牌生成邏輯正確
3. 檢查 `pages/_app.tsx` 文件，確保測試令牌獲取邏輯正確
4. 運行 Prisma 遷移和種子：
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. 清除瀏覽器 localStorage：
   ```javascript
   // 在瀏覽器控制台執行
   localStorage.clear()
   ```

## 常見問題解答

### Q: 修復腳本執行後仍然出現圖標 404 錯誤？

A: 嘗試以下步驟：
1. 清除瀏覽器緩存和 localStorage
2. 確保使用 Chrome 或 Edge 瀏覽器
3. 嘗試使用無痕模式訪問
4. 檢查 `public/icons` 目錄中的圖標文件是否為有效的圖像文件

### Q: 修復腳本執行後仍然出現 API 認證 401 錯誤？

A: 嘗試以下步驟：
1. 檢查瀏覽器控制台，查看是否有其他錯誤信息
2. 手動訪問 `/api/auth/test-token` 端點，查看是否能獲取測試令牌
3. 檢查 `.env` 文件，確保 `NEXTAUTH_SECRET` 和 `DATABASE_URL` 設置正確
4. 重啟開發服務器並清除瀏覽器緩存和 localStorage

### Q: 修復腳本無法終止佔用端口的進程？

A: 嘗試以下步驟：
1. 以管理員身份運行命令提示符或 PowerShell
2. 手動終止進程：
   ```bash
   # 查找佔用端口的進程
   netstat -ano | findstr :3000
   # 終止進程（替換 PID 為實際進程 ID）
   taskkill /F /PID PID
   ```
3. 重啟計算機

## 聯繫支持

如果您仍然遇到問題，請聯繫 EduCreate 技術支持團隊：

- 郵箱：support@educreate.example.com
- 問題追蹤：https://github.com/educreate/issues

---

*本文檔最後更新於 2023 年 5 月 26 日*