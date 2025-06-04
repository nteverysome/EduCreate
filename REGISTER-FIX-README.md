# EduCreate 註冊頁面錯誤修復指南

## 問題概述

在EduCreate項目的註冊頁面中，發現了以下錯誤：

1. **圖標404錯誤**：`http://localhost:3000/icons/icon-144x144.png` 無法找到
2. **API認證401錯誤**：`http://localhost:3000/api/search` 和 `/api/search/advanced` 返回401未授權
3. **測試令牌API 500錯誤**：`http://localhost:3000/api/auth/test-token` 可能返回500內部服務器錯誤

## 錯誤原因分析

### 1. 圖標404錯誤

- **原因**：PWA (漸進式Web應用) 需要各種尺寸的圖標文件，但這些文件可能不存在或路徑不正確。
- **影響**：瀏覽器無法加載圖標，導致控制台顯示404錯誤，可能影響PWA功能。

### 2. API認證401錯誤

- **原因**：API端點需要認證，但在開發環境中可能缺少測試認證中間件或測試令牌。
- **影響**：無法訪問需要認證的API端點，導致相關功能無法正常工作。

### 3. 測試令牌API 500錯誤

- **原因**：測試令牌API可能無法找到測試用戶，或數據庫連接存在問題。
- **影響**：無法獲取測試令牌，導致開發環境中的API認證失敗。

## 修復方案

我們提供了兩個修復腳本，您可以選擇使用批處理文件（Windows CMD）或PowerShell腳本：

### 使用批處理文件修復

1. 在項目根目錄下找到 `fix-register-errors.bat` 文件
2. 雙擊運行該文件，或在命令提示符中執行：
   ```
   cd 項目路徑
   fix-register-errors.bat
   ```

### 使用PowerShell腳本修復

1. 在項目根目錄下找到 `fix-register-errors.ps1` 文件
2. 右鍵點擊該文件，選擇「使用PowerShell運行」，或在PowerShell中執行：
   ```powershell
   cd 項目路徑
   .\fix-register-errors.ps1
   ```

## 修復步驟說明

這些腳本將執行以下修復步驟：

### 步驟 1: 修復圖標404錯誤

- 確保 `public/icons` 目錄存在
- 重新生成所有尺寸的圖標文件 (72x72 到 512x512)
- 使用SVG格式創建簡單的佔位圖標

### 步驟 2: 修復數據庫連接和測試用戶

- 檢查數據庫連接
- 運行Prisma遷移和種子
- 如果種子失敗，嘗試手動創建測試用戶

### 步驟 3: 修復API認證401錯誤

- 創建或檢查 `withTestAuth` 中間件
- 修復 `_app.tsx` 中的測試令牌獲取邏輯

### 步驟 4: 清理緩存和重啟服務器

- 清理 `.next` 和 `node_modules/.cache` 目錄
- 終止佔用3000端口的進程
- 啟動開發服務器

## 手動修復指南

如果自動修復腳本無法解決問題，您可以嘗試以下手動步驟：

### 手動修復圖標404錯誤

1. 確保 `public/icons` 目錄存在
2. 創建所需的圖標文件，或從其他項目複製
3. 檢查 `public/manifest.json` 文件中的圖標路徑是否正確

### 手動修復API認證401錯誤

1. 創建 `middleware/withTestAuth.ts` 文件，實現測試認證中間件
2. 在 `_app.tsx` 中添加獲取測試令牌的邏輯
3. 確保API端點使用了 `withTestAuth` 中間件

### 手動修復測試令牌API 500錯誤

1. 運行 `npx prisma db seed` 創建測試用戶
2. 檢查 `.env` 文件中的數據庫連接字符串是否正確
3. 確保PostgreSQL服務正在運行

## 常見問題解答

### Q: 修復後仍然看到圖標404錯誤？

**A**: 嘗試清除瀏覽器緩存，或在開發者工具中禁用緩存並重新加載頁面。

### Q: API仍然返回401未授權錯誤？

**A**: 檢查localStorage中是否存在 `eduCreateTestToken`，如果不存在，可能需要手動訪問 `/api/auth/test-token` 端點獲取令牌。

### Q: 端口3000被佔用無法啟動服務器？

**A**: 手動終止佔用端口的進程：
- Windows: 在命令提示符中運行 `netstat -ano | findstr :3000` 找到PID，然後 `taskkill /F /PID <PID>`
- PowerShell: 運行 `Get-NetTCPConnection -LocalPort 3000 | Where-Object State -eq Listen` 找到進程，然後 `Stop-Process -Id <ID> -Force`

## 聯繫支持

如果您在修復過程中遇到任何問題，或者修復後仍然存在錯誤，請聯繫項目維護者或在GitHub上提交issue。

---

*最後更新: 2023年11月*